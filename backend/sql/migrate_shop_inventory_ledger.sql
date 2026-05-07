-- ============================================================================
-- Shop-level stock in / stock out ledger
-- Run with:
--   psql -U <user> -d <db_name> -f backend/sql/migrate_shop_inventory_ledger.sql
-- ============================================================================

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'enum_shop_inventory_ledger_type'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.enum_shop_inventory_ledger_type AS ENUM ('import', 'export');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.shop_inventory_ledger (
  id BIGSERIAL PRIMARY KEY,
  store_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  serial_id BIGINT NOT NULL,
  inventory_id BIGINT NOT NULL,
  type public.enum_shop_inventory_ledger_type NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_cost DECIMAL(12,2),
  note TEXT,
  reference_type VARCHAR(50),
  reference_id BIGINT,
  created_by BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_shop_inventory_ledger_store
    FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE,
  CONSTRAINT fk_shop_inventory_ledger_product
    FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT,
  CONSTRAINT fk_shop_inventory_ledger_serial
    FOREIGN KEY (serial_id) REFERENCES public.product_serials(id) ON DELETE RESTRICT,
  CONSTRAINT fk_shop_inventory_ledger_inventory
    FOREIGN KEY (inventory_id) REFERENCES public.product_inventory(id) ON DELETE CASCADE,
  CONSTRAINT fk_shop_inventory_ledger_created_by
    FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL,
  CONSTRAINT ck_shop_inventory_ledger_import_cost
    CHECK ((type <> 'import') OR unit_cost IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_shop_inventory_ledger_store_created_at
  ON public.shop_inventory_ledger(store_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_shop_inventory_ledger_inventory_created_at
  ON public.shop_inventory_ledger(inventory_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_shop_inventory_ledger_product_serial
  ON public.shop_inventory_ledger(product_id, serial_id);

CREATE INDEX IF NOT EXISTS idx_shop_inventory_ledger_type
  ON public.shop_inventory_ledger(type);

CREATE INDEX IF NOT EXISTS idx_shop_inventory_ledger_reference
  ON public.shop_inventory_ledger(reference_type, reference_id)
  WHERE reference_type IS NOT NULL;

-- Validate cross-table consistency:
-- - product_id phải thuộc store_id
-- - serial_id phải thuộc product_id
-- - inventory_id phải khớp (product_id, serial_id)
CREATE OR REPLACE FUNCTION public.validate_shop_inventory_ledger()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_product_store_id BIGINT;
  v_serial_product_id BIGINT;
  v_inventory_product_id BIGINT;
  v_inventory_serial_id BIGINT;
BEGIN
  SELECT p.store_id
    INTO v_product_store_id
  FROM public.products p
  WHERE p.id = NEW.product_id;

  IF v_product_store_id IS NULL THEN
    RAISE EXCEPTION 'product_id % không tồn tại', NEW.product_id;
  END IF;

  IF v_product_store_id <> NEW.store_id THEN
    RAISE EXCEPTION 'product_id % không thuộc store_id %', NEW.product_id, NEW.store_id;
  END IF;

  SELECT s.product_id
    INTO v_serial_product_id
  FROM public.product_serials s
  WHERE s.id = NEW.serial_id;

  IF v_serial_product_id IS NULL THEN
    RAISE EXCEPTION 'serial_id % không tồn tại', NEW.serial_id;
  END IF;

  IF v_serial_product_id <> NEW.product_id THEN
    RAISE EXCEPTION 'serial_id % không thuộc product_id %', NEW.serial_id, NEW.product_id;
  END IF;

  SELECT i.product_id, i.serial_id
    INTO v_inventory_product_id, v_inventory_serial_id
  FROM public.product_inventory i
  WHERE i.id = NEW.inventory_id;

  IF v_inventory_product_id IS NULL THEN
    RAISE EXCEPTION 'inventory_id % không tồn tại', NEW.inventory_id;
  END IF;

  IF v_inventory_product_id <> NEW.product_id OR v_inventory_serial_id <> NEW.serial_id THEN
    RAISE EXCEPTION 'inventory_id % không khớp với (product_id %, serial_id %)',
      NEW.inventory_id, NEW.product_id, NEW.serial_id;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_shop_inventory_ledger ON public.shop_inventory_ledger;
CREATE TRIGGER trg_validate_shop_inventory_ledger
BEFORE INSERT OR UPDATE ON public.shop_inventory_ledger
FOR EACH ROW
EXECUTE FUNCTION public.validate_shop_inventory_ledger();

COMMIT;

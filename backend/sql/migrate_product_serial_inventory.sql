BEGIN;

CREATE TABLE IF NOT EXISTS public.product_serials (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  serial_code VARCHAR(64) NOT NULL,
  serial_specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_product_serials_product_code UNIQUE (product_id, serial_code)
);

CREATE INDEX IF NOT EXISTS idx_product_serials_specs_gin
ON public.product_serials USING GIN (serial_specs);

CREATE TABLE IF NOT EXISTS public.product_inventory (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  serial_id BIGINT NOT NULL REFERENCES public.product_serials(id) ON DELETE CASCADE,
  on_hand INT NOT NULL DEFAULT 0,
  reserved INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_product_inventory_product_serial UNIQUE (product_id, serial_id),
  CONSTRAINT ck_product_inventory_non_negative CHECK (on_hand >= 0 AND reserved >= 0)
);

-- Backfill: tạo serial mặc định cho các product chưa có serial
INSERT INTO public.product_serials (product_id, serial_code, serial_specs)
SELECT p.id, 'DEFAULT', '{}'::jsonb
FROM public.products p
LEFT JOIN public.product_serials ps ON ps.product_id = p.id
WHERE ps.id IS NULL;

-- Backfill: kho mặc định = quantity hiện tại
INSERT INTO public.product_inventory (product_id, serial_id, on_hand, reserved)
SELECT
  p.id,
  ps.id,
  GREATEST(COALESCE(p.quantity, 0), 0),
  0
FROM public.products p
JOIN public.product_serials ps
  ON ps.product_id = p.id
LEFT JOIN public.product_inventory pi
  ON pi.product_id = p.id AND pi.serial_id = ps.id
WHERE pi.id IS NULL;

COMMIT;

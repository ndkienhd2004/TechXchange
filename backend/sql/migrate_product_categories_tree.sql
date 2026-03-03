-- Chuyển product_categories sang dạng cây: parent_id, slug, level

ALTER TABLE public.product_categories
ADD COLUMN IF NOT EXISTS slug VARCHAR(120),
ADD COLUMN IF NOT EXISTS parent_id BIGINT NULL,
ADD COLUMN IF NOT EXISTS level INT4 NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'product_categories_parent_id_fkey'
  ) THEN
    ALTER TABLE public.product_categories
    ADD CONSTRAINT product_categories_parent_id_fkey
    FOREIGN KEY (parent_id) REFERENCES public.product_categories(id)
    ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Backfill slug từ name nếu đang null
UPDATE public.product_categories
SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE (slug IS NULL OR slug = '')
  AND name IS NOT NULL;

-- đảm bảo slug unique cho record cũ bị trùng
WITH ranked AS (
  SELECT id, slug, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY id) AS rn
  FROM public.product_categories
  WHERE slug IS NOT NULL AND slug <> ''
)
UPDATE public.product_categories c
SET slug = c.slug || '-' || ranked.rn
FROM ranked
WHERE c.id = ranked.id
  AND ranked.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS uq_product_categories_slug
ON public.product_categories(slug);

CREATE INDEX IF NOT EXISTS idx_product_categories_parent
ON public.product_categories(parent_id);

CREATE INDEX IF NOT EXISTS idx_product_categories_level
ON public.product_categories(level);

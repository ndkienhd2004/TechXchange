-- Tạo bảng lưu yêu cầu bổ sung specs cho catalog
CREATE TABLE IF NOT EXISTS public.catalog_spec_requests (
  id BIGSERIAL PRIMARY KEY,
  requester_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  admin_id BIGINT NULL REFERENCES public.users(id) ON UPDATE CASCADE,
  catalog_id BIGINT NOT NULL REFERENCES public.product_catalog(id) ON DELETE CASCADE ON UPDATE CASCADE,
  spec_key VARCHAR(100) NOT NULL,
  proposed_values JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  admin_note TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_csr_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE INDEX IF NOT EXISTS idx_csr_status ON public.catalog_spec_requests(status);
CREATE INDEX IF NOT EXISTS idx_csr_catalog ON public.catalog_spec_requests(catalog_id);
CREATE INDEX IF NOT EXISTS idx_csr_requester ON public.catalog_spec_requests(requester_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_csr_pending_requester_catalog_key
ON public.catalog_spec_requests(requester_id, catalog_id, spec_key, status);

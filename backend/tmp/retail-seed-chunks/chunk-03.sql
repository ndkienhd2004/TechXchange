BEGIN;

SET statement_timeout = 0;

INSERT INTO users (username, email, phone, role, password_hash, created_at, updated_at)
VALUES ('GearVN Importer', 'crawler-gearvn@techxchange.dev', '0901000001', 'shop', 'crawler-disabled', now(), now())
ON CONFLICT (email) DO UPDATE SET role = 'shop', updated_at = now();

INSERT INTO stores (owner_id, name, description, rating, created_at, updated_at)
SELECT id, 'GearVN', 'Imported public product catalog from GearVN.', 4.8, now(), now()
FROM users WHERE email = 'crawler-gearvn@techxchange.dev'
AND NOT EXISTS (SELECT 1 FROM stores WHERE name = 'GearVN');

INSERT INTO users (username, email, phone, role, password_hash, created_at, updated_at)
VALUES ('CellphoneS Importer', 'crawler-cellphones@techxchange.dev', '0901000002', 'shop', 'crawler-disabled', now(), now())
ON CONFLICT (email) DO UPDATE SET role = 'shop', updated_at = now();

INSERT INTO stores (owner_id, name, description, rating, created_at, updated_at)
SELECT id, 'CellphoneS', 'Imported public product catalog from CellphoneS.', 4.8, now(), now()
FROM users WHERE email = 'crawler-cellphones@techxchange.dev'
AND NOT EXISTS (SELECT 1 FROM stores WHERE name = 'CellphoneS');

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'GearVN' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('LG')
  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
  RETURNING id
),
category_row AS (
  INSERT INTO product_categories (name, slug, parent_id, level, is_active, created_at, updated_at)
  VALUES ('Màn hình', 'man-hinh', NULL, 1, true, now(), now())
  ON CONFLICT (name) DO UPDATE SET is_active = true, updated_at = now()
  RETURNING id
),
catalog_insert AS (
  INSERT INTO product_catalog (name, brand_id, category_id, description, specs, default_image, msrp, status, created_at, updated_at)
  SELECT 'Màn hình thông minh LG Swing 32U889SA-W 32', brand_row.id, category_row.id, 'Màn hình thông minh LG Swing 32U889SA-W 32 - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/man-hinh-thong-minh-lg-swing-32u889sa-w-32-ips-4k-usbc-webos","imported_at":"2026-05-12T04:49:10.923Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/man-hinh-thong-minh-lg-swing-32u889sa-w-32-ips-4k-usbc-webos-1_f91eb9bc714b4001a63b6d07d285849b_grande.jpg', 27990000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Màn hình thông minh LG Swing 32U889SA-W 32' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Màn hình thông minh LG Swing 32U889SA-W 32' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Màn hình thông minh LG Swing 32U889SA-W 32', 'Màn hình thông minh LG Swing 32U889SA-W 32 - imported from GearVN', 27990000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
  FROM store_row, brand_row, category_row, catalog_row
  WHERE NOT EXISTS (
    SELECT 1 FROM products pp WHERE pp.catalog_id = catalog_row.id AND pp.store_id = store_row.id
  )
  RETURNING id
),
product_row AS (
  SELECT id FROM product_insert
  UNION ALL
  SELECT pp.id FROM products pp, catalog_row, store_row WHERE pp.catalog_id = catalog_row.id AND pp.store_id = store_row.id
  LIMIT 1
),
image_insert AS (
  INSERT INTO product_images (product_id, url, sort_order, created_at)
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/man-hinh-thong-minh-lg-swing-32u889sa-w-32-ips-4k-usbc-webos-1_f91eb9bc714b4001a63b6d07d285849b_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/man-hinh-thong-minh-lg-swing-32u889sa-w-32-ips-4k-usbc-webos-1_f91eb9bc714b4001a63b6d07d285849b_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/man-hinh-thong-minh-lg-swing-32u889sa-w-32-ips-4k-usbc-webos-1_f91eb9bc714b4001a63b6d07d285849b_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-r9kkii', '{}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 10, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'GearVN' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('ASUS')
  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
  RETURNING id
),
category_row AS (
  INSERT INTO product_categories (name, slug, parent_id, level, is_active, created_at, updated_at)
  VALUES ('Laptop', 'laptop', NULL, 1, true, now(), now())
  ON CONFLICT (name) DO UPDATE SET is_active = true, updated_at = now()
  RETURNING id
),
catalog_insert AS (
  INSERT INTO product_catalog (name, brand_id, category_id, description, specs, default_image, msrp, status, created_at, updated_at)
  SELECT 'Laptop gaming ASUS TUF Gaming A14 FA401EA-RG034W', brand_row.id, category_row.id, 'Laptop gaming ASUS TUF Gaming A14 FA401EA-RG034W - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/laptop-gaming-asus-tuf-gaming-a14-fa401ea-rg034w","imported_at":"2026-05-12T04:49:10.923Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-asus-tuf-gaming-a14-fa401ea-rg034w-1_ea3d691d2e7043eda3cdd1bcf7abd43d_grande.jpg', 63590000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Laptop gaming ASUS TUF Gaming A14 FA401EA-RG034W' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Laptop gaming ASUS TUF Gaming A14 FA401EA-RG034W' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Laptop gaming ASUS TUF Gaming A14 FA401EA-RG034W', 'Laptop gaming ASUS TUF Gaming A14 FA401EA-RG034W - imported from GearVN', 63590000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
  FROM store_row, brand_row, category_row, catalog_row
  WHERE NOT EXISTS (
    SELECT 1 FROM products pp WHERE pp.catalog_id = catalog_row.id AND pp.store_id = store_row.id
  )
  RETURNING id
),
product_row AS (
  SELECT id FROM product_insert
  UNION ALL
  SELECT pp.id FROM products pp, catalog_row, store_row WHERE pp.catalog_id = catalog_row.id AND pp.store_id = store_row.id
  LIMIT 1
),
image_insert AS (
  INSERT INTO product_images (product_id, url, sort_order, created_at)
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-asus-tuf-gaming-a14-fa401ea-rg034w-1_ea3d691d2e7043eda3cdd1bcf7abd43d_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-asus-tuf-gaming-a14-fa401ea-rg034w-1_ea3d691d2e7043eda3cdd1bcf7abd43d_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-asus-tuf-gaming-a14-fa401ea-rg034w-1_ea3d691d2e7043eda3cdd1bcf7abd43d_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-whxjjw', '{}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 10, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'GearVN' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('ASUS')
  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
  RETURNING id
),
category_row AS (
  INSERT INTO product_categories (name, slug, parent_id, level, is_active, created_at, updated_at)
  VALUES ('Laptop', 'laptop', NULL, 1, true, now(), now())
  ON CONFLICT (name) DO UPDATE SET is_active = true, updated_at = now()
  RETURNING id
),
catalog_insert AS (
  INSERT INTO product_catalog (name, brand_id, category_id, description, specs, default_image, msrp, status, created_at, updated_at)
  SELECT 'Laptop gaming ASUS ROG Strix G16 G614PR-TS103W', brand_row.id, category_row.id, 'Laptop gaming ASUS ROG Strix G16 G614PR-TS103W - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/laptop-gaming-asus-rog-strix-g16-g614pr-ts103w","imported_at":"2026-05-12T04:49:10.923Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-asus-rog-strix-g16-g614pr-ts103w-1_8760e2492b294df2a64f9a1fb11627eb_grande.jpg', 70490000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Laptop gaming ASUS ROG Strix G16 G614PR-TS103W' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Laptop gaming ASUS ROG Strix G16 G614PR-TS103W' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Laptop gaming ASUS ROG Strix G16 G614PR-TS103W', 'Laptop gaming ASUS ROG Strix G16 G614PR-TS103W - imported from GearVN', 70490000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
  FROM store_row, brand_row, category_row, catalog_row
  WHERE NOT EXISTS (
    SELECT 1 FROM products pp WHERE pp.catalog_id = catalog_row.id AND pp.store_id = store_row.id
  )
  RETURNING id
),
product_row AS (
  SELECT id FROM product_insert
  UNION ALL
  SELECT pp.id FROM products pp, catalog_row, store_row WHERE pp.catalog_id = catalog_row.id AND pp.store_id = store_row.id
  LIMIT 1
),
image_insert AS (
  INSERT INTO product_images (product_id, url, sort_order, created_at)
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-asus-rog-strix-g16-g614pr-ts103w-1_8760e2492b294df2a64f9a1fb11627eb_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-asus-rog-strix-g16-g614pr-ts103w-1_8760e2492b294df2a64f9a1fb11627eb_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-asus-rog-strix-g16-g614pr-ts103w-1_8760e2492b294df2a64f9a1fb11627eb_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-207vb1', '{}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 10, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'GearVN' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('ASUS')
  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
  RETURNING id
),
category_row AS (
  INSERT INTO product_categories (name, slug, parent_id, level, is_active, created_at, updated_at)
  VALUES ('Laptop', 'laptop', NULL, 1, true, now(), now())
  ON CONFLICT (name) DO UPDATE SET is_active = true, updated_at = now()
  RETURNING id
),
catalog_insert AS (
  INSERT INTO product_catalog (name, brand_id, category_id, description, specs, default_image, msrp, status, created_at, updated_at)
  SELECT 'Laptop gaming ASUS ROG Strix G16 G614PW-TS051W', brand_row.id, category_row.id, 'Laptop gaming ASUS ROG Strix G16 G614PW-TS051W - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/laptop-gaming-asus-rog-strix-g16-g614pw-ts051w","imported_at":"2026-05-12T04:49:10.923Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-asus-rog-strix-g16-g614pw-ts051w-1_8c5900d8f42b4f5fbef703fd2c6e2dca_grande.jpg', 81990000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Laptop gaming ASUS ROG Strix G16 G614PW-TS051W' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Laptop gaming ASUS ROG Strix G16 G614PW-TS051W' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Laptop gaming ASUS ROG Strix G16 G614PW-TS051W', 'Laptop gaming ASUS ROG Strix G16 G614PW-TS051W - imported from GearVN', 81990000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
  FROM store_row, brand_row, category_row, catalog_row
  WHERE NOT EXISTS (
    SELECT 1 FROM products pp WHERE pp.catalog_id = catalog_row.id AND pp.store_id = store_row.id
  )
  RETURNING id
),
product_row AS (
  SELECT id FROM product_insert
  UNION ALL
  SELECT pp.id FROM products pp, catalog_row, store_row WHERE pp.catalog_id = catalog_row.id AND pp.store_id = store_row.id
  LIMIT 1
),
image_insert AS (
  INSERT INTO product_images (product_id, url, sort_order, created_at)
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-asus-rog-strix-g16-g614pw-ts051w-1_8c5900d8f42b4f5fbef703fd2c6e2dca_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-asus-rog-strix-g16-g614pw-ts051w-1_8c5900d8f42b4f5fbef703fd2c6e2dca_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-asus-rog-strix-g16-g614pw-ts051w-1_8c5900d8f42b4f5fbef703fd2c6e2dca_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-423lc0', '{}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 10, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'GearVN' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('ASUS')
  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
  RETURNING id
),
category_row AS (
  INSERT INTO product_categories (name, slug, parent_id, level, is_active, created_at, updated_at)
  VALUES ('Laptop', 'laptop', NULL, 1, true, now(), now())
  ON CONFLICT (name) DO UPDATE SET is_active = true, updated_at = now()
  RETURNING id
),
catalog_insert AS (
  INSERT INTO product_catalog (name, brand_id, category_id, description, specs, default_image, msrp, status, created_at, updated_at)
  SELECT 'Laptop gaming ASUS ROG Strix G16 G614PP-TS112W', brand_row.id, category_row.id, 'Laptop gaming ASUS ROG Strix G16 G614PP-TS112W - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/laptop-gaming-asus-rog-strix-g16-g614pp-ts112w","imported_at":"2026-05-12T04:49:10.923Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-asus-rog-strix-g16-g614pp-ts112w-1_5ebc43e2bfb14624acca57a248cf6c5e_grande.jpg', 61690000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Laptop gaming ASUS ROG Strix G16 G614PP-TS112W' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Laptop gaming ASUS ROG Strix G16 G614PP-TS112W' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Laptop gaming ASUS ROG Strix G16 G614PP-TS112W', 'Laptop gaming ASUS ROG Strix G16 G614PP-TS112W - imported from GearVN', 61690000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
  FROM store_row, brand_row, category_row, catalog_row
  WHERE NOT EXISTS (
    SELECT 1 FROM products pp WHERE pp.catalog_id = catalog_row.id AND pp.store_id = store_row.id
  )
  RETURNING id
),
product_row AS (
  SELECT id FROM product_insert
  UNION ALL
  SELECT pp.id FROM products pp, catalog_row, store_row WHERE pp.catalog_id = catalog_row.id AND pp.store_id = store_row.id
  LIMIT 1
),
image_insert AS (
  INSERT INTO product_images (product_id, url, sort_order, created_at)
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-asus-rog-strix-g16-g614pp-ts112w-1_5ebc43e2bfb14624acca57a248cf6c5e_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-asus-rog-strix-g16-g614pp-ts112w-1_5ebc43e2bfb14624acca57a248cf6c5e_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-asus-rog-strix-g16-g614pp-ts112w-1_5ebc43e2bfb14624acca57a248cf6c5e_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-fe2zvl', '{}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 10, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'GearVN' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('ASUS')
  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
  RETURNING id
),
category_row AS (
  INSERT INTO product_categories (name, slug, parent_id, level, is_active, created_at, updated_at)
  VALUES ('Laptop', 'laptop', NULL, 1, true, now(), now())
  ON CONFLICT (name) DO UPDATE SET is_active = true, updated_at = now()
  RETURNING id
),
catalog_insert AS (
  INSERT INTO product_catalog (name, brand_id, category_id, description, specs, default_image, msrp, status, created_at, updated_at)
  SELECT 'Laptop gaming ASUS ROG Strix G16 G614PM-TS147W', brand_row.id, category_row.id, 'Laptop gaming ASUS ROG Strix G16 G614PM-TS147W - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/laptop-gaming-asus-rog-strix-g16-g614pm-ts147w","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-asus-rog-strix-g16-g614pm-ts147w-1_d5fc323b82f848eb94bc3ea2da1524d4_grande.jpg', 56790000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Laptop gaming ASUS ROG Strix G16 G614PM-TS147W' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Laptop gaming ASUS ROG Strix G16 G614PM-TS147W' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Laptop gaming ASUS ROG Strix G16 G614PM-TS147W', 'Laptop gaming ASUS ROG Strix G16 G614PM-TS147W - imported from GearVN', 56790000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
  FROM store_row, brand_row, category_row, catalog_row
  WHERE NOT EXISTS (
    SELECT 1 FROM products pp WHERE pp.catalog_id = catalog_row.id AND pp.store_id = store_row.id
  )
  RETURNING id
),
product_row AS (
  SELECT id FROM product_insert
  UNION ALL
  SELECT pp.id FROM products pp, catalog_row, store_row WHERE pp.catalog_id = catalog_row.id AND pp.store_id = store_row.id
  LIMIT 1
),
image_insert AS (
  INSERT INTO product_images (product_id, url, sort_order, created_at)
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-asus-rog-strix-g16-g614pm-ts147w-1_d5fc323b82f848eb94bc3ea2da1524d4_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-asus-rog-strix-g16-g614pm-ts147w-1_d5fc323b82f848eb94bc3ea2da1524d4_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-asus-rog-strix-g16-g614pm-ts147w-1_d5fc323b82f848eb94bc3ea2da1524d4_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-1oazi', '{}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 10, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'GearVN' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('ASUS')
  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
  RETURNING id
),
category_row AS (
  INSERT INTO product_categories (name, slug, parent_id, level, is_active, created_at, updated_at)
  VALUES ('Laptop', 'laptop', NULL, 1, true, now(), now())
  ON CONFLICT (name) DO UPDATE SET is_active = true, updated_at = now()
  RETURNING id
),
catalog_insert AS (
  INSERT INTO product_catalog (name, brand_id, category_id, description, specs, default_image, msrp, status, created_at, updated_at)
  SELECT 'Laptop gaming ASUS ROG Strix G16 G614PH-TS118W', brand_row.id, category_row.id, 'Laptop gaming ASUS ROG Strix G16 G614PH-TS118W - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/laptop-gaming-asus-rog-strix-g16-g614ph-ts118w","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-asus-rog-strix-g16-g614ph-ts118w-1_000c338e0c4b40b7ba11e4f25a1dde90_grande.jpg', 48490000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Laptop gaming ASUS ROG Strix G16 G614PH-TS118W' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Laptop gaming ASUS ROG Strix G16 G614PH-TS118W' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Laptop gaming ASUS ROG Strix G16 G614PH-TS118W', 'Laptop gaming ASUS ROG Strix G16 G614PH-TS118W - imported from GearVN', 48490000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
  FROM store_row, brand_row, category_row, catalog_row
  WHERE NOT EXISTS (
    SELECT 1 FROM products pp WHERE pp.catalog_id = catalog_row.id AND pp.store_id = store_row.id
  )
  RETURNING id
),
product_row AS (
  SELECT id FROM product_insert
  UNION ALL
  SELECT pp.id FROM products pp, catalog_row, store_row WHERE pp.catalog_id = catalog_row.id AND pp.store_id = store_row.id
  LIMIT 1
),
image_insert AS (
  INSERT INTO product_images (product_id, url, sort_order, created_at)
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-asus-rog-strix-g16-g614ph-ts118w-1_000c338e0c4b40b7ba11e4f25a1dde90_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-asus-rog-strix-g16-g614ph-ts118w-1_000c338e0c4b40b7ba11e4f25a1dde90_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-asus-rog-strix-g16-g614ph-ts118w-1_000c338e0c4b40b7ba11e4f25a1dde90_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-23kmjh', '{}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 10, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'GearVN' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('ASUS')
  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
  RETURNING id
),
category_row AS (
  INSERT INTO product_categories (name, slug, parent_id, level, is_active, created_at, updated_at)
  VALUES ('Màn hình', 'man-hinh', NULL, 1, true, now(), now())
  ON CONFLICT (name) DO UPDATE SET is_active = true, updated_at = now()
  RETURNING id
),
catalog_insert AS (
  INSERT INTO product_catalog (name, brand_id, category_id, description, specs, default_image, msrp, status, created_at, updated_at)
  SELECT 'Màn hình cong Asus ROG Swift PG34WCDN 34', brand_row.id, category_row.id, 'Màn hình cong Asus ROG Swift PG34WCDN 34 - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/man-hinh-cong-asus-rog-swift-pg34wcdn-34-qd-oled-2k-360hz-usbc-chuyen-game","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/nh-cong-asus-rog-swift-pg34wcdn-34-qd-oled-2k-360hz-usbc-chuyen-game-1_7d01de60261147558e2e73a5d549da36_grande.jpg', 42990000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Màn hình cong Asus ROG Swift PG34WCDN 34' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Màn hình cong Asus ROG Swift PG34WCDN 34' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Màn hình cong Asus ROG Swift PG34WCDN 34', 'Màn hình cong Asus ROG Swift PG34WCDN 34 - imported from GearVN', 42990000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
  FROM store_row, brand_row, category_row, catalog_row
  WHERE NOT EXISTS (
    SELECT 1 FROM products pp WHERE pp.catalog_id = catalog_row.id AND pp.store_id = store_row.id
  )
  RETURNING id
),
product_row AS (
  SELECT id FROM product_insert
  UNION ALL
  SELECT pp.id FROM products pp, catalog_row, store_row WHERE pp.catalog_id = catalog_row.id AND pp.store_id = store_row.id
  LIMIT 1
),
image_insert AS (
  INSERT INTO product_images (product_id, url, sort_order, created_at)
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/nh-cong-asus-rog-swift-pg34wcdn-34-qd-oled-2k-360hz-usbc-chuyen-game-1_7d01de60261147558e2e73a5d549da36_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/nh-cong-asus-rog-swift-pg34wcdn-34-qd-oled-2k-360hz-usbc-chuyen-game-1_7d01de60261147558e2e73a5d549da36_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/nh-cong-asus-rog-swift-pg34wcdn-34-qd-oled-2k-360hz-usbc-chuyen-game-1_7d01de60261147558e2e73a5d549da36_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-w8bqfj', '{}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 10, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'GearVN' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('Intel')
  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
  RETURNING id
),
category_row AS (
  INSERT INTO product_categories (name, slug, parent_id, level, is_active, created_at, updated_at)
  VALUES ('PC', 'pc', NULL, 1, true, now(), now())
  ON CONFLICT (name) DO UPDATE SET is_active = true, updated_at = now()
  RETURNING id
),
catalog_insert AS (
  INSERT INTO product_catalog (name, brand_id, category_id, description, specs, default_image, msrp, status, created_at, updated_at)
  SELECT 'PC GVN INTEL I3-12100F/VGA RTX 5050', brand_row.id, category_row.id, 'PC GVN INTEL I3-12100F/VGA RTX 5050 - imported from GearVN', '{"Mainboard":"Bo mạch chủ GIGABYTE H610M-H V3 (DDR4)","CPU":"Intel Core i3 12100F / 3.3GHz Turbo 4.3GHz / 4 Nhân 8 Luồng / 12MB / LGA 1700","RAM":"RAM TeamGroup Elite Plus (1x8GB) DDR4 3200MHz","Card đồ họa":"Card màn hình ZOTAC GEFORCE RTX 5050 TWIN EDGE OC 8GB GDDR6","Tản nhiệt":"Tản nhiệt Cooler Master Hyper 212 Spectrum V3 ARGB","SSD":"Ổ cứng SSD GIGABYTE NVMe V2 256GB (G3NVMEV2256G)","PSU":"Nguồn máy tính Cooler Master MWE 650 - 80 Plus Bronze - V3 230V (650W)","Case":"Vỏ máy tính Xigmatek QUANTUM 4AF","import_source":"GearVN","source_url":"https://gearvn.com/products/pc-gvn-intel-i3-12100f-vga-rtx-5050","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/d_i_di_n_de81f875281c4606985a3cbefad2e5ee_grande.jpg', 17990000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'PC GVN INTEL I3-12100F/VGA RTX 5050' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'PC GVN INTEL I3-12100F/VGA RTX 5050' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'PC GVN INTEL I3-12100F/VGA RTX 5050', 'PC GVN INTEL I3-12100F/VGA RTX 5050 - imported from GearVN', 17990000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
  FROM store_row, brand_row, category_row, catalog_row
  WHERE NOT EXISTS (
    SELECT 1 FROM products pp WHERE pp.catalog_id = catalog_row.id AND pp.store_id = store_row.id
  )
  RETURNING id
),
product_row AS (
  SELECT id FROM product_insert
  UNION ALL
  SELECT pp.id FROM products pp, catalog_row, store_row WHERE pp.catalog_id = catalog_row.id AND pp.store_id = store_row.id
  LIMIT 1
),
image_insert AS (
  INSERT INTO product_images (product_id, url, sort_order, created_at)
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/d_i_di_n_de81f875281c4606985a3cbefad2e5ee_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/d_i_di_n_de81f875281c4606985a3cbefad2e5ee_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/d_i_di_n_de81f875281c4606985a3cbefad2e5ee_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-ftfhl4', '{"Mainboard":"Bo mạch chủ GIGABYTE H610M-H V3 (DDR4)","CPU":"Intel Core i3 12100F / 3.3GHz Turbo 4.3GHz / 4 Nhân 8 Luồng / 12MB / LGA 1700","RAM":"RAM TeamGroup Elite Plus (1x8GB) DDR4 3200MHz","Card đồ họa":"Card màn hình ZOTAC GEFORCE RTX 5050 TWIN EDGE OC 8GB GDDR6","Tản nhiệt":"Tản nhiệt Cooler Master Hyper 212 Spectrum V3 ARGB","SSD":"Ổ cứng SSD GIGABYTE NVMe V2 256GB (G3NVMEV2256G)","PSU":"Nguồn máy tính Cooler Master MWE 650 - 80 Plus Bronze - V3 230V (650W)","Case":"Vỏ máy tính Xigmatek QUANTUM 4AF"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 10, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'GearVN' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('Lenovo')
  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
  RETURNING id
),
category_row AS (
  INSERT INTO product_categories (name, slug, parent_id, level, is_active, created_at, updated_at)
  VALUES ('Laptop', 'laptop', NULL, 1, true, now(), now())
  ON CONFLICT (name) DO UPDATE SET is_active = true, updated_at = now()
  RETURNING id
),
catalog_insert AS (
  INSERT INTO product_catalog (name, brand_id, category_id, description, specs, default_image, msrp, status, created_at, updated_at)
  SELECT 'Laptop gaming Lenovo LOQ 15IRX10 83JE01AGVN', brand_row.id, category_row.id, 'Laptop gaming Lenovo LOQ 15IRX10 83JE01AGVN - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/laptop-gaming-lenovo-loq-15irx10-83je01agvn","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-lenovo-loq-15irx10-83je01agvn-1_e90f3b6821ba46f5a164978165fe634c_grande.jpg', 36828000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Laptop gaming Lenovo LOQ 15IRX10 83JE01AGVN' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Laptop gaming Lenovo LOQ 15IRX10 83JE01AGVN' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Laptop gaming Lenovo LOQ 15IRX10 83JE01AGVN', 'Laptop gaming Lenovo LOQ 15IRX10 83JE01AGVN - imported from GearVN', 36828000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
  FROM store_row, brand_row, category_row, catalog_row
  WHERE NOT EXISTS (
    SELECT 1 FROM products pp WHERE pp.catalog_id = catalog_row.id AND pp.store_id = store_row.id
  )
  RETURNING id
),
product_row AS (
  SELECT id FROM product_insert
  UNION ALL
  SELECT pp.id FROM products pp, catalog_row, store_row WHERE pp.catalog_id = catalog_row.id AND pp.store_id = store_row.id
  LIMIT 1
),
image_insert AS (
  INSERT INTO product_images (product_id, url, sort_order, created_at)
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-lenovo-loq-15irx10-83je01agvn-1_e90f3b6821ba46f5a164978165fe634c_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-lenovo-loq-15irx10-83je01agvn-1_e90f3b6821ba46f5a164978165fe634c_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-lenovo-loq-15irx10-83je01agvn-1_e90f3b6821ba46f5a164978165fe634c_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-j088sh', '{}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 10, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

COMMIT;

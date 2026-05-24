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
  VALUES ('Razer')
  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
  RETURNING id
),
category_row AS (
  INSERT INTO product_categories (name, slug, parent_id, level, is_active, created_at, updated_at)
  VALUES ('Tai nghe', 'tai-nghe', NULL, 1, true, now(), now())
  ON CONFLICT (name) DO UPDATE SET is_active = true, updated_at = now()
  RETURNING id
),
catalog_insert AS (
  INSERT INTO product_catalog (name, brand_id, category_id, description, specs, default_image, msrp, status, created_at, updated_at)
  SELECT 'Tai nghe Razer BlackShark V3 White', brand_row.id, category_row.id, 'Tai nghe Razer BlackShark V3 White - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/tai-nghe-razer-blackshark-v3-white","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/tai-nghe-razer-blackshark-v3-white-1_645e8067718b41d3acc4f6e7bae49396_grande.jpg', 4420000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Tai nghe Razer BlackShark V3 White' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Tai nghe Razer BlackShark V3 White' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Tai nghe Razer BlackShark V3 White', 'Tai nghe Razer BlackShark V3 White - imported from GearVN', 4420000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/tai-nghe-razer-blackshark-v3-white-1_645e8067718b41d3acc4f6e7bae49396_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/tai-nghe-razer-blackshark-v3-white-1_645e8067718b41d3acc4f6e7bae49396_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/tai-nghe-razer-blackshark-v3-white-1_645e8067718b41d3acc4f6e7bae49396_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-tryfca', '{}'::jsonb, now(), now() FROM product_row
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
  VALUES ('Logitech')
  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
  RETURNING id
),
category_row AS (
  INSERT INTO product_categories (name, slug, parent_id, level, is_active, created_at, updated_at)
  VALUES ('Bàn phím', 'ban-phim', NULL, 1, true, now(), now())
  ON CONFLICT (name) DO UPDATE SET is_active = true, updated_at = now()
  RETURNING id
),
catalog_insert AS (
  INSERT INTO product_catalog (name, brand_id, category_id, description, specs, default_image, msrp, status, created_at, updated_at)
  SELECT 'Bàn phím Logitech G915 X Lightspeed TKL Tactile Wireless Black', brand_row.id, category_row.id, 'Bàn phím Logitech G915 X Lightspeed TKL Tactile Wireless Black - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/ban-phim-logitech-g915-x-lightspeed-tkl-tactile-wireless-black","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/imgi_28_1_5b2f7891bf434a7aab9f1abdba56c17e_6dedc40ef95c4ba4b3fc7070049173c6_grande.jpg', 4440000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Bàn phím Logitech G915 X Lightspeed TKL Tactile Wireless Black' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Bàn phím Logitech G915 X Lightspeed TKL Tactile Wireless Black' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Bàn phím Logitech G915 X Lightspeed TKL Tactile Wireless Black', 'Bàn phím Logitech G915 X Lightspeed TKL Tactile Wireless Black - imported from GearVN', 4440000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/imgi_28_1_5b2f7891bf434a7aab9f1abdba56c17e_6dedc40ef95c4ba4b3fc7070049173c6_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/imgi_28_1_5b2f7891bf434a7aab9f1abdba56c17e_6dedc40ef95c4ba4b3fc7070049173c6_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/imgi_28_1_5b2f7891bf434a7aab9f1abdba56c17e_6dedc40ef95c4ba4b3fc7070049173c6_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-jc67zv', '{}'::jsonb, now(), now() FROM product_row
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
  VALUES ('LG')
  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
  RETURNING id
),
category_row AS (
  INSERT INTO product_categories (name, slug, parent_id, level, is_active, created_at, updated_at)
  VALUES ('GearVN', 'gearvn', NULL, 1, true, now(), now())
  ON CONFLICT (name) DO UPDATE SET is_active = true, updated_at = now()
  RETURNING id
),
catalog_insert AS (
  INSERT INTO product_catalog (name, brand_id, category_id, description, specs, default_image, msrp, status, created_at, updated_at)
  SELECT 'Bộ vi xử lý Intel Core i7 14700K / Turbo up to 5.6GHz / 20 Nhân 28 Luồng / 33MB / LGA 1700 (Tray)', brand_row.id, category_row.id, 'Bộ vi xử lý Intel Core i7 14700K / Turbo up to 5.6GHz / 20 Nhân 28 Luồng / 33MB / LGA 1700 (Tray) - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/bo-vi-xu-ly-intel-core-i7-14700k-turbo-up-to-5-6ghz-20-nhan-28-luong-33mb-lga-1700-tray","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/ore-i7-14700k-turbo-up-to-5-6ghz-20-nhan-28-luong-33mb-lga-1700-tray-2_f82bec084b77498eb5612090bbd3e85f_grande.jpg', 13490000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Bộ vi xử lý Intel Core i7 14700K / Turbo up to 5.6GHz / 20 Nhân 28 Luồng / 33MB / LGA 1700 (Tray)' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Bộ vi xử lý Intel Core i7 14700K / Turbo up to 5.6GHz / 20 Nhân 28 Luồng / 33MB / LGA 1700 (Tray)' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Bộ vi xử lý Intel Core i7 14700K / Turbo up to 5.6GHz / 20 Nhân 28 Luồng / 33MB / LGA 1700 (Tray)', 'Bộ vi xử lý Intel Core i7 14700K / Turbo up to 5.6GHz / 20 Nhân 28 Luồng / 33MB / LGA 1700 (Tray) - imported from GearVN', 13490000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/ore-i7-14700k-turbo-up-to-5-6ghz-20-nhan-28-luong-33mb-lga-1700-tray-2_f82bec084b77498eb5612090bbd3e85f_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/ore-i7-14700k-turbo-up-to-5-6ghz-20-nhan-28-luong-33mb-lga-1700-tray-2_f82bec084b77498eb5612090bbd3e85f_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/ore-i7-14700k-turbo-up-to-5-6ghz-20-nhan-28-luong-33mb-lga-1700-tray-2_f82bec084b77498eb5612090bbd3e85f_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-pu1y0o', '{}'::jsonb, now(), now() FROM product_row
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
  VALUES ('Gigabyte')
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
  SELECT 'Laptop gaming Gigabyte Gaming A16 CTHH3VN893SH', brand_row.id, category_row.id, 'Laptop gaming Gigabyte Gaming A16 CTHH3VN893SH - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/laptop-gaming-gigabyte-gaming-a16-cthh3vn893sh","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-gigabyte-gaming-a16-cthh3vn893sh-2_bd71d82feff0486981dc166f25a9d6aa_grande.jpg', 31490000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Laptop gaming Gigabyte Gaming A16 CTHH3VN893SH' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Laptop gaming Gigabyte Gaming A16 CTHH3VN893SH' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Laptop gaming Gigabyte Gaming A16 CTHH3VN893SH', 'Laptop gaming Gigabyte Gaming A16 CTHH3VN893SH - imported from GearVN', 31490000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-gigabyte-gaming-a16-cthh3vn893sh-2_bd71d82feff0486981dc166f25a9d6aa_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-gigabyte-gaming-a16-cthh3vn893sh-2_bd71d82feff0486981dc166f25a9d6aa_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-gigabyte-gaming-a16-cthh3vn893sh-2_bd71d82feff0486981dc166f25a9d6aa_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-qmhm1z', '{}'::jsonb, now(), now() FROM product_row
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
  VALUES ('ViewSonic')
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
  SELECT 'Màn hình Viewsonic VA2732-H-2 27', brand_row.id, category_row.id, 'Màn hình Viewsonic VA2732-H-2 27 - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/man-hinh-viewsonic-va2732-h-2-27-ips-100hz-vien-mong","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/man-hinh-viewsonic-va2732-h-2-27-ips-100hz-vien-mong-1_47ef7db5175f483cb08cac52db798dae_grande.jpg', 2450000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Màn hình Viewsonic VA2732-H-2 27' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Màn hình Viewsonic VA2732-H-2 27' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Màn hình Viewsonic VA2732-H-2 27', 'Màn hình Viewsonic VA2732-H-2 27 - imported from GearVN', 2450000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/man-hinh-viewsonic-va2732-h-2-27-ips-100hz-vien-mong-1_47ef7db5175f483cb08cac52db798dae_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/man-hinh-viewsonic-va2732-h-2-27-ips-100hz-vien-mong-1_47ef7db5175f483cb08cac52db798dae_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/man-hinh-viewsonic-va2732-h-2-27-ips-100hz-vien-mong-1_47ef7db5175f483cb08cac52db798dae_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-j63f5j', '{}'::jsonb, now(), now() FROM product_row
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
  VALUES ('MSI')
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
  SELECT 'Màn hình MSI MAG 275QF E20 27', brand_row.id, category_row.id, 'Màn hình MSI MAG 275QF E20 27 - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/man-hinh-msi-mag-275qf-e20-27-rapid-ips-2k-200hz-chuyen-game","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/man-hinh-msi-mag-275qf-e20-27-rapid-ips-2k-200hz-1_7b4b09dc67b8422583ce84c065331078_grande.jpg', 4490000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Màn hình MSI MAG 275QF E20 27' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Màn hình MSI MAG 275QF E20 27' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Màn hình MSI MAG 275QF E20 27', 'Màn hình MSI MAG 275QF E20 27 - imported from GearVN', 4490000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/man-hinh-msi-mag-275qf-e20-27-rapid-ips-2k-200hz-1_7b4b09dc67b8422583ce84c065331078_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/man-hinh-msi-mag-275qf-e20-27-rapid-ips-2k-200hz-1_7b4b09dc67b8422583ce84c065331078_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/man-hinh-msi-mag-275qf-e20-27-rapid-ips-2k-200hz-1_7b4b09dc67b8422583ce84c065331078_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-3jmogq', '{}'::jsonb, now(), now() FROM product_row
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
  SELECT 'Màn hình Asus ROG Strix XG27AQDNG 27', brand_row.id, category_row.id, 'Màn hình Asus ROG Strix XG27AQDNG 27 - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/man-hinh-asus-rog-strix-xg27aqdng-27-qd-oled-2k-360hz-chuyen-game","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/man-hinh-asus-rog-strix-xg27aqdng-27-qd-oled-2k-360hz-chuyen-game-1_2fe51253db0f4d7e90056f4922263c52_grande.jpg', 17990000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Màn hình Asus ROG Strix XG27AQDNG 27' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Màn hình Asus ROG Strix XG27AQDNG 27' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Màn hình Asus ROG Strix XG27AQDNG 27', 'Màn hình Asus ROG Strix XG27AQDNG 27 - imported from GearVN', 17990000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/man-hinh-asus-rog-strix-xg27aqdng-27-qd-oled-2k-360hz-chuyen-game-1_2fe51253db0f4d7e90056f4922263c52_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/man-hinh-asus-rog-strix-xg27aqdng-27-qd-oled-2k-360hz-chuyen-game-1_2fe51253db0f4d7e90056f4922263c52_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/man-hinh-asus-rog-strix-xg27aqdng-27-qd-oled-2k-360hz-chuyen-game-1_2fe51253db0f4d7e90056f4922263c52_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-w9oevx', '{}'::jsonb, now(), now() FROM product_row
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
  VALUES ('Acer')
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
  SELECT 'Laptop gaming Acer Nitro ProPanel ANV15-41-R732', brand_row.id, category_row.id, 'Laptop gaming Acer Nitro ProPanel ANV15-41-R732 - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/laptop-gaming-acer-nitro-propanel-anv15-41-r732","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/r-nitro-v-15-anv15-41-non-fingerprint-with-backlit-on-wp-logo-black-01_4639e0444edf4236a8ea0df83fe332d4_grande.png', 26990000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Laptop gaming Acer Nitro ProPanel ANV15-41-R732' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Laptop gaming Acer Nitro ProPanel ANV15-41-R732' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Laptop gaming Acer Nitro ProPanel ANV15-41-R732', 'Laptop gaming Acer Nitro ProPanel ANV15-41-R732 - imported from GearVN', 26990000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/r-nitro-v-15-anv15-41-non-fingerprint-with-backlit-on-wp-logo-black-01_4639e0444edf4236a8ea0df83fe332d4_grande.png', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/r-nitro-v-15-anv15-41-non-fingerprint-with-backlit-on-wp-logo-black-01_4639e0444edf4236a8ea0df83fe332d4_grande.png' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/r-nitro-v-15-anv15-41-non-fingerprint-with-backlit-on-wp-logo-black-01_4639e0444edf4236a8ea0df83fe332d4_grande.png'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-q7h5cz', '{}'::jsonb, now(), now() FROM product_row
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
  SELECT 'Màn hình Asus ROG Strix XG27AQDMGR Gen2 27', brand_row.id, category_row.id, 'Màn hình Asus ROG Strix XG27AQDMGR Gen2 27 - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/man-hinh-asus-rog-strix-xg27aqdmgr-gen2-27-woled-2k-240hz-gsync-chuyen-game","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/h-asus-rog-strix-xg27aqdmgr-gen2-27-woled-2k-240hz-gsync-chuyen-game-1_146aba7aa0b94c71b37d54803bd352ef_grande.jpg', 15990000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Màn hình Asus ROG Strix XG27AQDMGR Gen2 27' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Màn hình Asus ROG Strix XG27AQDMGR Gen2 27' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Màn hình Asus ROG Strix XG27AQDMGR Gen2 27', 'Màn hình Asus ROG Strix XG27AQDMGR Gen2 27 - imported from GearVN', 15990000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/h-asus-rog-strix-xg27aqdmgr-gen2-27-woled-2k-240hz-gsync-chuyen-game-1_146aba7aa0b94c71b37d54803bd352ef_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/h-asus-rog-strix-xg27aqdmgr-gen2-27-woled-2k-240hz-gsync-chuyen-game-1_146aba7aa0b94c71b37d54803bd352ef_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/h-asus-rog-strix-xg27aqdmgr-gen2-27-woled-2k-240hz-gsync-chuyen-game-1_146aba7aa0b94c71b37d54803bd352ef_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-fuyd6', '{}'::jsonb, now(), now() FROM product_row
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
  SELECT 'Màn hình ASUS ROG Strix XG27JCG 27', brand_row.id, category_row.id, 'Màn hình ASUS ROG Strix XG27JCG 27 - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/man-hinh-asus-rog-strix-xg27jcg-27-fast-ips-5k-180hz-2k-330hz-chuyen-game","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/inh-asus-rog-strix-xg27jcg-27-fast-ips-5k-180hz-2k-330hz-chuyen-game-1_b05f0bbca14445be855d24d8b272be9a_grande.jpg', 21990000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Màn hình ASUS ROG Strix XG27JCG 27' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Màn hình ASUS ROG Strix XG27JCG 27' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Màn hình ASUS ROG Strix XG27JCG 27', 'Màn hình ASUS ROG Strix XG27JCG 27 - imported from GearVN', 21990000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/inh-asus-rog-strix-xg27jcg-27-fast-ips-5k-180hz-2k-330hz-chuyen-game-1_b05f0bbca14445be855d24d8b272be9a_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/inh-asus-rog-strix-xg27jcg-27-fast-ips-5k-180hz-2k-330hz-chuyen-game-1_b05f0bbca14445be855d24d8b272be9a_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/inh-asus-rog-strix-xg27jcg-27-fast-ips-5k-180hz-2k-330hz-chuyen-game-1_b05f0bbca14445be855d24d8b272be9a_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-v6bc07', '{}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 10, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

COMMIT;

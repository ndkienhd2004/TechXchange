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
  SELECT 'Màn hình Asus ROG Strix XG27AQNGV 27', brand_row.id, category_row.id, 'Màn hình Asus ROG Strix XG27AQNGV 27 - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/man-hinh-asus-rog-strix-xg27aqngv-27-ultrafast-ips-2k-360hz-gsync-pulsar-chuyen-game","imported_at":"2026-05-12T04:49:10.921Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/g-strix-xg27aqngv-27-ultrafast-ips-2k-360hz-gsync-pulsar-chuyen-game-1_9bd6ac004c8e4a47aa2013977f738f98_grande.jpg', 18990000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Màn hình Asus ROG Strix XG27AQNGV 27' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Màn hình Asus ROG Strix XG27AQNGV 27' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Màn hình Asus ROG Strix XG27AQNGV 27', 'Màn hình Asus ROG Strix XG27AQNGV 27 - imported from GearVN', 18990000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/g-strix-xg27aqngv-27-ultrafast-ips-2k-360hz-gsync-pulsar-chuyen-game-1_9bd6ac004c8e4a47aa2013977f738f98_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/g-strix-xg27aqngv-27-ultrafast-ips-2k-360hz-gsync-pulsar-chuyen-game-1_9bd6ac004c8e4a47aa2013977f738f98_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/g-strix-xg27aqngv-27-ultrafast-ips-2k-360hz-gsync-pulsar-chuyen-game-1_9bd6ac004c8e4a47aa2013977f738f98_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-bphjnh', '{}'::jsonb, now(), now() FROM product_row
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
  SELECT 'Màn hình cong Asus ROG Strix XG34WCDMTG 34', brand_row.id, category_row.id, 'Màn hình cong Asus ROG Strix XG34WCDMTG 34 - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/man-hinh-cong-asus-rog-strix-xg34wcdmtg-34-qd-oled-2k-240hz-usbc-android-14-google-tv","imported_at":"2026-05-12T04:49:10.923Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/s-rog-strix-xg34wcdmtg-34-qd-oled-2k-240hz-usbc-android-14-google-tv-1_56b695c1d04741a79c230cb475b410d7_grande.jpg', 35990000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Màn hình cong Asus ROG Strix XG34WCDMTG 34' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Màn hình cong Asus ROG Strix XG34WCDMTG 34' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Màn hình cong Asus ROG Strix XG34WCDMTG 34', 'Màn hình cong Asus ROG Strix XG34WCDMTG 34 - imported from GearVN', 35990000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/s-rog-strix-xg34wcdmtg-34-qd-oled-2k-240hz-usbc-android-14-google-tv-1_56b695c1d04741a79c230cb475b410d7_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/s-rog-strix-xg34wcdmtg-34-qd-oled-2k-240hz-usbc-android-14-google-tv-1_56b695c1d04741a79c230cb475b410d7_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/s-rog-strix-xg34wcdmtg-34-qd-oled-2k-240hz-usbc-android-14-google-tv-1_56b695c1d04741a79c230cb475b410d7_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-udtjss', '{}'::jsonb, now(), now() FROM product_row
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
  VALUES ('PC', 'pc', NULL, 1, true, now(), now())
  ON CONFLICT (name) DO UPDATE SET is_active = true, updated_at = now()
  RETURNING id
),
catalog_insert AS (
  INSERT INTO product_catalog (name, brand_id, category_id, description, specs, default_image, msrp, status, created_at, updated_at)
  SELECT 'PC GVN x MSI LIGHTNING (Intel Core Ultra 9 285K/ VGA RTX 5090)', brand_row.id, category_row.id, 'PC GVN x MSI LIGHTNING (Intel Core Ultra 9 285K/ VGA RTX 5090) - imported from GearVN', '{"Bo mạch chủ":"Mainboard MSI MEG Z890 GODLIKE (DDR5)","CPU":"Bộ vi xử lý Intel Core Ultra 9 285K / Turbo up to 5.7GHz / 24 Nhân 24 Luồng / 36MB / LGA 1851","RAM":"RAM Corsair Vengeance RGB 64GB (2x32GB) 6000 DDR5 Black","VGA":"Card màn hình MSI GeForce RTX 5090 LIGHTNING Z 32GB","SSD":"Ổ cứng SSD Samsung 990 EVO Plus 1TB M.2 PCIe Gen4 NVMe","PSU":"Nguồn máy tính MSI MEG AI1600T PCIE5 - 80 Plus Titanium (1600W)","CASE":"Vỏ máy tính MSI MEG MAESTRO 700L PZ","TẢN NHIỆT":"Tản nhiệt AIO MSI MAG CORELIQUID I360 BLACK","import_source":"GearVN","source_url":"https://gearvn.com/products/pc-gvn-int-x-msi-lightning-intel-core-ultra-9-285k-vga-rtx-5090-powered-by-msi","imported_at":"2026-05-12T04:49:10.923Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/_nh_ch_nh_752b27d93728493cb2b481929eecad03_grande.jpg', 99999999.99, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'PC GVN x MSI LIGHTNING (Intel Core Ultra 9 285K/ VGA RTX 5090)' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'PC GVN x MSI LIGHTNING (Intel Core Ultra 9 285K/ VGA RTX 5090)' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'PC GVN x MSI LIGHTNING (Intel Core Ultra 9 285K/ VGA RTX 5090)', 'PC GVN x MSI LIGHTNING (Intel Core Ultra 9 285K/ VGA RTX 5090) - imported from GearVN', 99999999.99, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/_nh_ch_nh_752b27d93728493cb2b481929eecad03_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/_nh_ch_nh_752b27d93728493cb2b481929eecad03_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/_nh_ch_nh_752b27d93728493cb2b481929eecad03_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-udmd57', '{"Bo mạch chủ":"Mainboard MSI MEG Z890 GODLIKE (DDR5)","CPU":"Bộ vi xử lý Intel Core Ultra 9 285K / Turbo up to 5.7GHz / 24 Nhân 24 Luồng / 36MB / LGA 1851","RAM":"RAM Corsair Vengeance RGB 64GB (2x32GB) 6000 DDR5 Black","VGA":"Card màn hình MSI GeForce RTX 5090 LIGHTNING Z 32GB","SSD":"Ổ cứng SSD Samsung 990 EVO Plus 1TB M.2 PCIe Gen4 NVMe","PSU":"Nguồn máy tính MSI MEG AI1600T PCIE5 - 80 Plus Titanium (1600W)","CASE":"Vỏ máy tính MSI MEG MAESTRO 700L PZ","TẢN NHIỆT":"Tản nhiệt AIO MSI MAG CORELIQUID I360 BLACK"}'::jsonb, now(), now() FROM product_row
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
  SELECT 'Màn hình ViewSonic VX2536A 25', brand_row.id, category_row.id, 'Màn hình ViewSonic VX2536A 25 - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/man-hinh-viewsonic-vx2536a-25-ips-320hz-chuyen-game","imported_at":"2026-05-12T04:49:10.923Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/man-hinh-viewsonic-vx2536a-25-ips-320hz-chuyen-game-1_1cf99dd7a0b34605b036cb4d8d3e7d76_grande.jpg', 3990000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Màn hình ViewSonic VX2536A 25' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Màn hình ViewSonic VX2536A 25' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Màn hình ViewSonic VX2536A 25', 'Màn hình ViewSonic VX2536A 25 - imported from GearVN', 3990000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/man-hinh-viewsonic-vx2536a-25-ips-320hz-chuyen-game-1_1cf99dd7a0b34605b036cb4d8d3e7d76_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/man-hinh-viewsonic-vx2536a-25-ips-320hz-chuyen-game-1_1cf99dd7a0b34605b036cb4d8d3e7d76_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/man-hinh-viewsonic-vx2536a-25-ips-320hz-chuyen-game-1_1cf99dd7a0b34605b036cb4d8d3e7d76_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-361nxw', '{}'::jsonb, now(), now() FROM product_row
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
  SELECT 'Màn hình ViewSonic VX24G30-PK 24', brand_row.id, category_row.id, 'Màn hình ViewSonic VX24G30-PK 24 - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/man-hinh-viewsonic-vx24g30-pk-24-ips-240hz-chuyen-game","imported_at":"2026-05-12T04:49:10.923Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/man-hinh-viewsonic-vx24g30-pk-24-ips-240hz-chuyen-game-1_e82ec286da5b46aa8ccafb40602da67e_grande.jpg', 3090000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Màn hình ViewSonic VX24G30-PK 24' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Màn hình ViewSonic VX24G30-PK 24' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Màn hình ViewSonic VX24G30-PK 24', 'Màn hình ViewSonic VX24G30-PK 24 - imported from GearVN', 3090000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/man-hinh-viewsonic-vx24g30-pk-24-ips-240hz-chuyen-game-1_e82ec286da5b46aa8ccafb40602da67e_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/man-hinh-viewsonic-vx24g30-pk-24-ips-240hz-chuyen-game-1_e82ec286da5b46aa8ccafb40602da67e_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/man-hinh-viewsonic-vx24g30-pk-24-ips-240hz-chuyen-game-1_e82ec286da5b46aa8ccafb40602da67e_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-akmri1', '{}'::jsonb, now(), now() FROM product_row
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
  SELECT 'Màn hình ViewSonic VX24G30-BL 24', brand_row.id, category_row.id, 'Màn hình ViewSonic VX24G30-BL 24 - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/man-hinh-viewsonic-vx24g30-bl-24-ips-240hz-chuyen-game","imported_at":"2026-05-12T04:49:10.923Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/man-hinh-viewsonic-vx24g30-bl-24-ips-240hz-chuyen-game-1_7844dfcda0e34049af6a3cb2e7c9c15c_grande.jpg', 3090000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Màn hình ViewSonic VX24G30-BL 24' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Màn hình ViewSonic VX24G30-BL 24' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Màn hình ViewSonic VX24G30-BL 24', 'Màn hình ViewSonic VX24G30-BL 24 - imported from GearVN', 3090000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/man-hinh-viewsonic-vx24g30-bl-24-ips-240hz-chuyen-game-1_7844dfcda0e34049af6a3cb2e7c9c15c_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/man-hinh-viewsonic-vx24g30-bl-24-ips-240hz-chuyen-game-1_7844dfcda0e34049af6a3cb2e7c9c15c_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/man-hinh-viewsonic-vx24g30-bl-24-ips-240hz-chuyen-game-1_7844dfcda0e34049af6a3cb2e7c9c15c_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-1j5mq2', '{}'::jsonb, now(), now() FROM product_row
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
  SELECT 'Màn hình ViewSonic VX24G30-W 24', brand_row.id, category_row.id, 'Màn hình ViewSonic VX24G30-W 24 - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/man-hinh-viewsonic-vx24g30-w-24-ips-240hz-chuyen-game","imported_at":"2026-05-12T04:49:10.923Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/man-hinh-viewsonic-vx24g30-w-24-ips-240hz-chuyen-game-1_093e5699780f4a3fa3016cf089a5e194_grande.jpg', 3090000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Màn hình ViewSonic VX24G30-W 24' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Màn hình ViewSonic VX24G30-W 24' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Màn hình ViewSonic VX24G30-W 24', 'Màn hình ViewSonic VX24G30-W 24 - imported from GearVN', 3090000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/man-hinh-viewsonic-vx24g30-w-24-ips-240hz-chuyen-game-1_093e5699780f4a3fa3016cf089a5e194_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/man-hinh-viewsonic-vx24g30-w-24-ips-240hz-chuyen-game-1_093e5699780f4a3fa3016cf089a5e194_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/man-hinh-viewsonic-vx24g30-w-24-ips-240hz-chuyen-game-1_093e5699780f4a3fa3016cf089a5e194_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-h3c7hz', '{}'::jsonb, now(), now() FROM product_row
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
  SELECT 'PC GVN Intel Ultra 9/VGA RTX 5090', brand_row.id, category_row.id, 'PC GVN Intel Ultra 9/VGA RTX 5090 - imported from GearVN', '{"Bo mạch chủ":"Mainboard ASUS ROG MAXIMUS Z890 HERO (DDR5)","CPU":"Bộ vi xử lý Intel Core Ultra 9 285K","RAM":"RAM Corsair Vengeance RGB 64GB (2x32GB) 6000 DDR5 Black","VGA":"Card màn hình ASUS TUF Gaming GeForce RTX 5090 32GB GDDR7 OC Edition","SSD":"Ổ cứng SSD Kingston NV3 1TB M.2 PCIe NVMe Gen4","PSU":"Nguồn máy tính Corsair HX1200i - ATX 3.1 & PCIe 5.1 - 80 Plus Platinum","CASE":"Vỏ máy tính Corsair FRAME 4500X RS-R ARGB Panoramic Black","TẢN NHIỆT":"Tản nhiệt AIO Corsair iCUE LINK TITAN 360 RX RGB LCD Black","import_source":"GearVN","source_url":"https://gearvn.com/products/pc-gvn-intel-ultra-9-vga-rtx-5090","imported_at":"2026-05-12T04:49:10.923Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/pc_msi_gerforce_4500rs__7_of_107__-_copy_b3dbc478b24d47958b8299f16c501145_grande.jpg', 99999999.99, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'PC GVN Intel Ultra 9/VGA RTX 5090' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'PC GVN Intel Ultra 9/VGA RTX 5090' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'PC GVN Intel Ultra 9/VGA RTX 5090', 'PC GVN Intel Ultra 9/VGA RTX 5090 - imported from GearVN', 99999999.99, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/pc_msi_gerforce_4500rs__7_of_107__-_copy_b3dbc478b24d47958b8299f16c501145_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/pc_msi_gerforce_4500rs__7_of_107__-_copy_b3dbc478b24d47958b8299f16c501145_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/pc_msi_gerforce_4500rs__7_of_107__-_copy_b3dbc478b24d47958b8299f16c501145_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-j3toi3', '{"Bo mạch chủ":"Mainboard ASUS ROG MAXIMUS Z890 HERO (DDR5)","CPU":"Bộ vi xử lý Intel Core Ultra 9 285K","RAM":"RAM Corsair Vengeance RGB 64GB (2x32GB) 6000 DDR5 Black","VGA":"Card màn hình ASUS TUF Gaming GeForce RTX 5090 32GB GDDR7 OC Edition","SSD":"Ổ cứng SSD Kingston NV3 1TB M.2 PCIe NVMe Gen4","PSU":"Nguồn máy tính Corsair HX1200i - ATX 3.1 & PCIe 5.1 - 80 Plus Platinum","CASE":"Vỏ máy tính Corsair FRAME 4500X RS-R ARGB Panoramic Black","TẢN NHIỆT":"Tản nhiệt AIO Corsair iCUE LINK TITAN 360 RX RGB LCD Black"}'::jsonb, now(), now() FROM product_row
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
  VALUES ('AOC')
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
  SELECT 'Màn hình AOC 24B15H3 24', brand_row.id, category_row.id, 'Màn hình AOC 24B15H3 24 - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/man-hinh-aoc-24b15h3-24-ips-120hz","imported_at":"2026-05-12T04:49:10.923Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/man-hinh-aoc-24b15h3-24-ips-120hz-1_43360fce11074a8fbb52d2c66539cf2f_grande.jpg', 1890000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Màn hình AOC 24B15H3 24' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Màn hình AOC 24B15H3 24' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Màn hình AOC 24B15H3 24', 'Màn hình AOC 24B15H3 24 - imported from GearVN', 1890000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/man-hinh-aoc-24b15h3-24-ips-120hz-1_43360fce11074a8fbb52d2c66539cf2f_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/man-hinh-aoc-24b15h3-24-ips-120hz-1_43360fce11074a8fbb52d2c66539cf2f_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/man-hinh-aoc-24b15h3-24-ips-120hz-1_43360fce11074a8fbb52d2c66539cf2f_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-xgjczp', '{}'::jsonb, now(), now() FROM product_row
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
  VALUES ('Laptop', 'laptop', NULL, 1, true, now(), now())
  ON CONFLICT (name) DO UPDATE SET is_active = true, updated_at = now()
  RETURNING id
),
catalog_insert AS (
  INSERT INTO product_catalog (name, brand_id, category_id, description, specs, default_image, msrp, status, created_at, updated_at)
  SELECT 'Laptop gaming MSI Cyborg 15 A13VE 2410VN - Black Edition', brand_row.id, category_row.id, 'Laptop gaming MSI Cyborg 15 A13VE 2410VN - Black Edition - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/laptop-gaming-msi-cyborg-15-a13ve-2410vn-black-edition","imported_at":"2026-05-12T04:49:10.923Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-msi-cyborg-15-a13ve-2410vn-black-edition-1_0e6f73abb07543a39ecd354d46c52115_grande.jpg', 31990000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Laptop gaming MSI Cyborg 15 A13VE 2410VN - Black Edition' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Laptop gaming MSI Cyborg 15 A13VE 2410VN - Black Edition' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Laptop gaming MSI Cyborg 15 A13VE 2410VN - Black Edition', 'Laptop gaming MSI Cyborg 15 A13VE 2410VN - Black Edition - imported from GearVN', 31990000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-msi-cyborg-15-a13ve-2410vn-black-edition-1_0e6f73abb07543a39ecd354d46c52115_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-msi-cyborg-15-a13ve-2410vn-black-edition-1_0e6f73abb07543a39ecd354d46c52115_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/laptop-gaming-msi-cyborg-15-a13ve-2410vn-black-edition-1_0e6f73abb07543a39ecd354d46c52115_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-jvjfet', '{}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 10, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

COMMIT;

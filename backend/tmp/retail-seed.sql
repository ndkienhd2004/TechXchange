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
  SELECT 'Màn hình Asus ROG Strix XG27AQDMES 27', brand_row.id, category_row.id, 'Màn hình Asus ROG Strix XG27AQDMES 27 - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/man-hinh-asus-rog-strix-xg27aqdmes-27-qd-oled-2k-240hz-gsync-chuyen-game","imported_at":"2026-05-12T04:49:10.923Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/hinh-asus-rog-strix-xg27aqdmes-27-qd-oled-2k-240hz-gsync-chuyen-game-1_f07392cd95684e1cad2f9b3889368763_grande.jpg', 15590000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Màn hình Asus ROG Strix XG27AQDMES 27' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Màn hình Asus ROG Strix XG27AQDMES 27' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Màn hình Asus ROG Strix XG27AQDMES 27', 'Màn hình Asus ROG Strix XG27AQDMES 27 - imported from GearVN', 15590000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/hinh-asus-rog-strix-xg27aqdmes-27-qd-oled-2k-240hz-gsync-chuyen-game-1_f07392cd95684e1cad2f9b3889368763_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/hinh-asus-rog-strix-xg27aqdmes-27-qd-oled-2k-240hz-gsync-chuyen-game-1_f07392cd95684e1cad2f9b3889368763_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/hinh-asus-rog-strix-xg27aqdmes-27-qd-oled-2k-240hz-gsync-chuyen-game-1_f07392cd95684e1cad2f9b3889368763_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-u0xoan', '{}'::jsonb, now(), now() FROM product_row
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
  SELECT 'Màn hình ASUS ProArt PA249CGV 24', brand_row.id, category_row.id, 'Màn hình ASUS ProArt PA249CGV 24 - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/man-hinh-asus-proart-pa249cgv-24-ips-144hz-usbc-chuyen-do-hoa","imported_at":"2026-05-12T04:49:10.923Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/man-hinh-asus-proart-pa249cgv-24-ips-144hz-usbc-chuyen-do-hoa-1_4e52dede071f4169a27512b02537fa7f_grande.jpg', 5490000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Màn hình ASUS ProArt PA249CGV 24' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Màn hình ASUS ProArt PA249CGV 24' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Màn hình ASUS ProArt PA249CGV 24', 'Màn hình ASUS ProArt PA249CGV 24 - imported from GearVN', 5490000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/man-hinh-asus-proart-pa249cgv-24-ips-144hz-usbc-chuyen-do-hoa-1_4e52dede071f4169a27512b02537fa7f_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/man-hinh-asus-proart-pa249cgv-24-ips-144hz-usbc-chuyen-do-hoa-1_4e52dede071f4169a27512b02537fa7f_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/man-hinh-asus-proart-pa249cgv-24-ips-144hz-usbc-chuyen-do-hoa-1_4e52dede071f4169a27512b02537fa7f_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-dcv92q', '{}'::jsonb, now(), now() FROM product_row
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
  SELECT 'Màn hình Asus ROG Strix XG27AQWMG 27', brand_row.id, category_row.id, 'Màn hình Asus ROG Strix XG27AQWMG 27 - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/man-hinh-asus-rog-strix-xg27aqwmg-27-woled-2k-280hz-gsync-chuyen-game","imported_at":"2026-05-12T04:49:10.923Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/an-hinh-asus-rog-strix-xg27aqwmg-27-woled-2k-280hz-gsync-chuyen-game-1_9a286339dddc44fab055b64f48dc974d_grande.jpg', 17490000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Màn hình Asus ROG Strix XG27AQWMG 27' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Màn hình Asus ROG Strix XG27AQWMG 27' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Màn hình Asus ROG Strix XG27AQWMG 27', 'Màn hình Asus ROG Strix XG27AQWMG 27 - imported from GearVN', 17490000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/an-hinh-asus-rog-strix-xg27aqwmg-27-woled-2k-280hz-gsync-chuyen-game-1_9a286339dddc44fab055b64f48dc974d_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/an-hinh-asus-rog-strix-xg27aqwmg-27-woled-2k-280hz-gsync-chuyen-game-1_9a286339dddc44fab055b64f48dc974d_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/an-hinh-asus-rog-strix-xg27aqwmg-27-woled-2k-280hz-gsync-chuyen-game-1_9a286339dddc44fab055b64f48dc974d_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-7lc990', '{}'::jsonb, now(), now() FROM product_row
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
  VALUES ('Chuột', 'chuot', NULL, 1, true, now(), now())
  ON CONFLICT (name) DO UPDATE SET is_active = true, updated_at = now()
  RETURNING id
),
catalog_insert AS (
  INSERT INTO product_catalog (name, brand_id, category_id, description, specs, default_image, msrp, status, created_at, updated_at)
  SELECT 'Chuột gaming Acer Predator Cestus 330', brand_row.id, category_row.id, 'Chuột gaming Acer Predator Cestus 330 - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/chuot-gaming-acer-predator-cestus-330","imported_at":"2026-05-12T04:49:10.923Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/chuot-gaming-acer-predator-cestus-330-1_d1bc6eb106a043ed8ffce6ab067cf119_grande.jpg', 1200000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Chuột gaming Acer Predator Cestus 330' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Chuột gaming Acer Predator Cestus 330' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Chuột gaming Acer Predator Cestus 330', 'Chuột gaming Acer Predator Cestus 330 - imported from GearVN', 1200000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/chuot-gaming-acer-predator-cestus-330-1_d1bc6eb106a043ed8ffce6ab067cf119_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/chuot-gaming-acer-predator-cestus-330-1_d1bc6eb106a043ed8ffce6ab067cf119_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/chuot-gaming-acer-predator-cestus-330-1_d1bc6eb106a043ed8ffce6ab067cf119_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-q4ec0z', '{}'::jsonb, now(), now() FROM product_row
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
  VALUES ('Tai nghe', 'tai-nghe', NULL, 1, true, now(), now())
  ON CONFLICT (name) DO UPDATE SET is_active = true, updated_at = now()
  RETURNING id
),
catalog_insert AS (
  INSERT INTO product_catalog (name, brand_id, category_id, description, specs, default_image, msrp, status, created_at, updated_at)
  SELECT 'Tai nghe gaming Acer Predator Galea 550 Wireless', brand_row.id, category_row.id, 'Tai nghe gaming Acer Predator Galea 550 Wireless - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/tai-nghe-gaming-acer-predator-galea-550-wireless","imported_at":"2026-05-12T04:49:10.923Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/tai-nghe-gaming-acer-predator-galea-550-wireless-1_e399a2a5ee1d4ffa9b59a0e42e572c37_grande.jpg', 3000000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Tai nghe gaming Acer Predator Galea 550 Wireless' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Tai nghe gaming Acer Predator Galea 550 Wireless' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Tai nghe gaming Acer Predator Galea 550 Wireless', 'Tai nghe gaming Acer Predator Galea 550 Wireless - imported from GearVN', 3000000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/tai-nghe-gaming-acer-predator-galea-550-wireless-1_e399a2a5ee1d4ffa9b59a0e42e572c37_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/tai-nghe-gaming-acer-predator-galea-550-wireless-1_e399a2a5ee1d4ffa9b59a0e42e572c37_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/tai-nghe-gaming-acer-predator-galea-550-wireless-1_e399a2a5ee1d4ffa9b59a0e42e572c37_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-vmw5gx', '{}'::jsonb, now(), now() FROM product_row
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
  SELECT 'Tai nghe Razer Hammerhead V3 HyperSpeed Black', brand_row.id, category_row.id, 'Tai nghe Razer Hammerhead V3 HyperSpeed Black - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/tai-nghe-razer-hammerhead-v3-hyperspeed-black","imported_at":"2026-05-12T04:49:10.923Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/tai-nghe-razer-hammerhead-v3-hyperspeed-black-1_82da37b19b2a4e72a180402965791170_grande.jpg', 3890000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Tai nghe Razer Hammerhead V3 HyperSpeed Black' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Tai nghe Razer Hammerhead V3 HyperSpeed Black' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Tai nghe Razer Hammerhead V3 HyperSpeed Black', 'Tai nghe Razer Hammerhead V3 HyperSpeed Black - imported from GearVN', 3890000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/tai-nghe-razer-hammerhead-v3-hyperspeed-black-1_82da37b19b2a4e72a180402965791170_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/tai-nghe-razer-hammerhead-v3-hyperspeed-black-1_82da37b19b2a4e72a180402965791170_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/tai-nghe-razer-hammerhead-v3-hyperspeed-black-1_82da37b19b2a4e72a180402965791170_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-hutctw', '{}'::jsonb, now(), now() FROM product_row
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
  VALUES ('GearVN')
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
  SELECT 'Màn hình di động VSP GP1612WS1 16', brand_row.id, category_row.id, 'Màn hình di động VSP GP1612WS1 16 - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/man-hinh-di-dong-vsp-gp1612ws1-16-ips-2k-120hz-usbc","imported_at":"2026-05-12T04:49:10.923Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/man-hinh-di-dong-vsp-gp1612ws1-16-ips-2k-120hz-usbc-1_f0a49a2e2d664f78b57054d1e253e804_grande.jpg', 4090000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Màn hình di động VSP GP1612WS1 16' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Màn hình di động VSP GP1612WS1 16' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Màn hình di động VSP GP1612WS1 16', 'Màn hình di động VSP GP1612WS1 16 - imported from GearVN', 4090000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/man-hinh-di-dong-vsp-gp1612ws1-16-ips-2k-120hz-usbc-1_f0a49a2e2d664f78b57054d1e253e804_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/man-hinh-di-dong-vsp-gp1612ws1-16-ips-2k-120hz-usbc-1_f0a49a2e2d664f78b57054d1e253e804_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/man-hinh-di-dong-vsp-gp1612ws1-16-ips-2k-120hz-usbc-1_f0a49a2e2d664f78b57054d1e253e804_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-xk1m3y', '{}'::jsonb, now(), now() FROM product_row
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
  VALUES ('GearVN')
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
  SELECT 'Màn hình di động VSP GP1614WS1 16', brand_row.id, category_row.id, 'Màn hình di động VSP GP1614WS1 16 - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/man-hinh-di-dong-vsp-gp1614ws1-16-ips-fhd-144hz-usbc","imported_at":"2026-05-12T04:49:10.923Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/man-hinh-di-dong-vsp-gp1614ws1-16-ips-fhd-144hz-usbc-1_71ac0961011c4d05ae363ce58e46db37_grande.jpg', 3090000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Màn hình di động VSP GP1614WS1 16' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Màn hình di động VSP GP1614WS1 16' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Màn hình di động VSP GP1614WS1 16', 'Màn hình di động VSP GP1614WS1 16 - imported from GearVN', 3090000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/man-hinh-di-dong-vsp-gp1614ws1-16-ips-fhd-144hz-usbc-1_71ac0961011c4d05ae363ce58e46db37_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/man-hinh-di-dong-vsp-gp1614ws1-16-ips-fhd-144hz-usbc-1_71ac0961011c4d05ae363ce58e46db37_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/man-hinh-di-dong-vsp-gp1614ws1-16-ips-fhd-144hz-usbc-1_71ac0961011c4d05ae363ce58e46db37_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-cs6i0x', '{}'::jsonb, now(), now() FROM product_row
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
  VALUES ('GearVN')
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
  SELECT 'Màn hình cảm ứng di động VSP VP1560FST1 16', brand_row.id, category_row.id, 'Màn hình cảm ứng di động VSP VP1560FST1 16 - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/man-hinh-cam-ung-di-dong-vsp-vp1560fst1-16-ips-fhd-usbc","imported_at":"2026-05-12T04:49:10.923Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/man-hinh-cam-ung-di-dong-vsp-vp1560fst1-16-ips-fhd-usbc-1_49180898975b4399b3c655fe4923df35_grande.jpg', 3090000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Màn hình cảm ứng di động VSP VP1560FST1 16' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Màn hình cảm ứng di động VSP VP1560FST1 16' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Màn hình cảm ứng di động VSP VP1560FST1 16', 'Màn hình cảm ứng di động VSP VP1560FST1 16 - imported from GearVN', 3090000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/man-hinh-cam-ung-di-dong-vsp-vp1560fst1-16-ips-fhd-usbc-1_49180898975b4399b3c655fe4923df35_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/man-hinh-cam-ung-di-dong-vsp-vp1560fst1-16-ips-fhd-usbc-1_49180898975b4399b3c655fe4923df35_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/man-hinh-cam-ung-di-dong-vsp-vp1560fst1-16-ips-fhd-usbc-1_49180898975b4399b3c655fe4923df35_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-z13p5m', '{}'::jsonb, now(), now() FROM product_row
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
  VALUES ('GearVN')
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
  SELECT 'Màn hình di động VSP VP1560FS1 16', brand_row.id, category_row.id, 'Màn hình di động VSP VP1560FS1 16 - imported from GearVN', '{"import_source":"GearVN","source_url":"https://gearvn.com/products/man-hinh-di-dong-vsp-vp1560fs1-16-ips-fhd-usbc","imported_at":"2026-05-12T04:49:10.923Z"}'::jsonb, 'http://cdn.hstatic.net/products/200000722513/man-hinh-di-dong-vsp-vp1560fs1-16-ips-fhd-usbc-1_a9546a6732a44e3fb6958f75fc614f92_grande.jpg', 1790000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Màn hình di động VSP VP1560FS1 16' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Màn hình di động VSP VP1560FS1 16' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Màn hình di động VSP VP1560FS1 16', 'Màn hình di động VSP VP1560FS1 16 - imported from GearVN', 1790000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'http://cdn.hstatic.net/products/200000722513/man-hinh-di-dong-vsp-vp1560fs1-16-ips-fhd-usbc-1_a9546a6732a44e3fb6958f75fc614f92_grande.jpg', 0, now() FROM product_row
  WHERE 'http://cdn.hstatic.net/products/200000722513/man-hinh-di-dong-vsp-vp1560fs1-16-ips-fhd-usbc-1_a9546a6732a44e3fb6958f75fc614f92_grande.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'http://cdn.hstatic.net/products/200000722513/man-hinh-di-dong-vsp-vp1560fs1-16-ips-fhd-usbc-1_a9546a6732a44e3fb6958f75fc614f92_grande.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-GEARVN-o1xnvh', '{}'::jsonb, now(), now() FROM product_row
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

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('CellphoneS')
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
  SELECT 'Bàn phím cơ không dây Akko 3108RF V3 Kuromi', brand_row.id, category_row.id, 'Mua Bàn phím cơ không dây Akko 3108RF V3 Kuromi chính hãng - Giá rẻ, đảm bảo chất lượng, độ bền cao, hỗ trợ giao hàng tận nơi toàn quốc.', '{"Loại bàn phím":"Full-size","Số phím":"108 phím","Tương thích":"Windows / macOS","Kết nối":"2.4GHz / USB Type-C","Đèn LED":"Không LED","Thời gian dùng":"Ở chế độ 2.4GHz dùng pin lên đến 8 tháng","Hãng sản xuất":"AKKO","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/ban-phim-co-khong-day-akko-3108rf-v3-kuromi.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/a/gaming_3_9_.png', 1390000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Bàn phím cơ không dây Akko 3108RF V3 Kuromi' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Bàn phím cơ không dây Akko 3108RF V3 Kuromi' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Bàn phím cơ không dây Akko 3108RF V3 Kuromi', 'Mua Bàn phím cơ không dây Akko 3108RF V3 Kuromi chính hãng - Giá rẻ, đảm bảo chất lượng, độ bền cao, hỗ trợ giao hàng tận nơi toàn quốc.', 1390000, 'new', 100, 4.8, 0, 0, 'sold_out', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/a/gaming_3_9_.png', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/a/gaming_3_9_.png' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/a/gaming_3_9_.png'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-93z5xp', '{"Loại bàn phím":"Full-size","Số phím":"108 phím","Tương thích":"Windows / macOS","Kết nối":"2.4GHz / USB Type-C","Đèn LED":"Không LED","Thời gian dùng":"Ở chế độ 2.4GHz dùng pin lên đến 8 tháng","Hãng sản xuất":"AKKO"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 0, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('CellphoneS')
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
  SELECT 'Bàn phím cơ không dây Akko 3108RF V3 My Melody', brand_row.id, category_row.id, 'Mua bàn phím cơ không dây Akko 3108RF V3 My Melody chính hãng - Giá rẻ, đảm bảo chất lượng, độ bền cao, hỗ trợ giao hàng tận nơi toàn quốc.', '{"Loại bàn phím":"Full-size","Số phím":"108 phím","Tương thích":"Windows / macOS","Kết nối":"2.4GHz / USB Type-C","Đèn LED":"Không LED","Thời gian dùng":"Ở chế độ 2.4GHz dùng pin lên đến 8 tháng","Hãng sản xuất":"AKKO","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/ban-phim-co-khong-day-akko-3108rf-v3-my-melody.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/a/gaming_3_10_.png', 1390000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Bàn phím cơ không dây Akko 3108RF V3 My Melody' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Bàn phím cơ không dây Akko 3108RF V3 My Melody' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Bàn phím cơ không dây Akko 3108RF V3 My Melody', 'Mua bàn phím cơ không dây Akko 3108RF V3 My Melody chính hãng - Giá rẻ, đảm bảo chất lượng, độ bền cao, hỗ trợ giao hàng tận nơi toàn quốc.', 1390000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/a/gaming_3_10_.png', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/a/gaming_3_10_.png' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/a/gaming_3_10_.png'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-4dnm0f', '{"Loại bàn phím":"Full-size","Số phím":"108 phím","Tương thích":"Windows / macOS","Kết nối":"2.4GHz / USB Type-C","Đèn LED":"Không LED","Thời gian dùng":"Ở chế độ 2.4GHz dùng pin lên đến 8 tháng","Hãng sản xuất":"AKKO"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 10, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('CellphoneS')
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
  SELECT 'Bàn phím cơ không dây Akko 3108RF V3 Poco Lamb', brand_row.id, category_row.id, 'Mua Bàn phím cơ không dây Akko 3108RF V3 Poco Lamb chính hãng - Giá rẻ, đảm bảo chất lượng, độ bền cao, hỗ trợ giao hàng tận nơi toàn quốc.', '{"Loại bàn phím":"Full-size","Số phím":"108 phím","Tương thích":"Windows / macOS","Kết nối":"2.4GHz / USB Type-C","Đèn LED":"Không LED","Thời gian dùng":"Ở chế độ 2.4GHz dùng pin lên đến 8 tháng","Hãng sản xuất":"AKKO","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/ban-phim-co-khong-day-akko-3108rf-v3-poco-lamb.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/a/gaming_3_8_.png', 1390000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Bàn phím cơ không dây Akko 3108RF V3 Poco Lamb' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Bàn phím cơ không dây Akko 3108RF V3 Poco Lamb' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Bàn phím cơ không dây Akko 3108RF V3 Poco Lamb', 'Mua Bàn phím cơ không dây Akko 3108RF V3 Poco Lamb chính hãng - Giá rẻ, đảm bảo chất lượng, độ bền cao, hỗ trợ giao hàng tận nơi toàn quốc.', 1390000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/a/gaming_3_8_.png', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/a/gaming_3_8_.png' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/a/gaming_3_8_.png'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-peqklm', '{"Loại bàn phím":"Full-size","Số phím":"108 phím","Tương thích":"Windows / macOS","Kết nối":"2.4GHz / USB Type-C","Đèn LED":"Không LED","Thời gian dùng":"Ở chế độ 2.4GHz dùng pin lên đến 8 tháng","Hãng sản xuất":"AKKO"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 10, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('CellphoneS')
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
  SELECT 'Bàn phím cơ không dây Akko 3108RF V3 Poco Piggy', brand_row.id, category_row.id, 'Mua bàn phím cơ không dây Akko 3108RF V3 Poco Piggy chính hãng - Giá rẻ, đảm bảo chất lượng, độ bền cao, hỗ trợ giao hàng tận nơi toàn quốc.', '{"Loại bàn phím":"Full-size","Số phím":"108 phím","Tương thích":"Windows / macOS","Kết nối":"2.4GHz / USB Type-C","Đèn LED":"Không LED","Thời gian dùng":"Ở chế độ 2.4GHz dùng pin lên đến 8 tháng","Hãng sản xuất":"AKKO","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/ban-phim-co-khong-day-akko-3108rf-v3-poco-piggy.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/a/gaming_3_7_.png', 1390000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Bàn phím cơ không dây Akko 3108RF V3 Poco Piggy' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Bàn phím cơ không dây Akko 3108RF V3 Poco Piggy' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Bàn phím cơ không dây Akko 3108RF V3 Poco Piggy', 'Mua bàn phím cơ không dây Akko 3108RF V3 Poco Piggy chính hãng - Giá rẻ, đảm bảo chất lượng, độ bền cao, hỗ trợ giao hàng tận nơi toàn quốc.', 1390000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/a/gaming_3_7_.png', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/a/gaming_3_7_.png' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/a/gaming_3_7_.png'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-vqjqvm', '{"Loại bàn phím":"Full-size","Số phím":"108 phím","Tương thích":"Windows / macOS","Kết nối":"2.4GHz / USB Type-C","Đèn LED":"Không LED","Thời gian dùng":"Ở chế độ 2.4GHz dùng pin lên đến 8 tháng","Hãng sản xuất":"AKKO"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 10, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('Samsung')
  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
  RETURNING id
),
category_row AS (
  INSERT INTO product_categories (name, slug, parent_id, level, is_active, created_at, updated_at)
  VALUES ('Điện thoại', 'ien-thoai', NULL, 1, true, now(), now())
  ON CONFLICT (name) DO UPDATE SET is_active = true, updated_at = now()
  RETURNING id
),
catalog_insert AS (
  INSERT INTO product_catalog (name, brand_id, category_id, description, specs, default_image, msrp, status, created_at, updated_at)
  SELECT 'Samsung Galaxy S25 FE 5G 8GB 512GB - Cũ trầy xước', brand_row.id, category_row.id, 'Mua điện thoại Samsung Galaxy S25 FE 8GB 512GB cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', '{"Kích thước màn hình":"6.7 inches","Công nghệ màn hình":"Dynamic AMOLED 2X","Camera sau":"50MP, f/1.8 góc rộng12MP, f/2.2 góc siêu rộng8MP, f/2.4 Tele","Camera trước":"12MP, f/2.2","Chipset":"Exynos 2400","Công nghệ NFC":"Có","Dung lượng RAM":"8 GB","Bộ nhớ trong":"512 GB","Pin":"4900 mAh","Thẻ SIM":"2 Nano-SIM + eSIM","Hệ điều hành":"Android 16, One UI 8","Độ phân giải màn hình":"1080 x 2340 pixels (FullHD+)","Tính năng màn hình":"Độ sáng tối đa 1900 nitsGorilla® Victus+16 triệu màu","Loại CPU":"10 nhân (3.2 GHz, 2.9 GHz, 2.6 GHz, 1.95 GHz)","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/dien-thoai-samsung-galaxy-s25-fe-5g-8gb-512gb-cu-tray-xuoc.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/s/a/samsung-galaxy-s25-fe-1_1_2.jpg', 11490000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Samsung Galaxy S25 FE 5G 8GB 512GB - Cũ trầy xước' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Samsung Galaxy S25 FE 5G 8GB 512GB - Cũ trầy xước' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Samsung Galaxy S25 FE 5G 8GB 512GB - Cũ trầy xước', 'Mua điện thoại Samsung Galaxy S25 FE 8GB 512GB cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', 11490000, 'new', 100, 4.8, 0, 0, 'sold_out', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/s/a/samsung-galaxy-s25-fe-1_1_2.jpg', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/s/a/samsung-galaxy-s25-fe-1_1_2.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/s/a/samsung-galaxy-s25-fe-1_1_2.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-6ooitb', '{"Kích thước màn hình":"6.7 inches","Công nghệ màn hình":"Dynamic AMOLED 2X","Camera sau":"50MP, f/1.8 góc rộng12MP, f/2.2 góc siêu rộng8MP, f/2.4 Tele","Camera trước":"12MP, f/2.2","Chipset":"Exynos 2400","Công nghệ NFC":"Có","Dung lượng RAM":"8 GB","Bộ nhớ trong":"512 GB","Pin":"4900 mAh","Thẻ SIM":"2 Nano-SIM + eSIM","Hệ điều hành":"Android 16, One UI 8","Độ phân giải màn hình":"1080 x 2340 pixels (FullHD+)","Tính năng màn hình":"Độ sáng tối đa 1900 nitsGorilla® Victus+16 triệu màu","Loại CPU":"10 nhân (3.2 GHz, 2.9 GHz, 2.6 GHz, 1.95 GHz)"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 0, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('Samsung')
  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
  RETURNING id
),
category_row AS (
  INSERT INTO product_categories (name, slug, parent_id, level, is_active, created_at, updated_at)
  VALUES ('Điện thoại', 'ien-thoai', NULL, 1, true, now(), now())
  ON CONFLICT (name) DO UPDATE SET is_active = true, updated_at = now()
  RETURNING id
),
catalog_insert AS (
  INSERT INTO product_catalog (name, brand_id, category_id, description, specs, default_image, msrp, status, created_at, updated_at)
  SELECT 'Samsung Galaxy S26 Ultra 5G 12GB 512GB - Cũ trầy xước', brand_row.id, category_row.id, 'Mua Samsung Galaxy S26 Ultra 512GB cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', '{"Kích thước màn hình":"6.9 inches","Công nghệ màn hình":"Dynamic AMOLED 2X","Camera sau":"Camera siêu rộng: 50MPCamera góc rộng: 200MPCamera Tele (5x): 50MPCamera Tele (3x): 10MP","Camera trước":"12MP","Chipset":"Snapdragon 8 Elite Gen 5 dành cho Galaxy (3nm)","Công nghệ NFC":"Có","Dung lượng RAM":"12 GB","Bộ nhớ trong":"512 GB","Pin":"5000 mAh","Thẻ SIM":"2 Nano-SIM + eSIM","Độ phân giải màn hình":"3120 x 1440 pixels (Quad HD+)","Tính năng màn hình":"Tần số quét: 1-120HzĐộ sáng tối đa: 2600 nits","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/dien-thoai-samsung-galaxy-s26-ultra-12gb-512gb-cu-tray-xuoc.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/s/a/samsung-galaxy-s26-ultra_1_3.jpg', 28690000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Samsung Galaxy S26 Ultra 5G 12GB 512GB - Cũ trầy xước' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Samsung Galaxy S26 Ultra 5G 12GB 512GB - Cũ trầy xước' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Samsung Galaxy S26 Ultra 5G 12GB 512GB - Cũ trầy xước', 'Mua Samsung Galaxy S26 Ultra 512GB cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', 28690000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/s/a/samsung-galaxy-s26-ultra_1_3.jpg', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/s/a/samsung-galaxy-s26-ultra_1_3.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/s/a/samsung-galaxy-s26-ultra_1_3.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-gf9oeh', '{"Kích thước màn hình":"6.9 inches","Công nghệ màn hình":"Dynamic AMOLED 2X","Camera sau":"Camera siêu rộng: 50MPCamera góc rộng: 200MPCamera Tele (5x): 50MPCamera Tele (3x): 10MP","Camera trước":"12MP","Chipset":"Snapdragon 8 Elite Gen 5 dành cho Galaxy (3nm)","Công nghệ NFC":"Có","Dung lượng RAM":"12 GB","Bộ nhớ trong":"512 GB","Pin":"5000 mAh","Thẻ SIM":"2 Nano-SIM + eSIM","Độ phân giải màn hình":"3120 x 1440 pixels (Quad HD+)","Tính năng màn hình":"Tần số quét: 1-120HzĐộ sáng tối đa: 2600 nits"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 10, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('Xiaomi')
  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
  RETURNING id
),
category_row AS (
  INSERT INTO product_categories (name, slug, parent_id, level, is_active, created_at, updated_at)
  VALUES ('Điện thoại', 'ien-thoai', NULL, 1, true, now(), now())
  ON CONFLICT (name) DO UPDATE SET is_active = true, updated_at = now()
  RETURNING id
),
catalog_insert AS (
  INSERT INTO product_catalog (name, brand_id, category_id, description, specs, default_image, msrp, status, created_at, updated_at)
  SELECT 'Xiaomi Redmi Note 15 Pro 12GB 256GB - Cũ trầy xước', brand_row.id, category_row.id, 'Mua Xiaomi Redmi Note 15 Pro 4G 12GB/256GB cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', '{"Kích thước màn hình":"6.77 inches","Công nghệ màn hình":"AMOLED","Camera sau":"200MP (chính) + 8MP (siêu rộng)","Camera trước":"32MP","Chipset":"MediaTek Helio G200-Ultra","Dung lượng RAM":"12 GB","Bộ nhớ trong":"256 GB","Pin":"6500mAh","Hệ điều hành":"Xiaomi HyperOS 2","Độ phân giải màn hình":"1080 x 2392 pixels","Tính năng màn hình":"Độ sáng tối đa 3200 nits, 12-bit, DCI-P3, PWM 3840Hz, TÜV Rheinland","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/dien-thoai-xiaomi-redmi-note-15-pro-12gb-256gb-cu-tray-xuoc.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/r/e/redmi-note-15-series-8_1_2_1.jpg', 6490000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Xiaomi Redmi Note 15 Pro 12GB 256GB - Cũ trầy xước' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Xiaomi Redmi Note 15 Pro 12GB 256GB - Cũ trầy xước' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Xiaomi Redmi Note 15 Pro 12GB 256GB - Cũ trầy xước', 'Mua Xiaomi Redmi Note 15 Pro 4G 12GB/256GB cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', 6490000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/r/e/redmi-note-15-series-8_1_2_1.jpg', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/r/e/redmi-note-15-series-8_1_2_1.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/r/e/redmi-note-15-series-8_1_2_1.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-jigf6j', '{"Kích thước màn hình":"6.77 inches","Công nghệ màn hình":"AMOLED","Camera sau":"200MP (chính) + 8MP (siêu rộng)","Camera trước":"32MP","Chipset":"MediaTek Helio G200-Ultra","Dung lượng RAM":"12 GB","Bộ nhớ trong":"256 GB","Pin":"6500mAh","Hệ điều hành":"Xiaomi HyperOS 2","Độ phân giải màn hình":"1080 x 2392 pixels","Tính năng màn hình":"Độ sáng tối đa 3200 nits, 12-bit, DCI-P3, PWM 3840Hz, TÜV Rheinland"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 10, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
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
  SELECT 'Laptop Acer Aspire Go 15 AG15-31P-32U6 NX.KRPSV.002 - Cũ Trầy Xước', brand_row.id, category_row.id, 'Mua Laptop Acer Aspire Go 15 AG15-31P-32U6 NX.KRPSV.002 cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', '{"Loại card đồ họa":"Intel UHD Graphics","Dung lượng RAM":"8GB","Loại RAM":"LPDDR5","Số khe ram":"1 thanh 8GB","Ổ cứng":"512GB SSD NVMe PCIeNâng cấp tối đa 1TB (SSD M2 PCIe)","Kích thước màn hình":"15.6 inches","Công nghệ màn hình":"Anti-Glare LED-Backlit Display","Pin":"Li-ion, 57 Wh","Hệ điều hành":"Windows 11 Home SL","Độ phân giải màn hình":"1920 x 1080 pixels (FullHD)","Loại CPU":"Intel Core i3 N305 8 luồng 3.8GHz","Cổng giao tiếp":"2 x USB 3.21 x USB Type-C1 x HDMI 2.11 x Jack 3.5 mm1 x DC-in jack","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/laptop-acer-aspire-go-15-ag15-31p-32u6-nxkrpsv002-cu-tray-xuoc.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/l/a/laptop-acer-aspire-go-15-ag15-31p-32u6-nxkrpsv002-1_1.png', 6690000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Laptop Acer Aspire Go 15 AG15-31P-32U6 NX.KRPSV.002 - Cũ Trầy Xước' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Laptop Acer Aspire Go 15 AG15-31P-32U6 NX.KRPSV.002 - Cũ Trầy Xước' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Laptop Acer Aspire Go 15 AG15-31P-32U6 NX.KRPSV.002 - Cũ Trầy Xước', 'Mua Laptop Acer Aspire Go 15 AG15-31P-32U6 NX.KRPSV.002 cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', 6690000, 'new', 100, 4.8, 0, 0, 'sold_out', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/l/a/laptop-acer-aspire-go-15-ag15-31p-32u6-nxkrpsv002-1_1.png', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/l/a/laptop-acer-aspire-go-15-ag15-31p-32u6-nxkrpsv002-1_1.png' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/l/a/laptop-acer-aspire-go-15-ag15-31p-32u6-nxkrpsv002-1_1.png'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-3u4f2s', '{"Loại card đồ họa":"Intel UHD Graphics","Dung lượng RAM":"8GB","Loại RAM":"LPDDR5","Số khe ram":"1 thanh 8GB","Ổ cứng":"512GB SSD NVMe PCIeNâng cấp tối đa 1TB (SSD M2 PCIe)","Kích thước màn hình":"15.6 inches","Công nghệ màn hình":"Anti-Glare LED-Backlit Display","Pin":"Li-ion, 57 Wh","Hệ điều hành":"Windows 11 Home SL","Độ phân giải màn hình":"1920 x 1080 pixels (FullHD)","Loại CPU":"Intel Core i3 N305 8 luồng 3.8GHz","Cổng giao tiếp":"2 x USB 3.21 x USB Type-C1 x HDMI 2.11 x Jack 3.5 mm1 x DC-in jack"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 0, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
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
  SELECT 'Laptop ASUS Gaming ROG Zephyrus G14 GA401QM-211.ZG14 - Cũ Đẹp', brand_row.id, category_row.id, 'Mua ngay Laptop ASUS Gaming ROG Zephyrus G14 GA401QM-211.ZG14 cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', '{"Loại card đồ họa":"Geforce RTX 3060 MaxQ 6GB","Dung lượng RAM":"16GB","Loại RAM":"DDR4 3200MHz","Số khe ram":"1 khe SO-DIMM","Ổ cứng":"1TB SSD","Kích thước màn hình":"14 inches","Công nghệ màn hình":"100% sRGB","Pin":"76 Watt Giờ","Hệ điều hành":"Windows 11","Độ phân giải màn hình":"1920 x 1080 pixels (FullHD)","Loại CPU":"Ryzen 9 5900Hs","Cổng giao tiếp":"2x USB 3 Loại C 2x USB 3.0 (Loại A) HDMI Rj- 45 Giắc cắm Ethernet Giắc cắm âm thanh kết hợp 3,5 mm","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/laptop-asus-gaming-rog-zephyrus-g14-ga401qm-211-zg14-cu-dep.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/c/p/cps-34-04_1_.png', 20490000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Laptop ASUS Gaming ROG Zephyrus G14 GA401QM-211.ZG14 - Cũ Đẹp' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Laptop ASUS Gaming ROG Zephyrus G14 GA401QM-211.ZG14 - Cũ Đẹp' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Laptop ASUS Gaming ROG Zephyrus G14 GA401QM-211.ZG14 - Cũ Đẹp', 'Mua ngay Laptop ASUS Gaming ROG Zephyrus G14 GA401QM-211.ZG14 cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', 20490000, 'new', 100, 4.8, 0, 0, 'sold_out', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/c/p/cps-34-04_1_.png', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/c/p/cps-34-04_1_.png' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/c/p/cps-34-04_1_.png'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-aapg8a', '{"Loại card đồ họa":"Geforce RTX 3060 MaxQ 6GB","Dung lượng RAM":"16GB","Loại RAM":"DDR4 3200MHz","Số khe ram":"1 khe SO-DIMM","Ổ cứng":"1TB SSD","Kích thước màn hình":"14 inches","Công nghệ màn hình":"100% sRGB","Pin":"76 Watt Giờ","Hệ điều hành":"Windows 11","Độ phân giải màn hình":"1920 x 1080 pixels (FullHD)","Loại CPU":"Ryzen 9 5900Hs","Cổng giao tiếp":"2x USB 3 Loại C 2x USB 3.0 (Loại A) HDMI Rj- 45 Giắc cắm Ethernet Giắc cắm âm thanh kết hợp 3,5 mm"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 0, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
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
  SELECT 'Laptop ASUS VivoBook S14 S3407CA-SF923W - Cũ Đẹp', brand_row.id, category_row.id, 'Mua ngay Laptop ASUS VivoBook S14 S3407CA-SF923W cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', '{"Chip AI":"Intel AI Boost NPU up to 13TOPS","Loại card đồ họa":"Intel Graphics","Dung lượng RAM":"16GB","Loại RAM":"DDR5 on board","Ổ cứng":"512GB M.2 NVMe PCIe 4.0 SSD","Kích thước màn hình":"14 inches","Công nghệ màn hình":"Độ sáng 300 nits Độ phủ màu 95% DCI-P3 Tỷ lệ tương phản 1.000.000:1 1.07 tỷ màu Giảm 70% ánh sáng xanh có hại Chứng nhận TÜV Rheinland","Pin":"70WHrs, 4S1P, 4-cell Li-ion","Hệ điều hành":"Windows 11 Home","Độ phân giải màn hình":"1920 x 1200 pixels (WUXGA)","Loại CPU":"Intel Core Ultra 7 255H 2.0 GHz (24MB Cache, up to 5.1 GHz, 16 lõi, 16 luồng)","Cổng giao tiếp":"2 x USB-A (USB 3.2 Gen 1, 5Gbps) 2 x USB-C (USB 3.2 Gen 1, 5Gbps, hỗ trợ Display / Power Delivery) 1 x HDMI 1.4 1 x Jack tai nghe/micro 3,5mm","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/laptop-asus-vivobook-s14-s3407ca-sf923w-cu-dep.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/r/group_881_3__1.png', 20790000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Laptop ASUS VivoBook S14 S3407CA-SF923W - Cũ Đẹp' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Laptop ASUS VivoBook S14 S3407CA-SF923W - Cũ Đẹp' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Laptop ASUS VivoBook S14 S3407CA-SF923W - Cũ Đẹp', 'Mua ngay Laptop ASUS VivoBook S14 S3407CA-SF923W cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', 20790000, 'new', 100, 4.8, 0, 0, 'sold_out', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/r/group_881_3__1.png', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/r/group_881_3__1.png' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/r/group_881_3__1.png'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-9ndj8x', '{"Chip AI":"Intel AI Boost NPU up to 13TOPS","Loại card đồ họa":"Intel Graphics","Dung lượng RAM":"16GB","Loại RAM":"DDR5 on board","Ổ cứng":"512GB M.2 NVMe PCIe 4.0 SSD","Kích thước màn hình":"14 inches","Công nghệ màn hình":"Độ sáng 300 nits Độ phủ màu 95% DCI-P3 Tỷ lệ tương phản 1.000.000:1 1.07 tỷ màu Giảm 70% ánh sáng xanh có hại Chứng nhận TÜV Rheinland","Pin":"70WHrs, 4S1P, 4-cell Li-ion","Hệ điều hành":"Windows 11 Home","Độ phân giải màn hình":"1920 x 1200 pixels (WUXGA)","Loại CPU":"Intel Core Ultra 7 255H 2.0 GHz (24MB Cache, up to 5.1 GHz, 16 lõi, 16 luồng)","Cổng giao tiếp":"2 x USB-A (USB 3.2 Gen 1, 5Gbps) 2 x USB-C (USB 3.2 Gen 1, 5Gbps, hỗ trợ Display / Power Delivery) 1 x HDMI 1.4 1 x Jack tai nghe/micro 3,5mm"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 0, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('Dell')
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
  SELECT 'Laptop Dell 15 DC15255 HV1N4 - Đã Kích Hoạt', brand_row.id, category_row.id, 'Mua ngay Laptop Dell 15 DC15255 HV1N4 cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', '{"Loại card đồ họa":"AMD Radeon Graphics","Dung lượng RAM":"16GB","Loại RAM":"DDR4","Số khe ram":"2 khe (2 x 8GB, tối đa 24GB)","Ổ cứng":"1TB SSD","Kích thước màn hình":"15.6 inches","Công nghệ màn hình":"Độ phủ màu 45% NTSC","Pin":"3-cell, 41 Wh","Hệ điều hành":"Windows 11","Độ phân giải màn hình":"1920 x 1080 pixels (FullHD)","Loại CPU":"AMD Ryzen 5 7530U","Cổng giao tiếp":"1 x Khe đọc thẻ SD 1 x USB 2.0 1 x Cổng âm thanh đa năng (Universal Audio) 1 x HDMI 1.4 1 x USB 3.2 Gen 1 1 x USB Type-C","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/laptop-dell-15-dc15255-hv1n4-cu-da-kich-hoat.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/r/group_823_10_1.png', 14890000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Laptop Dell 15 DC15255 HV1N4 - Đã Kích Hoạt' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Laptop Dell 15 DC15255 HV1N4 - Đã Kích Hoạt' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Laptop Dell 15 DC15255 HV1N4 - Đã Kích Hoạt', 'Mua ngay Laptop Dell 15 DC15255 HV1N4 cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', 14890000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/r/group_823_10_1.png', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/r/group_823_10_1.png' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/r/group_823_10_1.png'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-qq340m', '{"Loại card đồ họa":"AMD Radeon Graphics","Dung lượng RAM":"16GB","Loại RAM":"DDR4","Số khe ram":"2 khe (2 x 8GB, tối đa 24GB)","Ổ cứng":"1TB SSD","Kích thước màn hình":"15.6 inches","Công nghệ màn hình":"Độ phủ màu 45% NTSC","Pin":"3-cell, 41 Wh","Hệ điều hành":"Windows 11","Độ phân giải màn hình":"1920 x 1080 pixels (FullHD)","Loại CPU":"AMD Ryzen 5 7530U","Cổng giao tiếp":"1 x Khe đọc thẻ SD 1 x USB 2.0 1 x Cổng âm thanh đa năng (Universal Audio) 1 x HDMI 1.4 1 x USB 3.2 Gen 1 1 x USB Type-C"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 10, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('Dell')
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
  SELECT 'Laptop Dell Gaming G16 7620 - Cũ Trầy Xước', brand_row.id, category_row.id, 'Mua Laptop Dell Gaming G16 7620 cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', '{"Loại card đồ họa":"NVIDIA GeForce RTX 3060 6GB GDDR6 (140W)","Dung lượng RAM":"16GB","Loại RAM":"DDR5 4800Mhz","Ổ cứng":"SSD M.2 NMVe 512GB","Kích thước màn hình":"16 inches","Công nghệ màn hình":"16\" QHD+, 335 nits, 99% sRGB","Pin":"6 cells, 81-Wh","Hệ điều hành":"Windows 11","Loại CPU":"Intel Core i7-12700H 14 nhân, 20 luồng (up to 4.7 GHz, 24MB Cache)","Cổng giao tiếp":"3x USB 3.2 Gen 1 1x USB 3.2 Gen 2 (Type-C) 1x HDMI 1x mạng Ethernet (RJ45) 1x cổng tai nghe 3.5mm 1x cổng sạc","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/laptop-dell-gaming-g16-7620-i7-12700h-512gb-cu-tray-xuoc.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/c/p/cps-32-04_33_.png', 19990000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Laptop Dell Gaming G16 7620 - Cũ Trầy Xước' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Laptop Dell Gaming G16 7620 - Cũ Trầy Xước' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Laptop Dell Gaming G16 7620 - Cũ Trầy Xước', 'Mua Laptop Dell Gaming G16 7620 cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', 19990000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/c/p/cps-32-04_33_.png', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/c/p/cps-32-04_33_.png' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/c/p/cps-32-04_33_.png'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-4iusd4', '{"Loại card đồ họa":"NVIDIA GeForce RTX 3060 6GB GDDR6 (140W)","Dung lượng RAM":"16GB","Loại RAM":"DDR5 4800Mhz","Ổ cứng":"SSD M.2 NMVe 512GB","Kích thước màn hình":"16 inches","Công nghệ màn hình":"16\" QHD+, 335 nits, 99% sRGB","Pin":"6 cells, 81-Wh","Hệ điều hành":"Windows 11","Loại CPU":"Intel Core i7-12700H 14 nhân, 20 luồng (up to 4.7 GHz, 24MB Cache)","Cổng giao tiếp":"3x USB 3.2 Gen 1 1x USB 3.2 Gen 2 (Type-C) 1x HDMI 1x mạng Ethernet (RJ45) 1x cổng tai nghe 3.5mm 1x cổng sạc"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 10, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('Dell')
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
  SELECT 'Laptop Dell Inspiron 15 3511 P112F001 - Cũ Trầy Xước', brand_row.id, category_row.id, 'Mua Laptop Dell Inspiron 15 3511 P112F001 cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', '{"Loại card đồ họa":"Intel Iris Xe Graphics","Dung lượng RAM":"4GB","Loại RAM":"DDR4, 2666MHz","Ổ cứng":"128GB M.2 PCIe NVMe","Kích thước màn hình":"15.6 inches","Hệ điều hành":"Windows 10 Home SL","Độ phân giải màn hình":"1920 x 1080 pixels (FullHD)","Loại CPU":"Intel Core I3-1115G4","Cổng giao tiếp":"1 x USB-A 3.2 Gen 1 2 x USB-A 2.0 1 x SD 1 x HDMI 1 x RJ-45","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/laptop-dell-inspiron-15-3511-p112f001-4gb-cu-tray-xuoc.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/c/p/cps-33-04_28_.png', 5590000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Laptop Dell Inspiron 15 3511 P112F001 - Cũ Trầy Xước' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Laptop Dell Inspiron 15 3511 P112F001 - Cũ Trầy Xước' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Laptop Dell Inspiron 15 3511 P112F001 - Cũ Trầy Xước', 'Mua Laptop Dell Inspiron 15 3511 P112F001 cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', 5590000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/c/p/cps-33-04_28_.png', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/c/p/cps-33-04_28_.png' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/c/p/cps-33-04_28_.png'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-nb162w', '{"Loại card đồ họa":"Intel Iris Xe Graphics","Dung lượng RAM":"4GB","Loại RAM":"DDR4, 2666MHz","Ổ cứng":"128GB M.2 PCIe NVMe","Kích thước màn hình":"15.6 inches","Hệ điều hành":"Windows 10 Home SL","Độ phân giải màn hình":"1920 x 1080 pixels (FullHD)","Loại CPU":"Intel Core I3-1115G4","Cổng giao tiếp":"1 x USB-A 3.2 Gen 1 2 x USB-A 2.0 1 x SD 1 x HDMI 1 x RJ-45"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 10, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('Dell')
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
  SELECT 'Laptop Dell Inspiron 15 3520 6R6NK V2 - Cũ Xước Cấn', brand_row.id, category_row.id, 'Mua ngay Laptop Dell Inspiron 15 3520 6R6NK cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', '{"Loại card đồ họa":"Intel UHD Graphics","Dung lượng RAM":"16GB","Loại RAM":"DDR4","Số khe ram":"2 khe (tối đa 16GB)","Ổ cứng":"512GB PCIE (1 Slot HDD Tối đa 1TB)","Kích thước màn hình":"15.6 inches","Công nghệ màn hình":"Độ sáng 250 nits Độ phủ màu NTSC 45%Màn hình chống chói","Pin":"3-cell, 41 Wh lithium-polymer","Hệ điều hành":"Windows 11 Home","Độ phân giải màn hình":"1920 x 1080 pixels (FullHD)","Loại CPU":"Intel Core i5-1235U (10 lõi / 12 luồng, 1.30 GHz to 4.40 GHz, 12 MB)","Cổng giao tiếp":"1x Đầu nối nguồn 1x HDMI 1.4 2x USB 3.2 Gen 1 1x Khe cắm thẻ SD 1x USB 2.0 1x Cổng tai nghe","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/laptop-dell-inspiron-15-3520-6r6nk-16gb-cu-xuoc-can.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/r/group_659_1__13_2.png', 7890000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Laptop Dell Inspiron 15 3520 6R6NK V2 - Cũ Xước Cấn' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Laptop Dell Inspiron 15 3520 6R6NK V2 - Cũ Xước Cấn' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Laptop Dell Inspiron 15 3520 6R6NK V2 - Cũ Xước Cấn', 'Mua ngay Laptop Dell Inspiron 15 3520 6R6NK cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', 7890000, 'new', 100, 4.8, 0, 0, 'sold_out', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/r/group_659_1__13_2.png', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/r/group_659_1__13_2.png' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/r/group_659_1__13_2.png'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-drceit', '{"Loại card đồ họa":"Intel UHD Graphics","Dung lượng RAM":"16GB","Loại RAM":"DDR4","Số khe ram":"2 khe (tối đa 16GB)","Ổ cứng":"512GB PCIE (1 Slot HDD Tối đa 1TB)","Kích thước màn hình":"15.6 inches","Công nghệ màn hình":"Độ sáng 250 nits Độ phủ màu NTSC 45%Màn hình chống chói","Pin":"3-cell, 41 Wh lithium-polymer","Hệ điều hành":"Windows 11 Home","Độ phân giải màn hình":"1920 x 1080 pixels (FullHD)","Loại CPU":"Intel Core i5-1235U (10 lõi / 12 luồng, 1.30 GHz to 4.40 GHz, 12 MB)","Cổng giao tiếp":"1x Đầu nối nguồn 1x HDMI 1.4 2x USB 3.2 Gen 1 1x Khe cắm thẻ SD 1x USB 2.0 1x Cổng tai nghe"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 0, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('Dell')
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
  SELECT 'Laptop Dell Inspiron 15 3520 P112F007 - Cũ Xước Cấn', brand_row.id, category_row.id, 'Mua ngay Laptop Dell Inspiron 15 3520 P112F007 cũ đẹp giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', '{"Loại card đồ họa":"Intel UHD Graphics","Dung lượng RAM":"16GB","Loại RAM":"DDR4 2666MHz","Ổ cứng":"512GB SSD M.2 PCIe NVMe","Kích thước màn hình":"15.6 inches","Công nghệ màn hình":"Non-Touch, AG, WVA, LED-Backlit, 250 nit, Narrow Border","Pin":"3 Cell, 41 Wh, integrated","Hệ điều hành":"Windows 11 Home SL + Office Home & Student 2021","Độ phân giải màn hình":"1920 x 1080 pixels (FullHD)","Loại CPU":"Intel Core i7 1255U","Cổng giao tiếp":"1 USB 3.2 Gen 1 Type-C® port with DisplayPort 1.4 (on 12th Gen Processor configured with Type-C®)1 USB 3.2 Gen 1 port (on systems configured with Type-C®) 2 USB 3.2 Gen 1 ports (on systems configured with non Type-C®) 1 USB 2.0 port 1 Power Ja","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/laptop-dell-inspiron-15-3520-p112f007-i7-1255u-16gb-cu-xuoc-can.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/c/p/cps-32-04_36_.png', 13190000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Laptop Dell Inspiron 15 3520 P112F007 - Cũ Xước Cấn' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Laptop Dell Inspiron 15 3520 P112F007 - Cũ Xước Cấn' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Laptop Dell Inspiron 15 3520 P112F007 - Cũ Xước Cấn', 'Mua ngay Laptop Dell Inspiron 15 3520 P112F007 cũ đẹp giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', 13190000, 'new', 100, 4.8, 0, 0, 'sold_out', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/c/p/cps-32-04_36_.png', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/c/p/cps-32-04_36_.png' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/c/p/cps-32-04_36_.png'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-1nzg9v', '{"Loại card đồ họa":"Intel UHD Graphics","Dung lượng RAM":"16GB","Loại RAM":"DDR4 2666MHz","Ổ cứng":"512GB SSD M.2 PCIe NVMe","Kích thước màn hình":"15.6 inches","Công nghệ màn hình":"Non-Touch, AG, WVA, LED-Backlit, 250 nit, Narrow Border","Pin":"3 Cell, 41 Wh, integrated","Hệ điều hành":"Windows 11 Home SL + Office Home & Student 2021","Độ phân giải màn hình":"1920 x 1080 pixels (FullHD)","Loại CPU":"Intel Core i7 1255U","Cổng giao tiếp":"1 USB 3.2 Gen 1 Type-C® port with DisplayPort 1.4 (on 12th Gen Processor configured with Type-C®)1 USB 3.2 Gen 1 port (on systems configured with Type-C®) 2 USB 3.2 Gen 1 ports (on systems configured with non Type-C®) 1 USB 2.0 port 1 Power Ja"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 0, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('HP')
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
  SELECT 'Laptop HP 14S DQ2644TU - Cũ Xước Cấn', brand_row.id, category_row.id, 'Mua ngay Laptop HP14S DQ2644TU cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', '{"Loại card đồ họa":"Intel UHD","Dung lượng RAM":"8GB","Số khe ram":"1 khe ram trống (nâng cấp tối đa 16GB)","Ổ cứng":"256 GB M.2 NVMe 1","Kích thước màn hình":"14 inches","Pin":"3 Cell","Hệ điều hành":"Windows 11","Độ phân giải màn hình":"1080 x 1920 pixels (FullHD)","Loại CPU":"Core i3 1115G4","Cổng giao tiếp":"1 HDMI3 USB 3.2 Gen 1","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/laptop-hp-14s-dq2644tu-cu-xuoc-can.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/t/e/text_ng_n_5_32_2.png', 5090000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Laptop HP 14S DQ2644TU - Cũ Xước Cấn' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Laptop HP 14S DQ2644TU - Cũ Xước Cấn' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Laptop HP 14S DQ2644TU - Cũ Xước Cấn', 'Mua ngay Laptop HP14S DQ2644TU cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', 5090000, 'new', 100, 4.8, 0, 0, 'sold_out', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/t/e/text_ng_n_5_32_2.png', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/t/e/text_ng_n_5_32_2.png' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/t/e/text_ng_n_5_32_2.png'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-pxne8s', '{"Loại card đồ họa":"Intel UHD","Dung lượng RAM":"8GB","Số khe ram":"1 khe ram trống (nâng cấp tối đa 16GB)","Ổ cứng":"256 GB M.2 NVMe 1","Kích thước màn hình":"14 inches","Pin":"3 Cell","Hệ điều hành":"Windows 11","Độ phân giải màn hình":"1080 x 1920 pixels (FullHD)","Loại CPU":"Core i3 1115G4","Cổng giao tiếp":"1 HDMI3 USB 3.2 Gen 1"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 0, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('HP')
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
  SELECT 'Laptop HP Elitebook 640 G11 A7LA3PT - Cũ Đẹp', brand_row.id, category_row.id, 'Mua Laptop HP Elitebook 640 G11 A7LA3PT cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', '{"Loại card đồ họa":"Intel UHD Graphics","Dung lượng RAM":"16GB","Loại RAM":"DDR5 5600","Số khe ram":"2 khe ram","Ổ cứng":"512GB SSD M.2 NVMe PCIe 2280","Kích thước màn hình":"14 inches","Công nghệ màn hình":"WUXGA (1920x1200), IPS, narrow bezel, anti-glare, 300 nits, 45% NTSC","Pin":"3 Cell","Hệ điều hành":"Windows 11 Home","Độ phân giải màn hình":"1920 x 1200 pixels (WUXGA)","Loại CPU":"Ultra 7 165U 1.2GHz","Cổng giao tiếp":"2 Thunderbolt™ 4 with USB Type-C® 40Gbps signaling rate (USB Power Delivery, DisplayPort™ 1.4)2 USB Type-A 5Gbps signaling rate (1 charging, 1 power)1 HDMI 2.11 stereo headphone/microphone combo jack1 RJ-45","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/laptop-hp-elitebook-640-g11-a7la3pt-cu-dep.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/l/a/laptop-hp-elitebook-640-g11-a7la3pt_2__2.png', 24190000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Laptop HP Elitebook 640 G11 A7LA3PT - Cũ Đẹp' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Laptop HP Elitebook 640 G11 A7LA3PT - Cũ Đẹp' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Laptop HP Elitebook 640 G11 A7LA3PT - Cũ Đẹp', 'Mua Laptop HP Elitebook 640 G11 A7LA3PT cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', 24190000, 'new', 100, 4.8, 0, 0, 'sold_out', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/l/a/laptop-hp-elitebook-640-g11-a7la3pt_2__2.png', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/l/a/laptop-hp-elitebook-640-g11-a7la3pt_2__2.png' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/l/a/laptop-hp-elitebook-640-g11-a7la3pt_2__2.png'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-pvbtyq', '{"Loại card đồ họa":"Intel UHD Graphics","Dung lượng RAM":"16GB","Loại RAM":"DDR5 5600","Số khe ram":"2 khe ram","Ổ cứng":"512GB SSD M.2 NVMe PCIe 2280","Kích thước màn hình":"14 inches","Công nghệ màn hình":"WUXGA (1920x1200), IPS, narrow bezel, anti-glare, 300 nits, 45% NTSC","Pin":"3 Cell","Hệ điều hành":"Windows 11 Home","Độ phân giải màn hình":"1920 x 1200 pixels (WUXGA)","Loại CPU":"Ultra 7 165U 1.2GHz","Cổng giao tiếp":"2 Thunderbolt™ 4 with USB Type-C® 40Gbps signaling rate (USB Power Delivery, DisplayPort™ 1.4)2 USB Type-A 5Gbps signaling rate (1 charging, 1 power)1 HDMI 2.11 stereo headphone/microphone combo jack1 RJ-45"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 0, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('HP')
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
  SELECT 'Laptop HP Envy 13-BA1535TU 4U6M4PA - Cũ Xước Cấn', brand_row.id, category_row.id, 'Mua Laptop HP Envy 13-BA1535TU 4U6M4PA cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', '{"Loại card đồ họa":"Intel Iris Xe Graphics","Dung lượng RAM":"8GB","Loại RAM":"DDR4 2666 MHz","Ổ cứng":"512GB SSD NVMe PCIe","Kích thước màn hình":"13.3 inches","Công nghệ màn hình":"100% sRGBWled-backlit400 nits","Pin":"3-cell, 51Wh","Hệ điều hành":"Windows 10 Home SL","Độ phân giải màn hình":"1920 x 1080 pixels (FullHD)","Loại CPU":"Intel Core i7 Tiger Lake - 1165G7 4 nhân 8 luồng 2.8GHz","Cổng giao tiếp":"Jack tai nghe 3.5 mmThunderbolt 4 USB-C2x SuperSpeed USB AMicro SD","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/laptop-hp-envy-13-ba1535tu-4u6m4pa-cu-xuoc-can.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/l/a/laptop-hp-envy-13-ba1535tu-4u6m4pa_2_.png', 7490000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Laptop HP Envy 13-BA1535TU 4U6M4PA - Cũ Xước Cấn' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Laptop HP Envy 13-BA1535TU 4U6M4PA - Cũ Xước Cấn' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Laptop HP Envy 13-BA1535TU 4U6M4PA - Cũ Xước Cấn', 'Mua Laptop HP Envy 13-BA1535TU 4U6M4PA cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', 7490000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/l/a/laptop-hp-envy-13-ba1535tu-4u6m4pa_2_.png', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/l/a/laptop-hp-envy-13-ba1535tu-4u6m4pa_2_.png' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/l/a/laptop-hp-envy-13-ba1535tu-4u6m4pa_2_.png'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-hgxkxv', '{"Loại card đồ họa":"Intel Iris Xe Graphics","Dung lượng RAM":"8GB","Loại RAM":"DDR4 2666 MHz","Ổ cứng":"512GB SSD NVMe PCIe","Kích thước màn hình":"13.3 inches","Công nghệ màn hình":"100% sRGBWled-backlit400 nits","Pin":"3-cell, 51Wh","Hệ điều hành":"Windows 10 Home SL","Độ phân giải màn hình":"1920 x 1080 pixels (FullHD)","Loại CPU":"Intel Core i7 Tiger Lake - 1165G7 4 nhân 8 luồng 2.8GHz","Cổng giao tiếp":"Jack tai nghe 3.5 mmThunderbolt 4 USB-C2x SuperSpeed USB AMicro SD"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 10, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('HP')
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
  SELECT 'Laptop HP Pavilion 15-EG2062TX 7C0W7PA - Cũ Đẹp', brand_row.id, category_row.id, 'Mua ngay Laptop HP Pavilion 15-EG2062TX 7C0W7PA cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', '{"Loại card đồ họa":"NVIDIA® GeForce® MX550 2GB GDDR6","Dung lượng RAM":"8GB","Loại RAM":"DDR4 3200MHz","Số khe ram":"2 khe","Ổ cứng":"512GB SSD PCIe® NVMe™ M.2","Kích thước màn hình":"15.6 inches","Công nghệ màn hình":"Display, 15.6 Inch FHD, IPS, 250nits, 45% NTSC, micro-edge BrightView","Pin":"3 Cell 41WHrs","Hệ điều hành":"Windows 11 Home","Độ phân giải màn hình":"1920 x 1080 pixels (FullHD)","Loại CPU":"Intel® Core™ i5-1235U Processor","Cổng giao tiếp":"1 x HDMI 2.01 x Type-C tốc độ truyền dữ liệu 10Gbps2 x Type-A tốc độ truyền dữ liệu 5Gbps1 x headphone/microphone combo","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/laptop-hp-pavilion-15-eg2062tx-7c0w7pa-cu-dep.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/2/_/2_447_2.png', 12590000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Laptop HP Pavilion 15-EG2062TX 7C0W7PA - Cũ Đẹp' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Laptop HP Pavilion 15-EG2062TX 7C0W7PA - Cũ Đẹp' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Laptop HP Pavilion 15-EG2062TX 7C0W7PA - Cũ Đẹp', 'Mua ngay Laptop HP Pavilion 15-EG2062TX 7C0W7PA cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', 12590000, 'new', 100, 4.8, 0, 0, 'sold_out', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/2/_/2_447_2.png', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/2/_/2_447_2.png' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/2/_/2_447_2.png'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-j4pusg', '{"Loại card đồ họa":"NVIDIA® GeForce® MX550 2GB GDDR6","Dung lượng RAM":"8GB","Loại RAM":"DDR4 3200MHz","Số khe ram":"2 khe","Ổ cứng":"512GB SSD PCIe® NVMe™ M.2","Kích thước màn hình":"15.6 inches","Công nghệ màn hình":"Display, 15.6 Inch FHD, IPS, 250nits, 45% NTSC, micro-edge BrightView","Pin":"3 Cell 41WHrs","Hệ điều hành":"Windows 11 Home","Độ phân giải màn hình":"1920 x 1080 pixels (FullHD)","Loại CPU":"Intel® Core™ i5-1235U Processor","Cổng giao tiếp":"1 x HDMI 2.01 x Type-C tốc độ truyền dữ liệu 10Gbps2 x Type-A tốc độ truyền dữ liệu 5Gbps1 x headphone/microphone combo"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 0, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
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
  SELECT 'Laptop Lenovo ideapad 3 15ITL6 - Cũ Xước Cấn', brand_row.id, category_row.id, 'Mua ngay Laptop Lenovo ideapad 3 15ITL6 cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', '{"Loại card đồ họa":"Intel Iris Xe Graphics","Dung lượng RAM":"8GB","Loại RAM":"DDR4","Số khe ram":"Onboard + 1 khe trốngNâng cấp tối đa 16GB","Ổ cứng":"512GB SSD M.21 Khe HDD 2.5\" trống","Kích thước màn hình":"15.6 inches","Pin":"38Wh","Hệ điều hành":"Windows 11 Home","Độ phân giải màn hình":"1080 x 1920 pixels (FullHD)","Loại CPU":"Intel Core i5-1135G7","Cổng giao tiếp":"1x USB 2.01x USB 3.2 Gen 11x USB-C 3.2 Gen 11x HDMI 1.4b1x Card reader1x 3.5mm1x Power connector","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/laptop-lenovo-ideapad-3-15itl6-82h801lmvn-cu-xuoc-can.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/c/d/cdc_1_1_1.jpg', 6590000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Laptop Lenovo ideapad 3 15ITL6 - Cũ Xước Cấn' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Laptop Lenovo ideapad 3 15ITL6 - Cũ Xước Cấn' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Laptop Lenovo ideapad 3 15ITL6 - Cũ Xước Cấn', 'Mua ngay Laptop Lenovo ideapad 3 15ITL6 cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', 6590000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/c/d/cdc_1_1_1.jpg', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/c/d/cdc_1_1_1.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/c/d/cdc_1_1_1.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-tgz2cj', '{"Loại card đồ họa":"Intel Iris Xe Graphics","Dung lượng RAM":"8GB","Loại RAM":"DDR4","Số khe ram":"Onboard + 1 khe trốngNâng cấp tối đa 16GB","Ổ cứng":"512GB SSD M.21 Khe HDD 2.5\" trống","Kích thước màn hình":"15.6 inches","Pin":"38Wh","Hệ điều hành":"Windows 11 Home","Độ phân giải màn hình":"1080 x 1920 pixels (FullHD)","Loại CPU":"Intel Core i5-1135G7","Cổng giao tiếp":"1x USB 2.01x USB 3.2 Gen 11x USB-C 3.2 Gen 11x HDMI 1.4b1x Card reader1x 3.5mm1x Power connector"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 10, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
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
  SELECT 'Laptop Lenovo Ideapad Slim 5 16IAH8 83BG004EVN - Cũ Trầy Xước', brand_row.id, category_row.id, 'Mua ngay Laptop Lenovo Ideapad Slim 5 16IAH8 83BG004EVN cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', '{"Loại card đồ họa":"Intel UHD Graphics","Dung lượng RAM":"16GB","Loại RAM":"LPDDR5-4800 Onboard","Ổ cứng":"1TB SSD M.2 2242 PCIe 4.0x4 NVMe","Kích thước màn hình":"16 inches","Công nghệ màn hình":"Độ sáng 300nitsMàn hình chống chóiĐộ phủ màu 45% NTSCTÜV Low Blue Light","Pin":"56.6Wh","Hệ điều hành":"Windows 11 Home Single Language","Độ phân giải màn hình":"1920 x 1200 pixels (WUXGA)","Loại CPU":"Intel Core i5-12450H (8 lõi (4P + 4E) / 12 luồng, P-core 2.0 / 4.4GHz, E-core 1.5 / 3.3GHz, 12MB)","Cổng giao tiếp":"1x HDMI 1.4b1x Headphone / microphone combo jack (3.5mm)1x USB 3.2 Gen 11x USB 3.2 Gen 1 (Always On)1x Đầu đọc thẻ microSD2x USB-C 3.2 Gen 1 (Truyền dữ liệu, Power Delivery 3.0 và DisplayPort 1.4)","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/laptop-lenovo-ideapad-slim-5-16iah8-83bg004evn-cu-tray-xuoc.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/t/e/text_ng_n_9__3_9_2.png', 11290000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Laptop Lenovo Ideapad Slim 5 16IAH8 83BG004EVN - Cũ Trầy Xước' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Laptop Lenovo Ideapad Slim 5 16IAH8 83BG004EVN - Cũ Trầy Xước' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Laptop Lenovo Ideapad Slim 5 16IAH8 83BG004EVN - Cũ Trầy Xước', 'Mua ngay Laptop Lenovo Ideapad Slim 5 16IAH8 83BG004EVN cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', 11290000, 'new', 100, 4.8, 0, 0, 'sold_out', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/t/e/text_ng_n_9__3_9_2.png', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/t/e/text_ng_n_9__3_9_2.png' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/t/e/text_ng_n_9__3_9_2.png'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-tq991y', '{"Loại card đồ họa":"Intel UHD Graphics","Dung lượng RAM":"16GB","Loại RAM":"LPDDR5-4800 Onboard","Ổ cứng":"1TB SSD M.2 2242 PCIe 4.0x4 NVMe","Kích thước màn hình":"16 inches","Công nghệ màn hình":"Độ sáng 300nitsMàn hình chống chóiĐộ phủ màu 45% NTSCTÜV Low Blue Light","Pin":"56.6Wh","Hệ điều hành":"Windows 11 Home Single Language","Độ phân giải màn hình":"1920 x 1200 pixels (WUXGA)","Loại CPU":"Intel Core i5-12450H (8 lõi (4P + 4E) / 12 luồng, P-core 2.0 / 4.4GHz, E-core 1.5 / 3.3GHz, 12MB)","Cổng giao tiếp":"1x HDMI 1.4b1x Headphone / microphone combo jack (3.5mm)1x USB 3.2 Gen 11x USB 3.2 Gen 1 (Always On)1x Đầu đọc thẻ microSD2x USB-C 3.2 Gen 1 (Truyền dữ liệu, Power Delivery 3.0 và DisplayPort 1.4)"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 0, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
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
  SELECT 'Laptop Lenovo V15 G4 IRU 83A100URVN - Cũ Trầy Xước', brand_row.id, category_row.id, 'Mua Laptop Lenovo V15 G4 IRU 83A100URVN cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', '{"Loại card đồ họa":"Integrated Intel® UHD Graphics","Dung lượng RAM":"8GB","Loại RAM":"DDR4 3200 MHz","Số khe ram":"2 khe, hỗ trợ nâng cấp tối đa 16GB","Ổ cứng":"512GB SSD M.2 2242 PCIe® 4.0x4 NVMe","Kích thước màn hình":"15.6 inches","Công nghệ màn hình":"15.6\" FHD (1920x1080) IPS 300nits Anti-glare, 45% NTSC","Pin":"2-cell","Hệ điều hành":"Non OS","Độ phân giải màn hình":"1920 x 1080 pixels (FullHD)","Loại CPU":"Intel Core i5-13420H, 8C/ 12T, P-core 2.1 / 4.6GHz, E-core 1.5 / 3.4GHz, 12MB","Cổng giao tiếp":"1x USB 2.01x USB 3.2 Gen 11x USB-C® 3.2 Gen 1 (support data transfer, Power Delivery (20V only) and DisplayPort™ 1.2)1x HDMI® 1.4b1x Headphone / microphone combo jack (3.5mm)1x Ethernet (RJ-45)1x Power connector","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/laptop-lenovo-v15-g4-iru-83a100urvn-cu-tray-xuoc.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/l/a/laptop-lenovo-v15-g4-iru-83a100urvn_2__1_2.png', 8890000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Laptop Lenovo V15 G4 IRU 83A100URVN - Cũ Trầy Xước' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Laptop Lenovo V15 G4 IRU 83A100URVN - Cũ Trầy Xước' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Laptop Lenovo V15 G4 IRU 83A100URVN - Cũ Trầy Xước', 'Mua Laptop Lenovo V15 G4 IRU 83A100URVN cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', 8890000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/l/a/laptop-lenovo-v15-g4-iru-83a100urvn_2__1_2.png', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/l/a/laptop-lenovo-v15-g4-iru-83a100urvn_2__1_2.png' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/l/a/laptop-lenovo-v15-g4-iru-83a100urvn_2__1_2.png'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-pb6gc', '{"Loại card đồ họa":"Integrated Intel® UHD Graphics","Dung lượng RAM":"8GB","Loại RAM":"DDR4 3200 MHz","Số khe ram":"2 khe, hỗ trợ nâng cấp tối đa 16GB","Ổ cứng":"512GB SSD M.2 2242 PCIe® 4.0x4 NVMe","Kích thước màn hình":"15.6 inches","Công nghệ màn hình":"15.6\" FHD (1920x1080) IPS 300nits Anti-glare, 45% NTSC","Pin":"2-cell","Hệ điều hành":"Non OS","Độ phân giải màn hình":"1920 x 1080 pixels (FullHD)","Loại CPU":"Intel Core i5-13420H, 8C/ 12T, P-core 2.1 / 4.6GHz, E-core 1.5 / 3.4GHz, 12MB","Cổng giao tiếp":"1x USB 2.01x USB 3.2 Gen 11x USB-C® 3.2 Gen 1 (support data transfer, Power Delivery (20V only) and DisplayPort™ 1.2)1x HDMI® 1.4b1x Headphone / microphone combo jack (3.5mm)1x Ethernet (RJ-45)1x Power connector"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 10, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
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
  SELECT 'Laptop MSI Gaming GF63 Thin 11UC-1230VN - Cũ Xước Cấn', brand_row.id, category_row.id, 'Mua ngay Laptop MSI Gaming GF63 Thin 11UC-1230VN cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', '{"Loại card đồ họa":"NVIDIA GeForce RTX 3050, 4GB GDDR6","Dung lượng RAM":"8GB","Loại RAM":"DDR4-3200","Số khe ram":"2 khe","Ổ cứng":"512GB PCIE","Kích thước màn hình":"15.6 inches","Công nghệ màn hình":"Tần số quét 144Hz","Pin":"3-Cell 52.4 (Whr)","Hệ điều hành":"Windows 11","Độ phân giải màn hình":"1920 x 1080 pixels (FullHD)","Loại CPU":"Intel Core i5-11400H","Cổng giao tiếp":"1x Type-C USB3.2 Gen1 3x Type-A USB3.2 Gen1 1x (4K @ 30Hz) HDMI 1x RJ45 1x Mic-in 1x Headphone-out","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/laptop-msi-gaming-gf63-thin-11uc-1230vn-cu-xuoc-can.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/t/e/text_ng_n_15__13_2_1.png', 9490000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Laptop MSI Gaming GF63 Thin 11UC-1230VN - Cũ Xước Cấn' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Laptop MSI Gaming GF63 Thin 11UC-1230VN - Cũ Xước Cấn' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Laptop MSI Gaming GF63 Thin 11UC-1230VN - Cũ Xước Cấn', 'Mua ngay Laptop MSI Gaming GF63 Thin 11UC-1230VN cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', 9490000, 'new', 100, 4.8, 0, 0, 'sold_out', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/t/e/text_ng_n_15__13_2_1.png', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/t/e/text_ng_n_15__13_2_1.png' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/t/e/text_ng_n_15__13_2_1.png'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-99kmns', '{"Loại card đồ họa":"NVIDIA GeForce RTX 3050, 4GB GDDR6","Dung lượng RAM":"8GB","Loại RAM":"DDR4-3200","Số khe ram":"2 khe","Ổ cứng":"512GB PCIE","Kích thước màn hình":"15.6 inches","Công nghệ màn hình":"Tần số quét 144Hz","Pin":"3-Cell 52.4 (Whr)","Hệ điều hành":"Windows 11","Độ phân giải màn hình":"1920 x 1080 pixels (FullHD)","Loại CPU":"Intel Core i5-11400H","Cổng giao tiếp":"1x Type-C USB3.2 Gen1 3x Type-A USB3.2 Gen1 1x (4K @ 30Hz) HDMI 1x RJ45 1x Mic-in 1x Headphone-out"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 0, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
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
  SELECT 'Laptop MSI Gaming GF63 THIN 12UC-1006VN - Cũ Xước Cấn', brand_row.id, category_row.id, 'Mau ngay Laptop MSI Gaming GF63 THIN 12UC-1006VN cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', '{"Loại card đồ họa":"NVIDIA GeForce RTX 3050 4 GB GDDR6Intel UHD Graphics","Dung lượng RAM":"16GB","Loại RAM":"DDR4 3200 MHz","Số khe ram":"2 khe (1 khe đã cắm, dư 1 khe hỗ trợ tối đa 64GB)","Ổ cứng":"512GB SSD NVMe PCIe","Kích thước màn hình":"15.6 inches","Công nghệ màn hình":"Độ sáng 250 nits Độ phủ màu 45% NTSC Tỷ lệ màn hình 16:09","Pin":"3 Cell, Lithium-ion, 120 W","Hệ điều hành":"Windows 11 Home Single Language","Độ phân giải màn hình":"1920 x 1080 pixels (FullHD)","Loại CPU":"Intel Core i5-12450H (2 GHz, up to 4.4 GHz, 8 lõi / 12 luồng)","Cổng giao tiếp":"1x HDMI 1x Jack 3.5 mm 1x RJ45 Gigabit Ethernet 1x Type C 3x USB 3.2 Gen 1 Type-A","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/laptop-msi-gaming-gf63-thin-12uc-1006vn-cu-xuoc-can.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/r/group_509_29__2.png', 11190000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Laptop MSI Gaming GF63 THIN 12UC-1006VN - Cũ Xước Cấn' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Laptop MSI Gaming GF63 THIN 12UC-1006VN - Cũ Xước Cấn' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Laptop MSI Gaming GF63 THIN 12UC-1006VN - Cũ Xước Cấn', 'Mau ngay Laptop MSI Gaming GF63 THIN 12UC-1006VN cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', 11190000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/r/group_509_29__2.png', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/r/group_509_29__2.png' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/r/group_509_29__2.png'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-ti4jke', '{"Loại card đồ họa":"NVIDIA GeForce RTX 3050 4 GB GDDR6Intel UHD Graphics","Dung lượng RAM":"16GB","Loại RAM":"DDR4 3200 MHz","Số khe ram":"2 khe (1 khe đã cắm, dư 1 khe hỗ trợ tối đa 64GB)","Ổ cứng":"512GB SSD NVMe PCIe","Kích thước màn hình":"15.6 inches","Công nghệ màn hình":"Độ sáng 250 nits Độ phủ màu 45% NTSC Tỷ lệ màn hình 16:09","Pin":"3 Cell, Lithium-ion, 120 W","Hệ điều hành":"Windows 11 Home Single Language","Độ phân giải màn hình":"1920 x 1080 pixels (FullHD)","Loại CPU":"Intel Core i5-12450H (2 GHz, up to 4.4 GHz, 8 lõi / 12 luồng)","Cổng giao tiếp":"1x HDMI 1x Jack 3.5 mm 1x RJ45 Gigabit Ethernet 1x Type C 3x USB 3.2 Gen 1 Type-A"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 10, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
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
  SELECT 'Laptop MSI Modern 14 C7M-212VN - Cũ Xước Cấn', brand_row.id, category_row.id, 'Mua ngay Laptop MSI Modern 14 C7M-212VN cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', '{"Loại card đồ họa":"AMD Radeon Graphics","Dung lượng RAM":"16GB","Số khe ram":"1 thanh RAM","Ổ cứng":"512GB NVMe PCIe Gen 3x4 SSD","Kích thước màn hình":"14 inches","Công nghệ màn hình":"Độ phủ màu 45% NTSC và 65% sRGB","Pin":"39Wh 3 Cell","Hệ điều hành":"Windows 11 Home","Độ phân giải màn hình":"1920 x 1080 pixels (FullHD)","Loại CPU":"AMD Ryzen 5-7530U (up to 4.5 GHz, 6 lõi / 12 luồng, 16 MB)","Cổng giao tiếp":"1 x Type-C USB3.2 Gen2 1 x Type-A USB3.2 Gen2 2 x Type-A USB2.0 1 x HDMI 1 x Jack cắm tai nghe 1 x MicroSD Reader","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/laptop-msi-modern-14-c7m-212vn-cu-xuoc-can.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/t/e/text_ng_n_-_2023-06-19t181236.684_3.png', 7190000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Laptop MSI Modern 14 C7M-212VN - Cũ Xước Cấn' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Laptop MSI Modern 14 C7M-212VN - Cũ Xước Cấn' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Laptop MSI Modern 14 C7M-212VN - Cũ Xước Cấn', 'Mua ngay Laptop MSI Modern 14 C7M-212VN cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', 7190000, 'new', 100, 4.8, 0, 0, 'sold_out', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/t/e/text_ng_n_-_2023-06-19t181236.684_3.png', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/t/e/text_ng_n_-_2023-06-19t181236.684_3.png' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/t/e/text_ng_n_-_2023-06-19t181236.684_3.png'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-u4wzif', '{"Loại card đồ họa":"AMD Radeon Graphics","Dung lượng RAM":"16GB","Số khe ram":"1 thanh RAM","Ổ cứng":"512GB NVMe PCIe Gen 3x4 SSD","Kích thước màn hình":"14 inches","Công nghệ màn hình":"Độ phủ màu 45% NTSC và 65% sRGB","Pin":"39Wh 3 Cell","Hệ điều hành":"Windows 11 Home","Độ phân giải màn hình":"1920 x 1080 pixels (FullHD)","Loại CPU":"AMD Ryzen 5-7530U (up to 4.5 GHz, 6 lõi / 12 luồng, 16 MB)","Cổng giao tiếp":"1 x Type-C USB3.2 Gen2 1 x Type-A USB3.2 Gen2 2 x Type-A USB2.0 1 x HDMI 1 x Jack cắm tai nghe 1 x MicroSD Reader"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 0, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('Samsung')
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
  SELECT 'Laptop Samsung Galaxy Chromebook Go XE310XDA-KA1VN - Cũ Xước Cấn', brand_row.id, category_row.id, 'Mua ngay Laptop Samsung Galaxy Chromebook Go XE310XDA-KA1VN cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', '{"Loại card đồ họa":"Intel UHD Graphics","Dung lượng RAM":"4GB","Loại RAM":"LPDDR4x","Số khe ram":"Onboard không hỗ trợ nâng cấp","Ổ cứng":"32 GB e.MMC","Kích thước màn hình":"11.6 inches","Công nghệ màn hình":"Màn hình chống chói","Pin":"40.2 Wh (Giá trị điển hình)","Hệ điều hành":"Windows 11 Pro","Độ phân giải màn hình":"1366 x 768 pixels","Loại CPU":"Intel Celeron N4500 (1.10 Ghz, tốc độ tối đa 2.80 Ghz 4 MB L3 Cache)","Cổng giao tiếp":"1x USB Type-C 1x USB 3.2 1x jack tai nghe/mic 3.5mm 1x khe đọc thẻ MicroSD","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/laptop-samsung-galaxy-chromebook-go-xe310xda-ka1vn-cu-xuoc-can.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/r/group_882_1__1_3.png', 4090000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Laptop Samsung Galaxy Chromebook Go XE310XDA-KA1VN - Cũ Xước Cấn' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Laptop Samsung Galaxy Chromebook Go XE310XDA-KA1VN - Cũ Xước Cấn' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Laptop Samsung Galaxy Chromebook Go XE310XDA-KA1VN - Cũ Xước Cấn', 'Mua ngay Laptop Samsung Galaxy Chromebook Go XE310XDA-KA1VN cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', 4090000, 'new', 100, 4.8, 0, 0, 'sold_out', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/r/group_882_1__1_3.png', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/r/group_882_1__1_3.png' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/r/group_882_1__1_3.png'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-typblp', '{"Loại card đồ họa":"Intel UHD Graphics","Dung lượng RAM":"4GB","Loại RAM":"LPDDR4x","Số khe ram":"Onboard không hỗ trợ nâng cấp","Ổ cứng":"32 GB e.MMC","Kích thước màn hình":"11.6 inches","Công nghệ màn hình":"Màn hình chống chói","Pin":"40.2 Wh (Giá trị điển hình)","Hệ điều hành":"Windows 11 Pro","Độ phân giải màn hình":"1366 x 768 pixels","Loại CPU":"Intel Celeron N4500 (1.10 Ghz, tốc độ tối đa 2.80 Ghz 4 MB L3 Cache)","Cổng giao tiếp":"1x USB Type-C 1x USB 3.2 1x jack tai nghe/mic 3.5mm 1x khe đọc thẻ MicroSD"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 0, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('CellphoneS')
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
  SELECT 'Laptop Vaio FE 14 VWNC51427-RG - Cũ Xước Cấn', brand_row.id, category_row.id, 'Mua ngay Laptop Vaio FE 14 VWNC51427-RG giá rẻ cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', '{"Loại card đồ họa":"Intel Iris Xe Graphics","Dung lượng RAM":"8GB","Loại RAM":"DDR4","Ổ cứng":"512 GB","Kích thước màn hình":"14.1 inches","Pin":"55 Wh","Hệ điều hành":"Windows 11 Home","Độ phân giải màn hình":"1920 x 1080 pixels (FullHD)","Loại CPU":"Intel Core i5 - 1235U Gen 12 (up to 4.4 GHz, 12 MB)","Cổng giao tiếp":"1x RJ45 (Gigabit) 1x HDMI 2x USB Type-A (USB 3.1 / USB 3.2 Gen 1) 1x USB Type-A (USB 2.0) 1 x USB-C (Không xác định)","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/laptop-vaio-fe-14-vwnc51427-rg-cu-xuoc-can.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/t/e/text_ng_n_14__1_60_2_2.png', 7690000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Laptop Vaio FE 14 VWNC51427-RG - Cũ Xước Cấn' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Laptop Vaio FE 14 VWNC51427-RG - Cũ Xước Cấn' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Laptop Vaio FE 14 VWNC51427-RG - Cũ Xước Cấn', 'Mua ngay Laptop Vaio FE 14 VWNC51427-RG giá rẻ cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', 7690000, 'new', 100, 4.8, 0, 0, 'sold_out', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/t/e/text_ng_n_14__1_60_2_2.png', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/t/e/text_ng_n_14__1_60_2_2.png' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/t/e/text_ng_n_14__1_60_2_2.png'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-2bz58b', '{"Loại card đồ họa":"Intel Iris Xe Graphics","Dung lượng RAM":"8GB","Loại RAM":"DDR4","Ổ cứng":"512 GB","Kích thước màn hình":"14.1 inches","Pin":"55 Wh","Hệ điều hành":"Windows 11 Home","Độ phân giải màn hình":"1920 x 1080 pixels (FullHD)","Loại CPU":"Intel Core i5 - 1235U Gen 12 (up to 4.4 GHz, 12 MB)","Cổng giao tiếp":"1x RJ45 (Gigabit) 1x HDMI 2x USB Type-A (USB 3.1 / USB 3.2 Gen 1) 1x USB Type-A (USB 2.0) 1 x USB-C (Không xác định)"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 0, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('Apple')
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
  SELECT 'MacBook Neo 13 inch A18 Pro 2026 6CPU 5GPU 8GB 256GB - Cũ Xước Cấn', brand_row.id, category_row.id, 'Mua ngay MacBook Neo 13 inch A18 Pro 2026 6CPU 5GPU 8GB 256GB cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', '{"Loại card đồ họa":"GPU 5 lõi Công nghệ dò tia tốc độ cao bằng phần cứng Neural Engine 16 lõi Băng thông bộ nhớ 60GB/s","Dung lượng RAM":"8GB","Ổ cứng":"256GB","Kích thước màn hình":"13 inches","Công nghệ màn hình":"Màn hình Liquid Retina Màn hình có đèn nền LED Mật độ 219 pixel mỗi inch Độ sáng 500 nit Hỗ trợ 1 tỷ màu Màu sRGBHỗ trợ một màn hình ngoài có độ phân giải gốc lên đến 4K ở tần số 60Hz","Pin":"Thời gian xem video trực tuyến lên đến 16 giờ Thời gian duyệt web trên mạng không dây lên đến 11 giờ Pin lithium-ion 36.5 watt‑giờ tích hợp","Hệ điều hành":"macOS","Độ phân giải màn hình":"2408 x 1506 pixels","Loại CPU":"Chip Apple A18 Pro CPU 6 lõi với 2 lõi hiệu năng và 4 lõi tiết kiệm điện","Cổng giao tiếp":"Một cổng USB 3 (USB-C) hỗ trợ: Sạc / DisplayPort / USB 3 (lên đến 10Gb/s) Một cổng USB 2 (USB-C) hỗ trợ: Sạc / USB 2 (lên đến 480Mb/s) Jack cắm tai nghe 3,5 mm","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/macbook-neo-13-a18-pro-6-cpu-5-gpu-8gb-256gb-cu-xuoc-can.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/m/a/macbook_13_19_2.png', 12290000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'MacBook Neo 13 inch A18 Pro 2026 6CPU 5GPU 8GB 256GB - Cũ Xước Cấn' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'MacBook Neo 13 inch A18 Pro 2026 6CPU 5GPU 8GB 256GB - Cũ Xước Cấn' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'MacBook Neo 13 inch A18 Pro 2026 6CPU 5GPU 8GB 256GB - Cũ Xước Cấn', 'Mua ngay MacBook Neo 13 inch A18 Pro 2026 6CPU 5GPU 8GB 256GB cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', 12290000, 'new', 100, 4.8, 0, 0, 'sold_out', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/m/a/macbook_13_19_2.png', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/m/a/macbook_13_19_2.png' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/m/a/macbook_13_19_2.png'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-5kjlbg', '{"Loại card đồ họa":"GPU 5 lõi Công nghệ dò tia tốc độ cao bằng phần cứng Neural Engine 16 lõi Băng thông bộ nhớ 60GB/s","Dung lượng RAM":"8GB","Ổ cứng":"256GB","Kích thước màn hình":"13 inches","Công nghệ màn hình":"Màn hình Liquid Retina Màn hình có đèn nền LED Mật độ 219 pixel mỗi inch Độ sáng 500 nit Hỗ trợ 1 tỷ màu Màu sRGBHỗ trợ một màn hình ngoài có độ phân giải gốc lên đến 4K ở tần số 60Hz","Pin":"Thời gian xem video trực tuyến lên đến 16 giờ Thời gian duyệt web trên mạng không dây lên đến 11 giờ Pin lithium-ion 36.5 watt‑giờ tích hợp","Hệ điều hành":"macOS","Độ phân giải màn hình":"2408 x 1506 pixels","Loại CPU":"Chip Apple A18 Pro CPU 6 lõi với 2 lõi hiệu năng và 4 lõi tiết kiệm điện","Cổng giao tiếp":"Một cổng USB 3 (USB-C) hỗ trợ: Sạc / DisplayPort / USB 3 (lên đến 10Gb/s) Một cổng USB 2 (USB-C) hỗ trợ: Sạc / USB 2 (lên đến 480Mb/s) Jack cắm tai nghe 3,5 mm"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 0, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('Apple')
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
  SELECT 'Apple Macbook Pro 13 Touch Bar 1TB 2016 - Cũ Đẹp', brand_row.id, category_row.id, 'Mua Apple Macbook Pro 13 Touch Bar 1TB 2016 cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', '{"Loại card đồ họa":"Intel Iris Plus Graphics 655","Ổ cứng":"1TB","Kích thước màn hình":"13.3 inches","Công nghệ màn hình":"Retina (2560 x 1600), Tấm nền IPS, LED Backlit","Pin":"Lithium- polymer","Hệ điều hành":"MacOS","Độ phân giải màn hình":"2560 x 1600 pixels (2K)","Loại CPU":"Intel Core i5 2.4GHz quad-core","Cổng giao tiếp":"4 x Thunderbolt 3 (USB-C)","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/macbook-pro-13-touch-bar-1tb-2016-cu-dep.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/o/k/okkk_4.jpg', 10990000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Apple Macbook Pro 13 Touch Bar 1TB 2016 - Cũ Đẹp' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Apple Macbook Pro 13 Touch Bar 1TB 2016 - Cũ Đẹp' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Apple Macbook Pro 13 Touch Bar 1TB 2016 - Cũ Đẹp', 'Mua Apple Macbook Pro 13 Touch Bar 1TB 2016 cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', 10990000, 'new', 100, 4.8, 0, 0, 'sold_out', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/o/k/okkk_4.jpg', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/o/k/okkk_4.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/o/k/okkk_4.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-ena3bf', '{"Loại card đồ họa":"Intel Iris Plus Graphics 655","Ổ cứng":"1TB","Kích thước màn hình":"13.3 inches","Công nghệ màn hình":"Retina (2560 x 1600), Tấm nền IPS, LED Backlit","Pin":"Lithium- polymer","Hệ điều hành":"MacOS","Độ phân giải màn hình":"2560 x 1600 pixels (2K)","Loại CPU":"Intel Core i5 2.4GHz quad-core","Cổng giao tiếp":"4 x Thunderbolt 3 (USB-C)"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 0, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('Apple')
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
  SELECT 'MacBook Pro 14 M3 8GB - 1TB - Cũ Trầy Xước', brand_row.id, category_row.id, 'Mua ngay Macbook Pro M3 14 inch phiên bản 8GB - 1TB cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', '{"Loại card đồ họa":"10 nhânNeural Engine 16 nhân","Dung lượng RAM":"8GB","Ổ cứng":"1TB","Kích thước màn hình":"14.2 inches","Công nghệ màn hình":"Độ sáng XDR: 1000 nit liên tục ở chế độ toàn màn hìnhĐộ sáng đỉnh 1600 nit (chỉ nội dung HDR)True ToneProMotion","Pin":"70Wh","Độ phân giải màn hình":"3024 x 1964 pixels","Loại CPU":"Apple M3 8 nhân","Cổng giao tiếp":"Hai cổng Thunderbolt / USB 4 (USB-C)Ba cổng Thunderbolt 4 (USB-C)Cổng HDMI Cổng HDMIKhe thẻ nhớ SDXCJack 3.5mm","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/macbook-pro-14-inch-m3-2023-8gb-1tb-cu-tray-xuoc.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/r/group_560_5__2.png', 25590000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'MacBook Pro 14 M3 8GB - 1TB - Cũ Trầy Xước' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'MacBook Pro 14 M3 8GB - 1TB - Cũ Trầy Xước' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'MacBook Pro 14 M3 8GB - 1TB - Cũ Trầy Xước', 'Mua ngay Macbook Pro M3 14 inch phiên bản 8GB - 1TB cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', 25590000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/r/group_560_5__2.png', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/r/group_560_5__2.png' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/r/group_560_5__2.png'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-pfqzp9', '{"Loại card đồ họa":"10 nhânNeural Engine 16 nhân","Dung lượng RAM":"8GB","Ổ cứng":"1TB","Kích thước màn hình":"14.2 inches","Công nghệ màn hình":"Độ sáng XDR: 1000 nit liên tục ở chế độ toàn màn hìnhĐộ sáng đỉnh 1600 nit (chỉ nội dung HDR)True ToneProMotion","Pin":"70Wh","Độ phân giải màn hình":"3024 x 1964 pixels","Loại CPU":"Apple M3 8 nhân","Cổng giao tiếp":"Hai cổng Thunderbolt / USB 4 (USB-C)Ba cổng Thunderbolt 4 (USB-C)Cổng HDMI Cổng HDMIKhe thẻ nhớ SDXCJack 3.5mm"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 10, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('Apple')
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
  SELECT 'MacBook Pro 14 M4 10CPU 10GPU 24GB 1TB Nano Sạc 70W - Cũ Trầy Xước', brand_row.id, category_row.id, 'Mua ngay MacBook Pro 14 M4 10CPU 10GPU 24GB 512GB Nano Sạc 70W cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', '{"Loại card đồ họa":"10 lõiNeural Engine 16 lõi","Dung lượng RAM":"24GB","Ổ cứng":"1TB","Kích thước màn hình":"14.2 inches","Công nghệ màn hình":"Màn hình Nano-textureMàn hình Liquid Retina XDR XDR (Extreme Dynamic Range) Độ sáng XDR: 1.000 nit ở chế độ toàn màn hình, độ sáng đỉnh 1.600 nit (chỉ nội dung HDR) 1 tỷ màu Dải màu rộng (P3) Công nghệ True Tone","Pin":"Pin Li-Po 72.4 watt-giờ Thời gian xem video trực tuyến lên đến 24 giờ Thời gian duyệt web trên mạng không dây lên đến 16 giờ","Hệ điều hành":"macOS","Độ phân giải màn hình":"3024 x 1964 pixels","Loại CPU":"Apple M4 10 lõi với 4 lõi hiệu năng và 6 lõi tiết kiệm điện","Cổng giao tiếp":"Khe thẻ nhớ SDXC Cổng HDMI Jack cắm tai nghe 3.5 mm Cổng MagSafe 3 Ba cổng Thunderbolt 4 (USB‑C) hỗ trợ: Sạc, DisplayPort, Thunderbolt 4 (lên đến 40Gb/s), USB 4 (lên đến 40Gb/s)","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/macbook-pro-m4-14-inch-10cpu-10gpu-24gb-1tb-nano-sac-70w-cu-tray-xuoc.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/c/p/cps-33-04_10_.png', 36690000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'MacBook Pro 14 M4 10CPU 10GPU 24GB 1TB Nano Sạc 70W - Cũ Trầy Xước' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'MacBook Pro 14 M4 10CPU 10GPU 24GB 1TB Nano Sạc 70W - Cũ Trầy Xước' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'MacBook Pro 14 M4 10CPU 10GPU 24GB 1TB Nano Sạc 70W - Cũ Trầy Xước', 'Mua ngay MacBook Pro 14 M4 10CPU 10GPU 24GB 512GB Nano Sạc 70W cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', 36690000, 'new', 100, 4.8, 0, 0, 'sold_out', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/c/p/cps-33-04_10_.png', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/c/p/cps-33-04_10_.png' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/c/p/cps-33-04_10_.png'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-bjt79u', '{"Loại card đồ họa":"10 lõiNeural Engine 16 lõi","Dung lượng RAM":"24GB","Ổ cứng":"1TB","Kích thước màn hình":"14.2 inches","Công nghệ màn hình":"Màn hình Nano-textureMàn hình Liquid Retina XDR XDR (Extreme Dynamic Range) Độ sáng XDR: 1.000 nit ở chế độ toàn màn hình, độ sáng đỉnh 1.600 nit (chỉ nội dung HDR) 1 tỷ màu Dải màu rộng (P3) Công nghệ True Tone","Pin":"Pin Li-Po 72.4 watt-giờ Thời gian xem video trực tuyến lên đến 24 giờ Thời gian duyệt web trên mạng không dây lên đến 16 giờ","Hệ điều hành":"macOS","Độ phân giải màn hình":"3024 x 1964 pixels","Loại CPU":"Apple M4 10 lõi với 4 lõi hiệu năng và 6 lõi tiết kiệm điện","Cổng giao tiếp":"Khe thẻ nhớ SDXC Cổng HDMI Jack cắm tai nghe 3.5 mm Cổng MagSafe 3 Ba cổng Thunderbolt 4 (USB‑C) hỗ trợ: Sạc, DisplayPort, Thunderbolt 4 (lên đến 40Gb/s), USB 4 (lên đến 40Gb/s)"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 0, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('Apple')
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
  SELECT 'MacBook Pro 14 M4 10CPU 10GPU 24GB 512GB Nano Sạc 70W - Cũ Trầy Xước', brand_row.id, category_row.id, 'Mua ngay MacBook Pro 14 M4 10CPU 10GPU 24GB 512GB Nano Sạc 70W cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', '{"Loại card đồ họa":"10 lõiNeural Engine 16 lõi","Dung lượng RAM":"24GB","Ổ cứng":"512GB","Kích thước màn hình":"14.2 inches","Công nghệ màn hình":"Màn hình Nano-textureMàn hình Liquid Retina XDR XDR (Extreme Dynamic Range) Độ sáng XDR: 1.000 nit ở chế độ toàn màn hình, độ sáng đỉnh 1.600 nit (chỉ nội dung HDR) 1 tỷ màu Dải màu rộng (P3) Công nghệ True Tone","Pin":"Pin Li-Po 72.4 watt-giờ Thời gian xem video trực tuyến lên đến 24 giờ Thời gian duyệt web trên mạng không dây lên đến 16 giờ","Hệ điều hành":"macOS","Độ phân giải màn hình":"3024 x 1964 pixels","Loại CPU":"Apple M4 10 lõi với 4 lõi hiệu năng và 6 lõi tiết kiệm điện","Cổng giao tiếp":"Khe thẻ nhớ SDXC Cổng HDMI Jack cắm tai nghe 3.5 mm Cổng MagSafe 3 Ba cổng Thunderbolt 4 (USB‑C) hỗ trợ: Sạc, DisplayPort, Thunderbolt 4 (lên đến 40Gb/s), USB 4 (lên đến 40Gb/s)","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/macbook-pro-m4-14-inch-10cpu-10gpu-24gb-512gb-nano-sac-70w-cu-tray-xuoc.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/m/a/macbook_1__2_10_2.png', 34690000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'MacBook Pro 14 M4 10CPU 10GPU 24GB 512GB Nano Sạc 70W - Cũ Trầy Xước' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'MacBook Pro 14 M4 10CPU 10GPU 24GB 512GB Nano Sạc 70W - Cũ Trầy Xước' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'MacBook Pro 14 M4 10CPU 10GPU 24GB 512GB Nano Sạc 70W - Cũ Trầy Xước', 'Mua ngay MacBook Pro 14 M4 10CPU 10GPU 24GB 512GB Nano Sạc 70W cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', 34690000, 'new', 100, 4.8, 0, 0, 'sold_out', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/m/a/macbook_1__2_10_2.png', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/m/a/macbook_1__2_10_2.png' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/m/a/macbook_1__2_10_2.png'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-7e6h5w', '{"Loại card đồ họa":"10 lõiNeural Engine 16 lõi","Dung lượng RAM":"24GB","Ổ cứng":"512GB","Kích thước màn hình":"14.2 inches","Công nghệ màn hình":"Màn hình Nano-textureMàn hình Liquid Retina XDR XDR (Extreme Dynamic Range) Độ sáng XDR: 1.000 nit ở chế độ toàn màn hình, độ sáng đỉnh 1.600 nit (chỉ nội dung HDR) 1 tỷ màu Dải màu rộng (P3) Công nghệ True Tone","Pin":"Pin Li-Po 72.4 watt-giờ Thời gian xem video trực tuyến lên đến 24 giờ Thời gian duyệt web trên mạng không dây lên đến 16 giờ","Hệ điều hành":"macOS","Độ phân giải màn hình":"3024 x 1964 pixels","Loại CPU":"Apple M4 10 lõi với 4 lõi hiệu năng và 6 lõi tiết kiệm điện","Cổng giao tiếp":"Khe thẻ nhớ SDXC Cổng HDMI Jack cắm tai nghe 3.5 mm Cổng MagSafe 3 Ba cổng Thunderbolt 4 (USB‑C) hỗ trợ: Sạc, DisplayPort, Thunderbolt 4 (lên đến 40Gb/s), USB 4 (lên đến 40Gb/s)"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 0, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('Xiaomi')
  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
  RETURNING id
),
category_row AS (
  INSERT INTO product_categories (name, slug, parent_id, level, is_active, created_at, updated_at)
  VALUES ('Điện thoại', 'ien-thoai', NULL, 1, true, now(), now())
  ON CONFLICT (name) DO UPDATE SET is_active = true, updated_at = now()
  RETURNING id
),
catalog_insert AS (
  INSERT INTO product_catalog (name, brand_id, category_id, description, specs, default_image, msrp, status, created_at, updated_at)
  SELECT 'Màn hình cong Gaming Xiaomi G34I - Đã Kích Hoạt', brand_row.id, category_row.id, 'Mua màn hình cong Gaming Xiaomi G34I cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', '{"Kích thước thực tế (bao gồm viền)":"34 inches","Tấm nền":"VA","Tỉ lệ màn hình":"21:9","Tần số quét":"180 Hz","Thời gian phản hồi":"1ms","Treo tường":"75 x 75 mm","Cổng kết nối":"2x DP 2x HDMI 1 cổng âm thanh 1 cổng nguồn DC IN","Kích thước":"Có chân đế: 811.3 × 210 × 510.1 mm (D x R x C)","Trọng lượng":"Có chân đế: 6.9 kg","Độ phân giải màn hình":"3440 × 1440 pixels","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/man-hinh-cong-gaming-xiaomi-g34i-cu-da-kich-hoat.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/f/r/frame_195_19__2.jpg', 5490000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Màn hình cong Gaming Xiaomi G34I - Đã Kích Hoạt' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Màn hình cong Gaming Xiaomi G34I - Đã Kích Hoạt' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Màn hình cong Gaming Xiaomi G34I - Đã Kích Hoạt', 'Mua màn hình cong Gaming Xiaomi G34I cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', 5490000, 'new', 100, 4.8, 0, 0, 'sold_out', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/f/r/frame_195_19__2.jpg', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/f/r/frame_195_19__2.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/f/r/frame_195_19__2.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-j3iw2h', '{"Kích thước thực tế (bao gồm viền)":"34 inches","Tấm nền":"VA","Tỉ lệ màn hình":"21:9","Tần số quét":"180 Hz","Thời gian phản hồi":"1ms","Treo tường":"75 x 75 mm","Cổng kết nối":"2x DP 2x HDMI 1 cổng âm thanh 1 cổng nguồn DC IN","Kích thước":"Có chân đế: 811.3 × 210 × 510.1 mm (D x R x C)","Trọng lượng":"Có chân đế: 6.9 kg","Độ phân giải màn hình":"3440 × 1440 pixels"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 0, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
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
  SELECT 'Màn hình Gaming MSI MAG 255F X24 25 inch - Đã Kích Hoạt', brand_row.id, category_row.id, 'Mua Màn hình Gaming MSI MAG 255F X24 25 inch cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', '{"Kích thước thực tế (bao gồm viền)":"25 inches","Tấm nền":"IPS","Tỉ lệ màn hình":"16:9","Tần số quét":"240 Hz","Thời gian phản hồi":"0.5ms","Độ tương phản động":"100000000:1","Treo tường":"100 x 100 mm","Cổng kết nối":"2x HDMI 2.0b (FHD@240Hz) 1x DisplayPort 1.2a1x Headphone-out","Kích thước":"Có chân đế: 557.29 x 220.1 x 418.55mm Không chân đế: 557.29 x 65.52 x 326.85mm","Trọng lượng":"3.24 kg","Độ phân giải màn hình":"1920 x 1080 pixels","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/man-hinh-gaming-msi-mag-255f-x24-25-inch-cu-da-kich-hoat.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/r/group_942_1_3.png', 2490000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Màn hình Gaming MSI MAG 255F X24 25 inch - Đã Kích Hoạt' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Màn hình Gaming MSI MAG 255F X24 25 inch - Đã Kích Hoạt' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Màn hình Gaming MSI MAG 255F X24 25 inch - Đã Kích Hoạt', 'Mua Màn hình Gaming MSI MAG 255F X24 25 inch cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', 2490000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/r/group_942_1_3.png', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/r/group_942_1_3.png' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/r/group_942_1_3.png'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-jjy812', '{"Kích thước thực tế (bao gồm viền)":"25 inches","Tấm nền":"IPS","Tỉ lệ màn hình":"16:9","Tần số quét":"240 Hz","Thời gian phản hồi":"0.5ms","Độ tương phản động":"100000000:1","Treo tường":"100 x 100 mm","Cổng kết nối":"2x HDMI 2.0b (FHD@240Hz) 1x DisplayPort 1.2a1x Headphone-out","Kích thước":"Có chân đế: 557.29 x 220.1 x 418.55mm Không chân đế: 557.29 x 65.52 x 326.85mm","Trọng lượng":"3.24 kg","Độ phân giải màn hình":"1920 x 1080 pixels"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 10, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
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
  SELECT 'Màn hình ViewSonic VA2732A-H 120HZ 27 inch - Cũ Đẹp', brand_row.id, category_row.id, 'Mua Màn hình ViewSonic VA2732A-H 120HZ 27 inch chính hãng - Giá rẻ, đảm bảo chất lượng, độ bền cao, hỗ trợ trả góp 0%, giao hàng miễn phí toàn quốc.', '{"Kích thước thực tế (bao gồm viền)":"27 inches","Tấm nền":"IPS","Tỉ lệ màn hình":"16:9","Tần số quét":"120 Hz","Thời gian phản hồi":"1ms","Độ tương phản động":"50M:1","Treo tường":"100 x 100 mm","Cổng kết nối":"1x VGA 1x Đầu ra âm thanh 3.5 mm 1x HDMI 1.4 Cổng cắm nguồn: DC Socket (Center Positive)","Kích thước":"Có chân đế: 615 x 458.8 x 225 mm Không có chân đế: 615 x 363.8 x 46 mm","Trọng lượng":"Có chân đế: 4.1 kg Không có chân đế: 3.6 kg","Độ phân giải màn hình":"1920 x 1080 pixels","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/man-hinh-viewsonic-va2732a-h-120hz-27-inch-cu-dep.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/r/group_179_3__1_2_2.png', 1690000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Màn hình ViewSonic VA2732A-H 120HZ 27 inch - Cũ Đẹp' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Màn hình ViewSonic VA2732A-H 120HZ 27 inch - Cũ Đẹp' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Màn hình ViewSonic VA2732A-H 120HZ 27 inch - Cũ Đẹp', 'Mua Màn hình ViewSonic VA2732A-H 120HZ 27 inch chính hãng - Giá rẻ, đảm bảo chất lượng, độ bền cao, hỗ trợ trả góp 0%, giao hàng miễn phí toàn quốc.', 1690000, 'new', 100, 4.8, 0, 0, 'sold_out', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/r/group_179_3__1_2_2.png', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/r/group_179_3__1_2_2.png' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/r/group_179_3__1_2_2.png'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-1iqbzp', '{"Kích thước thực tế (bao gồm viền)":"27 inches","Tấm nền":"IPS","Tỉ lệ màn hình":"16:9","Tần số quét":"120 Hz","Thời gian phản hồi":"1ms","Độ tương phản động":"50M:1","Treo tường":"100 x 100 mm","Cổng kết nối":"1x VGA 1x Đầu ra âm thanh 3.5 mm 1x HDMI 1.4 Cổng cắm nguồn: DC Socket (Center Positive)","Kích thước":"Có chân đế: 615 x 458.8 x 225 mm Không có chân đế: 615 x 363.8 x 46 mm","Trọng lượng":"Có chân đế: 4.1 kg Không có chân đế: 3.6 kg","Độ phân giải màn hình":"1920 x 1080 pixels"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 0, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('Samsung')
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
  SELECT 'Samsung Galaxy Tab A11 Wifi 8GB 128GB - Cũ đẹp', brand_row.id, category_row.id, 'Mua Samsung Galaxy Tab A11 Wifi 8GB 128GB cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', '{"Kích thước màn hình":"8.7 inches","Công nghệ màn hình":"TFT LCD","Camera sau":"8MP","Camera trước":"5MP","Chipset":"MediaTek Helio G99","Dung lượng RAM":"8 GB","Bộ nhớ trong":"128 GB","Pin":"5100mAh, 15W","Hệ điều hành":"Android 15","Độ phân giải màn hình":"800 x 1340 pixels","Tính năng màn hình":"Tần số quét 90Hz, cảm ứng đa điểm, hiển thị mượt mà","Loại CPU":"8 nhân, tốc độ 2.2 GHz","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/may-tinh-bang-samsung-galaxy-tab-a11-wifi-8gb-128gb-cu-dep.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/m/a/may-tinh-bang-samsung-galaxy-tab-a11-wifi-8gb-128gb-cu-dep.jpg', 3190000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Samsung Galaxy Tab A11 Wifi 8GB 128GB - Cũ đẹp' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Samsung Galaxy Tab A11 Wifi 8GB 128GB - Cũ đẹp' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Samsung Galaxy Tab A11 Wifi 8GB 128GB - Cũ đẹp', 'Mua Samsung Galaxy Tab A11 Wifi 8GB 128GB cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', 3190000, 'new', 100, 4.8, 0, 0, 'sold_out', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/m/a/may-tinh-bang-samsung-galaxy-tab-a11-wifi-8gb-128gb-cu-dep.jpg', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/m/a/may-tinh-bang-samsung-galaxy-tab-a11-wifi-8gb-128gb-cu-dep.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/m/a/may-tinh-bang-samsung-galaxy-tab-a11-wifi-8gb-128gb-cu-dep.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-lm9sid', '{"Kích thước màn hình":"8.7 inches","Công nghệ màn hình":"TFT LCD","Camera sau":"8MP","Camera trước":"5MP","Chipset":"MediaTek Helio G99","Dung lượng RAM":"8 GB","Bộ nhớ trong":"128 GB","Pin":"5100mAh, 15W","Hệ điều hành":"Android 15","Độ phân giải màn hình":"800 x 1340 pixels","Tính năng màn hình":"Tần số quét 90Hz, cảm ứng đa điểm, hiển thị mượt mà","Loại CPU":"8 nhân, tốc độ 2.2 GHz"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 0, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('Xiaomi')
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
  SELECT 'Xiaomi Pad Mini 8GB 256GB - Cũ đẹp', brand_row.id, category_row.id, 'Mua Máy tính bảng Xiaomi Pad Mini cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', '{"Kích thước màn hình":"8.8 inches","Công nghệ màn hình":"LCD","Camera sau":"13MP 1/3,06\" 1,12μm kích thước điểm ảnhf/2,2 PDAF","Camera trước":"8MP 1/4\" 1,12μm kích thước điểm ảnhf/2,28","Chipset":"MediaTek Dimensity 9400+","Dung lượng RAM":"8 GB","Bộ nhớ trong":"256 GB","Pin":"7500mAh","Hệ điều hành":"Xiaomi HyperOS 2","Tính năng màn hình":"Tần số quét 165Hz, Cảm ứng 372Hz / 1080Hz tức thời, Cảm ứng bút 240Hz, TÜV Rheinland, Original Color Pro, Sunlight Mode, Adaptive Color, AI Image Processing, Công nghệ chạm khi ướt","Loại CPU":"1× Cortex-X925 3.73GHz + 3× Cortex-X4 3.3GHz + 4× Cortex-A720 2.4GHz","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/may-tinh-bang-xiaomi-pad-mini-8gb-256gb-cu-dep.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/x/i/xiaomi-pad-mini_3.jpg', 9790000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Xiaomi Pad Mini 8GB 256GB - Cũ đẹp' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Xiaomi Pad Mini 8GB 256GB - Cũ đẹp' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Xiaomi Pad Mini 8GB 256GB - Cũ đẹp', 'Mua Máy tính bảng Xiaomi Pad Mini cũ giá rẻ - Nguồn gốc rõ ràng, bảo hành 6-12 tháng, đổi mới 30 ngày, luôn xuất bán đầy đủ VAT.', 9790000, 'new', 100, 4.8, 0, 0, 'sold_out', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/x/i/xiaomi-pad-mini_3.jpg', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/x/i/xiaomi-pad-mini_3.jpg' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/x/i/xiaomi-pad-mini_3.jpg'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-nbz4xd', '{"Kích thước màn hình":"8.8 inches","Công nghệ màn hình":"LCD","Camera sau":"13MP 1/3,06\" 1,12μm kích thước điểm ảnhf/2,2 PDAF","Camera trước":"8MP 1/4\" 1,12μm kích thước điểm ảnhf/2,28","Chipset":"MediaTek Dimensity 9400+","Dung lượng RAM":"8 GB","Bộ nhớ trong":"256 GB","Pin":"7500mAh","Hệ điều hành":"Xiaomi HyperOS 2","Tính năng màn hình":"Tần số quét 165Hz, Cảm ứng 372Hz / 1080Hz tức thời, Cảm ứng bút 240Hz, TÜV Rheinland, Original Color Pro, Sunlight Mode, Adaptive Color, AI Image Processing, Công nghệ chạm khi ướt","Loại CPU":"1× Cortex-X925 3.73GHz + 3× Cortex-X4 3.3GHz + 4× Cortex-A720 2.4GHz"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 0, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('LG')
  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
  RETURNING id
),
category_row AS (
  INSERT INTO product_categories (name, slug, parent_id, level, is_active, created_at, updated_at)
  VALUES ('Tivi 100 inch', 'tivi-100-inch', NULL, 1, true, now(), now())
  ON CONFLICT (name) DO UPDATE SET is_active = true, updated_at = now()
  RETURNING id
),
catalog_insert AS (
  INSERT INTO product_catalog (name, brand_id, category_id, description, specs, default_image, msrp, status, created_at, updated_at)
  SELECT 'Smart tivi LG Micro RGB 4K 100 inch 2026 (100MRGB96BS)', brand_row.id, category_row.id, 'Mua Smart tivi LG Micro RGB 4K 100 inch 2026 (100MRGB96BS) chính hãng - Giá rẻ, chất lượng, bảo hành 2 năm, trả góp 0%, giao hàng toàn quốc. Mua tại đây.', '{"Kích cỡ màn hình":"&gt; 85 inch","Công nghệ hình ảnh":"Dolby VisionHDR10HLG RGB Primary Color Pro α11 AI Super Upscaling 4KDynamic Tone Mapping Ultra AI HDR Remastering4K Expression Enhancer AI Genre Selection: SDR/HDR Filmmaker Mode Công nghệ điều chỉnh độ sáng cục bộ: Micro Dimming UltraMotion Pro Công nghệ QFT (Truyền tải khung hình nhanh) Auto Calibration- tự động hiệu chỉnh 9 chế độ hình ảnh Motion Booster 330VRR 165Hz","Độ phân giải":"4K","Tần số quét":"120Hz","Loại tivi":"Smart tivi","Công nghệ âm thanh":"Dolby AtmosAI Object Remastering Ultraα11 AI Sound ProAdaptive Acoustic TuningLG Sound SyncSimultaneous Audio Output","Hệ điều hành":"WebOS","Tiện ích nổi bật":"Tích hợp trợ lí ảo Google Assistant, Điều khiển bằng giọng nói không cần remote, Chiếu hình ảnh từ điện thoại lên TV, Điều khiển qua ứng dụng","Thương hiệu":"LG","Sản xuất tại":"Indonesia","Năm ra mắt":"2026","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/smart-tivi-lg-micro-rgb-4k-100-inch-100mrgb96bs.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/s/m/smart-tivi-lg-micro-rgb-4k-100-inch-100mrgb96bs.png', 99999999.99, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Smart tivi LG Micro RGB 4K 100 inch 2026 (100MRGB96BS)' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Smart tivi LG Micro RGB 4K 100 inch 2026 (100MRGB96BS)' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Smart tivi LG Micro RGB 4K 100 inch 2026 (100MRGB96BS)', 'Mua Smart tivi LG Micro RGB 4K 100 inch 2026 (100MRGB96BS) chính hãng - Giá rẻ, chất lượng, bảo hành 2 năm, trả góp 0%, giao hàng toàn quốc. Mua tại đây.', 99999999.99, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/s/m/smart-tivi-lg-micro-rgb-4k-100-inch-100mrgb96bs.png', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/s/m/smart-tivi-lg-micro-rgb-4k-100-inch-100mrgb96bs.png' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/s/m/smart-tivi-lg-micro-rgb-4k-100-inch-100mrgb96bs.png'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-3yz9yv', '{"Kích cỡ màn hình":"&gt; 85 inch","Công nghệ hình ảnh":"Dolby VisionHDR10HLG RGB Primary Color Pro α11 AI Super Upscaling 4KDynamic Tone Mapping Ultra AI HDR Remastering4K Expression Enhancer AI Genre Selection: SDR/HDR Filmmaker Mode Công nghệ điều chỉnh độ sáng cục bộ: Micro Dimming UltraMotion Pro Công nghệ QFT (Truyền tải khung hình nhanh) Auto Calibration- tự động hiệu chỉnh 9 chế độ hình ảnh Motion Booster 330VRR 165Hz","Độ phân giải":"4K","Tần số quét":"120Hz","Loại tivi":"Smart tivi","Công nghệ âm thanh":"Dolby AtmosAI Object Remastering Ultraα11 AI Sound ProAdaptive Acoustic TuningLG Sound SyncSimultaneous Audio Output","Hệ điều hành":"WebOS","Tiện ích nổi bật":"Tích hợp trợ lí ảo Google Assistant, Điều khiển bằng giọng nói không cần remote, Chiếu hình ảnh từ điện thoại lên TV, Điều khiển qua ứng dụng","Thương hiệu":"LG","Sản xuất tại":"Indonesia","Năm ra mắt":"2026"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 10, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('LG')
  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
  RETURNING id
),
category_row AS (
  INSERT INTO product_categories (name, slug, parent_id, level, is_active, created_at, updated_at)
  VALUES ('Tivi LG 75 inch', 'tivi-lg-75-inch', NULL, 1, true, now(), now())
  ON CONFLICT (name) DO UPDATE SET is_active = true, updated_at = now()
  RETURNING id
),
catalog_insert AS (
  INSERT INTO product_catalog (name, brand_id, category_id, description, specs, default_image, msrp, status, created_at, updated_at)
  SELECT 'Smart tivi LG Micro RGB 4K 75 inch 2026 (75MRGB86BSA)', brand_row.id, category_row.id, 'Mua Smart tivi LG Micro RGB 4K 75 inch 2026 (75MRGB86BSA) chính hãng - Giá rẻ, chất lượng, bảo hành 2 năm, trả góp 0%, giao hàng toàn quốc. Mua tại đây.', '{"Kích cỡ màn hình":"75 inch","Công nghệ hình ảnh":"Dolby VisionHDR10HLG RGB Primary Color Pro α8 AI Super Upscaling 4KDynamic Tone Mapping Pro AI HDR Remastering4K Expression Enhancer AI Genre Selection: SDR/HDR Filmmaker Mode Công nghệ điều chỉnh độ sáng cục bộ: Precision DimmingMotion Pro Công nghệ QFT (Truyền tải khung hình nhanh) Auto Calibration- tự động hiệu chỉnh 9 chế độ hình ảnhMotion Booster 288VRR 144Hz","Độ phân giải":"4K","Tần số quét":"120Hz","Loại tivi":"Smart tivi","Công nghệ âm thanh":"Dolby AtmosAI Object Remastering Proα8 AI Sound ProAdaptive Acoustic TuningLG Sound SyncSimultaneous Audio Output","Hệ điều hành":"WebOS","Tiện ích nổi bật":"Tích hợp trợ lí ảo Google Assistant, Điều khiển bằng giọng nói không cần remote, Chiếu hình ảnh từ điện thoại lên TV, Điều khiển qua ứng dụng","Thương hiệu":"LG","Sản xuất tại":"Indonesia","Năm ra mắt":"2026","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/smart-tivi-lg-micro-rgb-4k-75-inch-75mrgb86bsa.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/s/m/smart-tivi-lg-micro-rgb-4k-75-inch-75mrgb86bsa.png', 64990000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Smart tivi LG Micro RGB 4K 75 inch 2026 (75MRGB86BSA)' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Smart tivi LG Micro RGB 4K 75 inch 2026 (75MRGB86BSA)' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Smart tivi LG Micro RGB 4K 75 inch 2026 (75MRGB86BSA)', 'Mua Smart tivi LG Micro RGB 4K 75 inch 2026 (75MRGB86BSA) chính hãng - Giá rẻ, chất lượng, bảo hành 2 năm, trả góp 0%, giao hàng toàn quốc. Mua tại đây.', 64990000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/s/m/smart-tivi-lg-micro-rgb-4k-75-inch-75mrgb86bsa.png', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/s/m/smart-tivi-lg-micro-rgb-4k-75-inch-75mrgb86bsa.png' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/s/m/smart-tivi-lg-micro-rgb-4k-75-inch-75mrgb86bsa.png'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-ji159f', '{"Kích cỡ màn hình":"75 inch","Công nghệ hình ảnh":"Dolby VisionHDR10HLG RGB Primary Color Pro α8 AI Super Upscaling 4KDynamic Tone Mapping Pro AI HDR Remastering4K Expression Enhancer AI Genre Selection: SDR/HDR Filmmaker Mode Công nghệ điều chỉnh độ sáng cục bộ: Precision DimmingMotion Pro Công nghệ QFT (Truyền tải khung hình nhanh) Auto Calibration- tự động hiệu chỉnh 9 chế độ hình ảnhMotion Booster 288VRR 144Hz","Độ phân giải":"4K","Tần số quét":"120Hz","Loại tivi":"Smart tivi","Công nghệ âm thanh":"Dolby AtmosAI Object Remastering Proα8 AI Sound ProAdaptive Acoustic TuningLG Sound SyncSimultaneous Audio Output","Hệ điều hành":"WebOS","Tiện ích nổi bật":"Tích hợp trợ lí ảo Google Assistant, Điều khiển bằng giọng nói không cần remote, Chiếu hình ảnh từ điện thoại lên TV, Điều khiển qua ứng dụng","Thương hiệu":"LG","Sản xuất tại":"Indonesia","Năm ra mắt":"2026"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 10, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

WITH
store_row AS (
  SELECT id, owner_id FROM stores WHERE name = 'CellphoneS' ORDER BY id LIMIT 1
),
brand_row AS (
  INSERT INTO brand (name)
  VALUES ('LG')
  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
  RETURNING id
),
category_row AS (
  INSERT INTO product_categories (name, slug, parent_id, level, is_active, created_at, updated_at)
  VALUES ('tivi lg 86 inch', 'tivi-lg-86-inch', NULL, 1, true, now(), now())
  ON CONFLICT (name) DO UPDATE SET is_active = true, updated_at = now()
  RETURNING id
),
catalog_insert AS (
  INSERT INTO product_catalog (name, brand_id, category_id, description, specs, default_image, msrp, status, created_at, updated_at)
  SELECT 'Smart tivi LG Micro RGB 4K 86 inch 2026 (86MRGB86BSA)', brand_row.id, category_row.id, 'Mua Smart tivi LG Micro RGB 4K 86 inch 2026 (86MRGB86BSA) chính hãng - Giá rẻ, chất lượng, bảo hành 2 năm, trả góp 0%, giao hàng toàn quốc. Mua tại đây.', '{"Kích cỡ màn hình":"86 inch","Công nghệ hình ảnh":"Dolby VisionHDR10HLG RGB Primary Color Pro α8 AI Super Upscaling 4KDynamic Tone Mapping Pro AI HDR Remastering4K Expression Enhancer AI Genre Selection: SDR/HDR Filmmaker Mode Công nghệ điều chỉnh độ sáng cục bộ: Precision DimmingMotion Pro Công nghệ QFT (Truyền tải khung hình nhanh) Auto Calibration- tự động hiệu chỉnh 9 chế độ hình ảnhVRR 144Hz","Độ phân giải":"4K","Tần số quét":"120Hz","Loại tivi":"Smart tivi","Công nghệ âm thanh":"Dolby AtmosAI Object Remastering Pro α8 AI Sound ProAdaptive Acoustic TuningLG Sound SyncSimultaneous Audio Output","Hệ điều hành":"WebOS","Tiện ích nổi bật":"Tích hợp trợ lí ảo Google Assistant, Điều khiển bằng giọng nói không cần remote, Chiếu hình ảnh từ điện thoại lên TV, Điều khiển qua ứng dụng","Thương hiệu":"LG","Sản xuất tại":"Indonesia","Năm ra mắt":"2026","import_source":"CellphoneS","source_url":"https://cellphones.com.vn/smart-tivi-lg-micro-rgb-4k-86-inch-86mrgb86bsa.html","imported_at":"2026-05-12T04:49:10.924Z"}'::jsonb, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/s/m/smart-tivi-lg-micro-rgb-4k-86-inch-86mrgb86bsa.png', 99990000, 'active', now(), now()
  FROM brand_row, category_row
  WHERE NOT EXISTS (
    SELECT 1 FROM product_catalog pc WHERE pc.name = 'Smart tivi LG Micro RGB 4K 86 inch 2026 (86MRGB86BSA)' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  )
  RETURNING id
),
catalog_row AS (
  SELECT id FROM catalog_insert
  UNION ALL
  SELECT pc.id FROM product_catalog pc, brand_row, category_row
  WHERE pc.name = 'Smart tivi LG Micro RGB 4K 86 inch 2026 (86MRGB86BSA)' AND pc.brand_id = brand_row.id AND pc.category_id = category_row.id
  LIMIT 1
),
product_insert AS (
  INSERT INTO products (category_id, seller_id, store_id, brand_id, catalog_id, name, description, price, quality, condition_percent, rating, buyturn, quantity, status, created_at, updated_at)
  SELECT category_row.id, store_row.owner_id, store_row.id, brand_row.id, catalog_row.id, 'Smart tivi LG Micro RGB 4K 86 inch 2026 (86MRGB86BSA)', 'Mua Smart tivi LG Micro RGB 4K 86 inch 2026 (86MRGB86BSA) chính hãng - Giá rẻ, chất lượng, bảo hành 2 năm, trả góp 0%, giao hàng toàn quốc. Mua tại đây.', 99990000, 'new', 100, 4.8, 0, 10, 'active', now(), now()
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
  SELECT product_row.id, 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/s/m/smart-tivi-lg-micro-rgb-4k-86-inch-86mrgb86bsa.png', 0, now() FROM product_row
  WHERE 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/s/m/smart-tivi-lg-micro-rgb-4k-86-inch-86mrgb86bsa.png' <> '' AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = product_row.id AND pi.url = 'https://cdn2.cellphones.com.vn/200x/media/catalog/product/s/m/smart-tivi-lg-micro-rgb-4k-86-inch-86mrgb86bsa.png'
  )
  RETURNING id
),
serial_row AS (
  INSERT INTO product_serials (product_id, serial_code, serial_specs, created_at, updated_at)
  SELECT product_row.id, 'SRC-CELLPHONES-fk9xb1', '{"Kích cỡ màn hình":"86 inch","Công nghệ hình ảnh":"Dolby VisionHDR10HLG RGB Primary Color Pro α8 AI Super Upscaling 4KDynamic Tone Mapping Pro AI HDR Remastering4K Expression Enhancer AI Genre Selection: SDR/HDR Filmmaker Mode Công nghệ điều chỉnh độ sáng cục bộ: Precision DimmingMotion Pro Công nghệ QFT (Truyền tải khung hình nhanh) Auto Calibration- tự động hiệu chỉnh 9 chế độ hình ảnhVRR 144Hz","Độ phân giải":"4K","Tần số quét":"120Hz","Loại tivi":"Smart tivi","Công nghệ âm thanh":"Dolby AtmosAI Object Remastering Pro α8 AI Sound ProAdaptive Acoustic TuningLG Sound SyncSimultaneous Audio Output","Hệ điều hành":"WebOS","Tiện ích nổi bật":"Tích hợp trợ lí ảo Google Assistant, Điều khiển bằng giọng nói không cần remote, Chiếu hình ảnh từ điện thoại lên TV, Điều khiển qua ứng dụng","Thương hiệu":"LG","Sản xuất tại":"Indonesia","Năm ra mắt":"2026"}'::jsonb, now(), now() FROM product_row
  ON CONFLICT (product_id, serial_code) DO UPDATE SET serial_specs = EXCLUDED.serial_specs, updated_at = now()
  RETURNING id, product_id
)
INSERT INTO product_inventory (product_id, serial_id, on_hand, reserved, updated_at)
SELECT serial_row.product_id, serial_row.id, 10, 0, now() FROM serial_row
ON CONFLICT (product_id, serial_id) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = now();

COMMIT;
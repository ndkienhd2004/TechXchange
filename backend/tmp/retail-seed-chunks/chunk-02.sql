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

COMMIT;

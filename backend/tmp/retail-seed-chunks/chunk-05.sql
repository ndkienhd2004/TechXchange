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

COMMIT;

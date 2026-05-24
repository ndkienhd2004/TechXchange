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

COMMIT;

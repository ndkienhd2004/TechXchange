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

COMMIT;

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

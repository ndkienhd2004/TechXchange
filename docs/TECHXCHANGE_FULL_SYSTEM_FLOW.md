# TechXchange – Tài liệu tổng hợp luồng hệ thống (App + Chatbot + Recommendation)

> Cập nhật theo codebase hiện tại ở 3 repo:
> - `/Users/kien/Codes/TechXchange`
> - `/Users/kien/Codes/TechXchange_Chatbot`
> - `/Users/kien/Codes/TechXchange_recommendation_system`

---

## 1) Phạm vi hệ thống hiện tại

TechXchange hiện là hệ thống web marketplace công nghệ, gồm 3 service chính:

1. **Core App (Node.js/Express + Next.js)**
- Marketplace chính: user/shop/admin
- Sản phẩm, giỏ hàng, checkout, đơn hàng, kho, đánh giá, chat shop, quản trị
- Tích hợp GHN, SePay, AWS S3

2. **AI Chatbot Service (Python/FastAPI)**
- Assistant hội thoại theo RAG nâng cao
- Đồng bộ dữ liệu sản phẩm từ hệ thống chính
- Lưu lịch sử hội thoại AI riêng theo user

3. **Recommendation Service (Python/FastAPI)**
- Gợi ý content-based + collaborative + hybrid
- Dùng Gemini embedding cho vector sản phẩm
- Nhận tín hiệu hành vi từ bảng event của app chính

> **Ghi chú scope:** hệ thống hiện tập trung **web app**, không còn scope mobile trong bản triển khai thực tế hiện tại.

---

## 2) Kiến trúc tổng quan

## 2.1 Thành phần kỹ thuật

- **Frontend:** Next.js (App Router), React 19, TypeScript, Redux Toolkit
- **Backend:** Express, Sequelize, PostgreSQL
- **Realtime:** Socket.IO (chat user-shop)
- **Storage:** AWS S3 (upload ảnh qua presigned URL)
- **Shipping:** GHN API
- **Payment:** SePay webhook + mã chuyển khoản
- **AI Chatbot:** FastAPI + Gemini (chat + embedding) + RAG
- **Recommendation:** FastAPI + Gemini embedding + content/collab/hybrid

## 2.2 Kết nối giữa các service

- Frontend gọi Backend qua REST `/api/*`
- Backend gọi Chatbot service qua `CHATBOT_SERVICE_URL`
- Backend gọi Recommendation service qua `RECOMMENDATION_SERVICE_URL`
- Chatbot service tự sync dữ liệu sản phẩm từ DB nguồn (`SOURCE_DATABASE_URL`)
- Recommendation service đọc trực tiếp DB app để build cache gợi ý

---

## 3) Luồng nghiệp vụ Core App (TechXchange)

## 3.1 Auth + phân quyền

Vai trò chính:
- **user**: mua hàng, đánh giá, chat
- **shop**: quản lý shop/sản phẩm/đơn/kho/thống kê
- **admin**: quản trị hệ thống (shop, brand, category, product, review, báo cáo)

Cơ chế:
- JWT access token + refresh token
- Axios interceptor ở frontend tự refresh khi 401 (trừ login/register)
- Route UI tách theo khu vực `/shop/*` và `/admin/*`

## 3.2 Luồng duyệt sản phẩm và mua hàng

1. User duyệt sản phẩm (lọc theo category/brand/search/sort)
2. User vào product detail, chọn biến thể/spec phù hợp
3. Add to cart
4. Checkout
- Chọn địa chỉ nhận hàng (có mapping mã GHN tỉnh/huyện/xã)
- Hệ thống tính phí ship theo từng shop
- Đơn có thể tách theo shop
5. Tạo order + order_items + payment + shipment

## 3.3 Luồng thanh toán

### COD
- Payment tạo ở trạng thái pending/đợi xử lý đơn
- Shop duyệt đơn → đẩy trạng thái sang shipping flow

### Bank transfer (SePay)
- Hệ thống tạo `payment_code`, nội dung CK, QR URL
- Frontend hiển thị thông tin chuyển khoản
- SePay gọi webhook `/api/webhooks/sepay`
- Backend đối soát số tiền + nội dung đơn
- Nếu hợp lệ: payment completed, đơn chuyển trạng thái tiếp theo

## 3.4 Luồng GHN (shipping)

### A. Setup shop GHN
- Shop cập nhật địa chỉ GHN (district/ward)
- Shop đăng ký GHN shop_id từ backend (`registerShop`)
- Lưu `ghn_shop_id` tại store

### B. Tính phí ship
- Khi checkout hoặc preview shipping fee:
  - Gọi available-services theo from_district/to_district
  - Chọn service phù hợp
  - Gọi calculate-fee
- Trả `shipping_fee` theo từng shop + tổng phí

### C. Tạo vận đơn GHN
- Khi shop approve order:
  - Backend tạo order trên GHN
  - Lưu `ghn_order_code`, `ghn_status`, payload vào shipment

### D. Đồng bộ trạng thái GHN
- Không dùng webhook GHN trong flow hiện tại
- Sync trạng thái theo cơ chế **pull on demand**:
  - Khi user/shop mở danh sách hoặc chi tiết đơn
  - Backend gọi `shipping-order/detail` GHN theo `order_code`
  - Map GHN status -> local shipment/order status

## 3.5 Luồng kho (Inventory) và nhập/xuất

Hiện tại dùng 2 lớp dữ liệu kho:

1. **`product_inventory`**
- `on_hand`: tồn vật lý
- `reserved`: hàng giữ chỗ (đã đặt nhưng chưa xuất kho)
- `available = on_hand - reserved`

2. **`shop_inventory_ledger`**
- Nhật ký nhập/xuất theo shop
- Dùng cho truy vết nghiệp vụ + tính cost/profit
- Type chính: `import`, `export`

Luồng chuẩn:
- Checkout: tăng reserved
- Shop approve: consume reserved (giảm reserved + giảm on_hand) + ghi ledger export
- Shop reject/cancel: release reserved (nhả giữ chỗ)
- Nhập kho thủ công: tăng on_hand + ghi ledger import kèm `unit_cost`

## 3.6 Tính doanh thu/lợi nhuận

- Doanh thu shop/admin lấy từ đơn hoàn thành (không tính tiền ship vào lợi nhuận)
- Lợi nhuận theo nguyên tắc:
- `profit = doanh thu bán hàng - giá vốn nhập`
- Giá vốn được tổng hợp từ ledger nhập (bình quân theo dữ liệu hiện có)

## 3.7 Chat user-shop realtime

- Socket auth bằng JWT
- Room theo user/conversation
- Event chính:
- `chat:join`
- `chat:send`
- `chat:read`
- Có lưu lịch sử chat và lazy load hội thoại
- Widget chat global hoạt động ở nhiều trang

## 3.8 Upload ảnh AWS S3

Đối tượng áp dụng:
- Avatar user
- Logo/banner shop
- Ảnh sản phẩm
- Ảnh review
- Ảnh banner/brand (nếu cấu hình)

Luồng upload:
1. FE gọi `/api/uploads/presign`
2. BE trả `upload_url` + method + fields (nếu POST policy)
3. FE upload trực tiếp lên S3
4. FE gửi URL public về backend để lưu vào DB

---

## 4) Luồng Chatbot service (TechXchange_Chatbot)

## 4.1 Mục tiêu

Assistant tư vấn công nghệ/buildup PC, trả lời dựa trên dữ liệu sản phẩm thực trong hệ thống + knowledge docs.

## 4.2 Kiến trúc dữ liệu

- **App DB**: lưu conversation/messages của user
- **Chatbot DB**: lưu tài liệu KB, chunk, embedding, trạng thái sync

Nếu PostgreSQL có `pgvector`:
- Tạo `embedding_vector` để vector search trong DB

Nếu không có `pgvector`:
- Fallback Python cosine + keyword search

## 4.3 Pipeline RAG

Flow chính khi chat:
1. Validate request + lấy history gần
2. Intent routing (nếu bật)
3. Embed query (Gemini embedding)
4. Retrieve candidate (vector + keyword)
5. Rerank
6. Generate answer bằng Gemini chat model
7. Lưu user message + assistant message
8. Trả answer + citations + debug/usage

## 4.4 Đồng bộ dữ liệu nguồn

- Scheduler chạy theo `SYNC_INTERVAL_SECONDS`
- Có thể sync khi startup
- Nguồn sync từ DB app (sản phẩm active, metadata liên quan)
- Endpoint admin có thể ingest/reindex thủ công

## 4.5 Endpoint chính

- `GET /health`
- `GET /api/assistant/health`
- `POST /api/assistant/chat`
- `GET /api/assistant/conversations`
- `GET /api/assistant/messages/{conversation_id}`
- `POST /api/assistant/ingest` (admin)
- `POST /api/assistant/reindex` (admin)

---

## 5) Luồng Recommendation service (TechXchange_recommendation_system)

## 5.1 Mục tiêu

Sinh gợi ý sản phẩm cá nhân hóa dựa trên:
- Nội dung sản phẩm (embedding)
- Hành vi user (event implicit feedback)
- Kết hợp hybrid

## 5.2 Dữ liệu đầu vào

- Active products từ DB app
- Bảng sự kiện user-product (`user_product_events`)
- Popularity theo lookback

Event weights đang dùng:
- impression=1
- view=2
- click=3
- add_to_cart=6
- wishlist=7
- purchase=12

## 5.3 Quy trình khởi động

1. Connect DB
2. Load products active
3. Build item embedding (Gemini embedding + cache file local)
4. Build user profile vectors từ events
5. Build collaborative item-item neighbors
6. Lưu cache in-memory để query nhanh

## 5.4 API gợi ý

- `GET /recommend/content-based/{user_id}`
- `GET /recommend/collaborative/{user_id}`
- `GET /recommend/hybrid/{user_id}`
- `GET /recommend/similar/{product_id}`
- `GET /recommend/similar-collaborative/{product_id}`
- `POST /recommend/refresh`
- `GET /recommend/cache-status`

## 5.5 Tích hợp với app chính

Backend Node có `RecommendationService` gọi sang service Python:
- `/api/products/recommendations/me`
- `/api/products/:id/recommendations`

Frontend đã gọi các endpoint này ở:
- Home (For You)
- Product detail (related items)

---

## 6) Những gì đã triển khai trong dự án

## 6.1 Core marketplace

- Auth + refresh token
- User profile + address
- Product listing + catalog chuẩn + ảnh
- Cart + checkout
- Order cho user/shop
- Review + rating + ảnh review
- Role-based admin/shop areas

## 6.2 Shop center

- Dashboard shop
- Quản lý sản phẩm
- Quản lý đơn (approve/reject)
- Quản lý kho (nhập kho + lịch sử xuất kho)
- Thống kê doanh thu/lợi nhuận + filter thời gian
- Gửi yêu cầu brand/spec/catalog

## 6.3 Admin center

- Dashboard tổng quan
- Quản lý users/stores/products/brands/categories/reviews
- Duyệt request từ shop
- Ràng buộc xóa dữ liệu phụ thuộc (brand/category đang dùng)

## 6.4 Tích hợp ngoài

- GHN: địa chỉ, phí ship, service, tạo đơn, sync trạng thái
- SePay: webhook thanh toán chuyển khoản
- AWS S3: presigned upload cho media

## 6.5 Chat + AI

- Chat realtime user-shop bằng Socket.IO
- Chat widget global toàn app
- AI Assistant RAG (Gemini)
- Markdown render trong UI chat assistant
- Lưu lịch sử hội thoại assistant

## 6.6 Recommendation

- Service recommendation riêng (Python FastAPI)
- Ghi nhận event hành vi từ app
- Content/Collaborative/Hybrid recommendation
- Similar products theo content và collaborative

---

## 7) Luồng dữ liệu end-to-end ngắn gọn

## 7.1 User mua hàng

1. User xem sản phẩm -> click/view event ghi vào `user_product_events`
2. Add cart -> checkout
3. Hệ thống tính phí GHN theo shop
4. Tạo order + reserve inventory
5. Shop approve -> tạo vận đơn GHN + xuất kho thực tế
6. User theo dõi đơn, trạng thái sync từ GHN khi mở đơn

## 7.2 User chat AI

1. FE gọi backend `/api/assistant/chat`
2. Backend proxy sang chatbot service
3. Chatbot chạy RAG + Gemini
4. Trả answer/citations về FE

## 7.3 Recommendation

1. Event hành vi được backend lưu
2. Recommendation service refresh cache theo chu kỳ/refresh tay
3. FE gọi API recommendation qua backend để hiển thị For You/Related

---

## 8) Biến môi trường quan trọng

## 8.1 Core App
- DB: `DB_*` hoặc `DATABASE_URL`
- JWT: `JWT_SECRET`
- S3: `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_PUBLIC_BASE_URL`
- GHN: `GHN_BASE_URL`, `GHN_TOKEN`, `GHN_SHOP_ID`
- SePay: `SEPAY_*`
- AI service URLs:
  - `CHATBOT_SERVICE_URL`
  - `RECOMMENDATION_SERVICE_URL`

## 8.2 Chatbot service
- `APP_DATABASE_URL`, `CHATBOT_DATABASE_URL`, `SOURCE_DATABASE_URL`
- `ENABLE_GEMINI_CHAT`, `ENABLE_GEMINI_EMBED`, `GEMINI_API_KEY`
- `SYNC_ENABLED`, `SYNC_INTERVAL_SECONDS`

## 8.3 Recommendation service
- `DB_*`
- `GEMINI_API_KEY` hoặc cấu hình Vertex AI
- `REFRESH_INTERVAL_MINUTES`, `EVENT_LOOKBACK_DAYS`
- `HYBRID_CONTENT_WEIGHT`, `CF_*`

---

## 9) Ghi chú trạng thái hiện tại

- Hệ thống đã có đầy đủ luồng thương mại điện tử web + tích hợp GHN/SePay/S3.
- Chatbot RAG đã tích hợp và hoạt động qua backend proxy.
- Recommendation service đã tách riêng thành microservice và có endpoint đầy đủ.
- Dữ liệu event đã là nền để tiếp tục tối ưu chất lượng gợi ý theo hành vi thực tế.


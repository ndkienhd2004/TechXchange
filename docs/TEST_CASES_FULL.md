# TechXchange - Bộ Test Case Bao Phủ Toàn Bộ Use Case

Tài liệu này tổng hợp và mở rộng từ các nguồn kiểm thử đang có trong repo:

- `frontend/tests/e2e/TEST_CASES_E2E.md`
- `frontend/tests/e2e/api-regression.spec.ts`
- `docs/TEST_PLAN_AND_RESULTS.md`
- các route/backend controller hiện tại trong `backend/src`

Mục tiêu của bản này là phủ hết các ca sử dụng đang có trong Chương 3 và chỉ giữ các luồng còn tồn tại trong code. Với các luồng đã có script Playwright hoặc smoke API, bảng bên dưới ghi rõ `AUTO (existing)`. Với các luồng chưa có script nhưng có thật trong code, bảng ghi `MANUAL / NEW`.

## 1) Quy ước

- `AUTO (existing)`: đã có kiểm thử tự động trong repo.
- `AUTO (new)`: nên bổ sung script tự động ở vòng sau.
- `MANUAL`: chạy tay qua UI, Postman, Swagger hoặc dữ liệu seed.
- `API`: kiểm thử qua endpoint backend, không cần mở giao diện.
- Trạng thái mặc định để trống, chỉ điền khi thực thi thực tế.

---

## 2) Ma trận bao phủ use case

| Mã UC | Tên ca sử dụng | Test case bao phủ |
|---|---|---|
| UC01 | Đăng ký tài khoản | `TC-AUTH-01`, `TC-AUTH-02` |
| UC02 | Duyệt, tìm kiếm, lọc và xem chi tiết sản phẩm | `TC-PRD-01`, `TC-PRD-02`, `TC-PRD-03`, `TC-PRD-04` |
| UC03 | Quản lý giỏ hàng | `TC-CART-01`, `TC-CART-02`, `TC-CART-03`, `TC-CART-04`, `TC-CART-05` |
| UC04 | Đặt hàng | `TC-ORD-01`, `TC-ORD-02`, `TC-ORD-03`, `TC-ORD-04` |
| UC05 | Theo dõi đơn hàng | `TC-ORD-05`, `TC-ORD-06`, `TC-ORD-07` |
| UC06 | Gửi yêu cầu mở shop | `TC-SHOP-01`, `TC-SHOP-02` |
| UC07 | Shop quản lý listing sản phẩm | `TC-SHOP-03`, `TC-SHOP-04`, `TC-SHOP-05`, `TC-SHOP-06` |
| UC08 | Shop xử lý đơn hàng | `TC-SHOP-07`, `TC-SHOP-08`, `TC-SHOP-09` |
| UC09 | Đăng nhập hệ thống | `TC-AUTH-03`, `TC-AUTH-04`, `TC-AUTH-05` |
| UC10 | Quản lý hồ sơ cá nhân người dùng | `TC-USER-01`, `TC-USER-02` |
| UC11 | Quản lý địa chỉ giao hàng | `TC-USER-03`, `TC-USER-04`, `TC-USER-05`, `TC-USER-06` |
| UC12 | Xem thông tin cửa hàng công khai | `TC-PUB-01` |
| UC13 | Xem danh mục và thương hiệu công khai | `TC-PUB-02`, `TC-PUB-03` |
| UC14 | Đánh giá sản phẩm | `TC-REV-01`, `TC-REV-02` |
| UC15 | Chat realtime giữa User và Shop | `TC-CHAT-01`, `TC-CHAT-02`, `TC-CHAT-03`, `TC-CHAT-04` |
| UC16 | Nhận gợi ý sản phẩm cá nhân hóa | `TC-REC-01`, `TC-REC-02` |
| UC17 | Xem gợi ý sản phẩm tương tự | `TC-REC-03`, `TC-REC-04` |
| UC18 | Hỏi đáp với trợ lý AI | `TC-AI-01`, `TC-AI-02`, `TC-AI-03` |
| UC19 | Xem danh sách hội thoại AI và lịch sử tin nhắn | `TC-AI-04`, `TC-AI-05` |
| UC20 | Shop cập nhật hồ sơ và địa chỉ vận hành cửa hàng | `TC-SHOP-10`, `TC-SHOP-11` |
| UC21 | Shop theo dõi thống kê kinh doanh | `TC-SHOP-12` |
| UC22 | Shop đăng ký cửa hàng với GHN | `TC-SHOP-13` |
| UC23 | Shop gửi yêu cầu tạo thương hiệu mới | `TC-DATA-01` |
| UC24 | Shop gửi yêu cầu tạo sản phẩm mới | `TC-DATA-02` |
| UC25 | Shop theo dõi trạng thái các yêu cầu đã gửi | `TC-DATA-03`, `TC-DATA-04`, `TC-DATA-05` |
| UC26 | Shop xem lịch sử giao dịch tồn kho | `TC-INV-01` |
| UC27 | Shop nhập kho và ghi nhận inventory ledger | `TC-INV-02`, `TC-INV-03` |
| UC28 | Admin quản lý người dùng | `TC-ADM-01`, `TC-ADM-02`, `TC-ADM-03`, `TC-ADM-04` |
| UC29 | Admin duyệt hoặc từ chối yêu cầu mở shop | `TC-ADM-05`, `TC-ADM-06` |
| UC30 | Admin quản lý danh mục sản phẩm | `TC-ADM-07`, `TC-ADM-08`, `TC-ADM-09`, `TC-ADM-10` |
| UC31 | Admin quản lý thương hiệu | `TC-ADM-11`, `TC-ADM-12`, `TC-ADM-13`, `TC-ADM-14` |
| UC32 | Admin quản lý catalog sản phẩm | `TC-ADM-15`, `TC-ADM-16`, `TC-ADM-17`, `TC-ADM-18` |
| UC33 | Admin duyệt hoặc từ chối yêu cầu thương hiệu | `TC-ADM-19`, `TC-ADM-20` |
| UC34 | Admin duyệt hoặc từ chối yêu cầu sản phẩm | `TC-ADM-21`, `TC-ADM-22` |
| UC35 | Quản trị tri thức AI | `TC-AI-06`, `TC-AI-07` |
| UC36 | Ghi nhận sự kiện hành vi sản phẩm | `TC-REC-05` |
| UC37 | Cập nhật trạng thái thanh toán qua webhook SePay | `TC-PAY-01`, `TC-PAY-02`, `TC-PAY-03` |
| UC38 | Cấp quyền upload ảnh qua presigned URL | `TC-UPL-01`, `TC-UPL-02`, `TC-UPL-03` |

---

## 3) Bộ test case chi tiết

### 3.1. Tài khoản, hồ sơ và truy cập công khai

| ID | UC | Module | Loại | Mục tiêu | Tiền điều kiện | Bước kiểm thử | Kết quả mong đợi | Trạng thái |
|---|---|---|---|---|---|---|---|---|
| TC-AUTH-01 | UC01 | Auth | MANUAL | Đăng ký tài khoản hợp lệ | Chưa có email test | `POST /api/auth/register` với email, username, password hợp lệ | `201/200`, tạo user mới thành công | |
| TC-AUTH-02 | UC01 | Auth | MANUAL | Chặn đăng ký trùng email hoặc username | Đã có user test | Gửi lại request đăng ký với email/username cũ | `400`, có message trùng dữ liệu | |
| TC-AUTH-03 | UC09 | Auth | AUTO (existing) | Đăng nhập hợp lệ | Có user test | `POST /api/auth/login` với credentials đúng | `200`, trả access token và refresh token | |
| TC-AUTH-04 | UC09 | Auth | AUTO (existing) | Đăng nhập sai mật khẩu | Có user test | Gọi login với password sai | `401/400`, không trả token hợp lệ | |
| TC-AUTH-05 | UC09 | Auth | MANUAL | Refresh token hợp lệ | Có refresh token còn sống | `POST /api/auth/refresh-token` | `200`, cấp access token mới | |
| TC-USER-01 | UC10 | User | AUTO (existing) | Xem hồ sơ cá nhân khi đã đăng nhập | Có token user | `GET /api/users/profile` | `200`, trả profile đúng user hiện tại | |
| TC-USER-02 | UC10 | User | MANUAL | Cập nhật hồ sơ cá nhân | Có token user | `PUT /api/users/profile` với dữ liệu hợp lệ | `200`, các trường được cập nhật đúng | |
| TC-USER-03 | UC11 | Address | MANUAL | Xem danh sách địa chỉ giao hàng | Có token user | `GET /api/users/addresses` | `200`, trả danh sách địa chỉ của user | |
| TC-USER-04 | UC11 | Address | MANUAL | Tạo địa chỉ giao hàng mới | Có token user | `POST /api/users/addresses` với payload hợp lệ | `201/200`, sinh địa chỉ mới | |
| TC-USER-05 | UC11 | Address | MANUAL | Cập nhật địa chỉ giao hàng | Có địa chỉ thuộc user | `PUT /api/users/addresses/:id` | `200`, dữ liệu địa chỉ thay đổi đúng | |
| TC-USER-06 | UC11 | Address | MANUAL | Xóa địa chỉ giao hàng | Có địa chỉ thuộc user | `DELETE /api/users/addresses/:id` | `200`, địa chỉ bị xóa hoặc không còn xuất hiện | |
| TC-PUB-01 | UC12 | Store | MANUAL | Xem thông tin cửa hàng công khai | Có `store_id` hợp lệ | `GET /api/stores/:id` hoặc mở trang shop công khai | `200`, hiển thị thông tin shop hợp lệ | |
| TC-PUB-02 | UC13 | Category | MANUAL | Xem danh mục công khai | Có dữ liệu category | `GET /api/categories` | `200`, trả danh sách danh mục | |
| TC-PUB-03 | UC13 | Brand | MANUAL | Xem thương hiệu công khai | Có dữ liệu brand | `GET /api/brands` | `200`, trả danh sách thương hiệu | |

### 3.2. Sản phẩm, giỏ hàng, đơn hàng và đánh giá

| ID | UC | Module | Loại | Mục tiêu | Tiền điều kiện | Bước kiểm thử | Kết quả mong đợi | Trạng thái |
|---|---|---|---|---|---|---|---|---|
| TC-PRD-01 | UC02 | Product | AUTO (existing) | Duyệt danh sách sản phẩm | DB có sản phẩm active | `GET /api/products?page=1&limit=10` | `200`, trả danh sách có phân trang | |
| TC-PRD-02 | UC02 | Product | AUTO (existing) | Tìm kiếm/lọc sản phẩm | DB có dữ liệu phù hợp | `GET /api/products?q=iphone&brand_id=...` | `200`, kết quả khớp bộ lọc | |
| TC-PRD-03 | UC02 | Product | AUTO (existing) | Xem chi tiết sản phẩm | Có `product_id` hợp lệ | `GET /api/products/:id` | `200`, trả ảnh, giá, specs, store liên quan | |
| TC-PRD-04 | UC02 | Product | MANUAL | Danh sách rỗng khi filter không khớp | Có dữ liệu DB | Gọi product list với query không tồn tại | `200`, danh sách rỗng và metadata hợp lệ | |
| TC-CART-01 | UC03 | Cart | AUTO (existing) | Xem giỏ hàng của user | Có token user | `GET /api/cart` | `200`, trả danh sách item trong giỏ | |
| TC-CART-02 | UC03 | Cart | MANUAL | Thêm sản phẩm vào giỏ | Có token user và sản phẩm hợp lệ | `POST /api/cart/items` | `200/201`, item được thêm vào giỏ | |
| TC-CART-03 | UC03 | Cart | MANUAL | Cập nhật số lượng item | Có item trong giỏ | `PUT /api/cart/items/:id` | `200`, quantity thay đổi đúng | |
| TC-CART-04 | UC03 | Cart | MANUAL | Xóa một item trong giỏ | Có item trong giỏ | `DELETE /api/cart/items/:id` | `200`, item bị xóa khỏi giỏ | |
| TC-CART-05 | UC03 | Cart | MANUAL | Làm rỗng toàn bộ giỏ | Có nhiều item trong giỏ | `DELETE /api/cart` | `200`, giỏ trở thành rỗng | |
| TC-ORD-01 | UC04 | Order | MANUAL | Checkout COD từ giỏ hàng | Có token user, địa chỉ, item hợp lệ | `POST /api/orders/checkout` với `payment_method=cod` | `201`, tạo order thành công | |
| TC-ORD-02 | UC04 | Order | MANUAL | Checkout chuyển khoản trả thông tin SePay | Có token user, item hợp lệ | `POST /api/orders/checkout` với `payment_method=bank_transfer` | `201`, response có `transfer_instructions`, mã QR hoặc thông tin chuyển khoản | |
| TC-ORD-03 | UC04 | Order | MANUAL | Ước tính phí vận chuyển | Có token user, địa chỉ và item hợp lệ | `POST /api/orders/shipping-fee-estimate` | `200`, trả shipping fee hợp lệ | |
| TC-ORD-04 | UC04 | Order | MANUAL | Chặn user mua listing của chính shop mình | User đang có role shop và listing của chính shop | Thực hiện checkout item do chính shop đó bán | `400`, bị chặn với message phù hợp | |
| TC-ORD-05 | UC05 | Order | MANUAL | Xem danh sách đơn hàng của tôi | Có order thuộc user | `GET /api/orders/me` | `200`, trả danh sách order của đúng user | |
| TC-ORD-06 | UC05 | Order | MANUAL | Xem thông tin chuyển khoản các đơn pending | Có order bank transfer pending | `GET /api/orders/transfer-info?order_ids=...` | `200`, trả trạng thái và hướng dẫn thanh toán | |
| TC-ORD-07 | UC05 | Order | MANUAL | User xác nhận đã nhận hàng | Có order đủ điều kiện xác nhận | `PUT /api/orders/:id/received` | `200`, trạng thái đơn chuyển sang hoàn tất | |
| TC-REV-01 | UC14 | Review | MANUAL | Tạo đánh giá sản phẩm sau mua | User đã mua sản phẩm | `POST /api/reviews` với rating/comment hợp lệ | `201/200`, review được tạo thành công | |
| TC-REV-02 | UC14 | Review | MANUAL | Xem danh sách đánh giá theo sản phẩm | Có review trên sản phẩm | `GET /api/reviews/product/:productId` | `200`, trả danh sách review đúng sản phẩm | |

### 3.3. Chat giữa user-shop, AI assistant và recommendation

| ID | UC | Module | Loại | Mục tiêu | Tiền điều kiện | Bước kiểm thử | Kết quả mong đợi | Trạng thái |
|---|---|---|---|---|---|---|---|---|
| TC-CHAT-01 | UC15 | Chat | MANUAL | Mở hội thoại với cửa hàng | Có token user và `store_id` hợp lệ | `POST /api/chat/open-store` | `200/201`, tạo hoặc mở conversation thành công | |
| TC-CHAT-02 | UC15 | Chat | MANUAL | Lấy danh sách hội thoại user-shop | Có token user, đã có conversation | `GET /api/chat/conversations` | `200`, trả danh sách conversation | |
| TC-CHAT-03 | UC15 | Chat | MANUAL | Lấy lịch sử tin nhắn với peer | Có conversation và `peerUserId` hợp lệ | `GET /api/chat/messages/:peerUserId` | `200`, trả message history đúng cặp hội thoại | |
| TC-CHAT-04 | UC15 | Chat | MANUAL | Gửi tin nhắn user-shop | Có conversation mở sẵn | `POST /api/chat/messages` | `200/201`, tin nhắn mới được lưu và đồng bộ | |
| TC-REC-01 | UC16 | Recommendation | MANUAL | Gợi ý cá nhân hóa cho user đăng nhập | Có token user | `GET /api/products/recommendations/me?mode=hybrid&limit=8` | `200`, trả danh sách `products` gợi ý cá nhân | |
| TC-REC-02 | UC16 | Recommendation | MANUAL | Cold start recommendation vẫn có fallback | User mới ít hoặc chưa có event | Gọi endpoint recommendation cá nhân | `200`, trả danh sách dựa trên fallback thay vì lỗi | |
| TC-REC-03 | UC17 | Recommendation | MANUAL | Gợi ý sản phẩm tương tự theo content | Có `product_id` hợp lệ | `GET /api/products/:id/recommendations?mode=content` | `200`, trả sản phẩm tương tự và loại trừ chính sản phẩm hiện tại | |
| TC-REC-04 | UC17 | Recommendation | MANUAL | Gợi ý sản phẩm tương tự theo collaborative | Có `product_id` hợp lệ và recommender hoạt động | `GET /api/products/:id/recommendations?mode=collaborative` | `200`, trả danh sách theo mode collaborative hoặc fallback hợp lệ | |
| TC-REC-05 | UC36 | Event | MANUAL | Ghi nhận sự kiện hành vi sản phẩm | Có token user và `product_id` hợp lệ | `POST /api/events/product` với event type hợp lệ | `200/201`, sự kiện được ghi nhận thành công | |
| TC-AI-01 | UC18 | Assistant | AUTO (existing) | Chat AI không token bị chặn | Không có token | `POST /api/assistant/chat` | `401/403`, không cho truy cập | |
| TC-AI-02 | UC18 | Assistant | AUTO (existing) | Chat AI có token trả lời thành công | Có token user và chatbot service chạy | `POST /api/assistant/chat` với message hợp lệ | `200`, trả `answer`, `conversation_id`, `usage` | |
| TC-AI-03 | UC18 | Assistant | MANUAL | Chat build PC theo ngân sách có nội dung hợp lý | Có token user, dữ liệu chatbot đủ | Hỏi “build pc 50 triệu” | Trả lời có cấu hình/linh kiện phù hợp theo intent build PC | |
| TC-AI-04 | UC19 | Assistant | AUTO (existing) | Xem danh sách hội thoại AI | Có token user, đã từng chat | `GET /api/assistant/conversations` | `200`, trả danh sách conversation | |
| TC-AI-05 | UC19 | Assistant | AUTO (existing) | Xem lịch sử tin nhắn AI | Có token user và `conversationId` hợp lệ | `GET /api/assistant/messages/:conversationId` | `200`, trả danh sách message đúng conversation | |
| TC-AI-06 | UC35 | Assistant Admin | MANUAL | Admin ingest tri thức mới cho chatbot | Có token admin và payload document hợp lệ | `POST /api/assistant/ingest` | `201/200`, ingestion thành công | |
| TC-AI-07 | UC35 | Assistant Admin | MANUAL | Admin reindex knowledge base | Có token admin | `POST /api/assistant/reindex` | `200`, reindex thành công và có thống kê sync hợp lệ | |

### 3.4. Nghiệp vụ shop, kho và yêu cầu dữ liệu

| ID | UC | Module | Loại | Mục tiêu | Tiền điều kiện | Bước kiểm thử | Kết quả mong đợi | Trạng thái |
|---|---|---|---|---|---|---|---|---|
| TC-SHOP-01 | UC06 | Store Request | MANUAL | Gửi yêu cầu mở shop | Có token user chưa là shop | `POST /api/stores/requests` với payload hợp lệ | `201/200`, tạo request mở shop thành công | |
| TC-SHOP-02 | UC06 | Store Request | MANUAL | Xem yêu cầu mở shop của tôi | Có token user và request đã tạo | `GET /api/stores/requests/me` | `200`, trả lịch sử request của user hiện tại | |
| TC-SHOP-03 | UC07 | Product Listing | MANUAL | Shop xem listing của mình | Có token shop | `GET /api/products/me` | `200`, trả danh sách listing thuộc shop | |
| TC-SHOP-04 | UC07 | Product Listing | MANUAL | Shop tạo listing từ catalog | Có token shop, catalog hợp lệ, store thuộc shop | `POST /api/products` | `201`, listing mới được tạo | |
| TC-SHOP-05 | UC07 | Product Listing | MANUAL | Shop cập nhật listing thuộc quyền sở hữu | Có listing thuộc shop | `PUT /api/products/:id` | `200`, dữ liệu listing cập nhật đúng | |
| TC-SHOP-06 | UC07 | Product Listing | MANUAL | Shop xóa listing thuộc quyền sở hữu | Có listing thuộc shop | `DELETE /api/products/:id` | `200`, listing bị xóa hoặc không còn active | |
| TC-SHOP-07 | UC08 | Shop Order | MANUAL | Shop xem danh sách đơn của shop | Có token shop và có đơn thuộc shop | `GET /api/orders/shop/me` | `200`, trả danh sách order của đúng shop | |
| TC-SHOP-08 | UC08 | Shop Order | MANUAL | Shop duyệt đơn hàng | Có order pending thuộc shop | `PUT /api/orders/shop/:id/approve` | `200`, trạng thái đơn thay đổi hợp lệ | |
| TC-SHOP-09 | UC08 | Shop Order | MANUAL | Shop từ chối đơn hàng | Có order pending thuộc shop | `PUT /api/orders/shop/:id/reject` | `200`, trạng thái bị từ chối và tồn kho được hoàn trả đúng | |
| TC-SHOP-10 | UC20 | Store Profile | MANUAL | Shop cập nhật hồ sơ cửa hàng | Có token shop và store thuộc shop | `PUT /api/stores/:id/profile` | `200`, thông tin profile store được cập nhật | |
| TC-SHOP-11 | UC20 | Store Profile | MANUAL | Shop cập nhật địa chỉ vận hành | Có token shop và store thuộc shop | `PUT /api/stores/:id/address` | `200`, địa chỉ store thay đổi đúng | |
| TC-SHOP-12 | UC21 | Analytics | MANUAL | Shop xem thống kê kinh doanh | Có token shop và có dữ liệu đơn | `GET /api/orders/shop/analytics` | `200`, trả số liệu analytics đúng định dạng | |
| TC-SHOP-13 | UC22 | GHN | MANUAL | Shop đăng ký cửa hàng với GHN | Có token shop và store đủ thông tin | `POST /api/stores/:id/ghn/register` | `200/201`, thông tin GHN được lưu thành công | |
| TC-DATA-01 | UC23 | Brand Request | MANUAL | Shop gửi yêu cầu tạo thương hiệu | Có token shop | `POST /api/brands/requests` | `201`, brand request được tạo | |
| TC-DATA-02 | UC24 | Product Request | MANUAL | Shop gửi yêu cầu tạo sản phẩm mới | Có token shop, category/brand hợp lệ | `POST /api/products/requests` | `201`, product request được tạo | |
| TC-DATA-03 | UC25 | Store Request | MANUAL | Shop/User xem trạng thái yêu cầu mở shop | Có request mở shop đã tạo | `GET /api/stores/requests/me?status=all` | `200`, trả trạng thái request đúng | |
| TC-DATA-04 | UC25 | Brand Request | MANUAL | Shop xem trạng thái yêu cầu brand | Có brand request đã tạo | `GET /api/brands/requests/me` | `200`, trả lịch sử brand request | |
| TC-DATA-05 | UC25 | Product Request | MANUAL | Shop xem trạng thái yêu cầu sản phẩm | Có product request đã tạo | `GET /api/products/requests/me` | `200`, trả lịch sử product request | |
| TC-INV-01 | UC26 | Inventory | MANUAL | Xem lịch sử giao dịch tồn kho theo sản phẩm | Có token shop và product thuộc shop | `GET /api/stores/me/inventory/:productId/transactions` | `200`, trả transaction history của tồn kho | |
| TC-INV-02 | UC27 | Inventory | MANUAL | Nhập kho thành công | Có token shop và product hợp lệ | `POST /api/stores/me/inventory/import` | `200/201`, `on_hand` tăng, ledger IMPORT sinh ra | |
| TC-INV-03 | UC27 | Inventory | MANUAL | Chặn nhập kho với dữ liệu không hợp lệ | Có token shop | Gửi quantity hoặc unit_cost không hợp lệ | `400`, không làm sai dữ liệu kho | |

### 3.5. Quản trị hệ thống và tích hợp

| ID | UC | Module | Loại | Mục tiêu | Tiền điều kiện | Bước kiểm thử | Kết quả mong đợi | Trạng thái |
|---|---|---|---|---|---|---|---|---|
| TC-ADM-01 | UC28 | Admin User | MANUAL | Lấy danh sách người dùng | Có token admin | `GET /api/admin/users` | `200`, trả danh sách user | |
| TC-ADM-02 | UC28 | Admin User | MANUAL | Lấy thống kê người dùng | Có token admin | `GET /api/admin/users/stats` | `200`, trả thống kê đúng định dạng | |
| TC-ADM-03 | UC28 | Admin User | MANUAL | Tìm kiếm người dùng | Có token admin | `GET /api/admin/users/search?email=...` | `200`, trả kết quả tìm kiếm phù hợp | |
| TC-ADM-04 | UC28 | Admin User | MANUAL | Xem chi tiết một người dùng | Có token admin và `user_id` hợp lệ | `GET /api/admin/users/:id` | `200`, trả thông tin chi tiết user | |
| TC-ADM-05 | UC29 | Admin Store Request | MANUAL | Duyệt yêu cầu mở shop | Có token admin và request pending | `PUT /api/admin/store-requests/:id/approve` | `200`, request được duyệt, user/shop cập nhật đúng | |
| TC-ADM-06 | UC29 | Admin Store Request | MANUAL | Từ chối yêu cầu mở shop | Có token admin và request pending | `PUT /api/admin/store-requests/:id/reject` | `200`, request bị từ chối với note phù hợp | |
| TC-ADM-07 | UC30 | Admin Category | MANUAL | Xem danh mục ở màn quản trị | Có token admin | `GET /api/admin/categories` | `200`, trả danh sách category | |
| TC-ADM-08 | UC30 | Admin Category | MANUAL | Tạo danh mục mới | Có token admin | `POST /api/admin/categories` | `201`, category mới được tạo | |
| TC-ADM-09 | UC30 | Admin Category | MANUAL | Cập nhật danh mục | Có token admin và category hợp lệ | `PUT /api/admin/categories/:id` | `200`, category cập nhật đúng | |
| TC-ADM-10 | UC30 | Admin Category | MANUAL | Xóa danh mục | Có token admin và category không bị chặn bởi ràng buộc | `DELETE /api/admin/categories/:id` | `200`, category bị xóa | |
| TC-ADM-11 | UC31 | Admin Brand | MANUAL | Tạo brand mới | Có token admin | `POST /api/admin/brands` | `201`, brand được tạo | |
| TC-ADM-12 | UC31 | Admin Brand | MANUAL | Cập nhật brand | Có token admin và brand hợp lệ | `PUT /api/admin/brands/:id` | `200`, brand cập nhật đúng | |
| TC-ADM-13 | UC31 | Admin Brand | MANUAL | Xóa brand | Có token admin | `DELETE /api/admin/brands/:id` | `200`, brand bị xóa | |
| TC-ADM-14 | UC31 | Admin Brand | MANUAL | Xem brand công khai sau thao tác quản trị | Có dữ liệu brand | `GET /api/brands` sau create/update/delete | Danh sách công khai phản ánh đúng thay đổi | |
| TC-ADM-15 | UC32 | Admin Catalog | MANUAL | Xem danh sách catalog sản phẩm | Có token admin | `GET /api/admin/catalog-products` | `200`, trả danh sách catalog | |
| TC-ADM-16 | UC32 | Admin Catalog | MANUAL | Cập nhật catalog sản phẩm | Có token admin và catalog hợp lệ | `PUT /api/admin/catalog-products/:id` | `200`, catalog được cập nhật | |
| TC-ADM-17 | UC32 | Admin Catalog | MANUAL | Duyệt catalog sản phẩm | Có token admin và catalog pending | `PUT /api/admin/catalog-products/:id/approve` | `200`, trạng thái catalog đổi đúng | |
| TC-ADM-18 | UC32 | Admin Catalog | MANUAL | Từ chối hoặc xóa catalog sản phẩm | Có token admin và catalog phù hợp | `PUT /api/admin/catalog-products/:id/reject` hoặc `DELETE /api/admin/catalog-products/:id` | `200`, catalog bị reject/xóa đúng | |
| TC-ADM-19 | UC33 | Admin Brand Request | MANUAL | Duyệt yêu cầu thương hiệu | Có token admin và brand request pending | `PUT /api/admin/brand-requests/:id/approve` | `200`, brand request được xử lý thành công | |
| TC-ADM-20 | UC33 | Admin Brand Request | MANUAL | Từ chối yêu cầu thương hiệu | Có token admin và brand request pending | `PUT /api/admin/brand-requests/:id/reject` | `200`, request bị reject với note phù hợp | |
| TC-ADM-21 | UC34 | Admin Product Request | MANUAL | Duyệt yêu cầu sản phẩm | Có token admin và product request pending | `PUT /api/admin/product-requests/:id/approve` | `200`, product request được duyệt | |
| TC-ADM-22 | UC34 | Admin Product Request | MANUAL | Từ chối yêu cầu sản phẩm | Có token admin và product request pending | `PUT /api/admin/product-requests/:id/reject` | `200`, product request bị từ chối | |
| TC-PAY-01 | UC37 | SePay Webhook | MANUAL | Webhook thanh toán đủ tiền cập nhật payment | Có order bank transfer pending và payload hợp lệ | `POST /api/webhooks/sepay` với `transferAmount >= payment.amount` | Event được ghi nhận, `payment.status` đổi sang `completed` | |
| TC-PAY-02 | UC37 | SePay Webhook | MANUAL | Webhook thiếu tiền bị bỏ qua | Có order bank transfer pending | Gửi webhook với `transferAmount < payment.amount` | Event `ignored`, payment không completed | |
| TC-PAY-03 | UC37 | SePay Webhook | MANUAL | Webhook trùng `sepay_id` không xử lý lại | Có event đã processed | Gửi lại cùng payload cùng `sepay_id` | Response duplicated và không xử lý lại business logic chính | |
| TC-UPL-01 | UC38 | Upload/S3 | AUTO (existing) | Presign upload có token | Có token user hoặc shop | `POST /api/uploads/presign` | `200/201`, trả presigned URL hợp lệ | |
| TC-UPL-02 | UC38 | Upload/S3 | MANUAL | Upload file thành công qua presigned URL | Đã có URL presign hợp lệ | `PUT` file lên URL đã ký | `200`, file truy cập được tại URL lưu trữ | |
| TC-UPL-03 | UC38 | Upload/S3 | MANUAL | Chặn presign khi không có token | Không có token | `POST /api/uploads/presign` | `401/403`, không cấp URL upload | |

---

## 4) Nhóm bảo mật và quyền truy cập nên luôn chạy kèm

| ID | Mục tiêu | Kiểm thử | Kết quả mong đợi |
|---|---|---|---|
| TC-SEC-01 | Chặn API hồ sơ khi không có token | `GET /api/users/profile` không auth | `401/403` |
| TC-SEC-02 | Chặn chat AI khi không có token | `POST /api/assistant/chat` không auth | `401/403` |
| TC-SEC-03 | Chặn giỏ hàng khi không có token | `GET /api/cart` không auth | `401/403` |
| TC-SEC-04 | Chặn shop khác duyệt đơn không thuộc quyền | Shop B gọi approve/reject đơn của Shop A | `403/404` |
| TC-SEC-05 | Chặn user khác đọc đơn không thuộc quyền | User B gọi order của User A | `403/404` |
| TC-SEC-06 | Chặn admin API khi token không phải admin | User hoặc shop gọi `/api/admin/*` | `403` |

---

## 5) Gợi ý ưu tiên thực thi

1. Chạy ngay nhóm `AUTO (existing)` để xác nhận môi trường không vỡ.
2. Chạy tiếp các nhóm giao dịch chính: `UC02 -> UC05`, `UC07 -> UC08`, `UC37`.
3. Chạy nhóm AI: `UC16 -> UC19`, `UC35`, `UC36`.
4. Chạy nhóm quản trị và dữ liệu nền: `UC23 -> UC34`.

---

## 6) Kết luận sử dụng tài liệu này

- Đây là bộ test case bao phủ toàn bộ use case đang có trong Chương 3 và đối chiếu lại theo code backend hiện tại.
- Các ca `AUTO (existing)` đã có sẵn nền để chạy lại bằng Playwright/API regression.
- Các ca `MANUAL` và `AUTO (new)` là phần em cần viết nốt hoặc thực thi bổ sung để đạt bao phủ toàn ứng dụng.
- Nếu muốn chuyển bộ này sang báo cáo khóa luận, có thể rút gọn thành các ca tiêu biểu, còn file này giữ vai trò danh mục kiểm thử đầy đủ của toàn hệ thống.

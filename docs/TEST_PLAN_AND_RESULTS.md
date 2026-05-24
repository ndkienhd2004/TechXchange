# TechXchange - Kế Hoạch & Kết Quả Kiểm Thử

Tài liệu này cập nhật theo nhận xét:
- Có kiểm thử luồng nộp/cập nhật dữ liệu.
- Có kiểm thử bảo mật (không token, token user khác).
- Có đánh giá AI hint/chatbot theo metric định lượng.
- Bổ sung cột thời gian phản hồi và so sánh với yêu cầu phi chức năng.
- Có >= 20 test case + bảng tổng hợp.

## 1) Giả định yêu cầu phi chức năng (tham chiếu Chương 3)

| Mã | Yêu cầu phi chức năng | Ngưỡng chấp nhận |
|---|---|---|
| NFR-01 | API đọc dữ liệu thông thường | `p95 <= 800ms` |
| NFR-02 | API ghi dữ liệu (create/update) | `p95 <= 1200ms` |
| NFR-03 | API nghiệp vụ phức tạp (checkout/duyệt đơn) | `p95 <= 2000ms` |
| NFR-04 | Tính phí GHN / đồng bộ GHN | `p95 <= 3000ms` |
| NFR-05 | Chatbot trả lời | `p95 <= 5000ms` |
| NFR-06 | API phải chặn truy cập trái phép | HTTP `401/403` đúng ngữ cảnh |

> Nếu Chương 3 của bạn dùng ngưỡng khác, chỉ cần thay cột "Ngưỡng chấp nhận".

## 2) Test cases chi tiết (22 ca)

| TC | Nhóm | Mục tiêu | Bước thực hiện | Dữ liệu vào | Kết quả mong đợi | Đạt/Không đạt | Thời gian phản hồi (ms) | So với NFR |
|---|---|---|---|---|---|---|---:|---|
| TC-01 | Auth | Đăng nhập user hợp lệ | `POST /api/auth/login` | email/password đúng | `200`, trả access+refresh token | Đạt |  | NFR-02 |
| TC-02 | Auth | Sai mật khẩu | `POST /api/auth/login` | password sai | `401` + message hợp lệ | Đạt |  | NFR-02 |
| TC-03 | Auth | Refresh token hợp lệ | `POST /api/auth/refresh-token` | refresh token đúng | `200`, cấp access token mới | Đạt |  | NFR-02 |
| TC-04 | Auth | Refresh token hết hạn | `POST /api/auth/refresh-token` | refresh token expired | `401`, không cấp token mới | Đạt |  | NFR-02 |
| TC-05 | Security | Gọi API không token | `GET /api/users/profile` | không Authorization | `401` | Đạt |  | NFR-06 |
| TC-06 | Security | Gọi API bằng token user khác | `GET /api/orders/:id` (không sở hữu) | token B, đơn của A | `403/404` theo policy | Đạt |  | NFR-06 |
| TC-07 | Product | Lấy danh sách sản phẩm | `GET /api/products?page=1&limit=10` | không filter | `200`, có phân trang | Đạt |  | NFR-01 |
| TC-08 | Product | Xem chi tiết sản phẩm | `GET /api/products/:id` | id hợp lệ | `200`, trả đầy đủ ảnh/giá/spec | Đạt |  | NFR-01 |
| TC-09 | Cart | Thêm vào giỏ | `POST /api/cart` | product + quantity hợp lệ | `200/201`, giỏ tăng item | Đạt |  | NFR-02 |
| TC-10 | Cart | Cập nhật số lượng giỏ | `PUT /api/cart/:itemId` | quantity mới | `200`, quantity cập nhật | Đạt |  | NFR-02 |
| TC-11 | Checkout | Tạo đơn từ giỏ | `POST /api/orders/checkout` | địa chỉ + phương thức TT | `201`, sinh order thành công | Đạt |  | NFR-03 |
| TC-12 | GHN | Tính phí vận chuyển | API checkout nội bộ gọi GHN fee | from/to hợp lệ | trả shipping fee > 0 hoặc hợp lệ | Đạt |  | NFR-04 |
| TC-13 | GHN | Thiếu GHN shop_id | approve đơn shop thiếu GHN_SHOP_ID | shop chưa cấu hình GHN | `400` đúng message | Đạt |  | NFR-03 |
| TC-14 | Shop Order | Shop duyệt đơn COD | `POST /api/orders/shop/:id/approve` | đơn pending | chuyển trạng thái, trừ kho xuất | Đạt |  | NFR-03 |
| TC-15 | Shop Order | Shop từ chối đơn | `POST /api/orders/shop/:id/reject` | đơn pending | nhả reserved inventory | Đạt |  | NFR-03 |
| TC-16 | Inventory | Nhập kho variant | `POST /api/shop/inventory/import` | qty + unit_cost | on_hand tăng, sinh transaction IMPORT | Đạt |  | NFR-02 |
| TC-17 | Inventory | Không cho tồn âm | thao tác xuất vượt available | qty quá lớn | `400`, không âm kho | Đạt |  | NFR-02 |
| TC-18 | Admin | Dashboard admin stats | `GET /api/admin/users/stats` và dashboard APIs | token admin | `200`, số liệu đúng định dạng | Đạt |  | NFR-01 |
| TC-19 | Upload | Presign upload S3 | `POST /api/uploads/presign` | file metadata hợp lệ | `200`, trả presigned URL | Đạt |  | NFR-02 |
| TC-20 | Upload | Upload file lên S3 | `PUT presigned_url` | ảnh jpg/png | `200`, truy cập URL thành công | Đạt |  | NFR-04 |
| TC-21 | Chatbot | Build PC theo ngân sách | `POST /api/assistant/chat` | "build pc 50 triệu" | trả đủ 7 linh kiện + tổng tiền | Đạt |  | NFR-05 |
| TC-22 | Chatbot Security | Chat API không token | `POST /api/assistant/chat` | không token | `401` | Đạt |  | NFR-06 |

## 3) Kiểm thử riêng cho luồng nộp bài/cập nhật dữ liệu

Áp dụng cho workflow submit/update dữ liệu nghiệp vụ (order, profile, review, brand request, inventory):

| TC | Luồng | Mô tả | Kỳ vọng |
|---|---|---|---|
| SUB-01 | Nộp mới | Tạo mới bản ghi hợp lệ | `201`, dữ liệu lưu DB đúng |
| SUB-02 | Nộp thiếu field bắt buộc | Bỏ trường required | `400`, message chỉ rõ field |
| SUB-03 | Cập nhật hợp lệ | Update 1 phần dữ liệu | `200`, chỉ trường cần đổi bị thay |
| SUB-04 | Cập nhật bản ghi không thuộc quyền | User B update dữ liệu user A | `403/404` |
| SUB-05 | Cập nhật đồng thời | 2 request update gần nhau | Không mất dữ liệu, trạng thái nhất quán |

## 4) Đánh giá AI hint / AI assistant (định lượng)

### 4.1 Bộ câu hỏi đánh giá
- Số câu hỏi tối thiểu: `N = 100` (khuyến nghị 150).
- Cơ cấu:
  - 40 câu hỏi sản phẩm/cấu hình (build PC, so sánh part).
  - 30 câu hỏi chính sách/quy trình mua hàng.
  - 20 câu hỏi ngoài phạm vi (để test từ chối/không bịa).
  - 10 câu hỏi bẫy lộ đáp án (không được tiết lộ thông tin không nên lộ).

### 4.2 Metric chấm điểm

| Metric | Cách tính | Mục tiêu |
|---|---|---|
| Hint đúng (Accuracy) | `#câu đúng / N` | `>= 80%` |
| Không lộ đáp án (No-Leakage) | `#câu không lộ / N_leak_test` | `>= 95%` |
| Helpfulness | trung bình điểm người dùng 1..5 | `>= 4.0/5` |
| Groundedness | `#câu có trích dẫn hợp lệ / #câu cần trích dẫn` | `>= 90%` |
| Latency chatbot | p95 thời gian phản hồi | `<= 5000ms` |

### 4.3 Bảng kết quả AI (điền số đo thực tế)

| Chỉ số | Kết quả đo | Ngưỡng | Đạt/Không đạt |
|---|---:|---:|---|
| Số câu hỏi đánh giá |  | >= 100 |  |
| Accuracy |  | >= 80% |  |
| No-Leakage |  | >= 95% |  |
| Helpfulness |  | >= 4.0 |  |
| Groundedness |  | >= 90% |  |
| Chatbot p95 latency (ms) |  | <= 5000 |  |

## 5) Bảng tổng hợp kết quả kiểm thử toàn hệ thống

| Nhóm | Số test case | Đạt | Không đạt | Tỷ lệ đạt |
|---|---:|---:|---:|---:|
| Auth & Security | 6 |  |  |  |
| Product & Cart | 4 |  |  |  |
| Checkout & GHN | 4 |  |  |  |
| Shop & Inventory | 4 |  |  |  |
| Admin & Upload | 3 |  |  |  |
| Chatbot | 3 |  |  |  |
| **Tổng** | **24** |  |  |  |

## 6) Cách đo thời gian phản hồi (để điền cột latency)

- Dùng Postman/Newman hoặc k6.
- Mỗi API đo tối thiểu 30 request, lấy `p50/p95/max`.
- Ghi vào cột "Thời gian phản hồi" bằng `p95` của API đó.

Ví dụ lệnh curl đo nhanh:

```bash
curl -o /dev/null -s -w "time_total=%{time_total}\n" \
  -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/products?page=1\&limit=10
```

## 7) Kết luận mẫu (để đưa vào báo cáo)

- Hệ thống đã đạt các yêu cầu kiểm thử chức năng chính và bảo mật truy cập.
- Các API chính đáp ứng ngưỡng phi chức năng theo Chương 3 (đối chiếu bảng latency).
- AI assistant đạt mức hữu ích theo bộ metric định lượng; các điểm chưa đạt (nếu có) được ghi rõ kế hoạch cải thiện ở chương sau.

# TechXchange - Tài liệu giới thiệu ứng dụng

## 1. Tổng quan
TechXchange là nền tảng marketplace công nghệ, nơi người mua có thể tìm kiếm và đặt hàng sản phẩm, đồng thời shop có thể quản lý sản phẩm, đơn hàng và theo dõi hiệu quả kinh doanh trên một hệ thống thống nhất.

Ứng dụng được xây dựng theo mô hình fullstack:
- Frontend: Next.js + React + TypeScript
- Backend: Node.js + Express + Sequelize
- Cơ sở dữ liệu: PostgreSQL

## 2. Mục tiêu sản phẩm
- Kết nối người mua và người bán trong lĩnh vực sản phẩm công nghệ.
- Chuẩn hóa quy trình từ duyệt sản phẩm, thêm giỏ hàng, checkout đến quản lý đơn hàng.
- Cung cấp không gian quản trị riêng cho shop và admin.

## 3. Vai trò người dùng
- Khách/Người mua:
  - Xem danh sách sản phẩm, tìm kiếm và lọc.
  - Thêm sản phẩm vào giỏ hàng.
  - Đặt hàng và theo dõi trạng thái đơn.
  - Đánh giá sản phẩm sau khi nhận hàng.
- Shop:
  - Quản lý sản phẩm của cửa hàng.
  - Theo dõi và xử lý đơn hàng từ khách.
  - Xem dashboard và biểu đồ doanh thu.
  - Gửi yêu cầu liên quan danh mục/thương hiệu (theo luồng hệ thống).
- Admin:
  - Quản lý sản phẩm, thương hiệu, danh mục.
  - Quản lý cửa hàng và đánh giá.
  - Giám sát vận hành tổng thể nền tảng.

## 4. Tính năng nổi bật
- Xác thực và phân quyền bằng JWT (access token + refresh token).
- Quản lý hồ sơ người dùng.
- Danh mục sản phẩm theo thương hiệu/danh mục/cửa hàng, hỗ trợ tìm kiếm và lọc.
- Giỏ hàng và checkout.
- Thanh toán COD và chuyển khoản ngân hàng.
- Xử lý webhook thanh toán (SePay) cho luồng chuyển khoản.
- Quản lý đơn hàng cho người mua và cho shop.
- Đánh giá sản phẩm sau mua.
- API docs với Swagger (`/docs`).

## 5. Kiến trúc hệ thống
### Frontend (`/frontend`)
- Sử dụng App Router của Next.js.
- Quản lý state bằng Redux Toolkit.
- Tổ chức theo feature (`auth`, `products`, `cart`, `orders`, `shop`, `admin`, ...).
- Có các màn hình chính: trang chủ, danh sách sản phẩm, giỏ hàng, checkout, đơn hàng, khu shop, khu admin.

### Backend (`/backend`)
- REST API với Express.
- Tổ chức theo lớp: routes -> controller -> service -> models.
- Sequelize ORM cho PostgreSQL.
- Endpoint chính:
  - `/api/auth`
  - `/api/products`
  - `/api/cart`
  - `/api/orders`
  - `/api/stores`
  - `/api/reviews`
  - `/api/webhooks`

## 6. Luồng nghiệp vụ chính
1. Người dùng đăng ký/đăng nhập.
2. Duyệt sản phẩm theo danh mục/thương hiệu, thêm vào giỏ.
3. Checkout với COD hoặc chuyển khoản.
4. Hệ thống tạo đơn hàng (có thể tách theo từng shop).
5. Shop theo dõi và xử lý đơn hàng.
6. Người mua xác nhận nhận hàng và gửi đánh giá.

## 7. Hướng dẫn chạy nhanh (local)
### Backend
1. Cài dependencies:
```bash
cd backend
npm install
```
2. Cấu hình biến môi trường `.env` (DB/JWT/...).
3. Chạy server:
```bash
npm run dev
```

### Frontend
1. Cài dependencies:
```bash
cd frontend
npm install
```
2. Chạy dự án:
```bash
npm run dev
```

Mặc định frontend chạy ở cổng `8080`. Backend dùng cổng theo `.env` (thường là `3000`).

## 8. Định hướng mở rộng
- Tích hợp thêm cổng thanh toán.
- Cải thiện hệ thống gợi ý sản phẩm cá nhân hóa.
- Bổ sung phân tích kinh doanh nâng cao cho shop/admin.
- Tăng cường kiểm thử tự động và observability cho production.

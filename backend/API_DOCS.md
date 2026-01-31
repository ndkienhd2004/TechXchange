# TechXchange API - Authentication Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

Tất cả protected routes yêu cầu JWT token trong header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Public Endpoints (Không yêu cầu token)

### 1. Đăng Ký

**POST** `/auth/register`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "username",
  "phone": "0123456789",
  "gender": "male"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "username",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2. Đăng Nhập

**POST** `/auth/login`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "username",
      "phone": "0123456789",
      "gender": "male",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. Reset Mật Khẩu

**POST** `/auth/reset-password`

**Request Body:**

```json
{
  "email": "user@example.com",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Reset mật khẩu thành công"
}
```

---

## Protected Endpoints (Yêu cầu token)

### 4. Lấy Thông Tin Profile

**GET** `/auth/profile`

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Lấy thông tin thành công",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "phone": "0123456789",
    "gender": "male",
    "role": "user",
    "created_at": "2026-01-10T10:00:00.000Z",
    "updated_at": "2026-01-10T10:00:00.000Z"
  }
}
```

---

### 5. Cập Nhật Profile

**PUT** `/auth/profile`

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "username": "newusername",
  "phone": "0987654321",
  "gender": "female"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Cập nhật thông tin thành công",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "username": "newusername",
    "phone": "0987654321",
    "gender": "female"
  }
}
```

---

### 6. Đổi Mật Khẩu

**POST** `/auth/change-password`

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "oldPassword": "password123",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công"
}
```

---

### 7. Xác Thực Token

**GET** `/auth/verify`

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Token hợp lệ",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "role": "user",
    "iat": 1694704800,
    "exp": 1694791200
  }
}
```

---

### 8. Đăng Xuất

**POST** `/auth/logout`

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Đăng xuất thành công. Vui lòng xóa token ở phía client."
}
```

---

### 9. Xóa Tài Khoản

**DELETE** `/auth/account`

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "password": "password123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Xóa tài khoản thành công"
}
```

---

## Admin Endpoints (Yêu cầu token + quyền admin)

### 10. Lấy Danh Sách Tất Cả Người Dùng

**GET** `/auth/users?limit=10&offset=0`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Query Parameters:**

- `limit` (optional): Số lượng bản ghi (mặc định: 10)
- `offset` (optional): Vị trí bắt đầu (mặc định: 0)

**Response (200):**

```json
{
  "success": true,
  "message": "Lấy danh sách người dùng thành công",
  "data": {
    "total": 50,
    "users": [
      {
        "id": 1,
        "email": "user1@example.com",
        "username": "user1",
        "phone": "0123456789",
        "gender": "male",
        "role": "user",
        "created_at": "2026-01-10T10:00:00.000Z"
      },
      {
        "id": 2,
        "email": "user2@example.com",
        "username": "user2",
        "phone": "0987654321",
        "gender": "female",
        "role": "user",
        "created_at": "2026-01-10T11:00:00.000Z"
      }
    ],
    "page": 1,
    "totalPages": 5
  }
}
```

---

### 11. Lấy Thông Tin Người Dùng Theo ID

**GET** `/auth/users/:id`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Lấy thông tin người dùng thành công",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "phone": "0123456789",
    "gender": "male",
    "role": "user",
    "created_at": "2026-01-10T10:00:00.000Z",
    "updated_at": "2026-01-10T10:00:00.000Z"
  }
}
```

---

## Error Responses

### 400 - Bad Request

```json
{
  "success": false,
  "message": "Email và mật khẩu là bắt buộc"
}
```

### 401 - Unauthorized

```json
{
  "success": false,
  "message": "Token không được cung cấp"
}
```

### 403 - Forbidden

```json
{
  "success": false,
  "message": "Bạn không có quyền truy cập tài nguyên này"
}
```

### 404 - Not Found

```json
{
  "success": false,
  "message": "Người dùng không tồn tại"
}
```

### 500 - Internal Server Error

```json
{
  "success": false,
  "message": "Lỗi server"
}
```

---

## Environment Variables

Tạo file `.env` ở thư mục root:

```env
JWT_SECRET=your-super-secret-key-here
DB_HOST=localhost
DB_PORT=5432
DB_NAME=techxchange
DB_USER=postgres
DB_PASSWORD=yourpassword
NODE_ENV=development
PORT=3000
```

---

## Testing với cURL

### Đăng Ký

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "username": "testuser"
  }'
```

### Đăng Nhập

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Lấy Profile (với token)

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## Notes

1. **Token Expiry**: Token hết hạn sau 24 giờ
2. **Password Requirements**: Mật khẩu tối thiểu 6 ký tự
3. **Email Validation**: Email phải có định dạng hợp lệ
4. **Unique Constraints**: Email và phone phải là duy nhất trong hệ thống
5. **Admin Role**: Chỉ admin mới có thể truy cập admin endpoints

---

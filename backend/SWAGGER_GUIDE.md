# Swagger Documentation Guide

## 📚 Swagger UI

Swagger UI cung cấp interface tương tác để test API của bạn.

### Truy cập Swagger UI

Sau khi chạy server, truy cập:

```
http://localhost:3000/docs
```

### Lợi ích của Swagger UI

✅ **Interactive Testing** - Test API trực tiếp từ browser
✅ **Auto Documentation** - Tự động tạo tài liệu từ code
✅ **Request/Response Examples** - Xem ví dụ request và response
✅ **Schema Validation** - Validate dữ liệu input/output
✅ **Authorization** - Quản lý JWT token dễ dàng

---

## 🚀 Cách sử dụng Swagger UI

### 1. Xem các endpoints

- Danh sách tất cả endpoints được nhóm theo tags (Authentication, User Profile, Admin)
- Click vào endpoint để xem chi tiết

### 2. Test endpoint

- Click "Try it out" button
- Nhập dữ liệu vào form
- Click "Execute"
- Xem response

### 3. Sử dụng Authorization

**Bước 1: Đăng nhập hoặc Đăng ký**

- Vào endpoint `/auth/register` hoặc `/auth/login`
- Nhập credentials
- Execute
- Copy `accessToken` từ response

**Bước 2: Set Bearer Token**

- Click "Authorize" button ở phía trên bên phải
- Chọn "bearerAuth"
- Paste token: `Bearer <your_access_token>`
- Click "Authorize"
- Click "Close"

**Bước 3: Test Protected Endpoints**

- Bây giờ có thể test protected endpoints (profile, change-password, etc.)
- Token sẽ được tự động thêm vào header

---

## 📝 API Endpoints

### Authentication

#### 1. Register (Đăng Ký)

```
POST /auth/register
```

**Request:**

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
    "user": { ... },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

#### 2. Login (Đăng Nhập)

```
POST /auth/login
```

**Request:**

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
  "data": {
    "user": { ... },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

#### 3. Refresh Token

```
POST /auth/refresh-token
```

**Request:**

```json
{
  "refreshToken": "eyJ..."
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

#### 4. Reset Password

```
POST /auth/reset-password
```

---

#### 5. Logout

```
POST /auth/logout
```

---

#### 6. Logout All Devices

```
POST /auth/logout-all
```

---

#### 7. Verify Token

```
GET /auth/verify
```

---

### User Profile

#### 1. Get Profile

```
GET /auth/profile
```

---

#### 2. Update Profile

```
PUT /auth/profile
```

**Request:**

```json
{
  "username": "newusername",
  "phone": "0987654321",
  "gender": "female"
}
```

---

#### 3. Change Password

```
POST /auth/change-password
```

**Request:**

```json
{
  "oldPassword": "password123",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

---

#### 4. Delete Account

```
DELETE /auth/account
```

**Request:**

```json
{
  "password": "password123"
}
```

---

### Admin

#### 1. Get All Users

```
GET /auth/users?limit=10&offset=0
```

---

#### 2. Get User By ID

```
GET /auth/users/{id}
```

---

## 🔐 Authorization Configuration

### Swagger UI Authorization

Swagger UI hỗ trợ JWT authentication tự động. Để sử dụng:

1. **Có sẵn trong Swagger**

   - Click "Authorize" button
   - Chọn "bearerAuth"
   - Nhập: `Bearer <token>`

2. **Hoặc manual vào header**
   ```
   Authorization: Bearer <token>
   ```

---

## 📊 Schema Documentation

### User Schema

```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "phone": "0123456789",
  "gender": "male",
  "role": "user",
  "created_at": "2026-01-10T10:00:00.000Z",
  "updated_at": "2026-01-10T10:00:00.000Z"
}
```

### Error Schema

```json
{
  "success": false,
  "message": "Error message"
}
```

---

## 🎯 Common Use Cases

### Use Case 1: Complete Registration Flow

1. Call `POST /auth/register`
2. Receive `accessToken` and `refreshToken`
3. Set Authorization with `accessToken`
4. Call `GET /auth/profile` to verify

### Use Case 2: Token Refresh

1. When `accessToken` expires (15 min)
2. Call `POST /auth/refresh-token` with `refreshToken`
3. Get new `accessToken`
4. Update Authorization header
5. Continue using API

### Use Case 3: User Logout

1. Call `POST /auth/logout` with `refreshToken`
2. Token bị revoke trong database
3. Tidak thể dùng `refreshToken` nữa

### Use Case 4: Change User Info

1. Set Authorization with `accessToken`
2. Call `PUT /auth/profile`
3. Update user information
4. Receive updated user data

---

## 🔍 Response Codes

| Code | Meaning      | Example            |
| ---- | ------------ | ------------------ |
| 200  | Success      | Login, Get Profile |
| 201  | Created      | Register           |
| 400  | Bad Request  | Invalid input      |
| 401  | Unauthorized | Invalid token      |
| 403  | Forbidden    | No permission      |
| 404  | Not Found    | User not found     |
| 500  | Server Error | Database error     |

---

## 📱 Testing Tips

### 1. Use Swagger UI for Quick Testing

- No need to use Postman or cURL
- Visual interface is easier
- Auto-format JSON

### 2. Save Test Data

- Copy successful responses
- Use for future tests
- Keep track of test users

### 3. Test Error Cases

- Send invalid email format
- Send weak passwords
- Use non-existent user IDs
- Provide wrong passwords

### 4. Check Token Expiry

- Default: 15 minutes for access token
- Default: 7 days for refresh token
- Test refresh token flow after 15 min

---

## 🔗 API Documentation URLs

### Swagger UI

```
http://localhost:3000/docs
```

### Swagger JSON

```
http://localhost:3000/docs.json
```

### Health Check

```
http://localhost:3000/health
```

---

## 📖 Adding More Endpoints

Để thêm endpoint mới vào Swagger:

### 1. Tạo route

```javascript
router.post("/endpoint", controller.method);
```

### 2. Thêm Swagger annotation

```javascript
/**
 * @swagger
 * /auth/endpoint:
 *   post:
 *     tags:
 *       - Tag Name
 *     summary: Summary
 *     description: Description
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties: ...
 *     responses:
 *       200:
 *         description: Success
 */
router.post("/endpoint", controller.method);
```

---

## 🐛 Troubleshooting

### Problem: Swagger UI không load

**Solution:**

- Kiểm tra server đang chạy
- Truy cập `http://localhost:3000/health` kiểm tra
- Xem console logs

### Problem: Endpoints không hiện

**Solution:**

- Swagger annotation có đúng format không
- Kiểm tra @swagger comment syntax
- Server cần restart sau khi thêm annotation

### Problem: Authorization không hoạt động

**Solution:**

- Token format: `Bearer <token>` (có space)
- Token không hết hạn
- Copy đúng token từ login response

### Problem: CORS errors

**Solution:**

- Swagger UI là same-origin, không cần CORS cho /docs
- Nhưng API routes cần CORS headers

---

## 🎨 Customizing Swagger UI

### Thay đổi title và description

```javascript
// src/config/swagger.js
definition: {
  info: {
    title: "Your API Title",
    version: "1.0.0",
    description: "Your API Description",
  }
}
```

### Thay đổi server URL

```javascript
servers: [
  {
    url: "http://localhost:3000/api",
    description: "Development",
  },
  {
    url: "https://api.example.com/api",
    description: "Production",
  },
];
```

---

## 📚 Resources

- [Swagger Documentation](https://swagger.io/)
- [OpenAPI 3.0 Specification](https://spec.openapis.org/oas/v3.0.3)
- [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc)
- [swagger-ui-express](https://github.com/scottie1984/swagger-ui-express)

---

## ✅ Checklist

- [ ] Server running: `npm run dev`
- [ ] Swagger UI accessible: `http://localhost:3000/docs`
- [ ] Can register user
- [ ] Can login and get tokens
- [ ] Can authorize with bearer token
- [ ] Can access protected endpoints
- [ ] Can refresh token
- [ ] Can logout

---

Good luck! 🚀

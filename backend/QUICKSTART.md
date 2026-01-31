# ⚡ Quick Start Guide

Bắt đầu nhanh chóng với TechXchange Backend API.

## 1️⃣ Setup (5 phút)

### Install Dependencies

```bash
npm install
```

### Create Database

```bash
# Tạo database PostgreSQL
createdb techxchange

# Chạy migration
psql -U postgres -d techxchange << EOF
CREATE TABLE refresh_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_refresh_tokens_user_id
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
EOF
```

### Configure Environment

Tạo file `.env`:

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=techxchange
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=your-secret-key-123
REFRESH_TOKEN_SECRET=your-refresh-secret-456

FRONTEND_URL=http://localhost:3000
```

---

## 2️⃣ Run Server (2 phút)

```bash
npm run dev
```

Server sẽ chạy trên `http://localhost:3000`

✅ Health check: `http://localhost:3000/health`
📚 API Docs: `http://localhost:3000/docs`

---

## 3️⃣ Test API (3 phút)

### Option A: Sử dụng Swagger UI (Recommended)

1. Truy cập: `http://localhost:3000/docs`
2. Scroll xuống `/auth/register`
3. Click "Try it out"
4. Fill form:
   ```
   email: test@example.com
   password: password123
   username: testuser
   ```
5. Click "Execute"
6. Copy `accessToken` từ response

### Option B: Sử dụng cURL

**Register:**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "username": "testuser"
  }'
```

**Login:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get Profile:**

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📝 Common Tasks

### Create User

```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "username": "username"
}
```

### Login

```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Get Current User

```bash
GET /api/auth/profile
Header: Authorization: Bearer <token>
```

### Refresh Token

```bash
POST /api/auth/refresh-token
{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

### Update Profile

```bash
PUT /api/auth/profile
Header: Authorization: Bearer <token>
{
  "username": "newusername",
  "phone": "0987654321"
}
```

### Change Password

```bash
POST /api/auth/change-password
Header: Authorization: Bearer <token>
{
  "oldPassword": "password123",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

### Logout

```bash
POST /api/auth/logout
Header: Authorization: Bearer <token>
{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

---

## 🎯 API Endpoints Summary

| Method | Endpoint                | Auth | Description        |
| ------ | ----------------------- | ---- | ------------------ |
| POST   | `/auth/register`        | No   | Đăng ký            |
| POST   | `/auth/login`           | No   | Đăng nhập          |
| POST   | `/auth/refresh-token`   | No   | Refresh token      |
| GET    | `/auth/profile`         | Yes  | Lấy profile        |
| PUT    | `/auth/profile`         | Yes  | Cập nhật profile   |
| POST   | `/auth/change-password` | Yes  | Đổi mật khẩu       |
| GET    | `/auth/verify`          | Yes  | Xác thực token     |
| POST   | `/auth/logout`          | Yes  | Logout             |
| POST   | `/auth/logout-all`      | Yes  | Logout all devices |

---

## 💡 Tips

### Swagger UI Tricks

1. **Set Authorization**

   - Click "Authorize" button
   - Chọn "bearerAuth"
   - Paste: `Bearer <your_token>`

2. **Save Responses**

   - Copy-paste successful responses
   - Use as test data

3. **Check Schema**
   - Click model name để xem structure
   - Xem required fields

### Development

1. **Watch Files**

   - Dùng `npm run dev`
   - Auto-restart khi change file

2. **Check Logs**

   - Xem terminal khi call API
   - Debug errors dễ hơn

3. **Test Frequently**
   - Sau mỗi change, test endpoint
   - Tránh bugs build up

---

## 🔧 Troubleshooting

### Server không start

```bash
# Check port 3000 đã dùng chưa
lsof -i :3000

# Check environment variables
cat .env

# Try lại
npm run dev
```

### Database connection error

```bash
# Check PostgreSQL running
sudo service postgresql status

# Check credentials
psql -U postgres -d techxchange

# Check database exists
psql -l | grep techxchange
```

### Token errors

```bash
# Check JWT_SECRET và REFRESH_TOKEN_SECRET
cat .env | grep SECRET

# Try logout và login lại
# Copy token chính xác (có space: Bearer <token>)
```

### Swagger not showing

```bash
# Check server running
curl http://localhost:3000/health

# Try clear cache
# Ctrl+Shift+Delete (Ctrl+Cmd+Delete trên Mac)

# Try incognito mode
```

---

## 📚 Learn More

- **API Documentation**: `/docs` hoặc đọc API_DOCS.md
- **Token Guide**: Đọc REFRESH_TOKEN_GUIDE.md
- **Project Structure**: Đọc README.md
- **Swagger Guide**: Đọc SWAGGER_GUIDE.md

---

## 🎓 Next Steps

1. ✅ Get API running
2. 📝 Test all endpoints
3. 🧪 Understand token flow
4. 🔗 Build frontend integration
5. 📊 Add more features

---

**Ready? Start coding!** 🚀

```bash
npm run dev
# Truy cập http://localhost:3000/docs
```

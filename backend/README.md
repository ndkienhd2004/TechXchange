# 🚀 TechXchange Backend API

Một backend API hoàn chỉnh cho nền tảng marketplace TechXchange với authentication, authorization, và token refresh.

## ✨ Features

✅ **User Authentication** - Đăng ký, đăng nhập, logout
✅ **JWT Token** - Access Token (15m) + Refresh Token (7d)
✅ **Token Refresh** - Tự động refresh access token
✅ **User Profile** - Lấy, cập nhật thông tin user
✅ **Password Management** - Đổi mật khẩu, reset mật khẩu
✅ **Admin Panel** - Quản lý người dùng (admin only)
✅ **Swagger API Documentation** - Interactive API docs
✅ **PostgreSQL Database** - Persistent data storage
✅ **Security** - Bcrypt password hashing, JWT signing

---

## 📋 Requirements

- **Node.js**: v14 hoặc cao hơn
- **PostgreSQL**: v12 hoặc cao hơn
- **npm**: v6 hoặc cao hơn

---

## 🔧 Installation

### 1. Clone Repository

```bash
cd /home/kien/Code/TechXchange/backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

```bash
# Tạo database
createdb techxchange

# Chạy migration
psql -U postgres -d techxchange -a -f /path/to/migration.sql
```

**SQL Migration:**

```sql
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
```

### 4. Configure Environment

Tạo file `.env`:

```env
# Server
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000/api

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=techxchange
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-key-for-access-token-12345!@#$%
REFRESH_TOKEN_SECRET=your-super-secret-key-for-refresh-token-67890!@#$%

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

---

## 🚀 Running the Server

### Development Mode (with auto-restart)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

Server sẽ chạy trên `http://localhost:3000`

---

## 📚 API Documentation

### Swagger UI

Truy cập interactive API documentation:

```
http://localhost:3000/docs
```

### API Documentation Files

- **API_DOCS.md** - Chi tiết tất cả endpoints
- **SWAGGER_GUIDE.md** - Hướng dẫn sử dụng Swagger UI
- **REFRESH_TOKEN_GUIDE.md** - Hướng dẫn chi tiết token refresh
- **MIGRATION_GUIDE.md** - Hướng dẫn database setup

---

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js                 # Database configuration
│   └── swagger.js            # Swagger configuration
├── src/
│   ├── app/
│   │   ├── controller/
│   │   │   └── auth.js       # Authentication controller
│   │   ├── middleware/
│   │   │   └── auth.js       # Auth middleware & guards
│   │   └── service/
│   │       └── auth.js       # Business logic
│   ├── models/
│   │   ├── user.js           # User model
│   │   ├── refreshToken.js   # Refresh token model
│   │   └── index.js          # Model associations
│   ├── routes/
│   │   └── authRoutes.js     # Auth routes with Swagger
│   ├── app.js                # Express app setup
│   └── server.js             # Server entry point
├── package.json
├── .env.example
└── README.md
```

---

## 🔐 Authentication Flow

### Registration

```
User → POST /auth/register → Server → Create User + Generate Tokens → Response
```

### Login

```
User → POST /auth/login → Server → Validate Credentials → Generate Tokens → Response
```

### Token Refresh

```
Client (Token Expired) → POST /auth/refresh-token → Server → Validate + Generate New → Response
```

### Protected Request

```
Client (with Access Token) → GET /auth/profile → Server → Verify Token → Return Data
```

---

## 🔄 Token Management

### Access Token

- **Duration**: 15 minutes
- **Type**: JWT
- **Usage**: API requests
- **Storage**: Memory or short-lived cookie

### Refresh Token

- **Duration**: 7 days
- **Type**: JWT (stored in DB)
- **Usage**: Get new access token
- **Storage**: Secure HttpOnly cookie or localStorage

---

## 📝 API Endpoints

### Authentication (Public)

- `POST /auth/register` - Đăng ký
- `POST /auth/login` - Đăng nhập
- `POST /auth/reset-password` - Reset mật khẩu
- `POST /auth/refresh-token` - Refresh token

### User Profile (Protected)

- `GET /auth/profile` - Lấy profile
- `PUT /auth/profile` - Cập nhật profile
- `POST /auth/change-password` - Đổi mật khẩu
- `DELETE /auth/account` - Xóa tài khoản

### Authentication Management (Protected)

- `GET /auth/verify` - Xác thực token
- `POST /auth/logout` - Logout
- `POST /auth/logout-all` - Logout all devices

### Admin (Protected + Admin Only)

- `GET /auth/users` - Lấy danh sách users
- `GET /auth/users/:id` - Lấy user theo ID

---

## 🧪 Testing

### Test with Swagger UI

```
http://localhost:3000/docs
```

### Test with cURL

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

**Get Profile (with token):**

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Test Script

```bash
chmod +x test-auth.sh
./test-auth.sh
```

---

## 🛠️ Development

### File Structure

```
src/
├── app/
│   ├── controller/auth.js    # Request handlers
│   ├── middleware/auth.js    # JWT verification
│   └── service/auth.js       # Business logic
├── models/
│   ├── user.js              # User model
│   └── refreshToken.js      # Token model
├── routes/authRoutes.js     # Endpoints
├── app.js                   # Express config
└── server.js                # Entry point
```

### Adding New Endpoints

1. **Create route in authRoutes.js**

```javascript
/**
 * @swagger
 * /auth/new-endpoint:
 *   get:
 *     tags:
 *       - Category
 *     summary: Description
 */
router.get("/new-endpoint", authMiddleware, controller.method);
```

2. **Add controller method**

```javascript
static async method(req, res) {
  // Logic here
  res.json({ success: true, data: result });
}
```

3. **Add service method** (if needed)

```javascript
static async method() {
  // Business logic here
}
```

---

## 🔒 Security Features

✅ **Password Hashing** - Bcryptjs with salt rounds
✅ **JWT Signing** - HS256 algorithm
✅ **Token Expiry** - Auto-expiring tokens
✅ **Token Revocation** - Logout revokes tokens
✅ **Database Validation** - Refresh tokens stored in DB
✅ **CORS Support** - Configurable CORS origins
✅ **Input Validation** - Email, password format validation

---

## 📊 Database Schema

### Users Table

```sql
users {
  id BIGINT PRIMARY KEY,
  email VARCHAR(100) UNIQUE,
  username VARCHAR,
  phone VARCHAR UNIQUE,
  password_hash VARCHAR,
  gender ENUM('male', 'female', 'other'),
  role ENUM('user', 'admin'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
}
```

### Refresh Tokens Table

```sql
refresh_tokens {
  id BIGINT PRIMARY KEY,
  user_id BIGINT FOREIGN KEY,
  token TEXT,
  expires_at TIMESTAMP,
  is_revoked BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
}
```

---

## 🐛 Troubleshooting

### Issue: "Connection refused" to database

**Solution:**

- Kiểm tra PostgreSQL đang chạy: `sudo service postgresql status`
- Kiểm tra credentials trong `.env`
- Kiểm tra database đã tạo: `psql -l | grep techxchange`

### Issue: "Token không hợp lệ"

**Solution:**

- Kiểm tra JWT_SECRET đúng không
- Kiểm tra token không hết hạn
- Kiểm tra Authorization header format: `Bearer <token>`

### Issue: Swagger không load

**Solution:**

- Server đang chạy? `npm run dev`
- Port 3000 không bị chiếm?
- Truy cập `http://localhost:3000/health`

### Issue: CORS errors

**Solution:**

- Update `FRONTEND_URL` trong `.env`
- Check CORS middleware configuration

---

## 📈 Scaling Tips

### Database

- Add indexes for frequently queried fields
- Implement connection pooling
- Regular backups

### Caching

- Consider adding a cache layer for token/session optimization in the future
- Cache user profiles
- Rate limiting

### Monitoring

- Add logging middleware
- Setup error tracking (Sentry)
- Monitor API response times

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Sequelize Documentation](https://sequelize.org/)
- [JWT Introduction](https://jwt.io/introduction)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Swagger/OpenAPI](https://swagger.io/)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

## 📄 License

MIT License - Feel free to use this project for learning and development.

---

## 📞 Support

For issues or questions:

- Check documentation files
- Review Swagger API docs
- Check logs in terminal

---

## ✅ Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Dependencies installed
- [ ] Server starts without errors
- [ ] Swagger docs accessible
- [ ] Test endpoints working
- [ ] Error handling implemented
- [ ] Logging setup
- [ ] HTTPS configured (production)
- [ ] Rate limiting enabled

---

## 🎯 Next Steps

1. ✅ Authentication API complete
2. 📋 Add more features (products, orders, etc.)
3. 🧪 Write unit tests
4. 📊 Add analytics/logging
5. 🔐 Implement rate limiting
6. 📧 Add email notifications
7. 💳 Integrate payment gateway

---

**Happy Coding!** 🚀

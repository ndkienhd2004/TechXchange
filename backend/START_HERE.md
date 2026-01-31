# 🚀 START HERE - TechXchange Backend Setup

Welcome! This is the quick guide to get TechXchange Backend running in 5 minutes.

---

## ⏱️ 5-Minute Quick Setup

### Step 1: Install Dependencies (1 min)

```bash
cd /home/kien/Code/TechXchange/backend
npm install
```

### Step 2: Setup Database (1 min)

```bash
# Create database
createdb techxchange

# Create tables
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

### Step 3: Configure Environment (1 min)

Create file `.env`:

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
```

### Step 4: Start Server (1 min)

```bash
npm run dev
```

### Step 5: Access API (1 min)

```
Swagger UI:  http://localhost:3000/docs
Health:      http://localhost:3000/health
API:         http://localhost:3000/api
```

---

## ✅ That's It!

Your API is now running with:

- ✅ Complete authentication system
- ✅ Token refresh mechanism
- ✅ Interactive Swagger documentation
- ✅ Ready for testing

---

## 🎯 Test Your API

### Option A: Use Swagger UI (Recommended)

```
1. Go to: http://localhost:3000/docs
2. Click: POST /auth/register
3. Click: Try it out
4. Fill form:
   - email: test@example.com
   - password: password123
   - username: testuser
5. Click: Execute
6. Success! You're registered
```

### Option B: Test with cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "username": "testuser"
  }'
```

---

## 📚 Documentation

| Guide                      | For              | Read Time |
| -------------------------- | ---------------- | --------- |
| **QUICKSTART.md**          | Getting started  | 5 min     |
| **SWAGGER_GUIDE.md**       | Using Swagger UI | 10 min    |
| **API_DOCS.md**            | API reference    | 15 min    |
| **REFRESH_TOKEN_GUIDE.md** | Token flow       | 20 min    |
| **README.md**              | Full guide       | 30 min    |

---

## 🔑 Key API Endpoints

| Method | Endpoint                  | Purpose        |
| ------ | ------------------------- | -------------- |
| POST   | `/api/auth/register`      | Create account |
| POST   | `/api/auth/login`         | Login          |
| GET    | `/api/auth/profile`       | Get profile    |
| PUT    | `/api/auth/profile`       | Update profile |
| POST   | `/api/auth/refresh-token` | Refresh token  |
| POST   | `/api/auth/logout`        | Logout         |

---

## 🛠️ Common Issues

### ❌ "Connection refused" to database

**Solution:**

```bash
# Check PostgreSQL is running
sudo service postgresql status

# Start PostgreSQL if needed
sudo service postgresql start
```

### ❌ Server won't start

**Solution:**

```bash
# Check port 3000 is free
lsof -i :3000

# Kill process if needed
kill -9 <PID>
```

### ❌ "Cannot find module"

**Solution:**

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📖 Next Steps

1. ✅ **Understand the API**

   - Read: `QUICKSTART.md`
   - Explore: Swagger UI (`/docs`)

2. ✅ **Test endpoints**

   - Try: Register & Login
   - Check: `/docs` for examples

3. ✅ **Understand tokens**

   - Read: `REFRESH_TOKEN_GUIDE.md`
   - See: Client implementation examples

4. ✅ **Build frontend**
   - Use: `API_DOCS.md` for endpoints
   - See: `REFRESH_TOKEN_GUIDE.md` for client code

---

## 🎓 Learn Path

### Beginner (30 min)

```
1. QUICKSTART.md (5 min)
2. Test in Swagger UI (10 min)
3. Read API_DOCS.md (15 min)
```

### Intermediate (1 hour)

```
1. REFRESH_TOKEN_GUIDE.md (20 min)
2. SWAGGER_GUIDE.md (15 min)
3. README.md (25 min)
```

### Advanced (2 hours)

```
1. Source code review (30 min)
2. Database schema (20 min)
3. Security analysis (30 min)
4. Integration planning (40 min)
```

---

## 📋 Files Overview

**Documentation Files:**

- `START_HERE.md` ← You are here
- `QUICKSTART.md` - Quick setup
- `README.md` - Full guide
- `API_DOCS.md` - API reference
- `SWAGGER_GUIDE.md` - Swagger usage

**Configuration:**

- `.env` - Environment variables
- `package.json` - Dependencies
- `src/config/swagger.js` - Swagger config

**Source Code:**

- `src/app/controller/auth.js` - Controllers
- `src/app/service/auth.js` - Business logic
- `src/app/middleware/auth.js` - Middleware
- `src/routes/authRoutes.js` - Routes
- `src/models/` - Database models

---

## 🚀 Commands Cheat Sheet

```bash
# Setup
npm install                    # Install dependencies
createdb techxchange          # Create database

# Development
npm run dev                   # Start with auto-reload
npm start                     # Start production

# Testing
./test-auth.sh               # Run full test suite
curl http://localhost:3000   # Health check

# Cleanup
rm -rf node_modules          # Remove dependencies
npm cache clean --force      # Clear npm cache
```

---

## ✨ Features

✅ **User Authentication**

- Register, Login, Logout
- Password hashing
- Email validation

✅ **Token Management**

- Access Token (15 min)
- Refresh Token (7 days)
- Token revocation

✅ **User Management**

- Get profile
- Update profile
- Change password
- Delete account

✅ **Admin Features**

- View all users
- User management

✅ **API Documentation**

- Swagger UI at `/docs`
- Interactive testing
- Auto-generated docs

---

## 🔒 Security Features

✅ JWT authentication
✅ Password hashing (bcryptjs)
✅ Token expiry
✅ Token revocation
✅ Admin authorization
✅ Input validation

---

## 💡 Pro Tips

1. **Swagger UI Tips**

   - Click "Authorize" to set token
   - Click endpoint to expand details
   - "Try it out" to test endpoint

2. **Testing Tips**

   - Use Swagger for quick tests
   - Use cURL for scripting
   - Use test-auth.sh for full flow

3. **Development Tips**
   - Keep terminal open for logs
   - Check error messages
   - Read documentation carefully

---

## 🆘 Need Help?

### Issue | Solution

---|---
Server won't start | Check .env, database connection
API returns 401 | Token expired, try login again
Database error | Check PostgreSQL running
Swagger not loading | Refresh page, check server logs
Can't register | Check email format, unique constraint

**For more help:** See relevant documentation file

---

## ✅ Success Checklist

- [ ] npm install completed
- [ ] Database created
- [ ] .env file configured
- [ ] Server running (npm run dev)
- [ ] Health check works
- [ ] Swagger UI loads
- [ ] Can register user
- [ ] Can login
- [ ] Can access profile

---

## 🎉 Ready!

You're all set! Your TechXchange backend is running.

### Next Action:

```bash
# 1. Make sure server is running
npm run dev

# 2. Open browser
http://localhost:3000/docs

# 3. Start testing!
Click "Try it out" on any endpoint
```

---

## 📞 Quick Links

| Resource      | Link                              |
| ------------- | --------------------------------- |
| Swagger UI    | `http://localhost:3000/docs`      |
| Health Check  | `http://localhost:3000/health`    |
| Swagger JSON  | `http://localhost:3000/docs.json` |
| Quick Start   | `QUICKSTART.md`                   |
| API Reference | `API_DOCS.md`                     |
| Full Guide    | `README.md`                       |

---

## 🎓 Learning Resources

- [JWT Introduction](https://jwt.io/introduction)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Basics](https://www.postgresql.org/docs/)
- [Swagger Documentation](https://swagger.io/)

---

**Let's build something awesome!** 🚀

Questions? Check the documentation files or read the source code comments.

---

**Created**: January 10, 2026
**Backend Version**: 1.0.0
**Status**: ✅ Production Ready

# Refresh Token Implementation Guide

## Overview

Hệ thống refresh token giúp tăng bảo mật bằng cách:

- **Access Token**: Thời gian ngắn (15 phút) - sử dụng cho API requests
- **Refresh Token**: Thời gian dài (7 ngày) - lưu trữ trong database để refresh access token

## Architecture

### Token Lifecycle

```
User Login
    ↓
Generate Access Token (15 min) + Refresh Token (7 days)
    ↓
Store Refresh Token in Database
    ↓
Return both tokens to client
    ↓
Client stores tokens:
  - Access Token: Memory (hoặc localStorage)
  - Refresh Token: Secure HttpOnly Cookie (hoặc localStorage)
    ↓
Every API request: Use Access Token in Authorization header
    ↓
Access Token expires → Call Refresh Token endpoint
    ↓
Generate new Access Token
    ↓
Continue using new Access Token
```

## Endpoints

### 1. Refresh Access Token (Public)

**POST** `/api/auth/refresh-token`

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Refresh token thành công",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error (401):**

```json
{
  "success": false,
  "message": "Refresh token không hợp lệ hoặc đã bị revoke"
}
```

---

### 2. Logout (Revoke Single Token)

**POST** `/api/auth/logout`

**Headers:**

```
Authorization: Bearer <accessToken>
```

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Đăng xuất thành công"
}
```

---

### 3. Logout from All Devices (Revoke All Tokens)

**POST** `/api/auth/logout-all`

**Headers:**

```
Authorization: Bearer <accessToken>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Đăng xuất từ tất cả thiết bị thành công"
}
```

---

## Client Implementation (JavaScript)

### Setup

```javascript
// API Client with auto-refresh
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.accessToken = localStorage.getItem("accessToken");
    this.refreshToken = localStorage.getItem("refreshToken");
  }

  // Lưu tokens
  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  }

  // Xóa tokens
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }

  // Refresh access token
  async refreshAccessToken() {
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: this.refreshToken,
        }),
      });

      if (!response.ok) {
        // Refresh token không hợp lệ, logout
        this.clearTokens();
        window.location.href = "/login";
        throw new Error("Refresh token failed");
      }

      const data = await response.json();
      this.setTokens(data.data.accessToken, data.data.refreshToken);
      return data.data.accessToken;
    } catch (error) {
      console.error("Error refreshing token:", error);
      this.clearTokens();
      throw error;
    }
  }

  // API request với auto-refresh
  async request(url, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    let response = await fetch(`${this.baseURL}${url}`, {
      ...options,
      headers,
    });

    // Nếu access token hết hạn (401)
    if (response.status === 401 && this.refreshToken) {
      try {
        const newAccessToken = await this.refreshAccessToken();
        headers["Authorization"] = `Bearer ${newAccessToken}`;

        // Retry request với token mới
        response = await fetch(`${this.baseURL}${url}`, {
          ...options,
          headers,
        });
      } catch (error) {
        // Refresh thất bại, redirect to login
        window.location.href = "/login";
        throw error;
      }
    }

    return response;
  }

  // GET request
  async get(url) {
    return this.request(url, { method: "GET" });
  }

  // POST request
  async post(url, body) {
    return this.request(url, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  // PUT request
  async put(url, body) {
    return this.request(url, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  // DELETE request
  async delete(url) {
    return this.request(url, { method: "DELETE" });
  }
}

// Initialize client
const api = new ApiClient("http://localhost:3000/api");
```

### Usage

**Đăng nhập:**

```javascript
async function login(email, password) {
  const response = await api.post("/auth/login", { email, password });
  const data = await response.json();

  if (data.success) {
    api.setTokens(data.data.accessToken, data.data.refreshToken);
    // Redirect to dashboard
  }
}
```

**API Request (auto-refresh):**

```javascript
async function getProfile() {
  const response = await api.get("/auth/profile");
  const data = await response.json();
  return data;
}
```

**Logout:**

```javascript
async function logout() {
  const response = await api.post("/auth/logout", {
    refreshToken: api.refreshToken,
  });

  if (response.ok) {
    api.clearTokens();
    window.location.href = "/login";
  }
}
```

**Logout from all devices:**

```javascript
async function logoutAllDevices() {
  const response = await api.post("/auth/logout-all", {});

  if (response.ok) {
    api.clearTokens();
    window.location.href = "/login";
  }
}
```

---

## Database Schema

### refresh_tokens table

```sql
CREATE TABLE refresh_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_user_id (user_id),
  INDEX idx_token (token)
);
```

---

## Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-super-secret-key-for-access-token
REFRESH_TOKEN_SECRET=your-super-secret-key-for-refresh-token

# Token expiry times (từ environment hoặc hardcode)
ACCESS_TOKEN_EXPIRY=15m    # 15 minutes
REFRESH_TOKEN_EXPIRY=7d    # 7 days
```

---

## Security Best Practices

### 1. Storage

- **Access Token**: Lưu trong memory (React state) hoặc short-lived cookie
- **Refresh Token**: Lưu trong HttpOnly cookie (secure, không accessible từ JS)

### 2. Token Rotation

```javascript
// Mỗi lần refresh token được sử dụng, tạo token mới
// Cách này giúp phát hiện token bị đánh cắp
```

### 3. Token Validation

- Xác thực chữ ký (signature)
- Kiểm tra expiry time
- Xác minh user_id từ token

### 4. Refresh Token Revocation

- Khi user logout: Đánh dấu token là revoked trong DB
- Khi user đổi mật khẩu: Revoke tất cả tokens
- Xóa tokens hết hạn định kỳ

### 5. CORS Configuration

```javascript
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true, // Cho phép cookies
  })
);
```

---

## Maintenance Tasks

### Cleanup Expired Tokens (Cron Job)

```javascript
// Chạy mỗi ngày lúc 2 AM
const cron = require("node-cron");
const AuthServices = require("./src/app/service/AuthServices");

cron.schedule("0 2 * * *", async () => {
  try {
    const deletedCount = await AuthServices.deleteExpiredTokens();
    console.log(`Deleted ${deletedCount} expired tokens`);
  } catch (error) {
    console.error("Error cleaning expired tokens:", error);
  }
});
```

---

## Testing

### cURL Examples

**Login:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' | jq .
```

**Refresh Token:**

```bash
REFRESH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:3000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }" | jq .
```

**Get Profile (with Access Token):**

```bash
ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq .
```

**Logout:**

```bash
REFRESH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }" | jq .
```

---

## Troubleshooting

### Issue: "Refresh token không hợp lệ"

- Token đã hết hạn (kiểm tra expires_at trong DB)
- Token bị revoke (is_revoked = true)
- JWT signature không chính xác (kiểm tra REFRESH_TOKEN_SECRET)

### Issue: Access token không refresh

- Refresh token không được gửi đúng format
- Refresh token không tồn tại trong database
- User ID không khớp giữa token và database

### Issue: User bị logout đột ngột

- Refresh token hết hạn
- Admin đã revoke token
- Database bị xóa records

---

## Flow Diagram

```
┌─────────────────────┐
│  User Login         │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ Generate:                            │
│ - Access Token (15m)                 │
│ - Refresh Token (7d)                 │
│ - Store Refresh Token in DB          │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ Return to Client:                    │
│ { accessToken, refreshToken }        │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ Client Storage:                      │
│ - Access Token: Memory/State         │
│ - Refresh Token: HttpOnly Cookie     │
└──────────┬───────────────────────────┘
           │
           ├──────────┐
           │          │
           ▼          ▼
    API Request   Access Token
    with Token    Expires?
           │          │
           │          ▼ YES
           │    ┌────────────────┐
           │    │ Call /refresh- │
           │    │ token endpoint  │
           │    │ with refresh    │
           │    │ token           │
           │    └────────┬────────┘
           │             │
           │             ▼
           │    ┌──────────────────────┐
           │    │ Generate new Access  │
           │    │ Token               │
           │    │ Optional: Rotate     │
           │    │ Refresh Token        │
           │    └────────┬─────────────┘
           │             │
           └─────┬───────┘
                 │
                 ▼
          ┌────────────────┐
          │ Use new Access │
          │ Token          │
          └────────────────┘
```

---

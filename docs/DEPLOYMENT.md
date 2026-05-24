# TechXchange Deployment Guide

Tài liệu này mô tả cách chạy local và deploy production cho TechXchange với:
- `Database`: Supabase Postgres
- `Backend`: Railway
- `Frontend`: Vercel

## 1) Kiến trúc môi trường

- Local:
  - Frontend chạy local (`npm run dev`)
  - Backend chạy local (`npm run dev`)
  - DB có thể trỏ Supabase hoặc DB local tùy `.env`
- Production:
  - Frontend chạy trên Vercel
  - Backend chạy trên Railway
  - Backend kết nối Supabase qua `DATABASE_URL`

## 2) Chạy local

### Backend local

```bash
cd /Users/kien/Codes/TechXchange/backend
npm install
npm run dev
```

### Frontend local

```bash
cd /Users/kien/Codes/TechXchange/frontend
npm install
npm run dev
```

### Biến môi trường local (frontend)

File `.env.local` trong `frontend`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

Nếu bạn muốn FE local gọi thẳng BE production:

```env
NEXT_PUBLIC_API_URL=https://techxchange-production.up.railway.app/api
```

## 3) Deploy production

## Backend -> Railway

```bash
cd /Users/kien/Codes/TechXchange/backend
railway up --service TechXchange --environment production --ci
```

Backend healthcheck:

```bash
curl -fsS https://techxchange-production.up.railway.app/health
```

### Frontend -> Vercel

```bash
cd /Users/kien/Codes/TechXchange/frontend
vercel --prod
```

## 4) Update khi đã deploy rồi

Mỗi lần sửa code xong:

1. Chạy local để kiểm tra.
2. Deploy lại backend (nếu có đổi BE).
3. Deploy lại frontend (nếu có đổi FE).
4. Verify production:
   - `GET /health` backend
   - Mở frontend production và kiểm tra gọi API

Lưu ý: deploy mới sẽ thay thế version cũ, không cần tạo project mới.

## 5) Biến môi trường production

### Railway (Backend)

Bắt buộc:
- `DATABASE_URL` (Supabase Postgres)
- `NODE_ENV=production`
- `PORT` (Railway tự inject, thường `3000`)
- Các key khác của app (`JWT_SECRET`, S3, GHN, ...)

### Vercel (Frontend)

Bắt buộc:
- `NEXT_PUBLIC_API_URL=https://techxchange-production.up.railway.app/api`

Sau khi đổi env trên Vercel, cần redeploy để áp dụng.

## 6) Database migration/seed

Khi thay đổi schema DB:

1. Push migration lên Supabase trước.
2. Deploy backend sau migration.
3. Nếu cần seed data, chạy seed script với kết nối production DB.

Không chạy crawler nặng trong `startCommand` của Railway vì dễ fail healthcheck.

## 7) File cấu hình Railway trong repo

Backend có file [`backend/railway.json`](/Users/kien/Codes/TechXchange/backend/railway.json) để ép config deploy cho từng lần build:
- `startCommand`: `npm start`
- `healthcheckPath`: `/health`
- `healthcheckTimeout`: `60`

Config trong file này chỉ áp dụng cho deployment hiện tại, không thay đổi dashboard settings vĩnh viễn.

## 8) Troubleshooting nhanh

### FE gọi API liên tục
- Kiểm tra vòng lặp gọi API trong `useEffect`.
- Kiểm tra lại `NEXT_PUBLIC_API_URL` có đúng domain backend không.

### Backend deploy fail healthcheck
- Kiểm tra `startCommand` có trả server lên nhanh không.
- Kiểm tra log deploy runtime trên Railway.
- Tránh chạy tác vụ dài (crawl, seed lớn) trước khi app listen port.

### Có schema nhưng không thấy data
- Xác nhận đúng project Supabase.
- Query trực tiếp số bản ghi các bảng chính.
- Kiểm tra script seed có chạy vào production DB hay chỉ chạy local.

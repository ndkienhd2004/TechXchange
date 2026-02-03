# API Response Codes - Mã trạng thái HTTP

Backend chuẩn hóa tất cả API trả về theo các mã sau:

| Code    | Ý nghĩa                            | Khi nào dùng                                                                  |
| ------- | ---------------------------------- | ----------------------------------------------------------------------------- |
| **200** | OK - Thành công                    | GET, PUT, PATCH, DELETE thành công                                            |
| **201** | Created - Tạo mới thành công       | POST tạo resource mới (register, tạo sản phẩm, banner, brand...)              |
| **400** | Bad Request - Dữ liệu không hợp lệ | Thiếu field, format sai, validate fail                                        |
| **401** | Unauthorized - Chưa xác thực       | Không có token, token hết hạn, sai mật khẩu khi login                         |
| **403** | Forbidden - Không có quyền         | Đã đăng nhập nhưng không đủ quyền (vd: user gọi API admin)                    |
| **404** | Not Found - Không tìm thấy         | Resource không tồn tại (user, product, id sai...) hoặc endpoint không tồn tại |
| **500** | Internal Server Error - Lỗi server | Lỗi DB, lỗi không xác định trong try/catch                                    |

## Format response chuẩn

**Thành công (200, 201):**

```json
{
  "code": "200",
  "success": true,
  "message": "Mô tả ngắn",
  "data": {}
}
```

**Lỗi (400, 401, 403, 404, 500):**

```json
{
  "code": "400",
  "success": false,
  "message": "Mô tả lỗi"
}
```

FE dùng `code` (string) để xử lý: `"200"` | `"201"` | `"400"` | `"401"` | `"403"` | `"404"` | `"500"`.

### 401 – Token hết hạn / không hợp lệ

Khi gọi API cần auth mà token sai hoặc hết hạn, response 401 có thêm field **`reason`** (optional) để FE xử lý:

| reason          | Ý nghĩa                | Ví dụ message                   |
| --------------- | ---------------------- | ------------------------------- |
| `no_token`      | Không gửi token        | "Vui lòng đăng nhập để sử dụng" |
| `invalid_token` | Token sai / lỗi format | "Token không hợp lệ"            |
| `token_expired` | Token đã hết hạn       | "Token đã hết hạn"              |

**Ví dụ khi token hết hạn:**

```json
{
  "code": "401",
  "success": false,
  "message": "Token đã hết hạn",
  "reason": "token_expired"
}
```

FE có thể: nếu `reason === "token_expired"` thì gọi **POST /auth/refresh-token**; nếu `invalid_token` hoặc `no_token` thì redirect đăng nhập.

## Sử dụng trong code

Helper nằm tại `src/app/utils/response.js`:

- `response.success(res, message, data)` → 200
- `response.created(res, message, data)` → 201
- `response.badRequest(res, message)` → 400
- `response.unauthorized(res, message, reason?)` → 401 (reason: `"token_expired"` | `"invalid_token"` | `"no_token"`)
- `response.forbidden(res, message)` → 403
- `response.notFound(res, message)` → 404
- `response.serverError(res, message)` → 500

Constants: `HTTP_STATUS.OK`, `HTTP_STATUS.CREATED`, `HTTP_STATUS.BAD_REQUEST`, ...

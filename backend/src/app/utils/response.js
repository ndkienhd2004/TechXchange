/**
 * HTTP Status Codes - Chuẩn hóa mã trạng thái API
 * 200 = Success
 * 201 = Created
 * 400 = Bad Request (dữ liệu không hợp lệ)
 * 401 = Unauthorized (chưa đăng nhập / token không hợp lệ)
 * 403 = Forbidden (không có quyền truy cập)
 * 404 = Not Found (không tìm thấy tài nguyên)
 * 500 = Internal Server Error (lỗi server)
 */
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

/**
 * Response helper - Trả về response chuẩn cho FE: code, success, message, data
 */
const response = {
  /**
   * 200 - Thành công (GET, PUT, PATCH, DELETE thành công)
   */
  success(res, message = "Thành công", data = null) {
    const body = { code: "200", success: true, message };
    if (data !== null && data !== undefined) body.data = data;
    return res.status(HTTP_STATUS.OK).json(body);
  },

  /**
   * 201 - Tạo mới thành công (POST tạo resource)
   */
  created(res, message = "Tạo thành công", data = null) {
    const body = { code: "201", success: true, message };
    if (data !== null && data !== undefined) body.data = data;
    return res.status(HTTP_STATUS.CREATED).json(body);
  },

  /**
   * 400 - Bad Request - Dữ liệu đầu vào không hợp lệ
   */
  badRequest(res, message = "Dữ liệu không hợp lệ") {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      code: "400",
      success: false,
      message,
    });
  },

  /**
   * 401 - Unauthorized - Chưa đăng nhập hoặc token không hợp lệ
   * @param {object} res - Express response
   * @param {string} message - Thông báo lỗi
   * @param {string} [reason] - Lý do cho FE: "token_expired" | "invalid_token" | "no_token"
   */
  unauthorized(res, message = "Chưa xác thực", reason = null) {
    const body = { code: "401", success: false, message };
    if (reason) body.reason = reason;
    return res.status(HTTP_STATUS.UNAUTHORIZED).json(body);
  },

  /**
   * 403 - Forbidden - Không có quyền truy cập tài nguyên
   */
  forbidden(res, message = "Không có quyền truy cập") {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      code: "403",
      success: false,
      message,
    });
  },

  /**
   * 404 - Not Found - Không tìm thấy tài nguyên
   */
  notFound(res, message = "Không tìm thấy") {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      code: "404",
      success: false,
      message,
    });
  },

  /**
   * 500 - Internal Server Error - Lỗi server
   */
  serverError(res, message = "Lỗi server") {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      code: "500",
      success: false,
      message,
    });
  },
};

module.exports = {
  HTTP_STATUS,
  response,
};

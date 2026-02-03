const AuthServices = require("../service/auth");
const { response } = require("../utils/response");

/**
 * Middleware xác thực JWT token
 * Kiểm tra token từ Authorization header
 * 401 = Unauthorized
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return response.unauthorized(
        res,
        "Vui lòng đăng nhập để sử dụng",
        "no_token"
      );
    }

    // Lấy token từ header (định dạng: "Bearer <token>")
    const token = authHeader.split(" ")[1];

    if (!token) {
      return response.unauthorized(res, "Token không hợp lệ", "invalid_token");
    }

    // Xác thực token
    const decoded = AuthServices.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    const msg = error.message || "Token xác thực thất bại";
    // Phân biệt token hết hạn để FE có thể gọi refresh token
    const isExpired =
      msg.toLowerCase().includes("jwt expired") ||
      msg.toLowerCase().includes("expired");
    const reason = isExpired ? "token_expired" : "invalid_token";
    const message = isExpired ? "Token đã hết hạn" : msg;
    return response.unauthorized(res, message, reason);
  }
};

/**
 * Middleware kiểm tra quyền admin
 * Phải được sử dụng sau authMiddleware
 * 401 = Unauthorized, 403 = Forbidden
 */
const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return response.unauthorized(res, "Vui lòng đăng nhập");
    }

    if (req.user.role !== "admin") {
      return response.forbidden(
        res,
        "Bạn không có quyền truy cập tài nguyên này"
      );
    }

    next();
  } catch (error) {
    return response.forbidden(res, "Lỗi kiểm tra quyền");
  }
};

/**
 * Middleware kiểm tra quyền shop
 * Phải được sử dụng sau authMiddleware
 * 401 = Unauthorized, 403 = Forbidden
 */
const shopMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return response.unauthorized(res, "Vui lòng đăng nhập");
    }

    if (req.user.role !== "shop") {
      return response.forbidden(
        res,
        "Bạn không có quyền truy cập tài nguyên này"
      );
    }

    next();
  } catch (error) {
    return response.forbidden(res, "Lỗi kiểm tra quyền");
  }
};

/**
 * Middleware tùy chọn xác thực
 * Nếu có token thì xác thực, không có thì tiếp tục
 */
const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(" ")[1];
      if (token) {
        try {
          const decoded = AuthServices.verifyToken(token);
          req.user = decoded;
        } catch (error) {
          // Không có token hợp lệ, tiếp tục mà không xác thực
        }
      }
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  shopMiddleware,
  optionalAuthMiddleware,
};

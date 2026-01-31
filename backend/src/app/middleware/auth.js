const AuthServices = require("../service/auth");

/**
 * Middleware xác thực JWT token
 * Kiểm tra token từ Authorization header
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập để sử dụng",
      });
    }

    // Lấy token từ header (định dạng: "Bearer <token>")
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }

    // Xác thực token
    const decoded = AuthServices.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || "Token xác thực thất bại",
    });
  }
};

/**
 * Middleware kiểm tra quyền admin
 * Phải được sử dụng sau authMiddleware
 */
const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập tài nguyên này",
      });
    }

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Lỗi kiểm tra quyền",
    });
  }
};

/**
 * Middleware kiểm tra quyền shop
 * Phải được sử dụng sau authMiddleware
 */
const shopMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập",
      });
    }

    if (req.user.role !== "shop") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập tài nguyên này",
      });
    }

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Lỗi kiểm tra quyền",
    });
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

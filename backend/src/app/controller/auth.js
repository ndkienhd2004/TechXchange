const AuthServices = require("../service/auth");
const { response } = require("../utils/response");

class AuthController {
  /**
   * Đăng ký tài khoản mới
   * POST /auth/register
   */
  static async register(req, res) {
    try {
      const { email, password, username, phone, gender } = req.body;

      // Validate input
      if (!email || !password) {
        return response.badRequest(res, "Email và mật khẩu là bắt buộc");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return response.badRequest(res, "Email không hợp lệ");
      }

      // Validate password length
      if (password.length < 6) {
        return response.badRequest(res, "Mật khẩu phải có ít nhất 6 ký tự");
      }

      const result = await AuthServices.register({
        email,
        password,
        username,
        phone,
        gender,
      });

      return response.created(res, "Đăng ký thành công", result);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  /**
   * Đăng nhập
   * POST /auth/login
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return response.badRequest(res, "Email và mật khẩu là bắt buộc");
      }

      const result = await AuthServices.login(email, password);

      return response.success(res, "Đăng nhập thành công", result);
    } catch (error) {
      return response.unauthorized(res, error.message);
    }
  }

  /**
   * Lấy thông tin người dùng hiện tại
   * GET /auth/profile
   */
  static async getProfile(req, res) {
    try {
      const userId = req.user.id;

      const user = await AuthServices.getUserById(userId);

      return response.success(res, "Lấy thông tin thành công", user);
    } catch (error) {
      return response.notFound(res, error.message);
    }
  }

  /**
   * Cập nhật thông tin người dùng
   * PUT /auth/profile
   */
  static async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { username, phone, gender } = req.body;

      const user = await AuthServices.updateUser(userId, {
        username,
        phone,
        gender,
      });

      return response.success(res, "Cập nhật thông tin thành công", {
        id: user.id,
        email: user.email,
        username: user.username,
        phone: user.phone,
        gender: user.gender,
      });
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  /**
   * Đổi mật khẩu
   * POST /auth/change-password
   */
  static async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { oldPassword, newPassword, confirmPassword } = req.body;

      // Validate input
      if (!oldPassword || !newPassword || !confirmPassword) {
        return response.badRequest(res, "Vui lòng điền đầy đủ thông tin");
      }

      if (newPassword.length < 6) {
        return response.badRequest(res, "Mật khẩu mới phải có ít nhất 6 ký tự");
      }

      if (newPassword !== confirmPassword) {
        return response.badRequest(res, "Mật khẩu xác nhận không khớp");
      }

      await AuthServices.changePassword(userId, oldPassword, newPassword);

      return response.success(res, "Đổi mật khẩu thành công");
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  /**
   * Reset mật khẩu (qua email)
   * POST /auth/reset-password
   */
  static async resetPassword(req, res) {
    try {
      const { email, newPassword, confirmPassword } = req.body;

      // Validate input
      if (!email || !newPassword || !confirmPassword) {
        return response.badRequest(res, "Vui lòng điền đầy đủ thông tin");
      }

      if (newPassword !== confirmPassword) {
        return response.badRequest(res, "Mật khẩu xác nhận không khớp");
      }

      await AuthServices.resetPassword(email, newPassword);

      return response.success(res, "Reset mật khẩu thành công");
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  /**
   * Lấy danh sách tất cả người dùng (Admin only)
   * GET /auth/users?limit=10&offset=0
   */
  static async getAllUsers(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const offset = parseInt(req.query.offset) || 0;

      const result = await AuthServices.getAllUsers(limit, offset);

      return response.success(
        res,
        "Lấy danh sách người dùng thành công",
        result
      );
    } catch (error) {
      return response.serverError(res, error.message);
    }
  }

  /**
   * Lấy thông tin người dùng theo ID (Admin only)
   * GET /auth/users/:id
   */
  static async getUserById(req, res) {
    try {
      const userId = req.params.id;

      const user = await AuthServices.getUserById(userId);

      return response.success(res, "Lấy thông tin người dùng thành công", user);
    } catch (error) {
      return response.notFound(res, error.message);
    }
  }

  /**
   * Xóa tài khoản người dùng
   * DELETE /auth/account
   */
  static async deleteAccount(req, res) {
    try {
      const userId = req.user.id;
      const { password } = req.body;

      if (!password) {
        return response.badRequest(
          res,
          "Vui lòng cung cấp mật khẩu để xác nhận"
        );
      }

      await AuthServices.deleteUser(userId, password);

      return response.success(res, "Xóa tài khoản thành công");
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  /**
   * Xác thực token
   * GET /auth/verify
   */
  static async verifyToken(req, res) {
    try {
      return response.success(res, "Token hợp lệ", req.user);
    } catch (error) {
      return response.unauthorized(res, error.message);
    }
  }

  /**
   * Refresh Access Token
   * POST /auth/refresh-token
   */
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return response.badRequest(res, "Refresh token là bắt buộc");
      }

      const result = await AuthServices.refreshAccessToken(refreshToken);

      return response.success(res, "Refresh token thành công", result);
    } catch (error) {
      return response.unauthorized(res, error.message);
    }
  }

  /**
   * Logout (revoke refresh token)
   * POST /auth/logout
   */
  static async logout(req, res) {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        await AuthServices.revokeRefreshToken(refreshToken);
      }

      return response.success(res, "Đăng xuất thành công");
    } catch (error) {
      return response.serverError(res, error.message);
    }
  }

  /**
   * Logout from all devices
   * POST /auth/logout-all
   */
  static async logoutAll(req, res) {
    try {
      const userId = req.user.id;

      await AuthServices.revokeAllRefreshTokens(userId);

      return response.success(res, "Đăng xuất từ tất cả thiết bị thành công");
    } catch (error) {
      return response.serverError(res, error.message);
    }
  }
}

module.exports = AuthController;

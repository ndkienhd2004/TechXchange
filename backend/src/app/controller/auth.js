const AuthServices = require("../service/auth");

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
        return res.status(400).json({
          success: false,
          message: "Email và mật khẩu là bắt buộc",
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Email không hợp lệ",
        });
      }

      // Validate password length
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Mật khẩu phải có ít nhất 6 ký tự",
        });
      }

      const result = await AuthServices.register({
        email,
        password,
        username,
        phone,
        gender,
      });

      return res.status(201).json({
        success: true,
        message: "Đăng ký thành công",
        data: result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
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
        return res.status(400).json({
          success: false,
          message: "Email và mật khẩu là bắt buộc",
        });
      }

      const result = await AuthServices.login(email, password);

      return res.status(200).json({
        success: true,
        message: "Đăng nhập thành công",
        data: result,
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
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

      return res.status(200).json({
        success: true,
        message: "Lấy thông tin thành công",
        data: user,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
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

      return res.status(200).json({
        success: true,
        message: "Cập nhật thông tin thành công",
        data: {
          id: user.id,
          email: user.email,
          username: user.username,
          phone: user.phone,
          gender: user.gender,
        },
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
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
        return res.status(400).json({
          success: false,
          message: "Vui lòng điền đầy đủ thông tin",
        });
      }

      // Validate password length
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Mật khẩu mới phải có ít nhất 6 ký tự",
        });
      }

      // Check password confirmation
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Mật khẩu xác nhận không khớp",
        });
      }

      await AuthServices.changePassword(userId, oldPassword, newPassword);

      return res.status(200).json({
        success: true,
        message: "Đổi mật khẩu thành công",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
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
        return res.status(400).json({
          success: false,
          message: "Vui lòng điền đầy đủ thông tin",
        });
      }

      // Check password confirmation
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Mật khẩu xác nhận không khớp",
        });
      }

      await AuthServices.resetPassword(email, newPassword);

      return res.status(200).json({
        success: true,
        message: "Reset mật khẩu thành công",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
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

      return res.status(200).json({
        success: true,
        message: "Lấy danh sách người dùng thành công",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
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

      return res.status(200).json({
        success: true,
        message: "Lấy thông tin người dùng thành công",
        data: user,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
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
        return res.status(400).json({
          success: false,
          message: "Vui lòng cung cấp mật khẩu để xác nhận",
        });
      }

      await AuthServices.deleteUser(userId, password);

      return res.status(200).json({
        success: true,
        message: "Xóa tài khoản thành công",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Xác thực token
   * GET /auth/verify
   */
  static async verifyToken(req, res) {
    try {
      return res.status(200).json({
        success: true,
        message: "Token hợp lệ",
        data: req.user,
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
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
        return res.status(400).json({
          success: false,
          message: "Refresh token là bắt buộc",
        });
      }

      const result = await AuthServices.refreshAccessToken(refreshToken);

      return res.status(200).json({
        success: true,
        message: "Refresh token thành công",
        data: result,
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
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

      return res.status(200).json({
        success: true,
        message: "Đăng xuất thành công",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
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

      return res.status(200).json({
        success: true,
        message: "Đăng xuất từ tất cả thiết bị thành công",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = AuthController;

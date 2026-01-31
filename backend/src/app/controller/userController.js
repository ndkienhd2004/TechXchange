const UserService = require("../service/userService");

/**
 * User Controller - Xử lý requests liên quan đến user
 */
class UserController {
  /**
   * Lấy profile người dùng hiện tại
   * GET /users/profile
   */
  static async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await UserService.getUserProfile(userId);

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
   * Cập nhật profile người dùng
   * PUT /users/profile
   */
  static async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { username, phone, gender } = req.body;

      const user = await UserService.updateUser(userId, {
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
   * Lấy public profile của user
   * GET /users/public/:id
   */
  static async getPublicProfile(req, res) {
    try {
      const userId = req.params.id;
      const user = await UserService.getPublicProfile(userId);

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
   * Lấy danh sách tất cả người dùng (Admin)
   * GET /users?limit=10&offset=0
   */
  static async getAllUsers(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const offset = parseInt(req.query.offset) || 0;

      const result = await UserService.getAllUsers(limit, offset);

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
   * Lấy thông tin người dùng theo ID (Admin)
   * GET /users/:id
   */
  static async getUserById(req, res) {
    try {
      const userId = req.params.id;
      const user = await UserService.getUserById(userId);

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
   * Tìm kiếm người dùng (Admin)
   * GET /users/search?email=...&username=...
   */
  static async searchUsers(req, res) {
    try {
      const { email, username, role } = req.query;
      const limit = parseInt(req.query.limit) || 10;
      const offset = parseInt(req.query.offset) || 0;

      const searchCriteria = {};
      if (email) searchCriteria.email = email;
      if (username) searchCriteria.username = username;
      if (role) searchCriteria.role = role;

      const result = await UserService.searchUsers(
        searchCriteria,
        limit,
        offset
      );

      return res.status(200).json({
        success: true,
        message: "Tìm kiếm người dùng thành công",
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
   * Lấy thống kê user (Admin)
   * GET /users/stats
   */
  static async getUserStats(req, res) {
    try {
      const stats = await UserService.getUserStats();

      return res.status(200).json({
        success: true,
        message: "Lấy thống kê thành công",
        data: stats,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Đổi mật khẩu
   * POST /users/change-password
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

      const AuthServices = require("../service/auth");
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
   * Xóa tài khoản
   * DELETE /users/account
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

      const AuthServices = require("../service/auth");
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
}

module.exports = UserController;

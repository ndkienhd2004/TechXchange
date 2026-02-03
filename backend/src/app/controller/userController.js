const UserService = require("../service/userService");
const { response } = require("../utils/response");

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

      return response.success(res, "Lấy thông tin thành công", user);
    } catch (error) {
      return response.notFound(res, error.message);
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
   * Lấy public profile của user
   * GET /users/public/:id
   */
  static async getPublicProfile(req, res) {
    try {
      const userId = req.params.id;
      const user = await UserService.getPublicProfile(userId);

      return response.success(res, "Lấy thông tin thành công", user);
    } catch (error) {
      return response.notFound(res, error.message);
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
   * Lấy thông tin người dùng theo ID (Admin)
   * GET /users/:id
   */
  static async getUserById(req, res) {
    try {
      const userId = req.params.id;
      const user = await UserService.getUserById(userId);

      return response.success(res, "Lấy thông tin người dùng thành công", user);
    } catch (error) {
      return response.notFound(res, error.message);
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

      return response.success(res, "Tìm kiếm người dùng thành công", result);
    } catch (error) {
      return response.serverError(res, error.message);
    }
  }

  /**
   * Lấy thống kê user (Admin)
   * GET /users/stats
   */
  static async getUserStats(req, res) {
    try {
      const stats = await UserService.getUserStats();

      return response.success(res, "Lấy thống kê thành công", stats);
    } catch (error) {
      return response.serverError(res, error.message);
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

      if (!oldPassword || !newPassword || !confirmPassword) {
        return response.badRequest(res, "Vui lòng điền đầy đủ thông tin");
      }

      if (newPassword.length < 6) {
        return response.badRequest(res, "Mật khẩu mới phải có ít nhất 6 ký tự");
      }

      if (newPassword !== confirmPassword) {
        return response.badRequest(res, "Mật khẩu xác nhận không khớp");
      }

      const AuthServices = require("../service/auth");
      await AuthServices.changePassword(userId, oldPassword, newPassword);

      return response.success(res, "Đổi mật khẩu thành công");
    } catch (error) {
      return response.badRequest(res, error.message);
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
        return response.badRequest(
          res,
          "Vui lòng cung cấp mật khẩu để xác nhận"
        );
      }

      const AuthServices = require("../service/auth");
      await AuthServices.deleteUser(userId, password);

      return response.success(res, "Xóa tài khoản thành công");
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }
}

module.exports = UserController;

const { User } = require("../../models");

/**
 * User Service - Quản lý thông tin người dùng
 * Các hàm liên quan đến lấy, cập nhật thông tin user
 */
class UserService {
  /**
   * Lấy thông tin người dùng theo ID
   * @param {number} userId - ID người dùng
   * @returns {Promise<object>} Thông tin người dùng
   */
  static async getUserById(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: [
          "id",
          "email",
          "username",
          "phone",
          "gender",
          "role",
          "created_at",
          "updated_at",
        ],
      });
      if (!user) {
        throw new Error("Người dùng không tồn tại");
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy thông tin người dùng theo email
   * @param {string} email - Email người dùng
   * @returns {Promise<object>} Thông tin người dùng
   */
  static async getUserByEmail(email) {
    try {
      const user = await User.findOne({
        where: { email },
        attributes: [
          "id",
          "email",
          "username",
          "phone",
          "gender",
          "role",
          "created_at",
          "updated_at",
        ],
      });
      if (!user) {
        throw new Error("Người dùng không tồn tại");
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cập nhật thông tin người dùng
   * @param {number} userId - ID người dùng
   * @param {object} updateData - Dữ liệu cần cập nhật
   * @returns {Promise<object>} Người dùng sau khi cập nhật
   */
  static async updateUser(userId, updateData) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("Người dùng không tồn tại");
      }

      // Kiểm tra email trùng
      if (updateData.email && updateData.email !== user.email) {
        const existingEmail = await User.findOne({
          where: { email: updateData.email },
        });
        if (existingEmail) {
          throw new Error("Email đã được đăng ký");
        }
      }

      // Kiểm tra số điện thoại trùng
      if (updateData.phone && updateData.phone !== user.phone) {
        const existingPhone = await User.findOne({
          where: { phone: updateData.phone },
        });
        if (existingPhone) {
          throw new Error("Số điện thoại đã được đăng ký");
        }
      }

      // Cập nhật thông tin
      const allowedFields = ["username", "email", "phone", "gender"];
      const dataToUpdate = {};
      allowedFields.forEach((field) => {
        if (updateData[field]) {
          dataToUpdate[field] = updateData[field];
        }
      });

      await user.update(dataToUpdate);
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy danh sách tất cả người dùng (pagination)
   * @param {number} limit - Giới hạn số lượng
   * @param {number} offset - Vị trí bắt đầu
   * @returns {Promise<object>} Danh sách người dùng
   */
  static async getAllUsers(limit = 10, offset = 0) {
    try {
      const { count, rows } = await User.findAndCountAll({
        limit,
        offset,
        attributes: [
          "id",
          "email",
          "username",
          "phone",
          "gender",
          "role",
          "created_at",
        ],
        order: [["created_at", "DESC"]],
      });

      return {
        total: count,
        users: rows,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(count / limit),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Tìm kiếm người dùng
   * @param {object} searchCriteria - Tiêu chí tìm kiếm
   * @param {number} limit - Giới hạn số lượng
   * @param {number} offset - Vị trí bắt đầu
   * @returns {Promise<object>} Kết quả tìm kiếm
   */
  static async searchUsers(searchCriteria = {}, limit = 10, offset = 0) {
    try {
      const whereClause = {};

      // Tìm theo email
      if (searchCriteria.email) {
        whereClause.email = {
          [require("sequelize").Op.iLike]: `%${searchCriteria.email}%`,
        };
      }

      // Tìm theo username
      if (searchCriteria.username) {
        whereClause.username = {
          [require("sequelize").Op.iLike]: `%${searchCriteria.username}%`,
        };
      }

      // Tìm theo role
      if (searchCriteria.role) {
        whereClause.role = searchCriteria.role;
      }

      const { count, rows } = await User.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        attributes: [
          "id",
          "email",
          "username",
          "phone",
          "gender",
          "role",
          "created_at",
        ],
        order: [["created_at", "DESC"]],
      });

      return {
        total: count,
        users: rows,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(count / limit),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Kiểm tra quyền admin
   * @param {number} userId - ID người dùng
   * @returns {Promise<boolean>} True nếu là admin
   */
  static async isAdmin(userId) {
    try {
      const user = await User.findByPk(userId);
      return user && user.role === "admin";
    } catch (error) {
      throw error;
    }
  }

  /**
   * Kiểm tra user tồn tại
   * @param {number} userId - ID người dùng
   * @returns {Promise<boolean>} True nếu user tồn tại
   */
  static async userExists(userId) {
    try {
      const user = await User.findByPk(userId);
      return !!user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy profile user (không bao gồm sensitive data)
   * @param {number} userId - ID người dùng
   * @returns {Promise<object>} Profile user
   */
  static async getUserProfile(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: ["id", "email", "username", "phone", "gender", "role"],
      });
      if (!user) {
        throw new Error("Người dùng không tồn tại");
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy thông tin user công khai (public profile)
   * @param {number} userId - ID người dùng
   * @returns {Promise<object>} Public profile
   */
  static async getPublicProfile(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: ["id", "username", "gender", "created_at"],
      });
      if (!user) {
        throw new Error("Người dùng không tồn tại");
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy danh sách admin
   * @returns {Promise<array>} Danh sách admin
   */
  static async getAdmins() {
    try {
      const admins = await User.findAll({
        where: { role: "admin" },
        attributes: ["id", "email", "username", "created_at"],
        order: [["created_at", "DESC"]],
      });
      return admins;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Đếm tổng số user
   * @returns {Promise<number>} Tổng số user
   */
  static async getTotalUserCount() {
    try {
      const count = await User.count();
      return count;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Đếm số admin
   * @returns {Promise<number>} Tổng số admin
   */
  static async getAdminCount() {
    try {
      const count = await User.count({
        where: { role: "admin" },
      });
      return count;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy thống kê user
   * @returns {Promise<object>} Thống kê
   */
  static async getUserStats() {
    try {
      const totalUsers = await User.count();
      const adminCount = await User.count({ where: { role: "admin" } });
      const regularUsers = totalUsers - adminCount;

      return {
        total: totalUsers,
        admins: adminCount,
        regularUsers: regularUsers,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserService;

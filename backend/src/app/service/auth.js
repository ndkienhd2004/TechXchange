const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, RefreshToken, sequelize } = require("../../models");
const { Op } = require("sequelize");

class AuthServices {
  /**
   * Mã hóa mật khẩu
   * @param {string} password - Mật khẩu cần mã hóa
   * @returns {Promise<string>} Mật khẩu đã mã hóa
   */
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  /**
   * So sánh mật khẩu với hash
   * @param {string} password - Mật khẩu cần kiểm tra
   * @param {string} passwordHash - Hash mật khẩu đã lưu
   * @returns {Promise<boolean>} True nếu khớp, false nếu không
   */
  static async comparePassword(password, passwordHash) {
    return await bcrypt.compare(password, passwordHash);
  }

  /**
   * Tạo JWT token
   * @param {object} payload - Dữ liệu để encode vào token
   * @param {string} expiresIn - Thời gian hết hạn (mặc định: 15m)
   * @returns {string} JWT token
   */
  static generateToken(payload, expiresIn = "15m") {
    return jwt.sign(payload, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn,
    });
  }

  /**
   * Tạo Refresh token
   * @param {object} payload - Dữ liệu để encode vào token
   * @param {string} expiresIn - Thời gian hết hạn (mặc định: 7d)
   * @returns {string} Refresh token
   */
  static generateRefreshToken(payload, expiresIn = "7d") {
    return jwt.sign(payload, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn,
    });
  }

  /**
   * Xác thực JWT token
   * @param {string} token - Token cần xác thực
   * @returns {Promise<object>} Payload nếu token hợp lệ
   * @throws {Error} Nếu token không hợp lệ
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    } catch (error) {
      throw new Error(`Token không hợp lệ: ${error.message}`);
    }
  }

  /**
   * Xác thực Refresh token
   * @param {string} token - Refresh token cần xác thực
   * @returns {Promise<object>} Payload nếu token hợp lệ
   * @throws {Error} Nếu token không hợp lệ
   */
  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    } catch (error) {
      throw new Error(`Refresh token không hợp lệ: ${error.message}`);
    }
  }

  /**
   * Đăng ký tài khoản người dùng mới
   * @param {object} userData - Dữ liệu người dùng {email, password, username, phone, gender}
   * @returns {Promise<object>} Người dùng vừa tạo và token
   */
  static async register(userData) {
    try {
      const { email, password, username, phone, gender } = userData;

      // Kiểm tra email đã tồn tại
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error("Email đã được đăng ký");
      }

      // Kiểm tra số điện thoại đã tồn tại
      if (phone) {
        const phoneExists = await User.findOne({ where: { phone } });
        if (phoneExists) {
          throw new Error("Số điện thoại đã được đăng ký");
        }
      }

      // Mã hóa mật khẩu
      const hashedPassword = await this.hashPassword(password);

      // Tạo người dùng mới
      const user = await User.create({
        email,
        password_hash: hashedPassword,
        username: username || email.split("@")[0],
        phone: phone || null,
        gender: gender || "other",
        role: "user",
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Đăng nhập
   * @param {string} email - Email người dùng
   * @param {string} password - Mật khẩu
   * @returns {Promise<object>} Người dùng và token
   */
  static async login(email, password) {
    try {
      // Tìm người dùng
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw new Error("Email hoặc mật khẩu không chính xác");
      }

      // Kiểm tra mật khẩu
      const isPasswordValid = await this.comparePassword(
        password,
        user.password_hash
      );
      if (!isPasswordValid) {
        throw new Error("Email hoặc mật khẩu không chính xác");
      }

      // Tạo tokens
      const accessToken = this.generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = this.generateRefreshToken({
        id: user.id,
        email: user.email,
      });

      // Lưu refresh token vào database
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 ngày

      await RefreshToken.create({
        user_id: user.id,
        token: refreshToken,
        expires_at: expiresAt,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          phone: user.phone,
          gender: user.gender,
          role: user.role,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Đổi mật khẩu
   * @param {number} userId - ID người dùng
   * @param {string} oldPassword - Mật khẩu cũ
   * @param {string} newPassword - Mật khẩu mới
   * @returns {Promise<boolean>} True nếu thành công
   */
  static async changePassword(userId, oldPassword, newPassword) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("Người dùng không tồn tại");
      }

      // Kiểm tra mật khẩu cũ
      const isPasswordValid = await this.comparePassword(
        oldPassword,
        user.password_hash
      );
      if (!isPasswordValid) {
        throw new Error("Mật khẩu cũ không chính xác");
      }

      // Mã hóa mật khẩu mới
      const hashedPassword = await this.hashPassword(newPassword);
      await user.update({ password_hash: hashedPassword });

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reset mật khẩu (thường được gửi qua email)
   * @param {string} email - Email người dùng
   * @param {string} newPassword - Mật khẩu mới
   * @returns {Promise<boolean>} True nếu thành công
   */
  static async resetPassword(email, newPassword) {
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw new Error("Người dùng không tồn tại");
      }

      // Mã hóa mật khẩu mới
      const hashedPassword = await this.hashPassword(newPassword);
      await user.update({ password_hash: hashedPassword });

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<object>} Token mới
   */
  static async refreshAccessToken(refreshToken) {
    try {
      // Xác thực refresh token
      const decoded = this.verifyRefreshToken(refreshToken);

      // Kiểm tra refresh token có tồn tại trong database và không bị revoke
      const tokenRecord = await RefreshToken.findOne({
        where: {
          token: refreshToken,
          user_id: decoded.id,
          is_revoked: false,
        },
      });

      if (!tokenRecord) {
        throw new Error("Refresh token không hợp lệ hoặc đã bị revoke");
      }

      // Kiểm tra token đã hết hạn chưa
      if (tokenRecord.expires_at < new Date()) {
        throw new Error("Refresh token đã hết hạn");
      }

      // Lấy thông tin user
      const user = await User.findByPk(decoded.id);
      if (!user) {
        throw new Error("Người dùng không tồn tại");
      }

      // Tạo access token mới
      const newAccessToken = this.generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        accessToken: newAccessToken,
        refreshToken, // Có thể giữ lại refresh token cũ hoặc tạo mới
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Revoke refresh token (khi logout)
   * @param {string} refreshToken - Refresh token cần revoke
   * @returns {Promise<boolean>} True nếu revoke thành công
   */
  static async revokeRefreshToken(refreshToken) {
    try {
      const tokenRecord = await RefreshToken.findOne({
        where: { token: refreshToken },
      });

      if (tokenRecord) {
        await tokenRecord.update({ is_revoked: true });
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Revoke tất cả refresh token của user (khi logout from all devices)
   * @param {number} userId - ID người dùng
   * @returns {Promise<boolean>} True nếu revoke thành công
   */
  static async revokeAllRefreshTokens(userId) {
    try {
      await RefreshToken.update(
        { is_revoked: true },
        { where: { user_id: userId, is_revoked: false } }
      );

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xóa refresh token đã hết hạn
   * @returns {Promise<number>} Số token bị xóa
   */
  static async deleteExpiredTokens() {
    try {
      const result = await RefreshToken.destroy({
        where: {
          expires_at: {
            [Op.lt]: new Date(),
          },
        },
      });

      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AuthServices;

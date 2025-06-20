// services/auth.service.js (UPDATED)
const User = require("../../models").User;
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const redisClient = require("../../config/redisClient");
const EmailNotification = require("../../sideCar/email");

class AuthService {
  constructor() {
    this.emailService = new EmailNotification();
  }

  async register(userData) {
    const { email, username, password } = userData;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      const error = new Error("Email already exists");
      error.statusCode = 409;
      throw error;
    }

    // 2. Create user (password is in passwordHash field to match model)
    const newUser = await User.create({
      email,
      username,
      passwordHash: password,
    });

    return newUser;
  }

  async login(email, password) {
    // 1. Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }

    // 2. Compare password with the stored hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }

    return user;
  }

  async forgotPassword(email) {
    // 1. Tìm user theo email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    // 2. Tạo mã xác thực 6 chữ số
    const resetCode = crypto.randomInt(100000, 999999).toString();

    // 3. Lưu mã vào Redis với thời gian hết hạn 10 phút
    const resetKey = `reset_password:${email}`;
    const RESET_CODE_EXPIRY = 10 * 60; // 10 phút

    try {
      await redisClient.setEx(resetKey, RESET_CODE_EXPIRY, resetCode);
    } catch (redisError) {
      console.error("Redis Error on forgotPassword:", redisError);
      const error = new Error("Failed to generate reset code");
      error.statusCode = 500;
      throw error;
    }

    // 4. Gửi email với mã xác thực
    try {
      await this.emailService.sendForgotPasswordEmail(email, resetCode);
    } catch (emailError) {
      console.error("Email Error on forgotPassword:", emailError);
      // Xóa mã khỏi Redis nếu gửi email thất bại
      await redisClient.del(resetKey);
      const error = new Error("Failed to send reset email");
      error.statusCode = 500;
      throw error;
    }

    return {
      success: true,
      message: "Reset code sent to your email",
      expiresInMinutes: 10,
    };
  }

  async verifyResetCode(email, code) {
    const resetKey = `reset_password:${email}`;

    try {
      const storedCode = await redisClient.get(resetKey);

      if (!storedCode) {
        const error = new Error("Reset code expired or not found");
        error.statusCode = 400;
        throw error;
      }

      if (storedCode !== code) {
        const error = new Error("Invalid reset code");
        error.statusCode = 400;
        throw error;
      }

      // Tạo token tạm thời để cho phép đổi mật khẩu
      const tempToken = crypto.randomBytes(32).toString("hex");
      const tempTokenKey = `temp_reset:${email}`;
      const TEMP_TOKEN_EXPIRY = 5 * 60; // 5 phút để đổi mật khẩu

      await redisClient.setEx(tempTokenKey, TEMP_TOKEN_EXPIRY, tempToken);

      // Xóa mã reset code đã sử dụng
      await redisClient.del(resetKey);

      return {
        success: true,
        tempToken: tempToken,
        message: "Code verified successfully",
        expiresInMinutes: 5,
      };
    } catch (redisError) {
      if (redisError.statusCode) {
        throw redisError; // Re-throw custom errors
      }
      console.error("Redis Error on verifyResetCode:", redisError);
      const error = new Error("Failed to verify reset code");
      error.statusCode = 500;
      throw error;
    }
  }

  async resetPassword(email, tempToken, newPassword) {
    const tempTokenKey = `temp_reset:${email}`;

    try {
      const storedToken = await redisClient.get(tempTokenKey);

      if (!storedToken || storedToken !== tempToken) {
        const error = new Error("Invalid or expired reset token");
        error.statusCode = 400;
        throw error;
      }

      // Tìm user để cập nhật mật khẩu
      const user = await User.findOne({ where: { email } });
      if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
      }

      // Cập nhật mật khẩu trong database
      await user.update({ passwordHash: newPassword });

      // Xóa temp token
      await redisClient.del(tempTokenKey);

      return {
        success: true,
        message: "Password reset successfully",
      };
    } catch (redisError) {
      if (redisError.statusCode) {
        throw redisError; // Re-throw custom errors
      }
      console.error("Redis Error on resetPassword:", redisError);
      const error = new Error("Failed to reset password");
      error.statusCode = 500;
      throw error;
    }
  }
}

module.exports = new AuthService();

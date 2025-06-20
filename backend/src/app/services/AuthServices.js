// services/auth.service.js (NEW FILE)
const User = require("../../models").User; // Adjust path as needed
const bcrypt = require("bcryptjs");

class AuthService {
  async register(userData) {
    const { email, username, password } = userData;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      const error = new Error("Email already exists");
      error.statusCode = 409; // 409 Conflict
      throw error;
    }

    // 2. Create user (password is in `passwordHash` field to match model)
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
      error.statusCode = 401; // 401 Unauthorized
      throw error;
    }

    // 2. Compare password with the stored hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401; // 401 Unauthorized
      throw error;
    }

    return user;
  }

  async forgotPassword(email) {
    // Placeholder for forgot password logic
    const user = await User.findOne({ where: { email } });
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404; // 404 Not Found
      throw error;
    }

    return { success: true };
  }
}

module.exports = new AuthService();

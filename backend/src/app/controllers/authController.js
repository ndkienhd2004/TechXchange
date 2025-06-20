// controllers/auth.controller.js (UPDATED)
const jwt = require("jsonwebtoken");
const authService = require("../services/AuthServices");
const redisClient = require("../../config/redisClient");

const MAX_AGE = 3 * 24 * 60 * 60; // 3 days in seconds

const createToken = (id) => {
  return jwt.sign({ user_id: id }, process.env.JWT_SECRET, {
    expiresIn: MAX_AGE,
  });
};

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await authService.login(email, password);
      const token = createToken(user.id);

      // Resiliently store token in Redis
      try {
        await redisClient.setEx(`token:${user.id}`, MAX_AGE, token);
      } catch (redisError) {
        console.error("Redis Error on login:", redisError);
      }

      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: MAX_AGE * 1000,
        secure: process.env.NODE_ENV === "production",
      });

      res.status(200).json({ user, token });
    } catch (error) {
      res.status(error.statusCode || 400).json({ message: error.message });
    }
  }

  async register(req, res) {
    console.log("New user registered:", req.body);

    try {
      const newUser = await authService.register(req.body);
      const token = createToken(newUser.id);

      try {
        await redisClient.setEx(`token:${newUser.id}`, MAX_AGE, token);
      } catch (redisError) {
        console.error("Redis Error on register:", redisError);
      }

      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: MAX_AGE * 1000,
        secure: process.env.NODE_ENV === "production",
      });

      res.status(201).json({ user: newUser, token });
    } catch (error) {
      res.status(error.statusCode || 400).json({ message: error.message });
    }
  }

  async logout(req, res) {
    const token = req.cookies.jwt;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await redisClient.del(`token:${decoded.user_id}`);
      } catch (err) {
        console.error("Invalid token on logout:", err.message);
      }
    }
    res.cookie("jwt", "", { maxAge: 1 });
    res.status(200).json({ message: "Logout successful" });
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const response = await authService.forgotPassword(email);

      return res.status(200).json({
        message: response.message,
        expiresInMinutes: response.expiresInMinutes,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        message: error.message,
      });
    }
  }

  async verifyResetCode(req, res) {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({
          message: "Email and code are required",
        });
      }

      const response = await authService.verifyResetCode(email, code);

      return res.status(200).json({
        message: response.message,
        tempToken: response.tempToken,
        expiresInMinutes: response.expiresInMinutes,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        message: error.message,
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const { email, tempToken, newPassword } = req.body;

      if (!email || !tempToken || !newPassword) {
        return res.status(400).json({
          message: "Email, temporary token, and new password are required",
        });
      }

      // Validate password strength
      if (newPassword.length < 6) {
        return res.status(400).json({
          message: "Password must be at least 6 characters long",
        });
      }

      const response = await authService.resetPassword(
        email,
        tempToken,
        newPassword
      );

      return res.status(200).json({
        message: response.message,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        message: error.message,
      });
    }
  }
}

module.exports = new AuthController();

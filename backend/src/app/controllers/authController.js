// controllers/auth.controller.js
const jwt = require("jsonwebtoken");
const authService = require("../services/AuthServices"); // Adjust path
const redisClient = require("../../config/redisClient"); // Adjust path
require("dotenv").config();

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
      res.status(error.statusCode | 400).json({ message: error.message });
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
      res.status(error.statusCode | 400).json({ message: error.message });
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
    // Placeholder for forgot password logic
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    // Here you would typically send a reset password email
    const response = await authService.forgotPassword(email);
    if (response.success) {
      return res.status(200).json({ message: "Reset password email sent" });
    }
    return res
      .status(500)
      .json({ message: "Failed to send reset password email" });
  }
}

module.exports = new AuthController();

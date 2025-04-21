const User = require("../models/user");
const jwt = require("jsonwebtoken");
const redisClient = require("../redisClient");
require("dotenv").config();

const MAX_AGE = 3 * 24 * 60 * 60;

const createToken = (id) => {
  return jwt.sign({ user_id: id }, process.env.JWT_SECRET, {
    expiresIn: MAX_AGE,
  });
};

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.login(email, password);

      const token = createToken(user.id);

      await redisClient.setEx(`token:${user.id}`, MAX_AGE, token);

      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: MAX_AGE * 1000,
      });

      res.status(200).json({ user, token });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async register(req, res) {
    try {
      const newUser = await User.create(req.body);
      const token = createToken(newUser.id);

      await redisClient.setEx(`token:${newUser.id}`, MAX_AGE, token);

      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: MAX_AGE * 1000,
      });

      res.status(201).json({ user: newUser, token });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async logout(req, res) {
    const token = req.cookies.jwt;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await redisClient.del(`token:${decoded.user_id}`);
      } catch (err) {
        console.error("Invalid token on logout");
      }
    }

    res.cookie("jwt", "", { maxAge: 1 });
    res.status(200).json({ token: "" });
  }
}

module.exports = new AuthController();

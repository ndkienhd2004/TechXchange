const User = require("../models/user");
const redisClient = require("../redisClient");

class UserController {
  async getUser(req, res) {
    try {
      const cacheKey = `user:${req.user.id}`;
      const cachedUser = await redisClient.get(cacheKey);

      if (cachedUser) {
        return res.status(200).json(JSON.parse(cachedUser));
      }

      const user = await User.findById(req.user.id).select("-password");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await redisClient.setEx(cacheKey, 3600, JSON.stringify(user)); // cache 1 tiếng

      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  }

  async updateUser(req, res) {
    try {
      const user = await User.findByIdAndUpdate(req.user.id, req.body, {
        new: true,
      }).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const cacheKey = `user:${req.user.id}`;
      await redisClient.del(cacheKey);

      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  }

  async deleteUser(req, res) {
    try {
      const user = await User.findByIdAndDelete(req.user.id).select(
        "-password"
      );
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const cacheKey = `user:${req.user.id}`;
      await redisClient.del(cacheKey);

      return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  }
}

module.exports = new UserController();

const UserService = require("../services/UserService.js");

class UserController {
  async getAllUsers(req, res) {
    try {
      const users = await UserService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      res.status(500).json({ message: "An internal server error occurred" });
    }
  }

  async getUserById(req, res) {
    try {
      const user = await UserService.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error("Error in getUserById:", error);
      res.status(500).json({ message: "An internal server error occurred" });
    }
  }

  async updateUser(req, res) {
    console.log("--- BẮT ĐẦU UserController.updateUser ---");
    console.log("UserID từ params:", req.params.id);
    console.log("Data từ body:", req.body);
    try {
      const user = await UserService.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error("Error in updateUser:", error);
      res.status(500).json({ message: "An internal server error occurred" });
    }
  }

  async deleteUser(req, res) {
    try {
      const result = await UserService.deleteUser(req.params.id);
      if (!result) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(result); // Trả về message từ service
    } catch (error) {
      console.error("Error in deleteUser:", error);
      res.status(500).json({ message: "An internal server error occurred" });
    }
  }
}

module.exports = new UserController();

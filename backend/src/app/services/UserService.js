const { User } = require("../../models");
class UserService {
  async getAllUsers() {
    return User.findAll({
      attributes: { exclude: ["passwordHash"] }, // Loại bỏ password khỏi danh sách
    });
  }

  async getUserById(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["passwordHash"] },
    });
    return user;
  }

  async updateUser(userId, userData) {
    const user = await User.findByPk(userId);
    if (!user) {
      return null;
    }

    // === SỬA LỖI BẢO MẬT MASS ASSIGNMENT ===
    const { username, gender, phone, role } = userData;
    const allowedUpdates = { username, gender, phone };

    const updatedUser = await user.update(allowedUpdates);

    const userResponse = updatedUser.toJSON();
    delete userResponse.passwordHash;

    return userResponse;
  }

  async deleteUser(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      return null;
    }
    await user.destroy();
    return { message: "User deleted successfully" };
  }
}

module.exports = new UserService();

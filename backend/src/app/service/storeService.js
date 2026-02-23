const { Store, User } = require("../../models");

class StoreService {
  static async getMyStores(userId) {
    try {
      const stores = await Store.findAll({
        where: { owner_id: userId },
        order: [["created_at", "DESC"]],
        include: [
          {
            model: User,
            as: "owner",
            attributes: ["id", "username", "email"],
          },
        ],
      });

      return stores;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = StoreService;

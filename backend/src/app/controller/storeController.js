const StoreService = require("../service/storeService");
const { response } = require("../utils/response");

class StoreController {
  /**
   * Lấy thông tin cửa hàng của user
   * GET /stores/me
   */
  static async getMyStores(req, res) {
    try {
      const userId = req.user.id;
      const stores = await StoreService.getMyStores(userId);

      return response.success(res, "Lấy cửa hàng của bạn thành công", stores);
    } catch (error) {
      return response.serverError(res, error.message);
    }
  }
}

module.exports = StoreController;

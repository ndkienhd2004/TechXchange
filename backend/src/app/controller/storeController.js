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

  static async getStoreById(req, res) {
    try {
      const store = await StoreService.getStoreById(req.params.id);
      return response.success(res, "Lấy thông tin cửa hàng thành công", store);
    } catch (error) {
      if (error.message === "Cửa hàng không tồn tại") {
        return response.notFound(res, error.message);
      }
      return response.badRequest(res, error.message);
    }
  }

  static async updateMyStoreAddress(req, res) {
    try {
      const store = await StoreService.updateMyStoreAddress(
        req.user.id,
        req.params.id,
        req.body,
      );
      return response.success(res, "Cập nhật địa chỉ shop thành công", store);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  static async updateMyStoreProfile(req, res) {
    try {
      const store = await StoreService.updateMyStoreProfile(
        req.user.id,
        req.params.id,
        req.body,
      );
      return response.success(res, "Cập nhật thông tin shop thành công", store);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  static async registerMyStoreWithGhn(req, res) {
    try {
      const result = await StoreService.registerMyStoreWithGhn(
        req.user.id,
        req.params.id,
      );
      return response.success(
        res,
        result.created ? "Tạo GHN shop thành công" : "Shop đã có GHN shop_id",
        result,
      );
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }
}

module.exports = StoreController;

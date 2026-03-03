const CartService = require("../service/cartService");
const { response } = require("../utils/response");

class CartController {
  static async getCart(req, res) {
    try {
      const userId = req.user.id;
      const data = await CartService.getCart(userId);
      return response.success(res, "Lấy giỏ hàng thành công", data);
    } catch (error) {
      return response.serverError(res, error.message);
    }
  }

  static async addItem(req, res) {
    try {
      const userId = req.user.id;
      const product_id = Number(req.body.product_id);
      const quantity = Number(req.body.quantity || 1);
      const data = await CartService.addItem(userId, { product_id, quantity });
      return response.success(res, "Thêm vào giỏ hàng thành công", data);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  static async updateItem(req, res) {
    try {
      const userId = req.user.id;
      const itemId = Number(req.params.id);
      const quantity = Number(req.body.quantity);
      if (!itemId) return response.badRequest(res, "ID item không hợp lệ");
      const data = await CartService.updateItem(userId, itemId, quantity);
      return response.success(res, "Cập nhật giỏ hàng thành công", data);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  static async removeItem(req, res) {
    try {
      const userId = req.user.id;
      const itemId = Number(req.params.id);
      if (!itemId) return response.badRequest(res, "ID item không hợp lệ");
      const data = await CartService.removeItem(userId, itemId);
      return response.success(res, "Xóa item thành công", data);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  static async clearCart(req, res) {
    try {
      const userId = req.user.id;
      const data = await CartService.clearCart(userId);
      return response.success(res, "Đã xóa toàn bộ giỏ hàng", data);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }
}

module.exports = CartController;

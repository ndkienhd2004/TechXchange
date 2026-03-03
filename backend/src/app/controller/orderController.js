const OrderService = require("../service/orderService");
const { response } = require("../utils/response");

class OrderController {
  static async checkout(req, res) {
    try {
      const cartItemIds = Array.isArray(req.body.cart_item_ids)
        ? req.body.cart_item_ids
        : [];
      const note = req.body.note ? String(req.body.note) : null;
      const order = await OrderService.createOrderFromCart(req.user.id, {
        cart_item_ids: cartItemIds,
        note,
      });
      return response.created(res, "Đặt hàng thành công", order);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  static async getMyOrders(req, res) {
    try {
      const orders = await OrderService.getMyOrders(req.user.id);
      return response.success(res, "Lấy đơn hàng thành công", { orders });
    } catch (error) {
      return response.serverError(res, error.message);
    }
  }
}

module.exports = OrderController;

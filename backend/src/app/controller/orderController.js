const OrderService = require("../service/orderService");
const { response } = require("../utils/response");

class OrderController {
  static async checkout(req, res) {
    try {
      const result = await OrderService.createOrderFromCart(req.user.id, {
        cart_item_ids: Array.isArray(req.body.cart_item_ids)
          ? req.body.cart_item_ids
          : [],
        items: Array.isArray(req.body.items) ? req.body.items : [],
        address_id: req.body.address_id,
        shipping_address: req.body.shipping_address || {},
        payment_method: req.body.payment_method,
        note: req.body.note ? String(req.body.note) : null,
      });
      return response.created(res, "Đặt hàng thành công", result);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  static async getMyOrders(req, res) {
    try {
      const orders = await OrderService.getMyOrders(req.user.id, {
        status: req.query.status,
      });
      return response.success(res, "Lấy đơn hàng thành công", { orders });
    } catch (error) {
      return response.serverError(res, error.message);
    }
  }

  static async getShopOrders(req, res) {
    try {
      const orders = await OrderService.getShopOrders(req.user.id, {
        status: req.query.status,
      });
      return response.success(res, "Lấy đơn hàng shop thành công", { orders });
    } catch (error) {
      return response.serverError(res, error.message);
    }
  }

  static async approveShopOrder(req, res) {
    try {
      const result = await OrderService.approveOrderForShop(
        req.user.id,
        req.params.id,
      );
      return response.success(res, "Duyệt đơn hàng thành công", result);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  static async markReceived(req, res) {
    try {
      const result = await OrderService.markReceived(req.user.id, req.params.id);
      return response.success(res, "Xác nhận nhận hàng thành công", result);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  static async getTransferPaymentInfo(req, res) {
    try {
      const raw = String(req.query.order_ids || "");
      const orderIds = raw
        .split(",")
        .map((v) => Number(v.trim()))
        .filter(Boolean);
      const data = await OrderService.getTransferPaymentInfo(req.user.id, orderIds);
      return response.success(res, "Lấy thông tin thanh toán chuyển khoản thành công", data);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  static async estimateShippingFee(req, res) {
    try {
      const result = await OrderService.calculateShippingFeePreview(req.user.id, {
        cart_item_ids: Array.isArray(req.body.cart_item_ids)
          ? req.body.cart_item_ids
          : [],
        items: Array.isArray(req.body.items) ? req.body.items : [],
        address_id: req.body.address_id,
      });
      return response.success(res, "Tính phí vận chuyển thành công", result);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }
}

module.exports = OrderController;

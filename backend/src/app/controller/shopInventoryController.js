const ShopInventoryService = require("../service/shopInventoryService");
const { response } = require("../utils/response");

class ShopInventoryController {
  static async getInventoryOverview(req, res) {
    try {
      const page = Math.max(Number.parseInt(String(req.query.page || "1"), 10) || 1, 1);
      const limit = Math.min(
        Math.max(Number.parseInt(String(req.query.limit || "10"), 10) || 10, 1),
        100,
      );
      const data = await ShopInventoryService.getInventoryOverview(req.user.id, {
        q: req.query.q,
        page,
        limit,
      });
      return response.success(res, "Lấy danh sách kho thành công", data);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  static async getProductInventoryTransactions(req, res) {
    try {
      const data = await ShopInventoryService.getProductInventoryTransactions(
        req.user.id,
        req.params.productId,
        {
          limit: req.query.limit,
          offset: req.query.offset,
        },
      );
      return response.success(res, "Lấy lịch sử kho thành công", data);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  static async importStock(req, res) {
    try {
      const data = await ShopInventoryService.importStock(req.user.id, {
        product_id: req.body.product_id,
        serial_id: req.body.serial_id,
        quantity: req.body.quantity,
        unit_cost: req.body.unit_cost,
        note: req.body.note,
      });
      return response.success(res, "Nhập kho thành công", data);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }
}

module.exports = ShopInventoryController;

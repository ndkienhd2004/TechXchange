const StoreRequestService = require("../service/storeRequestService");
const { response } = require("../utils/response");

/**
 * Store Request Controller - Xử lý requests mở cửa hàng
 */
class StoreRequestController {
  /**
   * Tạo yêu cầu mở cửa hàng
   * POST /stores/requests
   */
  static async createRequest(req, res) {
    try {
      const userId = req.user.id;
      const { store_name, store_description } = req.body;

      if (!store_name || !String(store_name).trim()) {
        return response.badRequest(res, "Tên cửa hàng là bắt buộc");
      }

      const request = await StoreRequestService.createRequest(userId, {
        store_name: String(store_name).trim(),
        store_description: store_description
          ? String(store_description).trim()
          : null,
      });

      return response.created(
        res,
        "Tạo yêu cầu mở cửa hàng thành công",
        request
      );
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  /**
   * Lấy danh sách yêu cầu của user
   * GET /stores/requests/me
   */
  static async getMyRequests(req, res) {
    try {
      const userId = req.user.id;
      const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
      const offset = parseInt(req.query.offset, 10) || 0;
      const status = req.query.status ? String(req.query.status) : undefined;

      const result = await StoreRequestService.getUserRequests(
        userId,
        status,
        limit,
        offset
      );

      return response.success(res, "Lấy danh sách yêu cầu thành công", result);
    } catch (error) {
      return response.serverError(res, error.message);
    }
  }

  /**
   * Admin: Lấy danh sách yêu cầu mở cửa hàng
   * GET /admin/store-requests
   */
  static async getRequests(req, res) {
    try {
      const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
      const offset = parseInt(req.query.offset, 10) || 0;
      const status = req.query.status ? String(req.query.status) : undefined;

      const result = await StoreRequestService.getRequests(
        status,
        limit,
        offset
      );

      return response.success(res, "Lấy danh sách yêu cầu thành công", result);
    } catch (error) {
      return response.serverError(res, error.message);
    }
  }

  /**
   * Admin: Duyệt yêu cầu mở cửa hàng
   * PUT /admin/store-requests/:id/approve
   */
  static async approveRequest(req, res) {
    try {
      const requestId = Number(req.params.id);
      if (!requestId) {
        return response.badRequest(res, "ID yêu cầu không hợp lệ");
      }

      const result = await StoreRequestService.approveRequest(
        requestId,
        req.user.id
      );

      return response.success(res, "Duyệt yêu cầu thành công", result);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  /**
   * Admin: Từ chối yêu cầu mở cửa hàng
   * PUT /admin/store-requests/:id/reject
   */
  static async rejectRequest(req, res) {
    try {
      const requestId = Number(req.params.id);
      const { note } = req.body;

      if (!requestId) {
        return response.badRequest(res, "ID yêu cầu không hợp lệ");
      }

      const request = await StoreRequestService.rejectRequest(
        requestId,
        req.user.id,
        note
      );

      return response.success(res, "Từ chối yêu cầu thành công", request);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }
}

module.exports = StoreRequestController;

const StoreRequestService = require("../service/storeRequestService");

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
        return res.status(400).json({
          success: false,
          message: "Tên cửa hàng là bắt buộc",
        });
      }

      const request = await StoreRequestService.createRequest(userId, {
        store_name: String(store_name).trim(),
        store_description: store_description
          ? String(store_description).trim()
          : null,
      });

      return res.status(201).json({
        success: true,
        message: "Tạo yêu cầu mở cửa hàng thành công",
        data: request,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
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

      return res.status(200).json({
        success: true,
        message: "Lấy danh sách yêu cầu thành công",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
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

      return res.status(200).json({
        success: true,
        message: "Lấy danh sách yêu cầu thành công",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
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
        return res.status(400).json({
          success: false,
          message: "ID yêu cầu không hợp lệ",
        });
      }

      const result = await StoreRequestService.approveRequest(
        requestId,
        req.user.id
      );

      return res.status(200).json({
        success: true,
        message: "Duyệt yêu cầu thành công",
        data: result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
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
        return res.status(400).json({
          success: false,
          message: "ID yêu cầu không hợp lệ",
        });
      }

      const request = await StoreRequestService.rejectRequest(
        requestId,
        req.user.id,
        note
      );

      return res.status(200).json({
        success: true,
        message: "Từ chối yêu cầu thành công",
        data: request,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = StoreRequestController;

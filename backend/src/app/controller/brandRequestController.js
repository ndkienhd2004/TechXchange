const BrandRequestService = require("../service/brandRequestService");
const { response } = require("../utils/response");

/**
 * Brand Request Controller - Xử lý requests yêu cầu tạo brand
 */
class BrandRequestController {
  /**
   * Tạo yêu cầu brand (Shop)
   * POST /brands/requests
   */
  static async createRequest(req, res) {
    try {
      const requesterId = req.user.id;
      const name = req.body.name ? String(req.body.name).trim() : "";
      const image = req.body.image ? String(req.body.image).trim() : null;

      if (!name) {
        return response.badRequest(res, "Tên thương hiệu là bắt buộc");
      }

      const request = await BrandRequestService.createRequest(requesterId, {
        name,
        image,
      });

      return response.created(
        res,
        "Tạo yêu cầu thương hiệu thành công",
        request
      );
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  /**
   * Lấy danh sách yêu cầu của shop
   * GET /brands/requests/me
   */
  static async getMyRequests(req, res) {
    try {
      const requesterId = req.user.id;
      const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
      const offset = parseInt(req.query.offset, 10) || 0;
      const status = req.query.status ? String(req.query.status) : undefined;

      const result = await BrandRequestService.getMyRequests(
        requesterId,
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
   * Admin: Lấy danh sách yêu cầu brand
   * GET /admin/brand-requests
   */
  static async getRequests(req, res) {
    try {
      const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
      const offset = parseInt(req.query.offset, 10) || 0;
      const status = req.query.status ? String(req.query.status) : undefined;

      const result = await BrandRequestService.getRequests(
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
   * Admin: Duyệt yêu cầu brand
   * PUT /admin/brand-requests/:id/approve
   */
  static async approveRequest(req, res) {
    try {
      const requestId = Number(req.params.id);
      if (!requestId) {
        return response.badRequest(res, "ID yêu cầu không hợp lệ");
      }

      const result = await BrandRequestService.approveRequest(
        requestId,
        req.user.id
      );

      return response.success(res, "Duyệt yêu cầu thành công", result);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  /**
   * Admin: Từ chối yêu cầu brand
   * PUT /admin/brand-requests/:id/reject
   */
  static async rejectRequest(req, res) {
    try {
      const requestId = Number(req.params.id);
      const { note } = req.body;

      if (!requestId) {
        return response.badRequest(res, "ID yêu cầu không hợp lệ");
      }

      const request = await BrandRequestService.rejectRequest(
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

module.exports = BrandRequestController;

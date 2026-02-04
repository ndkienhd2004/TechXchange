const ProductRequestService = require("../service/productRequestService");
const { response } = require("../utils/response");

class ProductRequestController {
  /**
   * Shop: Tạo yêu cầu sản phẩm
   * POST /products/requests
   */
  static async createRequest(req, res) {
    try {
      const requesterId = req.user.id;
      const name = req.body.name ? String(req.body.name).trim() : "";
      const category_id = Number(req.body.category_id);
      const brand_id = req.body.brand_id ? Number(req.body.brand_id) : undefined;
      const brand_name = req.body.brand_name
        ? String(req.body.brand_name).trim()
        : undefined;
      const description = req.body.description
        ? String(req.body.description).trim()
        : null;
      const specs = req.body.specs || null;
      const default_image = req.body.default_image
        ? String(req.body.default_image).trim()
        : null;

      if (!name || !category_id) {
        return response.badRequest(res, "Thiếu thông tin bắt buộc");
      }

      const request = await ProductRequestService.createRequest(requesterId, {
        name,
        category_id,
        brand_id,
        brand_name,
        description,
        specs,
        default_image,
      });

      return response.created(
        res,
        "Tạo yêu cầu sản phẩm thành công",
        request
      );
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  /**
   * Shop: Lấy danh sách yêu cầu của shop
   * GET /products/requests/me
   */
  static async getMyRequests(req, res) {
    try {
      const requesterId = req.user.id;
      const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
      const offset = parseInt(req.query.offset, 10) || 0;
      const status = req.query.status ? String(req.query.status) : undefined;

      const result = await ProductRequestService.getMyRequests(
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
   * Admin: Lấy danh sách yêu cầu sản phẩm
   * GET /admin/product-requests
   */
  static async getRequests(req, res) {
    try {
      const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
      const offset = parseInt(req.query.offset, 10) || 0;
      const status = req.query.status ? String(req.query.status) : undefined;

      const result = await ProductRequestService.getRequests(
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
   * Admin: Duyệt yêu cầu sản phẩm
   * PUT /admin/product-requests/:id/approve
   */
  static async approveRequest(req, res) {
    try {
      const requestId = Number(req.params.id);
      if (!requestId) {
        return response.badRequest(res, "ID yêu cầu không hợp lệ");
      }

      const result = await ProductRequestService.approveRequest(
        requestId,
        req.user.id
      );

      return response.success(res, "Duyệt yêu cầu thành công", result);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  /**
   * Admin: Từ chối yêu cầu sản phẩm
   * PUT /admin/product-requests/:id/reject
   */
  static async rejectRequest(req, res) {
    try {
      const requestId = Number(req.params.id);
      const { note } = req.body;

      if (!requestId) {
        return response.badRequest(res, "ID yêu cầu không hợp lệ");
      }

      const request = await ProductRequestService.rejectRequest(
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

module.exports = ProductRequestController;

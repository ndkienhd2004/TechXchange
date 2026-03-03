const CatalogSpecRequestService = require("../service/catalogSpecRequestService");
const { response } = require("../utils/response");

class CatalogSpecRequestController {
  static async createRequest(req, res) {
    try {
      const requesterId = req.user.id;
      const catalog_id = Number(req.body.catalog_id);
      const spec_key = req.body.spec_key ? String(req.body.spec_key).trim() : "";
      const proposed_values = req.body.proposed_values;

      const request = await CatalogSpecRequestService.createRequest(requesterId, {
        catalog_id,
        spec_key,
        proposed_values,
      });

      return response.created(res, "Tạo yêu cầu thêm specs thành công", request);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  static async getMyRequests(req, res) {
    try {
      const requesterId = req.user.id;
      const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const status = req.query.status ? String(req.query.status) : undefined;
      const offset = (page - 1) * limit;

      const result = await CatalogSpecRequestService.getMyRequests(
        requesterId,
        status,
        limit,
        offset
      );

      return response.success(res, "Lấy danh sách yêu cầu specs thành công", result);
    } catch (error) {
      return response.serverError(res, error.message);
    }
  }

  static async getRequests(req, res) {
    try {
      const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const status = req.query.status ? String(req.query.status) : undefined;
      const q = req.query.q ? String(req.query.q).trim() : undefined;

      const result = await CatalogSpecRequestService.getRequests(
        { status, q },
        limit,
        page
      );

      return response.success(res, "Lấy danh sách yêu cầu specs thành công", result);
    } catch (error) {
      return response.serverError(res, error.message);
    }
  }

  static async approveRequest(req, res) {
    try {
      const requestId = Number(req.params.id);
      if (!requestId) return response.badRequest(res, "ID yêu cầu không hợp lệ");

      const result = await CatalogSpecRequestService.approveRequest(
        requestId,
        req.user.id
      );
      return response.success(res, "Duyệt yêu cầu specs thành công", result);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  static async rejectRequest(req, res) {
    try {
      const requestId = Number(req.params.id);
      const note = req.body.note ? String(req.body.note).trim() : null;
      if (!requestId) return response.badRequest(res, "ID yêu cầu không hợp lệ");

      const result = await CatalogSpecRequestService.rejectRequest(
        requestId,
        req.user.id,
        note
      );
      return response.success(res, "Từ chối yêu cầu specs thành công", result);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }
}

module.exports = CatalogSpecRequestController;

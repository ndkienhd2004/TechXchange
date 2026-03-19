const ProductCatalogService = require("../service/productCatalogService");
const { response } = require("../utils/response");

class ProductCatalogController {
  /**
   * Lấy danh sách catalog
   * GET /catalogs
   */
  static async getCatalogs(req, res) {
    try {
      const limit = Math.min(
        parseInt(req.query.limit || req.query.size, 10) || 10,
        100
      );
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

      const parseNumber = (value) => {
        if (value === undefined) {
          return undefined;
        }
        const parsed = Number(value);
        return Number.isNaN(parsed) ? undefined : parsed;
      };

      const filters = {
        statuses: req.query.status
          ? String(req.query.status)
              .split(",")
              .map((item) => item.trim())
              .map((item) => (item === "success" ? "active" : item))
              .filter(Boolean)
          : ["active"],
        category_id: parseNumber(req.query.category_id),
        brand_id: parseNumber(req.query.brand_id),
        q: req.query.q ? String(req.query.q).trim() : undefined,
      };

      const result = await ProductCatalogService.getCatalogs(
        filters,
        limit,
        page
      );

      return response.success(res, "Lấy danh sách catalog thành công", result);
    } catch (error) {
      return response.serverError(res, error.message);
    }
  }

  /**
   * Admin: Lấy danh sách catalog
   * GET /admin/catalog-products
   */
  static async getAdminCatalogs(req, res) {
    try {
      const limit = Math.min(
        parseInt(req.query.limit || req.query.size, 10) || 10,
        100
      );
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

      const parseNumber = (value) => {
        if (value === undefined) {
          return undefined;
        }
        const parsed = Number(value);
        return Number.isNaN(parsed) ? undefined : parsed;
      };

      const statusParam = req.query.status
        ? String(req.query.status).trim()
        : "all";

      const statuses =
        statusParam === "all"
          ? null
          : statusParam
              .split(",")
              .map((item) => item.trim())
              .map((item) => (item === "success" ? "active" : item))
              .filter(Boolean);

      const filters = {
        statuses,
        category_id: parseNumber(req.query.category_id),
        brand_id: parseNumber(req.query.brand_id),
        q: req.query.q ? String(req.query.q).trim() : undefined,
      };

      const result = await ProductCatalogService.getCatalogs(
        filters,
        limit,
        page
      );

      return response.success(
        res,
        "Lấy danh sách catalog admin thành công",
        result
      );
    } catch (error) {
      return response.serverError(res, error.message);
    }
  }
  /**
   * Admin: Xóa catalog
   * DELETE /admin/catalog-products/:id
   */
  static async deleteCatalog(req, res) {
    try {
      const catalogId = Number(req.params.id);
      if (!catalogId) {
        return response.badRequest(res, "ID catalog không hợp lệ");
      }

      const result = await ProductCatalogService.deleteCatalog(catalogId, {
        actorId: req.user?.id,
      });

      return response.success(res, "Xóa catalog thành công", result);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  /**
   * Admin: Cập nhật catalog
   * PUT /admin/catalog-products/:id
   */
  static async updateCatalog(req, res) {
    try {
      const catalogId = Number(req.params.id);
      if (!catalogId) {
        return response.badRequest(res, "ID catalog không hợp lệ");
      }

      const payload = {
        name: req.body.name,
        description: req.body.description,
        default_image: req.body.default_image,
        msrp: req.body.msrp,
        specs: req.body.specs,
        status: req.body.status,
        brand_id: req.body.brand_id,
        category_id: req.body.category_id,
      };

      const result = await ProductCatalogService.updateCatalog(catalogId, payload);
      return response.success(res, "Cập nhật catalog thành công", result);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  /**
   * Admin: Duyệt catalog
   * PUT /admin/catalog-products/:id/approve
   */
  static async approveCatalog(req, res) {
    try {
      const catalogId = Number(req.params.id);
      if (!catalogId) {
        return response.badRequest(res, "ID catalog không hợp lệ");
      }

      const result = await ProductCatalogService.approveCatalog(catalogId);

      return response.success(res, "Duyệt catalog thành công", result);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  /**
   * Admin: Từ chối catalog
   * PUT /admin/catalog-products/:id/reject
   */
  static async rejectCatalog(req, res) {
    try {
      const catalogId = Number(req.params.id);
      if (!catalogId) {
        return response.badRequest(res, "ID catalog không hợp lệ");
      }

      const result = await ProductCatalogService.rejectCatalog(catalogId);

      return response.success(res, "Từ chối catalog thành công", result);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }
}

module.exports = ProductCatalogController;

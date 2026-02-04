const ProductCatalogService = require("../service/productCatalogService");
const { response } = require("../utils/response");

class ProductCatalogController {
  /**
   * Lấy danh sách catalog
   * GET /catalogs
   */
  static async getCatalogs(req, res) {
    try {
      const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
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
   * Admin: Xóa catalog
   * DELETE /admin/catalog-products/:id
   */
  static async deleteCatalog(req, res) {
    try {
      const catalogId = Number(req.params.id);
      if (!catalogId) {
        return response.badRequest(res, "ID catalog không hợp lệ");
      }

      const result = await ProductCatalogService.deleteCatalog(catalogId);

      return response.success(res, "Xóa catalog thành công", result);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }
}

module.exports = ProductCatalogController;

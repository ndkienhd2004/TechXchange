const ProductService = require("../service/productService");
const { response } = require("../utils/response");

/**
 * Product Controller - Xử lý requests liên quan đến sản phẩm
 */
class ProductController {
  /**
   * Lấy danh sách sản phẩm
   * GET /products
   */
  static async getProducts(req, res) {
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
        statuses: ProductService.parseStatus(req.query.status),
        category_id: parseNumber(req.query.category_id),
        brand_id: parseNumber(req.query.brand_id),
        store_id: parseNumber(req.query.store_id),
        seller_id: parseNumber(req.query.seller_id),
        min_price: parseNumber(req.query.min_price),
        max_price: parseNumber(req.query.max_price),
        q: req.query.q ? String(req.query.q).trim() : undefined,
      };

      const allowedSortFields = ["created_at", "updated_at", "price", "rating"];
      const sortBy = allowedSortFields.includes(req.query.sort_by)
        ? req.query.sort_by
        : "created_at";
      const sortOrder =
        String(req.query.sort_order || "DESC").toUpperCase() === "ASC"
          ? "ASC"
          : "DESC";

      const result = await ProductService.getProducts(
        filters,
        limit,
        page,
        sortBy,
        sortOrder,
      );

      return response.success(res, "Lấy danh sách sản phẩm thành công", result);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  /**
   * Lấy chi tiết sản phẩm
   * GET /products/:id
   */
  static async getProductById(req, res) {
    try {
      const productId = Number(req.params.id);
      if (!productId) {
        return response.badRequest(res, "ID sản phẩm không hợp lệ");
      }

      const statuses = ProductService.parseStatus(req.query.status);
      const product = await ProductService.getProductById(productId, statuses);

      return response.success(res, "Lấy chi tiết sản phẩm thành công", product);
    } catch (error) {
      return response.notFound(res, error.message);
    }
  }

  /**
   * Shop: Xóa listing của mình
   * DELETE /products/:id
   */
  static async deleteListing(req, res) {
    try {
      const productId = Number(req.params.id);
      if (!productId) {
        return response.badRequest(res, "ID sản phẩm không hợp lệ");
      }

      const result = await ProductService.deleteListing(
        req.user.id,
        productId
      );

      return response.success(res, "Xóa sản phẩm thành công", result);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  /**
   * Tạo sản phẩm mới
   * POST /products
   */
  static async createProduct(req, res) {
    try {
      const userId = req.user.id;
      const parseNumber = (value) => {
        if (value === undefined || value === null || value === "") {
          return undefined;
        }
        const parsed = Number(value);
        return Number.isNaN(parsed) ? undefined : parsed;
      };

      const catalog_id = parseNumber(req.body.catalog_id);
      const store_id = parseNumber(req.body.store_id);
      const price = parseNumber(req.body.price);
      const quantity = parseNumber(req.body.quantity);
      const variant_key = req.body.variant_key
        ? String(req.body.variant_key).trim()
        : null;

      if (!catalog_id || !store_id || price === undefined) {
        return response.badRequest(res, "Thiếu thông tin bắt buộc");
      }

      if (quantity === undefined) {
        return response.badRequest(res, "Số lượng là bắt buộc");
      }

      const images = Array.isArray(req.body.images)
        ? req.body.images
            .map((item) => ({
              url: item?.url ? String(item.url).trim() : null,
              sort_order: Number.isNaN(Number(item?.sort_order))
                ? undefined
                : Number(item.sort_order),
            }))
            .filter((item) => item.url)
        : [];

      const product = await ProductService.createProduct(userId, {
        catalog_id,
        store_id,
        price,
        quantity,
        images,
      });

      return response.created(res, "Tạo sản phẩm thành công", product);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  /**
   * Tạo listing từ catalog (Shop)
   * POST /products/listings
   */
  static async createListing(req, res) {
    try {
      const userId = req.user.id;
      const parseNumber = (value) => {
        if (value === undefined || value === null || value === "") {
          return undefined;
        }
        const parsed = Number(value);
        return Number.isNaN(parsed) ? undefined : parsed;
      };

      const catalog_id = parseNumber(req.body.catalog_id);
      const store_id = parseNumber(req.body.store_id);
      const price = parseNumber(req.body.price);
      const quantity = parseNumber(req.body.quantity);

      if (!catalog_id || !store_id || price === undefined) {
        return response.badRequest(res, "Thiếu thông tin bắt buộc");
      }

      if (quantity === undefined) {
        return response.badRequest(res, "Số lượng là bắt buộc");
      }

      const images = Array.isArray(req.body.images)
        ? req.body.images
            .map((item) => ({
              url: item?.url ? String(item.url).trim() : null,
              sort_order: Number.isNaN(Number(item?.sort_order))
                ? undefined
                : Number(item.sort_order),
            }))
            .filter((item) => item.url)
        : [];

      const listing = await ProductService.createListingFromCatalog(userId, {
        catalog_id,
        store_id,
        price,
        quantity,
        images,
        variant_key,
      });

      return response.created(res, "Tạo listing thành công", listing);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  /**
   * Admin: Hủy sản phẩm
   * PUT /admin/products/:id/cancel
   */
  static async cancelProduct(req, res) {
    try {
      const productId = Number(req.params.id);
      const reason = req.body.reason ? String(req.body.reason).trim() : "";

      if (!productId) {
        return response.badRequest(res, "ID sản phẩm không hợp lệ");
      }

      if (!reason) {
        return response.badRequest(res, "Lý do là bắt buộc");
      }

      const result = await ProductService.cancelProduct(
        productId,
        req.user.id,
        reason,
      );

      return response.success(res, "Hủy sản phẩm thành công", result);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }
}

module.exports = ProductController;

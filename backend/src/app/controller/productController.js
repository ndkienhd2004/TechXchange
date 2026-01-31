const ProductService = require("../service/productService");

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
      const offset = parseInt(req.query.offset, 10) || 0;

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
        offset,
        sortBy,
        sortOrder
      );

      return res.status(200).json({
        success: true,
        message: "Lấy danh sách sản phẩm thành công",
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
   * Lấy chi tiết sản phẩm
   * GET /products/:id
   */
  static async getProductById(req, res) {
    try {
      const productId = Number(req.params.id);
      if (!productId) {
        return res.status(400).json({
          success: false,
          message: "ID sản phẩm không hợp lệ",
        });
      }

      const statuses = ProductService.parseStatus(req.query.status);
      const product = await ProductService.getProductById(productId, statuses);

      return res.status(200).json({
        success: true,
        message: "Lấy chi tiết sản phẩm thành công",
        data: product,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
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

      const category_id = parseNumber(req.body.category_id);
      const store_id = parseNumber(req.body.store_id);
      const brand_id = parseNumber(req.body.brand_id);
      const name = req.body.name ? String(req.body.name).trim() : "";
      const description = req.body.description
        ? String(req.body.description).trim()
        : null;
      const price = parseNumber(req.body.price);
      const quality = req.body.quality ? String(req.body.quality).trim() : null;
      const condition_percent = parseNumber(req.body.condition_percent);
      const quantity = parseNumber(req.body.quantity);

      if (!category_id || !store_id || !name || price === undefined) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin bắt buộc",
        });
      }

      if (quantity === undefined) {
        return res.status(400).json({
          success: false,
          message: "Số lượng là bắt buộc",
        });
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

      const attributes = Array.isArray(req.body.attributes)
        ? req.body.attributes
            .map((item) => ({
              attr_key: item?.attr_key ? String(item.attr_key).trim() : null,
              attr_value: item?.attr_value
                ? String(item.attr_value).trim()
                : null,
            }))
            .filter((item) => item.attr_key && item.attr_value)
        : [];

      const product = await ProductService.createProduct(userId, {
        category_id,
        store_id,
        brand_id,
        name,
        description,
        price,
        quality,
        condition_percent,
        quantity,
        images,
        attributes,
      });

      return res.status(201).json({
        success: true,
        message: "Tạo sản phẩm thành công",
        data: product,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
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
        return res.status(400).json({
          success: false,
          message: "ID sản phẩm không hợp lệ",
        });
      }

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: "Lý do là bắt buộc",
        });
      }

      const result = await ProductService.cancelProduct(
        productId,
        req.user.id,
        reason
      );

      return res.status(200).json({
        success: true,
        message: "Hủy sản phẩm thành công",
        data: result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = ProductController;

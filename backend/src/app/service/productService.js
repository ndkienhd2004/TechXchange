const { Op } = require("sequelize");
const {
  sequelize,
  Product,
  ProductCatalog,
  ProductCategory,
  Brand,
  Store,
  User,
  ProductImage,
  ProductAttribute,
  AdminReview,
} = require("../../models");

/**
 * Product Service - Xử lý nghiệp vụ liên quan đến sản phẩm
 */
class ProductService {
  static normalizeVariantKey(raw) {
    if (!raw || typeof raw !== "string") {
      return null;
    }
    const parts = raw
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const [key, ...rest] = item.split("=");
        const k = (key || "").trim().toLowerCase();
        const v = rest.join("=").trim();
        return k ? [k, v] : null;
      })
      .filter(Boolean);

    if (parts.length === 0) {
      return null;
    }

    parts.sort((a, b) => {
      if (a[0] === b[0]) {
        return a[1].localeCompare(b[1]);
      }
      return a[0].localeCompare(b[0]);
    });

    return parts.map(([k, v]) => `${k}=${v}`).join("|");
  }
  /**
   * Chuẩn hóa tham số status
   * @param {string} statusParam
   * @returns {string[]|null}
   */
  static parseStatus(statusParam) {
    if (!statusParam) {
      return ["active"];
    }

    if (statusParam === "all") {
      return null;
    }

    return statusParam
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  /**
   * Lấy danh sách sản phẩm
   * @param {object} filters
   * @param {number} limit
   * @param {number} offset
   * @param {string} sortBy
   * @param {string} sortOrder
   * @returns {Promise<object>}
   */
  static async getProducts(
    filters = {},
    limit = 10,
    page = 1,
    sortBy = "created_at",
    sortOrder = "DESC",
  ) {
    try {
      const safePage = Number.isInteger(page) && page > 0 ? page : 1;
      const offset = (safePage - 1) * limit;
      const whereListing = {};
      const whereCatalog = {};

      if (filters.statuses && filters.statuses.length > 0) {
        whereListing.status = { [Op.in]: filters.statuses };
      }
      if (filters.store_id) whereListing.store_id = filters.store_id;
      if (filters.seller_id) whereListing.seller_id = filters.seller_id;
      if (filters.min_price || filters.max_price) {
        whereListing.price = {};
        if (filters.min_price) whereListing.price[Op.gte] = filters.min_price;
        if (filters.max_price) whereListing.price[Op.lte] = filters.max_price;
      }

      // filters theo catalog
      if (filters.category_id) whereCatalog.category_id = filters.category_id;
      if (filters.brand_id) whereCatalog.brand_id = filters.brand_id;
      if (filters.q) whereCatalog.name = { [Op.iLike]: `%${filters.q}%` };

      const { count, rows } = await Product.findAndCountAll({
        where: whereListing,
        limit,
        offset,
        distinct: true,
        include: [
          {
            model: ProductCatalog,
            as: "catalog",
            required: true,
            where: whereCatalog,
            include: [
              {
                model: Brand,
                as: "brand",
                attributes: ["id", "name", "image"],
              },
              {
                model: ProductCategory,
                as: "category",
                attributes: ["id", "name"],
              },
            ],
          },
          { model: Store, as: "store", attributes: ["id", "name", "rating"] },
          { model: User, as: "seller", attributes: ["id", "username"] },
          {
            model: ProductImage,
            as: "images",
            attributes: ["id", "url", "sort_order"],
            separate: true,
            order: [["sort_order", "ASC"]],
          },
        ],
        order: [[sortBy, sortOrder]],
      });

      return {
        total: count,
        products: rows,
        page: safePage,
        totalPages: Math.ceil(count / limit),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy chi tiết sản phẩm
   * @param {number} productId
   * @param {string[]|null} statuses
   * @returns {Promise<object>}
   */
  static async getProductById(productId, statuses) {
    try {
      const whereClause = { id: productId };

      if (statuses && statuses.length > 0) {
        whereClause.status = { [Op.in]: statuses };
      }

      const product = await Product.findOne({
        where: whereClause,
        include: [
          {
            model: ProductCatalog,
            as: "catalog",
            required: false,
            include: [
              {
                model: Brand,
                as: "brand",
                attributes: ["id", "name", "image"],
              },
              {
                model: ProductCategory,
                as: "category",
                attributes: ["id", "name"],
              },
            ],
          },
          {
            model: Store,
            as: "store",
            attributes: ["id", "name", "rating", "description"],
          },
          {
            model: User,
            as: "seller",
            attributes: ["id", "username"],
          },
          {
            model: ProductImage,
            as: "images",
            attributes: ["id", "url", "sort_order"],
            separate: true,
            order: [["sort_order", "ASC"]],
          },
          {
            model: ProductAttribute,
            as: "attributes",
            attributes: ["id", "attr_key", "attr_value"],
          },
        ],
      });

      if (!product) {
        throw new Error("Sản phẩm không tồn tại");
      }

      return product;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Tạo sản phẩm mới
   * @param {number} userId
   * @param {object} payload
   * @returns {Promise<object>}
   */
  static async createProduct(userId, payload) {
    const {
      store_id,
      price,
      quantity,
      images,
      catalog_id,
    } = payload;

    try {
      if (catalog_id) {
        return await ProductService.createListingFromCatalog(userId, {
          catalog_id,
          store_id,
          price,
          quantity,
          images,
        });
      }

      throw new Error(
        "Vui lòng chọn sản phẩm từ catalog hoặc gửi yêu cầu tạo sản phẩm mới"
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Shop: Xóa listing của mình (soft delete)
   * @param {number} userId
   * @param {number} productId
   * @returns {Promise<object>}
   */
  static async deleteListing(userId, productId) {
    try {
      const product = await Product.findByPk(productId);
      if (!product) {
        throw new Error("Sản phẩm không tồn tại");
      }

      if (product.seller_id !== userId) {
        throw new Error("Không có quyền xóa sản phẩm này");
      }

      await product.update({ status: "deleted" });
      return product;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Tạo listing từ catalog
   * @param {number} userId
   * @param {object} payload
   * @returns {Promise<object>}
   */
  static async createListingFromCatalog(userId, payload) {
    const { catalog_id, store_id, price, quantity, images, variant_key } =
      payload;

    try {
      const normalizedVariantKey =
        ProductService.normalizeVariantKey(variant_key);

      const store = await Store.findOne({
        where: { id: store_id, owner_id: userId },
      });
      if (!store) {
        throw new Error("Cửa hàng không tồn tại hoặc không thuộc quyền sở hữu");
      }

      const catalog = await ProductCatalog.findByPk(catalog_id);
      if (!catalog) {
        throw new Error("Catalog không tồn tại");
      }
      if (catalog.status !== "active") {
        throw new Error("Catalog không khả dụng");
      }

      const existingListing = await Product.findOne({
        where: {
          catalog_id: catalog.id,
          store_id,
          variant_key: normalizedVariantKey,
        },
      });
      if (existingListing) {
        throw new Error("Sản phẩm đã tồn tại trong cửa hàng");
      }

      return await sequelize.transaction(async (transaction) => {
        const product = await Product.create(
          {
            catalog_id: catalog.id,
            category_id: catalog.category_id,
            brand_id: catalog.brand_id || null,
            name: catalog.name,
            description: catalog.description || null,
            seller_id: userId,
            store_id,
            price,
            quantity,
            variant_key: normalizedVariantKey,
            status: "active",
          },
          { transaction },
        );

        if (Array.isArray(images) && images.length > 0) {
          const imageRows = images
            .map((item, index) => ({
              product_id: product.id,
              url: item.url,
              sort_order: Number.isInteger(item.sort_order)
                ? item.sort_order
                : index,
            }))
            .filter((item) => item.url);

          if (imageRows.length > 0) {
            await ProductImage.bulkCreate(imageRows, { transaction });
          }
        }

        const createdProduct = await Product.findByPk(product.id, {
          include: [
            {
              model: ProductCatalog,
              as: "catalog",
              include: [
                {
                  model: Brand,
                  as: "brand",
                  attributes: ["id", "name", "image"],
                },
                {
                  model: ProductCategory,
                  as: "category",
                  attributes: ["id", "name"],
                },
              ],
            },
            {
              model: Store,
              as: "store",
              attributes: ["id", "name", "rating"],
            },
            {
              model: User,
              as: "seller",
              attributes: ["id", "username"],
            },
            {
              model: ProductImage,
              as: "images",
              attributes: ["id", "url", "sort_order"],
              separate: true,
              order: [["sort_order", "ASC"]],
            },
          ],
          transaction,
        });

        return createdProduct;
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Admin: Hủy sản phẩm
   * @param {number} productId
   * @param {number} adminId
   * @param {string} reason
   * @returns {Promise<object>}
   */
  static async cancelProduct(productId, adminId, reason) {
    try {
      const product = await Product.findByPk(productId);
      if (!product) {
        throw new Error("Sản phẩm không tồn tại");
      }

      await product.update({ status: "rejected" });

      const review = await AdminReview.create({
        admin_id: adminId,
        product_id: productId,
        status: "rejected",
        review_comment: reason || null,
        reviewed_at: new Date(),
      });

      return { product, review };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ProductService;

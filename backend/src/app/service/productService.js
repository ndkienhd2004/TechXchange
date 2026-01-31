const { Op } = require("sequelize");
const {
  sequelize,
  Product,
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
    offset = 0,
    sortBy = "created_at",
    sortOrder = "DESC"
  ) {
    try {
      const whereClause = {};

      if (filters.statuses && filters.statuses.length > 0) {
        whereClause.status = { [Op.in]: filters.statuses };
      }

      if (filters.category_id) {
        whereClause.category_id = filters.category_id;
      }

      if (filters.brand_id) {
        whereClause.brand_id = filters.brand_id;
      }

      if (filters.store_id) {
        whereClause.store_id = filters.store_id;
      }

      if (filters.seller_id) {
        whereClause.seller_id = filters.seller_id;
      }

      if (filters.min_price || filters.max_price) {
        whereClause.price = {};
        if (filters.min_price) {
          whereClause.price[Op.gte] = filters.min_price;
        }
        if (filters.max_price) {
          whereClause.price[Op.lte] = filters.max_price;
        }
      }

      if (filters.q) {
        whereClause.name = { [Op.iLike]: `%${filters.q}%` };
      }

      const { count, rows } = await Product.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        distinct: true,
        include: [
          {
            model: ProductCategory,
            as: "category",
            attributes: ["id", "name"],
          },
          {
            model: Brand,
            as: "brand",
            attributes: ["id", "name", "image"],
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
        order: [[sortBy, sortOrder]],
      });

      return {
        total: count,
        products: rows,
        page: Math.floor(offset / limit) + 1,
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
            model: ProductCategory,
            as: "category",
            attributes: ["id", "name"],
          },
          {
            model: Brand,
            as: "brand",
            attributes: ["id", "name", "image"],
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
    } = payload;

    try {
      const store = await Store.findOne({
        where: { id: store_id, owner_id: userId },
      });
      if (!store) {
        throw new Error("Cửa hàng không tồn tại hoặc không thuộc quyền sở hữu");
      }

      const category = await ProductCategory.findByPk(category_id);
      if (!category) {
        throw new Error("Danh mục không tồn tại");
      }

      if (brand_id) {
        const brand = await Brand.findByPk(brand_id);
        if (!brand) {
          throw new Error("Thương hiệu không tồn tại");
        }
      }

      return await sequelize.transaction(async (transaction) => {
        const product = await Product.create(
          {
            category_id,
            seller_id: userId,
            store_id,
            brand_id: brand_id || null,
            name,
            description: description || null,
            price,
            quality: quality || null,
            condition_percent: condition_percent ?? null,
            quantity,
          },
          { transaction }
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

        if (Array.isArray(attributes) && attributes.length > 0) {
          const attributeRows = attributes
            .map((item) => ({
              product_id: product.id,
              attr_key: item.attr_key,
              attr_value: item.attr_value,
            }))
            .filter((item) => item.attr_key && item.attr_value);

          if (attributeRows.length > 0) {
            await ProductAttribute.bulkCreate(attributeRows, { transaction });
          }
        }

        const createdProduct = await Product.findByPk(product.id, {
          include: [
            {
              model: ProductCategory,
              as: "category",
              attributes: ["id", "name"],
            },
            {
              model: Brand,
              as: "brand",
              attributes: ["id", "name", "image"],
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
            {
              model: ProductAttribute,
              as: "attributes",
              attributes: ["id", "attr_key", "attr_value"],
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

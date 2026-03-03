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
  ProductSerial,
  ProductInventory,
  AdminReview,
} = require("../../models");
const CategoryService = require("./categoryService");

/**
 * Product Service - Xử lý nghiệp vụ liên quan đến sản phẩm
 */
class ProductService {
  static parseVariantKey(raw) {
    if (!raw || typeof raw !== "string") return {};
    return raw
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean)
      .reduce((acc, item) => {
        const [key, ...rest] = item.split("=");
        const normalizedKey = (key || "").trim().toLowerCase();
        const value = rest.join("=").trim();
        if (!normalizedKey || !value) return acc;
        acc[normalizedKey] = value;
        return acc;
      }, {});
  }

  static normalizeVariantOptions(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return {};
    }
    const entries = Object.entries(raw)
      .map(([key, value]) => [
        String(key || "").trim().toLowerCase(),
        String(value ?? "").trim(),
      ])
      .filter(([key, value]) => key && value)
      .sort(([a], [b]) => a.localeCompare(b));
    return entries.reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  }

  static buildVariantKeyFromOptions(options = {}) {
    const normalized = ProductService.normalizeVariantOptions(options);
    const entries = Object.entries(normalized);
    if (entries.length === 0) return null;
    return entries.map(([k, v]) => `${k}=${v}`).join("|");
  }

  static buildVariantSummary(rows = []) {
    const optionMap = new Map();
    const variantMap = new Map();

    rows.forEach((row) => {
      const attrs = ProductService.parseVariantKey(row.variant_key);
      const quantity = Number(row.quantity || 0);
      const price = Number(row.price || 0);
      const normalizedKey = ProductService.normalizeVariantKey(row.variant_key);
      if (!normalizedKey || quantity <= 0) return;

      if (!variantMap.has(normalizedKey)) {
        variantMap.set(normalizedKey, {
          variant_key: normalizedKey,
          attributes: attrs,
          quantity: 0,
          min_price: price,
          max_price: price,
          listing_ids: [],
        });
      }
      const variant = variantMap.get(normalizedKey);
      variant.quantity += quantity;
      variant.min_price = Math.min(variant.min_price, price);
      variant.max_price = Math.max(variant.max_price, price);
      variant.listing_ids.push(Number(row.id));

      Object.entries(attrs).forEach(([key, value]) => {
        if (!optionMap.has(key)) optionMap.set(key, new Map());
        const valueMap = optionMap.get(key);
        valueMap.set(value, Number(valueMap.get(value) || 0) + quantity);
      });
    });

    const spec_options = Array.from(optionMap.entries()).map(([key, values]) => ({
      key,
      values: Array.from(values.entries())
        .map(([value, quantity]) => ({ value, quantity }))
        .sort((a, b) => a.value.localeCompare(b.value)),
    }));

    const variant_inventory = Array.from(variantMap.values()).sort((a, b) =>
      a.variant_key.localeCompare(b.variant_key)
    );

    return { spec_options, variant_inventory };
  }

  static buildVariantSummaryFromSerials(serialRows = [], fallbackProductId) {
    const optionMap = new Map();
    const variantInventory = [];

    serialRows.forEach((serial) => {
      const specs = ProductService.normalizeVariantOptions(serial.serial_specs || {});
      const entries = Object.entries(specs);
      const variantKey = entries.length
        ? entries.map(([k, v]) => `${k}=${v}`).join("|")
        : serial.serial_code;
      const quantity = (serial.inventories || []).reduce(
        (sum, inv) => sum + Math.max(0, Number(inv.on_hand || 0) - Number(inv.reserved || 0)),
        0,
      );

      entries.forEach(([key, value]) => {
        if (!optionMap.has(key)) optionMap.set(key, new Map());
        const valueMap = optionMap.get(key);
        valueMap.set(value, Number(valueMap.get(value) || 0) + quantity);
      });

      variantInventory.push({
        serial_id: Number(serial.id),
        serial_code: serial.serial_code,
        variant_key: variantKey,
        attributes: specs,
        quantity,
        min_price: null,
        max_price: null,
        listing_ids: fallbackProductId ? [Number(fallbackProductId)] : [],
      });
    });

    const specOptions = Array.from(optionMap.entries()).map(([key, values]) => ({
      key,
      values: Array.from(values.entries())
        .map(([value, quantity]) => ({ value, quantity }))
        .sort((a, b) => a.value.localeCompare(b.value)),
    }));

    return { spec_options: specOptions, variant_inventory: variantInventory };
  }

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
      if (filters.category_id) {
        const scopedIds = await CategoryService.getDescendantCategoryIds(
          filters.category_id
        );
        if (scopedIds.length > 0) {
          whereCatalog.category_id = { [Op.in]: scopedIds };
        } else {
          whereCatalog.category_id = filters.category_id;
        }
      }
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

      const serialRows = await ProductSerial.findAll({
        where: { product_id: product.id },
        include: [
          {
            model: ProductInventory,
            as: "inventories",
            required: false,
            attributes: ["id", "on_hand", "reserved"],
          },
        ],
        order: [["id", "ASC"]],
      });

      if (serialRows.length > 0) {
        const serialSummary = ProductService.buildVariantSummaryFromSerials(
          serialRows,
          product.id,
        );
        product.setDataValue("spec_options", serialSummary.spec_options);
        product.setDataValue("variant_inventory", serialSummary.variant_inventory);
      } else if (product.catalog_id) {
        const variantRows = await Product.findAll({
          where: {
            catalog_id: product.catalog_id,
            status: "active",
            quantity: { [Op.gt]: 0 },
            variant_key: { [Op.ne]: null },
          },
          attributes: ["id", "variant_key", "quantity", "price"],
        });
        const summary = ProductService.buildVariantSummary(variantRows);
        product.setDataValue("spec_options", summary.spec_options);
        product.setDataValue("variant_inventory", summary.variant_inventory);
      } else {
        product.setDataValue("spec_options", []);
        product.setDataValue("variant_inventory", []);
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
      description,
      images,
      catalog_id,
      variant_key,
    } = payload;

    try {
      if (catalog_id) {
        return await ProductService.createListingFromCatalog(userId, {
          catalog_id,
          store_id,
          price,
          quantity,
          description,
          images,
          variant_key,
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
    const {
      catalog_id,
      store_id,
      price,
      quantity,
      description,
      images,
      variant_key,
      variant_options,
      serial_code,
    } = payload;

    try {
      const normalizedOptions = ProductService.normalizeVariantOptions(
        variant_options,
      );
      const normalizedVariantKey =
        ProductService.buildVariantKeyFromOptions(normalizedOptions) ||
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
            description: description || catalog.description || null,
            seller_id: userId,
            store_id,
            price,
            quantity,
            variant_key: normalizedVariantKey,
            status: "active",
          },
          { transaction },
        );

        const generatedSerialCode =
          serial_code && String(serial_code).trim()
            ? String(serial_code).trim()
            : `SER-${product.id}-${Date.now()}`;

        const serial = await ProductSerial.create(
          {
            product_id: product.id,
            serial_code: generatedSerialCode,
            serial_specs: normalizedOptions,
          },
          { transaction },
        );

        await ProductInventory.create(
          {
            product_id: product.id,
            serial_id: serial.id,
            on_hand: Number(quantity || 0),
            reserved: 0,
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

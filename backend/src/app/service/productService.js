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
  ProductSerial,
  ProductInventory,
  AdminReview,
} = require("../../models");
const CategoryService = require("./categoryService");

/**
 * Product Service - Xử lý nghiệp vụ liên quan đến sản phẩm
 */
class ProductService {
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

  static buildVariantLabelFromOptions(options = {}) {
    const normalized = ProductService.normalizeVariantOptions(options);
    const entries = Object.entries(normalized);
    if (entries.length === 0) return null;
    return entries.map(([k, v]) => `${k}=${v}`).join("|");
  }

  static serializeVariantOptions(options = {}) {
    return JSON.stringify(ProductService.normalizeVariantOptions(options));
  }

  static extractCatalogSpecValues(rawValue) {
    if (Array.isArray(rawValue)) {
      return rawValue
        .map((item) => String(item ?? "").trim())
        .filter(Boolean);
    }
    if (typeof rawValue === "string") {
      return rawValue
        .split(/[,;|]/g)
        .map((item) => item.trim())
        .filter(Boolean);
    }
    if (rawValue === null || rawValue === undefined) {
      return [];
    }
    const normalized = String(rawValue).trim();
    return normalized ? [normalized] : [];
  }

  static normalizeCatalogSpecValue(rawValue) {
    return String(rawValue ?? "").trim().toLowerCase();
  }

  static normalizeCatalogSpecs(rawSpecs) {
    const catalogSpecMap = new Map();
    if (!rawSpecs || typeof rawSpecs !== "object" || Array.isArray(rawSpecs)) {
      return catalogSpecMap;
    }

    Object.entries(rawSpecs).forEach(([rawKey, rawValue]) => {
      const normalizedKey = String(rawKey || "").trim().toLowerCase();
      if (!normalizedKey) return;

      const optionSet = new Set(
        ProductService.extractCatalogSpecValues(rawValue).map((item) =>
          ProductService.normalizeCatalogSpecValue(item),
        ),
      );
      catalogSpecMap.set(normalizedKey, optionSet);
    });

    return catalogSpecMap;
  }

  static validateVariantOptionsAgainstCatalog(variantOptions, catalogSpecs) {
    const normalizedOptions = ProductService.normalizeVariantOptions(variantOptions);
    const catalogSpecMap = ProductService.normalizeCatalogSpecs(catalogSpecs);
    const optionKeys = Object.keys(normalizedOptions);
    const requiredCatalogKeys = Array.from(catalogSpecMap.entries())
      .filter(([, optionSet]) => optionSet.size > 0)
      .map(([key]) => key);

    if (catalogSpecMap.size === 0) {
      if (optionKeys.length > 0) {
        throw new Error("Catalog chưa cấu hình specs, không thể gửi variant_options");
      }
      return normalizedOptions;
    }

    if (optionKeys.length === 0 && requiredCatalogKeys.length > 0) {
      throw new Error("Vui lòng chọn đầy đủ thông số theo catalog");
    }

    const unknownKeys = optionKeys.filter((key) => !catalogSpecMap.has(key));
    if (unknownKeys.length > 0) {
      throw new Error(`Thông số không thuộc catalog: ${unknownKeys.join(", ")}`);
    }

    const missingKeys = requiredCatalogKeys.filter(
      (key) => !Object.prototype.hasOwnProperty.call(normalizedOptions, key),
    );
    if (missingKeys.length > 0) {
      throw new Error(`Thiếu thông số bắt buộc: ${missingKeys.join(", ")}`);
    }

    optionKeys.forEach((key) => {
      const allowedValues = catalogSpecMap.get(key);
      if (!allowedValues || allowedValues.size === 0) return;

      const normalizedValue = ProductService.normalizeCatalogSpecValue(
        normalizedOptions[key],
      );
      if (!allowedValues.has(normalizedValue)) {
        throw new Error(
          `Giá trị "${normalizedOptions[key]}" không hợp lệ cho thông số "${key}"`,
        );
      }
    });

    return normalizedOptions;
  }

  static buildVariantSummaryFromSerials(serialRows = [], fallbackProductId) {
    const optionMap = new Map();
    const variantMap = new Map();

    serialRows.forEach((serial) => {
      const specs = ProductService.normalizeVariantOptions(serial.serial_specs || {});
      const entries = Object.entries(specs);
      const variantLabel =
        ProductService.buildVariantLabelFromOptions(specs) || serial.serial_code;
      const quantity = (serial.inventories || []).reduce(
        (sum, inv) => sum + Math.max(0, Number(inv.on_hand || 0) - Number(inv.reserved || 0)),
        0,
      );
      if (quantity <= 0) return;

      const variantSignature = ProductService.serializeVariantOptions(specs);
      const listingId = Number(serial.product?.id || fallbackProductId || serial.product_id || 0);
      const listingPrice = Number(serial.product?.price || 0);
      const hasValidPrice = Number.isFinite(listingPrice) && listingPrice > 0;

      if (!variantMap.has(variantSignature)) {
        variantMap.set(variantSignature, {
          serial_id: Number(serial.id),
          serial_code: serial.serial_code,
          variant_label: variantLabel,
          attributes: specs,
          quantity: 0,
          min_price: hasValidPrice ? listingPrice : null,
          max_price: hasValidPrice ? listingPrice : null,
          listing_ids: [],
        });
      }
      const variant = variantMap.get(variantSignature);
      variant.quantity += quantity;
      if (listingId && !variant.listing_ids.includes(listingId)) {
        variant.listing_ids.push(listingId);
      }
      if (hasValidPrice) {
        const currentMin = variant.min_price === null ? listingPrice : Number(variant.min_price);
        const currentMax = variant.max_price === null ? listingPrice : Number(variant.max_price);
        variant.min_price = Math.min(currentMin, listingPrice);
        variant.max_price = Math.max(currentMax, listingPrice);
      }

      entries.forEach(([key, value]) => {
        if (!optionMap.has(key)) optionMap.set(key, new Map());
        const valueMap = optionMap.get(key);
        valueMap.set(value, Number(valueMap.get(value) || 0) + quantity);
      });
    });

    const specOptions = Array.from(optionMap.entries()).map(([key, values]) => ({
      key,
      values: Array.from(values.entries())
        .map(([value, quantity]) => ({ value, quantity }))
        .sort((a, b) => a.value.localeCompare(b.value)),
    }));

    const variantInventory = Array.from(variantMap.values()).sort((a, b) =>
      String(a.variant_label || "").localeCompare(String(b.variant_label || ""))
    );
    return { spec_options: specOptions, variant_inventory: variantInventory };
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

      const listingIds = rows
        .map((row) => Number(row.id))
        .filter((value) => Number.isFinite(value) && value > 0);
      if (listingIds.length > 0) {
        const serialRows = await ProductSerial.findAll({
          attributes: ["id", "product_id", "serial_specs"],
          where: {
            product_id: { [Op.in]: listingIds },
          },
          order: [
            ["product_id", "ASC"],
            ["id", "ASC"],
          ],
        });

        const listingIdToPrimarySpecs = new Map();
        serialRows.forEach((serial) => {
          const listingId = Number(serial.product_id);
          if (!Number.isFinite(listingId) || listingId <= 0) {
            return;
          }
          if (listingIdToPrimarySpecs.has(listingId)) {
            return;
          }
          listingIdToPrimarySpecs.set(
            listingId,
            ProductService.normalizeVariantOptions(serial.serial_specs || {}),
          );
        });

        rows.forEach((row) => {
          const listingId = Number(row.id);
          row.setDataValue(
            "primary_serial_specs",
            listingIdToPrimarySpecs.get(listingId) || {},
          );
        });
      }

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
        ],
      });

      if (!product) {
        throw new Error("Sản phẩm không tồn tại");
      }

      let serialRows = [];
      if (product.catalog_id && product.store_id) {
        serialRows = await ProductSerial.findAll({
          include: [
            {
              model: Product,
              as: "product",
              required: true,
              attributes: ["id", "price", "status", "quantity"],
              where: {
                catalog_id: product.catalog_id,
                store_id: product.store_id,
                status: "active",
              },
            },
            {
              model: ProductInventory,
              as: "inventories",
              required: false,
              attributes: ["id", "on_hand", "reserved"],
            },
          ],
          order: [["id", "ASC"]],
        });
      } else {
        serialRows = await ProductSerial.findAll({
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
      }

      const serialSummary = ProductService.buildVariantSummaryFromSerials(
        serialRows,
        product.id,
      );
      product.setDataValue("spec_options", serialSummary.spec_options);
      product.setDataValue("variant_inventory", serialSummary.variant_inventory);

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
      variant_options,
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
          variant_options,
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
   * Shop: Cập nhật listing của mình
   * @param {number} userId
   * @param {number} productId
   * @param {object} payload
   * @returns {Promise<object>}
   */
  static async updateListing(userId, productId, payload = {}) {
    try {
      const product = await Product.findOne({
        where: { id: productId, seller_id: userId },
      });
      if (!product) {
        throw new Error("Không tìm thấy sản phẩm hoặc không có quyền");
      }

      const updates = {};
      if (payload.price !== undefined) {
        const price = Number(payload.price);
        if (Number.isNaN(price) || price < 0) {
          throw new Error("Giá sản phẩm không hợp lệ");
        }
        updates.price = price;
      }

      const hasQuantity = payload.quantity !== undefined;
      if (hasQuantity) {
        const quantity = Number(payload.quantity);
        if (!Number.isInteger(quantity) || quantity < 0) {
          throw new Error("Số lượng sản phẩm không hợp lệ");
        }
        updates.quantity = quantity;
      }

      if (payload.description !== undefined) {
        const description = String(payload.description || "").trim();
        updates.description = description || null;
      }

      if (payload.status !== undefined) {
        const nextStatus = String(payload.status || "").trim().toLowerCase();
        const allowedStatuses = new Set(["active", "inactive", "sold_out"]);
        if (!allowedStatuses.has(nextStatus)) {
          throw new Error("Trạng thái cập nhật không hợp lệ");
        }
        updates.status = nextStatus;
      }

      if (hasQuantity && payload.status === undefined) {
        const quantity = Number(payload.quantity);
        if (quantity <= 0) {
          updates.status = "sold_out";
        } else if (String(product.status || "").toLowerCase() === "sold_out") {
          updates.status = "active";
        }
      }

      const hasImages = Array.isArray(payload.images);
      const normalizedImages = hasImages
        ? payload.images
            .map((item, index) => ({
              url: item?.url ? String(item.url).trim() : null,
              sort_order: Number.isInteger(item?.sort_order)
                ? Number(item.sort_order)
                : index,
            }))
            .filter((item) => item.url)
        : [];

      if (Object.keys(updates).length === 0 && !hasImages) {
        throw new Error("Không có thông tin hợp lệ để cập nhật");
      }

      const updated = await sequelize.transaction(async (transaction) => {
        await product.update(updates, { transaction });

        if (hasQuantity) {
          const quantity = Number(updates.quantity);
          const inventories = await ProductInventory.findAll({
            where: { product_id: product.id },
            order: [["id", "ASC"]],
            transaction,
          });

          if (inventories.length > 0) {
            for (let index = 0; index < inventories.length; index += 1) {
              const inventory = inventories[index];
              const nextOnHand = index === 0 ? quantity : 0;
              const nextReserved = Math.min(
                Number(inventory.reserved || 0),
                nextOnHand,
              );
              await inventory.update(
                { on_hand: nextOnHand, reserved: nextReserved },
                { transaction },
              );
            }
          }
        }

        if (hasImages) {
          await ProductImage.destroy({
            where: { product_id: product.id },
            transaction,
          });
          if (normalizedImages.length > 0) {
            await ProductImage.bulkCreate(
              normalizedImages.map((item) => ({
                product_id: product.id,
                url: item.url,
                sort_order: item.sort_order,
              })),
              { transaction },
            );
          }
        }

        return Product.findByPk(product.id, {
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
      });

      return updated;
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
      variant_options,
      serial_code,
    } = payload;

    try {
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

      const normalizedOptions = ProductService.validateVariantOptionsAgainstCatalog(
        variant_options,
        catalog.specs,
      );
      const normalizedOptionsSignature =
        ProductService.serializeVariantOptions(normalizedOptions);

      const existingSerials = await ProductSerial.findAll({
        attributes: ["id", "serial_specs"],
        include: [
          {
            model: Product,
            as: "product",
            required: true,
            attributes: ["id"],
            where: {
              catalog_id: catalog.id,
              store_id,
            },
          },
        ],
      });
      const hasDuplicateVariant = existingSerials.some(
        (row) =>
          ProductService.serializeVariantOptions(row.serial_specs || {}) ===
          normalizedOptionsSignature,
      );
      if (hasDuplicateVariant) {
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

const { Op, QueryTypes } = require("sequelize");
const {
  sequelize,
  Store,
  Product,
  ProductImage,
  ProductSerial,
  ProductInventory,
  ShopInventoryLedger,
} = require("../../models");

class ShopInventoryService {
  static ACTIVE_PRODUCT_STATUSES = ["active", "inactive", "sold_out", "pending"];

  static buildVariantLabel(serial) {
    const specs = serial?.serial_specs || {};
    const entries = Object.entries(specs || {})
      .map(([key, value]) => [String(key || "").trim(), String(value || "").trim()])
      .filter(([key, value]) => key && value)
      .sort(([a], [b]) => a.localeCompare(b));
    if (entries.length === 0) return serial?.serial_code || "Mặc định";
    return entries.map(([key, value]) => `${key}: ${value}`).join(" • ");
  }

  static parsePositiveInt(value, fieldName) {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new Error(`${fieldName} phải là số nguyên dương`);
    }
    return parsed;
  }

  static parseNonNegativeNumber(value, fieldName) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      throw new Error(`${fieldName} không hợp lệ`);
    }
    return parsed;
  }

  static async findOwnedStore(userId, transaction = undefined) {
    const store = await Store.findOne({
      where: { owner_id: Number(userId) },
      order: [["id", "ASC"]],
      transaction,
      lock: transaction ? transaction.LOCK.UPDATE : undefined,
    });
    if (!store) {
      throw new Error("Bạn chưa có cửa hàng");
    }
    return store;
  }

  static async syncProductAvailableQuantity(productId, transaction) {
    const rows = await ProductInventory.findAll({
      where: { product_id: Number(productId) },
      attributes: ["on_hand", "reserved"],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const available = rows.reduce((sum, row) => {
      const onHand = Number(row.on_hand || 0);
      const reserved = Number(row.reserved || 0);
      return sum + Math.max(0, onHand - reserved);
    }, 0);

    await Product.update(
      { quantity: Number(available) },
      { where: { id: Number(productId) }, transaction },
    );

    return Number(available);
  }

  static async getLatestImportCostMap(storeId, productIds = []) {
    if (!productIds.length) return new Map();
    try {
      const rows = await sequelize.query(
        `
          SELECT DISTINCT ON (sil.product_id)
            sil.product_id::bigint AS product_id,
            sil.unit_cost
          FROM shop_inventory_ledger sil
          WHERE sil.store_id = :storeId
            AND sil.type = 'import'
            AND sil.unit_cost IS NOT NULL
            AND sil.product_id = ANY(:productIds)
          ORDER BY sil.product_id, sil.created_at DESC, sil.id DESC
        `,
        {
          replacements: {
            storeId: Number(storeId),
            productIds: productIds.map((item) => Number(item)),
          },
          type: QueryTypes.SELECT,
        },
      );

      return new Map(
        rows.map((row) => [Number(row.product_id), Number(row.unit_cost || 0)]),
      );
    } catch (error) {
      return new Map();
    }
  }

  static async getInventoryOverview(userId, filters = {}) {
    const store = await this.findOwnedStore(userId);
    const keyword = String(filters.q || "").trim();
    const page = Math.max(Number.parseInt(String(filters.page || "1"), 10) || 1, 1);
    const limit = Math.min(
      Math.max(Number.parseInt(String(filters.limit || "10"), 10) || 10, 1),
      100,
    );
    const offset = (page - 1) * limit;

    const where = {
      store_id: Number(store.id),
      status: { [Op.in]: this.ACTIVE_PRODUCT_STATUSES },
    };
    if (keyword) {
      where.name = { [Op.iLike]: `%${keyword}%` };
    }

    const { rows: products, count } = await Product.findAndCountAll({
      where,
      attributes: ["id", "name", "price", "status", "quantity", "updated_at"],
      include: [
        {
          model: ProductInventory,
          as: "inventories",
          required: false,
          attributes: ["id", "on_hand", "reserved"],
        },
        {
          model: ProductImage,
          as: "images",
          required: false,
          attributes: ["id", "url", "sort_order"],
          separate: true,
          order: [["sort_order", "ASC"]],
          limit: 1,
        },
      ],
      order: [["updated_at", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    const productIds = products.map((item) => Number(item.id));
    const latestCostMap = await this.getLatestImportCostMap(store.id, productIds);

    const items = products.map((product) => {
      const inventories = Array.isArray(product.inventories) ? product.inventories : [];
      const totalOnHand = inventories.reduce(
        (sum, item) => sum + Math.max(0, Number(item.on_hand || 0)),
        0,
      );
      const totalReserved = inventories.reduce(
        (sum, item) => sum + Math.max(0, Number(item.reserved || 0)),
        0,
      );
      const available = Math.max(0, totalOnHand - totalReserved);
      const latestImportCost = Number(latestCostMap.get(Number(product.id)) || 0);

      return {
        product_id: Number(product.id),
        product_name: product.name,
        sale_price: Number(product.price || 0),
        latest_import_cost: latestImportCost,
        total_on_hand: totalOnHand,
        total_reserved: totalReserved,
        total_available: available,
        variant_count: inventories.length,
        thumbnail: product.images?.[0]?.url || null,
        status: product.status,
      };
    });

    return {
      store: {
        id: Number(store.id),
        name: store.name,
      },
      items,
      total: Number(count || 0),
      pagination: {
        total: Number(count || 0),
        page,
        limit,
        totalPages: Math.ceil(Number(count || 0) / limit),
      },
    };
  }

  static async getProductInventoryTransactions(userId, productId, filters = {}) {
    const store = await this.findOwnedStore(userId);
    const parsedProductId = Number(productId);
    if (!parsedProductId) throw new Error("product_id không hợp lệ");

    const limit = Math.min(Math.max(Number(filters.limit || 50), 1), 200);
    const offset = Math.max(Number(filters.offset || 0), 0);

    const product = await Product.findOne({
      where: {
        id: parsedProductId,
        store_id: Number(store.id),
      },
      attributes: ["id", "name", "price", "status"],
      include: [
        {
          model: ProductImage,
          as: "images",
          required: false,
          attributes: ["id", "url", "sort_order"],
          separate: true,
          order: [["sort_order", "ASC"]],
          limit: 1,
        },
      ],
    });
    if (!product) throw new Error("Không tìm thấy sản phẩm trong kho của shop");

    const inventories = await ProductInventory.findAll({
      where: { product_id: parsedProductId },
      attributes: ["id", "product_id", "serial_id", "on_hand", "reserved"],
      include: [
        {
          model: ProductSerial,
          as: "serial",
          required: false,
          attributes: ["id", "serial_code", "serial_specs"],
        },
      ],
      order: [["id", "ASC"]],
    });

    const serialMap = new Map();
    const variants = inventories.map((inventory) => {
      const variantLabel = this.buildVariantLabel(inventory.serial);
      serialMap.set(Number(inventory.serial_id), variantLabel);
      const onHand = Number(inventory.on_hand || 0);
      const reserved = Number(inventory.reserved || 0);
      return {
        inventory_id: Number(inventory.id),
        serial_id: Number(inventory.serial_id),
        serial_code: inventory.serial?.serial_code || null,
        serial_specs: inventory.serial?.serial_specs || {},
        variant_label: variantLabel,
        on_hand: onHand,
        reserved,
        available: Math.max(0, onHand - reserved),
      };
    });

    const totalOnHand = variants.reduce((sum, item) => sum + item.on_hand, 0);
    const totalReserved = variants.reduce((sum, item) => sum + item.reserved, 0);

    let rows = [];
    let count = 0;
    try {
      const queryResult = await ShopInventoryLedger.findAndCountAll({
        where: {
          store_id: Number(store.id),
          product_id: parsedProductId,
        },
        attributes: [
          "id",
          "type",
          "quantity",
          "unit_cost",
          "note",
          "reference_type",
          "reference_id",
          "serial_id",
          "created_at",
        ],
        order: [["created_at", "DESC"], ["id", "DESC"]],
        limit,
        offset,
      });
      rows = queryResult.rows;
      count = Number(queryResult.count || 0);
    } catch (error) {
      rows = [];
      count = 0;
    }

    const transactions = rows.map((row) => ({
      id: Number(row.id),
      type: row.type,
      quantity: Number(row.quantity || 0),
      unit_cost:
        row.unit_cost === null || row.unit_cost === undefined
          ? null
          : Number(row.unit_cost),
      sale_price: Number(product.price || 0),
      note: row.note || null,
      reference_type: row.reference_type || null,
      reference_id: row.reference_id ? Number(row.reference_id) : null,
      serial_id: Number(row.serial_id || 0),
      variant_label: serialMap.get(Number(row.serial_id)) || `Serial #${row.serial_id}`,
      created_at: row.created_at,
    }));

    return {
      product: {
        id: Number(product.id),
        name: product.name,
        sale_price: Number(product.price || 0),
        status: product.status,
        thumbnail: product.images?.[0]?.url || null,
      },
      summary: {
        total_on_hand: totalOnHand,
        total_reserved: totalReserved,
        total_available: Math.max(0, totalOnHand - totalReserved),
      },
      variants,
      transactions,
      pagination: {
        total: Number(count || 0),
        limit,
        offset,
      },
    };
  }

  static async importStock(userId, payload = {}) {
    const productId = this.parsePositiveInt(payload.product_id, "product_id");
    const serialId = this.parsePositiveInt(payload.serial_id, "serial_id");
    const quantity = this.parsePositiveInt(payload.quantity, "quantity");
    const unitCost = this.parseNonNegativeNumber(payload.unit_cost, "unit_cost");
    const note = payload.note ? String(payload.note).trim() : null;

    return sequelize.transaction(async (transaction) => {
      const store = await this.findOwnedStore(userId, transaction);

      const product = await Product.findOne({
        where: { id: productId, store_id: Number(store.id) },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!product) {
        throw new Error("Sản phẩm không thuộc cửa hàng của bạn");
      }

      const serial = await ProductSerial.findOne({
        where: { id: serialId, product_id: Number(product.id) },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!serial) {
        throw new Error("Serial/biến thể không hợp lệ cho sản phẩm này");
      }

      const inventory = await ProductInventory.findOne({
        where: {
          product_id: Number(product.id),
          serial_id: Number(serial.id),
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!inventory) {
        throw new Error("Không tìm thấy inventory cho serial này");
      }

      const nextOnHand = Number(inventory.on_hand || 0) + quantity;
      await inventory.update({ on_hand: nextOnHand }, { transaction });

      await ShopInventoryLedger.create(
        {
          store_id: Number(store.id),
          product_id: Number(product.id),
          serial_id: Number(serial.id),
          inventory_id: Number(inventory.id),
          type: "import",
          quantity,
          unit_cost: Number(unitCost),
          note,
          created_by: Number(userId),
        },
        { transaction },
      );

      const totalAvailable = await this.syncProductAvailableQuantity(
        Number(product.id),
        transaction,
      );

      return {
        product_id: Number(product.id),
        product_name: product.name,
        serial_id: Number(serial.id),
        serial_code: serial.serial_code,
        variant_label: this.buildVariantLabel(serial),
        imported_quantity: quantity,
        unit_cost: Number(unitCost),
        sale_price: Number(product.price || 0),
        note,
        inventory: {
          id: Number(inventory.id),
          on_hand: nextOnHand,
          reserved: Number(inventory.reserved || 0),
          available: Math.max(0, nextOnHand - Number(inventory.reserved || 0)),
        },
        product_total_available: Number(totalAvailable),
      };
    });
  }
}

module.exports = ShopInventoryService;

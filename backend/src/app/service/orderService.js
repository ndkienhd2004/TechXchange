const { Op } = require("sequelize");
const {
  sequelize,
  CartItem,
  Order,
  OrderItem,
  Product,
  ProductInventory,
  ProductSerial,
  ProductImage,
  Review,
  Store,
  Shipment,
  User,
  Payment,
  UserAddress,
} = require("../../models");
const GhnService = require("./ghnService");
const UserEventService = require("./userEventService");

class OrderService {
  static BANK_TRANSFER_EXPIRE_MINUTES = 10;

  static normalizeAnalyticsRange(rangeParam) {
    const raw = String(rangeParam || "7d")
      .trim()
      .toLowerCase();
    if (raw === "all") return { key: "all", days: null };
    if (raw === "90d" || raw === "90") return { key: "90d", days: 90 };
    if (raw === "30d" || raw === "30") return { key: "30d", days: 30 };
    return { key: "7d", days: 7 };
  }

  static normalizePaymentMethod(method) {
    const raw = String(method || "cod").toLowerCase();
    if (raw !== "cod" && raw !== "bank_transfer") {
      throw new Error("payment_method chỉ hỗ trợ cod hoặc bank_transfer");
    }
    return raw;
  }

  static getTransferExpireAt(order) {
    const base = order?.created_at ? new Date(order.created_at) : new Date();
    return new Date(
      base.getTime() + this.BANK_TRANSFER_EXPIRE_MINUTES * 60 * 1000,
    );
  }

  static buildSepayTransferInstruction(order, totalPrice) {
    const bankCode = String(
      process.env.SEPAY_BANK_CODE || "Vietcombank",
    ).trim();
    const accountName = String(process.env.SEPAY_ACCOUNT_NAME || "").trim();
    const virtualAccount = String(
      process.env.SEPAY_VIRTUAL_ACCOUNT || "",
    ).trim();
    const prefix = String(
      process.env.SEPAY_ORDER_CODE_PREFIX || "ORDER_",
    ).trim();
    const paymentCode = `${prefix}${order.id}`;
    const transferContent = virtualAccount
      ? `${virtualAccount} ${paymentCode}`
      : paymentCode;
    const amountVnd = Math.round(Math.max(0, Number(totalPrice || 0)));

    let qrUrl = null;
    if (virtualAccount && bankCode) {
      const params = new URLSearchParams({
        acc: virtualAccount,
        bank: bankCode,
        amount: String(amountVnd),
        des: transferContent,
      });
      qrUrl = `https://qr.sepay.vn/img?${params.toString()}`;
    }

    return {
      order_id: order.id,
      payment_code: paymentCode,
      transfer_content: transferContent,
      amount_vnd: amountVnd,
      account_number: virtualAccount || null,
      bank_code: bankCode || null,
      account_name: accountName || null,
      virtual_account: virtualAccount || null,
      qr_url: qrUrl,
      currency: "VND",
      expires_at: this.getTransferExpireAt(order).toISOString(),
      expires_note: "Đơn sẽ được xác nhận sau khi SePay đối soát thành công",
    };
  }

  static async resolveTransferPaymentState(userId, orderId) {
    return sequelize.transaction(async (transaction) => {
      const order = await Order.findOne({
        where: { id: Number(orderId), customer_id: userId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!order) throw new Error(`Không tìm thấy đơn hàng #${orderId}`);

      const payment = await Payment.findOne({
        where: { order_id: order.id, payment_method: "bank_transfer" },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!payment) {
        throw new Error(`Đơn hàng #${order.id} không phải chuyển khoản`);
      }

      const shipment = await Shipment.findOne({
        where: { order_id: order.id },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (shipment?.status === "shipped") {
        return {
          id: order.id,
          status: "shipping",
          shipment: {
            provider: shipment.shipping_provider || null,
            shipping_fee: shipment.shipping_fee || null,
            service_id: shipment.shipping_service_id || null,
            service_type_id: shipment.shipping_service_type_id || null,
          },
        };
      }
      if (shipment?.status === "delivered") {
        return { id: order.id, status: "completed" };
      }

      const now = new Date();
      const expireAt = this.getTransferExpireAt(order);
      const isExpired = now.getTime() > expireAt.getTime();

      if (
        payment.status === "pending" &&
        order.status === "pending" &&
        isExpired
      ) {
        await this.releaseReservedStockForOrder(order.id, transaction);
        await payment.update({ status: "failed" }, { transaction });
        await order.update({ status: "canceled" }, { transaction });
        if (shipment && shipment.status === "pending") {
          await shipment.update({ status: "failed" }, { transaction });
        }
      }

      const freshOrder = await Order.findOne({
        where: { id: order.id },
        transaction,
      });
      const freshPayment = await Payment.findOne({
        where: { id: payment.id },
        transaction,
      });

      let transferStatus = "pending";
      if (freshPayment.status === "completed") transferStatus = "paid";
      else if (
        freshOrder.status === "canceled" ||
        freshPayment.status === "failed"
      )
        transferStatus = "expired";

      const instruction = this.buildSepayTransferInstruction(
        freshOrder,
        freshOrder.total_price,
      );

      return {
        order_id: freshOrder.id,
        order_status: freshOrder.status,
        payment_status: freshPayment.status,
        transfer_status: transferStatus,
        total_price: freshOrder.total_price,
        currency: freshOrder.currency || "VND",
        created_at: freshOrder.created_at,
        ...instruction,
      };
    });
  }

  static normalizeAddress(address = {}) {
    const fullName = String(address.full_name || "").trim();
    const phone = String(address.phone || "").trim();
    const line1 = String(address.line1 || "").trim();
    const ward = String(address.ward || "").trim();
    const district = String(address.district || "").trim();
    const city = String(address.city || "").trim();
    const province = String(address.province || "").trim();
    const ghnProvinceId = address.ghn_province_id
      ? Number(address.ghn_province_id)
      : null;
    const ghnDistrictId = address.ghn_district_id
      ? Number(address.ghn_district_id)
      : null;
    const ghnWardCode = address.ghn_ward_code
      ? String(address.ghn_ward_code).trim()
      : null;
    const note = String(address.note || "").trim();

    if (!fullName || !phone || !line1 || !district || !city || !province) {
      throw new Error(
        "shipping_address thiếu thông tin bắt buộc (full_name, phone, line1, district, city, province)",
      );
    }

    return {
      full_name: fullName,
      phone,
      line1,
      ward,
      district,
      city,
      province,
      ghn_province_id: ghnProvinceId,
      ghn_district_id: ghnDistrictId,
      ghn_ward_code: ghnWardCode,
      note: note || null,
    };
  }

  static addressFromRecord(record) {
    return {
      full_name: record.full_name || null,
      phone: record.phone || null,
      line1: record.address_line,
      ward: record.ward || null,
      district: record.district || null,
      city: record.city || null,
      province: record.province || null,
      ghn_province_id: record.ghn_province_id || null,
      ghn_district_id: record.ghn_district_id || null,
      ghn_ward_code: record.ghn_ward_code || null,
      note: null,
    };
  }

  static getGhnSyncIntervalMs() {
    const seconds = Number(process.env.GHN_STATUS_SYNC_INTERVAL_SECONDS || 120);
    if (!Number.isFinite(seconds) || seconds <= 0) return 120 * 1000;
    return seconds * 1000;
  }

  static toJsonText(payload) {
    if (payload === null || payload === undefined) return null;
    try {
      return JSON.stringify(payload);
    } catch (error) {
      return null;
    }
  }

  static parseGhnDate(value) {
    if (!value && value !== 0) return null;
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

    if (typeof value === "number" && Number.isFinite(value)) {
      const millis = value > 1e12 ? value : value * 1000;
      const fromNumber = new Date(millis);
      return Number.isNaN(fromNumber.getTime()) ? null : fromNumber;
    }

    const raw = String(value || "").trim();
    if (!raw) return null;
    if (/^\d+$/.test(raw)) {
      const asNumber = Number(raw);
      return this.parseGhnDate(asNumber);
    }

    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  static buildAddressLine(address = {}) {
    return [
      String(address.line1 || "").trim(),
      String(address.ward || "").trim(),
      String(address.district || "").trim(),
      String(address.city || "").trim(),
      String(address.province || "").trim(),
    ]
      .filter(Boolean)
      .join(", ");
  }

  static extractGhnOrderCode(payload = {}) {
    const direct = String(payload?.order_code || "").trim();
    if (direct) return direct;
    const fromData = String(payload?.data?.order_code || "").trim();
    if (fromData) return fromData;
    const fromCode = String(payload?.code || "").trim();
    if (fromCode && /^S?[A-Z0-9_-]{6,}$/i.test(fromCode)) return fromCode;
    return "";
  }

  static extractGhnStatus(payload = {}, fallback = "") {
    const candidates = [
      payload?.status,
      payload?.status_code,
      payload?.status_name,
      payload?.current_status,
      payload?.state,
    ];
    for (const value of candidates) {
      const normalized = String(value || "").trim().toLowerCase();
      if (normalized) return normalized;
    }
    return String(fallback || "").trim().toLowerCase();
  }

  static mapGhnStatusToLocal(ghnStatus) {
    const status = String(ghnStatus || "").trim().toLowerCase();
    if (!status) {
      return { shipment_status: "pending", order_status: null };
    }

    if (status === "delivered" || status.includes("complete")) {
      return { shipment_status: "delivered", order_status: "completed" };
    }

    if (
      status.includes("cancel") ||
      status.includes("fail") ||
      status.includes("return") ||
      status.includes("lost") ||
      status.includes("damage")
    ) {
      return { shipment_status: "failed", order_status: "canceled" };
    }

    if (
      status.includes("pick") ||
      status.includes("transport") ||
      status.includes("sort") ||
      status.includes("deliver")
    ) {
      return { shipment_status: "shipped", order_status: null };
    }

    return { shipment_status: "pending", order_status: null };
  }

  static shouldSyncGhnShipment(shipment, force = false) {
    if (!shipment) return false;
    if (String(shipment.shipping_provider || "").toLowerCase() !== "ghn")
      return false;
    if (!shipment.ghn_order_code) return false;

    const localStatus = String(shipment.status || "").toLowerCase();
    if (localStatus === "delivered" || localStatus === "failed") return false;
    if (force) return true;

    const syncedAt = shipment.ghn_last_sync_at
      ? new Date(shipment.ghn_last_sync_at).getTime()
      : 0;
    if (!syncedAt) return true;
    return Date.now() - syncedAt >= this.getGhnSyncIntervalMs();
  }

  static async syncShipmentWithGhn({
    shipment,
    order = null,
    ghnShopId = null,
    transaction = null,
    force = false,
    throwOnError = false,
  }) {
    if (!this.shouldSyncGhnShipment(shipment, force)) return shipment;

    try {
      const detail = await GhnService.getOrderDetail({
        order_code: shipment.ghn_order_code,
        shop_id: ghnShopId || undefined,
      });

      const ghnStatus = this.extractGhnStatus(detail, shipment.ghn_status);
      const mapped = this.mapGhnStatusToLocal(ghnStatus);
      const eta = this.parseGhnDate(
        detail?.leadtime || detail?.expected_delivery_time,
      );

      const shipmentPatch = {
        ghn_status: ghnStatus || shipment.ghn_status || null,
        ghn_last_sync_at: new Date(),
        ghn_payload: this.toJsonText(detail),
      };

      if (eta && !shipment.estimated_delivery) {
        shipmentPatch.estimated_delivery = eta;
      }

      const currentShipmentStatus = String(shipment.status || "").toLowerCase();
      const nextShipmentStatus = String(mapped.shipment_status || "").toLowerCase();
      const shouldPromoteToShipping =
        nextShipmentStatus === "shipped" && currentShipmentStatus === "pending";
      const shouldSetFinalStatus =
        nextShipmentStatus === "delivered" || nextShipmentStatus === "failed";
      if (shouldPromoteToShipping || shouldSetFinalStatus) {
        shipmentPatch.status = nextShipmentStatus;
        if (nextShipmentStatus === "delivered") {
          shipmentPatch.actual_delivery = shipment.actual_delivery || new Date();
        }
      }

      await shipment.update(shipmentPatch, { transaction });

      if (
        order &&
        mapped.order_status &&
        order.status !== mapped.order_status &&
        order.status !== "completed"
      ) {
        await order.update({ status: mapped.order_status }, { transaction });
      }
    } catch (error) {
      if (throwOnError) throw error;
      // eslint-disable-next-line no-console
      console.warn(
        `[GHN] Sync trạng thái thất bại cho shipment #${shipment?.id}:`,
        error.message,
      );
    }

    return shipment;
  }

  static async syncShipmentsForOrders(orders = [], options = {}) {
    if (!Array.isArray(orders) || orders.length === 0) return;
    const force = Boolean(options.force);

    const storeIds = [
      ...new Set(orders.map((order) => Number(order.store_id)).filter(Boolean)),
    ];
    const stores = storeIds.length
      ? await Store.findAll({
          where: { id: { [Op.in]: storeIds } },
          attributes: ["id", "ghn_shop_id"],
        })
      : [];
    const shopMap = new Map(
      stores.map((store) => [Number(store.id), Number(store.ghn_shop_id || 0)]),
    );

    for (const order of orders) {
      const shipment = order.shipments?.[0] || null;
      // eslint-disable-next-line no-await-in-loop
      await this.syncShipmentWithGhn({
        shipment,
        order,
        ghnShopId: shopMap.get(Number(order.store_id)) || null,
        force,
      });
    }
  }

  static getOrderShippingMetrics(orderItems = []) {
    const quantity = orderItems.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0,
    );
    const safeQty = Math.max(1, quantity);
    return {
      weight: 200 * safeQty,
      length: 20,
      width: 20,
      height: Math.min(100, 10 + safeQty * 2),
    };
  }

  static async calculateShippingFeeForStore({
    store,
    shippingAddress,
    orderLines = [],
    itemTotal = 0,
  }) {
    if (!store?.ghn_district_id || !store?.ghn_ward_code) {
      throw new Error(`Shop #${store?.id || "?"} chưa cấu hình địa chỉ GHN`);
    }
    const ghnShopId = Number(store?.ghn_shop_id || 0);
    if (!ghnShopId) {
      throw new Error(`Shop #${store?.id || "?"} chưa có GHN shop_id`);
    }
    const toDistrictId = Number(shippingAddress?.ghn_district_id || 0);
    const toWardCode = String(shippingAddress?.ghn_ward_code || "").trim();
    if (!toDistrictId || !toWardCode) {
      throw new Error("Địa chỉ nhận hàng chưa có mã quận/phường GHN");
    }

    const services = await GhnService.getAvailableServices({
      shopId: ghnShopId,
      fromDistrict: Number(store.ghn_district_id),
      toDistrict: toDistrictId,
    });
    if (!services.length) {
      throw new Error(`GHN không có dịch vụ cho shop #${store.id}`);
    }
    const selectedService = services[0];
    const metrics = this.getOrderShippingMetrics(orderLines);
    const fee = await GhnService.calculateFee({
      shop_id: ghnShopId,
      service_id: selectedService.service_id,
      service_type_id: selectedService.service_type_id,
      from_district_id: Number(store.ghn_district_id),
      from_ward_code: String(store.ghn_ward_code),
      to_district_id: toDistrictId,
      to_ward_code: toWardCode,
      insurance_value: Number(itemTotal || 0),
      cod_value: 0,
      ...metrics,
    });
    return {
      shipping_fee: Number(fee?.total || 0),
      service_id: selectedService.service_id || null,
      service_type_id: selectedService.service_type_id || null,
    };
  }

  static async calculateShippingFeePreview(userId, payload = {}) {
    const addressId = Number(payload.address_id || 0);
    if (!addressId) {
      throw new Error("Vui lòng chọn địa chỉ giao hàng");
    }

    let requestedItems = Array.isArray(payload.items) ? payload.items : [];
    const cartItemIds = Array.isArray(payload.cart_item_ids)
      ? payload.cart_item_ids.map((id) => Number(id)).filter(Boolean)
      : [];

    if (requestedItems.length === 0 && cartItemIds.length > 0) {
      const cartRows = await CartItem.findAll({
        where: { user_id: userId, id: { [Op.in]: cartItemIds } },
        attributes: ["id", "product_id", "quantity"],
      });
      requestedItems = cartRows.map((row) => ({
        product_id: Number(row.product_id),
        quantity: Number(row.quantity || 1),
      }));
    }
    if (requestedItems.length === 0) {
      return { lines: [], total_shipping_fee: 0, grand_total: 0 };
    }

    const mergedItemsMap = new Map();
    for (const item of requestedItems) {
      const productId = Number(item.product_id);
      const serialId = item.serial_id ? Number(item.serial_id) : null;
      const quantity = Math.max(1, Number(item.quantity || 1));
      if (!productId) continue;
      const key = `${productId}:${serialId || 0}`;
      const prev = mergedItemsMap.get(key) || {
        product_id: productId,
        serial_id: serialId,
        quantity: 0,
      };
      prev.quantity += quantity;
      mergedItemsMap.set(key, prev);
    }
    const mergedItems = Array.from(mergedItemsMap.values());
    const productIds = [...new Set(mergedItems.map((item) => item.product_id))];

    const [addressRecord, products] = await Promise.all([
      UserAddress.findOne({
        where: { id: addressId, user_id: userId },
      }),
      Product.findAll({
        where: { id: { [Op.in]: productIds }, status: "active" },
      }),
    ]);
    if (!addressRecord) throw new Error("Không tìm thấy địa chỉ giao hàng");
    if (products.length !== productIds.length) {
      throw new Error("Có sản phẩm không tồn tại hoặc không còn bán");
    }

    const shippingAddress = this.addressFromRecord(addressRecord);
    const productMap = new Map(products.map((p) => [Number(p.id), p]));
    const linesByStore = new Map();
    for (const item of mergedItems) {
      const product = productMap.get(Number(item.product_id));
      if (!product) continue;
      const storeId = Number(product.store_id);
      const unitPrice = Number(product.price || 0);
      const exists = linesByStore.get(storeId) || {
        store_id: storeId,
        item_total: 0,
        lines: [],
      };
      exists.lines.push({
        product_id: Number(product.id),
        quantity: Number(item.quantity || 1),
      });
      exists.item_total += unitPrice * Number(item.quantity || 1);
      linesByStore.set(storeId, exists);
    }

    const storeIds = Array.from(linesByStore.keys());
    const stores = await Store.findAll({
      where: { id: { [Op.in]: storeIds } },
    });
    const storeMap = new Map(stores.map((item) => [Number(item.id), item]));
    const ownStore = stores.find(
      (item) => Number(item.owner_id) === Number(userId),
    );
    if (ownStore) {
      throw new Error("Không thể mua sản phẩm từ chính cửa hàng của bạn");
    }

    const lines = [];
    let totalShippingFee = 0;
    let grandTotal = 0;
    for (const [storeId, value] of linesByStore.entries()) {
      // eslint-disable-next-line no-await-in-loop
      const ship = await this.calculateShippingFeeForStore({
        store: storeMap.get(Number(storeId)),
        shippingAddress,
        orderLines: value.lines,
        itemTotal: value.item_total,
      });
      const lineTotal = Number(value.item_total || 0) + Number(ship.shipping_fee || 0);
      totalShippingFee += Number(ship.shipping_fee || 0);
      grandTotal += lineTotal;
      lines.push({
        store_id: Number(storeId),
        store_name: storeMap.get(Number(storeId))?.name || null,
        item_total: Number(value.item_total || 0),
        shipping_fee: Number(ship.shipping_fee || 0),
        total: lineTotal,
      });
    }

    return {
      lines,
      total_shipping_fee: totalShippingFee,
      grand_total: grandTotal,
    };
  }

  static getOrderDisplayStatus(order) {
    if (!order) return "pending";
    if (order.status === "canceled") return "canceled";
    if (order.status === "completed") return "completed";
    const shipmentStatus = order.shipments?.[0]?.status || "pending";
    if (shipmentStatus === "failed") return "canceled";
    if (shipmentStatus === "delivered") return "completed";
    if (shipmentStatus === "shipped") return "shipping";
    return "pending";
  }

  static async lockProductById(productId, transaction) {
    return Product.findByPk(Number(productId), {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
  }

  static async syncProductAvailableQuantity(productId, transaction) {
    const rows = await ProductInventory.findAll({
      where: { product_id: Number(productId) },
      attributes: ["on_hand", "reserved"],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!rows.length) return null;

    const available = rows.reduce(
      (sum, row) =>
        sum +
        Math.max(0, Number(row.on_hand || 0) - Number(row.reserved || 0)),
      0,
    );

    await Product.update(
      { quantity: Number(available) },
      { where: { id: Number(productId) }, transaction },
    );

    return Number(available);
  }

  static async adjustInventoryForOrderLine({
    productId,
    serialId = null,
    quantity,
    transaction,
    action,
  }) {
    const pid = Number(productId);
    const qty = Math.max(1, Number(quantity || 1));
    const sid = serialId ? Number(serialId) : null;

    if (!pid) throw new Error("product_id không hợp lệ");
    if (!qty) throw new Error("quantity không hợp lệ");
    if (!transaction) throw new Error("transaction là bắt buộc");

    const where = sid
      ? { product_id: pid, serial_id: sid }
      : { product_id: pid };
    const rows = await ProductInventory.findAll({
      where,
      order: [["id", "ASC"]],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!rows.length) {
      const product = await this.lockProductById(pid, transaction);
      if (!product) throw new Error(`Không tìm thấy sản phẩm #${pid}`);

      const currentQty = Number(product.quantity || 0);
      if (action === "reserve") {
        if (currentQty < qty) {
          throw new Error(`Sản phẩm "${product.name}" không đủ tồn kho`);
        }
        await product.update({ quantity: currentQty - qty }, { transaction });
      } else if (action === "release") {
        await product.update({ quantity: currentQty + qty }, { transaction });
      }
      return;
    }

    if (action === "reserve") {
      let remaining = qty;
      for (const row of rows) {
        if (remaining <= 0) break;
        const onHand = Number(row.on_hand || 0);
        const reserved = Number(row.reserved || 0);
        const available = Math.max(0, onHand - reserved);
        if (available <= 0) continue;
        const hold = Math.min(available, remaining);
        await row.update({ reserved: reserved + hold }, { transaction });
        remaining -= hold;
      }
      if (remaining > 0) {
        const product = await this.lockProductById(pid, transaction);
        throw new Error(`Sản phẩm "${product?.name || pid}" không đủ tồn kho`);
      }
      await this.syncProductAvailableQuantity(pid, transaction);
      return;
    }

    if (action === "consume") {
      const totalReserved = rows.reduce(
        (sum, row) => sum + Math.max(0, Number(row.reserved || 0)),
        0,
      );

      // Backward compatibility: old orders already deducted on_hand at checkout.
      if (totalReserved <= 0) {
        await this.syncProductAvailableQuantity(pid, transaction);
        return;
      }

      if (totalReserved < qty) {
        throw new Error(
          `Tồn kho giữ chỗ không đủ để xuất kho (product_id=${pid}, cần=${qty}, giữ chỗ=${totalReserved})`,
        );
      }

      let remaining = qty;
      for (const row of rows) {
        if (remaining <= 0) break;
        const onHand = Number(row.on_hand || 0);
        const reserved = Number(row.reserved || 0);
        if (reserved <= 0) continue;
        const consumeQty = Math.min(reserved, remaining);
        if (onHand < consumeQty) {
          throw new Error(
            `Dữ liệu tồn kho không hợp lệ (product_id=${pid}, serial_id=${row.serial_id})`,
          );
        }
        await row.update(
          {
            on_hand: onHand - consumeQty,
            reserved: reserved - consumeQty,
          },
          { transaction },
        );
        remaining -= consumeQty;
      }

      await this.syncProductAvailableQuantity(pid, transaction);
      return;
    }

    if (action === "release") {
      const totalReserved = rows.reduce(
        (sum, row) => sum + Math.max(0, Number(row.reserved || 0)),
        0,
      );

      let remaining = qty;

      // Release held stock first.
      for (const row of rows) {
        if (remaining <= 0) break;
        const reserved = Number(row.reserved || 0);
        if (reserved <= 0) continue;
        const releaseQty = Math.min(reserved, remaining);
        await row.update({ reserved: reserved - releaseQty }, { transaction });
        remaining -= releaseQty;
      }

      // Backward compatibility: old orders had already deducted on_hand.
      if (remaining > 0) {
        const anchor = rows[0];
        const onHand = Number(anchor.on_hand || 0);
        await anchor.update({ on_hand: onHand + remaining }, { transaction });
      }

      await this.syncProductAvailableQuantity(pid, transaction);
      return;
    }

    throw new Error("Hành động tồn kho không hợp lệ");
  }

  static async consumeReservedStockForOrderItems(orderItems, transaction) {
    for (const item of orderItems || []) {
      // eslint-disable-next-line no-await-in-loop
      await this.adjustInventoryForOrderLine({
        productId: item.product_id,
        serialId: item.serial_id || null,
        quantity: item.quantity,
        transaction,
        action: "consume",
      });
    }
  }

  static async releaseReservedStockForOrderItems(orderItems, transaction) {
    for (const item of orderItems || []) {
      // eslint-disable-next-line no-await-in-loop
      await this.adjustInventoryForOrderLine({
        productId: item.product_id,
        serialId: item.serial_id || null,
        quantity: item.quantity,
        transaction,
        action: "release",
      });
    }
  }

  static async releaseReservedStockForOrder(orderId, transaction) {
    const orderItems = await OrderItem.findAll({
      where: { order_id: Number(orderId) },
      attributes: ["product_id", "serial_id", "quantity"],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    await this.releaseReservedStockForOrderItems(orderItems, transaction);
  }

  static async createOrderFromCart(userId, payload = {}) {
    const note = payload.note ? String(payload.note).trim() : null;
    const paymentMethod = this.normalizePaymentMethod(payload.payment_method);
    const addressId = payload.address_id ? Number(payload.address_id) : null;

    let requestedItems = Array.isArray(payload.items) ? payload.items : [];
    const cartItemIds = Array.isArray(payload.cart_item_ids)
      ? payload.cart_item_ids.map((id) => Number(id)).filter(Boolean)
      : [];

    if (requestedItems.length === 0 && cartItemIds.length > 0) {
      const cartRows = await CartItem.findAll({
        where: { user_id: userId, id: { [Op.in]: cartItemIds } },
        attributes: ["id", "product_id", "quantity"],
      });
      requestedItems = cartRows.map((row) => ({
        product_id: Number(row.product_id),
        quantity: Number(row.quantity || 1),
      }));
    }

    if (requestedItems.length === 0) {
      throw new Error("items không được để trống");
    }

    const normalizedItems = requestedItems.map((item) => {
      const productId = Number(item.product_id);
      const serialId = item.serial_id ? Number(item.serial_id) : null;
      const quantity = Math.max(1, Number(item.quantity || 1));
      if (!productId) throw new Error("product_id không hợp lệ");
      if (item.serial_id && !serialId)
        throw new Error("serial_id không hợp lệ");
      return { product_id: productId, serial_id: serialId, quantity };
    });

    const mergedItemsMap = new Map();
    for (const item of normalizedItems) {
      const key = `${item.product_id}:${item.serial_id || 0}`;
      const prev = mergedItemsMap.get(key) || { ...item, quantity: 0 };
      prev.quantity += item.quantity;
      mergedItemsMap.set(key, prev);
    }
    const mergedItems = Array.from(mergedItemsMap.values());

    const productIds = [...new Set(mergedItems.map((item) => item.product_id))];

    const txResult = await sequelize.transaction(async (transaction) => {
      let shippingAddress = null;
      if (addressId) {
        const addressRecord = await UserAddress.findOne({
          where: { id: addressId, user_id: userId },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (!addressRecord) throw new Error("Không tìm thấy địa chỉ giao hàng");
        shippingAddress = this.addressFromRecord(addressRecord);
      } else if (
        payload.shipping_address &&
        Object.keys(payload.shipping_address).length
      ) {
        shippingAddress = this.normalizeAddress(payload.shipping_address || {});
      } else {
        const defaultAddress = await UserAddress.findOne({
          where: { user_id: userId, is_default: true },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (!defaultAddress) {
          throw new Error("Vui lòng chọn address_id hoặc gửi shipping_address");
        }
        shippingAddress = this.addressFromRecord(defaultAddress);
      }

      const products = await Product.findAll({
        where: { id: { [Op.in]: productIds }, status: "active" },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (products.length !== productIds.length) {
        throw new Error("Có sản phẩm không tồn tại hoặc không còn bán");
      }
      const productMap = new Map(products.map((p) => [Number(p.id), p]));

      const linesByStore = new Map();
      for (const item of mergedItems) {
        const product = productMap.get(item.product_id);
        if (!product)
          throw new Error(`Không tìm thấy sản phẩm #${item.product_id}`);
        const qty = item.quantity;
        const unitPrice = Number(product.price || 0);

        await this.adjustInventoryForOrderLine({
          productId: Number(product.id),
          serialId: item.serial_id || null,
          quantity: qty,
          transaction,
          action: "reserve",
        });

        const storeId = Number(product.store_id);
        if (!storeId) {
          throw new Error(`Sản phẩm "${product.name}" chưa có cửa hàng`);
        }
        const existing = linesByStore.get(storeId) || {
          totalPrice: 0,
          lines: [],
        };
        existing.lines.push({
          product_id: product.id,
          serial_id: item.serial_id || null,
          quantity: qty,
          price: unitPrice,
        });
        existing.totalPrice += unitPrice * qty;
        linesByStore.set(storeId, existing);
      }

      const createdOrders = [];
      const transferInstructions = [];
      const purchaseEvents = [];
      const storeIds = Array.from(linesByStore.keys());
      const stores = await Store.findAll({
        where: { id: { [Op.in]: storeIds } },
        transaction,
      });
      const storeMap = new Map(stores.map((item) => [Number(item.id), item]));
      const ownStore = stores.find(
        (item) => Number(item.owner_id) === Number(userId),
      );
      if (ownStore) {
        throw new Error("Không thể đặt đơn từ chính cửa hàng của bạn");
      }
      for (const [storeId, value] of linesByStore) {
        const ship = await this.calculateShippingFeeForStore({
          store: storeMap.get(Number(storeId)),
          shippingAddress,
          orderLines: value.lines,
          itemTotal: value.totalPrice,
        });
        const orderTotal = Number(value.totalPrice || 0) + Number(ship.shipping_fee || 0);

        const order = await Order.create(
          {
            customer_id: userId,
            store_id: storeId,
            total_price: Number(orderTotal.toFixed(2)),
            currency: "VND",
            payment_method: paymentMethod,
            shipping_address: shippingAddress,
            status: "pending",
            note,
          },
          { transaction },
        );

        for (const line of value.lines) {
          await OrderItem.create(
            {
              order_id: order.id,
              product_id: line.product_id,
              serial_id: line.serial_id || null,
              quantity: line.quantity,
              price: line.price,
            },
            { transaction },
          );
          purchaseEvents.push({
            product_id: Number(line.product_id),
            order_id: Number(order.id),
            quantity: Number(line.quantity || 1),
            price: Number(line.price || 0),
          });
        }

        await Shipment.create(
          {
            order_id: order.id,
            status: "pending",
            shipping_provider: "ghn",
            shipping_service_id: ship.service_id,
            shipping_service_type_id: ship.service_type_id,
            shipping_fee: Number(ship.shipping_fee || 0),
          },
          { transaction },
        );

        await Payment.create(
          {
            order_id: order.id,
            amount: Number(orderTotal.toFixed(2)),
            currency: "VND",
            payment_method: paymentMethod,
            status: "pending",
          },
          { transaction },
        );

        createdOrders.push(order);
        if (paymentMethod === "bank_transfer") {
          transferInstructions.push(
            this.buildSepayTransferInstruction(order, orderTotal),
          );
        }
      }

      if (cartItemIds.length > 0) {
        await CartItem.destroy({
          where: { user_id: userId, id: { [Op.in]: cartItemIds } },
          transaction,
        });
      }

      return {
        payment_method: paymentMethod,
        currency: "VND",
        grouped_by_store: true,
        orders: createdOrders.map((order) => ({
          id: order.id,
          store_id: order.store_id,
          status: order.status,
          currency: order.currency || "VND",
          total_price: order.total_price,
        })),
        transfer_instructions:
          paymentMethod === "bank_transfer" ? transferInstructions : [],
        _purchase_events: purchaseEvents,
      };
    });

    const purchaseEvents = Array.isArray(txResult._purchase_events)
      ? txResult._purchase_events
      : [];
    delete txResult._purchase_events;

    for (const item of purchaseEvents) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await UserEventService.track(userId, {
          product_id: item.product_id,
          event_type: "purchase",
          meta: {
            order_id: item.order_id,
            quantity: item.quantity,
            price: item.price,
          },
        });
      } catch (error) {
        console.error("[Event] track purchase failed:", error.message);
      }
    }

    return txResult;
  }

  static async getTransferPaymentInfo(userId, orderIds = []) {
    const uniqueIds = [
      ...new Set(orderIds.map((id) => Number(id)).filter(Boolean)),
    ];
    if (uniqueIds.length === 0) throw new Error("order_ids không hợp lệ");

    const items = [];
    for (const orderId of uniqueIds) {
      // xử lý tuần tự để dễ khóa row + cập nhật hết hạn an toàn
      // eslint-disable-next-line no-await-in-loop
      const info = await this.resolveTransferPaymentState(userId, orderId);
      items.push(info);
    }

    const allPaid = items.every((item) => item.transfer_status === "paid");
    const hasExpired = items.some((item) => item.transfer_status === "expired");
    const now = Date.now();
    const remainingSeconds = Math.max(
      0,
      Math.min(
        ...items
          .filter((item) => item.transfer_status === "pending")
          .map((item) =>
            Math.floor((new Date(item.expires_at).getTime() - now) / 1000),
          ),
        Number.MAX_SAFE_INTEGER,
      ),
    );

    return {
      all_paid: allPaid,
      has_expired: hasExpired,
      remaining_seconds:
        remainingSeconds === Number.MAX_SAFE_INTEGER ? 0 : remainingSeconds,
      items,
    };
  }

  static async getMyOrders(userId, filters = {}) {
    const statusFilter = String(filters.status || "all").toLowerCase();
    const orders = await Order.findAll({
      where: { customer_id: userId },
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "store_id"],
              include: [
                {
                  model: ProductImage,
                  as: "images",
                  attributes: ["id", "url", "sort_order"],
                  separate: true,
                  limit: 1,
                  order: [["sort_order", "ASC"]],
                },
                { model: Store, as: "store", attributes: ["id", "name"] },
              ],
            },
            {
              model: ProductSerial,
              as: "serial",
              attributes: ["id", "serial_code", "serial_specs"],
              required: false,
            },
          ],
        },
        {
          model: Shipment,
          as: "shipments",
          attributes: [
            "id",
            "status",
            "estimated_delivery",
            "actual_delivery",
            "shipping_provider",
            "shipping_service_id",
            "shipping_service_type_id",
            "shipping_fee",
            "ghn_order_code",
            "ghn_status",
            "ghn_last_sync_at",
          ],
          separate: true,
          limit: 1,
          order: [["created_at", "DESC"]],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    await this.syncShipmentsForOrders(orders, { force: true });

    const productIds = orders.flatMap((o) =>
      (o.items || []).map((it) => Number(it.product_id)),
    );

    const myReviews = productIds.length
      ? await Review.findAll({
          where: { reviewer_id: userId, product_id: { [Op.in]: productIds } },
          attributes: ["id", "product_id"],
        })
      : [];
    const reviewedSet = new Set(myReviews.map((r) => Number(r.product_id)));

    const mapped = orders.map((order) => {
      const displayStatus = this.getOrderDisplayStatus(order);
      const shipment = order.shipments?.[0] || null;
      return {
        id: order.id,
        status: displayStatus,
        order_status: order.status,
        shipment_status: shipment?.status || null,
        shipment_fee: shipment?.shipping_fee || null,
        shipment_provider: shipment?.shipping_provider || null,
        ghn_order_code: shipment?.ghn_order_code || null,
        ghn_status: shipment?.ghn_status || null,
        total_price: order.total_price,
        payment_method: order.payment_method,
        currency: order.currency || "VND",
        shipping_address: order.shipping_address,
        created_at: order.created_at,
        note: order.note,
        items: (order.items || []).map((item) => ({
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          serial: item.serial || null,
          product: item.product,
          can_review:
            displayStatus === "completed" &&
            !reviewedSet.has(Number(item.product_id)),
        })),
      };
    });

    if (statusFilter === "all") return mapped;
    return mapped.filter((order) => order.status === statusFilter);
  }

  static async getShopOrders(shopUserId, filters = {}) {
    const statusFilter = String(filters.status || "all").toLowerCase();
    const stores = await Store.findAll({
      where: { owner_id: shopUserId },
      attributes: ["id", "name"],
    });
    const storeIds = stores.map((s) => Number(s.id));
    if (storeIds.length === 0) return [];

    const orders = await Order.findAll({
      where: { store_id: { [Op.in]: storeIds } },
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id", "username", "phone", "email"],
        },
        {
          model: OrderItem,
          as: "items",
          required: true,
          include: [
            {
              model: Product,
              as: "product",
              required: false,
              attributes: ["id", "name", "store_id"],
              include: [
                {
                  model: ProductImage,
                  as: "images",
                  attributes: ["id", "url", "sort_order"],
                  separate: true,
                  limit: 1,
                  order: [["sort_order", "ASC"]],
                },
                {
                  model: Store,
                  as: "store",
                  attributes: ["id", "name", "owner_id"],
                },
              ],
            },
            {
              model: ProductSerial,
              as: "serial",
              attributes: ["id", "serial_code", "serial_specs"],
              required: false,
            },
          ],
        },
        {
          model: Shipment,
          as: "shipments",
          attributes: [
            "id",
            "status",
            "estimated_delivery",
            "actual_delivery",
            "shipping_provider",
            "shipping_service_id",
            "shipping_service_type_id",
            "shipping_fee",
            "ghn_order_code",
            "ghn_status",
            "ghn_last_sync_at",
          ],
          separate: true,
          limit: 1,
          order: [["created_at", "DESC"]],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    await this.syncShipmentsForOrders(orders, { force: true });

    const rows = orders.map((order) => {
      const displayStatus = this.getOrderDisplayStatus(order);
      const shipment = order.shipments?.[0] || null;
      return {
        id: order.id,
        status: displayStatus,
        order_status: order.status,
        shipment_status: shipment?.status || null,
        shipment_fee: shipment?.shipping_fee || null,
        shipment_provider: shipment?.shipping_provider || null,
        ghn_order_code: shipment?.ghn_order_code || null,
        ghn_status: shipment?.ghn_status || null,
        total_price: order.total_price,
        payment_method: order.payment_method,
        currency: order.currency || "VND",
        shipping_address: order.shipping_address,
        created_at: order.created_at,
        note: order.note,
        customer: order.customer,
        items: (order.items || []).map((item) => ({
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          serial: item.serial || null,
          product: item.product,
        })),
      };
    });

    if (statusFilter === "all") return rows;
    return rows.filter((order) => order.status === statusFilter);
  }

  static async getShopAnalytics(shopUserId, filters = {}) {
    const stores = await Store.findAll({
      where: { owner_id: shopUserId },
      attributes: ["id", "name"],
    });
    const storeIds = stores.map((s) => Number(s.id)).filter(Boolean);
    if (storeIds.length === 0) {
      return {
        range: this.normalizeAnalyticsRange(filters.range).key,
        total_orders: 0,
        completed_orders: 0,
        total_revenue: 0,
        average_order_value: 0,
        completion_rate: 0,
        status_counts: {
          pending: 0,
          shipping: 0,
          completed: 0,
          canceled: 0,
        },
        daily_revenue: [],
        monthly_revenue: [],
        top_products: [],
      };
    }

    const range = this.normalizeAnalyticsRange(filters.range);
    const whereClause = { store_id: { [Op.in]: storeIds } };
    if (range.days) {
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      startDate.setDate(startDate.getDate() - (range.days - 1));
      whereClause.created_at = { [Op.gte]: startDate };
    }

    const orders = await Order.findAll({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: "items",
          required: false,
          include: [
            {
              model: Product,
              as: "product",
              required: false,
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: Shipment,
          as: "shipments",
          attributes: ["id", "status", "ghn_order_code", "ghn_status", "ghn_last_sync_at"],
          separate: true,
          limit: 1,
          order: [["created_at", "DESC"]],
        },
      ],
      order: [["created_at", "ASC"]],
    });

    await this.syncShipmentsForOrders(orders);

    const statusCounts = {
      pending: 0,
      shipping: 0,
      completed: 0,
      canceled: 0,
    };
    const dailyRevenueMap = new Map();
    const monthlyRevenueMap = new Map();
    const topProductsMap = new Map();

    let totalOrders = 0;
    let completedOrders = 0;
    let totalRevenue = 0;

    for (const order of orders) {
      totalOrders += 1;
      const displayStatus = this.getOrderDisplayStatus(order);
      if (statusCounts[displayStatus] !== undefined) {
        statusCounts[displayStatus] += 1;
      }

      if (displayStatus !== "completed") continue;

      completedOrders += 1;
      const orderRevenue = Number(order.total_price || 0);
      totalRevenue += orderRevenue;

      const createdAt = new Date(order.created_at);
      const dayKey = createdAt.toISOString().slice(0, 10);
      const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`;
      dailyRevenueMap.set(dayKey, Number(dailyRevenueMap.get(dayKey) || 0) + orderRevenue);
      monthlyRevenueMap.set(
        monthKey,
        Number(monthlyRevenueMap.get(monthKey) || 0) + orderRevenue,
      );

      for (const item of order.items || []) {
        const productId = Number(item.product_id || item.product?.id || 0);
        const productName = item.product?.name || `#${productId || "unknown"}`;
        const quantity = Number(item.quantity || 0);
        const lineRevenue = Number(item.price || 0) * quantity;
        if (!productId || quantity <= 0) continue;

        const current = topProductsMap.get(productId) || {
          product_id: productId,
          name: productName,
          units_sold: 0,
          revenue: 0,
        };
        current.units_sold += quantity;
        current.revenue += lineRevenue;
        topProductsMap.set(productId, current);
      }
    }

    const dailyRevenue = Array.from(dailyRevenueMap.entries())
      .map(([date, revenue]) => ({
        date,
        label: new Date(date).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        }),
        revenue,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const monthlyRevenue = Array.from(monthlyRevenueMap.entries())
      .map(([month, revenue]) => {
        const [year, monthNum] = month.split("-");
        return {
          month,
          label: `${monthNum}/${year}`,
          revenue,
        };
      })
      .sort((a, b) => a.month.localeCompare(b.month));

    const topProducts = Array.from(topProductsMap.values())
      .sort((a, b) => {
        if (b.units_sold === a.units_sold) return b.revenue - a.revenue;
        return b.units_sold - a.units_sold;
      })
      .slice(0, 5);

    const averageOrderValue =
      completedOrders > 0 ? totalRevenue / completedOrders : 0;
    const completionRate =
      totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    return {
      range: range.key,
      total_orders: totalOrders,
      completed_orders: completedOrders,
      total_revenue: totalRevenue,
      average_order_value: averageOrderValue,
      completion_rate: completionRate,
      status_counts: statusCounts,
      daily_revenue: dailyRevenue,
      monthly_revenue: monthlyRevenue,
      top_products: topProducts,
    };
  }

  static async approveOrderForShop(shopUserId, orderId) {
    const parsedOrderId = Number(orderId);
    if (!parsedOrderId) throw new Error("order_id không hợp lệ");

    return sequelize.transaction(async (transaction) => {
      const order = await Order.findOne({
        where: { id: parsedOrderId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!order) throw new Error("Không tìm thấy đơn hàng");
      if (order.status === "canceled") throw new Error("Đơn hàng đã bị hủy");
      if (order.status === "completed") throw new Error("Đơn hàng đã hoàn tất");

      const ownedStore = await Store.findOne({
        where: { id: order.store_id, owner_id: shopUserId },
        transaction,
      });
      if (!ownedStore) {
        throw new Error("Bạn không có quyền duyệt đơn hàng này");
      }

      if (
        !ownedStore.ghn_district_id ||
        !ownedStore.ghn_ward_code ||
        !ownedStore.province ||
        !ownedStore.ghn_shop_id
      ) {
        throw new Error(
          "Shop chưa cấu hình GHN đầy đủ (địa chỉ hoặc GHN shop_id)",
        );
      }

      const shippingAddress = order.shipping_address || {};
      const toDistrictId = Number(shippingAddress.ghn_district_id || 0);
      const toWardCode = String(shippingAddress.ghn_ward_code || "").trim();
      if (!toDistrictId || !toWardCode) {
        throw new Error(
          "Đơn hàng chưa có mã quận/phường GHN. Vui lòng cập nhật địa chỉ người nhận",
        );
      }

      const shipment = await Shipment.findOne({
        where: { order_id: order.id },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      const orderItems = await OrderItem.findAll({
        where: { order_id: order.id },
        include: [
          {
            model: Product,
            as: "product",
            required: false,
            attributes: ["id", "name"],
          },
        ],
        transaction,
      });
      const shouldFinalizeInventory =
        !shipment ||
        String(shipment.status || "pending").toLowerCase() === "pending";
      if (shouldFinalizeInventory) {
        await this.consumeReservedStockForOrderItems(orderItems, transaction);
      }

      const metrics = this.getOrderShippingMetrics(orderItems);
      const orderItemSubtotal = orderItems.reduce(
        (sum, item) =>
          sum +
          Number(item.price || 0) * Math.max(1, Number(item.quantity || 1)),
        0,
      );
      const ghnShopId = Number(ownedStore.ghn_shop_id || 0);
      if (!ghnShopId) {
        throw new Error("Shop chưa có GHN shop_id hợp lệ");
      }

      const services = await GhnService.getAvailableServices({
        shopId: ghnShopId,
        fromDistrict: Number(ownedStore.ghn_district_id),
        toDistrict: toDistrictId,
      });
      if (!services.length) {
        throw new Error("GHN không có dịch vụ phù hợp cho tuyến giao hàng này");
      }

      const selectedService = services[0];
      const fee = await GhnService.calculateFee({
        shop_id: ghnShopId,
        service_id: selectedService.service_id,
        service_type_id: selectedService.service_type_id,
        from_district_id: Number(ownedStore.ghn_district_id),
        from_ward_code: String(ownedStore.ghn_ward_code),
        to_district_id: toDistrictId,
        to_ward_code: toWardCode,
        insurance_value: Math.round(Math.max(orderItemSubtotal, 0)),
        cod_value:
          order.payment_method === "cod" ? Number(order.total_price || 0) : 0,
        ...metrics,
      });
      const shippingFee = Number(fee?.total || 0);
      const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      let activeShipment = shipment;
      if (!activeShipment) {
        activeShipment = await Shipment.create(
          {
            order_id: order.id,
            status: "pending",
            estimated_delivery: estimatedDelivery,
            shipping_provider: "ghn",
            shipping_service_id: selectedService.service_id || null,
            shipping_service_type_id: selectedService.service_type_id || null,
            shipping_fee: shippingFee,
          },
          { transaction },
        );
      } else {
        await activeShipment.update(
          {
            estimated_delivery:
              activeShipment.estimated_delivery || estimatedDelivery,
            shipping_provider: "ghn",
            shipping_service_id: selectedService.service_id || null,
            shipping_service_type_id: selectedService.service_type_id || null,
            shipping_fee: shippingFee,
          },
          { transaction },
        );
      }

      if (!activeShipment.ghn_order_code) {
        const receiverName = String(shippingAddress.full_name || "").trim();
        const receiverPhone = String(shippingAddress.phone || "").trim();
        const receiverAddress = this.buildAddressLine(shippingAddress);

        if (!receiverName || !receiverPhone || !receiverAddress) {
          throw new Error(
            "Đơn hàng thiếu thông tin người nhận (tên/sđt/địa chỉ) để tạo đơn GHN",
          );
        }

        const ghnItems = orderItems.map((item) => ({
          name: String(item.product?.name || `SP-${item.product_id}`),
          quantity: Math.max(1, Number(item.quantity || 1)),
          weight: 200,
          length: 20,
          width: 20,
          height: 10,
        }));

        const ghnCreated = await GhnService.createOrder({
          shop_id: ghnShopId,
          client_order_code: `TX-${order.id}`,
          to_name: receiverName,
          to_phone: receiverPhone,
          to_address: receiverAddress,
          to_ward_code: toWardCode,
          to_district_id: toDistrictId,
          service_id: selectedService.service_id || undefined,
          service_type_id: selectedService.service_type_id || undefined,
          cod_amount:
            order.payment_method === "cod" ? Number(order.total_price || 0) : 0,
          insurance_value: Math.round(Math.max(orderItemSubtotal, 0)),
          note: String(order.note || "").trim(),
          content:
            ghnItems.length > 1
              ? `Đơn hàng #${order.id} (${ghnItems.length} sản phẩm)`
              : ghnItems[0]?.name || `Đơn hàng #${order.id}`,
          weight: metrics.weight,
          length: metrics.length,
          width: metrics.width,
          height: metrics.height,
          items: ghnItems,
          return_address: this.buildAddressLine({
            line1: ownedStore.address_line,
            ward: ownedStore.ward,
            district: ownedStore.district,
            city: ownedStore.city,
            province: ownedStore.province,
          }),
          return_district_id: Number(ownedStore.ghn_district_id),
          return_ward_code: String(ownedStore.ghn_ward_code || "").trim(),
        });

        const ghnOrderCode = this.extractGhnOrderCode(ghnCreated);
        if (!ghnOrderCode) {
          throw new Error(
            "Tạo đơn GHN thành công nhưng không nhận được order_code",
          );
        }

        let ghnDetail = null;
        try {
          ghnDetail = await GhnService.getOrderDetail({
            order_code: ghnOrderCode,
            shop_id: ghnShopId,
          });
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn(
            `[GHN] Không lấy được chi tiết đơn ${ghnOrderCode}:`,
            error.message,
          );
        }

        const ghnStatus = this.extractGhnStatus(
          ghnDetail,
          ghnCreated?.current_status || "ready_to_pick",
        );
        const mapped = this.mapGhnStatusToLocal(ghnStatus);
        const resolvedEta =
          this.parseGhnDate(
            ghnDetail?.leadtime || ghnCreated?.expected_delivery_time,
          ) || activeShipment.estimated_delivery || estimatedDelivery;

        await activeShipment.update(
          {
            status:
              mapped.shipment_status === "pending"
                ? "shipped"
                : mapped.shipment_status,
            estimated_delivery: resolvedEta,
            actual_delivery:
              mapped.shipment_status === "delivered"
                ? activeShipment.actual_delivery || new Date()
                : activeShipment.actual_delivery || null,
            ghn_order_code: ghnOrderCode,
            ghn_status: ghnStatus || "ready_to_pick",
            ghn_last_sync_at: new Date(),
            ghn_payload: this.toJsonText(ghnDetail || ghnCreated),
          },
          { transaction },
        );

        if (
          mapped.order_status &&
          order.status !== mapped.order_status &&
          order.status !== "completed"
        ) {
          await order.update({ status: mapped.order_status }, { transaction });
        }
      } else {
        await this.syncShipmentWithGhn({
          shipment: activeShipment,
          order,
          ghnShopId,
          transaction,
          force: true,
        });
      }

      await activeShipment.reload({ transaction });
      await order.reload({ transaction });

      if (shouldFinalizeInventory) {
        const normalizedShipmentStatus = String(
          activeShipment.status || "",
        ).toLowerCase();
        const normalizedOrderStatus = String(order.status || "").toLowerCase();
        if (
          normalizedShipmentStatus === "failed" ||
          normalizedOrderStatus === "canceled"
        ) {
          await this.releaseReservedStockForOrderItems(orderItems, transaction);
        }
      }

      const displayStatus = this.getOrderDisplayStatus({
        status: order.status,
        shipments: [activeShipment],
      });

      return {
        id: order.id,
        status: displayStatus,
        shipment: {
          provider: activeShipment.shipping_provider || "ghn",
          shipping_fee: activeShipment.shipping_fee || shippingFee,
          service_id:
            activeShipment.shipping_service_id ||
            selectedService.service_id ||
            null,
          service_type_id:
            activeShipment.shipping_service_type_id ||
            selectedService.service_type_id ||
            null,
          ghn_order_code: activeShipment.ghn_order_code || null,
          ghn_status: activeShipment.ghn_status || null,
        },
      };
    });
  }

  static async rejectOrderForShop(shopUserId, orderId) {
    const parsedOrderId = Number(orderId);
    if (!parsedOrderId) throw new Error("order_id không hợp lệ");

    return sequelize.transaction(async (transaction) => {
      const order = await Order.findOne({
        where: { id: parsedOrderId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!order) throw new Error("Không tìm thấy đơn hàng");

      const ownedStore = await Store.findOne({
        where: { id: order.store_id, owner_id: shopUserId },
        transaction,
      });
      if (!ownedStore) {
        throw new Error("Bạn không có quyền từ chối đơn hàng này");
      }

      if (order.status === "canceled") {
        return { id: order.id, status: "canceled" };
      }
      if (order.status === "completed") {
        throw new Error("Đơn hàng đã hoàn tất, không thể từ chối");
      }

      const shipment = await Shipment.findOne({
        where: { order_id: order.id },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      const shipmentStatus = String(shipment?.status || "").toLowerCase();
      if (shipmentStatus === "shipped" || shipmentStatus === "delivered") {
        throw new Error("Đơn hàng đã bàn giao vận chuyển, không thể từ chối");
      }

      const payment = await Payment.findOne({
        where: { order_id: order.id },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (payment && String(payment.status || "").toLowerCase() === "completed") {
        throw new Error(
          "Đơn hàng đã thanh toán thành công, vui lòng xử lý hoàn tiền trước khi từ chối",
        );
      }

      await this.releaseReservedStockForOrder(order.id, transaction);

      await order.update({ status: "canceled" }, { transaction });

      if (shipment && shipmentStatus !== "failed") {
        await shipment.update({ status: "failed" }, { transaction });
      }

      if (payment && String(payment.status || "").toLowerCase() === "pending") {
        await payment.update({ status: "failed" }, { transaction });
      }

      return {
        id: order.id,
        status: "canceled",
      };
    });
  }

  static async markReceived(userId, orderId) {
    const parsedOrderId = Number(orderId);
    if (!parsedOrderId) throw new Error("order_id không hợp lệ");

    return sequelize.transaction(async (transaction) => {
      const order = await Order.findOne({
        where: { id: parsedOrderId, customer_id: userId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!order) throw new Error("Không tìm thấy đơn hàng");
      if (order.status === "canceled") throw new Error("Đơn hàng đã bị hủy");
      if (order.status === "completed")
        return { id: order.id, status: "completed" };

      const shipment = await Shipment.findOne({
        where: { order_id: order.id },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!shipment || shipment.status !== "shipped") {
        throw new Error("Đơn hàng chưa ở trạng thái đang giao");
      }

      await shipment.update(
        { status: "delivered", actual_delivery: new Date() },
        { transaction },
      );
      await order.update({ status: "completed" }, { transaction });

      return { id: order.id, status: "completed" };
    });
  }
}

module.exports = OrderService;

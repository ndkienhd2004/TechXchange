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
const { enqueueProductSync } = require("../utils/gorseSync");

class OrderService {
  static BANK_TRANSFER_EXPIRE_MINUTES = 10;

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
    if (shipmentStatus === "delivered") return "completed";
    if (shipmentStatus === "shipped") return "shipping";
    return "pending";
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

        if (item.serial_id) {
          const inventory = await ProductInventory.findOne({
            where: {
              product_id: product.id,
              serial_id: item.serial_id,
            },
            transaction,
            lock: transaction.LOCK.UPDATE,
          });
          if (!inventory) {
            throw new Error(
              `Không tìm thấy biến thể serial_id=${item.serial_id} cho sản phẩm "${product.name}"`,
            );
          }
          const available = Math.max(
            0,
            Number(inventory.on_hand || 0) - Number(inventory.reserved || 0),
          );
          if (available < qty) {
            throw new Error(`Sản phẩm "${product.name}" không đủ tồn kho`);
          }
          await inventory.update(
            { on_hand: Number(inventory.on_hand || 0) - qty },
            { transaction },
          );
        } else {
          const invRows = await ProductInventory.findAll({
            where: { product_id: product.id },
            order: [["id", "ASC"]],
            transaction,
          });

          if (invRows.length > 0) {
            let remaining = qty;
            for (const inv of invRows) {
              if (remaining <= 0) break;
              const available = Math.max(
                0,
                Number(inv.on_hand || 0) - Number(inv.reserved || 0),
              );
              if (available <= 0) continue;
              const deduct = Math.min(available, remaining);
              await inv.update(
                { on_hand: Number(inv.on_hand || 0) - deduct },
                { transaction },
              );
              remaining -= deduct;
            }
            if (remaining > 0) {
              throw new Error(`Sản phẩm "${product.name}" không đủ tồn kho`);
            }
          } else {
            const stock = Number(product.quantity || 0);
            if (stock < qty) {
              throw new Error(`Sản phẩm "${product.name}" không đủ tồn kho`);
            }
          }
        }

        const nextTotal =
          (await ProductInventory.sum("on_hand", {
            where: { product_id: product.id },
            transaction,
          })) || 0;
        const fallbackTotal =
          nextTotal > 0 ||
          (await ProductInventory.count({
            where: { product_id: product.id },
            transaction,
          })) > 0
            ? Number(nextTotal)
            : Math.max(0, Number(product.quantity || 0) - qty);
        await product.update({ quantity: fallbackTotal }, { transaction });

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

    for (const productId of productIds) {
      enqueueProductSync(productId);
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
          ],
          separate: true,
          limit: 1,
          order: [["created_at", "DESC"]],
        },
      ],
      order: [["created_at", "DESC"]],
    });

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
          attributes: ["id", "status", "estimated_delivery", "actual_delivery"],
          separate: true,
          limit: 1,
          order: [["created_at", "DESC"]],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    const rows = orders.map((order) => {
      const displayStatus = this.getOrderDisplayStatus(order);
      const shipment = order.shipments?.[0] || null;
      return {
        id: order.id,
        status: displayStatus,
        order_status: order.status,
        shipment_status: shipment?.status || null,
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
        transaction,
      });
      const metrics = this.getOrderShippingMetrics(orderItems);
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
        insurance_value: Number(order.total_price || 0),
        cod_value: order.payment_method === "cod" ? Number(order.total_price || 0) : 0,
        ...metrics,
      });
      const shippingFee = Number(fee?.total || 0);
      const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

      if (!shipment) {
        await Shipment.create(
          {
            order_id: order.id,
            status: "shipped",
            estimated_delivery: estimatedDelivery,
            shipping_provider: "ghn",
            shipping_service_id: selectedService.service_id || null,
            shipping_service_type_id: selectedService.service_type_id || null,
            shipping_fee: shippingFee,
          },
          { transaction },
        );
      } else if (
        shipment.status !== "shipped" &&
        shipment.status !== "delivered"
      ) {
        await shipment.update(
          {
            status: "shipped",
            estimated_delivery:
              shipment.estimated_delivery ||
              estimatedDelivery,
            shipping_provider: "ghn",
            shipping_service_id: selectedService.service_id || null,
            shipping_service_type_id: selectedService.service_type_id || null,
            shipping_fee: shippingFee,
          },
          { transaction },
        );
      }

      return {
        id: order.id,
        status: "shipping",
        shipment: {
          provider: "ghn",
          shipping_fee: shippingFee,
          service_id: selectedService.service_id || null,
          service_type_id: selectedService.service_type_id || null,
        },
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

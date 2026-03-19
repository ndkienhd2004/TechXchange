const { Store, User, Product } = require("../../models");
const { Op } = require("sequelize");
const GhnService = require("./ghnService");

class StoreService {
  static normalizeOptionalUrl(value) {
    if (value === undefined) return undefined;
    const normalized = String(value || "").trim();
    if (!normalized) return null;
    if (!/^https?:\/\//i.test(normalized)) {
      throw new Error("URL ảnh cửa hàng không hợp lệ");
    }
    return normalized;
  }

  static normalizeAddressPayload(payload = {}) {
    const addressLine = String(payload.address_line || "").trim();
    const ward = String(payload.ward || "").trim();
    const district = String(payload.district || "").trim();
    const city = String(payload.city || "").trim();
    const province = String(payload.province || "").trim();
    const ghnProvinceId = payload.ghn_province_id
      ? Number(payload.ghn_province_id)
      : null;
    const ghnDistrictId = payload.ghn_district_id
      ? Number(payload.ghn_district_id)
      : null;
    const ghnWardCode = payload.ghn_ward_code
      ? String(payload.ghn_ward_code).trim()
      : null;

    if (!addressLine || !district || !province) {
      throw new Error("Địa chỉ shop thiếu thông tin bắt buộc");
    }

    return {
      address_line: addressLine,
      ward: ward || null,
      district,
      city: city || null,
      province,
      ghn_province_id: ghnProvinceId,
      ghn_district_id: ghnDistrictId,
      ghn_ward_code: ghnWardCode || null,
    };
  }

  static async getMyStores(userId) {
    try {
      const stores = await Store.findAll({
        where: { owner_id: userId },
        order: [["created_at", "DESC"]],
        include: [
          {
            model: User,
            as: "owner",
            attributes: ["id", "username", "email"],
          },
        ],
      });

      return stores;
    } catch (error) {
      throw error;
    }
  }

  static async getStoreById(storeId) {
    const id = Number(storeId);
    if (!id) throw new Error("ID cửa hàng không hợp lệ");

    const store = await Store.findByPk(id, {
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["id", "username", "email", "phone"],
        },
      ],
    });
    if (!store) {
      throw new Error("Cửa hàng không tồn tại");
    }

    const listingStatuses = ["active", "sold_out", "inactive", "pending"];
    const productsCount = await Product.count({
      where: {
        store_id: id,
        status: { [Op.in]: listingStatuses },
      },
    });
    const activeProducts = await Product.count({
      where: { store_id: id, status: "active" },
    });
    const soldCount =
      (await Product.sum("buyturn", {
        where: { store_id: id, status: { [Op.in]: listingStatuses } },
      })) || 0;

    return {
      ...store.toJSON(),
      stats: {
        products_count: Number(productsCount || 0),
        active_products: Number(activeProducts || 0),
        sold_count: Number(soldCount || 0),
      },
    };
  }

  static async updateMyStoreAddress(userId, storeId, payload = {}) {
    const id = Number(storeId);
    if (!id) throw new Error("ID cửa hàng không hợp lệ");
    const data = this.normalizeAddressPayload(payload);

    const store = await Store.findOne({
      where: { id, owner_id: userId },
    });
    if (!store) throw new Error("Không tìm thấy cửa hàng hoặc không có quyền");

    await store.update(data);
    return store;
  }

  static async updateMyStoreProfile(userId, storeId, payload = {}) {
    const id = Number(storeId);
    if (!id) throw new Error("ID cửa hàng không hợp lệ");

    const store = await Store.findOne({
      where: { id, owner_id: userId },
    });
    if (!store) throw new Error("Không tìm thấy cửa hàng hoặc không có quyền");

    const updates = {};

    if (payload.name !== undefined) {
      const name = String(payload.name || "").trim();
      if (!name) throw new Error("Tên cửa hàng không được để trống");
      updates.name = name.slice(0, 100);
    }

    if (payload.description !== undefined) {
      updates.description = String(payload.description || "").trim() || null;
    }

    if (payload.logo !== undefined) {
      updates.logo = StoreService.normalizeOptionalUrl(payload.logo);
    }

    if (payload.banner !== undefined) {
      updates.banner = StoreService.normalizeOptionalUrl(payload.banner);
    }

    if (Object.keys(updates).length === 0) {
      throw new Error("Không có thông tin hợp lệ để cập nhật");
    }

    await store.update(updates);
    return store;
  }

  static async registerMyStoreWithGhn(userId, storeId) {
    const id = Number(storeId);
    if (!id) throw new Error("ID cửa hàng không hợp lệ");

    const store = await Store.findOne({
      where: { id, owner_id: userId },
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["id", "username", "phone"],
        },
      ],
    });
    if (!store) throw new Error("Không tìm thấy cửa hàng hoặc không có quyền");
    if (store.ghn_shop_id) {
      return { store, created: false, ghn_shop_id: Number(store.ghn_shop_id) };
    }
    if (!store.address_line || !store.ghn_district_id || !store.ghn_ward_code) {
      throw new Error("Vui lòng cập nhật địa chỉ shop GHN trước khi tạo GHN shop");
    }

    const shopName = String(store.name || "").trim();
    const shopPhone = String(store.owner?.phone || "").trim();
    if (!shopPhone) {
      throw new Error("Tài khoản shop chưa có số điện thoại để đăng ký GHN");
    }

    const ghn = await GhnService.registerShop({
      name: shopName,
      phone: shopPhone,
      address: String(store.address_line || "").trim(),
      district_id: Number(store.ghn_district_id),
      ward_code: String(store.ghn_ward_code || "").trim(),
    });
    const ghnShopId = Number(ghn?.shop_id || ghn?.shopid || 0);
    if (!ghnShopId) {
      throw new Error("GHN không trả về shop_id sau khi tạo shop");
    }

    await store.update({ ghn_shop_id: ghnShopId });
    return { store, created: true, ghn_shop_id: ghnShopId };
  }
}

module.exports = StoreService;

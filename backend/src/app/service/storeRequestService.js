const { sequelize, StoreRequest, Store, User } = require("../../models");
const GhnService = require("./ghnService");

/**
 * Store Request Service - Xử lý nghiệp vụ yêu cầu mở cửa hàng
 */
class StoreRequestService {
  /**
   * Tạo yêu cầu mở cửa hàng
   * @param {number} userId
   * @param {object} payload
   * @returns {Promise<object>}
   */
  static async createRequest(userId, payload) {
    try {
      const user = await User.findByPk(userId, {
        attributes: ["id", "role"],
      });
      if (!user) {
        throw new Error("Người dùng không tồn tại");
      }
      if (String(user.role) !== "user") {
        throw new Error("Chỉ tài khoản user mới được tạo yêu cầu mở shop");
      }

      const existingStore = await Store.findOne({
        where: { owner_id: userId },
      });
      if (existingStore) {
        throw new Error("Bạn đã có cửa hàng");
      }

      const existingRequest = await StoreRequest.findOne({
        where: { user_id: userId },
      });
      if (existingRequest) {
        throw new Error("Bạn chỉ được tạo yêu cầu mở shop một lần");
      }

      if (!payload.address_line || !payload.district || !payload.province) {
        throw new Error("Địa chỉ shop là bắt buộc");
      }
      if (!payload.ghn_district_id || !payload.ghn_ward_code) {
        throw new Error("Vui lòng chọn đầy đủ địa chỉ GHN (quận/phường)");
      }
      if (!payload.contact_phone) {
        throw new Error("Số điện thoại liên hệ là bắt buộc");
      }

      const request = await StoreRequest.create({
        user_id: userId,
        store_name: payload.store_name,
        store_description: payload.store_description,
        contact_phone: payload.contact_phone,
        address_line: payload.address_line,
        ward: payload.ward || null,
        district: payload.district,
        city: payload.city || null,
        province: payload.province,
        ghn_province_id: payload.ghn_province_id || null,
        ghn_district_id: payload.ghn_district_id,
        ghn_ward_code: payload.ghn_ward_code,
        status: "pending",
      });

      return request;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy danh sách yêu cầu của user
   * @param {number} userId
   * @param {string} status
   * @param {number} limit
   * @param {number} offset
   * @returns {Promise<object>}
   */
  static async getUserRequests(userId, status, limit = 10, offset = 0) {
    try {
      const whereClause = { user_id: userId };
      if (status && status !== "all") {
        whereClause.status = status;
      }

      const { count, rows } = await StoreRequest.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [["created_at", "DESC"]],
        include: [
          {
            model: User,
            as: "admin",
            attributes: ["id", "username"],
          },
          {
            model: Store,
            as: "store",
            attributes: ["id", "name", "rating"],
          },
        ],
      });

      return {
        total: count,
        requests: rows,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(count / limit),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy danh sách yêu cầu mở cửa hàng cho admin
   * @param {string} status
   * @param {number} limit
   * @param {number} offset
   * @returns {Promise<object>}
   */
  static async getRequests(status, limit = 10, offset = 0) {
    try {
      const whereClause = {};
      if (status && status !== "all") {
        whereClause.status = status;
      }

      const { count, rows } = await StoreRequest.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [["created_at", "DESC"]],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "username", "email"],
          },
          {
            model: User,
            as: "admin",
            attributes: ["id", "username"],
          },
          {
            model: Store,
            as: "store",
            attributes: ["id", "name", "rating"],
          },
        ],
      });

      return {
        total: count,
        requests: rows,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(count / limit),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Duyệt yêu cầu mở cửa hàng
   * @param {number} requestId
   * @param {number} adminId
   * @returns {Promise<object>}
   */
  static async approveRequest(requestId, adminId) {
    try {
      return sequelize.transaction(async (transaction) => {
        const request = await StoreRequest.findByPk(requestId, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (!request) {
          throw new Error("Yêu cầu không tồn tại");
        }
        if (request.status !== "pending") {
          throw new Error("Yêu cầu đã được xử lý");
        }

        const user = await User.findByPk(request.user_id, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (!user) throw new Error("Không tìm thấy người dùng tạo yêu cầu");
        if (!request.contact_phone && !user.phone) {
          throw new Error("Thiếu số điện thoại để đăng ký GHN");
        }

        const store = await Store.create(
          {
            owner_id: request.user_id,
            name: request.store_name,
            description: request.store_description,
            address_line: request.address_line,
            ward: request.ward,
            district: request.district,
            city: request.city,
            province: request.province,
            ghn_province_id: request.ghn_province_id,
            ghn_district_id: request.ghn_district_id,
            ghn_ward_code: request.ghn_ward_code,
          },
          { transaction },
        );

        const registerResult = await GhnService.registerShop({
          name: request.store_name,
          phone: request.contact_phone || user.phone,
          address: request.address_line,
          ward: request.ward,
          district: request.district,
          province: request.province,
          district_id: request.ghn_district_id,
          ward_code: request.ghn_ward_code,
        });
        const ghnShopId = Number(
          registerResult?.shop_id || registerResult?.shopid || 0,
        );
        if (!ghnShopId) {
          throw new Error("GHN không trả về shop_id khi tạo shop");
        }

        await store.update({ ghn_shop_id: ghnShopId }, { transaction });

        // Không ép cập nhật phone của user ở bước duyệt shop để tránh lỗi
        // unique phone (nếu số này đã thuộc tài khoản khác).
        if (user.role !== "admin" && user.role !== "shop") {
          await user.update({ role: "shop" }, { transaction });
        }

        await request.update(
          {
            status: "approved",
            admin_id: adminId,
            store_id: store.id,
          },
          { transaction },
        );

        return { request, store };
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Từ chối yêu cầu mở cửa hàng
   * @param {number} requestId
   * @param {number} adminId
   * @param {string} note
   * @returns {Promise<object>}
   */
  static async rejectRequest(requestId, adminId, note) {
    try {
      const request = await StoreRequest.findByPk(requestId);
      if (!request) {
        throw new Error("Yêu cầu không tồn tại");
      }
      if (request.status !== "pending") {
        throw new Error("Yêu cầu đã được xử lý");
      }

      await request.update({
        status: "rejected",
        admin_id: adminId,
        admin_note: note || null,
      });

      return request;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = StoreRequestService;

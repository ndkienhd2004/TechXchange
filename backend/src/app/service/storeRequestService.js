const { StoreRequest, Store, User } = require("../../models");

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
      const existingStore = await Store.findOne({
        where: { owner_id: userId },
      });
      if (existingStore) {
        throw new Error("Bạn đã có cửa hàng");
      }

      const pendingRequest = await StoreRequest.findOne({
        where: { user_id: userId, status: "pending" },
      });
      if (pendingRequest) {
        throw new Error("Bạn đã có yêu cầu đang chờ duyệt");
      }

      const request = await StoreRequest.create({
        user_id: userId,
        store_name: payload.store_name,
        store_description: payload.store_description,
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
      const request = await StoreRequest.findByPk(requestId);
      if (!request) {
        throw new Error("Yêu cầu không tồn tại");
      }
      if (request.status !== "pending") {
        throw new Error("Yêu cầu đã được xử lý");
      }

      const store = await Store.create({
        owner_id: request.user_id,
        name: request.store_name,
        description: request.store_description,
      });

      const user = await User.findByPk(request.user_id);
      if (user && user.role !== "admin" && user.role !== "shop") {
        await user.update({ role: "shop" });
      }

      await request.update({
        status: "approved",
        admin_id: adminId,
        store_id: store.id,
      });

      return { request, store };
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

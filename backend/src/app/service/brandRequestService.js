const { Op } = require("sequelize");
const { BrandRequest, Brand, User } = require("../../models");

/**
 * Brand Request Service - Xử lý nghiệp vụ yêu cầu tạo brand
 */
class BrandRequestService {
  /**
   * Tạo yêu cầu brand mới
   * @param {number} requesterId
   * @param {object} payload
   * @returns {Promise<object>}
   */
  static async createRequest(requesterId, payload) {
    const { name, image } = payload;

    try {
      const existingBrand = await Brand.findOne({
        where: { name: { [Op.iLike]: name } },
      });
      if (existingBrand) {
        throw new Error("Thương hiệu đã tồn tại");
      }

      const existingRequest = await BrandRequest.findOne({
        where: {
          name: { [Op.iLike]: name },
          status: "pending",
        },
      });
      if (existingRequest) {
        throw new Error("Yêu cầu thương hiệu đang chờ duyệt");
      }

      const request = await BrandRequest.create({
        requester_id: requesterId,
        name,
        image: image || null,
      });

      return request;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy danh sách yêu cầu của shop
   * @param {number} requesterId
   * @param {string} status
   * @param {number} limit
   * @param {number} offset
   * @returns {Promise<object>}
   */
  static async getMyRequests(requesterId, status, limit, offset) {
    try {
      const whereClause = { requester_id: requesterId };
      if (status && status !== "all") {
        whereClause.status = status;
      }

      const { count, rows } = await BrandRequest.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [["created_at", "DESC"]],
        include: [
          {
            model: Brand,
            as: "brand",
            attributes: ["id", "name", "image"],
          },
          {
            model: User,
            as: "admin",
            attributes: ["id", "username"],
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
   * Admin: Lấy danh sách yêu cầu brand
   * @param {string} status
   * @param {number} limit
   * @param {number} offset
   * @returns {Promise<object>}
   */
  static async getRequests(status, limit, offset) {
    try {
      const whereClause = {};
      if (status && status !== "all") {
        whereClause.status = status;
      }

      const { count, rows } = await BrandRequest.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [["created_at", "DESC"]],
        include: [
          {
            model: User,
            as: "requester",
            attributes: ["id", "username", "email"],
          },
          {
            model: Brand,
            as: "brand",
            attributes: ["id", "name", "image"],
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
   * Admin: Duyệt yêu cầu brand
   * @param {number} requestId
   * @param {number} adminId
   * @returns {Promise<object>}
   */
  static async approveRequest(requestId, adminId) {
    try {
      const request = await BrandRequest.findByPk(requestId);
      if (!request) {
        throw new Error("Yêu cầu không tồn tại");
      }
      if (request.status !== "pending") {
        throw new Error("Yêu cầu đã được xử lý");
      }

      const existingBrand = await Brand.findOne({
        where: { name: { [Op.iLike]: request.name } },
      });
      if (existingBrand) {
        throw new Error("Thương hiệu đã tồn tại");
      }

      const brand = await Brand.create({
        name: request.name,
        image: request.image || null,
      });

      await request.update({
        status: "approved",
        admin_id: adminId,
        brand_id: brand.id,
      });

      return { request, brand };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Admin: Từ chối yêu cầu brand
   * @param {number} requestId
   * @param {number} adminId
   * @param {string} note
   * @returns {Promise<object>}
   */
  static async rejectRequest(requestId, adminId, note) {
    try {
      const request = await BrandRequest.findByPk(requestId);
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

module.exports = BrandRequestService;

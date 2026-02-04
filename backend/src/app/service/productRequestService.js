const { Op } = require("sequelize");
const {
  ProductRequest,
  ProductCatalog,
  ProductCategory,
  Brand,
  User,
  sequelize,
} = require("../../models");

class ProductRequestService {
  static async createRequest(requesterId, payload) {
    const {
      name,
      category_id,
      brand_id,
      brand_name,
      description,
      specs,
      default_image,
    } = payload;

    try {
      const category = await ProductCategory.findByPk(category_id);
      if (!category) {
        throw new Error("Danh mục không tồn tại");
      }

      let resolvedBrandId = brand_id || null;
      let resolvedBrandName = brand_name ? String(brand_name).trim() : null;

      if (resolvedBrandId) {
        const brand = await Brand.findByPk(resolvedBrandId);
        if (!brand) {
          throw new Error("Thương hiệu không tồn tại");
        }
        resolvedBrandName = null;
      } else if (resolvedBrandName) {
        const existingBrand = await Brand.findOne({
          where: { name: { [Op.iLike]: resolvedBrandName } },
        });
        if (existingBrand) {
          resolvedBrandId = existingBrand.id;
          resolvedBrandName = null;
        }
      }

      const existingCatalog = await ProductCatalog.findOne({
        where: {
          name: { [Op.iLike]: name },
          category_id,
          ...(resolvedBrandId ? { brand_id: resolvedBrandId } : {}),
        },
      });
      if (existingCatalog) {
        throw new Error("Sản phẩm đã có trong catalog");
      }

      const existingRequest = await ProductRequest.findOne({
        where: {
          name: { [Op.iLike]: name },
          category_id,
          status: "pending",
          ...(resolvedBrandId ? { brand_id: resolvedBrandId } : {}),
          ...(resolvedBrandName ? { brand_name: { [Op.iLike]: resolvedBrandName } } : {}),
        },
      });
      if (existingRequest) {
        throw new Error("Yêu cầu sản phẩm đang chờ duyệt");
      }

      const request = await ProductRequest.create({
        requester_id: requesterId,
        name,
        category_id,
        brand_id: resolvedBrandId,
        brand_name: resolvedBrandName,
        description: description || null,
        specs: specs || null,
        default_image: default_image || null,
      });

      return request;
    } catch (error) {
      throw error;
    }
  }

  static async getMyRequests(requesterId, status, limit, offset) {
    try {
      const whereClause = { requester_id: requesterId };
      if (status && status !== "all") {
        whereClause.status = status;
      }

      const { count, rows } = await ProductRequest.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [["created_at", "DESC"]],
        include: [
          { model: Brand, as: "brand", attributes: ["id", "name", "image"] },
          { model: User, as: "admin", attributes: ["id", "username"] },
          { model: ProductCategory, as: "category", attributes: ["id", "name"] },
          { model: ProductCatalog, as: "catalog", attributes: ["id", "name"] },
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

  static async getRequests(status, limit, offset) {
    try {
      const whereClause = {};
      if (status && status !== "all") {
        whereClause.status = status;
      }

      const { count, rows } = await ProductRequest.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [["created_at", "DESC"]],
        include: [
          { model: User, as: "requester", attributes: ["id", "username", "email"] },
          { model: Brand, as: "brand", attributes: ["id", "name", "image"] },
          { model: ProductCategory, as: "category", attributes: ["id", "name"] },
          { model: ProductCatalog, as: "catalog", attributes: ["id", "name"] },
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

  static async approveRequest(requestId, adminId) {
    try {
      return await sequelize.transaction(async (transaction) => {
        const request = await ProductRequest.findByPk(requestId, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (!request) {
          throw new Error("Yêu cầu không tồn tại");
        }
        if (request.status !== "pending") {
          throw new Error("Yêu cầu đã được xử lý");
        }

        let brandId = request.brand_id || null;
        if (!brandId && request.brand_name) {
          const existingBrand = await Brand.findOne({
            where: { name: { [Op.iLike]: request.brand_name } },
            transaction,
          });
          if (existingBrand) {
            brandId = existingBrand.id;
          } else {
            const createdBrand = await Brand.create(
              { name: request.brand_name },
              { transaction }
            );
            brandId = createdBrand.id;
          }
        }

        const existingCatalog = await ProductCatalog.findOne({
          where: {
            name: { [Op.iLike]: request.name },
            category_id: request.category_id,
            ...(brandId ? { brand_id: brandId } : {}),
          },
          transaction,
        });
        if (existingCatalog) {
          throw new Error("Sản phẩm đã có trong catalog");
        }

        const catalog = await ProductCatalog.create(
          {
            name: request.name,
            category_id: request.category_id,
            brand_id: brandId,
            description: request.description || null,
            specs: request.specs || null,
            default_image: request.default_image || null,
            status: "active",
          },
          { transaction }
        );

        await request.update(
          {
            status: "approved",
            admin_id: adminId,
            catalog_id: catalog.id,
            brand_id: brandId,
          },
          { transaction }
        );

        return { request, catalog };
      });
    } catch (error) {
      throw error;
    }
  }

  static async rejectRequest(requestId, adminId, note) {
    try {
      const request = await ProductRequest.findByPk(requestId);
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

module.exports = ProductRequestService;

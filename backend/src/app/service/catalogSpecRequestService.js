const { Op } = require("sequelize");
const {
  CatalogSpecRequest,
  ProductCatalog,
  User,
  sequelize,
} = require("../../models");

const normalizeSpecKey = (value) => String(value || "").trim().toLowerCase();

const normalizeValues = (values) => {
  const raw = Array.isArray(values) ? values : [values];
  const mapped = raw
    .map((item) => String(item ?? "").trim())
    .filter(Boolean);
  return [...new Set(mapped)];
};

const parseCatalogSpecValues = (value) => {
  if (Array.isArray(value)) {
    return normalizeValues(value);
  }
  if (typeof value === "string") {
    return normalizeValues(value.split(/[,;|]/g));
  }
  if (value === null || value === undefined) {
    return [];
  }
  return normalizeValues([value]);
};

class CatalogSpecRequestService {
  static async createRequest(requesterId, payload) {
    const catalog_id = Number(payload.catalog_id);
    const spec_key = normalizeSpecKey(payload.spec_key);
    const proposed_values = normalizeValues(payload.proposed_values);

    if (!catalog_id || !spec_key || proposed_values.length === 0) {
      throw new Error("Thiếu thông tin yêu cầu specs");
    }

    const catalog = await ProductCatalog.findByPk(catalog_id);
    if (!catalog) {
      throw new Error("Catalog không tồn tại");
    }
    if (catalog.status !== "active") {
      throw new Error("Catalog chưa khả dụng để đề xuất specs");
    }

    const pending = await CatalogSpecRequest.findOne({
      where: {
        requester_id: requesterId,
        catalog_id,
        spec_key,
        status: "pending",
      },
    });
    if (pending) {
      throw new Error("Đã có yêu cầu specs đang chờ duyệt");
    }

    const existingSpecs =
      catalog.specs && typeof catalog.specs === "object" ? catalog.specs : {};
    const existingValues = parseCatalogSpecValues(existingSpecs[spec_key]);
    const allAlreadyExist = proposed_values.every((value) =>
      existingValues.includes(value)
    );
    if (allAlreadyExist) {
      throw new Error("Thông số này đã có đủ giá trị trong catalog");
    }

    return CatalogSpecRequest.create({
      requester_id: requesterId,
      catalog_id,
      spec_key,
      proposed_values,
    });
  }

  static async getMyRequests(requesterId, status, limit, offset) {
    const whereClause = { requester_id: requesterId };
    if (status && status !== "all") whereClause.status = status;

    const { count, rows } = await CatalogSpecRequest.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["created_at", "DESC"]],
      include: [{ model: ProductCatalog, as: "catalog", attributes: ["id", "name"] }],
    });

    return {
      total: count,
      requests: rows,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(count / limit),
    };
  }

  static async getRequests({ status, q }, limit, page) {
    const whereClause = {};
    if (status && status !== "all") whereClause.status = status;
    if (q) whereClause.spec_key = { [Op.iLike]: `%${String(q).trim()}%` };

    const offset = (Math.max(page, 1) - 1) * limit;
    const { count, rows } = await CatalogSpecRequest.findAndCountAll({
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
          model: User,
          as: "admin",
          attributes: ["id", "username"],
        },
        {
          model: ProductCatalog,
          as: "catalog",
          attributes: ["id", "name", "status"],
        },
      ],
    });

    return {
      total: count,
      requests: rows,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(count / limit),
    };
  }

  static async approveRequest(requestId, adminId) {
    return sequelize.transaction(async (transaction) => {
      const request = await CatalogSpecRequest.findByPk(requestId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!request) throw new Error("Yêu cầu không tồn tại");
      if (request.status !== "pending") throw new Error("Yêu cầu đã được xử lý");

      const catalog = await ProductCatalog.findByPk(request.catalog_id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!catalog) throw new Error("Catalog không tồn tại");

      const specKey = normalizeSpecKey(request.spec_key);
      const incomingValues = normalizeValues(request.proposed_values);
      const currentSpecs =
        catalog.specs && typeof catalog.specs === "object" ? { ...catalog.specs } : {};
      const currentValues = parseCatalogSpecValues(currentSpecs[specKey]);
      const mergedValues = [...new Set([...currentValues, ...incomingValues])];

      currentSpecs[specKey] = mergedValues.join(" | ");

      await catalog.update({ specs: currentSpecs }, { transaction });
      await request.update(
        { status: "approved", admin_id: adminId },
        { transaction }
      );

      return { request, catalog };
    });
  }

  static async rejectRequest(requestId, adminId, note) {
    const request = await CatalogSpecRequest.findByPk(requestId);
    if (!request) throw new Error("Yêu cầu không tồn tại");
    if (request.status !== "pending") throw new Error("Yêu cầu đã được xử lý");

    await request.update({
      status: "rejected",
      admin_id: adminId,
      admin_note: note || null,
    });

    return request;
  }
}

module.exports = CatalogSpecRequestService;

const { Op } = require("sequelize");
const { ProductCatalog, Product, Brand, ProductCategory } = require("../../models");
const CategoryService = require("./categoryService");

class ProductCatalogService {
  static async getCatalogs(filters = {}, limit = 10, page = 1) {
    const whereClause = {};

    if (filters.statuses && filters.statuses.length > 0) {
      whereClause.status = { [Op.in]: filters.statuses };
    }
    if (filters.category_id) {
      const scopedIds = await CategoryService.getDescendantCategoryIds(
        filters.category_id
      );
      if (scopedIds.length > 0) {
        whereClause.category_id = { [Op.in]: scopedIds };
      } else {
        whereClause.category_id = filters.category_id;
      }
    }
    if (filters.brand_id) whereClause.brand_id = filters.brand_id;
    if (filters.q) whereClause.name = { [Op.iLike]: `%${filters.q}%` };

    const safePage = Number.isInteger(page) && page > 0 ? page : 1;
    const offset = (safePage - 1) * limit;

    const { count, rows } = await ProductCatalog.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["created_at", "DESC"]],
      include: [
        { model: Brand, as: "brand", attributes: ["id", "name", "image"] },
        { model: ProductCategory, as: "category", attributes: ["id", "name"] },
      ],
    });

    return {
      total: count,
      catalogs: rows,
      page: safePage,
      totalPages: Math.ceil(count / limit),
    };
  }

  static async deleteCatalog(catalogId) {
    try {
      const catalog = await ProductCatalog.findByPk(catalogId);
      if (!catalog) {
        throw new Error("Catalog không tồn tại");
      }

      const usedByListing = await Product.findOne({
        where: { catalog_id: catalogId },
      });
      if (usedByListing) {
        throw new Error("Không thể xóa catalog đang được shop sử dụng");
      }

      await catalog.destroy();
      return catalog;
    } catch (error) {
      throw error;
    }
  }

  static async updateCatalog(catalogId, payload = {}) {
    const catalog = await ProductCatalog.findByPk(catalogId);
    if (!catalog) throw new Error("Catalog không tồn tại");

    const patch = {};

    if (payload.name !== undefined) {
      const value = String(payload.name || "").trim();
      if (!value) throw new Error("Tên catalog không hợp lệ");
      patch.name = value;
    }

    if (payload.description !== undefined) {
      patch.description = payload.description ? String(payload.description).trim() : null;
    }

    if (payload.default_image !== undefined) {
      patch.default_image = payload.default_image
        ? String(payload.default_image).trim()
        : null;
    }

    if (payload.msrp !== undefined) {
      const msrp = Number(payload.msrp);
      if (!Number.isFinite(msrp) || msrp < 0) {
        throw new Error("MSRP không hợp lệ");
      }
      patch.msrp = msrp;
    }

    if (payload.specs !== undefined) {
      patch.specs =
        payload.specs && typeof payload.specs === "object" ? payload.specs : null;
    }

    if (payload.status !== undefined) {
      const allowed = new Set([
        "draft",
        "pending",
        "active",
        "inactive",
        "rejected",
        "sold_out",
        "deleted",
      ]);
      const next = String(payload.status).trim();
      if (!allowed.has(next)) throw new Error("Trạng thái catalog không hợp lệ");
      patch.status = next;
    }

    if (payload.brand_id !== undefined) {
      const brandId = Number(payload.brand_id);
      if (!Number.isFinite(brandId) || brandId <= 0) {
        throw new Error("brand_id không hợp lệ");
      }
      const brand = await Brand.findByPk(brandId);
      if (!brand) throw new Error("Thương hiệu không tồn tại");
      patch.brand_id = brandId;
    }

    if (payload.category_id !== undefined) {
      const categoryId = Number(payload.category_id);
      if (!Number.isFinite(categoryId) || categoryId <= 0) {
        throw new Error("category_id không hợp lệ");
      }
      const category = await ProductCategory.findByPk(categoryId);
      if (!category) throw new Error("Danh mục không tồn tại");
      patch.category_id = categoryId;
    }

    await catalog.update(patch);

    return ProductCatalog.findByPk(catalog.id, {
      include: [
        { model: Brand, as: "brand", attributes: ["id", "name", "image"] },
        { model: ProductCategory, as: "category", attributes: ["id", "name"] },
      ],
    });
  }

  static async approveCatalog(catalogId) {
    try {
      const catalog = await ProductCatalog.findByPk(catalogId);
      if (!catalog) {
        throw new Error("Catalog không tồn tại");
      }

      await catalog.update({ status: "active" });
      return catalog;
    } catch (error) {
      throw error;
    }
  }

  static async rejectCatalog(catalogId) {
    try {
      const catalog = await ProductCatalog.findByPk(catalogId);
      if (!catalog) {
        throw new Error("Catalog không tồn tại");
      }

      await catalog.update({ status: "rejected" });
      return catalog;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ProductCatalogService;

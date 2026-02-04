const { Op } = require("sequelize");
const { ProductCatalog, Product, Brand, ProductCategory } = require("../../models");

class ProductCatalogService {
  static async getCatalogs(filters = {}, limit = 10, page = 1) {
    const whereClause = {};

    if (filters.statuses && filters.statuses.length > 0) {
      whereClause.status = { [Op.in]: filters.statuses };
    }
    if (filters.category_id) whereClause.category_id = filters.category_id;
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
}

module.exports = ProductCatalogService;

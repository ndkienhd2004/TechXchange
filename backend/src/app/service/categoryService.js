const { Op, QueryTypes } = require("sequelize");
const {
  ProductCategory,
  ProductCatalog,
  Product,
  Brand,
  sequelize,
} = require("../../models");

const slugify = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

class CategoryService {
  static logDeleteEvent(stage, payload = {}) {
    console.log(`[Admin][CategoryDelete][${stage}]`, payload);
  }

  static async getDescendantCategoryIds(categoryId) {
    const id = Number(categoryId);
    if (!id) return [];

    const rows = await sequelize.query(
      `
      WITH RECURSIVE category_tree AS (
        SELECT id, parent_id
        FROM public.product_categories
        WHERE id = :categoryId
        UNION ALL
        SELECT c.id, c.parent_id
        FROM public.product_categories c
        JOIN category_tree ct ON c.parent_id = ct.id
      )
      SELECT id FROM category_tree
      `,
      {
        replacements: { categoryId: id },
        type: QueryTypes.SELECT,
      }
    );

    return rows.map((row) => Number(row.id)).filter(Boolean);
  }

  static buildTree(categories, parentId = null) {
    return categories
      .filter((item) => {
        if (parentId === null) return item.parent_id == null;
        return Number(item.parent_id) === Number(parentId);
      })
      .map((item) => ({
        ...item,
        children: CategoryService.buildTree(categories, item.id),
      }));
  }

  static async getCategories({ activeOnly = true, tree = true } = {}) {
    const whereClause = activeOnly ? { is_active: true } : {};
    const rows = await ProductCategory.findAll({
      where: whereClause,
      order: [
        ["level", "ASC"],
        ["name", "ASC"],
      ],
    });

    const plainRows = rows.map((item) => item.toJSON());
    if (!tree) return plainRows;
    return CategoryService.buildTree(plainRows);
  }

  static async createCategory(payload) {
    const name = String(payload.name || "").trim();
    const parent_id = payload.parent_id ? Number(payload.parent_id) : null;
    if (!name) throw new Error("Tên danh mục là bắt buộc");

    const existedBrand = await Brand.findOne({
      where: { name: { [Op.iLike]: name } },
      attributes: ["id"],
    });
    if (existedBrand) {
      throw new Error("Tên này đang là thương hiệu (brand), không tạo trong categories");
    }

    const slugInput = payload.slug ? String(payload.slug).trim() : name;
    const slug = slugify(slugInput) || `category-${Date.now()}`;
    if (!slug) throw new Error("Slug không hợp lệ");

    let level = 1;
    if (parent_id) {
      const parent = await ProductCategory.findByPk(parent_id);
      if (!parent) throw new Error("Danh mục cha không tồn tại");
      level = Number(parent.level || 1) + 1;
    }

    const existingSlug = await ProductCategory.findOne({ where: { slug } });
    if (existingSlug) throw new Error("Slug đã tồn tại");

    return ProductCategory.create({
      name,
      slug,
      parent_id,
      level,
      is_active: payload.is_active !== false,
    });
  }

  static async deleteCategory(categoryId, options = {}) {
    const id = Number(categoryId);
    const actorId = options.actorId ? Number(options.actorId) : null;
    const context = { categoryId: id, actorId };

    CategoryService.logDeleteEvent("Attempt", context);

    if (!id) throw new Error("ID danh mục không hợp lệ");

    const category = await ProductCategory.findByPk(id);
    if (!category) {
      CategoryService.logDeleteEvent("NotFound", context);
      throw new Error("Danh mục không tồn tại");
    }

    try {
      const [
        childCount,
        catalogUsageCount,
        productUsageCount,
        childSamples,
        catalogSamples,
        productSamples,
      ] = await Promise.all([
        ProductCategory.count({
          where: { parent_id: id },
        }),
        ProductCatalog.count({
          where: { category_id: id },
        }),
        Product.count({
          where: { category_id: id },
        }),
        ProductCategory.findAll({
          where: { parent_id: id },
          attributes: ["id", "name", "slug", "is_active"],
          limit: 5,
          order: [["id", "DESC"]],
        }),
        ProductCatalog.findAll({
          where: { category_id: id },
          attributes: ["id", "name", "status", "brand_id"],
          limit: 5,
          order: [["id", "DESC"]],
        }),
        Product.findAll({
          where: { category_id: id },
          attributes: ["id", "name", "status", "seller_id", "store_id"],
          limit: 5,
          order: [["id", "DESC"]],
        }),
      ]);

      if (childCount > 0 || catalogUsageCount > 0 || productUsageCount > 0) {
        CategoryService.logDeleteEvent("BlockedInUse", {
          ...context,
          categoryName: category.name,
          childCount,
          catalogUsageCount,
          productUsageCount,
          childSamples: childSamples.map((item) => item.toJSON()),
          catalogSamples: catalogSamples.map((item) => item.toJSON()),
          productSamples: productSamples.map((item) => item.toJSON()),
        });

        if (childCount > 0) {
          throw new Error(
            `Không thể xóa danh mục đang có danh mục con (số danh mục con: ${childCount})`
          );
        }
        if (catalogUsageCount > 0 || productUsageCount > 0) {
          throw new Error(
            `Không thể xóa danh mục đang được sử dụng (catalog: ${catalogUsageCount}, sản phẩm: ${productUsageCount})`
          );
        }
      }

      await category.destroy();
      CategoryService.logDeleteEvent("Success", {
        ...context,
        categoryName: category.name,
      });

      return category;
    } catch (error) {
      CategoryService.logDeleteEvent("Error", {
        ...context,
        categoryName: category.name,
        message: error.message,
      });
      throw error;
    }
  }
}

module.exports = CategoryService;

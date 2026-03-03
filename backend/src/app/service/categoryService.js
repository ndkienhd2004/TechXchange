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

  static async deleteCategory(categoryId) {
    const id = Number(categoryId);
    if (!id) throw new Error("ID danh mục không hợp lệ");

    const category = await ProductCategory.findByPk(id);
    if (!category) throw new Error("Danh mục không tồn tại");

    const hasChildren = await ProductCategory.findOne({
      where: { parent_id: id },
      attributes: ["id"],
    });
    if (hasChildren) {
      throw new Error("Không thể xóa danh mục đang có danh mục con");
    }

    const usedInCatalog = await ProductCatalog.findOne({
      where: { category_id: id },
      attributes: ["id"],
    });
    if (usedInCatalog) {
      throw new Error("Không thể xóa danh mục đang được dùng trong catalog");
    }

    const usedInProduct = await Product.findOne({
      where: { category_id: id },
      attributes: ["id"],
    });
    if (usedInProduct) {
      throw new Error("Không thể xóa danh mục đang được dùng trong sản phẩm");
    }

    await category.destroy();
    return category;
  }
}

module.exports = CategoryService;

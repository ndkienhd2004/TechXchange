const { ProductCategory } = require("../../models");
const CategoryService = require("../service/categoryService");
const { response } = require("../utils/response");

class CategoryController {
  static async getCategories(req, res) {
    try {
      const tree = req.query.tree !== "false";
      const activeOnly = req.query.active !== "all";
      const data = await CategoryService.getCategories({ tree, activeOnly });
      return response.success(res, "Lấy danh sách danh mục thành công", data);
    } catch (error) {
      return response.serverError(res, error.message);
    }
  }

  static async createCategory(req, res) {
    try {
      const category = await CategoryService.createCategory(req.body || {});
      return response.created(res, "Tạo danh mục thành công", category);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  static async updateCategory(req, res) {
    try {
      const id = Number(req.params.id);
      if (!id) return response.badRequest(res, "ID danh mục không hợp lệ");

      const category = await ProductCategory.findByPk(id);
      if (!category) return response.notFound(res, "Danh mục không tồn tại");

      const nextName =
        req.body.name !== undefined ? String(req.body.name).trim() : category.name;
      const nextActive =
        req.body.is_active !== undefined
          ? Boolean(req.body.is_active)
          : category.is_active;

      await category.update({
        name: nextName,
        is_active: nextActive,
      });

      return response.success(res, "Cập nhật danh mục thành công", category);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  static async deleteCategory(req, res) {
    try {
      const id = Number(req.params.id);
      if (!id) return response.badRequest(res, "ID danh mục không hợp lệ");

      const deleted = await CategoryService.deleteCategory(id, {
        actorId: req.user?.id,
      });
      return response.success(res, "Xóa danh mục thành công", deleted);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }
}

module.exports = CategoryController;

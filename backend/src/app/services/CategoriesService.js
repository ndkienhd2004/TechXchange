const { ProductCategory } = require("../../models"); // Import from models index
const { Op } = require("sequelize");

class CategoriesService {
  static async getAllCategories() {
    try {
      const categoriesList = await ProductCategory.findAll({
        order: [["createdAt", "DESC"]], // Add default ordering
      });
      return categoriesList;
    } catch (error) {
      console.error("Error in getAllCategories:", error);
      throw new Error("Error fetching categories: " + error.message);
    }
  }

  static async getCategoryById(id) {
    try {
      // Validate ID
      if (!id || isNaN(id)) {
        throw new Error("Invalid category ID");
      }

      const category = await ProductCategory.findByPk(id);
      return category;
    } catch (error) {
      console.error("Error in getCategoryById:", error);
      throw new Error("Error fetching category: " + error.message);
    }
  }

  static async createCategory(data) {
    try {
      // Basic validation
      if (!data.name || data.name.trim() === "") {
        throw new Error("Category name is required");
      }

      const newCategory = await ProductCategory.create(data);
      return newCategory;
    } catch (error) {
      console.error("Error in createCategory:", error);
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new Error("Category name already exists");
      }
      throw new Error("Error creating category: " + error.message);
    }
  }

  static async updateCategory(id, data) {
    try {
      // Validate ID
      if (!id || isNaN(id)) {
        throw new Error("Invalid category ID");
      }

      const [updatedRowsCount] = await ProductCategory.update(data, {
        where: { id },
        returning: true,
      });

      if (updatedRowsCount === 0) {
        return null;
      }

      return await ProductCategory.findByPk(id);
    } catch (error) {
      console.error("Error in updateCategory:", error);
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new Error("Category name already exists");
      }
      throw new Error("Error updating category: " + error.message);
    }
  }

  static async deleteCategory(id) {
    try {
      // Validate ID
      if (!id || isNaN(id)) {
        throw new Error("Invalid category ID");
      }

      const deletedRowsCount = await ProductCategory.destroy({
        where: { id },
      });

      return deletedRowsCount > 0;
    } catch (error) {
      console.error("Error in deleteCategory:", error);
      throw new Error("Error deleting category: " + error.message);
    }
  }

  static async searchCategories(query) {
    try {
      if (!query || query.trim() === "") {
        throw new Error("Search query is required");
      }

      const categoriesList = await ProductCategory.findAll({
        where: {
          name: {
            [Op.iLike]: `%${query.trim()}%`,
          },
        },
        order: [["name", "ASC"]],
      });
      return categoriesList;
    } catch (error) {
      console.error("Error in searchCategories:", error);
      throw new Error("Error searching categories: " + error.message);
    }
  }
  async getCategoriesAlphabetical(req, res) {
    try {
      const categories = await ProductCategory.scope("alphabetical").findAll();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = CategoriesService;

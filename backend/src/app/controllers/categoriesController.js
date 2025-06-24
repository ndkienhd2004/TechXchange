const CategoriesService = require("../services/CategoriesService");

class CategoriesController {
  async getAllCategories(req, res) {
    try {
      const categories = await CategoriesService.getAllCategories();
      if (categories.length === 0) {
        return res.status(404).json({ message: "No categories found" });
      }
      res.status(200).json(categories);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching categories", error: error.message });
    }
  }

  async getCategoryById(req, res) {
    try {
      const category = await CategoriesService.getCategoryById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.status(200).json(category);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching category", error: error.message });
    }
  }

  async createCategory(req, res) {
    try {
      const newCategory = await CategoriesService.createCategory(req.body);
      res.status(201).json(newCategory);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error creating category", error: error.message });
    }
  }

  async updateCategory(req, res) {
    try {
      const updatedCategory = await CategoriesService.updateCategory(
        req.params.id,
        req.body
      );
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.status(200).json(updatedCategory);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating category", error: error.message });
    }
  }

  async deleteCategory(req, res) {
    try {
      const result = await CategoriesService.deleteCategory(req.params.id);
      if (!result) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error deleting category", error: error.message });
    }
  }

  async searchCategories(req, res) {
    try {
      const query = req.query.q || req.query.search;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      const categories = await CategoriesService.searchCategories(query);
      res.status(200).json(categories);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error searching categories", error: error.message });
    }
  }
  async getCategoriesAlphabetical(req, res) {
    try {
      const categories = await CategoriesService.getCategoriesAlphabetical();
      if (categories.length === 0) {
        return res.status(404).json({ message: "No categories found" });
      }
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({
        message: "Error fetching alphabetical categories",
        error: error.message,
      });
    }
  }
}

module.exports = new CategoriesController();

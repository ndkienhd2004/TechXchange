const express = require("express");
const route = express.Router();
const categoriesController = require("../app/controllers/categoriesController");

route.get("/", categoriesController.getAllCategories);
route.get("/:id", categoriesController.getCategoryById);
route.post("/", categoriesController.createCategory);
route.put("/:id", categoriesController.updateCategory);
route.delete("/:id", categoriesController.deleteCategory);
route.get("/list/alphabetical", categoriesController.getCategoriesAlphabetical);

module.exports = route;

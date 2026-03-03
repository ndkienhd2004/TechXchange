const express = require("express");
const router = express.Router();
const CategoryController = require("../app/controller/categoryController");

/**
 * @swagger
 * /categories:
 *   get:
 *     tags:
 *       - Category
 *     summary: Lấy danh sách danh mục
 *     parameters:
 *       - in: query
 *         name: tree
 *         schema:
 *           type: boolean
 *           default: true
 *       - in: query
 *         name: active
 *         schema:
 *           type: string
 *           example: all
 */
router.get("/", CategoryController.getCategories);

module.exports = router;

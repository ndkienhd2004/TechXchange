const express = require("express");
const router = express.Router();
const ProductController = require("../app/controller/productController");
const { authMiddleware, shopMiddleware } = require("../app/middleware/auth");

/**
 * @swagger
 * /products:
 *   get:
 *     tags:
 *       - Product
 *     summary: Lấy danh sách sản phẩm
 *     description: Lấy danh sách sản phẩm công khai
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng bản ghi
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Vị trí bắt đầu
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         description: Lọc theo danh mục
 *       - in: query
 *         name: brand_id
 *         schema:
 *           type: integer
 *         description: Lọc theo thương hiệu
 *       - in: query
 *         name: store_id
 *         schema:
 *           type: integer
 *         description: Lọc theo cửa hàng
 *       - in: query
 *         name: seller_id
 *         schema:
 *           type: integer
 *         description: Lọc theo người bán
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           example: active
 *         description: Trạng thái sản phẩm (mặc định active, dùng "all" để bỏ lọc)
 *       - in: query
 *         name: min_price
 *         schema:
 *           type: number
 *         description: Giá tối thiểu
 *       - in: query
 *         name: max_price
 *         schema:
 *           type: number
 *         description: Giá tối đa
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Tìm theo tên sản phẩm
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [created_at, updated_at, price, rating]
 *           default: created_at
 *         description: Trường sắp xếp
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Thứ tự sắp xếp
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *                     page:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", ProductController.getProducts);

/**
 * @swagger
 * /products:
 *   post:
 *     tags:
 *       - Product
 *     summary: Tạo sản phẩm mới
 *     description: Tạo sản phẩm mới (shop only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category_id
 *               - store_id
 *               - name
 *               - price
 *               - quantity
 *             properties:
 *               category_id:
 *                 type: integer
 *               store_id:
 *                 type: integer
 *               brand_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               quality:
 *                 type: string
 *               condition_percent:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     sort_order:
 *                       type: integer
 *               attributes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     attr_key:
 *                       type: string
 *                     attr_value:
 *                       type: string
 *     responses:
 *       201:
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post("/", authMiddleware, shopMiddleware, ProductController.createProduct);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     tags:
 *       - Product
 *     summary: Lấy chi tiết sản phẩm
 *     description: Lấy thông tin chi tiết của một sản phẩm
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID sản phẩm
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           example: active
 *         description: Trạng thái sản phẩm (mặc định active, dùng "all" để bỏ lọc)
 *     responses:
 *       200:
 *         description: Lấy chi tiết thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Sản phẩm không tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", ProductController.getProductById);

module.exports = router;

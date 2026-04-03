const express = require("express");
const router = express.Router();
const ProductController = require("../app/controller/productController");
const ProductCatalogController = require("../app/controller/productCatalogController");
const ProductRequestController = require("../app/controller/productRequestController");
const CatalogSpecRequestController = require("../app/controller/catalogSpecRequestController");
const {
  authMiddleware,
  shopMiddleware,
  optionalAuthMiddleware,
} = require("../app/middleware/auth");

/**
 * @swagger
 * /products:
 *   get:
 *     tags:
 *       - Product
 *     summary: Lấy danh sách sản phẩm
 *     description: Lấy danh sách sản phẩm công khai (trả kèm catalog.brand và catalog.category)
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng bản ghi
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Trang hiện tại
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
 *         $ref: '#/components/responses/Ok200'
 *       500:
 *         $ref: '#/components/responses/ServerError500'
 */
router.get("/", optionalAuthMiddleware, ProductController.getProducts);

/**
 * @swagger
 * /products/me:
 *   get:
 *     tags:
 *       - Product
 *     summary: Lấy danh sách sản phẩm của shop
 *     description: Shop lấy danh sách listing của chính mình
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: brand_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: store_id
 *         schema:
 *           type: integer
 *         description: Lọc theo cửa hàng của shop
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           example: active
 *         description: Trạng thái sản phẩm (mặc định active, dùng \"all\" để bỏ lọc)
 *       - in: query
 *         name: min_price
 *         schema:
 *           type: number
 *       - in: query
 *         name: max_price
 *         schema:
 *           type: number
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [created_at, updated_at, price, rating]
 *           default: created_at
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Ok200'
 *       401:
 *         $ref: '#/components/responses/Unauthorized401'
 *       403:
 *         $ref: '#/components/responses/Forbidden403'
 *       500:
 *         $ref: '#/components/responses/ServerError500'
 */
router.get(
  "/me",
  authMiddleware,
  shopMiddleware,
  ProductController.getMyProducts
);

/**
 * @swagger
 * /products/catalogs:
 *   get:
 *     tags:
 *       - Product
 *     summary: Lấy danh sách catalog
 *     description: Danh sách sản phẩm chuẩn để shop chọn
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: brand_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           example: active
 *         description: Trạng thái catalog (mặc định active, dùng \"all\" để bỏ lọc)
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Ok200'
 *       500:
 *         $ref: '#/components/responses/ServerError500'
 */
router.get("/catalogs", ProductCatalogController.getCatalogs);

/**
 * @swagger
 * /products:
 *   post:
 *     tags:
 *       - Product
 *     summary: Tạo listing từ catalog
 *     description: Shop chọn sản phẩm từ catalog và tạo listing (shop only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - catalog_id
 *               - store_id
 *               - price
 *               - quantity
 *             properties:
 *               catalog_id:
 *                 type: integer
 *               store_id:
 *                 type: integer
 *               price:
 *                 type: number
 *               quantity:
 *                 type: integer
 *               description:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     sort_order:
 *                       type: integer
 *               variant_options:
 *                 type: object
 *                 additionalProperties:
 *                   type: string
 *               serial_code:
 *                 type: string
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Created201'
 *       400:
 *         $ref: '#/components/responses/BadRequest400'
 *       401:
 *         $ref: '#/components/responses/Unauthorized401'
 *       403:
 *         $ref: '#/components/responses/Forbidden403'
 */
router.post(
  "/",
  authMiddleware,
  shopMiddleware,
  ProductController.createProduct
);

 

/**
 * @swagger
 * /products/requests:
 *   post:
 *     tags:
 *       - Product
 *     summary: Gửi yêu cầu tạo sản phẩm mới
 *     description: Shop gửi yêu cầu tạo sản phẩm mới (shop only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category_id
 *               - brand_id
 *             properties:
 *               name:
 *                 type: string
 *               category_id:
 *                 type: integer
 *               brand_id:
 *                 type: integer
 *               brand_name:
 *                 type: string
 *               description:
 *                 type: string
 *               specs:
 *                 type: object
 *               default_image:
 *                 type: string
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Created201'
 *       400:
 *         $ref: '#/components/responses/BadRequest400'
 *       401:
 *         $ref: '#/components/responses/Unauthorized401'
 *       403:
 *         $ref: '#/components/responses/Forbidden403'
 */
router.post(
  "/requests",
  authMiddleware,
  shopMiddleware,
  ProductRequestController.createRequest
);

/**
 * @swagger
 * /products/requests/me:
 *   get:
 *     tags:
 *       - Product
 *     summary: Danh sách yêu cầu sản phẩm của shop
 *     description: Shop xem lịch sử yêu cầu (shop only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           example: pending
 *         description: Trạng thái yêu cầu (all để bỏ lọc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Ok200'
 *       401:
 *         $ref: '#/components/responses/Unauthorized401'
 *       403:
 *         $ref: '#/components/responses/Forbidden403'
 *       500:
 *         $ref: '#/components/responses/ServerError500'
 */
router.get(
  "/requests/me",
  authMiddleware,
  shopMiddleware,
  ProductRequestController.getMyRequests
);

/**
 * @swagger
 * /products/catalog-spec-requests:
 *   post:
 *     tags:
 *       - Product
 *     summary: Gửi yêu cầu thêm specs cho catalog
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - catalog_id
 *               - spec_key
 *               - proposed_values
 *             properties:
 *               catalog_id:
 *                 type: integer
 *               spec_key:
 *                 type: string
 *               proposed_values:
 *                 type: array
 *                 items:
 *                   type: string
 *   get:
 *     tags:
 *       - Product
 *     summary: Danh sách yêu cầu specs của shop
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           example: pending
 */
router.post(
  "/catalog-spec-requests",
  authMiddleware,
  shopMiddleware,
  CatalogSpecRequestController.createRequest
);
router.get(
  "/catalog-spec-requests",
  authMiddleware,
  shopMiddleware,
  CatalogSpecRequestController.getMyRequests
);

/**
 * @swagger
 * /products/recommendations/me:
 *   get:
 *     tags:
 *       - Product
 *     summary: Lấy danh sách gợi ý cá nhân cho user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 8
 *       - in: query
 *         name: mode
 *         schema:
 *           type: string
 *           enum: [hybrid, content, collaborative]
 */
router.get(
  "/recommendations/me",
  authMiddleware,
  ProductController.getMyRecommendations,
);

/**
 * @swagger
 * /products/{id}/recommendations:
 *   get:
 *     tags:
 *       - Product
 *     summary: Lấy danh sách gợi ý sản phẩm tương tự
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 8
 *       - in: query
 *         name: mode
 *         schema:
 *           type: string
 *           enum: [content, collaborative]
 */
router.get(
  "/:id/recommendations",
  optionalAuthMiddleware,
  ProductController.getProductRecommendations,
);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     tags:
 *       - Product
 *     summary: Lấy chi tiết sản phẩm
 *     description: Lấy thông tin chi tiết của một sản phẩm (trả kèm catalog.brand và catalog.category)
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
 *         $ref: '#/components/responses/Ok200'
 *       400:
 *         $ref: '#/components/responses/BadRequest400'
 *       404:
 *         $ref: '#/components/responses/NotFound404'
 */
router.get("/:id", optionalAuthMiddleware, ProductController.getProductById);

router.put(
  "/:id",
  authMiddleware,
  shopMiddleware,
  ProductController.updateListing,
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     tags:
 *       - Product
 *     summary: Xóa listing của shop
 *     description: Shop xóa listing của chính mình (shop only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID sản phẩm
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Ok200'
 *       400:
 *         $ref: '#/components/responses/BadRequest400'
 *       401:
 *         $ref: '#/components/responses/Unauthorized401'
 *       403:
 *         $ref: '#/components/responses/Forbidden403'
 */
router.delete(
  "/:id",
  authMiddleware,
  shopMiddleware,
  ProductController.deleteListing
);

module.exports = router;

const express = require("express");
const router = express.Router();
const UserController = require("../app/controller/userController");
const StoreRequestController = require("../app/controller/storeRequestController");
const ProductController = require("../app/controller/productController");
const BrandController = require("../app/controller/brandController");
const BrandRequestController = require("../app/controller/brandRequestController");
const BannerController = require("../app/controller/bannerController");
const { authMiddleware, adminMiddleware } = require("../app/middleware/auth");

/**
 * @swagger
 * /admin/users:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Lấy danh sách người dùng
 *     description: Lấy danh sách tất cả người dùng (admin only)
 *     security:
 *       - bearerAuth: []
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
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsersList'
 *       403:
 *         description: Không có quyền
 */
router.get(
  "/users",
  authMiddleware,
  adminMiddleware,
  UserController.getAllUsers
);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Lấy thông tin người dùng
 *     description: Lấy thông tin chi tiết của một người dùng (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của người dùng
 *     responses:
 *       200:
 *         description: Lấy thông tin thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Người dùng không tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  UserController.getUserById
);

/**
 * @swagger
 * /admin/users/search:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Tìm kiếm người dùng
 *     description: Tìm kiếm người dùng theo email hoặc username (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Tìm theo email
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         description: Tìm theo username
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, shop, admin]
 *         description: Tìm theo role
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
 *     responses:
 *       200:
 *         description: Tìm kiếm thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsersList'
 *       403:
 *         description: Không có quyền
 */
router.get(
  "/users/search",
  authMiddleware,
  adminMiddleware,
  UserController.searchUsers
);

/**
 * @swagger
 * /admin/users/stats:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Lấy thống kê user
 *     description: Lấy thống kê về số lượng user (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     admins:
 *                       type: integer
 *                     regularUsers:
 *                       type: integer
 *       403:
 *         description: Không có quyền
 */
router.get(
  "/users/stats",
  authMiddleware,
  adminMiddleware,
  UserController.getUserStats
);

/**
 * @swagger
 * /admin/store-requests:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Lấy danh sách yêu cầu mở cửa hàng
 *     description: Lấy danh sách yêu cầu mở cửa hàng (admin only)
 *     security:
 *       - bearerAuth: []
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
 *         name: status
 *         schema:
 *           type: string
 *           example: pending
 *         description: Trạng thái yêu cầu (all để bỏ lọc)
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoreRequestList'
 *       403:
 *         description: Không có quyền
 */
router.get(
  "/store-requests",
  authMiddleware,
  adminMiddleware,
  StoreRequestController.getRequests
);

/**
 * @swagger
 * /admin/store-requests/{id}/approve:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Duyệt yêu cầu mở cửa hàng
 *     description: Duyệt đơn yêu cầu mở cửa hàng (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID yêu cầu
 *     responses:
 *       200:
 *         description: Duyệt thành công
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
 *                     request:
 *                       $ref: '#/components/schemas/StoreRequest'
 *                     store:
 *                       $ref: '#/components/schemas/Store'
 *       403:
 *         description: Không có quyền
 */
router.put(
  "/store-requests/:id/approve",
  authMiddleware,
  adminMiddleware,
  StoreRequestController.approveRequest
);

/**
 * @swagger
 * /admin/store-requests/{id}/reject:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Từ chối yêu cầu mở cửa hàng
 *     description: Từ chối đơn yêu cầu mở cửa hàng (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID yêu cầu
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *                 example: Thieu giay to
 *     responses:
 *       200:
 *         description: Từ chối thành công
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
 *                   $ref: '#/components/schemas/StoreRequest'
 *       403:
 *         description: Không có quyền
 */
router.put(
  "/store-requests/:id/reject",
  authMiddleware,
  adminMiddleware,
  StoreRequestController.rejectRequest
);

/**
 * @swagger
 * /admin/products/{id}/cancel:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Hủy sản phẩm
 *     description: Hủy sản phẩm và ghi lại lý do (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID sản phẩm
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 example: San pham khong dap ung tieu chuan
 *     responses:
 *       200:
 *         description: Hủy thành công
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
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 *                     review:
 *                       type: object
 *       403:
 *         description: Không có quyền
 */
router.put(
  "/products/:id/cancel",
  authMiddleware,
  adminMiddleware,
  ProductController.cancelProduct
);

/**
 * @swagger
 * /admin/brands:
 *   post:
 *     tags:
 *       - Brand
 *     summary: Tạo thương hiệu mới
 *     description: Tạo thương hiệu mới (admin only)
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
 *             properties:
 *               name:
 *                 type: string
 *               image:
 *                 type: string
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
 *                   $ref: '#/components/schemas/Brand'
 */
router.post(
  "/brands",
  authMiddleware,
  adminMiddleware,
  BrandController.createBrand
);

/**
 * @swagger
 * /admin/brands/{id}:
 *   put:
 *     tags:
 *       - Brand
 *     summary: Cập nhật thương hiệu
 *     description: Cập nhật thương hiệu (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID thương hiệu
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put(
  "/brands/:id",
  authMiddleware,
  adminMiddleware,
  BrandController.updateBrand
);

/**
 * @swagger
 * /admin/brands/{id}:
 *   delete:
 *     tags:
 *       - Brand
 *     summary: Xóa thương hiệu
 *     description: Xóa thương hiệu (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID thương hiệu
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete(
  "/brands/:id",
  authMiddleware,
  adminMiddleware,
  BrandController.deleteBrand
);

/**
 * @swagger
 * /admin/brand-requests:
 *   get:
 *     tags:
 *       - Brand
 *     summary: Lấy danh sách yêu cầu brand
 *     description: Lấy danh sách yêu cầu tạo thương hiệu (admin only)
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
 *         description: Lấy danh sách thành công
 */
router.get(
  "/brand-requests",
  authMiddleware,
  adminMiddleware,
  BrandRequestController.getRequests
);

/**
 * @swagger
 * /admin/brand-requests/{id}/approve:
 *   put:
 *     tags:
 *       - Brand
 *     summary: Duyệt yêu cầu brand
 *     description: Duyệt yêu cầu tạo thương hiệu (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID yêu cầu
 *     responses:
 *       200:
 *         description: Duyệt thành công
 */
router.put(
  "/brand-requests/:id/approve",
  authMiddleware,
  adminMiddleware,
  BrandRequestController.approveRequest
);

/**
 * @swagger
 * /admin/brand-requests/{id}/reject:
 *   put:
 *     tags:
 *       - Brand
 *     summary: Từ chối yêu cầu brand
 *     description: Từ chối yêu cầu tạo thương hiệu (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID yêu cầu
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Từ chối thành công
 */
router.put(
  "/brand-requests/:id/reject",
  authMiddleware,
  adminMiddleware,
  BrandRequestController.rejectRequest
);

/**
 * @swagger
 * /admin/banners:
 *   post:
 *     tags:
 *       - Banner
 *     summary: Tạo banner mới
 *     description: Tạo banner mới (admin only)
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
 *             properties:
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *               status:
 *                 type: integer
 *                 example: 1
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
 *                   $ref: '#/components/schemas/Banner'
 */
router.post(
  "/banners",
  authMiddleware,
  adminMiddleware,
  BannerController.createBanner
);

/**
 * @swagger
 * /admin/banners/{id}/details:
 *   post:
 *     tags:
 *       - Banner
 *     summary: Thêm sản phẩm vào banner
 *     description: Thêm sản phẩm vào banner (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID banner
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *             properties:
 *               product_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Thêm thành công
 */
router.post(
  "/banners/:id/details",
  authMiddleware,
  adminMiddleware,
  BannerController.addBannerDetail
);

/**
 * @swagger
 * /admin/banners/{id}/details/{productId}:
 *   delete:
 *     tags:
 *       - Banner
 *     summary: Xóa sản phẩm khỏi banner
 *     description: Xóa sản phẩm khỏi banner (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID banner
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID sản phẩm
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete(
  "/banners/:id/details/:productId",
  authMiddleware,
  adminMiddleware,
  BannerController.removeBannerDetail
);

module.exports = router;

const express = require("express");
const router = express.Router();
const UserController = require("../app/controller/userController");
const UserAddressController = require("../app/controller/userAddressController");
const { authMiddleware } = require("../app/middleware/auth");

/**
 * @swagger
 * /users/profile:
 *   get:
 *     tags:
 *       - User
 *     summary: Lấy profile người dùng hiện tại
 *     description: Lấy thông tin profile của người dùng đang đăng nhập
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách địa chỉ thành công
 *         content:
 *           application/json:
 *             example:
 *               code: "200"
 *               success: true
 *               message: Lấy danh sách địa chỉ thành công
 *               data:
 *                 addresses:
 *                   - id: 12
 *                     user_id: 22
 *                     full_name: Nguyễn Văn A
 *                     phone: "0901234567"
 *                     address_line: 12 Nguyễn Trãi
 *                     ward: Phường 2
 *                     district: Quận 5
 *                     city: TP HCM
 *                     province: Hồ Chí Minh
 *                     is_default: true
 *       401:
 *         $ref: '#/components/responses/Unauthorized401'
 *       404:
 *         $ref: '#/components/responses/NotFound404'
 */
router.get("/profile", authMiddleware, UserController.getProfile);

/**
 * @swagger
 * /users/profile:
 *   put:
 *     tags:
 *       - User
 *     summary: Cập nhật profile
 *     description: Cập nhật thông tin profile của người dùng
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Ok200'
 *       400:
 *         $ref: '#/components/responses/BadRequest400'
 *       401:
 *         $ref: '#/components/responses/Unauthorized401'
 */
router.put("/profile", authMiddleware, UserController.updateProfile);

/**
 * @swagger
 * /users/public/{id}:
 *   get:
 *     tags:
 *       - User
 *     summary: Lấy public profile
 *     description: Lấy thông tin công khai của người dùng (không cần auth)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của người dùng
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Ok200'
 *       404:
 *         $ref: '#/components/responses/NotFound404'
 */
router.get("/public/:id", UserController.getPublicProfile);

/**
 * @swagger
 * /users/change-password:
 *   post:
 *     tags:
 *       - User
 *     summary: Đổi mật khẩu
 *     description: Đổi mật khẩu hiện tại thành mật khẩu mới
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Ok200'
 *       400:
 *         $ref: '#/components/responses/BadRequest400'
 *       401:
 *         $ref: '#/components/responses/Unauthorized401'
 */
router.post("/change-password", authMiddleware, UserController.changePassword);

/**
 * @swagger
 * /users/account:
 *   delete:
 *     tags:
 *       - User
 *     summary: Xóa tài khoản
 *     description: Xóa tài khoản người dùng (cần xác nhận mật khẩu)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Ok200'
 *       400:
 *         $ref: '#/components/responses/BadRequest400'
 *       401:
 *         $ref: '#/components/responses/Unauthorized401'
 */
router.delete("/account", authMiddleware, UserController.deleteAccount);

/**
 * @swagger
 * /users/addresses:
 *   get:
 *     tags:
 *       - User Address
 *     summary: Lấy danh sách địa chỉ giao hàng của user hiện tại
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Ok200'
 *       401:
 *         $ref: '#/components/responses/Unauthorized401'
 */
router.get("/addresses", authMiddleware, UserAddressController.getMyAddresses);

/**
 * @swagger
 * /users/addresses:
 *   post:
 *     tags:
 *       - User Address
 *     summary: Tạo địa chỉ giao hàng
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address_line
 *               - province
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: Nguyễn Văn A
 *               phone:
 *                 type: string
 *                 example: 0901234567
 *               address_line:
 *                 type: string
 *                 example: 12 Nguyễn Trãi
 *               ward:
 *                 type: string
 *                 example: Phường 2
 *               district:
 *                 type: string
 *                 example: Quận 5
 *               city:
 *                 type: string
 *                 example: TP HCM
 *               province:
 *                 type: string
 *                 example: Hồ Chí Minh
 *               is_default:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Tạo địa chỉ thành công
 *         content:
 *           application/json:
 *             example:
 *               code: "201"
 *               success: true
 *               message: Tạo địa chỉ thành công
 *               data:
 *                 id: 13
 *                 user_id: 22
 *                 full_name: Nguyễn Văn A
 *                 phone: "0901234567"
 *                 address_line: 22 Lê Lợi
 *                 district: Quận 1
 *                 city: TP HCM
 *                 province: Hồ Chí Minh
 *                 is_default: false
 *       400:
 *         $ref: '#/components/responses/BadRequest400'
 *       401:
 *         $ref: '#/components/responses/Unauthorized401'
 */
router.post("/addresses", authMiddleware, UserAddressController.createAddress);

/**
 * @swagger
 * /users/addresses/{id}:
 *   put:
 *     tags:
 *       - User Address
 *     summary: Cập nhật địa chỉ giao hàng
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address_line
 *               - province
 *             properties:
 *               full_name: { type: string }
 *               phone: { type: string }
 *               address_line: { type: string }
 *               ward: { type: string }
 *               district: { type: string }
 *               city: { type: string }
 *               province: { type: string }
 *               is_default: { type: boolean }
 *     responses:
 *       200:
 *         description: Cập nhật địa chỉ thành công
 *         content:
 *           application/json:
 *             example:
 *               code: "200"
 *               success: true
 *               message: Cập nhật địa chỉ thành công
 *               data:
 *                 id: 12
 *                 user_id: 22
 *                 address_line: 36 Trần Hưng Đạo
 *                 district: Quận 1
 *                 city: TP HCM
 *                 province: Hồ Chí Minh
 *                 is_default: true
 *       400:
 *         $ref: '#/components/responses/BadRequest400'
 *       401:
 *         $ref: '#/components/responses/Unauthorized401'
 */
router.put("/addresses/:id", authMiddleware, UserAddressController.updateAddress);

/**
 * @swagger
 * /users/addresses/{id}/default:
 *   put:
 *     tags:
 *       - User Address
 *     summary: Đặt địa chỉ mặc định
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Đặt địa chỉ mặc định thành công
 *         content:
 *           application/json:
 *             example:
 *               code: "200"
 *               success: true
 *               message: Đặt mặc định thành công
 *               data:
 *                 id: 13
 *                 user_id: 22
 *                 is_default: true
 *       400:
 *         $ref: '#/components/responses/BadRequest400'
 *       401:
 *         $ref: '#/components/responses/Unauthorized401'
 */
router.put(
  "/addresses/:id/default",
  authMiddleware,
  UserAddressController.setDefaultAddress
);

/**
 * @swagger
 * /users/addresses/{id}:
 *   delete:
 *     tags:
 *       - User Address
 *     summary: Xóa địa chỉ giao hàng
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Xóa địa chỉ thành công
 *         content:
 *           application/json:
 *             example:
 *               code: "200"
 *               success: true
 *               message: Xóa địa chỉ thành công
 *       400:
 *         $ref: '#/components/responses/BadRequest400'
 *       401:
 *         $ref: '#/components/responses/Unauthorized401'
 */
router.delete("/addresses/:id", authMiddleware, UserAddressController.deleteAddress);

module.exports = router;

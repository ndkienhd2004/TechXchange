const express = require("express");
const router = express.Router();
const UserController = require("../app/controller/userController");
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
 *       401:
 *         description: Không được phép truy cập
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Lỗi validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *         description: Lấy thông tin thành công
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
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     gender:
 *                       type: string
 *                     created_at:
 *                       type: string
 *       404:
 *         description: Người dùng không tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *         description: Đổi mật khẩu thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Lỗi validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *         description: Xóa tài khoản thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Lỗi validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/account", authMiddleware, UserController.deleteAccount);

module.exports = router;

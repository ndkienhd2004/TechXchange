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
 *         $ref: '#/components/responses/Ok200'
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

module.exports = router;

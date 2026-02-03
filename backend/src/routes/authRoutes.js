const express = require("express");
const AuthController = require("../app/controller/auth");
const { authMiddleware, adminMiddleware } = require("../app/middleware/auth");

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Đăng ký tài khoản mới
 *     description: Tạo một tài khoản người dùng mới
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Created201'
 *       400:
 *         $ref: '#/components/responses/BadRequest400'
 */
router.post("/register", AuthController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Đăng nhập
 *     description: Xác thực người dùng và nhận access token và refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Ok200'
 *       401:
 *         $ref: '#/components/responses/Unauthorized401'
 */
router.post("/login", AuthController.login);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Reset mật khẩu
 *     description: Đặt lại mật khẩu người dùng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: newpassword123
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: newpassword123
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Ok200'
 *       400:
 *         $ref: '#/components/responses/BadRequest400'
 */
router.post("/reset-password", AuthController.resetPassword);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Làm mới access token
 *     description: Sử dụng refresh token để lấy access token mới
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Ok200'
 *       401:
 *         $ref: '#/components/responses/Unauthorized401'
 */
router.post("/refresh-token", AuthController.refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Đăng xuất
 *     description: Revoke refresh token và đăng xuất người dùng
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Ok200'
 *       401:
 *         $ref: '#/components/responses/Unauthorized401'
 *       500:
 *         $ref: '#/components/responses/ServerError500'
 */
router.post("/logout", authMiddleware, AuthController.logout);

/**
 * @swagger
 * /auth/logout-all:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Đăng xuất từ tất cả thiết bị
 *     description: Revoke tất cả refresh tokens và đăng xuất từ tất cả thiết bị
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Ok200'
 *       401:
 *         $ref: '#/components/responses/Unauthorized401'
 *       500:
 *         $ref: '#/components/responses/ServerError500'
 */
router.post("/logout-all", authMiddleware, AuthController.logoutAll);

/**
 * @swagger
 * /auth/verify:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Xác thực token
 *     description: Kiểm tra xem token hiện tại có hợp lệ không
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Ok200'
 *       401:
 *         $ref: '#/components/responses/Unauthorized401'
 */
router.get("/verify", authMiddleware, AuthController.verifyToken);

module.exports = router;

const express = require("express");
const router = express.Router();
const StoreRequestController = require("../app/controller/storeRequestController");
const { authMiddleware } = require("../app/middleware/auth");

/**
 * @swagger
 * /stores/requests:
 *   post:
 *     tags:
 *       - Store
 *     summary: Tạo yêu cầu mở cửa hàng
 *     description: Tạo đơn yêu cầu mở cửa hàng cho người dùng
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStoreRequest'
 *     responses:
 *       201:
 *         description: Tạo yêu cầu thành công
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
 *       400:
 *         description: Lỗi validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/requests", authMiddleware, StoreRequestController.createRequest);

/**
 * @swagger
 * /stores/requests/me:
 *   get:
 *     tags:
 *       - Store
 *     summary: Lấy danh sách yêu cầu mở cửa hàng của user
 *     description: Lấy danh sách yêu cầu mở cửa hàng của người dùng hiện tại
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
 *       401:
 *         description: Không được phép truy cập
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/requests/me", authMiddleware, StoreRequestController.getMyRequests);

module.exports = router;

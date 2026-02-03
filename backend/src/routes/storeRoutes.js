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
 *         $ref: '#/components/responses/Created201'
 *       400:
 *         $ref: '#/components/responses/BadRequest400'
 *       401:
 *         $ref: '#/components/responses/Unauthorized401'
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
 *         $ref: '#/components/responses/Ok200'
 *       401:
 *         $ref: '#/components/responses/Unauthorized401'
 *       500:
 *         $ref: '#/components/responses/ServerError500'
 */
router.get(
  "/requests/me",
  authMiddleware,
  StoreRequestController.getMyRequests
);

module.exports = router;

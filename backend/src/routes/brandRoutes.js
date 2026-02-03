const express = require("express");
const router = express.Router();
const BrandController = require("../app/controller/brandController");
const BrandRequestController = require("../app/controller/brandRequestController");
const { authMiddleware, shopMiddleware } = require("../app/middleware/auth");
/**
 * @swagger
 * /brands:
 *   get:
 *     tags:
 *       - Brand
 *     summary: Lấy danh sách thương hiệu
 *     description: Lấy danh sách thương hiệu công khai
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Ok200'
 *       500:
 *         $ref: '#/components/responses/ServerError500'
 */
router.get("/", BrandController.getBrands);

/**
 * @swagger
 * /brands/requests:
 *   post:
 *     tags:
 *       - Brand
 *     summary: Gửi yêu cầu tạo thương hiệu
 *     description: Shop gửi yêu cầu tạo thương hiệu (shop only)
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
  BrandRequestController.createRequest
);

/**
 * @swagger
 * /brands/requests/me:
 *   get:
 *     tags:
 *       - Brand
 *     summary: Danh sách yêu cầu thương hiệu của shop
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
  BrandRequestController.getMyRequests
);

module.exports = router;

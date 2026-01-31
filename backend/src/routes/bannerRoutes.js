const express = require("express");
const router = express.Router();
const BannerController = require("../app/controller/bannerController");

/**
 * @swagger
 * /banners:
 *   get:
 *     tags:
 *       - Banner
 *     summary: Lấy danh sách banner
 *     description: Lấy danh sách banner công khai (status=all để lấy tất cả)
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           example: all
 *         description: Mặc định chỉ lấy banner active
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Banner'
 */
router.get("/", BannerController.getBanners);

module.exports = router;

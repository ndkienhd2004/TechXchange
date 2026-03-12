const express = require("express");
const router = express.Router();
const SepayWebhookController = require("../app/controller/sepayWebhookController");

/**
 * @swagger
 * /webhooks/sepay:
 *   post:
 *     tags:
 *       - Webhook
 *     summary: Nhận webhook thanh toán từ SePay
 *     description: |
 *       Endpoint để SePay gọi vào khi có biến động giao dịch.
 *       Luồng xử lý:
 *       - Lưu raw payload để audit + chống xử lý trùng theo `id` của SePay
 *       - Parse `code` để tìm `order_id` (mặc định format `ORDER_<orderId>`)
 *       - Nếu order dùng `bank_transfer` và số tiền đủ thì cập nhật payment.status = completed
 *       Có thể bật verify API key bằng biến môi trường `SEPAY_API_KEY`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id, transferType, transferAmount]
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 92704
 *               gateway:
 *                 type: string
 *                 example: Vietcombank
 *               transactionDate:
 *                 type: string
 *                 example: "2026-03-07 10:00:00"
 *               accountNumber:
 *                 type: string
 *                 example: "0123499999"
 *               code:
 *                 type: string
 *                 example: ORDER_1201
 *               content:
 *                 type: string
 *                 example: chuyen tien don ORDER_1201
 *               transferType:
 *                 type: string
 *                 enum: [in, out]
 *                 example: in
 *               transferAmount:
 *                 type: number
 *                 example: 12990000
 *               accumulated:
 *                 type: number
 *                 example: 19077000
 *               subAccount:
 *                 type: string
 *                 nullable: true
 *                 example: null
 *               referenceCode:
 *                 type: string
 *                 example: MBVCB.3278907687
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: sms body
 *     responses:
 *       200:
 *         description: Webhook được nhận và xử lý/ghi nhận thành công
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               duplicated: false
 *               message: Webhook xử lý thành công
 *               event_id: 1
 *               order_id: 1201
 *       400:
 *         description: Payload không hợp lệ
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: transferType không hợp lệ
 *       401:
 *         description: Sai API key (khi bật SEPAY_API_KEY)
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Unauthorized webhook
 */
router.post("/sepay", SepayWebhookController.receive);

module.exports = router;

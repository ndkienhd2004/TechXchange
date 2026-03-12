const express = require("express");
const router = express.Router();
const OrderController = require("../app/controller/orderController");
const { authMiddleware, shopMiddleware } = require("../app/middleware/auth");

/**
 * @swagger
 * /orders/checkout:
 *   post:
 *     tags:
 *       - Order
 *     summary: Checkout tạo đơn hàng
 *     description: |
 *       Tạo đơn hàng từ danh sách item. Nếu có nhiều shop, hệ thống sẽ tách thành nhiều order theo từng shop.
 *       Hỗ trợ `cod` và `bank_transfer`.
 *       Với `bank_transfer`, response trả thêm `transfer_instructions` để FE hiển thị QR/chuyển khoản.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - payment_method
 *               - items
 *             properties:
 *               payment_method:
 *                 type: string
 *                 enum: [cod, bank_transfer]
 *                 example: cod
 *               address_id:
 *                 type: integer
 *                 example: 12
 *                 description: ID địa chỉ đã lưu của user (ưu tiên dùng)
 *               shipping_address:
 *                 type: object
 *                 description: Dùng khi không truyền address_id
 *                 properties:
 *                   full_name: { type: string, example: Nguyễn Văn A }
 *                   phone: { type: string, example: 0901234567 }
 *                   line1: { type: string, example: 12 Nguyễn Trãi }
 *                   ward: { type: string, example: Phường 2 }
 *                   district: { type: string, example: Quận 5 }
 *                   city: { type: string, example: TP HCM }
 *                   province: { type: string, example: Hồ Chí Minh }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [product_id, quantity]
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                       example: 101
 *                     serial_id:
 *                       type: integer
 *                       nullable: true
 *                       example: 1001
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       example: 2
 *               cart_item_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [21, 22]
 *               note:
 *                 type: string
 *                 example: Giao giờ hành chính
 *     responses:
 *       201:
 *         description: Tạo đơn hàng thành công
 *         content:
 *           application/json:
 *             example:
 *               code: "201"
 *               success: true
 *               message: Đặt hàng thành công
 *               data:
 *                 payment_method: bank_transfer
 *                 currency: VND
 *                 grouped_by_store: true
 *                 orders:
 *                   - id: 1201
 *                     store_id: 5
 *                     status: pending
 *                     currency: VND
 *                     total_price: "12990000.00"
 *                 transfer_instructions:
 *                   - order_id: 1201
 *                     payment_code: ORDER_1201
 *                     amount_vnd: 12990000
 *                     account_number: "00123456789"
 *                     bank_code: Vietcombank
 *                     account_name: TECHXCHANGE
 *                     virtual_account: 96247CSSOM
 *                     qr_url: https://qr.sepay.vn/img?acc=00123456789&bank=Vietcombank&amount=12990000&des=ORDER_1201
 *       400:
 *         $ref: '#/components/responses/BadRequest400'
 *       401:
 *         $ref: '#/components/responses/Unauthorized401'
 */
router.post("/checkout", authMiddleware, OrderController.checkout);
router.post(
  "/shipping-fee-estimate",
  authMiddleware,
  OrderController.estimateShippingFee,
);

/**
 * @swagger
 * /orders/transfer-info:
 *   get:
 *     tags:
 *       - Order
 *     summary: Lấy thông tin thanh toán chuyển khoản theo danh sách order
 *     description: |
 *       Dùng cho màn thanh toán SePay.
 *       API sẽ tự động kiểm tra hết hạn 10 phút kể từ `created_at`.
 *       Nếu quá hạn mà chưa thanh toán thì tự hủy order/payment.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: order_ids
 *         required: true
 *         schema:
 *           type: string
 *           example: 1201,1202
 *     responses:
 *       200:
 *         description: Lấy thông tin thành công
 *       400:
 *         $ref: '#/components/responses/BadRequest400'
 *       401:
 *         $ref: '#/components/responses/Unauthorized401'
 */
router.get("/transfer-info", authMiddleware, OrderController.getTransferPaymentInfo);

/**
 * @swagger
 * /orders/me:
 *   get:
 *     tags:
 *       - Order
 *     summary: Danh sách đơn hàng của user hiện tại
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, pending, shipping, completed, canceled]
 *         description: Lọc theo trạng thái hiển thị
 *     responses:
 *       200:
 *         description: Lấy danh sách đơn hàng thành công
 *         content:
 *           application/json:
 *             example:
 *               code: "200"
 *               success: true
 *               message: Lấy đơn hàng thành công
 *               data:
 *                 orders:
 *                   - id: 1201
 *                     status: shipping
 *                     order_status: pending
 *                     shipment_status: shipped
 *                     payment_method: cod
 *                     shipping_address:
 *                       full_name: Nguyễn Văn A
 *                       phone: "0901234567"
 *                       line1: 12 Nguyễn Trãi
 *                       district: Quận 5
 *                       city: TP HCM
 *                     total_price: "12990000.00"
 *                     created_at: "2026-03-03T10:00:00.000Z"
 *                     items:
 *                       - id: 1
 *                         product_id: 101
 *                         quantity: 1
 *                         price: "12990000.00"
 *                         can_review: false
 *       401:
 *         $ref: '#/components/responses/Unauthorized401'
 */
router.get("/me", authMiddleware, OrderController.getMyOrders);

/**
 * @swagger
 * /orders/{id}/received:
 *   put:
 *     tags:
 *       - Order
 *     summary: User xác nhận đã nhận hàng
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
 *         description: Xác nhận nhận hàng thành công
 *         content:
 *           application/json:
 *             example:
 *               code: "200"
 *               success: true
 *               message: Xác nhận nhận hàng thành công
 *               data:
 *                 id: 1201
 *                 status: completed
 *       400:
 *         $ref: '#/components/responses/BadRequest400'
 *       401:
 *         $ref: '#/components/responses/Unauthorized401'
 */
router.put("/:id/received", authMiddleware, OrderController.markReceived);

/**
 * @swagger
 * /orders/shop/me:
 *   get:
 *     tags:
 *       - Shop Order
 *     summary: Shop lấy danh sách đơn hàng của shop mình
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, pending, shipping, completed, canceled]
 *     responses:
 *       200:
 *         description: Lấy danh sách đơn hàng shop thành công
 *         content:
 *           application/json:
 *             example:
 *               code: "200"
 *               success: true
 *               message: Lấy đơn hàng shop thành công
 *               data:
 *                 orders:
 *                   - id: 1201
 *                     status: pending
 *                     total_price: "12990000.00"
 *                     customer:
 *                       id: 22
 *                       username: kiennd
 *                       phone: "0901234567"
 *                     items:
 *                       - id: 1
 *                         product_id: 101
 *                         quantity: 1
 *                         price: "12990000.00"
 *       401:
 *         $ref: '#/components/responses/Unauthorized401'
 *       403:
 *         $ref: '#/components/responses/Forbidden403'
 */
router.get(
  "/shop/me",
  authMiddleware,
  shopMiddleware,
  OrderController.getShopOrders,
);

/**
 * @swagger
 * /orders/shop/{id}/approve:
 *   put:
 *     tags:
 *       - Shop Order
 *     summary: Shop duyệt đơn và chuyển sang đang giao
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
 *         description: Shop duyệt đơn thành công
 *         content:
 *           application/json:
 *             example:
 *               code: "200"
 *               success: true
 *               message: Duyệt đơn hàng thành công
 *               data:
 *                 id: 1201
 *                 status: shipping
 *       400:
 *         $ref: '#/components/responses/BadRequest400'
 *       401:
 *         $ref: '#/components/responses/Unauthorized401'
 *       403:
 *         $ref: '#/components/responses/Forbidden403'
 */
router.put(
  "/shop/:id/approve",
  authMiddleware,
  shopMiddleware,
  OrderController.approveShopOrder,
);

module.exports = router;

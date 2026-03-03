const express = require("express");
const router = express.Router();
const OrderController = require("../app/controller/orderController");
const { authMiddleware } = require("../app/middleware/auth");

router.post("/checkout", authMiddleware, OrderController.checkout);
router.get("/me", authMiddleware, OrderController.getMyOrders);

module.exports = router;

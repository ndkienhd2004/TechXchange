const express = require("express");
const router = express.Router();
const CartController = require("../app/controller/cartController");
const { authMiddleware } = require("../app/middleware/auth");

router.get("/", authMiddleware, CartController.getCart);
router.post("/items", authMiddleware, CartController.addItem);
router.put("/items/:id", authMiddleware, CartController.updateItem);
router.delete("/items/:id", authMiddleware, CartController.removeItem);
router.delete("/", authMiddleware, CartController.clearCart);

module.exports = router;

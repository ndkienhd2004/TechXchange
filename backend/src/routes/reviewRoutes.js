const express = require("express");
const router = express.Router();
const ReviewController = require("../app/controller/reviewController");
const { authMiddleware } = require("../app/middleware/auth");

router.post("/", authMiddleware, ReviewController.createReview);
router.get("/product/:productId", ReviewController.getProductReviews);

module.exports = router;

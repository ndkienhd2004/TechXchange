const express = require("express");
const router = express.Router();
const EventController = require("../app/controller/eventController");
const { authMiddleware } = require("../app/middleware/auth");

router.post("/product", authMiddleware, EventController.trackProductEvent);

module.exports = router;

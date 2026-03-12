const express = require("express");
const router = express.Router();
const GhnController = require("../app/controller/ghnController");
const { authMiddleware } = require("../app/middleware/auth");

router.get("/provinces", authMiddleware, GhnController.getProvinces);
router.get("/districts", authMiddleware, GhnController.getDistricts);
router.get("/wards", authMiddleware, GhnController.getWards);
router.post("/fee", authMiddleware, GhnController.calculateFee);

module.exports = router;

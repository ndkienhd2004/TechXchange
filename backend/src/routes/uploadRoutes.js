const express = require("express");
const UploadController = require("../app/controller/uploadController");
const { authMiddleware } = require("../app/middleware/auth");

const router = express.Router();

router.post("/presign", authMiddleware, UploadController.createPresignedUpload);

module.exports = router;

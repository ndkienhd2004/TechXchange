const express = require("express");
const router = express.Router();
const ChatController = require("../app/controller/chatController");
const { authMiddleware } = require("../app/middleware/auth");

router.post("/open-store", authMiddleware, ChatController.openStoreConversation);
router.get("/conversations", authMiddleware, ChatController.listConversations);
router.get("/messages/:peerUserId", authMiddleware, ChatController.getMessages);
router.post("/messages", authMiddleware, ChatController.sendMessage);

module.exports = router;

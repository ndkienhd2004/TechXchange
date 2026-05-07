const express = require("express");
const router = express.Router();
const AssistantController = require("../app/controller/assistantController");
const { authMiddleware, adminMiddleware } = require("../app/middleware/auth");

router.get("/health", AssistantController.health);
router.post("/chat", authMiddleware, AssistantController.chat);
router.get("/conversations", authMiddleware, AssistantController.listConversations);
router.get("/messages/:conversationId", authMiddleware, AssistantController.getMessages);
router.post("/ingest", authMiddleware, adminMiddleware, AssistantController.ingest);
router.post("/reindex", authMiddleware, adminMiddleware, AssistantController.reindex);

module.exports = router;

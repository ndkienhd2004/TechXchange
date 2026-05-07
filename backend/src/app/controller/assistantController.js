const AssistantService = require("../service/assistantService");
const { response } = require("../utils/response");

class AssistantController {
  static resolveUserContext(req) {
    return {
      userId: Number(req.user?.id || 0),
      userRole: req.user?.role ? String(req.user.role) : "user",
      authorization: req.headers.authorization,
    };
  }

  static handleProxyError(res, error) {
    const status = Number(error?.status || 500);
    const message = error?.message || "Lỗi chatbot service";
    if (status === 400) return response.badRequest(res, message);
    if (status === 401) return response.unauthorized(res, message);
    if (status === 403) return response.forbidden(res, message);
    if (status === 404) return response.notFound(res, message);
    return response.serverError(res, message);
  }

  static async health(req, res) {
    try {
      const payload = await AssistantService.health();
      return res.status(200).json(payload);
    } catch (error) {
      return AssistantController.handleProxyError(res, error);
    }
  }

  static async chat(req, res) {
    try {
      const message = String(req.body?.message || "").trim();
      if (!message) {
        return response.badRequest(res, "message là bắt buộc");
      }
      const payload = await AssistantService.chat({
        ...AssistantController.resolveUserContext(req),
        message,
        locale: req.body?.locale || "vi-VN",
        conversationId: req.body?.conversation_id,
      });
      return res.status(200).json(payload);
    } catch (error) {
      return AssistantController.handleProxyError(res, error);
    }
  }

  static async listConversations(req, res) {
    try {
      const payload = await AssistantService.getConversations({
        ...AssistantController.resolveUserContext(req),
        limit: req.query?.limit || 20,
      });
      return res.status(200).json(payload);
    } catch (error) {
      return AssistantController.handleProxyError(res, error);
    }
  }

  static async getMessages(req, res) {
    try {
      const conversationId = Number(req.params.conversationId);
      if (!conversationId) {
        return response.badRequest(res, "conversationId không hợp lệ");
      }
      const payload = await AssistantService.getMessages({
        ...AssistantController.resolveUserContext(req),
        conversationId,
        limit: req.query?.limit || 50,
      });
      return res.status(200).json(payload);
    } catch (error) {
      return AssistantController.handleProxyError(res, error);
    }
  }

  static async ingest(req, res) {
    try {
      const payload = await AssistantService.ingest({
        ...AssistantController.resolveUserContext(req),
        documents: req.body?.documents,
      });
      return res.status(201).json(payload);
    } catch (error) {
      return AssistantController.handleProxyError(res, error);
    }
  }

  static async reindex(req, res) {
    try {
      const payload = await AssistantService.reindex(
        AssistantController.resolveUserContext(req),
      );
      return res.status(200).json(payload);
    } catch (error) {
      return AssistantController.handleProxyError(res, error);
    }
  }
}

module.exports = AssistantController;

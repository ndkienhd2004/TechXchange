const ChatService = require("../service/chatService");
const { response } = require("../utils/response");

class ChatController {
  static async openStoreConversation(req, res) {
    try {
      const userId = Number(req.user.id);
      const storeId = Number(req.body.store_id);
      const shopOwnerId = await ChatService.resolveShopOwnerId(storeId);
      await ChatService.assertCanChat(userId, shopOwnerId);
      return response.success(res, "Mở hội thoại thành công", {
        peer_user_id: shopOwnerId,
        room_id: ChatService.getRoomId(userId, shopOwnerId),
      });
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  static async listConversations(req, res) {
    try {
      const userId = Number(req.user.id);
      const limit = Number(req.query.limit || 20);
      const conversations = await ChatService.getConversations(userId, limit);
      return response.success(res, "Lấy danh sách hội thoại thành công", {
        conversations,
      });
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  static async getMessages(req, res) {
    try {
      const userId = Number(req.user.id);
      const peerUserId = Number(req.params.peerUserId);
      const limit = Number(req.query.limit || 30);

      const messages = await ChatService.getConversationMessages(
        userId,
        peerUserId,
        limit,
      );
      await ChatService.markAsRead(userId, peerUserId);

      return response.success(res, "Lấy tin nhắn thành công", {
        room_id: ChatService.getRoomId(userId, peerUserId),
        messages,
      });
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  static async sendMessage(req, res) {
    try {
      const senderId = Number(req.user.id);
      const receiverId = Number(req.body.receiver_id);
      const text = req.body.message;
      const message = await ChatService.sendMessage(senderId, receiverId, text);
      return response.created(res, "Gửi tin nhắn thành công", message);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }
}

module.exports = ChatController;

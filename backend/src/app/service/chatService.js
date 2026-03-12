const { Op } = require("sequelize");
const { Message, User, Store } = require("../../models");

class ChatService {
  static getRoomId(userA, userB) {
    const first = Number(userA);
    const second = Number(userB);
    if (!first || !second) throw new Error("user_id không hợp lệ");
    return first < second ? `chat:${first}:${second}` : `chat:${second}:${first}`;
  }

  static async assertCanChat(userAId, userBId) {
    const first = Number(userAId);
    const second = Number(userBId);
    if (!first || !second) throw new Error("user_id không hợp lệ");
    if (first === second) throw new Error("Không thể tự nhắn cho chính mình");

    const users = await User.findAll({
      where: { id: { [Op.in]: [first, second] } },
      attributes: ["id", "role", "username", "email"],
    });
    if (users.length !== 2) throw new Error("Không tìm thấy người dùng chat");

    const firstUser = users.find((u) => Number(u.id) === first);
    const secondUser = users.find((u) => Number(u.id) === second);
    const isUserShopPair =
      firstUser?.role === "shop" ||
      secondUser?.role === "shop";

    if (!isUserShopPair) {
      throw new Error("Chat chỉ hỗ trợ giữa user và shop");
    }
  }

  static async resolveShopOwnerId(storeId) {
    const sid = Number(storeId);
    if (!sid) throw new Error("store_id không hợp lệ");
    const store = await Store.findByPk(sid, {
      attributes: ["id", "owner_id", "name"],
    });
    if (!store) throw new Error("Không tìm thấy cửa hàng");
    return Number(store.owner_id);
  }

  static async sendMessage(senderId, receiverId, text) {
    const messageText = String(text || "").trim();
    if (!messageText) throw new Error("Nội dung tin nhắn không được để trống");
    if (messageText.length > 5000) {
      throw new Error("Tin nhắn quá dài (tối đa 5000 ký tự)");
    }

    await this.assertCanChat(senderId, receiverId);

    const created = await Message.create({
      sender_id: Number(senderId),
      receiver_id: Number(receiverId),
      message: messageText,
      is_read: false,
      sent_at: new Date(),
    });

    return {
      id: created.id,
      sender_id: Number(created.sender_id),
      receiver_id: Number(created.receiver_id),
      message: created.message,
      is_read: Boolean(created.is_read),
      sent_at: created.sent_at,
      room_id: this.getRoomId(senderId, receiverId),
    };
  }

  static async getConversationMessages(userId, peerUserId, limit = 30) {
    await this.assertCanChat(userId, peerUserId);
    const safeLimit = Math.min(Math.max(Number(limit) || 30, 1), 100);

    const rows = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: Number(userId), receiver_id: Number(peerUserId) },
          { sender_id: Number(peerUserId), receiver_id: Number(userId) },
        ],
      },
      order: [["sent_at", "DESC"]],
      limit: safeLimit,
    });

    return rows
      .map((row) => ({
        id: row.id,
        sender_id: Number(row.sender_id),
        receiver_id: Number(row.receiver_id),
        message: row.message,
        is_read: Boolean(row.is_read),
        sent_at: row.sent_at,
      }))
      .reverse();
  }

  static async getConversations(userId, limit = 20) {
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const rows = await Message.findAll({
      where: {
        [Op.or]: [{ sender_id: Number(userId) }, { receiver_id: Number(userId) }],
      },
      order: [["sent_at", "DESC"]],
      limit: 3000,
    });

    const map = new Map();
    for (const row of rows) {
      const senderId = Number(row.sender_id);
      const receiverId = Number(row.receiver_id);
      const peerId = senderId === Number(userId) ? receiverId : senderId;
      if (!map.has(peerId)) {
        map.set(peerId, {
          peer_user_id: peerId,
          last_message: row.message,
          last_message_at: row.sent_at,
          unread_count:
            receiverId === Number(userId) && !row.is_read ? 1 : 0,
        });
      } else if (receiverId === Number(userId) && !row.is_read) {
        map.get(peerId).unread_count += 1;
      }
    }

    const peerIds = Array.from(map.keys());
    if (!peerIds.length) return [];

    const users = await User.findAll({
      where: { id: { [Op.in]: peerIds } },
      attributes: ["id", "username", "email", "role"],
    });
    const userById = new Map(users.map((u) => [Number(u.id), u]));

    return Array.from(map.values())
      .map((item) => ({
        ...item,
        peer: userById.has(item.peer_user_id)
          ? {
              id: Number(userById.get(item.peer_user_id).id),
              username: userById.get(item.peer_user_id).username,
              email: userById.get(item.peer_user_id).email,
              role: userById.get(item.peer_user_id).role,
            }
          : null,
        room_id: this.getRoomId(userId, item.peer_user_id),
      }))
      .slice(0, safeLimit);
  }

  static async markAsRead(userId, peerUserId) {
    await Message.update(
      { is_read: true },
      {
        where: {
          sender_id: Number(peerUserId),
          receiver_id: Number(userId),
          is_read: false,
        },
      },
    );
  }
}

module.exports = ChatService;

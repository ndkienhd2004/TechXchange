const { Server } = require("socket.io");
const AuthServices = require("../app/service/auth");
const ChatService = require("../app/service/chatService");

function extractToken(socket) {
  const authToken = socket.handshake?.auth?.token;
  if (authToken) return String(authToken).replace(/^Bearer\s+/i, "");
  const headerToken = socket.handshake?.headers?.authorization;
  if (!headerToken) return "";
  return String(headerToken).replace(/^Bearer\s+/i, "");
}

function createSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    try {
      const token = extractToken(socket);
      if (!token) return next(new Error("Thiếu token"));
      const user = AuthServices.verifyToken(token);
      socket.user = user;
      return next();
    } catch (error) {
      return next(new Error(error.message || "Token không hợp lệ"));
    }
  });

  io.on("connection", (socket) => {
    const userId = Number(socket.user?.id);
    socket.join(`user:${userId}`);

    socket.on("chat:join", async (payload = {}, ack) => {
      try {
        const peerUserId = Number(payload.peer_user_id);
        await ChatService.assertCanChat(userId, peerUserId);
        const roomId = ChatService.getRoomId(userId, peerUserId);
        socket.join(roomId);
        if (typeof ack === "function") ack({ ok: true, room_id: roomId });
      } catch (error) {
        if (typeof ack === "function") ack({ ok: false, message: error.message });
      }
    });

    socket.on("chat:send", async (payload = {}, ack) => {
      try {
        const receiverId = Number(payload.receiver_id);
        const message = await ChatService.sendMessage(
          userId,
          receiverId,
          payload.message,
        );
        const roomId = ChatService.getRoomId(userId, receiverId);
        io.to(roomId).emit("chat:message", message);
        // Push fallback cho receiver chưa join room chat, tránh emit duplicate
        // khi receiver đã ở trong room.
        io.to(`user:${receiverId}`).except(roomId).emit("chat:message", message);
        if (typeof ack === "function") ack({ ok: true, data: message });
      } catch (error) {
        if (typeof ack === "function") ack({ ok: false, message: error.message });
      }
    });

    socket.on("chat:read", async (payload = {}, ack) => {
      try {
        const peerUserId = Number(payload.peer_user_id);
        await ChatService.assertCanChat(userId, peerUserId);
        await ChatService.markAsRead(userId, peerUserId);
        const roomId = ChatService.getRoomId(userId, peerUserId);
        io.to(roomId).emit("chat:read", {
          user_id: userId,
          peer_user_id: peerUserId,
        });
        if (typeof ack === "function") ack({ ok: true });
      } catch (error) {
        if (typeof ack === "function") ack({ ok: false, message: error.message });
      }
    });
  });

  return io;
}

module.exports = { createSocketServer };

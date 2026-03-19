const { UserProductEvent } = require("../../models");

class UserEventService {
  static ALLOWED_EVENT_TYPES = new Set([
    "impression",
    "view",
    "click",
    "add_to_cart",
    "purchase",
    "wishlist",
  ]);

  static async track(userId, payload = {}) {
    const eventType = String(payload.event_type || "").trim().toLowerCase();
    const productId = Number(payload.product_id);
    const sessionId = payload.session_id ? String(payload.session_id) : null;
    const meta = payload.meta && typeof payload.meta === "object" ? payload.meta : {};

    if (!this.ALLOWED_EVENT_TYPES.has(eventType)) {
      throw new Error("event_type không hợp lệ");
    }
    if (!productId) {
      throw new Error("product_id không hợp lệ");
    }

    return UserProductEvent.create({
      user_id: Number(userId),
      product_id: productId,
      event_type: eventType,
      session_id: sessionId,
      meta,
    });
  }
}

module.exports = UserEventService;

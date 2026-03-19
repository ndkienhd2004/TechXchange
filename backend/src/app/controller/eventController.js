const UserEventService = require("../service/userEventService");
const { response } = require("../utils/response");

class EventController {
  static async trackProductEvent(req, res) {
    try {
      const userId = Number(req.user.id);
      const event = await UserEventService.track(userId, {
        product_id: req.body.product_id,
        event_type: req.body.event_type,
        session_id: req.body.session_id,
        meta: req.body.meta,
      });
      return response.created(res, "Ghi nhận sự kiện thành công", event);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }
}

module.exports = EventController;

const SepayWebhookService = require("../service/sepayWebhookService");

class SepayWebhookController {
  static async receive(req, res) {
    try {
      const shouldLogRaw = String(process.env.SEPAY_LOG_RAW_WEBHOOK || "false")
        .trim()
        .toLowerCase();
      if (shouldLogRaw === "true") {
        console.log(
          "[SEPAY RAW WEBHOOK]",
          JSON.stringify(
            {
              headers: {
                authorization: req.headers.authorization || null,
                "content-type": req.headers["content-type"] || null,
              },
              body: req.body || {},
            },
            null,
            2,
          ),
        );
      }

      const result = await SepayWebhookService.handleIncomingWebhook(
        req.body || {},
        req.headers.authorization,
      );
      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      if (error.status === 401) {
        return res.status(401).json({
          success: false,
          message: error.message || "Unauthorized",
        });
      }
      return res.status(400).json({
        success: false,
        message: error.message || "Invalid webhook payload",
      });
    }
  }
}

module.exports = SepayWebhookController;

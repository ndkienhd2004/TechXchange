const { sequelize, Order, Payment, SepayWebhookEvent } = require("../../models");

class SepayWebhookService {
  static normalizeVaCode(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    // SePay UI có thể hiển thị dạng: "96247CSSOM (TechXchange)"
    // Chỉ lấy token VA chính để đối soát.
    const token = raw.split(/[()\s]/).find((part) => String(part).trim().length > 0);
    return String(token || "").trim().toLowerCase();
  }

  static verifyAuthorization(authHeader) {
    const expectedApiKey = String(process.env.SEPAY_API_KEY || "").trim();
    if (!expectedApiKey) return;

    const actual = String(authHeader || "").trim().toLowerCase();
    const expected = `apikey ${expectedApiKey}`.toLowerCase();
    if (actual !== expected) {
      const err = new Error("Unauthorized webhook");
      err.status = 401;
      throw err;
    }
  }

  static extractOrderId(rawCode, rawContent) {
    const code = String(rawCode || "").trim();
    const content = String(rawContent || "").trim();

    const prefix = String(process.env.SEPAY_ORDER_CODE_PREFIX || "ORDER_").trim();
    if (prefix && code) {
      const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`^${escaped}(\\d+)$`, "i");
      const match = code.match(regex);
      if (match) return Number(match[1]);
    }

    if (/^\d+$/.test(code)) return Number(code);

    if (prefix && content) {
      const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`${escaped}(\\d+)`, "i");
      const match = content.match(regex);
      if (match) return Number(match[1]);
    }

    // Fallback mềm cho các format như ORDER4 / ORDER-4 / ORDER 4
    const softCode = code.match(/order[_\-\s]?(\d+)/i);
    if (softCode) return Number(softCode[1]);
    const softContent = content.match(/order[_\-\s]?(\d+)/i);
    if (softContent) return Number(softContent[1]);

    return null;
  }

  static toDateTime(value) {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
  }

  static normalizePayload(payload = {}) {
    const sepayId = Number(payload.id);
    if (!sepayId) throw new Error("Webhook thiếu id giao dịch");

    const transferType = String(payload.transferType || "").toLowerCase();
    if (transferType !== "in" && transferType !== "out") {
      throw new Error("transferType không hợp lệ");
    }

    const transferAmount = Number(payload.transferAmount || 0);
    if (!Number.isFinite(transferAmount) || transferAmount < 0) {
      throw new Error("transferAmount không hợp lệ");
    }

    return {
      sepay_id: sepayId,
      gateway: payload.gateway ? String(payload.gateway).trim() : null,
      transaction_date: this.toDateTime(payload.transactionDate),
      account_number: payload.accountNumber
        ? String(payload.accountNumber).trim()
        : null,
      code: payload.code ? String(payload.code).trim() : null,
      content: payload.content ? String(payload.content).trim() : null,
      transfer_type: transferType,
      transfer_amount: Number(transferAmount.toFixed(2)),
      accumulated:
        payload.accumulated !== null && payload.accumulated !== undefined
          ? Number(Number(payload.accumulated).toFixed(2))
          : null,
      sub_account: payload.subAccount ? String(payload.subAccount).trim() : null,
      reference_code: payload.referenceCode
        ? String(payload.referenceCode).trim()
        : null,
      description: payload.description ? String(payload.description).trim() : null,
      raw_payload: payload,
    };
  }

  static async handleIncomingWebhook(payload = {}, authHeader) {
    this.verifyAuthorization(authHeader);
    const normalized = this.normalizePayload(payload);

    return sequelize.transaction(async (transaction) => {
      let event = await SepayWebhookEvent.findOne({
        where: { sepay_id: normalized.sepay_id },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (event && event.process_status === "processed") {
        return {
          success: true,
          duplicated: true,
          message: "Webhook đã được xử lý trước đó",
          event_id: event.id,
          order_id: event.order_id,
        };
      }

      if (!event) {
        event = await SepayWebhookEvent.create(
          {
            ...normalized,
            process_status: "ignored",
          },
          { transaction },
        );
      } else {
        await event.update(
          {
            ...normalized,
            process_status: "ignored",
            process_message: null,
            processed_at: null,
          },
          { transaction },
        );
      }

      if (normalized.transfer_type !== "in") {
        await event.update(
          {
            process_status: "ignored",
            process_message: "Bỏ qua giao dịch tiền ra",
            processed_at: new Date(),
          },
          { transaction },
        );
        return {
          success: true,
          duplicated: false,
          message: "Đã ghi nhận webhook tiền ra",
          event_id: event.id,
          order_id: null,
        };
      }

      const requiredVa = String(process.env.SEPAY_VIRTUAL_ACCOUNT || "").trim();
      const enforceVa = String(process.env.SEPAY_REQUIRE_SUB_ACCOUNT || "true")
        .trim()
        .toLowerCase();
      if (requiredVa && enforceVa !== "false") {
        const incomingVa = this.normalizeVaCode(normalized.sub_account);
        const expectedVa = this.normalizeVaCode(requiredVa);
        if (!incomingVa || incomingVa !== expectedVa) {
          await event.update(
            {
              process_status: "ignored",
              process_message: `Sai VA. expected=${expectedVa}, actual=${incomingVa || "null"}`,
              processed_at: new Date(),
            },
            { transaction },
          );
          return {
            success: true,
            duplicated: false,
            message: "Bỏ qua webhook vì không đúng tài khoản ảo (VA)",
            event_id: event.id,
            order_id: null,
          };
        }
      }

      const orderId = this.extractOrderId(normalized.code, normalized.content);
      if (!orderId) {
        await event.update(
          {
            process_status: "ignored",
            process_message: "Không tìm thấy order_id trong code/content",
            processed_at: new Date(),
          },
          { transaction },
        );
        return {
          success: true,
          duplicated: false,
          message: "Không map được đơn hàng từ code",
          event_id: event.id,
          order_id: null,
        };
      }

      const order = await Order.findOne({
        where: { id: orderId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!order) {
        await event.update(
          {
            process_status: "ignored",
            process_message: "Không tìm thấy đơn hàng",
            processed_at: new Date(),
          },
          { transaction },
        );
        return {
          success: true,
          duplicated: false,
          message: "Không tìm thấy đơn hàng để cập nhật",
          event_id: event.id,
          order_id: null,
        };
      }

      const payment = await Payment.findOne({
        where: { order_id: order.id, payment_method: "bank_transfer" },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!payment) {
        await event.update(
          {
            order_id: order.id,
            process_status: "ignored",
            process_message: "Đơn hàng không dùng bank_transfer",
            processed_at: new Date(),
          },
          { transaction },
        );
        return {
          success: true,
          duplicated: false,
          message: "Đơn hàng không phải thanh toán chuyển khoản",
          event_id: event.id,
          order_id: order.id,
        };
      }

      const expectedAmount = Number(payment.amount || 0);
      if (Number(normalized.transfer_amount) < expectedAmount) {
        await event.update(
          {
            order_id: order.id,
            process_status: "ignored",
            process_message: `Số tiền nhận (${normalized.transfer_amount}) nhỏ hơn cần thu (${expectedAmount})`,
            processed_at: new Date(),
          },
          { transaction },
        );
        return {
          success: true,
          duplicated: false,
          message: "Số tiền chuyển khoản chưa đủ",
          event_id: event.id,
          order_id: order.id,
        };
      }

      if (payment.status !== "completed") {
        const txnId =
          normalized.reference_code ||
          `SEPAY-${normalized.sepay_id}-${String(order.id)}`;
        await payment.update(
          {
            status: "completed",
            transaction_id: txnId,
          },
          { transaction },
        );
      }

      await event.update(
        {
          order_id: order.id,
          process_status: "processed",
          process_message: "Đã đối soát thanh toán thành công",
          processed_at: new Date(),
        },
        { transaction },
      );

      return {
        success: true,
        duplicated: false,
        message: "Webhook xử lý thành công",
        event_id: event.id,
        order_id: order.id,
      };
    });
  }
}

module.exports = SepayWebhookService;

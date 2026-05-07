class AssistantService {
  static getBaseUrl() {
    return String(
      process.env.CHATBOT_SERVICE_URL || "http://localhost:8000",
    ).replace(/\/$/, "");
  }

  static getTimeoutMs() {
    const configured = Number(process.env.CHATBOT_SERVICE_TIMEOUT_MS || 12000);
    if (!Number.isFinite(configured) || configured < 1000) {
      return 12000;
    }
    return configured;
  }

  static buildUrl(path, query = {}) {
    const requestUrl = new URL(path, `${this.getBaseUrl()}/`);
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      requestUrl.searchParams.set(key, String(value));
    });
    return requestUrl.toString();
  }

  static async request(path, options = {}) {
    const {
      method = "GET",
      query = {},
      body,
      userId,
      userRole,
      authorization,
    } = options;

    const headers = { Accept: "application/json" };
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }
    if (userId) {
      headers["x-user-id"] = String(userId);
    }
    if (userRole) {
      headers["x-user-role"] = String(userRole);
    }
    if (authorization) {
      headers.authorization = String(authorization);
    }

    const timeoutMs = this.getTimeoutMs();
    const abortController = new AbortController();
    const timeoutHandle = setTimeout(() => abortController.abort(), timeoutMs);

    let httpResponse;
    try {
      httpResponse = await fetch(this.buildUrl(path, query), {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: abortController.signal,
      });
    } catch (error) {
      if (error?.name === "AbortError") {
        const timeoutError = new Error(
          `Chatbot service timeout sau ${timeoutMs}ms`,
        );
        timeoutError.status = 504;
        throw timeoutError;
      }
      const connectionError = new Error(
        `Không thể kết nối chatbot service: ${error?.message || "Unknown error"}`,
      );
      connectionError.status = 503;
      throw connectionError;
    } finally {
      clearTimeout(timeoutHandle);
    }

    const raw = await httpResponse.text();
    let payload = null;
    if (raw) {
      try {
        payload = JSON.parse(raw);
      } catch {
        payload = { message: raw };
      }
    }

    if (!httpResponse.ok) {
      const detailMessage =
        (payload && typeof payload.message === "string" && payload.message) ||
        (payload && typeof payload.detail === "string" && payload.detail) ||
        `Chatbot service lỗi HTTP ${httpResponse.status}`;
      const serviceError = new Error(detailMessage);
      serviceError.status = httpResponse.status;
      serviceError.payload = payload;
      throw serviceError;
    }

    return payload || { code: "200", success: true, message: "OK" };
  }

  static async health() {
    return this.request("/api/assistant/health", { method: "GET" });
  }

  static async chat({ userId, userRole, authorization, message, locale, conversationId }) {
    return this.request("/api/assistant/chat", {
      method: "POST",
      userId,
      userRole,
      authorization,
      body: {
        message,
        locale: locale || "vi-VN",
        conversation_id: conversationId || null,
      },
    });
  }

  static async getConversations({ userId, userRole, authorization, limit = 20 }) {
    return this.request("/api/assistant/conversations", {
      method: "GET",
      userId,
      userRole,
      authorization,
      query: { limit },
    });
  }

  static async getMessages({
    userId,
    userRole,
    authorization,
    conversationId,
    limit = 50,
  }) {
    return this.request(`/api/assistant/messages/${conversationId}`, {
      method: "GET",
      userId,
      userRole,
      authorization,
      query: { limit },
    });
  }

  static async ingest({ userId, userRole, authorization, documents }) {
    return this.request("/api/assistant/ingest", {
      method: "POST",
      userId,
      userRole,
      authorization,
      body: { documents: Array.isArray(documents) ? documents : [] },
    });
  }

  static async reindex({ userId, userRole, authorization }) {
    return this.request("/api/assistant/reindex", {
      method: "POST",
      userId,
      userRole,
      authorization,
    });
  }
}

module.exports = AssistantService;

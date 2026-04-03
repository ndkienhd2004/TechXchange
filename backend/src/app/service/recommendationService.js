const ProductService = require("./productService");

class RecommendationService {
  static normalizeLimit(limit, fallback = 8) {
    const parsedLimit = Number(limit);
    if (!Number.isFinite(parsedLimit)) {
      return fallback;
    }
    return Math.min(Math.max(Math.trunc(parsedLimit), 1), 50);
  }

  static normalizeSimilarMode(mode) {
    const normalizedMode = String(mode || "content")
      .trim()
      .toLowerCase();
    if (normalizedMode === "collaborative" || normalizedMode === "cf") {
      return "collaborative";
    }
    return "content";
  }

  static normalizeUserMode(mode) {
    const normalizedMode = String(mode || "hybrid")
      .trim()
      .toLowerCase();

    if (normalizedMode === "content" || normalizedMode === "content-based") {
      return "content";
    }
    if (normalizedMode === "collaborative" || normalizedMode === "cf") {
      return "collaborative";
    }
    return "hybrid";
  }

  static getBaseUrl() {
    return String(
      process.env.RECOMMENDATION_SERVICE_URL || "http://localhost:8010",
    ).replace(/\/$/, "");
  }

  static getTimeoutMs() {
    const configuredTimeout = Number(
      process.env.RECOMMENDATION_SERVICE_TIMEOUT_MS || 5000,
    );
    if (!Number.isFinite(configuredTimeout) || configuredTimeout < 1000) {
      return 5000;
    }
    return configuredTimeout;
  }

  static buildEndpoint(productId, mode) {
    if (mode === "collaborative") {
      return `/recommend/similar-collaborative/${productId}`;
    }
    return `/recommend/similar/${productId}`;
  }

  static buildUserEndpoint(userId, mode) {
    if (mode === "content") {
      return `/recommend/content-based/${userId}`;
    }
    if (mode === "collaborative") {
      return `/recommend/collaborative/${userId}`;
    }
    return `/recommend/hybrid/${userId}`;
  }

  static extractOrderedProductIds(recommendationItems, excludedProductId = null) {
    const orderedProductIds = [];
    recommendationItems.forEach((item) => {
      const candidateId = Number(item?.product_id);
      const shouldExclude =
        Number.isFinite(excludedProductId) &&
        candidateId === Number(excludedProductId);
      if (
        Number.isFinite(candidateId) &&
        candidateId > 0 &&
        !shouldExclude &&
        !orderedProductIds.includes(candidateId)
      ) {
        orderedProductIds.push(candidateId);
      }
    });
    return orderedProductIds;
  }

  static async hydrateProductsForRecommendation(
    recommendationItems = [],
    excludedProductId = null,
  ) {
    const orderedProductIds = this.extractOrderedProductIds(
      recommendationItems,
      excludedProductId,
    );

    if (orderedProductIds.length === 0) {
      return [];
    }

    const productRows = await ProductService.getProductsByIds(
      orderedProductIds,
      ["active"],
    );

    const scoreByProductId = new Map(
      recommendationItems
        .map((item) => [Number(item?.product_id), Number(item?.score || 0)])
        .filter(
          ([rowProductId]) => Number.isFinite(rowProductId) && rowProductId > 0,
        ),
    );

    return productRows.map((productRow) => {
      const product =
        productRow && typeof productRow.toJSON === "function"
          ? productRow.toJSON()
          : productRow;
      return {
        ...product,
        recommendation_score: scoreByProductId.get(Number(product.id)) ?? null,
      };
    });
  }

  static async request(path, query = {}) {
    const requestUrl = new URL(path, `${this.getBaseUrl()}/`);
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }
      requestUrl.searchParams.set(key, String(value));
    });

    const timeoutMs = this.getTimeoutMs();
    const abortController = new AbortController();
    const timeoutHandle = setTimeout(() => abortController.abort(), timeoutMs);

    let httpResponse;
    try {
      httpResponse = await fetch(requestUrl.toString(), {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: abortController.signal,
      });
    } catch (error) {
      if (error?.name === "AbortError") {
        throw new Error(
          `Recommendation service timeout sau ${timeoutMs}ms`,
        );
      }
      throw new Error(
        `Không thể kết nối recommendation service: ${
          error?.message || "Unknown error"
        }`,
      );
    } finally {
      clearTimeout(timeoutHandle);
    }

    let payload;
    try {
      payload = await httpResponse.json();
    } catch (error) {
      throw new Error(
        `Recommendation service trả về JSON không hợp lệ (${httpResponse.status})`,
      );
    }

    if (!httpResponse.ok) {
      const detailMessage =
        typeof payload?.detail === "string"
          ? payload.detail
          : typeof payload?.message === "string"
            ? payload.message
            : "";
      throw new Error(
        detailMessage || `Recommendation service lỗi HTTP ${httpResponse.status}`,
      );
    }

    return payload;
  }

  static async getSimilarProducts(productId, options = {}) {
    const normalizedProductId = Number(productId);
    if (!Number.isFinite(normalizedProductId) || normalizedProductId <= 0) {
      throw new Error("ID sản phẩm không hợp lệ");
    }

    const mode = this.normalizeSimilarMode(options.mode);
    const limit = this.normalizeLimit(options.limit, 8);
    const endpoint = this.buildEndpoint(normalizedProductId, mode);

    const recommendationPayload = await this.request(endpoint, { limit });
    const recommendationItems = Array.isArray(recommendationPayload?.items)
      ? recommendationPayload.items
      : [];
    const products = await this.hydrateProductsForRecommendation(
      recommendationItems,
      normalizedProductId,
    );

    return {
      strategy: recommendationPayload?.strategy || null,
      mode,
      items: recommendationItems,
      products,
      total: products.length,
    };
  }

  static async getUserRecommendations(userId, options = {}) {
    const normalizedUserId = Number(userId);
    if (!Number.isFinite(normalizedUserId) || normalizedUserId <= 0) {
      throw new Error("ID người dùng không hợp lệ");
    }

    const mode = this.normalizeUserMode(options.mode);
    const limit = this.normalizeLimit(options.limit, 8);
    const endpoint = this.buildUserEndpoint(normalizedUserId, mode);

    const recommendationPayload = await this.request(endpoint, { limit });
    const recommendationItems = Array.isArray(recommendationPayload?.items)
      ? recommendationPayload.items
      : [];

    const products = await this.hydrateProductsForRecommendation(
      recommendationItems,
    );

    return {
      strategy: recommendationPayload?.strategy || null,
      mode,
      user_id: normalizedUserId,
      items: recommendationItems,
      products,
      total: products.length,
    };
  }
}

module.exports = RecommendationService;

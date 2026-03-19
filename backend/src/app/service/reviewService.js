const { Op } = require("sequelize");
const { Review, Order, OrderItem, User } = require("../../models");

class ReviewService {
  static normalizeReviewImages(imagesInput) {
    if (!Array.isArray(imagesInput)) return [];
    return imagesInput
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .slice(0, 6);
  }

  static parseStoredReviewImages(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map((item) => String(item || "").trim()).filter(Boolean);
    }
    try {
      const parsed = JSON.parse(String(raw));
      if (!Array.isArray(parsed)) return [];
      return parsed.map((item) => String(item || "").trim()).filter(Boolean);
    } catch {
      return [];
    }
  }

  static async createProductReview(userId, payload = {}) {
    const productId = Number(payload.product_id);
    const rating = Number(payload.rating);
    const comment = payload.comment ? String(payload.comment).trim() : null;
    const images = ReviewService.normalizeReviewImages(payload.images);

    if (!productId) throw new Error("product_id không hợp lệ");
    if (Number.isNaN(rating) || rating < 1 || rating > 5) {
      throw new Error("rating phải từ 1 đến 5");
    }
    if (Math.round(rating * 2) !== rating * 2) {
      throw new Error("rating phải theo bước 0.5");
    }

    const delivered = await Order.findOne({
      where: {
        customer_id: userId,
        status: "completed",
      },
      include: [
        {
          model: OrderItem,
          as: "items",
          required: true,
          where: { product_id: productId },
        },
      ],
      order: [["created_at", "DESC"]],
    });

    if (!delivered) {
      throw new Error("Bạn chỉ có thể đánh giá sau khi đã mua sản phẩm");
    }

    const existing = await Review.findOne({
      where: {
        reviewer_id: userId,
        product_id: productId,
      },
    });
    if (existing) {
      throw new Error("Bạn đã đánh giá sản phẩm này rồi");
    }

    return Review.create({
      reviewer_id: userId,
      product_id: productId,
      rating,
      comment,
      images: images.length > 0 ? JSON.stringify(images) : null,
    });
  }

  static async getProductReviews(productId) {
    const rows = await Review.findAll({
      where: { product_id: productId },
      include: [
        {
          model: User,
          as: "reviewer",
          attributes: ["id", "username"],
        },
      ],
      order: [["created_at", "DESC"]],
    });
    return rows.map((row) => {
      const payload = row.toJSON();
      return {
        ...payload,
        images: ReviewService.parseStoredReviewImages(payload.images),
      };
    });
  }

  static async getReviewStats(productIds = []) {
    if (!Array.isArray(productIds) || productIds.length === 0) return {};
    const rows = await Review.findAll({
      where: { product_id: { [Op.in]: productIds } },
      attributes: ["product_id", "rating"],
    });
    return rows.reduce((acc, row) => {
      const pid = Number(row.product_id);
      const prev = acc[pid] || { total: 0, sum: 0 };
      prev.total += 1;
      prev.sum += Number(row.rating || 0);
      acc[pid] = prev;
      return acc;
    }, {});
  }
}

module.exports = ReviewService;

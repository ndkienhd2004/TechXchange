const { Op } = require("sequelize");
const { Review, Order, OrderItem, User } = require("../../models");

class ReviewService {
  static async createProductReview(userId, payload = {}) {
    const productId = Number(payload.product_id);
    const rating = Number(payload.rating);
    const comment = payload.comment ? String(payload.comment).trim() : null;

    if (!productId) throw new Error("product_id không hợp lệ");
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error("rating phải từ 1 đến 5");
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
    });
  }

  static async getProductReviews(productId) {
    return Review.findAll({
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

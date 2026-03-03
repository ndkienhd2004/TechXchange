const ReviewService = require("../service/reviewService");
const { response } = require("../utils/response");

class ReviewController {
  static async createReview(req, res) {
    try {
      const review = await ReviewService.createProductReview(req.user.id, req.body);
      return response.created(res, "Đánh giá thành công", review);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  static async getProductReviews(req, res) {
    try {
      const productId = Number(req.params.productId);
      if (!productId) return response.badRequest(res, "productId không hợp lệ");
      const reviews = await ReviewService.getProductReviews(productId);
      return response.success(res, "Lấy đánh giá thành công", { reviews });
    } catch (error) {
      return response.serverError(res, error.message);
    }
  }
}

module.exports = ReviewController;

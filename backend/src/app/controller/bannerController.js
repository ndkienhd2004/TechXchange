const BannerService = require("../service/bannerService");
const { response } = require("../utils/response");

/**
 * Banner Controller - Xử lý requests liên quan đến banner
 */
class BannerController {
  /**
   * Tạo banner mới (Admin)
   * POST /admin/banners
   */
  static async createBanner(req, res) {
    try {
      const name = req.body.name ? String(req.body.name).trim() : "";
      const image = req.body.image ? String(req.body.image).trim() : null;
      const status =
        req.body.status === undefined ? undefined : Number(req.body.status);

      if (!name) {
        return response.badRequest(res, "Tên banner là bắt buộc");
      }

      if (status !== undefined && Number.isNaN(status)) {
        return response.badRequest(res, "Trạng thái banner không hợp lệ");
      }

      const banner = await BannerService.createBanner({
        name,
        image,
        status,
      });

      return response.created(res, "Tạo banner thành công", banner);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  /**
   * Lấy danh sách banner
   * GET /banners
   */
  static async getBanners(req, res) {
    try {
      const onlyActive =
        req.query.status && String(req.query.status) === "all" ? false : true;

      const banners = await BannerService.getBanners(onlyActive);

      return response.success(res, "Lấy danh sách banner thành công", banners);
    } catch (error) {
      return response.serverError(res, error.message);
    }
  }

  /**
   * Thêm sản phẩm vào banner (Admin)
   * POST /admin/banners/:id/details
   */
  static async addBannerDetail(req, res) {
    try {
      const bannerId = Number(req.params.id);
      const productId = Number(req.body.product_id);

      if (!bannerId || !productId) {
        return response.badRequest(res, "Banner ID và Product ID là bắt buộc");
      }

      const detail = await BannerService.addBannerDetail(bannerId, productId);

      return response.created(
        res,
        "Thêm sản phẩm vào banner thành công",
        detail
      );
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  /**
   * Xóa sản phẩm khỏi banner (Admin)
   * DELETE /admin/banners/:id/details/:productId
   */
  static async removeBannerDetail(req, res) {
    try {
      const bannerId = Number(req.params.id);
      const productId = Number(req.params.productId);

      if (!bannerId || !productId) {
        return response.badRequest(res, "Banner ID và Product ID là bắt buộc");
      }

      await BannerService.removeBannerDetail(bannerId, productId);

      return response.success(res, "Xóa sản phẩm khỏi banner thành công");
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }
}

module.exports = BannerController;

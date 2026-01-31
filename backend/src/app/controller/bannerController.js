const BannerService = require("../service/bannerService");

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
        return res.status(400).json({
          success: false,
          message: "Tên banner là bắt buộc",
        });
      }

      if (status !== undefined && Number.isNaN(status)) {
        return res.status(400).json({
          success: false,
          message: "Trạng thái banner không hợp lệ",
        });
      }

      const banner = await BannerService.createBanner({
        name,
        image,
        status,
      });

      return res.status(201).json({
        success: true,
        message: "Tạo banner thành công",
        data: banner,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
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

      return res.status(200).json({
        success: true,
        message: "Lấy danh sách banner thành công",
        data: banners,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
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
        return res.status(400).json({
          success: false,
          message: "Banner ID và Product ID là bắt buộc",
        });
      }

      const detail = await BannerService.addBannerDetail(
        bannerId,
        productId
      );

      return res.status(201).json({
        success: true,
        message: "Thêm sản phẩm vào banner thành công",
        data: detail,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
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
        return res.status(400).json({
          success: false,
          message: "Banner ID và Product ID là bắt buộc",
        });
      }

      await BannerService.removeBannerDetail(bannerId, productId);

      return res.status(200).json({
        success: true,
        message: "Xóa sản phẩm khỏi banner thành công",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = BannerController;

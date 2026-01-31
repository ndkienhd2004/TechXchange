const { Banner, BannerDetail, Product, ProductImage } = require("../../models");

/**
 * Banner Service - Xử lý nghiệp vụ liên quan đến banner
 */
class BannerService {
  /**
   * Tạo banner mới
   * @param {object} payload
   * @returns {Promise<object>}
   */
  static async createBanner(payload) {
    const { name, image, status } = payload;

    try {
      const banner = await Banner.create({
        name,
        image: image || null,
        status: status ?? 1,
      });

      return banner;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy danh sách banner
   * @param {boolean} onlyActive
   * @returns {Promise<object[]>}
   */
  static async getBanners(onlyActive = true) {
    try {
      const whereClause = {};
      if (onlyActive) {
        whereClause.status = 1;
      }

      return await Banner.findAll({
        where: whereClause,
        order: [["created_at", "DESC"]],
        include: [
          {
            model: BannerDetail,
            as: "details",
            include: [
              {
                model: Product,
                as: "product",
                attributes: ["id", "name", "price", "status", "quantity"],
                include: [
                  {
                    model: ProductImage,
                    as: "images",
                    attributes: ["id", "url", "sort_order"],
                  },
                ],
              },
            ],
          },
        ],
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Thêm sản phẩm vào banner
   * @param {number} bannerId
   * @param {number} productId
   * @returns {Promise<object>}
   */
  static async addBannerDetail(bannerId, productId) {
    try {
      const banner = await Banner.findByPk(bannerId);
      if (!banner) {
        throw new Error("Banner không tồn tại");
      }

      const product = await Product.findByPk(productId);
      if (!product) {
        throw new Error("Sản phẩm không tồn tại");
      }

      const detail = await BannerDetail.create({
        banner_id: bannerId,
        product_id: productId,
      });

      return detail;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xóa sản phẩm khỏi banner
   * @param {number} bannerId
   * @param {number} productId
   * @returns {Promise<void>}
   */
  static async removeBannerDetail(bannerId, productId) {
    try {
      const detail = await BannerDetail.findOne({
        where: { banner_id: bannerId, product_id: productId },
      });

      if (!detail) {
        throw new Error("Banner detail không tồn tại");
      }

      await detail.destroy();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = BannerService;

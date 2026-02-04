const { Brand, Product, ProductCatalog } = require("../../models");

/**
 * Brand Service - Xử lý nghiệp vụ liên quan đến thương hiệu
 */
class BrandService {
  /**
   * Tạo thương hiệu mới
   * @param {object} payload
   * @returns {Promise<object>}
   */
  static async createBrand(payload) {
    const { name, image } = payload;

    try {
      const existing = await Brand.findOne({ where: { name } });
      if (existing) {
        throw new Error("Thương hiệu đã tồn tại");
      }

      const brand = await Brand.create({
        name,
        image: image || null,
      });

      return brand;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy danh sách thương hiệu
   * @returns {Promise<object[]>}
   */
  static async getBrands() {
    try {
      return await Brand.findAll({
        order: [["name", "ASC"]],
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cập nhật thương hiệu
   * @param {number} brandId
   * @param {object} payload
   * @returns {Promise<object>}
   */
  static async updateBrand(brandId, payload) {
    try {
      const brand = await Brand.findByPk(brandId);
      if (!brand) {
        throw new Error("Thương hiệu không tồn tại");
      }

      if (payload.name && payload.name !== brand.name) {
        const existing = await Brand.findOne({ where: { name: payload.name } });
        if (existing) {
          throw new Error("Tên thương hiệu đã được sử dụng");
        }
      }

      await brand.update({
        name: payload.name ?? brand.name,
        image: payload.image ?? brand.image,
      });

      return brand;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xóa thương hiệu
   * @param {number} brandId
   * @returns {Promise<void>}
   */
  static async deleteBrand(brandId) {
    try {
      const brand = await Brand.findByPk(brandId);
      if (!brand) {
        throw new Error("Thương hiệu không tồn tại");
      }

      const usedByProduct = await Product.findOne({
        where: { brand_id: brandId },
      });
      if (usedByProduct) {
        throw new Error("Không thể xóa thương hiệu đang được sử dụng");
      }

      const usedByCatalog = await ProductCatalog.findOne({
        where: { brand_id: brandId },
      });
      if (usedByCatalog) {
        throw new Error("Không thể xóa thương hiệu đang được sử dụng trong catalog");
      }

      await brand.destroy();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = BrandService;

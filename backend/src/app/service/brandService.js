const { Brand, Product, ProductCatalog } = require("../../models");

/**
 * Brand Service - Xử lý nghiệp vụ liên quan đến thương hiệu
 */
class BrandService {
  static logDeleteEvent(stage, payload = {}) {
    console.log(`[Admin][BrandDelete][${stage}]`, payload);
  }

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
  static async deleteBrand(brandId, options = {}) {
    const normalizedBrandId = Number(brandId);
    const actorId = options.actorId ? Number(options.actorId) : null;
    const context = {
      brandId: normalizedBrandId,
      actorId,
    };

    BrandService.logDeleteEvent("Attempt", context);

    try {
      const brand = await Brand.findByPk(normalizedBrandId);
      if (!brand) {
        BrandService.logDeleteEvent("NotFound", context);
        throw new Error("Thương hiệu không tồn tại");
      }

      const [productUsageCount, catalogUsageCount, productSamples, catalogSamples] =
        await Promise.all([
          Product.count({
            where: { brand_id: normalizedBrandId },
          }),
          ProductCatalog.count({
            where: { brand_id: normalizedBrandId },
          }),
          Product.findAll({
            where: { brand_id: normalizedBrandId },
            attributes: ["id", "name", "status", "seller_id", "store_id"],
            limit: 5,
            order: [["id", "DESC"]],
          }),
          ProductCatalog.findAll({
            where: { brand_id: normalizedBrandId },
            attributes: ["id", "name", "status", "category_id"],
            limit: 5,
            order: [["id", "DESC"]],
          }),
        ]);

      if (productUsageCount > 0 || catalogUsageCount > 0) {
        BrandService.logDeleteEvent("BlockedInUse", {
          ...context,
          brandName: brand.name,
          productUsageCount,
          catalogUsageCount,
          productSamples: productSamples.map((item) => item.toJSON()),
          catalogSamples: catalogSamples.map((item) => item.toJSON()),
        });
        throw new Error(
          `Không thể xóa thương hiệu đang được sử dụng (sản phẩm: ${productUsageCount}, catalog: ${catalogUsageCount})`
        );
      }

      await brand.destroy();
      BrandService.logDeleteEvent("Success", {
        ...context,
        brandName: brand.name,
      });
    } catch (error) {
      BrandService.logDeleteEvent("Error", {
        ...context,
        message: error.message,
      });
      throw error;
    }
  }
}

module.exports = BrandService;

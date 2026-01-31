const BrandService = require("../service/brandService");

/**
 * Brand Controller - Xử lý requests liên quan đến thương hiệu
 */
class BrandController {
  /**
   * Tạo thương hiệu mới (Admin)
   * POST /admin/brands
   */
  static async createBrand(req, res) {
    try {
      const name = req.body.name ? String(req.body.name).trim() : "";
      const image = req.body.image ? String(req.body.image).trim() : null;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Tên thương hiệu là bắt buộc",
        });
      }

      const brand = await BrandService.createBrand({ name, image });

      return res.status(201).json({
        success: true,
        message: "Tạo thương hiệu thành công",
        data: brand,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Lấy danh sách thương hiệu
   * GET /brands
   */
  static async getBrands(req, res) {
    try {
      const brands = await BrandService.getBrands();

      return res.status(200).json({
        success: true,
        message: "Lấy danh sách thương hiệu thành công",
        data: brands,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Cập nhật thương hiệu (Admin)
   * PUT /admin/brands/:id
   */
  static async updateBrand(req, res) {
    try {
      const brandId = Number(req.params.id);
      const name = req.body.name ? String(req.body.name).trim() : undefined;
      const image = req.body.image ? String(req.body.image).trim() : undefined;

      if (!brandId) {
        return res.status(400).json({
          success: false,
          message: "ID thương hiệu không hợp lệ",
        });
      }

      if (name === "") {
        return res.status(400).json({
          success: false,
          message: "Tên thương hiệu không được để trống",
        });
      }

      const brand = await BrandService.updateBrand(brandId, {
        name,
        image,
      });

      return res.status(200).json({
        success: true,
        message: "Cập nhật thương hiệu thành công",
        data: brand,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Xóa thương hiệu (Admin)
   * DELETE /admin/brands/:id
   */
  static async deleteBrand(req, res) {
    try {
      const brandId = Number(req.params.id);
      if (!brandId) {
        return res.status(400).json({
          success: false,
          message: "ID thương hiệu không hợp lệ",
        });
      }

      await BrandService.deleteBrand(brandId);

      return res.status(200).json({
        success: true,
        message: "Xóa thương hiệu thành công",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = BrandController;

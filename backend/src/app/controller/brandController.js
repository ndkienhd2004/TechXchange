const BrandService = require("../service/brandService");
const { response } = require("../utils/response");

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
        return response.badRequest(res, "Tên thương hiệu là bắt buộc");
      }

      const brand = await BrandService.createBrand({ name, image });

      return response.created(res, "Tạo thương hiệu thành công", brand);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  /**
   * Lấy danh sách thương hiệu
   * GET /brands
   */
  static async getBrands(req, res) {
    try {
      const brands = await BrandService.getBrands();

      return response.success(
        res,
        "Lấy danh sách thương hiệu thành công",
        brands
      );
    } catch (error) {
      return response.serverError(res, error.message);
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
        return response.badRequest(res, "ID thương hiệu không hợp lệ");
      }

      if (name === "") {
        return response.badRequest(res, "Tên thương hiệu không được để trống");
      }

      const brand = await BrandService.updateBrand(brandId, {
        name,
        image,
      });

      return response.success(res, "Cập nhật thương hiệu thành công", brand);
    } catch (error) {
      return response.badRequest(res, error.message);
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
        return response.badRequest(res, "ID thương hiệu không hợp lệ");
      }

      await BrandService.deleteBrand(brandId);

      return response.success(res, "Xóa thương hiệu thành công");
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }
}

module.exports = BrandController;

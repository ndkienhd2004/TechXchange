const GhnService = require("../service/ghnService");
const { response } = require("../utils/response");

class GhnController {
  static async getProvinces(req, res) {
    try {
      const provinces = await GhnService.getProvinces();
      return response.success(res, "Lấy tỉnh/thành GHN thành công", {
        provinces,
      });
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  static async getDistricts(req, res) {
    try {
      const districts = await GhnService.getDistricts(req.query.province_id);
      return response.success(res, "Lấy quận/huyện GHN thành công", {
        districts,
      });
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  static async getWards(req, res) {
    try {
      const wards = await GhnService.getWards(req.query.district_id);
      return response.success(res, "Lấy phường/xã GHN thành công", { wards });
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  static async calculateFee(req, res) {
    try {
      const fee = await GhnService.calculateFee(req.body || {});
      return response.success(res, "Tính phí GHN thành công", { fee });
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }
}

module.exports = GhnController;

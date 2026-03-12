const UserAddressService = require("../service/userAddressService");
const { response } = require("../utils/response");

class UserAddressController {
  static async getMyAddresses(req, res) {
    try {
      const addresses = await UserAddressService.listByUser(req.user.id);
      return response.success(res, "Lấy danh sách địa chỉ thành công", { addresses });
    } catch (error) {
      return response.serverError(res, error.message);
    }
  }

  static async createAddress(req, res) {
    try {
      const address = await UserAddressService.create(req.user.id, req.body);
      return response.created(res, "Tạo địa chỉ thành công", address);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  static async updateAddress(req, res) {
    try {
      const address = await UserAddressService.update(
        req.user.id,
        req.params.id,
        req.body,
      );
      return response.success(res, "Cập nhật địa chỉ thành công", address);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  static async setDefaultAddress(req, res) {
    try {
      const address = await UserAddressService.setDefault(req.user.id, req.params.id);
      return response.success(res, "Đặt mặc định thành công", address);
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }

  static async deleteAddress(req, res) {
    try {
      await UserAddressService.delete(req.user.id, req.params.id);
      return response.success(res, "Xóa địa chỉ thành công");
    } catch (error) {
      return response.badRequest(res, error.message);
    }
  }
}

module.exports = UserAddressController;

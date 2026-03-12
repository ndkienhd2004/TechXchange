const { sequelize, UserAddress } = require("../../models");

class UserAddressService {
  static normalizePayload(payload = {}) {
    const fullName = String(payload.full_name || "").trim();
    const phone = String(payload.phone || "").trim();
    const addressLine = String(payload.address_line || "").trim();
    const ward = String(payload.ward || "").trim();
    const district = String(payload.district || "").trim();
    const city = String(payload.city || "").trim();
    const province = String(payload.province || "").trim();
    const ghnProvinceId = payload.ghn_province_id
      ? Number(payload.ghn_province_id)
      : null;
    const ghnDistrictId = payload.ghn_district_id
      ? Number(payload.ghn_district_id)
      : null;
    const ghnWardCode = payload.ghn_ward_code
      ? String(payload.ghn_ward_code).trim()
      : null;
    const isDefault = Boolean(payload.is_default);

    if (!addressLine) throw new Error("address_line là bắt buộc");
    if (!province) throw new Error("province là bắt buộc");
    if (ghnProvinceId && !ghnDistrictId) {
      throw new Error("ghn_district_id là bắt buộc khi có ghn_province_id");
    }
    if (ghnDistrictId && !ghnWardCode) {
      throw new Error("ghn_ward_code là bắt buộc khi có ghn_district_id");
    }

    return {
      full_name: fullName || null,
      phone: phone || null,
      address_line: addressLine,
      ward: ward || null,
      district: district || null,
      city: city || null,
      province,
      ghn_province_id: ghnProvinceId,
      ghn_district_id: ghnDistrictId,
      ghn_ward_code: ghnWardCode || null,
      is_default: isDefault,
    };
  }

  static async listByUser(userId) {
    return UserAddress.findAll({
      where: { user_id: userId },
      order: [
        ["is_default", "DESC"],
        ["updated_at", "DESC"],
        ["id", "DESC"],
      ],
    });
  }

  static async create(userId, payload = {}) {
    const data = this.normalizePayload(payload);
    return sequelize.transaction(async (transaction) => {
      const count = await UserAddress.count({
        where: { user_id: userId },
        transaction,
      });
      const shouldSetDefault = data.is_default || count === 0;

      if (shouldSetDefault) {
        await UserAddress.update(
          { is_default: false },
          { where: { user_id: userId }, transaction },
        );
      }

      const created = await UserAddress.create(
        {
          ...data,
          user_id: userId,
          is_default: shouldSetDefault,
        },
        { transaction },
      );
      return created;
    });
  }

  static async update(userId, addressId, payload = {}) {
    const id = Number(addressId);
    if (!id) throw new Error("address_id không hợp lệ");
    const data = this.normalizePayload(payload);

    return sequelize.transaction(async (transaction) => {
      const address = await UserAddress.findOne({
        where: { id, user_id: userId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!address) throw new Error("Không tìm thấy địa chỉ");

      if (data.is_default) {
        await UserAddress.update(
          { is_default: false },
          { where: { user_id: userId }, transaction },
        );
      }

      await address.update(
        {
          ...data,
          is_default: data.is_default ? true : address.is_default,
        },
        { transaction },
      );
      return address;
    });
  }

  static async setDefault(userId, addressId) {
    const id = Number(addressId);
    if (!id) throw new Error("address_id không hợp lệ");

    return sequelize.transaction(async (transaction) => {
      const address = await UserAddress.findOne({
        where: { id, user_id: userId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!address) throw new Error("Không tìm thấy địa chỉ");

      await UserAddress.update(
        { is_default: false },
        { where: { user_id: userId }, transaction },
      );
      await address.update({ is_default: true }, { transaction });
      return address;
    });
  }

  static async delete(userId, addressId) {
    const id = Number(addressId);
    if (!id) throw new Error("address_id không hợp lệ");

    return sequelize.transaction(async (transaction) => {
      const address = await UserAddress.findOne({
        where: { id, user_id: userId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!address) throw new Error("Không tìm thấy địa chỉ");

      const deletedWasDefault = Boolean(address.is_default);
      await address.destroy({ transaction });

      if (deletedWasDefault) {
        const fallback = await UserAddress.findOne({
          where: { user_id: userId },
          order: [["updated_at", "DESC"]],
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (fallback) {
          await fallback.update({ is_default: true }, { transaction });
        }
      }
      return true;
    });
  }
}

module.exports = UserAddressService;

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserAddress extends Model {}

  UserAddress.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      full_name: {
        type: DataTypes.STRING(120),
      },
      phone: {
        type: DataTypes.STRING(32),
      },
      address_line: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      ward: {
        type: DataTypes.STRING(120),
      },
      district: {
        type: DataTypes.STRING(120),
      },
      city: {
        type: DataTypes.STRING(120),
      },
      province: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      ghn_province_id: {
        type: DataTypes.INTEGER,
      },
      ghn_district_id: {
        type: DataTypes.INTEGER,
      },
      ghn_ward_code: {
        type: DataTypes.STRING(20),
      },
      is_default: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "UserAddress",
      tableName: "user_addresses",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { name: "idx_user_addresses_user", fields: ["user_id"] },
        { name: "idx_user_addresses_user_default", fields: ["user_id", "is_default"] },
      ],
    },
  );

  return UserAddress;
};

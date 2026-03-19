const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Store extends Model {}

  Store.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      owner_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
      },
      description: {
        type: DataTypes.TEXT,
      },
      rating: {
        type: DataTypes.DOUBLE,
      },
      logo: {
        type: DataTypes.TEXT,
      },
      banner: {
        type: DataTypes.TEXT,
      },
      address_line: {
        type: DataTypes.TEXT,
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
      ghn_shop_id: {
        type: DataTypes.INTEGER,
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
      modelName: "Store",
      tableName: "stores",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ name: "idx_stores_owner", fields: ["owner_id"] }],
    }
  );

  return Store;
};

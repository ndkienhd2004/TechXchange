const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProductSerial extends Model {}

  ProductSerial.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      product_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      serial_code: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      serial_specs: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
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
      modelName: "ProductSerial",
      tableName: "product_serials",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          fields: ["product_id", "serial_code"],
          name: "uq_product_serials_product_code",
        },
      ],
    },
  );

  return ProductSerial;
};

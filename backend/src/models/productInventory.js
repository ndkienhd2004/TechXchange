const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProductInventory extends Model {}

  ProductInventory.init(
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
      serial_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      on_hand: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      reserved: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "ProductInventory",
      tableName: "product_inventory",
      timestamps: true,
      createdAt: false,
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          fields: ["product_id", "serial_id"],
          name: "uq_product_inventory_product_serial",
        },
      ],
    },
  );

  return ProductInventory;
};

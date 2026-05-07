const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ShopInventoryLedger extends Model {}

  ShopInventoryLedger.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      store_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      product_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      serial_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      inventory_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("import", "export"),
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      unit_cost: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      reference_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      reference_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "ShopInventoryLedger",
      tableName: "shop_inventory_ledger",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          name: "idx_shop_inventory_ledger_store_created_at",
          fields: ["store_id", "created_at"],
        },
        {
          name: "idx_shop_inventory_ledger_inventory_created_at",
          fields: ["inventory_id", "created_at"],
        },
      ],
    },
  );

  return ShopInventoryLedger;
};


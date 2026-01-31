const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Shipment extends Model {}

  Shipment.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      order_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      estimated_delivery: {
        type: DataTypes.DATE,
      },
      actual_delivery: {
        type: DataTypes.DATE,
      },
      status: {
        type: DataTypes.ENUM("pending", "shipped", "delivered", "failed"),
        defaultValue: "pending",
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Shipment",
      tableName: "shipments",
      timestamps: false,
      indexes: [
        { name: "idx_shipments_order", fields: ["order_id"] },
        { name: "idx_shipments_status_created", fields: ["status", "created_at"] },
      ],
    }
  );

  return Shipment;
};

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
      shipping_provider: {
        type: DataTypes.STRING(30),
      },
      shipping_service_id: {
        type: DataTypes.INTEGER,
      },
      shipping_service_type_id: {
        type: DataTypes.INTEGER,
      },
      shipping_fee: {
        type: DataTypes.DECIMAL(10, 2),
      },
      ghn_order_code: {
        type: DataTypes.STRING(64),
      },
      ghn_status: {
        type: DataTypes.STRING(64),
      },
      ghn_last_sync_at: {
        type: DataTypes.DATE,
      },
      ghn_payload: {
        type: DataTypes.TEXT,
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
        { name: "idx_shipments_ghn_order_code", fields: ["ghn_order_code"] },
      ],
    }
  );

  return Shipment;
};

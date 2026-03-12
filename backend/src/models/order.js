const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {}

  Order.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      customer_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      store_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      total_price: {
        type: DataTypes.DECIMAL(10, 2),
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: "VND",
      },
      payment_method: {
        type: DataTypes.ENUM("credit_card", "paypal", "bank_transfer", "cod"),
        defaultValue: "cod",
      },
      shipping_address: {
        type: DataTypes.JSONB,
      },
      status: {
        type: DataTypes.ENUM("pending", "completed", "canceled"),
        defaultValue: "pending",
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      note: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      modelName: "Order",
      tableName: "orders",
      timestamps: false,
      indexes: [
        {
          name: "idx_orders_customer_status_created",
          fields: ["customer_id", "status", "created_at"],
        },
        {
          name: "idx_orders_store_status_created",
          fields: ["store_id", "status", "created_at"],
        },
      ],
    }
  );

  return Order;
};

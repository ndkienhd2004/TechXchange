const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {}

  Payment.init(
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
      transaction_id: {
        type: DataTypes.STRING(100),
        unique: true,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
      },
      payment_method: {
        type: DataTypes.ENUM("credit_card", "paypal", "bank_transfer", "cod"),
      },
      status: {
        type: DataTypes.ENUM("pending", "completed", "failed", "refunded"),
        defaultValue: "pending",
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Payment",
      tableName: "payments",
      timestamps: false,
      indexes: [
        { name: "idx_payments_order", fields: ["order_id"] },
        { name: "idx_payments_status_created", fields: ["status", "created_at"] },
      ],
    }
  );

  return Payment;
};

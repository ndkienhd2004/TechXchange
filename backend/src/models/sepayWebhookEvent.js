const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class SepayWebhookEvent extends Model {}

  SepayWebhookEvent.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      sepay_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true,
      },
      order_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      gateway: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      transaction_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      account_number: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      code: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      transfer_type: {
        type: DataTypes.ENUM("in", "out"),
        allowNull: false,
      },
      transfer_amount: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
      },
      accumulated: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
      },
      sub_account: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      reference_code: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      raw_payload: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      process_status: {
        type: DataTypes.ENUM("processed", "ignored", "failed"),
        allowNull: false,
        defaultValue: "ignored",
      },
      process_message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      processed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "SepayWebhookEvent",
      tableName: "sepay_webhook_events",
      timestamps: false,
      indexes: [
        { name: "idx_sepay_events_order", fields: ["order_id"] },
        { name: "idx_sepay_events_created", fields: ["created_at"] },
      ],
    },
  );

  return SepayWebhookEvent;
};

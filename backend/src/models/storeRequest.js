const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class StoreRequest extends Model {}

  StoreRequest.init(
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
      store_id: {
        type: DataTypes.BIGINT,
      },
      store_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      store_description: {
        type: DataTypes.TEXT,
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
      admin_id: {
        type: DataTypes.BIGINT,
      },
      admin_note: {
        type: DataTypes.TEXT,
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
      modelName: "StoreRequest",
      tableName: "store_requests",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { name: "idx_store_requests_user", fields: ["user_id"] },
        { name: "idx_store_requests_status", fields: ["status"] },
      ],
    }
  );

  return StoreRequest;
};

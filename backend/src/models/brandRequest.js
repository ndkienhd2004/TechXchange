const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BrandRequest extends Model {}

  BrandRequest.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      requester_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      admin_id: {
        type: DataTypes.BIGINT,
      },
      brand_id: {
        type: DataTypes.BIGINT,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image: {
        type: DataTypes.TEXT,
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
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
      modelName: "BrandRequest",
      tableName: "brand_requests",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { name: "idx_brand_requests_status", fields: ["status"] },
        { name: "idx_brand_requests_requester", fields: ["requester_id"] },
        { name: "idx_brand_requests_name", fields: ["name"] },
      ],
    }
  );

  return BrandRequest;
};

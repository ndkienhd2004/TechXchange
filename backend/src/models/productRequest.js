const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProductRequest extends Model {}

  ProductRequest.init(
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
      catalog_id: {
        type: DataTypes.BIGINT,
      },
      category_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      brand_id: {
        type: DataTypes.BIGINT,
      },
      brand_name: {
        type: DataTypes.STRING(255),
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      specs: {
        type: DataTypes.JSONB,
      },
      default_image: {
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
      modelName: "ProductRequest",
      tableName: "product_requests",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { name: "idx_product_requests_status", fields: ["status"] },
        { name: "idx_product_requests_requester", fields: ["requester_id"] },
      ],
    }
  );

  return ProductRequest;
};

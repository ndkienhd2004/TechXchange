const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProductCatalog extends Model {}

  ProductCatalog.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      brand_id: {
        type: DataTypes.BIGINT,
      },
      category_id: {
        type: DataTypes.BIGINT,
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
      msrp: {
        type: DataTypes.DECIMAL(10, 2),
      },
      status: {
        type: DataTypes.ENUM(
          "draft",
          "pending",
          "active",
          "inactive",
          "rejected",
          "sold_out",
          "deleted"
        ),
        allowNull: false,
        defaultValue: "active",
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
      modelName: "ProductCatalog",
      tableName: "product_catalog",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return ProductCatalog;
};

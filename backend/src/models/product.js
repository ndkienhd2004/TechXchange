const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {}

  Product.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      category_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      seller_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      store_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      brand_id: {
        type: DataTypes.BIGINT,
      },
      catalog_id: {
        type: DataTypes.BIGINT,
      },
      variant_key: {
        type: DataTypes.STRING(255),
      },
      name: {
        type: DataTypes.STRING(100),
      },
      description: {
        type: DataTypes.TEXT,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
      },
      quality: {
        type: DataTypes.STRING(20),
      },
      condition_percent: {
        type: DataTypes.INTEGER,
      },
      rating: {
        type: DataTypes.DOUBLE,
      },
      buyturn: {
        type: DataTypes.INTEGER,
      },
      quantity: {
        type: DataTypes.INTEGER,
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
        defaultValue: "pending",
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
      modelName: "Product",
      tableName: "products",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          name: "idx_products_status_cat_qty",
          fields: ["status", "category_id", "quantity"],
        },
        { name: "idx_products_brand", fields: ["brand_id"] },
        { name: "idx_products_store", fields: ["store_id"] },
        { name: "idx_products_seller", fields: ["seller_id"] },
        { name: "idx_products_updated", fields: ["updated_at"] },
        { name: "idx_products_created", fields: ["created_at"] },
      ],
    }
  );

  return Product;
};

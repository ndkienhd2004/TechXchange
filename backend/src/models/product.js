"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      // ví dụ: Product.belongsTo(models.User, { as: 'seller', foreignKey: 'seller_id' });
    }
  }
  Product.init(
    {
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      price: DataTypes.DECIMAL,
      quality: DataTypes.ENUM("new", "like_new", "good", "fair"),
      conditionPercent: {
        type: DataTypes.INTEGER,
        field: "condition_percent",
      },
      rating: DataTypes.FLOAT,
      salesCount: {
        type: DataTypes.INTEGER,
        field: "sales_count",
      },
      quantity: DataTypes.INTEGER,
      imageUrl: {
        type: DataTypes.STRING,
        field: "image_url",
      },
    },
    {
      sequelize,
      modelName: "Product",
      tableName: "products",
      underscored: true,
    }
  );
  return Product;
};

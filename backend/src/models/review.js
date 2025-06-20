"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      // định nghĩa các mối quan hệ ở đây
      Review.belongsTo(models.User, {
        foreignKey: "reviewer_id",
        as: "reviewer",
      });
      Review.belongsTo(models.Product, {
        foreignKey: "product_id",
        as: "product",
      });
      Review.belongsTo(models.Store, { foreignKey: "store_id", as: "store" });
    }
  }
  Review.init(
    {
      //... các thuộc tính của bạn
      rating: DataTypes.INTEGER,
      comment: DataTypes.TEXT,
      target_type: DataTypes.ENUM("product", "store"),
      //... các khóa ngoại sẽ được sequelize tự động thêm
    },
    {
      sequelize,
      modelName: "Review",
      tableName: "reviews",
      underscored: true,
      // === THÊM LOGIC KIỂM TRA Ở ĐÂY ===
      validate: {
        eitherProductOrStore() {
          if (this.target_type === "product" && !this.product_id) {
            throw new Error(
              'Review target is "product", but product_id is missing.'
            );
          }
          if (this.target_type === "store" && !this.store_id) {
            throw new Error(
              'Review target is "store", but store_id is missing.'
            );
          }
          if (this.product_id && this.store_id) {
            throw new Error(
              "A review can only be for a product OR a store, not both."
            );
          }
        },
      },
    }
  );
  return Review;
};

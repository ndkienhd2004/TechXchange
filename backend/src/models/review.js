const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {}

  Review.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      reviewer_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      product_id: {
        type: DataTypes.BIGINT,
      },
      store_id: {
        type: DataTypes.BIGINT,
      },
      rating: {
        type: DataTypes.INTEGER,
      },
      comment: {
        type: DataTypes.TEXT,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Review",
      tableName: "reviews",
      timestamps: false,
      indexes: [
        {
          name: "idx_reviews_reviewer_created",
          fields: ["reviewer_id", "created_at"],
        },
        {
          name: "idx_reviews_product_created",
          fields: ["product_id", "created_at"],
        },
        {
          name: "idx_reviews_store_created",
          fields: ["store_id", "created_at"],
        },
      ],
    }
  );

  return Review;
};

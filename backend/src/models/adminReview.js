const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class AdminReview extends Model {}

  AdminReview.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      admin_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      product_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      review_comment: {
        type: DataTypes.TEXT,
      },
      reviewed_at: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "AdminReview",
      tableName: "admin_reviews",
      timestamps: false,
      indexes: [
        {
          name: "idx_admin_reviews_product_reviewedat",
          fields: ["product_id", "reviewed_at"],
        },
        {
          name: "idx_admin_reviews_admin_reviewedat",
          fields: ["admin_id", "reviewed_at"],
        },
      ],
    }
  );

  return AdminReview;
};

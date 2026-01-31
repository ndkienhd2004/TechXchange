const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserPassedItem extends Model {}

  UserPassedItem.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      seller_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      buyer_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      product_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "accepted", "rejected", "completed"),
        defaultValue: "pending",
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      completed_at: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "UserPassedItem",
      tableName: "user_passed_item",
      timestamps: false,
      indexes: [
        {
          name: "idx_user_passed_item_seller_created",
          fields: ["seller_id", "created_at"],
        },
        {
          name: "idx_user_passed_item_buyer_created",
          fields: ["buyer_id", "created_at"],
        },
        { name: "idx_user_passed_item_product", fields: ["product_id"] },
      ],
    }
  );

  return UserPassedItem;
};

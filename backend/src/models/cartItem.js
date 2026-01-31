const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {}

  CartItem.init(
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
      product_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
      },
      added_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "CartItem",
      tableName: "cart_items",
      timestamps: false,
      indexes: [
        {
          name: "uq_cart_user_product",
          unique: true,
          fields: ["user_id", "product_id"],
        },
        { name: "idx_cart_items_user_added", fields: ["user_id", "added_at"] },
        { name: "idx_cart_items_product", fields: ["product_id"] },
      ],
    }
  );

  return CartItem;
};

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserProductEvent extends Model {}

  UserProductEvent.init(
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
      event_type: {
        type: DataTypes.ENUM(
          "impression",
          "view",
          "click",
          "add_to_cart",
          "purchase",
          "wishlist"
        ),
      },
      session_id: {
        type: DataTypes.STRING,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      meta: {
        type: DataTypes.JSONB,
      },
    },
    {
      sequelize,
      modelName: "UserProductEvent",
      tableName: "user_product_events",
      timestamps: false,
      indexes: [
        { name: "idx_upe_user_time", fields: ["user_id", "created_at"] },
        {
          name: "idx_upe_product_type_time",
          fields: ["product_id", "event_type", "created_at"],
        },
        { name: "idx_upe_session", fields: ["session_id"] },
        { name: "idx_upe_type_time", fields: ["event_type", "created_at"] },
      ],
    }
  );

  return UserProductEvent;
};

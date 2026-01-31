const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BannerDetail extends Model {}

  BannerDetail.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      product_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      banner_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
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
      modelName: "BannerDetail",
      tableName: "banner_detail",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          name: "uq_banner_detail_banner_product",
          unique: true,
          fields: ["banner_id", "product_id"],
        },
        { name: "idx_banner_detail_product", fields: ["product_id"] },
      ],
    }
  );

  return BannerDetail;
};

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class NewsDetail extends Model {}

  NewsDetail.init(
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
      news_id: {
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
      modelName: "NewsDetail",
      tableName: "news_detail",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          name: "uq_news_detail_news_product",
          unique: true,
          fields: ["news_id", "product_id"],
        },
        { name: "idx_news_detail_product", fields: ["product_id"] },
      ],
    }
  );

  return NewsDetail;
};

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProductAttribute extends Model {}

  ProductAttribute.init(
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
      attr_key: {
        type: DataTypes.STRING,
      },
      attr_value: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "ProductAttribute",
      tableName: "product_attributes",
      timestamps: false,
      indexes: [
        {
          name: "uq_pa_product_key_value",
          unique: true,
          fields: ["product_id", "attr_key", "attr_value"],
        },
        {
          name: "idx_product_attributes_key_value",
          fields: ["attr_key", "attr_value"],
        },
      ],
    }
  );

  return ProductAttribute;
};

"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProductCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Example association - uncomment if you have a Product model
      // ProductCategory.hasMany(models.Product, {
      //   foreignKey: 'category_id',
      //   as: 'products'
      // });
    }

    // Instance method to get category with product count
    async getProductCount() {
      // This would work if you have a Product model associated
      // return await this.countProducts();
      return 0;
    }
  }

  ProductCategory.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: {
          msg: "Category name must be unique",
        },
        validate: {
          notEmpty: {
            msg: "Category name cannot be empty",
          },
          len: {
            args: [1, 100],
            msg: "Category name must be between 1 and 100 characters",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "ProductCategory",
      tableName: "product_categories",
      timestamps: true,
      underscored: true,
      // Add hooks for automatic data processing
      hooks: {
        beforeValidate: (category) => {
          if (category.name) {
            category.name = category.name.trim();
          }
        },
      },
      // Add scopes for common queries
      scopes: {
        alphabetical: {
          order: [["name", "ASC"]],
        },
      },
    }
  );

  return ProductCategory;
};

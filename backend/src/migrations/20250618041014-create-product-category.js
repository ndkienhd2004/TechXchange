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
      // define association here
      // Ví dụ: ProductCategory.hasMany(models.Product, { foreignKey: 'category_id' });
    }

    // Method để format thời gian
    getFormattedCreatedAt() {
      return this.created_at
        ? this.created_at.toISOString().split("T")[0]
        : null;
    }

    getFormattedUpdatedAt() {
      return this.updated_at
        ? this.updated_at.toISOString().split("T")[0]
        : null;
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
          msg: "Tên danh mục phải là duy nhất",
        },
        validate: {
          notEmpty: {
            msg: "Tên danh mục không được để trống",
          },
          len: {
            args: [1, 100],
            msg: "Tên danh mục phải từ 1 đến 100 ký tự",
          },
        },
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "ProductCategory",
      tableName: "product_categories",
      timestamps: true, // Sequelize sẽ tự động quản lý created_at và updated_at
      underscored: true, // Sử dụng snake_case cho tên cột
      createdAt: "created_at", // Mapping tên cột
      updatedAt: "updated_at", // Mapping tên cột

      // Hooks để xử lý dữ liệu trước khi lưu
      hooks: {
        beforeValidate: (category) => {
          if (category.name) {
            category.name = category.name.trim();
          }
        },
        beforeUpdate: (category) => {
          category.updated_at = new Date();
        },
      },

      // Scopes để query dễ dàng hơn
      scopes: {
        // Sắp xếp theo tên A-Z
        alphabetical: {
          order: [["name", "ASC"]],
        },
        // Sắp xếp theo ngày tạo mới nhất
        newest: {
          order: [["created_at", "DESC"]],
        },
        // Sắp xếp theo ngày tạo cũ nhất
        oldest: {
          order: [["created_at", "ASC"]],
        },
        // Lấy những category được tạo trong 7 ngày qua
        recent: {
          where: {
            created_at: {
              [sequelize.Sequelize.Op.gte]: new Date(
                Date.now() - 7 * 24 * 60 * 60 * 1000
              ),
            },
          },
        },
      },
    }
  );

  return ProductCategory;
};

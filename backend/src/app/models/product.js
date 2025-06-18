module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      seller_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      store_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      quality: {
        type: DataTypes.STRING(20),
      },
      condition_percent: {
        type: DataTypes.INTEGER,
      },
      rating: {
        type: DataTypes.FLOAT,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      buyturn: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      brand_id: {
        type: DataTypes.INTEGER,
      },
      quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
    },
    {
      tableName: "products",
      timestamps: false,
      underscored: true,
    }
  );

  Product.associate = (models) => {
    Product.belongsTo(models.ProductCategory, { foreignKey: "category_id" });
    Product.belongsTo(models.User, { foreignKey: "seller_id" });
    Product.belongsTo(models.Store, { foreignKey: "store_id" });
    Product.belongsTo(models.Brand, { foreignKey: "brand_id" });
  };

  return Product;
};

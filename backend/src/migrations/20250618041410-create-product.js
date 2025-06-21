"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("products", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      category_id: {
        type: Sequelize.INTEGER,
        references: { model: "product_categories", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      seller_id: {
        type: Sequelize.INTEGER,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      store_id: {
        type: Sequelize.INTEGER,
        references: { model: "stores", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      brand_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: { model: "brands", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      name: {
        type: Sequelize.STRING(100),
      },
      description: {
        type: Sequelize.TEXT,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
      },
      quality: {
        type: Sequelize.ENUM("new", "like_new", "good", "fair"),
      },
      condition_percent: {
        type: Sequelize.INTEGER,
      },
      rating: {
        type: Sequelize.FLOAT,
      },
      sales_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      quantity: {
        type: Sequelize.INTEGER,
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      image_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("products");
  },
};

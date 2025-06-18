"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("reports", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      reporter_id: {
        type: Sequelize.INTEGER,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      reported_user_id: {
        type: Sequelize.INTEGER,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: true,
      },
      reported_product_id: {
        type: Sequelize.INTEGER,
        references: { model: "products", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: true,
      },
      reported_store_id: {
        type: Sequelize.INTEGER,
        references: { model: "stores", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: true,
      },
      target_type: {
        type: Sequelize.ENUM("user", "product", "store"),
        allowNull: false,
      },
      reason: {
        type: Sequelize.TEXT,
      },
      status: {
        type: Sequelize.ENUM("pending", "resolved", "rejected"),
      },
      reviewed_at: {
        type: Sequelize.DATE,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // === ĐÃ XÓA BỎ ĐOẠN CODE GÂY LỖI Ở ĐÂY ===
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("reports");
  },
};

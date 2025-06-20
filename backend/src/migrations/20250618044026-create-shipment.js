"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("shipments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      order_id: {
        type: Sequelize.INTEGER,
        references: { model: "orders", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      estimated_delivery: {
        type: Sequelize.DATE,
      },
      actual_delivery: {
        type: Sequelize.DATE,
      },
      status: {
        type: Sequelize.ENUM("pending", "shipped", "delivered", "failed"),
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("shipments");
  },
};

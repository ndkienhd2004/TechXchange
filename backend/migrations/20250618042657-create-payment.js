"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Sửa tên bảng thành chữ thường, số nhiều
    await queryInterface.createTable("payments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      // Thêm khóa ngoại order_id còn thiếu
      order_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "orders", // Tên bảng tham chiếu
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      // Sửa tên cột thành snake_case
      transaction_id: {
        type: Sequelize.STRING(100),
        unique: true,
      },
      amount: {
        // Thêm độ chính xác cho kiểu DECIMAL
        type: Sequelize.DECIMAL(10, 2),
      },
      // Sửa định nghĩa ENUM và tên cột
      payment_method: {
        type: Sequelize.ENUM("credit_card", "paypal", "bank_transfer", "cod"),
      },
      // Sửa định nghĩa ENUM
      status: {
        type: Sequelize.ENUM("pending", "completed", "failed", "refunded"),
      },
      // Sửa tên cột thành snake_case
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      // Sửa tên cột thành snake_case
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    // Sửa tên bảng cho đúng
    await queryInterface.dropTable("payments");
  },
};

"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Tên bảng là 'users' (chữ thường, số nhiều)
    await queryInterface.createTable("users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      username: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      gender: {
        // Định nghĩa ENUM với các giá trị cụ thể
        type: Sequelize.ENUM("male", "female", "other"),
      },
      phone: {
        type: Sequelize.STRING,
        unique: true,
      },
      // Dùng 'field' để chỉ định tên cột trong DB là snake_case
      password_hash: {
        type: Sequelize.STRING,
      },
      role: {
        // Định nghĩa ENUM với các giá trị cụ thể
        type: Sequelize.ENUM("user", "admin"),
      },
      // Dùng 'field' để chỉ định tên cột trong DB là snake_case
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      // Dùng 'field' để chỉ định tên cột trong DB là snake_case
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    // Tên bảng là 'users'
    await queryInterface.dropTable("users");
  },
};

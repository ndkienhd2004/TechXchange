"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    // Thêm cột created_at
    await queryInterface.addColumn("brands", "created_at", {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });
    // Thêm cột updated_at
    await queryInterface.addColumn("brands", "updated_at", {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal(
        "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
      ),
    });
  },

  async down(queryInterface, Sequelize) {
    // Lệnh hoàn tác nếu cần
    await queryInterface.removeColumn("brands", "created_at");
    await queryInterface.removeColumn("brands", "updated_at");
  },
};

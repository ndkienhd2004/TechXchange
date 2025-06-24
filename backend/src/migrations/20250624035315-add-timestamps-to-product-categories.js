"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Thêm cột created_at
    await queryInterface.addColumn("product_categories", "created_at", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });

    // Thêm cột updated_at
    await queryInterface.addColumn("product_categories", "updated_at", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });

    // Tạo trigger để tự động update updated_at (cho PostgreSQL)
    // Nếu dùng MySQL, có thể bỏ qua phần này
    if (queryInterface.sequelize.getDialect() === "postgres") {
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ language 'plpgsql';
      `);

      await queryInterface.sequelize.query(`
        CREATE TRIGGER update_product_categories_updated_at 
        BEFORE UPDATE ON product_categories 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `);
    }
  },

  async down(queryInterface, Sequelize) {
    // Xóa trigger trước (nếu có)
    if (queryInterface.sequelize.getDialect() === "postgres") {
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS update_product_categories_updated_at ON product_categories;
      `);

      await queryInterface.sequelize.query(`
        DROP FUNCTION IF EXISTS update_updated_at_column();
      `);
    }

    // Xóa các cột
    await queryInterface.removeColumn("product_categories", "updated_at");
    await queryInterface.removeColumn("product_categories", "created_at");
  },
};

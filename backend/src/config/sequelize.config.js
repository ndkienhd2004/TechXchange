const { Sequelize } = require("sequelize");
require("dotenv").config();

// Kết nối với PostgreSQL
const sequelize = new Sequelize(
  process.env.DB_NAME, // Tên database
  process.env.DB_USER, // Username
  process.env.DB_PASS, // Mật khẩu
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql", // Sử dụng MySQL dialect
    logging: false,
  }
);

// Kiểm tra kết nối
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to MySQL");
  } catch (error) {
    console.error("Error connecting to MySQL:", error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };

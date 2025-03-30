const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const { sequelize } = require("../../config/sequelize.config");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fullname: {
      type: DataTypes.STRING,
      defaultValue: "user001",
    },
    avatar: {
      type: DataTypes.STRING,
      defaultValue: "default.png",
    },
  },
  {
    tableName: "users",
    timestamps: true, // Tự động thêm createdAt, updatedAt
    hooks: {
      // Hash mật khẩu trước khi lưu
      beforeCreate: async (user) => {
        user.password = await bcrypt.hash(user.password, 10);
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  }
);

// Hàm đăng nhập
User.login = async function (email, password) {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new Error("User not found");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Password is incorrect");
  }
  return user;
};

// Xuất model
module.exports = User;

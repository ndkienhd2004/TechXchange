"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcryptjs"); // You will need to install bcryptjs: npm install bcryptjs

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {}
  }

  User.init(
    {
      // The 'id' primary key is automatically added by Sequelize, so it's not needed here.
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: "Must be a valid email address.",
          },
        },
      },
      gender: {
        type: DataTypes.ENUM("male", "female", "other"),
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
      },

      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "password_hash",
      },
      role: {
        type: DataTypes.ENUM("user", "admin"), // Correct ENUM syntax from your migration
        allowNull: false,
        defaultValue: "user",
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: true, // Enables automatic management of createdAt and updatedAt
      underscored: true, // This automatically maps camelCase fields in Sequelize to snake_case columns in the DB (e.g., createdAt -> created_at)
      hooks: {
        beforeCreate: async (user) => {
          if (user.passwordHash) {
            user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed("passwordHash")) {
            user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
          }
        },
      },
    }
  );

  // CRITICAL SECURITY: This method is automatically called when you use res.json(user).
  // It removes the password hash from the object before it's sent to the client.
  User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.passwordHash;
    return values;
  };

  return User;
};

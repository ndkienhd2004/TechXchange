'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    gender: DataTypes.ENUM(DataTypes.STRING),
    phone: DataTypes.STRING,
    passwordHash: DataTypes.STRING,
    role: DataTypes.ENUM(DataTypes.STRING)
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
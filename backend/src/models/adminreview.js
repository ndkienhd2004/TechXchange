'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AdminReview extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  AdminReview.init({
    status: DataTypes.ENUM(DataTypes.STRING),
    reviewComment: DataTypes.TEXT,
    reviewedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'AdminReview',
  });
  return AdminReview;
};
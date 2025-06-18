'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Shipment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Shipment.init({
    estimatedDelivery: DataTypes.DATE,
    actualDelivery: DataTypes.DATE,
    status: DataTypes.ENUM(DataTypes.STRING)
  }, {
    sequelize,
    modelName: 'Shipment',
  });
  return Shipment;
};
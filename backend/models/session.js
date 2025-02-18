'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Session extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Session.init({
    user_id: DataTypes.INTEGER,
    session_type: DataTypes.STRING,
    date: DataTypes.DATE,
    total_duration: DataTypes.INTEGER,
    total_distance: DataTypes.DECIMAL,
    weather_temp: DataTypes.DECIMAL,
    weather_humidity: DataTypes.INTEGER,
    weather_wind_speed: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'Session',
  });
  return Session;
};
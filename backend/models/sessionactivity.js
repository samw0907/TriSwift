'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SessionActivity extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  SessionActivity.init({
    session_id: DataTypes.INTEGER,
    sport_type: DataTypes.STRING,
    duration: DataTypes.INTEGER,
    distance: DataTypes.DECIMAL,
    heart_rate_min: DataTypes.INTEGER,
    heart_rate_max: DataTypes.INTEGER,
    heart_rate_avg: DataTypes.INTEGER,
    cadence: DataTypes.INTEGER,
    power: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'SessionActivity',
  });
  return SessionActivity;
};
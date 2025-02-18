'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Progress extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Progress.init({
    user_id: DataTypes.INTEGER,
    activity_type: DataTypes.STRING,
    achieved_value: DataTypes.DECIMAL,
    date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Progress',
  });
  return Progress;
};
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PersonalRecord extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PersonalRecord.init({
    user_id: DataTypes.INTEGER,
    activity_type: DataTypes.STRING,
    distance: DataTypes.DECIMAL,
    best_time: DataTypes.INTEGER,
    record_date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'PersonalRecord',
  });
  return PersonalRecord;
};
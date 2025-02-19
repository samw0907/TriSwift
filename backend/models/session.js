const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../util/db');

class Session extends Model {}

Session.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  session_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  total_duration: {
    type: DataTypes.STRING
  },
  total_distance: {
    type: DataTypes.DECIMAL
  },
  weather_temp: {
    type: DataTypes.DECIMAL
  },
  weather_humidity: {
    type: DataTypes.INTEGER
  },
  weather_wind_speed: {
    type: DataTypes.DECIMAL
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'Session',
  tableName: 'Sessions',
  timestamps: true,
  underscored: true
});

module.exports = Session;

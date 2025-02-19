const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../util/db');

class SessionActivity extends Model {}

SessionActivity.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  session_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Sessions',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  sport_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  duration: {
    type: DataTypes.STRING
  },
  distance: {
    type: DataTypes.DECIMAL
  },
  heart_rate_min: {
    type: DataTypes.INTEGER
  },
  heart_rate_max: {
    type: DataTypes.INTEGER
  },
  heart_rate_avg: {
    type: DataTypes.INTEGER
  },
  cadence: {
    type: DataTypes.INTEGER
  },
  power: {
    type: DataTypes.INTEGER
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
  modelName: 'SessionActivity',
  tableName: 'SessionActivities',
  timestamps: true,
  underscored: true
});

module.exports = SessionActivity;

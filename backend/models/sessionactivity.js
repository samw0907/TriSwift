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
    type: DataTypes.INTEGER,
    allowNull: false
  },
  distance: {
    type: DataTypes.DECIMAL,
    allowNull: false
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
  }
}, {
  sequelize,
  modelName: 'SessionActivity',
  tableName: 'SessionActivities',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = SessionActivity;

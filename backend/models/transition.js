const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../util/db');

class Transition extends Model {}

Transition.init({
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
  previous_sport: {
    type: DataTypes.STRING,
    allowNull: false
  },
  next_sport: {
    type: DataTypes.STRING,
    allowNull: false
  },
  transition_time: {
    type: DataTypes.STRING
  },
  comments: {
    type: DataTypes.TEXT
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
  modelName: 'Transition',
  tableName: 'Transitions',
  timestamps: true,
  underscored: true
});

module.exports = Transition;

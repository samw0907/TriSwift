const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../util/db');

class Progress extends Model {}

Progress.init({
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
  activity_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  achieved_value: {
    type: DataTypes.DECIMAL,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Progress',
  tableName: 'Progress',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Progress;

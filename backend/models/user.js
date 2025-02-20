const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const { sequelize } = require('../util/db');

class User extends Model {}

User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'Users',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password_hash) {
        user.password_hash = await bcrypt.hash(user.password_hash, 10);
      }
    }
  }
});

module.exports = User;

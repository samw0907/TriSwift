const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../util/db");

class PersonalRecord extends Model {}

PersonalRecord.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id"
    },
    onDelete: "CASCADE"
  },
  session_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Sessions",
      key: "id"
    },
    onDelete: "CASCADE"
  },
  activity_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  distance: {
    type: DataTypes.DECIMAL
  },
  best_time: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  record_date: {
    type: DataTypes.DATE
  }
}, {
  sequelize,
  modelName: "PersonalRecord",
  tableName: "PersonalRecords",
  timestamps: true,
  underscored: true,
  createdAt: "created_at",
  updatedAt: "updated_at"
});

module.exports = PersonalRecord;

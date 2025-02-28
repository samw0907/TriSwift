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
  session_activity_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "SessionActivities",
      key: "id"
    },
    onDelete: "CASCADE"
  },
  distance: {
    type: DataTypes.DECIMAL,
    allowNull: false
  },
  best_time: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  record_date: {
    type: DataTypes.DATE,
    allowNull: false
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

"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PersonalRecord extends Model {
    static associate(models) {
      PersonalRecord.belongsTo(models.User, { foreignKey: "user_id", onDelete: "CASCADE" });
    }
  }

  PersonalRecord.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      activity_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      distance: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      best_time: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      record_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "PersonalRecord",
      tableName: "PersonalRecords",
      timestamps: true, // ✅ Enables automatic timestamps
      underscored: true, // ✅ Uses snake_case instead of camelCase
    }
  );

  return PersonalRecord;
};

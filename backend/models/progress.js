"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Progress extends Model {
    static associate(models) {
      Progress.belongsTo(models.User, { foreignKey: "user_id", onDelete: "CASCADE" });
    }
  }

  Progress.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      activity_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      achieved_value: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Progress",
      tableName: "Progresses", // ✅ Explicitly setting the table name
      timestamps: true, // ✅ Enables automatic timestamps
      underscored: true, // ✅ Uses snake_case for consistency
    }
  );

  return Progress;
};

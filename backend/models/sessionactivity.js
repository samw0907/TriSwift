"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class SessionActivity extends Model {
    static associate(models) {
      SessionActivity.belongsTo(models.Session, { foreignKey: "session_id", onDelete: "CASCADE" });
    }
  }

  SessionActivity.init(
    {
      session_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sport_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      distance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      heart_rate_min: DataTypes.INTEGER,
      heart_rate_max: DataTypes.INTEGER,
      heart_rate_avg: DataTypes.INTEGER,
      cadence: DataTypes.INTEGER,
      power: DataTypes.INTEGER,
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      sequelize,
      modelName: "SessionActivity",
      tableName: "SessionActivities",
      timestamps: true,
      underscored: true,
    }
  );

  return SessionActivity;
};

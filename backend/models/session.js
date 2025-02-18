"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Session extends Model {
    static associate(models) {
      Session.belongsTo(models.User, { foreignKey: "user_id", onDelete: "CASCADE" });
    }
  }

  Session.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      session_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      total_duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      total_distance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      weather_temp: {
        type: DataTypes.DECIMAL(5, 2),
      },
      weather_humidity: {
        type: DataTypes.INTEGER,
        validate: { min: 0, max: 100 },
      },
      weather_wind_speed: {
        type: DataTypes.DECIMAL(5, 2),
      },
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
      modelName: "Session",
      tableName: "Sessions",
      timestamps: true,
      underscored: true,
    }
  );

  return Session;
};

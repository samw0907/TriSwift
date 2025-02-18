'use strict';
const {
  Model
  "use strict";
  const { Model } = require("sequelize");
  
  module.exports = (sequelize, DataTypes) => {
    class Transition extends Model {
      static associate(models) {
        Transition.belongsTo(models.Session, { foreignKey: "session_id", onDelete: "CASCADE" });
      }
    }
  
    Transition.init(
      {
        session_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        previous_sport: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        next_sport: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        transition_time: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        comments: DataTypes.TEXT,
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
        modelName: "Transition",
        tableName: "Transitions",
        timestamps: true, // ✅ Enables automatic timestamps
        underscored: true, // ✅ Uses snake_case instead of camelCase
      }
    );
  
    return Transition;
  };
  
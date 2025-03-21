const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("SessionActivities", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: { tableName: "Users" },
          key: "id",
        },
        onDelete: "CASCADE",
      },      
      session_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: { tableName: "Sessions" },
          key: "id",
        },
        onDelete: "CASCADE",
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
      heart_rate_min: {
        type: DataTypes.INTEGER,
      },
      heart_rate_max: {
        type: DataTypes.INTEGER,
      },
      heart_rate_avg: {
        type: DataTypes.INTEGER,
      },
      cadence: {
        type: DataTypes.INTEGER,
      },
      power: {
        type: DataTypes.INTEGER,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("SessionActivities");
  },
};

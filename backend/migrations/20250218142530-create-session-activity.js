const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("session_activities", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      session_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "sessions", // Ensuring consistency with lowercase table names
          key: "id",
        },
        onDelete: "CASCADE",
      },
      sport_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      duration: {
        type: DataTypes.INTEGER, // Changed from STRING to INTEGER for time storage
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
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("session_activities");
  },
};

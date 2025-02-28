const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("sessions", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users", // Ensure lowercase consistency
          key: "id",
        },
        onDelete: "CASCADE",
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
        type: DataTypes.INTEGER, // Duration should be stored as an integer (e.g., in seconds or minutes)
      },
      total_distance: {
        type: DataTypes.DECIMAL(10, 2),
      },
      is_multi_sport: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false, // Default to false if not specified
      },
      weather_temp: {
        type: DataTypes.DECIMAL(5, 2),
      },
      weather_humidity: {
        type: DataTypes.INTEGER,
      },
      weather_wind_speed: {
        type: DataTypes.DECIMAL(5, 2),
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
    await queryInterface.dropTable("sessions");
  },
};

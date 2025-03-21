const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log("Running sessions migration...");

    await queryInterface.createTable("Sessions", {
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
      },
      total_distance: {
        type: DataTypes.DECIMAL(10, 2),
      },
      is_multi_sport: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    console.log("✅ Sessions table created successfully!");
  },

  down: async (queryInterface) => {
    console.log("Dropping sessions table...");
    await queryInterface.dropTable("Sessions");
  },
};

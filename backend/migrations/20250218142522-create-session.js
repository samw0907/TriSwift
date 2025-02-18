"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Sessions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: { model: "Users", key: "id" },
        onDelete: "CASCADE",
      },
      session_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      total_duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      total_distance: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      weather_temp: {
        type: Sequelize.DECIMAL(5, 2),
      },
      weather_humidity: {
        type: Sequelize.INTEGER,
        validate: { min: 0, max: 100 },
      },
      weather_wind_speed: {
        type: Sequelize.DECIMAL(5, 2),
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Sessions");
  },
};

'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Sessions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      session_type: {
        type: Sequelize.STRING
      },
      date: {
        type: Sequelize.DATE
      },
      total_duration: {
        type: Sequelize.INTEGER
      },
      total_distance: {
        type: Sequelize.DECIMAL
      },
      weather_temp: {
        type: Sequelize.DECIMAL
      },
      weather_humidity: {
        type: Sequelize.INTEGER
      },
      weather_wind_speed: {
        type: Sequelize.DECIMAL
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Sessions');
  }
};
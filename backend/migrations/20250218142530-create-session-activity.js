'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SessionActivities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      session_id: {
        type: Sequelize.INTEGER
      },
      sport_type: {
        type: Sequelize.STRING
      },
      duration: {
        type: Sequelize.INTEGER
      },
      distance: {
        type: Sequelize.DECIMAL
      },
      heart_rate_min: {
        type: Sequelize.INTEGER
      },
      heart_rate_max: {
        type: Sequelize.INTEGER
      },
      heart_rate_avg: {
        type: Sequelize.INTEGER
      },
      cadence: {
        type: Sequelize.INTEGER
      },
      power: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('SessionActivities');
  }
};
"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("SessionActivities", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      session_id: {
        type: Sequelize.INTEGER,
        references: { model: "Sessions", key: "id" },
        onDelete: "CASCADE",
      },
      sport_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      distance: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      heart_rate_min: {
        type: Sequelize.INTEGER,
      },
      heart_rate_max: {
        type: Sequelize.INTEGER,
      },
      heart_rate_avg: {
        type: Sequelize.INTEGER,
      },
      cadence: {
        type: Sequelize.INTEGER,
      },
      power: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable("SessionActivities");
  },
};

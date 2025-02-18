"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Transitions", {
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
      previous_sport: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      next_sport: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      transition_time: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      comments: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable("Transitions");
  },
};

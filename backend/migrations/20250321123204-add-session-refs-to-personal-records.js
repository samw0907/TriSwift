'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("PersonalRecords", "session_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: { tableName: "Sessions" },
        key: "id"
      },
      onDelete: "CASCADE"
    });

    await queryInterface.addColumn("PersonalRecords", "session_activity_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: { tableName: "SessionActivities" },
        key: "id"
      },
      onDelete: "CASCADE"
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("PersonalRecords", "session_id");
    await queryInterface.removeColumn("PersonalRecords", "session_activity_id");
  }
};

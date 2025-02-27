module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("PersonalRecords", "session_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Sessions",
        key: "id"
      },
      onDelete: "CASCADE"
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("PersonalRecords", "session_id");
  }
};

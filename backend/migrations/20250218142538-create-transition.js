const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Transitions', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      session_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Sessions',
          key: 'id',
        },
        onDelete: 'CASCADE'
      },
      previous_sport: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      next_sport: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      transition_time: {
        type: DataTypes.STRING,
      },
      comments: {
        type: DataTypes.TEXT,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('Transitions');
  },
};

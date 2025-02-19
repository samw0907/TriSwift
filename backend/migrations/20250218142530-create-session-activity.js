const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SessionActivities', {
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
      sport_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      duration: {
        type: DataTypes.STRING,
      },
      distance: {
        type: DataTypes.DECIMAL,
      },
      heart_rate_min: {
        type: DataTypes.INTEGER,
      },
      heart_rate_max: {
        type: DataTypes.INTEGER,
      },
      heart_rate_avg: {
        type: DataTypes.INTEGER,
      },
      cadence: {
        type: DataTypes.INTEGER,
      },
      power: {
        type: DataTypes.INTEGER,
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
    await queryInterface.dropTable('SessionActivities');
  },
};

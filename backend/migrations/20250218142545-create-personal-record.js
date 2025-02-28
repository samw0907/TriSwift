const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("personal_records", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users", // Ensuring lowercase table names for consistency
          key: "id",
        },
        onDelete: "CASCADE",
      },
      activity_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      distance: {
        type: DataTypes.DECIMAL(10, 2), // Defined precision to ensure proper storage
        allowNull: false,
      },
      best_time: {
        type: DataTypes.INTEGER, // Changed from STRING to INTEGER to store time in seconds
        allowNull: false,
      },
      record_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("personal_records");
  },
};

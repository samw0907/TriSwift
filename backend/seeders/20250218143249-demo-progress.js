"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("Progresses", [
      {
        user_id: 1, // Fast Man
        activity_type: "run",
        achieved_value: 30.0,
        date: new Date("2025-02-10"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        user_id: 2, // Fast Woman
        activity_type: "bike",
        achieved_value: 120.0,
        date: new Date("2025-02-10"),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Progresses", null, {});
  },
};

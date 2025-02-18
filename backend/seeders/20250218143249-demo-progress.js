"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("Progresses", [
      {
        user_id: 1, // Fast Man
        activity_type: "run",
        achieved_value: 30.0, // Ran 30km this week
        date: new Date("2025-02-10"),
        createdAt: new Date(), // ✅ Fix column name
        updatedAt: new Date(), // ✅ Fix column name
      },
      {
        user_id: 2, // Fast Woman
        activity_type: "bike",
        achieved_value: 120.0, // Cycled 120km this week
        date: new Date("2025-02-10"),
        createdAt: new Date(), // ✅ Fix column name
        updatedAt: new Date(), // ✅ Fix column name
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Progresses", null, {});
  },
};

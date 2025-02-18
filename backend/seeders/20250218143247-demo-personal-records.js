"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("PersonalRecords", [
      {
        user_id: 1, // Fast Man
        activity_type: "run",
        distance: 5.0,
        best_time: 1200, // 20 mins
        record_date: new Date("2025-01-20"),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: 2, // Fast Woman
        activity_type: "bike",
        distance: 50.0,
        best_time: 5400, // 1.5 hours
        record_date: new Date("2025-01-25"),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("PersonalRecords", null, {});
  },
};

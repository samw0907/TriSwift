"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("SessionActivities", [
      {
        session_id: 1, // Single-sport session for Fast Man
        sport_type: "run",
        duration: 3600,
        distance: 10.0,
        heart_rate_min: 120,
        heart_rate_max: 180,
        heart_rate_avg: 150,
        cadence: null, // Not applicable for running
        power: null, // Not applicable for running
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        session_id: 2, // Multi-sport session for Fast Woman
        sport_type: "swim",
        duration: 1800, // 30 mins
        distance: 2.0, // 2 km swim
        heart_rate_min: 110,
        heart_rate_max: 160,
        heart_rate_avg: 140,
        cadence: null,
        power: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        session_id: 2,
        sport_type: "bike",
        duration: 3600, // 1 hour
        distance: 28.0,
        heart_rate_min: 115,
        heart_rate_max: 170,
        heart_rate_avg: 145,
        cadence: 85, // RPM
        power: 250, // Watts
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("SessionActivities", null, {});
  },
};

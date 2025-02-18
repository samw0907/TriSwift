"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("Sessions", [
      {
        user_id: 1, // Assuming Fast Man (ID 1)
        session_type: "single-sport",
        date: new Date("2025-02-15"),
        total_duration: 3600, // 1 hour
        total_distance: 10.0, // 10 km
        weather_temp: 15.5, // 15.5°C
        weather_humidity: 65,
        weather_wind_speed: 10.2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: 2, // Assuming Fast Woman (ID 2)
        session_type: "multi-sport",
        date: new Date("2025-02-16"),
        total_duration: 5400, // 1.5 hours
        total_distance: 30.0, // 30 km total
        weather_temp: 18.0,
        weather_humidity: 70,
        weather_wind_speed: 8.5,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Sessions", null, {});
  },
};


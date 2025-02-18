"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("Transitions", [
      {
        session_id: 2, // Fast Woman's multi-sport session
        previous_sport: "swim",
        next_sport: "bike",
        transition_time: 120, // 2 minutes
        comments: "Struggled getting wetsuit off",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Transitions", null, {});
  },
};

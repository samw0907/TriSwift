'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("Users", [
      {
        name: "Fast Man"
        email: "fastman@example.com",
        password_hash: "hashedpassword123", // Hash later for security
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Fast Woman",
        email: "fastwoman@example.com",
        password_hash: "hashedpassword123",
        created_at: new Date(),
        updated_at: new Date(),
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Users", null, {});
  },
};

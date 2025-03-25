const { User } = require('../models');

module.exports = {
  up: async () => {
    await User.bulkCreate([
      {
        id: 1001,
        name: 'Seed User',
        email: 'seeduser@example.com',
        password_hash: 'hashedpassword123',
      },
      {
        id: 1002,
        name: 'Other Seed',
        email: 'otherseed@example.com',
        password_hash: 'hashedpassword123',
      }
    ], { validate: true });
  },

  down: async () => {
    await User.destroy({ where: { id: [1001, 1002] } });
  }
};


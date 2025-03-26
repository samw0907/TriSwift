const bcrypt = require('bcrypt');
const { User } = require('../models');

module.exports = {
  up: async () => {
    const passwordHash = await bcrypt.hash('password123', 10);

    await User.bulkCreate([
      {
        id: 1001,
        name: 'Seed User',
        email: 'seeduser@example.com',
        password_hash: passwordHash,
      },
      {
        id: 1002,
        name: 'Other Seed',
        email: 'otherseed@example.com',
        password_hash: passwordHash,
      }
    ], { validate: true });
  },

  down: async () => {
    await User.destroy({ where: { id: [1001, 1002] } });
  }
};


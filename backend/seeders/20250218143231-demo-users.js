const { User } = require('../models');

module.exports = {
  up: async () => {
    await User.bulkCreate([
      {
        id: 1001,
        name: 'Fast Man',
        email: 'fastman@example.com',
        password_hash: 'hashedpassword123',
      },
      {
        id: 1002,
        name: 'Fast Woman',
        email: 'fastwoman@example.com',
        password_hash: 'hashedpassword123',
      }
    ], { validate: true });
  },

  down: async () => {
    await User.destroy({ where: { id: [1001, 1002] } });
  }
};


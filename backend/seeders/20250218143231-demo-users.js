const { User } = require('../models');

module.exports = {
  up: async () => {
    await User.bulkCreate([
      {
        name: 'Fast Man',
        email: 'fastman@example.com',
        password_hash: 'hashedpassword123',
      },
      {
        name: 'Fast Woman',
        email: 'fastwoman@example.com',
        password_hash: 'hashedpassword123',
      }
    ]);
  },

  down: async () => {
    await User.destroy({ where: {} });
  }
};


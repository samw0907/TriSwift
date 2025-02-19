const { Progress } = require('../models');

module.exports = {
  up: async () => {
    await Progress.bulkCreate([
      {
        user_id: 1,
        activity_type: 'run',
        achieved_value: 30.0,
        date: new Date('2025-02-10'),
      },
      {
        user_id: 2,
        activity_type: 'bike',
        achieved_value: 120.0,
        date: new Date('2025-02-10'),
      }
    ]);
  },

  down: async () => {
    await Progress.destroy({ where: {} });
  }
};

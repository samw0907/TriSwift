const { PersonalRecord } = require('../models');

module.exports = {
  up: async () => {
    await PersonalRecord.bulkCreate([
      {
        user_id: 1,
        activity_type: 'run',
        distance: 5.0,
        best_time: '0h 20m 0s',
        record_date: new Date('2025-01-20'),
      },
      {
        user_id: 2,
        activity_type: 'bike',
        distance: 50.0,
        best_time: '1h 30m 0s',
        record_date: new Date('2025-01-25'),
      }
    ]);
  },

  down: async () => {
    await PersonalRecord.destroy({ where: {} });
  }
};

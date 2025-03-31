const { PersonalRecord } = require('../models');

module.exports = {
  up: async () => {
    await PersonalRecord.bulkCreate([
      {
        user_id: 1002,
        activity_type: 'run',
        distance: 5000,
        best_time: 1200,
        record_date: new Date('2025-01-20'),
      },
      {
        user_id: 1002,
        activity_type: 'run',
        distance: 5000,
        best_time: 1150,
        record_date: new Date('2025-02-01'),
      },

      {
        user_id: 1002,
        activity_type: 'bike',
        distance: 50000,
        best_time: 5400,
        record_date: new Date('2025-01-25'),
      },
      {
        user_id: 1002,
        activity_type: 'bike',
        distance: 50000,
        best_time: 5100,
        record_date: new Date('2025-02-05'),
      }
    ], { validate: true });
  },

  down: async () => {
    await PersonalRecord.destroy({ where:  { user_id: 1002 }  });
  }
};

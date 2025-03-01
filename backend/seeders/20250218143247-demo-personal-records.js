const { PersonalRecord } = require('../models');

module.exports = {
  up: async () => {
    await PersonalRecord.bulkCreate([
      {
        user_id: 1,
        activity_type: 'run',
        distance: 5000,
        best_time: 1200, 
        record_date: new Date('2025-01-20'),
      },
      {
        user_id: 2,
        activity_type: 'bike',
        distance: 50000, 
        best_time: 5400, 
        record_date: new Date('2025-01-25'),
      }
    ], { validate: true });
  },

  down: async () => {
    await PersonalRecord.destroy({ where: {} });
  }
};

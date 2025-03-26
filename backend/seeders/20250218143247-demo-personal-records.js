const { PersonalRecord } = require('../models');

module.exports = {
  up: async () => {
    await PersonalRecord.bulkCreate([
      {
        user_id: 1001,
        session_id: 1001,
        session_activity_id: 1001,
        activity_type: 'run',
        distance: 5000,
        best_time: 1200, 
        record_date: new Date('2025-01-20'),
      },
      {
        user_id: 1002,
        session_id: 1002,
        session_activity_id: 1002,
        activity_type: 'bike',
        distance: 50000, 
        best_time: 5400, 
        record_date: new Date('2025-01-25'),
      }
    ], { validate: true });
  },

  down: async () => {
    await PersonalRecord.destroy({ where: { user_id: [1001, 1002] } });
  }
};

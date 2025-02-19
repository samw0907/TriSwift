const { SessionActivity } = require('../models');

module.exports = {
  up: async () => {
    await SessionActivity.bulkCreate([
      {
        session_id: 1,
        sport_type: 'run',
        duration: '1h 0m 0s',
        distance: 10.0,
        heart_rate_min: 120,
        heart_rate_max: 180,
        heart_rate_avg: 150,
        cadence: null,
        power: null,
      },
      {
        session_id: 2,
        sport_type: 'swim',
        duration: '0h 30m 0s',
        distance: 2.0,
        heart_rate_min: 110,
        heart_rate_max: 160,
        heart_rate_avg: 140,
        cadence: null,
        power: null,
      },
      {
        session_id: 2,
        sport_type: 'bike',
        duration: '1h 0m 0s',
        distance: 28.0,
        heart_rate_min: 115,
        heart_rate_max: 170,
        heart_rate_avg: 145,
        cadence: 85,
        power: 250,
      }
    ]);
  },

  down: async () => {
    await SessionActivity.destroy({ where: {} });
  }
};


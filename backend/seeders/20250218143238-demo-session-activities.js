const { SessionActivity } = require('../models');

module.exports = {
  up: async () => {
    await SessionActivity.bulkCreate([
      {
        id: 1001,
        session_id: 1001,
        user_id: 1002,
        sport_type: 'run',
        duration: 1200,
        distance: 5.0,
        heart_rate_min: 120,
        heart_rate_max: 180,
        heart_rate_avg: 150,
        cadence: null,
        power: null,
      },
      {
        id: 1002,
        session_id: 1002,
        user_id: 1002,
        sport_type: 'swim',
        duration: 1800,
        distance: 2.0,
        heart_rate_min: 110,
        heart_rate_max: 160,
        heart_rate_avg: 140,
        cadence: null,
        power: null,
      },
      {
        id: 1003,
        session_id: 1002,
        user_id: 1002,
        sport_type: 'bike',
        duration: 3600,
        distance: 28.0,
        heart_rate_min: 115,
        heart_rate_max: 170,
        heart_rate_avg: 145,
        cadence: 85,
        power: 250,
      },
      {
        id: 1004,
        session_id: 1003,
        user_id: 1002,
        sport_type: 'run',
        duration: 1500,
        distance: 5.0,
        heart_rate_min: 125,
        heart_rate_max: 175,
        heart_rate_avg: 155,
        cadence: null,
        power: null,
      }
    ], { validate: true });
  },

  down: async () => {
    await SessionActivity.destroy({ where: { id: [1001, 1002, 1003, 1004] } });
  }
};

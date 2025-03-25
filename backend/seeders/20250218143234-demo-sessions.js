const { Session } = require('../models');

module.exports = {
  up: async () => {
    await Session.bulkCreate([
      {
        id: 1001,
        user_id: 1001,
        session_type: 'Run',
        date: '2025-02-15',
        total_duration: '3600',
        total_distance: 10.0,
        is_multi_sport: false,
        weather_temp: 15.5,
        weather_humidity: 65,
        weather_wind_speed: 10.2,
      },
      {
        id: 1002,
        user_id: 1002,
        session_type: 'Multi-sport',
        date: '2025-02-16',
        total_duration: '5400',
        total_distance: 30.0,
        is_multi_sport: true,
        weather_temp: 18.0,
        weather_humidity: 70,
        weather_wind_speed: 8.5,
      }
    ], { validate: true });
  },

  down: async () => {
    await Session.destroy({ where: { id: [1001, 1002] }});
  }
};

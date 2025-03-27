const { Session } = require('../models');

module.exports = {
  up: async () => {
    await Session.bulkCreate([
      {
        id: 1001,
        user_id: 1001,
        session_type: 'Run',
        date: '2025-03-15',
        total_duration: '1200',
        total_distance: 5.0,
        is_multi_sport: false,
        weather_temp: 15.5,
        weather_humidity: 65,
        weather_wind_speed: 10.2,
      },
      {
        id: 1002,
        user_id: 1002,
        session_type: 'Multi-sport',
        date: '2025-03-16',
        total_duration: '5400',
        total_distance: 30.0,
        is_multi_sport: true,
        weather_temp: 18.0,
        weather_humidity: 70,
        weather_wind_speed: 8.5,
      },
      {
        id: 1003,
        user_id: 1001,
        session_type: 'Run',
        date: '2025-03-17',
        total_duration: '1500',
        total_distance: 5.0,
        is_multi_sport: false,
        weather_temp: 17.2,
        weather_humidity: 60,
        weather_wind_speed: 9.0,
      },
      {
        id: 1003,
        user_id: 1001,
        session_type: 'Run',
        date: '2025-03-17',
        total_duration: '1500',
        total_distance: 5.0,
        is_multi_sport: false,
        weather_temp: 17.2,
        weather_humidity: 60,
        weather_wind_speed: 9.0,
      }
    ], { validate: true });
  },

  down: async () => {
    await Session.destroy({ where: { id: [1001, 1002, 1003] }});
  }
};

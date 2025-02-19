const { Session } = require('../models');

module.exports = {
  up: async () => {
    await Session.bulkCreate([
      {
        user_id: 1,
        session_type: 'single-sport',
        date: new Date('2025-02-15'),
        total_duration: '1h 0m 0s',
        total_distance: 10.0,
        weather_temp: 15.5,
        weather_humidity: 65,
        weather_wind_speed: 10.2,
      },
      {
        user_id: 2,
        session_type: 'multi-sport',
        date: new Date('2025-02-16'),
        total_duration: '1h 30m 0s',
        total_distance: 30.0,
        weather_temp: 18.0,
        weather_humidity: 70,
        weather_wind_speed: 8.5,
      }
    ]);
  },

  down: async () => {
    await Session.destroy({ where: {} });
  }
};


const { Transition } = require('../models');

module.exports = {
  up: async () => {
    await Transition.bulkCreate([
      {
        session_id: 2,
        previous_sport: 'swim',
        next_sport: 'bike',
        transition_time: '0h 2m 0s',
        comments: 'Struggled getting wetsuit off',
      }
    ]);
  },

  down: async () => {
    await Transition.destroy({ where: {} });
  }
};

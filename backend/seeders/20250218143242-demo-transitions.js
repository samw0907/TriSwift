const { Transition } = require('../models');

module.exports = {
  up: async () => {
    await Transition.bulkCreate([
      {
        session_id: 1002,
        previous_sport: 'swim',
        next_sport: 'bike',
        transition_time: 120,
        comments: 'Struggled getting wetsuit off',
      }
    ], { validate: true });
  },

  down: async () => {
    await Transition.destroy({ where: { session_id: 1002 } });
  }
};


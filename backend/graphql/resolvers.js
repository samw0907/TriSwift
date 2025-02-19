const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET } = require("../util/config");

const { User, Session, SessionActivity, PersonalRecord, Progress } = require("../models");

const resolvers = {
  Query: {
    users: async () => await User.findAll(),
    sessions: async () => await Session.findAll({ include: SessionActivity }),
    session: async (_, { id }) => await Session.findByPk(id, { include: SessionActivity }),
    sessionActivities: async (_, { sessionId }) => await SessionActivity.findAll({ where: { session_id: sessionId } }),
    personalRecords: async (_, { userId }) => await PersonalRecord.findAll({ where: { user_id: userId } }),
    progress: async (_, { userId }) => await Progress.findAll({ where: { user_id: userId } }),
  },

  Mutation: {
    createSession: async (_, { input }) => {
      return await Session.create(input);
    },
    createSessionActivity: async (_, { input }) => {
      return await SessionActivity.create(input);
    },
    createPersonalRecord: async (_, { input }) => {
      return await PersonalRecord.create(input);
    },
    createProgress: async (_, { input }) => {
      return await Progress.create(input);
    },
  },
};

module.exports = resolvers;
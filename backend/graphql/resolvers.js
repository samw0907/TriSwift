const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User, Session, SessionActivity, PersonalRecord, Transition } = require("../models");
const { JWT_SECRET } = require("../util/config");

const resolvers = {
  Query: {
    users: async (_, __, { user }) => {
      if (!user) throw new Error("Authentication required.");
      return [await User.findByPk(user.id)];
    },

    user: async (_, __, { user }) => {
      if (!user) throw new Error("Authentication required.");
      return await User.findByPk(user.id, { include: Session, as: "sessions" });
    },

    transitions: async (_, { sessionId }, { user }) => {
      if (!user) throw new Error("Authentication required.");

      const session = await Session.findByPk(sessionId);
      if (!session) throw new Error("Session not found.");
      if (session.user_id !== user.id) throw new Error("Unauthorized");
      if (!session.is_multi_sport) throw new Error("Transitions are only available for multi-sport sessions.");

      const transitions = await Transition.findAll({ where: { session_id: sessionId } });

      return transitions.map(t => ({
        id: t.id,
        sessionId: t.session_id,
        previousSport: t.previous_sport,
        nextSport: t.next_sport,
        transitionTime: t.transition_time,
        comments: t.comments,
        created_at: t.created_at.toISOString(),
        updated_at: t.updated_at.toISOString(),
      }));
    },

    personalRecords: async (_, { sportType }, { user }) => {
      if (!user) throw new Error("Authentication required.");

      const records = await PersonalRecord.findAll({
        where: { user_id: user.id, activity_type: sportType },
        order: [["distance", "ASC"], ["best_time", "ASC"]],
      });

      const uniqueRecords = new Map();
      records.forEach(record => {
        if (!uniqueRecords.has(record.distance)) {
          uniqueRecords.set(record.distance, []);
        }
        if (uniqueRecords.get(record.distance).length < 3) {
          uniqueRecords.get(record.distance).push(record);
        }
      });

      return Array.from(uniqueRecords.values()).flat().map(record => ({
        id: record.id,
        userId: record.user_id,
        sessionId: record.session_id,
        sessionActivityId: record.session_activity_id,
        activityType: record.activity_type,
        distance: record.distance,
        bestTime: record.best_time,
        recordDate: record.record_date ? record.record_date.toISOString() : null,
        created_at: record.created_at.toISOString(),
        updated_at: record.updated_at.toISOString(),
      }));
    },
  },   
  Mutation: {
    createUser: async (_, { input }) => {
      try {
        if (!input.name || !input.email || !input.password) {
          throw new Error("All fields (name, email, password) are required");
        }

        const normalizedEmail = input.email.toLowerCase().trim();

        const existingUser = await User.findOne({ where: { email: normalizedEmail } });
        if (existingUser) {
          throw new Error("Email is already in use");
        }

        const passwordHash = await bcrypt.hash(input.password, 12);
        const user = await User.create({
          name: input.name.trim(),
          email: normalizedEmail,
          password_hash: passwordHash
        });

        return {
          ...user.toJSON(),
          created_at: user.created_at.toISOString(),
          updated_at: user.updated_at.toISOString(),
        };
      } catch (error) {
        throw new Error("Failed to create user: " + error.message);
      }
    },

    updateUser: async (_, { id, input }, { user }) => {
      if (!user) throw new Error("Authentication required.");
      if (user.id !== parseInt(id)) throw new Error("Unauthorized: You can only update your own account.");

      try {
        const userToUpdate = await User.findByPk(id);
        if (!userToUpdate) throw new Error("User not found");

        const updatedValues = {};
        if (input.email) {
          const normalizedEmail = input.email.toLowerCase().trim();
          if (normalizedEmail !== user.email) {
            const existingUser = await User.findOne({ where: { email: normalizedEmail } });
            if (existingUser) throw new Error("Email is already in use");
          }
          updatedValues.email = normalizedEmail;
        }

        if (input.password) {
          updatedValues.password_hash = await bcrypt.hash(input.password, 12);
        }

        await userToUpdate.update(updatedValues);

        return {
          ...userToUpdate.toJSON(),
          created_at: userToUpdate.created_at.toISOString(),
          updated_at: userToUpdate.updated_at.toISOString(),
        };
      } catch (error) {
        throw new Error("Failed to update user: " + error.message);
      }
    },

    deleteUser: async (_, { id }, { user }) => {
      if (!user) throw new Error("Authentication required.");
      if (user.id !== parseInt(id)) throw new Error("Unauthorized: You can only delete your own account.");

      try {
        const userToDelete = await User.findByPk(id);
        if (!userToDelete) throw new Error("User not found");

        await userToDelete.destroy();

        return { message: "User deleted successfully" };
      } catch (error) {
        throw new Error("Failed to delete user: " + error.message);
      }
    },

    createTransition: async (_, { input }, { user }) => {
      if (!user) throw new Error("Authentication required.");

      try {
        const session = await Session.findByPk(input.sessionId, {
          include: [{ model: Transition, as: "transitions" }],
        });

        if (!session) throw new Error("Session not found.");
        if (session.user_id !== user.id) throw new Error("Unauthorized: You can only add transitions to your own sessions.");
        if (!session.is_multi_sport) throw new Error("Transitions can only be added to multi-sport sessions.");

        const transition = await Transition.create({
          session_id: input.sessionId,
          previous_sport: input.previousSport.trim(),
          next_sport: input.nextSport.trim(),
          transition_time: input.transitionTime,
          comments: input.comments ? input.comments.trim() : null,
        });

        return {
          id: transition.id,
          sessionId: transition.session_id,
          previousSport: transition.previous_sport,
          nextSport: transition.next_sport,
          transitionTime: transition.transition_time,
          comments: transition.comments,
          created_at: transition.created_at.toISOString(),
          updated_at: transition.updated_at.toISOString(),
        };
      } catch (error) {
        throw new Error("Failed to create transition: " + error.message);
      }
    },

    updateTransition: async (_, { id, input }, { user }) => {
      if (!user) throw new Error("Authentication required.");

      try {
        const transition = await Transition.findByPk(id, {
          include: [{ model: Session, as: "session" }],
        });

        if (!transition) throw new Error("Transition not found.");
        if (!transition.session) throw new Error("Session not found.");
        if (transition.session.user_id !== user.id) throw new Error("Unauthorized: You can only update transitions in your own sessions.");
        if (!transition.session.is_multi_sport) throw new Error("Transitions can only be updated in multi-sport sessions.");

        const updatedValues = {
          previous_sport: input.previousSport?.trim() ?? transition.previous_sport,
          next_sport: input.nextSport?.trim() ?? transition.next_sport,
          transition_time: input.transitionTime ?? transition.transition_time,
          comments: input.comments?.trim() ?? transition.comments,
        };

        await transition.update(updatedValues);

        return {
          id: transition.id,
          sessionId: transition.session_id,
          previousSport: transition.previous_sport,
          nextSport: transition.next_sport,
          transitionTime: transition.transition_time,
          comments: transition.comments,
          created_at: transition.created_at.toISOString(),
          updated_at: transition.updated_at.toISOString(),
        };
      } catch (error) {
        throw new Error("Failed to update transition: " + error.message);
      }
    },

    deleteTransition: async (_, { id }, { user }) => {
      if (!user) throw new Error("Authentication required.");

      try {
        const transition = await Transition.findByPk(id, {
          include: [{ model: Session, as: "session" }],
        });

        if (!transition) throw new Error("Transition not found.");
        if (!transition.session) throw new Error("Session not found.");
        if (transition.session.user_id !== user.id) throw new Error("Unauthorized: You can only delete transitions from your own sessions.");
        if (!transition.session.is_multi_sport) throw new Error("Transitions can only be deleted from multi-sport sessions.");

        await transition.destroy();
        return { message: "Transition deleted successfully." };
      } catch (error) {
        throw new Error("Failed to delete transition: " + error.message);
      }
    },

    deletePersonalRecord: async (_, { id }, { user }) => {
      if (!user) throw new Error("Authentication required.");

      try {
        const record = await PersonalRecord.findByPk(id);
        if (!record) throw new Error("Personal Record not found");
        if (record.user_id !== user.id) throw new Error("Unauthorized: You can only delete your own records.");

        await record.destroy();
        return { message: `Personal Record ID ${id} deleted successfully.` };
      } catch (error) {
        console.error("❌ Delete Personal Record Error:", error);
        throw new Error("Failed to delete personal record: " + error.message);
      }
    },
  }
};

module.exports = resolvers;
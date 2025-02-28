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
      return await User.findByPk(user.id, { include: Session });
    },

    sessions: async (_, __, { user }) => {
      if (!user) throw new Error("Authentication required.");

      const sessions = await Session.findAll({
        where: { user_id: user.id },
        include: [{ model: SessionActivity, as: "activities" }, { model: Transition, as: "transitions" }]
      });

      return sessions.map(session => {
        const totalDuration = session.activities.reduce((sum, activity) => sum + (activity.duration || 0), 0);
        const totalDistance = session.activities.reduce((sum, activity) => sum + (activity.distance || 0), 0);

        return {
          id: session.id,
          userId: session.user_id,
          sessionType: session.session_type,
          date: session.date ? session.date.toISOString() : null,
          isMultiSport: session.is_multi_sport,
          totalDuration,  // ✅ Fix: Include this field
          totalDistance,  // ✅ Fix: Include this field
          weatherTemp: session.weather_temp,
          weatherHumidity: session.weather_humidity,
          weatherWindSpeed: session.weather_wind_speed,
          created_at: session.created_at.toISOString(),
          updated_at: session.updated_at.toISOString(),
          activities: session.activities.map(activity => ({
            id: activity.id,
            sessionId: activity.session_id,
            sportType: activity.sport_type,
            duration: activity.duration,
            distance: activity.distance,
            heartRateMin: activity.heart_rate_min,
            heartRateMax: activity.heart_rate_max,
            heartRateAvg: activity.heart_rate_avg,
            cadence: activity.cadence,
            power: activity.power,
          })) || [],
          transitions: session.transitions.map(transition => ({
            id: transition.id,
            sessionId: transition.session_id,
            previousSport: transition.previous_sport,
            nextSport: transition.next_sport,
            transitionTime: transition.transition_time,
            comments: transition.comments,
          })) || []
        };
      });
    },

    session: async (_, { id }, { user }) => {
      if (!user) throw new Error("Authentication required.");
      const session = await Session.findByPk(id, {
        include: [{ model: SessionActivity, as: "activities" }, { model: Transition, as: "transitions" }]
      });

      if (!session || session.user_id !== user.id) throw new Error("Unauthorized");

      const totalDuration = session.activities.reduce((sum, activity) => sum + (activity.duration || 0), 0);
      const totalDistance = session.activities.reduce((sum, activity) => sum + (activity.distance || 0), 0);

      return {
        id: session.id,
        userId: session.user_id,
        sessionType: session.session_type,
        date: session.date ? session.date.toISOString() : null,
        isMultiSport: session.is_multi_sport,
        totalDuration,  // ✅ Fix: Include this field
        totalDistance,  // ✅ Fix: Include this field
        weatherTemp: session.weather_temp,
        weatherHumidity: session.weather_humidity,
        weatherWindSpeed: session.weather_wind_speed,
        created_at: session.created_at.toISOString(),
        updated_at: session.updated_at.toISOString(),
        activities: session.activities.map(activity => ({
          id: activity.id,
          sessionId: activity.session_id,
          sportType: activity.sport_type,
          duration: activity.duration,
          distance: activity.distance,
          heartRateMin: activity.heart_rate_min,
          heartRateMax: activity.heart_rate_max,
          heartRateAvg: activity.heart_rate_avg,
          cadence: activity.cadence,
          power: activity.power,
        })) || [],
        transitions: session.transitions.map(transition => ({
          id: transition.id,
          sessionId: transition.session_id,
          previousSport: transition.previous_sport,
          nextSport: transition.next_sport,
          transitionTime: transition.transition_time,
          comments: transition.comments,
        })) || []
      };
    },

    sessionActivities: async (_, { sessionId }, { user }) => {
      if (!user) throw new Error("Authentication required.");
      const session = await Session.findByPk(sessionId);
      if (!session || session.user_id !== user.id) throw new Error("Unauthorized");

      const activities = await SessionActivity.findAll({ where: { session_id: sessionId } });

      return activities.map(activity => ({
        id: activity.id,
        sessionId: activity.session_id,
        sportType: activity.sport_type,
        duration: activity.duration,
        distance: activity.distance,
        heartRateMin: activity.heart_rate_min,
        heartRateMax: activity.heart_rate_max,
        heartRateAvg: activity.heart_rate_avg,
        cadence: activity.cadence,
        power: activity.power,
        created_at: activity.created_at.toISOString(),
        updated_at: activity.updated_at.toISOString(),
      }));
    },

    transitions: async (_, { sessionId }, { user }) => {
      if (!user) throw new Error("Authentication required.");

      const session = await Session.findByPk(sessionId);
      if (!session) throw new Error("Session not found.");
      if (session.user_id !== user.id) throw new Error("Unauthorized: You can only view transitions for your own sessions.");

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

      const groupedRecords = {};
      records.forEach(record => {
        if (!groupedRecords[record.distance]) {
          groupedRecords[record.distance] = [];
        }
        if (groupedRecords[record.distance].length < 3) {
          groupedRecords[record.distance].push({
            id: record.id,
            userId: record.user_id,
            sessionActivityId: record.session_activity_id,
            activityType: record.activity_type,
            distance: record.distance,
            bestTime: record.best_time,
            recordDate: record.record_date ? record.record_date.toISOString() : null,
            created_at: record.created_at.toISOString(),
            updated_at: record.updated_at.toISOString(),
          });
        }
      });
      return Object.values(groupedRecords).flat();
    },
   },

   Mutation: {
    login: async (_, { email, password }) => {
      console.log("🔍 Login Mutation Triggered");

      try {
        if (!email || !password) throw new Error("Missing email or password");

        const normalizedEmail = email.toLowerCase().trim();
        console.log("🔍 Normalized Email:", normalizedEmail);

        const user = await User.findOne({ where: { email: normalizedEmail } });
        if (!user) throw new Error("Invalid credentials");

        const passwordValid = await bcrypt.compare(password, user.password_hash);
        if (!passwordValid) throw new Error("Invalid credentials");

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });

        return { token, user };
      } catch (error) {
        throw new Error(`Login failed: ${error.message}`);
      }
    },

    createSession: async (_, { input }, { user }) => {
      if (!user) throw new Error("Authentication required.");

      try {
        const session = await Session.create({
          user_id: user.id,
          session_type: input.sessionType,
          date: new Date(input.date),
          is_multi_sport: input.isMultiSport,
          weather_temp: input.weatherTemp,
          weather_humidity: input.weatherHumidity,
          weather_wind_speed: input.weatherWindSpeed,
        });

        return {
          ...session.toJSON(),
          date: session.date.toISOString(),
          created_at: session.created_at.toISOString(),
          updated_at: session.updated_at.toISOString(),
        };
      } catch (error) {
        throw new Error("Failed to create session: " + error.message);
      }
    },

    updateSession: async (_, { id, input }, { user }) => {
      if (!user) throw new Error("Authentication required.");

      try {
        const session = await Session.findByPk(id);
        if (!session || session.user_id !== user.id) throw new Error("Unauthorized or session not found.");

        const updatedValues = {};
        if (input.sessionType !== undefined) updatedValues.session_type = input.sessionType;
        if (input.date !== undefined) updatedValues.date = new Date(input.date);
        if (input.isMultiSport !== undefined) updatedValues.is_multi_sport = input.isMultiSport;
        if (input.weatherTemp !== undefined) updatedValues.weather_temp = input.weatherTemp;
        if (input.weatherHumidity !== undefined) updatedValues.weather_humidity = input.weatherHumidity;
        if (input.weatherWindSpeed !== undefined) updatedValues.weather_wind_speed = input.weatherWindSpeed;

        await session.update(updatedValues);

        return {
          ...session.toJSON(),
          date: session.date.toISOString(),
          created_at: session.created_at.toISOString(),
          updated_at: session.updated_at.toISOString(),
        };
      } catch (error) {
        throw new Error("Failed to update session: " + error.message);
      }
    },

    deleteSession: async (_, { id }, { user }) => {
      if (!user) throw new Error("Authentication required.");

      try {
        const session = await Session.findByPk(id);
        if (!session || session.user_id !== user.id) throw new Error("Unauthorized or session not found.");

        await SessionActivity.destroy({ where: { session_id: id } });
        await Transition.destroy({ where: { session_id: id } });

        await session.destroy();
        return { message: "Session deleted successfully" };
      } catch (error) {
        throw new Error("Failed to delete session: " + error.message);
      }
    },

    createSessionActivity: async (_, { input }, { user }) => {
      if (!user) throw new Error("Authentication required.");

      try {
        const session = await Session.findByPk(input.sessionId);
        if (!session || session.user_id !== user.id) throw new Error("Unauthorized or session not found.");

        const activity = await SessionActivity.create({
          session_id: input.sessionId,
          sport_type: input.sportType.trim(),
          duration: input.duration,
          distance: input.distance,
          heart_rate_min: input.heartRateMin,
          heart_rate_max: input.heartRateMax,
          heart_rate_avg: input.heartRateAvg,
          cadence: input.cadence,
          power: input.power,
        });

        return {
          ...activity.toJSON(),
          created_at: activity.created_at.toISOString(),
          updated_at: activity.updated_at.toISOString(),
        };
      } catch (error) {
        throw new Error("Failed to create session activity: " + error.message);
      }
    },

    createPersonalRecord: async (_, { input }, { user }) => {
      if (!user) throw new Error("Authentication required.");

      try {
        const session = await Session.findByPk(input.sessionId);
        if (!session || session.user_id !== user.id) throw new Error("Unauthorized or session not found.");

        const activity = await SessionActivity.findByPk(input.sessionActivityId);
        if (!activity) throw new Error("Session Activity not found.");

        const record = await PersonalRecord.create({
          user_id: user.id,
          session_activity_id: input.sessionActivityId,
          distance: input.distance,
          best_time: input.bestTime,
          record_date: input.recordDate ? new Date(input.recordDate) : new Date(),
        });

        return {
          ...record.toJSON(),
          created_at: record.created_at.toISOString(),
          updated_at: record.updated_at.toISOString(),
        };
      } catch (error) {
        throw new Error("Failed to create personal record: " + error.message);
      }
    },

    updatePersonalRecord: async (_, { id, input }, { user }) => {
      if (!user) throw new Error("Authentication required.");

      try {
        const record = await PersonalRecord.findByPk(id);
        if (!record || record.user_id !== user.id) throw new Error("Unauthorized or record not found.");

        await record.update({
          distance: input.distance ?? record.distance,
          best_time: input.bestTime ?? record.best_time,
          record_date: input.recordDate ? new Date(input.recordDate) : record.record_date,
        });

        return {
          ...record.toJSON(),
          created_at: record.created_at.toISOString(),
          updated_at: record.updated_at.toISOString(),
        };
      } catch (error) {
        throw new Error("Failed to update personal record: " + error.message);
      }
    },

    deletePersonalRecord: async (_, { id }, { user }) => {
      if (!user) throw new Error("Authentication required.");

      try {
        const record = await PersonalRecord.findByPk(id);
        if (!record || record.user_id !== user.id) throw new Error("Unauthorized or record not found.");

        await record.destroy();
        return { message: `Personal Record ID ${id} deleted successfully.` };
      } catch (error) {
        throw new Error("Failed to delete personal record: " + error.message);
      }
    },
  }
};

module.exports = resolvers;
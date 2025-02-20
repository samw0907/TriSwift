const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET } = require("../util/config");
const { User, Session, SessionActivity, PersonalRecord, Progress, Transition } = require("../models");

const resolvers = {
  Query: {
    users: async () => await User.findAll(),
    
    user: async (_, { id }) => {
      try {
        const user = await User.findByPk(id, { include: Session });
        if (!user) throw new Error("User not found");
        return user;
      } catch (error) {
        console.error("Fetch User Error:", error);
        throw new Error("Failed to fetch user: " + error.message);
      }
    },

    sessions: async (_, { userId }) => {
      try {
        const sessions = userId 
          ? await Session.findAll({ where: { user_id: userId }, include: SessionActivity })
          : await Session.findAll({ include: SessionActivity });

        return sessions.map(session => ({
          id: session.id,
          userId: session.user_id,
          sessionType: session.session_type,
          date: session.date ? session.date.toISOString() : null,
          totalDuration: session.total_duration,
          totalDistance: session.total_distance,
          weatherTemp: session.weather_temp,
          weatherHumidity: session.weather_humidity,
          weatherWindSpeed: session.weather_wind_speed,
          activities: session.SessionActivities.map(activity => ({
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
        }));
      } catch (error) {
        console.error("Fetch Sessions Error:", error);
        throw new Error("Failed to fetch sessions: " + error.message);
      }
    },

    session: async (_, { id }) => {
      try {
        const session = await Session.findByPk(id, { include: [SessionActivity, Transition] });

        if (!session) throw new Error("Session not found");

        return {
          id: session.id,
          userId: session.user_id,
          sessionType: session.session_type,
          date: session.date ? session.date.toISOString() : null,
          totalDuration: session.total_duration,
          totalDistance: session.total_distance,
          weatherTemp: session.weather_temp,
          weatherHumidity: session.weather_humidity,
          weatherWindSpeed: session.weather_wind_speed,
          activities: session.SessionActivities.map(activity => ({
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
          transitions: session.Transitions.map(transition => ({
            id: transition.id,
            sessionId: transition.session_id,
            previousSport: transition.previous_sport,
            nextSport: transition.next_sport,
            transitionTime: transition.transition_time,
            comments: transition.comments,
            created_at: transition.createdAt.toISOString(),
            updated_at: transition.updatedAt.toISOString(),
          })) || [],
        };
      } catch (error) {
        console.error("Fetch Session Error:", error);
        throw new Error("Failed to fetch session: " + error.message);
      }
    },

    transitions: async (_, { sessionId }) => {
      try {
        const transitions = await Transition.findAll({ where: { session_id: sessionId } });

        return transitions.map(transition => ({
          id: transition.id,
          sessionId: transition.session_id,
          previousSport: transition.previous_sport,
          nextSport: transition.next_sport,
          transitionTime: transition.transition_time,
          comments: transition.comments,
          created_at: transition.createdAt.toISOString(),
          updated_at: transition.updatedAt.toISOString(),
        }));
      } catch (error) {
        console.error("Fetch Transitions Error:", error);
        throw new Error("Failed to fetch transitions: " + error.message);
      }
    },
  },

  Mutation: {
    createSession: async (_, { input }) => {
      try {
        const session = await Session.create({
          user_id: input.userId,
          session_type: input.sessionType,
          date: new Date(input.date),
          total_duration: input.totalDuration,
          total_distance: input.totalDistance,
          weather_temp: input.weatherTemp,
          weather_humidity: input.weatherHumidity,
          weather_wind_speed: input.weatherWindSpeed,
        });

        return {
          id: session.id,
          userId: session.user_id,
          sessionType: session.session_type,
          date: session.date.toISOString(),
          totalDuration: session.total_duration,
          totalDistance: session.total_distance,
          weatherTemp: session.weather_temp,
          weatherHumidity: session.weather_humidity,
          weatherWindSpeed: session.weather_wind_speed,
        };
      } catch (error) {
        console.error("Create Session Error:", error);
        throw new Error("Failed to create session: " + error.message);
      }
    },

    createTransition: async (_, { input }) => {
      try {
        const transition = await Transition.create({
          session_id: input.sessionId,
          previous_sport: input.previousSport,
          next_sport: input.nextSport,
          transition_time: input.transitionTime,
          comments: input.comments,
        });

        return {
          id: transition.id,
          sessionId: transition.session_id,
          previousSport: transition.previous_sport,
          nextSport: transition.next_sport,
          transitionTime: transition.transition_time,
          comments: transition.comments,
          created_at: transition.createdAt.toISOString(),
          updated_at: transition.updatedAt.toISOString(),
        };
      } catch (error) {
        console.error("Create Transition Error:", error);
        throw new Error("Failed to create transition: " + error.message);
      }
    },

    createPersonalRecord: async (_, { input }) => {
      try {
        const record = await PersonalRecord.create({
          user_id: input.userId,
          activity_type: input.activityType,
          distance: input.distance,
          best_time: input.bestTime,
          max_power: input.maxPower,
          record_date: input.recordDate || new Date(),
        });

        return {
          id: record.id,
          userId: record.user_id,
          activityType: record.activity_type,
          distance: record.distance,
          bestTime: record.best_time,
          recordDate: record.record_date ? record.record_date.toISOString() : null,
        };
      } catch (error) {
        console.error("Create Personal Record Error:", error);
        throw new Error("Failed to create personal record: " + error.message);
      }
    },

    createProgress: async (_, { input }) => {
      try {
        const progress = await Progress.create({
          user_id: input.userId,
          activity_type: input.activityType,
          achieved_value: input.achievedValue,
          date: new Date(input.date),
        });

        return {
          id: progress.id,
          userId: progress.user_id,
          activityType: progress.activity_type,
          achievedValue: progress.achieved_value,
          date: progress.date.toISOString(),
        };
      } catch (error) {
        console.error("Create Progress Error:", error);
        throw new Error("Failed to create progress: " + error.message);
      }
    },
  },
};

module.exports = resolvers;

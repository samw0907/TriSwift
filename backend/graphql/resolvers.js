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
        try {
          const {
            userId, sessionType, date, totalDuration, totalDistance,
            weatherTemp, weatherHumidity, weatherWindSpeed
          } = input;
  
          // ✅ Creating a new session with correct column names
          const session = await Session.create({
            user_id: userId,  // Correct field name
            session_type: sessionType,  // Correct field name
            date: new Date(date),
            total_duration: totalDuration,  // Correct field name
            total_distance: totalDistance,  // Correct field name
            weather_temp: weatherTemp,  // Correct field name
            weather_humidity: weatherHumidity,  // Correct field name
            weather_wind_speed: weatherWindSpeed,  // Correct field name
          });
  
          // ✅ Explicitly returning the correct field names expected by GraphQL
          return {
            id: session.id,
            userId: session.user_id,
            sessionType: session.session_type, // Ensure it matches GraphQL schema
            date: session.date.toISOString(),
            totalDuration: session.total_duration,
            totalDistance: session.total_distance,
            weatherTemp: session.weather_temp,
            weatherHumidity: session.weather_humidity,
            weatherWindSpeed: session.weather_wind_speed
          };
  
        } catch (error) {
          console.error("Create Session Error:", error);
          throw new Error("Failed to create session: " + error.message);
        }
    },
    createSessionActivity: async (_, { input }) => {
      try {
        return await SessionActivity.create({
          session_id: input.sessionId,
          sport_type: input.sportType,
          duration: input.duration,
          distance: input.distance,
          heart_rate_min: input.heartRateMin,
          heart_rate_max: input.heartRateMax,
          heart_rate_avg: input.heartRateAvg,
          cadence: input.cadence,
          power: input.power,
        });
      } catch (error) {
        console.error("Create Session Activity Error:", error);
        throw new Error("Failed to create session activity: " + error.message);
      }
    },

    createPersonalRecord: async (_, { input }) => {
      try {
        return await PersonalRecord.create({
          user_id: input.userId,
          sport_type: input.sportType,
          best_time: input.bestTime,
          max_power: input.maxPower,
        });
      } catch (error) {
        console.error("Create Personal Record Error:", error);
        throw new Error("Failed to create personal record: " + error.message);
      }
    },

    createProgress: async (_, { input }) => {
      try {
        return await Progress.create({
          user_id: input.userId, 
          activity_type: input.activityType,
          achieved_value: input.achievedValue,
          date: input.date,
        });
      } catch (error) {
        console.error("Create Progress Error:", error);
        throw new Error("Failed to create progress entry: " + error.message);
      }
    },
  },
};

module.exports = resolvers;

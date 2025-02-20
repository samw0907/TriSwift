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
        transitions: async (_, { sessionId }) => {
          try {
            const transitions = await Transition.findAll({ where: { session_id: sessionId } });
            return transitions.map(t => ({
              id: t.id,
              sessionId: t.session_id,
              previousSport: t.previousSport,
              nextSport: t.nextSport,
              transitionTime: t.transitionTime,
              comments: t.comments,
              created_at: t.created_at.toISOString(),
              updated_at: t.updated_at.toISOString(),
            }));
          } catch (error) {
            console.error("Fetch Transitions Error:", error);
            throw new Error("Failed to fetch transitions: " + error.message);
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
          const session = await Session.findByPk(id, { include: SessionActivity });
  
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
          };
        } catch (error) {
          console.error("Fetch Session Error:", error);
          throw new Error("Failed to fetch session: " + error.message);
        }
      },
  
      sessionActivities: async (_, { sessionId }) => {
        try {
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
          }));
        } catch (error) {
          console.error("Fetch Session Activities Error:", error);
          throw new Error("Failed to fetch session activities: " + error.message);
        }
      },

      personalRecords: async (_, { userId }) => {
        try {
          const records = await PersonalRecord.findAll({ where: { user_id: userId } });
      
          return records.map(record => ({
            id: record.id,
            userId: record.user_id,
            activityType: record.activity_type,
            distance: record.distance,
            bestTime: record.best_time,
            recordDate: record.record_date ? record.record_date.toISOString() : null,
          }));
        } catch (error) {
          console.error("Fetch Personal Records Error:", error);
          throw new Error("Failed to fetch personal records: " + error.message);
        }
      },
      
      progress: async (_, { userId }) => {
        try {
          const progressEntries = await Progress.findAll({ where: { user_id: userId } });
      
          return progressEntries.map(entry => ({
            id: entry.id,
            userId: entry.user_id,
            activityType: entry.activity_type,
            achievedValue: entry.achieved_value,
            date: entry.date ? entry.date.toISOString() : null,
            created_at: entry.createdAt ? entry.created_at.toISOString() : null,
            updated_at: entry.updatedAt ? entry.updated_at.toISOString() : null,
          }));
        } catch (error) {
          console.error("Fetch Progress Error:", error);
          throw new Error("Failed to fetch progress: " + error.message);
        }
      },
    },  

  Mutation: {
    createSession: async (_, { input }) => {
      try {
        const {
          userId, sessionType, date, totalDuration, totalDistance,
          weatherTemp, weatherHumidity, weatherWindSpeed
        } = input;

        const session = await Session.create({
          user_id: userId,
          session_type: sessionType,
          date: new Date(date),
          total_duration: totalDuration,
          total_distance: totalDistance,
          weather_temp: weatherTemp,
          weather_humidity: weatherHumidity,
          weather_wind_speed: weatherWindSpeed,
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

    createUser: async (_, { input }) => {
      try {
        if (!input.name || !input.email || !input.password) {
          throw new Error("All fields (name, email, password) are required");
        }
  
        const existingUser = await User.findOne({ where: { email: input.email } });
        if (existingUser) {
          throw new Error("Email is already in use");
        }

        const passwordHash = await bcrypt.hash(input.password, 10);
        const user = await User.create({
          name: input.name,
          email: input.email,
          password_hash: passwordHash,
        });
  
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.created_at.toISOString(),
          updatedAt: user.updated_at.toISOString(),
        };
      } catch (error) {
        console.error("Create User Error:", error);
        throw new Error("Failed to create user: " + error.message);
      }
    },

    createTransition: async (_, { input }) => {
      try {
        const transition = await Transition.create({
          session_id: input.sessionId,
          previousSport: input.previousSport,
          nextSport: input.nextSport,
          transitionTime: input.transitionTime,
          comments: input.comments,
        });

        return {
          id: transition.id,
          sessionId: transition.session_id,
          previousSport: transition.previousSport,
          nextSport: transition.nextSport,
          transitionTime: transition.transitionTime,
          comments: transition.comments,
          created_at: transition.created_at.toISOString(),
          updated_at: transition.updated_at.toISOString(),
        };
      } catch (error) {
        console.error("Create Transition Error:", error);
        throw new Error("Failed to create transition: " + error.message);
      }
    },

    createSessionActivity: async (_, { input }) => {
        try {
          const activity = await SessionActivity.create({
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
      
          return {
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
          };
        } catch (error) {
          console.error("Create Session Activity Error:", error);
          throw new Error("Failed to create session activity: " + error.message);
        }
      },

      createPersonalRecord: async (_, { input }) => {
        try {
            if (!input.userId || !input.activityType || !input.bestTime) {
                throw new Error('User ID, Activity Type, and Best Time are required.');
            }
    
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
    }
};

module.exports = resolvers;

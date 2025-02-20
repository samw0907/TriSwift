const bcrypt = require("bcrypt");
const { User, Session, SessionActivity, PersonalRecord, Transition } = require("../models");

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
              previousSport: t.previous_sport,
              nextSport: t.next_sport,
              transitionTime: t.transition_time,
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
              created_at: session.created_at.toISOString(),
              updated_at: session.updated_at.toISOString(),
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
            created_at: session.created_at.toISOString(),
            updated_at: session.updated_at.toISOString(),
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
            created_at: activity.created_at.toISOString(),
            updated_at: activity.updated_at.toISOString(),
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
            created_at: record.created_at ? record.created_at.toISOString() : null,
            updated_at: record.updated_at ? record.updated_at.toISOString() : null
          }));
        } catch (error) {
          console.error("Fetch Personal Records Error:", error);
          throw new Error("Failed to fetch personal records: " + error.message);
        }
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
          created_at: session.created_at ? session.created_at.toISOString() : null,
          updated_at: session.updated_at ? session.updated_at.toISOString() : null,
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
          created_at: user.created_at.toISOString(),
          updated_at: user.updated_at.toISOString(),
        };
      } catch (error) {
        console.error("Create User Error:", error);
        throw new Error("Failed to create user: " + error.message);
      }
    },

    createTransition: async (_, { input }) => {
      try {
        const transition = await Transition.create({
          session_id: input.session_id,
          previous_sport: input.previous_sport,
          next_sport: input.next_sport,
          transition_time: input.transition_time,
          comments: input.comments,
        });
    
        return {
          id: transition.id,
          session_id: transition.session_id,
          previous_sport: transition.previous_sport,
          next_sport: transition.next_sport,
          transition_time: transition.transition_time,
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
            created_at: activity.created_at.toISOString(),
            updated_at: activity.updated_at.toISOString()
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
                created_at: record.created_at ? record.created_at.toISOString() : null,
                updated_at: record.updated_at ? record.updated_at.toISOString() : null
            };
        } catch (error) {
            console.error("Create Personal Record Error:", error);
            throw new Error("Failed to create personal record: " + error.message);
        }
    }
  }
}
}

module.exports = resolvers;

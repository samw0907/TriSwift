const bcrypt = require("bcrypt");
const { User, Session, SessionActivity, PersonalRecord, Transition } = require("../models");

const resolvers = {
    Query: {
        users: async (_, __, { user }) => {
          if (!user) throw new Error("Authentication required.");
          return await User.findAll({ where: { id: user.id } }); // Only fetch the logged-in user
        },

        user: async (_, __, { user }) => {
          if (!user) throw new Error("Authentication required.");
          return await User.findByPk(user.id, { include: Session });
        },        
        
        transitions: async (_, { sessionId }, { user }) => {
          if (!user) throw new Error("Authentication required.");
        
          try {
            const session = await Session.findOne({ where: { id: sessionId, user_id: user.id } });
            if (!session) throw new Error("Unauthorized access.");
        
            return await Transition.findAll({ where: { session_id: sessionId } });
          } catch (error) {
            console.error("Fetch Transitions Error:", error);
            throw new Error("Failed to fetch transitions: " + error.message);
          }
        },
        
        sessions: async (_, __, { user }) => {
          if (!user) throw new Error("Authentication required.");
        
          try {
            const sessions = await Session.findAll({
              where: { user_id: user.id },
              include: SessionActivity
            });
        
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
  
      sessionActivities: async (_, { sessionId }, { user }) => {
        if (!user) throw new Error("Authentication required.");
      
        try {
          const session = await Session.findOne({ where: { id: sessionId, user_id: user.id } });
          if (!session) throw new Error("Unauthorized access.");
      
          return await SessionActivity.findAll({ where: { session_id: sessionId } });
        } catch (error) {
          console.error("Fetch Session Activities Error:", error);
          throw new Error("Failed to fetch session activities: " + error.message);
        }
      },
      
      personalRecords: async (_, __, { user }) => {
        if (!user) throw new Error("Authentication required.");
      
        try {
          const records = await PersonalRecord.findAll({ where: { user_id: user.id } });
      
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

    updateSession: async (_, { id, input }) => {
      try {
        const session = await Session.findByPk(id);
        if (!session) throw new Error("Session not found");
    
        // Update only provided fields
        const updatedValues = {};
        if (input.sessionType !== undefined) updatedValues.session_type = input.sessionType;
        if (input.date !== undefined) updatedValues.date = input.date;
        if (input.totalDuration !== undefined) updatedValues.total_duration = input.totalDuration;
        if (input.totalDistance !== undefined) updatedValues.total_distance = input.totalDistance;
        if (input.weatherTemp !== undefined) updatedValues.weather_temp = input.weatherTemp;
        if (input.weatherHumidity !== undefined) updatedValues.weather_humidity = input.weatherHumidity;
        if (input.weatherWindSpeed !== undefined) updatedValues.weather_wind_speed = input.weatherWindSpeed;
    
        await session.update(updatedValues);
    
        // ✅ Fetch the updated session again to ensure correct formatting
        const updatedSession = await Session.findByPk(id);
    
        return {
          id: updatedSession.id,
          userId: updatedSession.user_id,
          sessionType: updatedSession.session_type,
          date: updatedSession.date.toISOString(),
          totalDuration: updatedSession.total_duration,
          totalDistance: updatedSession.total_distance,
          weatherTemp: updatedSession.weather_temp,
          weatherHumidity: updatedSession.weather_humidity,
          weatherWindSpeed: updatedSession.weather_wind_speed,
          created_at: updatedSession.created_at.toISOString(),
          updated_at: updatedSession.updated_at.toISOString(),
        };
      } catch (error) {
        console.error("Update Session Error:", error);
        throw new Error("Failed to update session: " + error.message);
      }
    },

    deleteSession: async (_, { id }) => {
      try {
        const session = await Session.findByPk(id);
        if (!session) throw new Error("Session not found");
  
        await session.destroy();
        return { message: "Session deleted successfully" };
      } catch (error) {
        console.error("Delete Session Error:", error);
        throw new Error("Failed to delete session: " + error.message);
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
    
    updateUser: async (_, { id, input }) => {
      try {
        const user = await User.findByPk(id);
        if (!user) throw new Error("User not found");
  
        await user.update(input);
        return user;
      } catch (error) {
        console.error("Update User Error:", error);
        throw new Error("Failed to update user: " + error.message);
      }
    },

    deleteUser: async (_, { id }) => {
      try {
        const user = await User.findByPk(id);
        if (!user) throw new Error("User not found");
  
        await user.destroy();
        return { message: "User deleted successfully" };
      } catch (error) {
        console.error("Delete User Error:", error);
        throw new Error("Failed to delete user: " + error.message);
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

    updateTransition: async (_, { id, input }) => {
      try {
        const transition = await Transition.findByPk(id);
        if (!transition) throw new Error("Transition not found");
    
        const updatedValues = {
          previous_sport: input.previousSport ?? transition.previous_sport,
          next_sport: input.nextSport ?? transition.next_sport,
          transition_time: input.transitionTime ?? transition.transition_time,
          comments: input.comments ?? transition.comments,
        };
    
        await transition.update(updatedValues);
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
        console.error("Update Transition Error:", error);
        throw new Error("Failed to update transition: " + error.message);
      }
    },

    deleteTransition: async (_, { id }) => {
      try {
        const transition = await Transition.findByPk(id);
        if (!transition) throw new Error("Transition not found");
  
        await transition.destroy();
        return { message: "Transition deleted successfully" };
      } catch (error) {
        console.error("Delete Transition Error:", error);
        throw new Error("Failed to delete transition: " + error.message);
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

      updateSessionActivity: async (_, { id, input }) => {
        try {
          const activity = await SessionActivity.findByPk(id);
          if (!activity) throw new Error("Session Activity not found");
    
          await activity.update(input);
          return activity;
        } catch (error) {
          console.error("Update Session Activity Error:", error);
          throw new Error("Failed to update session activity: " + error.message);
        }
      },

      deleteSessionActivity: async (_, { id }) => {
        try {
          const activity = await SessionActivity.findByPk(id);
          if (!activity) throw new Error("Session Activity not found");
    
          await activity.destroy();
          return { message: "Session Activity deleted successfully" };
        } catch (error) {
          console.error("Delete Session Activity Error:", error);
          throw new Error("Failed to delete session activity: " + error.message);
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
    },

    updatePersonalRecord: async (_, { id, input }) => {
      try {
        const record = await PersonalRecord.findByPk(id);
        if (!record) throw new Error("Personal Record not found");
    
        await record.update({
          activity_type: input.activityType ?? record.activity_type,
          distance: input.distance ?? record.distance,
          best_time: input.bestTime ?? record.best_time,
          record_date: input.recordDate ?? record.record_date
        });
  
        const updatedRecord = await PersonalRecord.findByPk(id);
    
        return {
          id: updatedRecord.id,
          userId: updatedRecord.user_id,
          activityType: updatedRecord.activity_type,
          distance: updatedRecord.distance,
          bestTime: updatedRecord.best_time,
          recordDate: updatedRecord.record_date ? updatedRecord.record_date.toISOString() : null,
          created_at: updatedRecord.created_at.toISOString(),
          updated_at: updatedRecord.updated_at.toISOString()
        };
      } catch (error) {
        console.error("Update Personal Record Error:", error);
        throw new Error("Failed to update personal record: " + error.message);
      }
    },

    deletePersonalRecord: async (_, { id }) => {
      try {
        const record = await PersonalRecord.findByPk(id);
        if (!record) throw new Error("Personal Record not found");
  
        await record.destroy();
        return { message: "Personal Record deleted successfully" };
      } catch (error) {
        console.error("Delete Personal Record Error:", error);
        throw new Error("Failed to delete personal record: " + error.message);
      }
    },
  }
}

module.exports = resolvers;

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
      sessions: async (_, __, { user }) => {
          if (!user) throw new Error("Authentication required.");
          const sessions = await Session.findAll({ where: { user_id: user.id }, include: SessionActivity });
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
      },
      session: async (_, { id }, { user }) => {
          if (!user) throw new Error("Authentication required.");
          const session = await Session.findByPk(id, { include: SessionActivity });
          if (!session || session.user_id !== user.id) throw new Error("Unauthorized");
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
      
      personalRecords: async (_, { sportType }, { user }) => {
        if (!user) throw new Error("Authentication required.");
      
        try {
          const records = await PersonalRecord.findAll({
            where: {
              user_id: user.id,
              activity_type: sportType,
            },
            order: [["distance", "ASC"], ["best_time", "ASC"]],
          });
      
          const groupedRecords = {};
          records.forEach((record) => {
            if (!groupedRecords[record.distance]) {
              groupedRecords[record.distance] = [];
            }
            if (groupedRecords[record.distance].length < 3) {
              groupedRecords[record.distance].push({
                id: record.id,
                userId: record.user_id,
                activityType: record.activity_type,
                distance: record.distance,
                bestTime: record.best_time,
                recordDate: record.record_date ? record.record_date.toISOString() : null,
                created_at: record.created_at ? record.created_at.toISOString() : null,
                updated_at: record.updated_at ? record.updated_at.toISOString() : null,
              });
            }
          });
      
          return Object.values(groupedRecords);
        } catch (error) {
          console.error("Error fetching personal records:", error);
          throw new Error("Failed to fetch personal records");
        }
      }      
  },
  Mutation: {
    login: async (_, { email, password }) => {
      try {
        if (!email || !password) throw new Error("Missing email or password");

        const user = await User.findOne({ where: { email } });
        if (!user) throw new Error("Invalid credentials");

        const passwordValid = await bcrypt.compare(password, user.password_hash);
        if (!passwordValid) throw new Error("Invalid credentials");

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });

        return { token };
      } catch (error) {
        console.error("Login Error:", error);
        throw new Error("Login failed");
      }
    },

    createSession: async (_, { input }, { user }) => {
      if (!user) throw new Error("Authentication required.");
  
      try {
          const {
              sessionType, date, totalDuration, totalDistance,
              weatherTemp, weatherHumidity, weatherWindSpeed
          } = input;
  
          const session = await Session.create({
              user_id: user.id, 
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
              created_at: session.created_at.toISOString(),
              updated_at: session.updated_at.toISOString(),
          };
      } catch (error) {
          console.error("Create Session Error:", error);
          throw new Error("Failed to create session: " + error.message);
      }
  },
  
  updateSession: async (_, { id, input }, { user }) => {
      if (!user) throw new Error("Authentication required.");
  
      try {
          const session = await Session.findByPk(id);
          if (!session) throw new Error("Session not found");
          if (session.user_id !== user.id) throw new Error("Unauthorized");
  
          const updatedValues = {};
          if (input.sessionType !== undefined) updatedValues.session_type = input.sessionType;
          if (input.date !== undefined) updatedValues.date = input.date;
          if (input.totalDuration !== undefined) updatedValues.total_duration = input.totalDuration;
          if (input.totalDistance !== undefined) updatedValues.total_distance = input.totalDistance;
          if (input.weatherTemp !== undefined) updatedValues.weather_temp = input.weatherTemp;
          if (input.weatherHumidity !== undefined) updatedValues.weather_humidity = input.weatherHumidity;
          if (input.weatherWindSpeed !== undefined) updatedValues.weather_wind_speed = input.weatherWindSpeed;
  
          await session.update(updatedValues);
  
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
              created_at: session.created_at.toISOString(),
              updated_at: session.updated_at.toISOString(),
          };
      } catch (error) {
          console.error("Update Session Error:", error);
          throw new Error("Failed to update session: " + error.message);
      }
  },
  
  deleteSession: async (_, { id }, { user }) => {
      if (!user) throw new Error("Authentication required.");
  
      try {
          const session = await Session.findByPk(id);
          if (!session) throw new Error("Session not found");
          if (session.user_id !== user.id) throw new Error("Unauthorized");
  
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
    
    updateUser: async (_, { id, input }, { user }) => {
      if (!user) throw new Error("Authentication required.");
      if (user.id !== parseInt(id)) throw new Error("Unauthorized: You can only update your own account.");
    
      try {
        const userToUpdate = await User.findByPk(id);
        if (!userToUpdate) throw new Error("User not found");
    
        await userToUpdate.update(input);
    
        return {
          id: userToUpdate.id,
          name: userToUpdate.name,
          email: userToUpdate.email,
          created_at: userToUpdate.created_at.toISOString(),
          updated_at: userToUpdate.updated_at.toISOString(),
        };
      } catch (error) {
        console.error("Update User Error:", error);
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
        console.error("Delete User Error:", error);
        throw new Error("Failed to delete user: " + error.message);
      }
    },    

    createTransition: async (_, { input }, { user }) => {
      if (!user) throw new Error("Authentication required.");
  
      console.log("Received Input:", input);
      console.log("Extracted sessionId:", input.sessionId);
  
      try {
          const session = await Session.findByPk(input.sessionId);
          console.log("Session Found:", session ? "Yes" : "No");
  
          if (!session) throw new Error("Session not found.");
          if (session.user_id !== user.id) throw new Error("Unauthorized: You can only add transitions to your own sessions.");
  
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
          };
      } catch (error) {
          console.error("Create Transition Error:", error);
          throw new Error("Failed to create transition: " + error.message);
      }
  },
   
    updateTransition: async (_, { id, input }, { user }) => {
      if (!user) throw new Error("Authentication required.");
  
      const transition = await Transition.findByPk(id);
      if (!transition) throw new Error("Transition not found.");
  
      const session = await Session.findByPk(transition.session_id);
      if (!session || session.user_id !== user.id) throw new Error("Unauthorized: You can only update transitions in your own sessions.");
  
      const updatedValues = {
          previous_sport: input.previousSport ?? transition.previous_sport,
          next_sport: input.nextSport ?? transition.next_sport,
          transition_time: input.transitionTime ?? transition.transition_time,
          comments: input.comments ?? transition.comments,
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
  },  
    
    deleteTransition: async (_, { id }, { user }) => {
      if (!user) throw new Error("Authentication required.");

      const transition = await Transition.findByPk(id);
      if (!transition) throw new Error("Transition not found.");

      const session = await Session.findByPk(transition.session_id);
      if (!session || session.user_id !== user.id) throw new Error("Unauthorized: You can only delete transitions from your own sessions.");

      await transition.destroy();
      return { message: "Transition deleted successfully" };
  },
  
    createSessionActivity: async (_, { input }, { user }) => {
      if (!user) throw new Error("Authentication required.");
    
      try {
        const session = await Session.findByPk(input.sessionId);
        if (!session || session.user_id !== user.id) throw new Error("Unauthorized: You can only add activities to your own sessions.");
    
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
    
    updateSessionActivity: async (_, { id, input }, { user }) => {
      if (!user) throw new Error("Authentication required.");
    
      try {
        const activity = await SessionActivity.findByPk(id);
        if (!activity) throw new Error("Session Activity not found");
    
        const session = await Session.findByPk(activity.session_id);
        if (!session || session.user_id !== user.id) throw new Error("Unauthorized: You can only update activities in your own sessions.");
    
        await activity.update(input);
    
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
        console.error("Update Session Activity Error:", error);
        throw new Error("Failed to update session activity: " + error.message);
      }
    },
    
    deleteSessionActivity: async (_, { id }, { user }) => {
      if (!user) throw new Error("Authentication required.");
    
      try {
        const activity = await SessionActivity.findByPk(id);
        if (!activity) throw new Error("Session Activity not found");
  
        const session = await Session.findByPk(activity.session_id);
        if (!session || session.user_id !== user.id) throw new Error("Unauthorized: You can only delete activities from your own sessions.");
    
        await activity.destroy();
        return { message: "Session Activity deleted successfully" };
      } catch (error) {
        console.error("Delete Session Activity Error:", error);
        throw new Error("Failed to delete session activity: " + error.message);
      }
    },
    
    createPersonalRecord: async (_, { input }, { user }) => {
      if (!user) throw new Error("Authentication required.");
    
      try {
        if (!input.activityType || !input.bestTime) {
          throw new Error("Activity Type and Best Time are required.");
        }
    
        const record = await PersonalRecord.create({
          user_id: user.id, 
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
    
    updatePersonalRecord: async (_, { id, input }, { user }) => {
      if (!user) throw new Error("Authentication required.");
    
      try {
        const record = await PersonalRecord.findByPk(id);
        if (!record) throw new Error("Personal Record not found");
    
        if (record.user_id !== user.id) throw new Error("Unauthorized: You can only update your own records.");
    
        await record.update({
          activity_type: input.activityType ?? record.activity_type,
          distance: input.distance ?? record.distance,
          best_time: input.bestTime ?? record.best_time,
          record_date: input.recordDate ?? record.record_date
        });
    
        return {
          id: record.id,
          userId: record.user_id,
          activityType: record.activity_type,
          distance: record.distance,
          bestTime: record.best_time,
          recordDate: record.record_date ? record.record_date.toISOString() : null,
          created_at: record.created_at.toISOString(),
          updated_at: record.updated_at.toISOString()
        };
      } catch (error) {
        console.error("Update Personal Record Error:", error);
        throw new Error("Failed to update personal record: " + error.message);
      }
    },
    
    deletePersonalRecord: async (_, { id }, { user }) => {
      if (!user) throw new Error("Authentication required.");
    
      try {
        const record = await PersonalRecord.findByPk(id);
        if (!record) throw new Error("Personal Record not found");
    
        if (record.user_id !== user.id) throw new Error("Unauthorized: You can only delete your own records.");
    
        await record.destroy();
        return { message: "Personal Record deleted successfully" };
      } catch (error) {
        console.error("Delete Personal Record Error:", error);
        throw new Error("Failed to delete personal record: " + error.message);
      }
    }    
  }
}

module.exports = resolvers;
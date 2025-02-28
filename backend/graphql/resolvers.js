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
              include: [SessionActivity, Transition]
          });

          return sessions.map(session => {
              const totalDuration = session.SessionActivities.reduce((sum, activity) => sum + activity.duration, 0);
              const totalDistance = session.SessionActivities.reduce((sum, activity) => sum + activity.distance, 0);

              return {
                  id: session.id,
                  userId: session.user_id,
                  sessionType: session.session_type,
                  date: session.date ? session.date.toISOString() : null,
                  isMultiSport: session.is_multi_sport,
                  weatherTemp: session.weather_temp,
                  weatherHumidity: session.weather_humidity,
                  weatherWindSpeed: session.weather_wind_speed,
                  created_at: session.created_at.toISOString(),
                  updated_at: session.updated_at.toISOString(),
                  totalDuration,
                  totalDistance,
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
                  })) || []
              };
          });
      },
      session: async (_, { id }, { user }) => {
          if (!user) throw new Error("Authentication required.");
          const session = await Session.findByPk(id, { include: [SessionActivity, Transition] });
          if (!session || session.user_id !== user.id) throw new Error("Unauthorized");

          const totalDuration = session.SessionActivities.reduce((sum, activity) => sum + activity.duration, 0);
          const totalDistance = session.SessionActivities.reduce((sum, activity) => sum + activity.distance, 0);

          return {
              id: session.id,
              userId: session.user_id,
              sessionType: session.session_type,
              date: session.date ? session.date.toISOString() : null,
              isMultiSport: session.is_multi_sport,
              weatherTemp: session.weather_temp,
              weatherHumidity: session.weather_humidity,
              weatherWindSpeed: session.weather_wind_speed,
              created_at: session.created_at.toISOString(),
              updated_at: session.updated_at.toISOString(),
              totalDuration,
              totalDistance,
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
              })) || []
          };
      },
      sessionActivities: async (_, { sessionId }, { user }) => {
          if (!user) throw new Error("Authentication required.");
          const session = await Session.findByPk(sessionId);
          if (!session || session.user_id !== user.id) throw new Error("Unauthorized");
          const activities = await SessionActivity.findAll({ where: { session_id: sessionId, user_id: user.id } });
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
        records.forEach((record) => {
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
      console.log("📧 Email received:", email);
      console.log("🔑 Password received:", password);
    
      try {
        if (!email || !password) throw new Error("Missing email or password");
    
        const normalizedEmail = email.toLowerCase().trim();
        console.log("🔍 Normalized Email:", normalizedEmail);
    
        const user = await User.findOne({ where: { email: normalizedEmail } });
        console.log("✅ User Found:", user ? user.email : "No User Found");
    
        if (!user) throw new Error("Invalid credentials");
    
        const passwordValid = await bcrypt.compare(password, user.password_hash);
        console.log("🔐 Password Match:", passwordValid ? "✔️ Valid" : "❌ Invalid");
    
        if (!passwordValid) throw new Error("Invalid credentials");
    
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
        console.log("🔑 JWT Token Generated:", token);
    
        return {
          token,
          user: { id: user.id, name: user.name, email: user.email }
        };
      } catch (error) {
        console.error("❌ Login Error:", error);
        throw new Error("Login failed");
      }
    },     

    createSession: async (_, { input }, { user }) => {
      if (!user) throw new Error("Authentication required.");
    
      try {
        const { sessionType, date, totalDuration, totalDistance, weatherTemp, weatherHumidity, weatherWindSpeed, isMultiSport } = input;
    
        const existingSession = await Session.findOne({ where: { user_id: user.id, date: new Date(date) } });
        if (existingSession) throw new Error("A session on this date already exists. Please update the existing session.");
    
        const session = await Session.create({
          user_id: user.id,
          session_type: sessionType,
          date: new Date(date),
          total_duration: totalDuration,
          total_distance: totalDistance,
          is_multi_sport: isMultiSport,
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
          isMultiSport: session.is_multi_sport,
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
        if (session.user_id !== user.id) throw new Error("Unauthorized: Cannot edit another user's session.");
    
        const updatedValues = {};
        if (input.sessionType !== undefined) updatedValues.session_type = input.sessionType;
        if (input.date !== undefined) updatedValues.date = new Date(input.date);
        if (input.totalDuration !== undefined) updatedValues.total_duration = input.totalDuration;
        if (input.totalDistance !== undefined) updatedValues.total_distance = input.totalDistance;
        if (input.weatherTemp !== undefined) updatedValues.weather_temp = input.weatherTemp;
        if (input.weatherHumidity !== undefined) updatedValues.weather_humidity = input.weatherHumidity;
        if (input.weatherWindSpeed !== undefined) updatedValues.weather_wind_speed = input.weatherWindSpeed;
        if (input.isMultiSport !== undefined) updatedValues.is_multi_sport = input.isMultiSport;
    
        await session.update(updatedValues);
    
        return {
          id: session.id,
          userId: session.user_id,
          sessionType: session.session_type,
          date: session.date.toISOString(),
          totalDuration: session.total_duration,
          totalDistance: session.total_distance,
          isMultiSport: session.is_multi_sport,
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
        if (session.user_id !== user.id) throw new Error("Unauthorized: Cannot delete another user's session.");

        await SessionActivity.destroy({ where: { session_id: id } });
        await Transition.destroy({ where: { session_id: id } });
    
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
    
        const normalizedEmail = input.email.toLowerCase().trim();
    
        const existingUser = await User.findOne({ where: { email: normalizedEmail } });
        if (existingUser) {
          throw new Error("Email is already in use");
        }
    
        const passwordHash = await bcrypt.hash(input.password, 12);
        const user = await User.create({
          name: input.name.trim(),
          email: normalizedEmail,
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
    
        if (input.email) {
          const normalizedEmail = input.email.toLowerCase().trim();
          const existingUser = await User.findOne({ where: { email: normalizedEmail } });
          if (existingUser && existingUser.id !== user.id) {
            throw new Error("Email is already in use");
          }
          input.email = normalizedEmail;
        }
    
        if (input.password) {
          input.password_hash = await bcrypt.hash(input.password, 12);
          delete input.password;
        }
    
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
    
        await SessionActivity.destroy({ where: { session_id: user.id } });
        await Transition.destroy({ where: { session_id: user.id } });
        await PersonalRecord.destroy({ where: { user_id: user.id } });
        await Session.destroy({ where: { user_id: user.id } });
    
        await userToDelete.destroy();
    
        return { message: "User deleted successfully" };
      } catch (error) {
        console.error("Delete User Error:", error);
        throw new Error("Failed to delete user: " + error.message);
      }
    },
       
    createTransition: async (_, { input }, { user }) => {
      if (!user) throw new Error("Authentication required.");
    
      try {
        const session = await Session.findByPk(input.sessionId);
        if (!session) throw new Error("Session not found.");
        if (session.user_id !== user.id) throw new Error("Unauthorized: You can only add transitions to your own sessions.");
    
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
        previous_sport: input.previousSport ? input.previousSport.trim() : transition.previous_sport,
        next_sport: input.nextSport ? input.nextSport.trim() : transition.next_sport,
        transition_time: input.transitionTime ?? transition.transition_time,
        comments: input.comments ? input.comments.trim() : transition.comments,
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
      return { message: "Transition deleted successfully." };
    },    
  
    createSessionActivity: async (_, { input }, { user }) => {
      if (!user) throw new Error("Authentication required.");
    
      try {
        const session = await Session.findByPk(input.sessionId);
        if (!session) throw new Error("Session not found.");
        if (session.user_id !== user.id) throw new Error("Unauthorized: You can only add activities to your own sessions.");
        if (!input.sportType || !input.duration || !input.distance) {
          throw new Error("Sport type, duration, and distance are required.");
        }
    
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
    
        const updatedValues = {
          sport_type: input.sportType ? input.sportType.trim() : activity.sport_type,
          duration: input.duration ?? activity.duration,
          distance: input.distance ?? activity.distance,
          heart_rate_min: input.heartRateMin ?? activity.heart_rate_min,
          heart_rate_max: input.heartRateMax ?? activity.heart_rate_max,
          heart_rate_avg: input.heartRateAvg ?? activity.heart_rate_avg,
          cadence: input.cadence ?? activity.cadence,
          power: input.power ?? activity.power,
        };
    
        await activity.update(updatedValues);
    
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
          updated_at: activity.updated_at.toISOString(),
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
        return { message: "Session Activity deleted successfully." };
      } catch (error) {
        console.error("Delete Session Activity Error:", error);
        throw new Error("Failed to delete session activity: " + error.message);
      }
    },   
    
    createPersonalRecord: async (_, { input }, { user }) => {
      if (!user) throw new Error("Authentication required.");
      try {
        if (!input.activityType || !input.sessionId) {
          throw new Error("Activity Type and Session ID are required.");
        }

        const session = await Session.findByPk(input.sessionId);
        if (!session || session.user_id !== user.id) {
          throw new Error("Unauthorized: You can only add records to your own sessions.");
        }
        const activities = await SessionActivity.findAll({
          where: { session_id: input.sessionId, sport_type: input.activityType.trim() },
          order: [["distance", "ASC"], ["duration", "ASC"]],
        });

        if (!activities.length) {
          throw new Error("No session activities found for the given sport type.");
        }
        const validDistances = {
          Running: [100, 200, 400, 1000, 5000, 10000, 21100, 42200],
          Cycling: [10000, 20000, 40000, 50000, 80000, 100000, 150000, 200000],
          Swimming: [100, 200, 400, 800, 1000, 1500, 2000],
        };

        const recordsToSave = [];

        for (const dist of validDistances[input.activityType.trim()] || []) {
          const bestAttempts = activities.filter(a => a.distance === dist).slice(0, 3);

          bestAttempts.forEach((activity) => {
            recordsToSave.push({
              user_id: user.id,
              session_id: input.sessionId,
              activity_type: input.activityType.trim(),
              distance: activity.distance,
              best_time: activity.duration,
              record_date: session.date,
            });
          });
        }

        if (!recordsToSave.length) {
          throw new Error("No valid records found for predefined distances.");
        }

        const createdRecords = await PersonalRecord.bulkCreate(recordsToSave);

        return createdRecords.map(record => ({
          id: record.id,
          userId: record.user_id,
          sessionId: record.session_id,
          activityType: record.activity_type,
          distance: record.distance,
          bestTime: record.best_time,
          recordDate: record.record_date ? record.record_date.toISOString() : null,
          created_at: record.created_at.toISOString(),
          updated_at: record.updated_at.toISOString(),
        }));
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
        if (input.sessionId && input.sessionId !== record.session_id) {
          throw new Error("Session ID cannot be changed.");
        }

        const updatedValues = {
          activity_type: input.activityType ? input.activityType.trim() : record.activity_type,
          distance: input.distance ?? record.distance,
          best_time: input.bestTime ?? record.best_time,
          record_date: input.recordDate ?? record.record_date,
        };

        await record.update(updatedValues);

        return {
          id: record.id,
          userId: record.user_id,
          sessionId: record.session_id,
          activityType: record.activity_type,
          distance: record.distance,
          bestTime: record.best_time,
          recordDate: record.record_date ? record.record_date.toISOString() : null,
          created_at: record.created_at.toISOString(),
          updated_at: record.updated_at.toISOString(),
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
        return { message: `Personal Record ID ${id} deleted successfully.` };
      } catch (error) {
        console.error("Delete Personal Record Error:", error);
        throw new Error("Failed to delete personal record: " + error.message);
      }
    },
  }
}

module.exports = resolvers;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User, Session, SessionActivity, PersonalRecord, Transition } = require("../models");
const { JWT_SECRET } = require("../util/config");

async function createOrUpdatePersonalRecords(userId, sportType, sessionId) {
  console.log("🔍 Checking for personal records update...");

  const activities = await SessionActivity.findAll({
    where: { user_id: userId, sport_type: sportType },
    order: [["distance", "ASC"], ["duration", "ASC"]],
  });

  if (!activities.length) {
    console.log("⚠️ No activities found for personal records.");
    return;
  }

  const validDistances = {
    Run: [0.1, 0.2, 0.4, 1, 5, 10, 21.1, 42.2],
    Bike: [10, 20, 40, 50, 80, 100, 150, 200],
    Swim: [0.1, 0.2, 0.4, 0.8, 1, 1.5, 2],
  };

  const distancesForSport = validDistances[sportType];

  if (!distancesForSport) {
    console.log(`⚠️ No valid distances found for sport type: ${sportType}`);
    return;
  }

  console.log(`🏁 Found ${activities.length} activities for sport: ${sportType}`);

  let recordsToSave = [];

  for (const dist of distancesForSport) {
    const bestAttempts = activities
      .filter((a) => Number(a.distance).toFixed(2) === dist.toFixed(2))
      .sort((a, b) => a.duration - b.duration);

    let uniqueBestAttempts = Array.from(
      new Set(bestAttempts.map((a) => a.duration))
      )
      .map((bestTime) => bestAttempts.find((a) => a.duration === bestTime))
      .slice(0, 3);
  

    console.log(`🎯 Checking records for ${dist} ${sportType === "Swim" ? "m" : "km"} (${uniqueBestAttempts.length} valid entries found)`);

    if (!bestAttempts.length) continue;

    if (!uniqueBestAttempts.length) continue;

    for (const attempt of uniqueBestAttempts) {
      const existingRecords = await PersonalRecord.findAll({
        where: {
          user_id: userId,
          activity_type: sportType,
          distance: dist,
        },
        order: [["best_time", "ASC"]],
      });


      if (existingRecords.length > 0) {
        const slowestRecord = existingRecords[existingRecords.length - 1];

        if (existingRecords.length < 3) {
          console.log(`➕ Adding new record: ${dist} ${sportType === "Swim" ? "m" : "km"}, Time: ${attempt.duration}`);
          recordsToSave.push({
            user_id: userId,
            session_id: sessionId,
            session_activity_id: attempt.id,
            activity_type: sportType,
            distance: sportType === "Swim" ? dist : attempt.distance,
            best_time: attempt.duration,
            record_date: new Date(),
          });
        } else if (attempt.duration < slowestRecord.best_time) {
          console.log(`✅ Replacing slowest record for ${dist} ${sportType === "Swim" ? "m" : "km"}, New best time: ${attempt.duration}`);
          await slowestRecord.update({
            best_time: attempt.duration,
            record_date: new Date(),
            session_id: sessionId,
            session_activity_id: attempt.id,
          });
        }
      } else {
        console.log(`➕ Adding first-time record for ${dist} ${sportType === "Swim" ? "m" : "km"}, Time: ${attempt.duration}`);
        recordsToSave.push({
          user_id: userId,
          session_id: sessionId,
          session_activity_id: attempt.id,
          activity_type: sportType,
          distance: sportType === "Swim" ? dist : attempt.distance, 
          best_time: attempt.duration,
          record_date: new Date(),
        });
      }
    }
  }

  if (recordsToSave.length) {
    await PersonalRecord.bulkCreate(recordsToSave);
    console.log("✅ New personal records added.");
  } else {
    console.log("⚠️ No new personal records to add.");
  }
}

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

    sessions: async (_, __, { user }) => {
      if (!user) throw new Error("Authentication required.");
    
      const sessions = await Session.findAll({
        where: { user_id: user.id },
        include: [
          { model: SessionActivity, as: "activities" },
          { model: Transition, as: "transitions" },
        ],
      });
    
      return sessions.map(session => {
        const activities = (session.activities || []).map(activity => ({
          id: activity.id,
          sessionId: activity.session_id,
          userId: activity.user_id,
          sportType: activity.sport_type ? String(activity.sport_type).trim() : "Unknown",
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
    
        const transitions = session.is_multi_sport 
          ? (session.transitions || []).map(t => ({
          id: t.id,
            sessionId: t.session_id,
            previousSport: t.previous_sport || "Unknown",
            nextSport: t.next_sport || "Unknown", 
            transitionTime: t.transition_time || 0,
            comments: t.comments || "",
            created_at: t.created_at.toISOString(),
            updated_at: t.updated_at.toISOString(),
          })) 
        : [];
    
        const totalDuration = activities.reduce((sum, activity) => sum + (activity.duration || 0), 0)
          + (session.is_multi_sport ? transitions.reduce((sum, t) => sum + (t.transition_time || 0), 0) : 0);
    
          const totalDistance = activities.reduce((sum, activity) => {
            const correctedDistance =
              activity.sportType === "Swim" ? activity.distance / 1000 : activity.distance;
            return sum + correctedDistance;
          }, 0);
    
        return {
          id: session.id,
          userId: session.user_id,
          sessionType: session.session_type,
          date: session.date.toISOString(),
          isMultiSport: session.is_multi_sport,
          totalDuration,
          totalDistance,
          weatherTemp: session.weather_temp,
          weatherHumidity: session.weather_humidity,
          weatherWindSpeed: session.weather_wind_speed,
          created_at: session.created_at.toISOString(),
          updated_at: session.updated_at.toISOString(),
          activities,
          transitions,
        };
      });
    },    

    session: async (_, { id }, { user }) => {
      if (!user) throw new Error("Authentication required.");

      const session = await Session.findByPk(id, {
        include: [
          { model: SessionActivity, as: "activities" },
          { model: Transition, as: "transitions" },
        ],
      });

      if (!session || session.user_id !== user.id) throw new Error("Unauthorized");

      const activities = session.activities || [];
      const transitions = session.is_multi_sport ? session.transitions || [] : [];

      const totalDuration = activities.reduce((sum, activity) => sum + (activity.duration || 0), 0)
        + (session.is_multi_sport ? transitions.reduce((sum, t) => sum + (t.transition_time || 0), 0) : 0);

      const totalDistance = activities.reduce((sum, activity) => sum + (activity.distance || 0), 0);

      return {
        id: session.id,
        userId: session.user_id,
        sessionType: session.session_type,
        date: session.date.toISOString(),
        isMultiSport: session.is_multi_sport,
        totalDuration,
        totalDistance,
        weatherTemp: session.weather_temp,
        weatherHumidity: session.weather_humidity,
        weatherWindSpeed: session.weather_wind_speed,
        created_at: session.created_at.toISOString(),
        updated_at: session.updated_at.toISOString(),
        activities,
        transitions,
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

        return {
          token,
          user: { id: user.id, name: user.name, email: user.email }
        };
      } catch (error) {
        throw new Error(`Login failed: ${error.message}`);
      }
    },

    createSession: async (_, { input }, { user }) => {
      if (!user) throw new Error("Authentication required.");

      try {
        console.log("🔍 Creating Session:", input);

        const {
          sessionType,
          date,
          isMultiSport,
          weatherTemp,
          weatherHumidity,
          weatherWindSpeed
        } = input;

        if (!sessionType) throw new Error("Session type is required.");

        const session = await Session.create({
          user_id: user.id,
          session_type: sessionType,
          date: new Date(date),
          is_multi_sport: isMultiSport,
          total_duration: 0,
          total_distance: 0,
          weather_temp: weatherTemp ?? null,
          weather_humidity: weatherHumidity ?? null,
          weather_wind_speed: weatherWindSpeed ?? null,
        });

        console.log("✅ Session Created:", session.toJSON());

        return {
          id: session.id,
          userId: session.user_id,
          sessionType: session.session_type,
          date: session.date.toISOString(),
          isMultiSport: session.is_multi_sport,
          totalDuration: session.total_duration,
          totalDistance: session.total_distance,
          weatherTemp: session.weather_temp,
          weatherHumidity: session.weather_humidity,
          weatherWindSpeed: session.weather_wind_speed,
          created_at: session.created_at.toISOString(),
          updated_at: session.updated_at.toISOString(),
        };
      } catch (error) {
        console.error("❌ Create Session Error:", error);
        throw new Error("Failed to create session: " + error.message);
      }
    },

    updateSession: async (_, { id, input }, { user }) => {
      if (!user) throw new Error("Authentication required.");

      try {
        const session = await Session.findByPk(id, {
          include: [
            { model: SessionActivity, as: "activities" },
            { model: Transition, as: "transitions" },
          ]
        });

        if (!session) throw new Error("Session not found.");
        if (session.user_id !== user.id) throw new Error("Unauthorized.");

        const activities = session.activities || [];
        const transitions = session.is_multi_sport ? session.transitions || [] : [];

        const totalDuration = activities.reduce((sum, act) => sum + (act.duration || 0), 0) +
          (session.is_multi_sport ? transitions.reduce((sum, trans) => sum + (trans.transition_time || 0), 0) : 0);

        const totalDistance = activities.reduce((sum, act) => sum + (act.distance || 0), 0);

        await session.update({
          session_type: input.sessionType ?? session.session_type,
          date: input.date ? new Date(input.date) : session.date,
          is_multi_sport: input.isMultiSport ?? session.is_multi_sport,
          total_duration: totalDuration,
          total_distance: totalDistance,
          weather_temp: input.weatherTemp ?? session.weather_temp,
          weather_humidity: input.weatherHumidity ?? session.weather_humidity,
          weather_wind_speed: input.weatherWindSpeed ?? session.weather_wind_speed,
        });

        console.log("✅ Session Updated:", session.toJSON());

        return {
          id: session.id,
          userId: session.user_id,
          sessionType: session.session_type,
          date: session.date.toISOString(),
          isMultiSport: session.is_multi_sport,
          totalDuration: session.total_duration,
          totalDistance: session.total_distance,
          weatherTemp: session.weather_temp,
          weatherHumidity: session.weather_humidity,
          weatherWindSpeed: session.weather_wind_speed,
          created_at: session.created_at.toISOString(),
          updated_at: session.updated_at.toISOString(),
          activities,
          transitions,
        };
      } catch (error) {
        console.error("❌ Update Session Error:", error);
        throw new Error("Failed to update session: " + error.message);
      }
    },

    deleteSession: async (_, { id }, { user }) => {
      if (!user) throw new Error("Authentication required.");

      try {
        const session = await Session.findByPk(id, {
          include: [
            { model: SessionActivity, as: "activities" },
            { model: Transition, as: "transitions" },
          ]
        });

        if (!session || session.user_id !== user.id) throw new Error("Unauthorized or session not found.");

        await session.destroy();
        return { message: "Session deleted successfully" };
      } catch (error) {
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

    createSessionActivity: async (_, { input }, { user }) => {
      if (!user) throw new Error("Authentication required.");

      try {
        const { sessionId, sportType, duration, distance } = input;

        if (!sessionId || !sportType || duration === undefined || distance === undefined) {
          throw new Error("Session ID, sportType, duration, and distance are required.");
        }

        if (sportType.toLowerCase() === "transition") {
          throw new Error('Invalid sport type: "Transition" should be added as a transition, not an activity.');
        }

        const session = await Session.findByPk(sessionId, {
          include: [
            { model: SessionActivity, as: "activities" },
            { model: Transition, as: "transitions" },
          ],
        });

        if (!session || session.user_id !== user.id) throw new Error("Unauthorized.");

        const activity = await SessionActivity.create({
          session_id: sessionId,
          user_id: user.id,
          sport_type: sportType.trim(),
          duration,
          distance,
        });

        console.log("✅ Activity Created:", activity.toJSON());

        const updatedTotalDuration = 
        (await SessionActivity.sum("duration", { where: { session_id: sessionId } })) || 0;
  
        const updatedTotalDistance = 
        (await SessionActivity.sum("distance", { where: { session_id: sessionId } })) || 0;
  
        const updatedTotalTransitionTime = session.is_multi_sport
        ? (await Transition.sum("transition_time", { where: { session_id: sessionId } })) || 0
        : 0;
  
        await session.update({
          total_duration: updatedTotalDuration + updatedTotalTransitionTime,
          total_distance: updatedTotalDistance,
        });

        console.log("✅ Session Updated After Activity Addition:", session.toJSON());

        if (session.is_multi_sport) {
          const allSports = [...new Set(session.activities.map((a) => a.sport_type))];
          for (const sport of allSports) {
            await createOrUpdatePersonalRecords(user.id, sport, sessionId);
          }
        } else {
          await createOrUpdatePersonalRecords(user.id, sportType, sessionId);
        }

        return {
          id: activity.id,
          sessionId: activity.session_id,
          userId: activity.user_id,
          sportType: activity.sport_type,
          duration: activity.duration,
          distance: activity.distance,
          created_at: activity.created_at.toISOString(),
          updated_at: activity.updated_at.toISOString(),
        };
      } catch (error) {
        console.error("❌ Create Session Activity Error:", error);
        throw new Error("Failed to create session activity: " + error.message);
      }
    },

    updateSessionActivity: async (_, { id, input }, { user }) => {
      if (!user) throw new Error("Authentication required.");

      try {
        const activity = await SessionActivity.findByPk(id);
        if (!activity) throw new Error("Session Activity not found");

        const session = await Session.findByPk(activity.session_id, {
          include: [SessionActivity],
        });

        if (!session || session.user_id !== user.id) throw new Error("Unauthorized.");

        const updatedValues = {
          sport_type: input.sportType?.trim() ?? activity.sport_type,
          duration: input.duration ?? activity.duration,
          distance: input.distance ?? activity.distance,
          heart_rate_min: input.heartRateMin ?? activity.heart_rate_min,
          heart_rate_max: input.heartRateMax ?? activity.heart_rate_max,
          heart_rate_avg: input.heartRateAvg ?? activity.heart_rate_avg,
          cadence: input.cadence ?? activity.cadence,
          power: input.power ?? activity.power,
        };

        await activity.update(updatedValues);
        console.log("✅ Activity Updated:", activity.toJSON());

        const updatedTotalDuration = await SessionActivity.sum("duration", { where: { session_id: activity.session_id } });
        const updatedTotalDistance = await SessionActivity.sum("distance", { where: { session_id: activity.session_id } });

        await session.update({
          total_duration: updatedTotalDuration || 0,
          total_distance: updatedTotalDistance || 0,
        });

        console.log("✅ Session Updated After Activity Update:", session.toJSON());

        return {
          id: activity.id,
          sessionId: activity.session_id,
          userId: activity.user_id,
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
        console.error("❌ Update Session Activity Error:", error);
        throw new Error("Failed to update session activity: " + error.message);
      }
    },

    deleteSessionActivity: async (_, { id }, { user }) => {
      if (!user) throw new Error("Authentication required.");

      try {
        const activity = await SessionActivity.findByPk(id);
        if (!activity) throw new Error("Session Activity not found.");

        const session = await Session.findByPk(activity.session_id, {
          include: [SessionActivity],
        });

        if (!session || session.user_id !== user.id) throw new Error("Unauthorized.");

        await activity.destroy();

        const updatedTotalDuration = await SessionActivity.sum("duration", { where: { session_id: activity.session_id } });
        const updatedTotalDistance = await SessionActivity.sum("distance", { where: { session_id: activity.session_id } });

        await session.update({
          total_duration: updatedTotalDuration || 0,
          total_distance: updatedTotalDistance || 0,
        });

        console.log("✅ Session Updated After Activity Deletion:", session.toJSON());

        return { message: "Session Activity deleted successfully." };
      } catch (error) {
        console.error("❌ Delete Session Activity Error:", error);
        throw new Error("Failed to delete session activity: " + error.message);
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
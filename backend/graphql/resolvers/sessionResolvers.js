const { Session, SessionActivity, Transition } = require("../../models");

const sessionResolvers = {
  Query: {
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
            const raw = typeof activity.distance === 'number' ? activity.distance : parseFloat(activity.distance);
            const distance = isNaN(raw) ? 0 : raw;
            
            const correctedDistance = activity.sportType === "Swim" ? distance / 1000 : distance;
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
  
        const totalDistance = activities.reduce((sum, activity) => {
          const raw = typeof activity.distance === 'number' ? activity.distance : parseFloat(activity.distance);
          const distance = isNaN(raw) ? 0 : raw;
          return sum + distance;
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
      },
  },
  Mutation: {
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
  
          const totalDistance = activities.reduce((sum, activity) => {
            const raw = typeof activity.distance === 'number' ? activity.distance : parseFloat(activity.distance);
            const distance = isNaN(raw) ? 0 : raw;
            
            const correctedDistance = activity.sportType === "Swim" ? distance / 1000 : distance;
            return sum + correctedDistance;
          }, 0);
            
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
      }
  }
}
module.exports = sessionResolvers;
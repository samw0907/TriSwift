const { Session, SessionActivity, Transition } = require("../../models");
const { createOrUpdatePersonalRecords } = require("../../util/personalRecordUtils");

const activityResolvers = {
    Query: {
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
          }
        },
    Mutation: {
        createSessionActivity: async (_, { input }, { user }) => {
            if (!user) throw new Error("Authentication required.");
          
            try {
              const { sessionId, sportType, duration, distance, heartRateMin, heartRateMax, heartRateAvg, cadence, power } = input;
          
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
                heart_rate_min: heartRateMin ?? null,
                heart_rate_max: heartRateMax ?? null,
                heart_rate_avg: heartRateAvg ?? null,
                cadence: cadence ?? null,
                power: power ?? null,
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
      
              console.log("🔄 Updating personal records...");
              await createOrUpdatePersonalRecords(user.id, sportType, sessionId);
          
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
              console.error("❌ Create Session Activity Error:", error);
              throw new Error("Failed to create session activity: " + error.message);
            }
          },    
      
          updateSessionActivity: async (_, { id, input }, { user }) => {
            if (!user) throw new Error("Authentication required.");
      
            try {
              const activity = await SessionActivity.findByPk(id, {
                include: [{ model: Session, as: "session" }],
              });
          
              if (!activity) throw new Error("Session Activity not found.");
              if (!activity.session) throw new Error("Session not found.");
              if (activity.session.user_id !== user.id) throw new Error("Unauthorized.");
      
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
          
              const session = await Session.findByPk(activity.session_id, {
                include: [{ model: SessionActivity, as: "activities" }],
              });
          
              if (!session) throw new Error("Session not found.");
          
              const updatedTotalDuration = session.activities.reduce(
                (total, act) => total + act.duration,
                0
              );
              
              const updatedTotalDistance = session.activities.reduce((total, act) => {
                const raw = typeof act.distance === 'number' ? act.distance : parseFloat(act.distance);
                const distance = isNaN(raw) ? 0 : raw;
                return total + distance;
              }, 0);
          
              await session.update({
                total_duration: updatedTotalDuration,
                total_distance: updatedTotalDistance,
              });

              await createOrUpdatePersonalRecords(user.id, activity.sport_type, activity.session_id);
      
              console.log("✅ Session Updated After Activity Update:", activity.session.toJSON());
      
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
                include: [{ model: SessionActivity, as: "activities" }],
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
    }
}
module.exports = activityResolvers;
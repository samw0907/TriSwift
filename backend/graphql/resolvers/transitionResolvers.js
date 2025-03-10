const { Transition, Session } = require("../../models");

const transitionResolvers = {
    Query: {
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
    },
    Mutation: {
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
  }
}

module.exports = transitionResolvers;
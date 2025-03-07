export const getNextActivity = (currentActivity: any, session: any, transitions: any[]) => {
    let nextTransitionIndex = transitions.findIndex(
      (t) => t.previousSport === currentActivity.sportType
    );
  
    if (nextTransitionIndex !== -1) {
      const transition = transitions.splice(nextTransitionIndex, 1)[0];
  
      return {
        transition,
        nextActivity: session.activities.find(
          (act: any) => act.sportType === transition.nextSport
        ) || undefined
      };
    }
  
    return { transition: null, nextActivity: undefined };
  };
  
  export {};
  
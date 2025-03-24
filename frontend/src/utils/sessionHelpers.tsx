export const getNextActivity = (currentActivity: any, session: any, transitions: any[]) => {
  const transition = transitions.find((t) => t.previousSport === currentActivity.sportType);

  let nextActivity = undefined;

  if (transition) {
    const currentIndex = session.activities.findIndex((a: any) => a.id === currentActivity.id);
    nextActivity = session.activities.slice(currentIndex + 1).find(
      (a: any) => a.sportType === transition.nextSport
    );
  }

  if (!nextActivity) {
    const currentIndex = session.activities.findIndex((a: any) => a.id === currentActivity.id);
    nextActivity = session.activities[currentIndex + 1] || undefined;
  }

  return {
    transition: transition || null,
    nextActivity: nextActivity || null
  };
};
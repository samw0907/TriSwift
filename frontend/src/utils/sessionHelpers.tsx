export const getNextActivity = (currentActivity: any, session: any, transitions: any[]) => {
  const transition = transitions.find((t) => t.previousSport === currentActivity.sportType);

  let nextActivity = transition
    ? session.activities.find((act: any) => act.sportType === transition.nextSport)
    : undefined;

  if (!nextActivity) {
    const currentIndex = session.activities.findIndex((act: any) => act.id === currentActivity.id);
    nextActivity = session.activities[currentIndex + 1] || undefined;
  }

  return { transition: transition || null, nextActivity: nextActivity || null };
};


export {};
  
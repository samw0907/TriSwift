const { PersonalRecord, SessionActivity } = require("../models");

async function createOrUpdatePersonalRecords(userId, sportType, sessionId) {
  const activities = await SessionActivity.findAll({
    where: { user_id: userId, sport_type: sportType },
    order: [["distance", "ASC"], ["duration", "ASC"]],
  });

  if (!activities.length) return;

  const distancesForSport = {
    Run: [5, 10, 21.1, 42.2],
    Bike: [10, 20, 50, 100],
    Swim: [0.1, 0.2, 0.4, 0.8, 1],
  }[sportType];

  for (const dist of distancesForSport) {
    const bestAttempts = activities.filter((a) => Math.abs(a.distance - dist) < 0.01)
      .sort((a, b) => a.duration - b.duration);

    if (!bestAttempts.length) continue;

    let existingRecords = await PersonalRecord.findAll({
      where: { user_id: userId, activity_type: sportType, distance: dist },
    });

    if (!existingRecords.length || bestAttempts[0].duration < existingRecords[0].best_time) {
      await PersonalRecord.create({
        user_id: userId,
        session_id: sessionId,
        session_activity_id: bestAttempts[0].id,
        activity_type: sportType,
        distance: dist,
        best_time: bestAttempts[0].duration,
      });
    }
  }
}

module.exports = { createOrUpdatePersonalRecords };

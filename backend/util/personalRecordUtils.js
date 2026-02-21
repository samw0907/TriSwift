const { PersonalRecord, SessionActivity } = require("../models");

async function createOrUpdatePersonalRecords(userId, sportType, sessionId) {
    console.log("Checking for personal records update...");
  
    const activities = await SessionActivity.findAll({
      where: { user_id: userId, sport_type: sportType },
      order: [["distance", "ASC"], ["duration", "ASC"]],
    });
  
    if (!activities.length) {
      console.log("No activities found for personal records.");
      return;
    }
  
    const validDistances = {
      Run: [0.1, 0.2, 0.4, 1, 5, 10, 21.1, 42.2],
      Bike: [10, 20, 40, 50, 80, 100, 150, 200],
      Swim: [0.1, 0.2, 0.4, 0.8, 1, 1.5, 2],
    };
  
    const distancesForSport = validDistances[sportType];
  
    if (!distancesForSport) {
      console.log(`No valid distances found for sport type: ${sportType}`);
      return;
    }
  
    console.log(`Found ${activities.length} activities for sport: ${sportType}`);
  
    for (const dist of distancesForSport) {
      const bestAttempts = activities
        .filter((a) => Math.abs(a.distance - dist) < 0.01)
  
      if (!bestAttempts.length) continue;
  
      console.log(`Checking records for ${dist} ${sportType === "Swim" ? "m" : "km"} (${bestAttempts.length} valid entries found)`);
  
      let existingRecords = await PersonalRecord.findAll({
        where: {
          user_id: userId,
          activity_type: sportType,
          distance: dist,
        },
        order: [["best_time", "ASC"]],
      });
  
      let newPRs = [];
  
      for (const attempt of bestAttempts) {
        if (!newPRs.some(r => r.best_time === attempt.duration)) {
          newPRs.push({
            user_id: userId,
            session_id: sessionId,
            session_activity_id: attempt.id,
            activity_type: sportType,
            distance: dist,
            best_time: attempt.duration,
            record_date: new Date(),
          });
        }
      }
  
      newPRs = newPRs.slice(0, 3);
  
      console.log(`Updated PR list for ${dist} ${sportType}:`, newPRs.map(r => r.best_time));
  
      for (let i = 0; i < newPRs.length; i++) {
        if (i < existingRecords.length) {
          await existingRecords[i].update({
            best_time: newPRs[i].best_time,
            record_date: new Date(),
            session_id: newPRs[i].session_id,
            session_activity_id: newPRs[i].session_activity_id,
          });
        } else {
          await PersonalRecord.create(newPRs[i]);
        }
      }
  
      if (existingRecords.length > 3) {
        const recordsToDelete = existingRecords.slice(3);
        await PersonalRecord.destroy({ where: { id: recordsToDelete.map(r => r.id) } });
        console.log(`Deleted excess PRs for ${dist} km ${sportType}`);
      }
  
      console.log(` Personal records updated successfully for ${dist} km ${sportType}`);
    }
  }

module.exports = { createOrUpdatePersonalRecords };

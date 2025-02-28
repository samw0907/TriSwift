const express = require("express");
const { Op } = require("sequelize");
const { Session, SessionActivity, PersonalRecord } = require("../models");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/:sessionId", authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { 
      start_date, 
      end_date, 
      sport_type, 
      min_duration, 
      max_duration, 
      min_distance, 
      max_distance, 
      min_hr, 
      max_hr, 
      min_cadence, 
      max_cadence, 
      min_power, 
      max_power, 
      sort_duration, 
      sort_distance, 
      sort_sport_type, 
      sort_date 
    } = req.query;

    const session = await Session.findOne({ where: { id: sessionId, user_id: req.user.id } });
    if (!session) {
      return res.status(404).json({ error: "Session not found or unauthorized" });
    }

    let activityFilters = { session_id: session.id };
    let sortingOptions = [];

    if (start_date || end_date) {
      activityFilters.created_at = {};
      if (start_date) activityFilters.created_at[Op.gte] = new Date(start_date);
      if (end_date) activityFilters.created_at[Op.lte] = new Date(end_date);
    }

    if (sport_type) {
      activityFilters.sport_type = { [Op.iLike]: sport_type };
    }

    if (min_duration || max_duration) {
      activityFilters.duration = {};
      if (min_duration) activityFilters.duration[Op.gte] = parseInt(min_duration, 10);
      if (max_duration) activityFilters.duration[Op.lte] = parseInt(max_duration, 10);
    }

    if (min_distance || max_distance) {
      activityFilters.distance = {};
      if (min_distance) activityFilters.distance[Op.gte] = parseFloat(min_distance);
      if (max_distance) activityFilters.distance[Op.lte] = parseFloat(max_distance);
    }

    if (min_hr || max_hr) {
      activityFilters.heart_rate_avg = {};
      if (min_hr) activityFilters.heart_rate_avg[Op.gte] = parseInt(min_hr, 10);
      if (max_hr) activityFilters.heart_rate_avg[Op.lte] = parseInt(max_hr, 10);
    }

    if (min_cadence || max_cadence) {
      activityFilters.cadence = {};
      if (min_cadence) activityFilters.cadence[Op.gte] = parseInt(min_cadence, 10);
      if (max_cadence) activityFilters.cadence[Op.lte] = parseInt(max_cadence, 10);
    }

    if (min_power || max_power) {
      activityFilters.power = {};
      if (min_power) activityFilters.power[Op.gte] = parseInt(min_power, 10);
      if (max_power) activityFilters.power[Op.lte] = parseInt(max_power, 10);
    }

    if (sort_duration) {
      sortingOptions.push(["duration", sort_duration.toLowerCase() === "asc" ? "ASC" : "DESC"]);
    }
    if (sort_distance) {
      sortingOptions.push(["distance", sort_distance.toLowerCase() === "asc" ? "ASC" : "DESC"]);
    }
    if (sort_sport_type) {
      sortingOptions.push(["sport_type", sort_sport_type.toLowerCase() === "asc" ? "ASC" : "DESC"]);
    }
    if (sort_date) {
      sortingOptions.push(["created_at", sort_date.toLowerCase() === "asc" ? "ASC" : "DESC"]);
    }

    const activities = await SessionActivity.findAll({
      where: activityFilters,
      order: sortingOptions.length ? sortingOptions : [["created_at", "DESC"]],
    });

    res.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

router.post("/:sessionId", authMiddleware, async (req, res) => {
  try {
    const session = await Session.findOne({ where: { id: req.params.sessionId, user_id: req.user.id } });

    if (!session) {
      return res.status(404).json({ error: "Session not found or unauthorized" });
    }

    const { sport_type, duration, distance, heart_rate_min, heart_rate_max, heart_rate_avg, cadence, power } = req.body;

    if (!sport_type || duration === undefined || distance === undefined) {
      return res.status(400).json({ error: "Missing required fields (sport_type, duration, distance)" });
    }

    const activity = await SessionActivity.create({
      session_id: session.id,
      sport_type,
      duration,
      distance,
      heart_rate_min,
      heart_rate_max,
      heart_rate_avg,
      cadence,
      power,
    });

    await updatePersonalRecord(req.user.id, activity.id, sport_type, distance, duration, session.date);

    res.status(201).json(activity);
  } catch (error) {
    console.error("Error creating session activity:", error);
    res.status(400).json({ error: "Failed to create activity" });
  }
});

const PREDEFINED_DISTANCES = {
  Swim: [100, 200, 400, 800, 1000, 1500, 2000],
  Running: [100, 200, 400, 1000, 5000, 10000, 21100, 42200],
  Cycling: [10000, 20000, 40000, 50000, 80000, 100000, 150000, 200000]
};

async function updatePersonalRecord(userId, sessionActivityId, sportType, distance, bestTime, recordDate) {
  try {
    const normalizedSportType = sportType.charAt(0).toUpperCase() + sportType.slice(1).toLowerCase();
    
    if (!PREDEFINED_DISTANCES[normalizedSportType]?.includes(distance)) {
      console.log(`Skipping personal record update. ${distance} is not a predefined distance for ${normalizedSportType}`);
      return;
    }

    const existingRecords = await PersonalRecord.findAll({
      where: { user_id: userId, activity_type: normalizedSportType, distance: distance },
      order: [["best_time", "ASC"]],
    });

    if (existingRecords.length < 3 || parseInt(bestTime) < parseInt(existingRecords[existingRecords.length - 1].best_time)) {
      if (existingRecords.length >= 3) {
        await existingRecords[existingRecords.length - 1].destroy();
      }

      await PersonalRecord.create({
        user_id: userId,
        session_activity_id: sessionActivityId,
        activity_type: normalizedSportType,
        distance: distance,
        best_time: parseInt(bestTime),
        record_date: recordDate || new Date(),
      });
    }
  } catch (error) {
    console.error("Error updating personal record:", error);
  }
}

module.exports = router;

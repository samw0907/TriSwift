const express = require("express");
const { User, Session, SessionActivity, Transition, PersonalRecord } = require("../models");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/sessions", authMiddleware, async (req, res) => {
  try {
    const sessions = await Session.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: SessionActivity },
        { model: Transition }
      ],
    });

    res.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

router.post("/sessions", authMiddleware, async (req, res) => {
  try {
    const { session_type, date, weather_temp, weather_humidity, weather_wind_speed } = req.body;

    if (!session_type || !date) {
      return res.status(400).json({ error: "Session type and date are required." });
    }

    const session = await Session.create({
      user_id: req.user.id,
      session_type,
      date: new Date(date),
      total_duration: null,
      total_distance: null,
      weather_temp: weather_temp ?? null,
      weather_humidity: weather_humidity ?? null,
      weather_wind_speed: weather_wind_speed ?? null,
    });

    res.status(201).json(session);
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(400).json({ error: "Failed to create session" });
  }
});

router.get("/activities", authMiddleware, async (req, res) => {
  try {
    const activities = await SessionActivity.findAll({
      include: { model: Session, where: { user_id: req.user.id } }
    });

    res.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

router.post("/activities", authMiddleware, async (req, res) => {
  try {
    const { session_id, sport_type, duration, distance, heart_rate_min, heart_rate_max, heart_rate_avg, cadence, power } = req.body;

    if (!session_id || !sport_type || duration === undefined || distance === undefined) {
      return res.status(400).json({ error: "Session ID, sport type, duration, and distance are required." });
    }

    const session = await Session.findByPk(session_id, {
      include: [{ model: SessionActivity }]
    });

    if (!session || session.user_id !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized: You can only add activities to your own sessions." });
    }

    const activity = await SessionActivity.create({
      session_id,
      user_id: req.user.id,
      sport_type,
      duration,
      distance,
      heart_rate_min,
      heart_rate_max,
      heart_rate_avg,
      cadence,
      power,
    });

    const updatedTotalDuration = session.session_activities
      ? session.session_activities.reduce((sum, act) => sum + (act.duration || 0), duration)
      : duration;

    const updatedTotalDistance = session.session_activities
      ? session.session_activities.reduce((sum, act) => sum + (act.distance || 0), distance)
      : distance;

    await session.update({
      total_duration: updatedTotalDuration,
      total_distance: updatedTotalDistance,
    });

    res.status(201).json(activity);
  } catch (error) {
    console.error("Error creating session activity:", error);
    res.status(400).json({ error: "Failed to create session activity" });
  }
});


router.get("/personal-records", authMiddleware, async (req, res) => {
  try {
    const records = await PersonalRecord.findAll({
      where: { user_id: req.user.id },
      order: [["distance", "ASC"], ["best_time", "ASC"]],
      limit: 3
    });

    res.json(records);
  } catch (error) {
    console.error("Error fetching personal records:", error);
    res.status(500).json({ error: "Failed to fetch personal records" });
  }
});

module.exports = router;

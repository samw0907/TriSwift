const express = require("express");
const { Session, SessionActivity } = require("../models");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const sessions = await Session.findAll({
      where: { user_id: req.user.id },
      include: { model: SessionActivity },
    });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { session_type, date, total_duration, total_distance, weather_temp, weather_humidity, weather_wind_speed } = req.body;

    const session = await Session.create({
      user_id: req.user.id,
      session_type,
      date,
      total_duration,
      total_distance,
      weather_temp,
      weather_humidity,
      weather_wind_speed,
    });

    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ error: "Failed to create session" });
  }
});

router.put("/:sessionId", authMiddleware, async (req, res) => {
  try {
    const session = await Session.findOne({ where: { id: req.params.sessionId, user_id: req.user.id } });

    if (!session) {
      return res.status(404).json({ error: "Session not found or unauthorized" });
    }

    await session.update(req.body);
    res.json(session);
  } catch (error) {
    res.status(400).json({ error: "Failed to update session" });
  }
});

router.delete("/:sessionId", authMiddleware, async (req, res) => {
  try {
    const session = await Session.findOne({ where: { id: req.params.sessionId, user_id: req.user.id } });

    if (!session) {
      return res.status(404).json({ error: "Session not found or unauthorized" });
    }

    await session.destroy();
    res.json({ message: "Session deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete session" });
  }
});

module.exports = router;

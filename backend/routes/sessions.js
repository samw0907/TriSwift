const express = require("express");
const { Session, SessionActivity } = require("../models");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const sessions = await Session.findAll({
      include: SessionActivity,
      where: { user_id: req.user.id },
    });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const session = await Session.create({ ...req.body, user_id: req.user.id });
    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ error: "Failed to create session" });
  }
});

router.post("/:sessionId/activities", authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { sport_type, duration, distance, heart_rate_min, heart_rate_max, heart_rate_avg, cadence, power } = req.body;

    const session = await Session.findOne({
      where: { id: sessionId, user_id: req.user.id },
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found or unauthorized" });
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

    res.status(201).json(activity);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to add activity to session" });
  }
});

module.exports = router;

const express = require("express");
const { Session, SessionActivity } = require("../models");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/:sessionId", authMiddleware, async (req, res) => {
  try {
    const session = await Session.findOne({ where: { id: req.params.sessionId, user_id: req.user.id } });

    if (!session) {
      return res.status(404).json({ error: "Session not found or unauthorized" });
    }

    const activities = await SessionActivity.findAll({ where: { session_id: session.id } });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

router.post("/:sessionId", authMiddleware, async (req, res) => {
  try {
    const session = await Session.findOne({ where: { id: req.params.sessionId, user_id: req.user.id } });

    if (!session) {
      return res.status(404).json({ error: "Session not found or unauthorized" });
    }

    const activity = await SessionActivity.create({ session_id: session.id, ...req.body });
    res.status(201).json(activity);
  } catch (error) {
    res.status(400).json({ error: "Failed to create activity" });
  }
});

router.put("/:activityId", authMiddleware, async (req, res) => {
  try {
    const activity = await SessionActivity.findByPk(req.params.activityId, {
      include: { model: Session, where: { user_id: req.user.id } },
    });

    if (!activity) {
      return res.status(404).json({ error: "Activity not found or unauthorized" });
    }

    await activity.update(req.body);
    res.json(activity);
  } catch (error) {
    res.status(400).json({ error: "Failed to update activity" });
  }
});

router.delete("/:activityId", authMiddleware, async (req, res) => {
  try {
    const activity = await SessionActivity.findByPk(req.params.activityId, {
      include: { model: Session, where: { user_id: req.user.id } },
    });

    if (!activity) {
      return res.status(404).json({ error: "Activity not found or unauthorized" });
    }

    await activity.destroy();
    res.json({ message: "Activity deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete activity" });
  }
});

module.exports = router;

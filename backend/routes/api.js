const express = require("express");
const { User, Session, SessionActivity, Transition, PersonalRecord, Progress } = require("../models");

const router = express.Router();

// ✅ Get all sessions
router.get("/sessions", async (req, res) => {
  try {
    const sessions = await Session.findAll({ include: SessionActivity });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

// ✅ Add a new session
router.post("/sessions", async (req, res) => {
  try {
    const session = await Session.create(req.body);
    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ error: "Failed to create session" });
  }
});

// ✅ Get all activities
router.get("/activities", async (req, res) => {
  try {
    const activities = await SessionActivity.findAll();
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

// ✅ Add a new activity
router.post("/activities", async (req, res) => {
  try {
    const activity = await SessionActivity.create(req.body);
    res.status(201).json(activity);
  } catch (error) {
    res.status(400).json({ error: "Failed to create activity" });
  }
});

// ✅ Fetch personal records
router.get("/personal-records/:userId", async (req, res) => {
  try {
    const records = await PersonalRecord.findAll({ where: { user_id: req.params.userId } });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch personal records" });
  }
});

// ✅ Fetch user progress
router.get("/progress/:userId", async (req, res) => {
  try {
    const progress = await Progress.findAll({ where: { user_id: req.params.userId } });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

module.exports = router;

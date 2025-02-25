const express = require("express");
const { User, Session, SessionActivity, Transition, PersonalRecord} = require("../models");

const router = express.Router();

router.get("/sessions", async (req, res) => {
  try {
    const sessions = await Session.findAll({ include: SessionActivity });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

router.post("/sessions", async (req, res) => {
  try {
    const session = await Session.create(req.body);
    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ error: "Failed to create session" });
  }
});

router.get("/activities", async (req, res) => {
  try {
    const activities = await SessionActivity.findAll();
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

router.post("/activities", async (req, res) => {
  try {
    const activity = await SessionActivity.create(req.body);
    res.status(201).json(activity);
  } catch (error) {
    res.status(400).json({ error: "Failed to create activity" });
  }
});

router.get("/personal-records/:userId", async (req, res) => {
  try {
    const records = await PersonalRecord.findAll({ where: { user_id: req.params.userId } });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch personal records" });
  }
});

router.get("/progress/:userId", async (req, res) => {
  try {
    const progress = await Progress.findAll({ where: { user_id: req.params.userId } });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

module.exports = router;


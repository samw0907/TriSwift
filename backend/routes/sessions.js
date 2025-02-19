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

module.exports = router;

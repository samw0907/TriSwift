const express = require("express");
const { Transition, Session } = require("../models");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/:sessionId", authMiddleware, async (req, res) => {
  try {
    const session = await Session.findOne({
      where: { id: req.params.sessionId, user_id: req.user.id },
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found or unauthorized" });
    }

    const transitions = await Transition.findAll({ where: { session_id: session.id } });
    res.json(transitions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transitions" });
  }
});

router.post("/:sessionId", authMiddleware, async (req, res) => {
  try {
    const session = await Session.findOne({
      where: { id: req.params.sessionId, user_id: req.user.id },
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found or unauthorized" });
    }

    const { previous_sport, next_sport, transition_time, comments } = req.body;

    const transition = await Transition.create({
      session_id: session.id,
      previous_sport,
      next_sport,
      transition_time,
      comments,
    });

    res.status(201).json(transition);
  } catch (error) {
    res.status(400).json({ error: "Failed to create transition" });
  }
});

router.put("/:transitionId", authMiddleware, async (req, res) => {
  try {
    const transition = await Transition.findByPk(req.params.transitionId, {
      include: { model: Session, where: { user_id: req.user.id } },
    });

    if (!transition) {
      return res.status(404).json({ error: "Transition not found or unauthorized" });
    }

    await transition.update(req.body);
    res.json(transition);
  } catch (error) {
    res.status(400).json({ error: "Failed to update transition" });
  }
});

router.delete("/:transitionId", authMiddleware, async (req, res) => {
  try {
    const transition = await Transition.findByPk(req.params.transitionId, {
      include: { model: Session, where: { user_id: req.user.id } },
    });

    if (!transition) {
      return res.status(404).json({ error: "Transition not found or unauthorized" });
    }

    await transition.destroy();
    res.json({ message: "Transition deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete transition" });
  }
});

module.exports = router;

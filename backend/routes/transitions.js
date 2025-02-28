const express = require("express");
const { Op } = require("sequelize");
const { Transition, Session } = require("../models");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/:sessionId", authMiddleware, async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { 
        start_date, 
        end_date, 
        min_transition_time, 
        max_transition_time, 
        previous_sport, 
        next_sport, 
        sort_transition_time, 
        sort_date, 
        sort_previous_sport, 
        sort_next_sport 
      } = req.query;
  
      const session = await Session.findOne({ where: { id: sessionId, user_id: req.user.id } });
      if (!session) {
        return res.status(404).json({ error: "Session not found or unauthorized" });
      }
  
      let transitionFilters = { session_id: session.id };
      let sortingOptions = [];
  
      if (start_date || end_date) {
        transitionFilters.created_at = {};
        if (start_date) transitionFilters.created_at[Op.gte] = new Date(start_date);
        if (end_date) transitionFilters.created_at[Op.lte] = new Date(end_date);
      }
  
      if (min_transition_time || max_transition_time) {
        transitionFilters.transition_time = {};
        if (min_transition_time) transitionFilters.transition_time[Op.gte] = parseInt(min_transition_time, 10);
        if (max_transition_time) transitionFilters.transition_time[Op.lte] = parseInt(max_transition_time, 10);
      }
  
      if (previous_sport) {
        transitionFilters.previous_sport = { [Op.iLike]: previous_sport };
      }

      if (next_sport) {
        transitionFilters.next_sport = { [Op.iLike]: next_sport };
      }
  
      if (sort_transition_time) {
        sortingOptions.push(["transition_time", sort_transition_time.toLowerCase() === "asc" ? "ASC" : "DESC"]);
      }
      if (sort_date) {
        sortingOptions.push(["created_at", sort_date.toLowerCase() === "asc" ? "ASC" : "DESC"]);
      }
      if (sort_previous_sport) {
        sortingOptions.push(["previous_sport", sort_previous_sport.toLowerCase() === "asc" ? "ASC" : "DESC"]);
      }
      if (sort_next_sport) {
        sortingOptions.push(["next_sport", sort_next_sport.toLowerCase() === "asc" ? "ASC" : "DESC"]);
      }
  
      const transitions = await Transition.findAll({ 
        where: transitionFilters, 
        order: sortingOptions.length ? sortingOptions : [["created_at", "DESC"]]
      });
  
      res.json(transitions);
    } catch (error) {
      console.error("Error fetching transitions:", error);
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

    if (!previous_sport || !next_sport || transition_time === undefined) {
      return res.status(400).json({ error: "Missing required fields (previous_sport, next_sport, transition_time)" });
    }

    const transition = await Transition.create({
      session_id: session.id,
      previous_sport,
      next_sport,
      transition_time,
      comments,
    });

    res.status(201).json(transition);
  } catch (error) {
    console.error("Error creating transition:", error);
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

    const { previous_sport, next_sport, transition_time, comments } = req.body;

    const updatedValues = {
      previous_sport: previous_sport ?? transition.previous_sport,
      next_sport: next_sport ?? transition.next_sport,
      transition_time: transition_time ?? transition.transition_time,
      comments: comments ?? transition.comments,
    };

    await transition.update(updatedValues);
    
    res.json(transition);
  } catch (error) {
    console.error("Error updating transition:", error);
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
    console.error("Error deleting transition:", error);
    res.status(500).json({ error: "Failed to delete transition" });
  }
});

module.exports = router;

const express = require("express");
const { Op } = require("sequelize");
const { Session, SessionActivity, Transition } = require("../models");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { 
      start_date, 
      end_date, 
      session_type, 
      min_duration, 
      max_duration, 
      min_distance, 
      max_distance, 
      sort_duration, 
      sort_distance, 
      sort_session_type 
    } = req.query;

    let sessionFilters = { user_id: req.user.id };
    let sortingOptions = [];

    if (start_date || end_date) {
      sessionFilters.date = {};
      if (start_date) sessionFilters.date[Op.gte] = new Date(start_date);
      if (end_date) sessionFilters.date[Op.lte] = new Date(end_date);
    }

    if (session_type) {
      sessionFilters.session_type = { [Op.iLike]: session_type };
    }

    if (min_duration || max_duration) {
      sessionFilters.total_duration = {};
      if (min_duration) sessionFilters.total_duration[Op.gte] = parseInt(min_duration, 10);
      if (max_duration) sessionFilters.total_duration[Op.lte] = parseInt(max_duration, 10);
    }

    if (min_distance || max_distance) {
      sessionFilters.total_distance = {};
      if (min_distance) sessionFilters.total_distance[Op.gte] = parseFloat(min_distance);
      if (max_distance) sessionFilters.total_distance[Op.lte] = parseFloat(max_distance);
    }

    if (sort_duration) {
      sortingOptions.push(["total_duration", sort_duration.toLowerCase() === "asc" ? "ASC" : "DESC"]);
    }
    if (sort_distance) {
      sortingOptions.push(["total_distance", sort_distance.toLowerCase() === "asc" ? "ASC" : "DESC"]);
    }
    if (sort_session_type) {
      sortingOptions.push(["session_type", sort_session_type.toLowerCase() === "asc" ? "ASC" : "DESC"]);
    }

    const sessions = await Session.findAll({
      where: sessionFilters,
      include: [
        { model: SessionActivity },
        { model: Transition }
      ],
      order: sortingOptions.length ? sortingOptions : [["date", "DESC"]],
    });

    const formattedSessions = sessions.map(session => ({
      ...session.toJSON(),
      transitions: session.is_multi_sport ? session.transitions : [],
    }));

    res.json(formattedSessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

router.get("/:sessionId", authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findOne({
      where: { id: sessionId, user_id: req.user.id },
      include: [
        { model: SessionActivity },
        { model: Transition }
      ],
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found or unauthorized" });
    }

    res.json({
      ...session.toJSON(),
      transitions: session.is_multi_sport ? session.transitions : [],
    });
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { session_type, date, is_multi_sport, weather_temp, weather_humidity, weather_wind_speed } = req.body;

    if (!session_type || !date || is_multi_sport === undefined) {
      return res.status(400).json({ error: "session_type, date, and is_multi_sport are required." });
    }

    const session = await Session.create({
      user_id: req.user.id,
      session_type,
      date: new Date(date),
      is_multi_sport,
      total_duration: null,
      total_distance: null,
      weather_temp,
      weather_humidity,
      weather_wind_speed,
    });

    res.status(201).json(session);
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(400).json({ error: "Failed to create session" });
  }
});

router.put("/:sessionId", authMiddleware, async (req, res) => {
  try {
    const session = await Session.findOne({ 
      where: { id: req.params.sessionId, user_id: req.user.id },
      include: [SessionActivity, Transition]
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found or unauthorized" });
    }

    const { session_type, date, is_multi_sport, weather_temp, weather_humidity, weather_wind_speed } = req.body;

    const totalDuration = session.session_activities.reduce((sum, act) => sum + (act.duration || 0), 0)
      + (is_multi_sport ? session.transitions.reduce((sum, t) => sum + (t.transition_time || 0), 0) : 0);

    const totalDistance = session.session_activities.reduce((sum, act) => sum + (act.distance || 0), 0);

    await session.update({
      session_type,
      date: date ? new Date(date) : session.date,
      is_multi_sport: is_multi_sport ?? session.is_multi_sport,
      total_duration: totalDuration,
      total_distance: totalDistance,
      weather_temp,
      weather_humidity,
      weather_wind_speed,
    });

    res.json(session);
  } catch (error) {
    console.error("Error updating session:", error);
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
    console.error("Error deleting session:", error);
    res.status(500).json({ error: "Failed to delete session" });
  }
});

module.exports = router;

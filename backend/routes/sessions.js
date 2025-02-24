const express = require("express");
const { Op } = require("sequelize");
const { Session, SessionActivity, PersonalRecord } = require("../models");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Fetch all sessions for the logged-in user
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
      include: { model: SessionActivity },
      order: sortingOptions.length ? sortingOptions : [["date", "DESC"]],
    });

    res.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

// Fetch a single session by ID
router.get("/:sessionId", authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findOne({
      where: { id: sessionId, user_id: req.user.id },
      include: { model: SessionActivity },
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found or unauthorized" });
    }

    res.json(session);
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

// Create a new session
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
    console.error("Error creating session:", error);
    res.status(400).json({ error: "Failed to create session" });
  }
});

// ✅ FIXED: Create a new session activity
router.post("/:sessionId/activities", authMiddleware, async (req, res) => {
  try {
    const session = await Session.findOne({ where: { id: req.params.sessionId, user_id: req.user.id } });

    if (!session) {
      return res.status(404).json({ error: "Session not found or unauthorized" });
    }

    const { sport_type, duration, distance, heart_rate_min, heart_rate_max, heart_rate_avg, cadence, power } = req.body;

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

    await updatePersonalRecord(req.user.id, sport_type, distance, duration, session.date);

    res.status(201).json(activity);
  } catch (error) {
    console.error("Error creating session activity:", error);
    res.status(400).json({ error: "Failed to create activity" });
  }
});

// Update a session
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

// Delete a session
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

// ✅ Function to update personal records automatically
async function updatePersonalRecord(userId, sportType, distance, bestTime, recordDate) {
  try {
    const existingRecord = await PersonalRecord.findOne({
      where: { user_id: userId, activity_type: sportType, distance: distance },
      order: [["best_time", "ASC"]],
    });

    if (!existingRecord || parseInt(bestTime) < parseInt(existingRecord.best_time)) {
      if (existingRecord) {
        await existingRecord.update({ best_time: bestTime, record_date: recordDate });
      } else {
        await PersonalRecord.create({
          user_id: userId,
          activity_type: sportType,
          distance: distance,
          best_time: bestTime,
          record_date: recordDate,
        });
      }
    }

    await enforcePersonalRecordLimit(userId, sportType);
  } catch (error) {
    console.error("Error updating personal record:", error);
  }
}

// ✅ Function to enforce a max of 3 personal records per sport type
async function enforcePersonalRecordLimit(userId, sportType) {
  try {
    const records = await PersonalRecord.findAll({
      where: { user_id: userId, activity_type: sportType },
      order: [["best_time", "ASC"]],
    });

    if (records.length > 3) {
      const recordsToDelete = records.slice(3);
      for (const record of recordsToDelete) {
        await record.destroy();
      }
    }
  } catch (error) {
    console.error("Error enforcing personal record limit:", error);
  }
}

module.exports = router;

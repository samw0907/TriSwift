const express = require("express");
const { Op } = require("sequelize");
const { Session, SessionActivity, PersonalRecord } = require("../models");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/:sessionId", authMiddleware, async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { 
        start_date, 
        end_date, 
        sport_type, 
        min_duration, 
        max_duration, 
        min_distance, 
        max_distance, 
        min_hr, 
        max_hr, 
        min_cadence, 
        max_cadence, 
        min_power, 
        max_power, 
        sort_duration, 
        sort_distance, 
        sort_sport_type, 
        sort_date 
      } = req.query;
  
      const session = await Session.findOne({ where: { id: sessionId, user_id: req.user.id } });
      if (!session) {
        return res.status(404).json({ error: "Session not found or unauthorized" });
      }
  
      let activityFilters = { session_id: session.id };
      let sortingOptions = [];
  
      if (start_date || end_date) {
        activityFilters.created_at = {};
        if (start_date) activityFilters.created_at[Op.gte] = new Date(start_date);
        if (end_date) activityFilters.created_at[Op.lte] = new Date(end_date);
      }
  
      if (sport_type) {
        activityFilters.sport_type = { [Op.iLike]: sport_type };
      }
  
      if (min_duration || max_duration) {
        activityFilters.duration = {};
        if (min_duration) activityFilters.duration[Op.gte] = parseInt(min_duration, 10);
        if (max_duration) activityFilters.duration[Op.lte] = parseInt(max_duration, 10);
      }
  
      if (min_distance || max_distance) {
        activityFilters.distance = {};
        if (min_distance) activityFilters.distance[Op.gte] = parseFloat(min_distance);
        if (max_distance) activityFilters.distance[Op.lte] = parseFloat(max_distance);
      }

      if (min_hr || max_hr) {
        activityFilters.heart_rate_avg = {};
        if (min_hr) activityFilters.heart_rate_avg[Op.gte] = parseInt(min_hr, 10);
        if (max_hr) activityFilters.heart_rate_avg[Op.lte] = parseInt(max_hr, 10);
      }
  
      if (min_cadence || max_cadence) {
        activityFilters.cadence = {};
        if (min_cadence) activityFilters.cadence[Op.gte] = parseInt(min_cadence, 10);
        if (max_cadence) activityFilters.cadence[Op.lte] = parseInt(max_cadence, 10);
      }
  
      if (min_power || max_power) {
        activityFilters.power = {};
        if (min_power) activityFilters.power[Op.gte] = parseInt(min_power, 10);
        if (max_power) activityFilters.power[Op.lte] = parseInt(max_power, 10);
      }
  
      if (sort_duration) {
        sortingOptions.push(["duration", sort_duration.toLowerCase() === "asc" ? "ASC" : "DESC"]);
      }
      if (sort_distance) {
        sortingOptions.push(["distance", sort_distance.toLowerCase() === "asc" ? "ASC" : "DESC"]);
      }
      if (sort_sport_type) {
        sortingOptions.push(["sport_type", sort_sport_type.toLowerCase() === "asc" ? "ASC" : "DESC"]);
      }
      if (sort_date) {
        sortingOptions.push(["created_at", sort_date.toLowerCase() === "asc" ? "ASC" : "DESC"]);
      }

      const activities = await SessionActivity.findAll({
        where: activityFilters,
        order: sortingOptions.length ? sortingOptions : [["created_at", "DESC"]],
      });
  
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

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

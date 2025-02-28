const express = require("express");
const { Op } = require("sequelize");
const { PersonalRecord, SessionActivity } = require("../models");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { sport_type, min_distance, max_distance, start_date, end_date, sort_distance, sort_best_time } = req.query;

    let filters = { user_id: req.user.id };
    let sortingOptions = [["distance", "ASC"], ["best_time", "ASC"]];

    if (sport_type) {
      filters.activity_type = { [Op.iLike]: sport_type };
    }

    if (min_distance || max_distance) {
      filters.distance = {};
      if (min_distance) filters.distance[Op.gte] = parseFloat(min_distance);
      if (max_distance) filters.distance[Op.lte] = parseFloat(max_distance);
    }

    if (start_date || end_date) {
      filters.record_date = {};
      if (start_date) filters.record_date[Op.gte] = new Date(start_date);
      if (end_date) filters.record_date[Op.lte] = new Date(end_date);
    }

    if (sort_distance) {
      sortingOptions.push(["distance", sort_distance.toLowerCase() === "asc" ? "ASC" : "DESC"]);
    }

    if (sort_best_time) {
      sortingOptions.push(["best_time", sort_best_time.toLowerCase() === "asc" ? "ASC" : "DESC"]);
    }

    const records = await PersonalRecord.findAll({
      where: filters,
      order: sortingOptions,
      limit: 3,
    });

    res.json(records);
  } catch (error) {
    console.error("Error fetching personal records:", error);
    res.status(500).json({ error: "Failed to fetch personal records" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { session_activity_id, activity_type, distance, best_time, record_date } = req.body;

    if (!session_activity_id || !activity_type || !best_time) {
      return res.status(400).json({ error: "Session activity ID, activity type, and best time are required." });
    }

    const sessionActivity = await SessionActivity.findOne({
      where: { id: session_activity_id, user_id: req.user.id },
    });

    if (!sessionActivity) {
      return res.status(404).json({ error: "Session activity not found or unauthorized" });
    }

    const newRecord = await PersonalRecord.create({
      user_id: req.user.id,
      session_activity_id,
      activity_type,
      distance,
      best_time,
      record_date: record_date || new Date(),
    });

    res.status(201).json(newRecord);
  } catch (error) {
    console.error("Error creating personal record:", error);
    res.status(500).json({ error: "Failed to create personal record" });
  }
});

router.put("/:recordId", authMiddleware, async (req, res) => {
  try {
    const record = await PersonalRecord.findOne({
      where: { id: req.params.recordId, user_id: req.user.id },
    });

    if (!record) {
      return res.status(404).json({ error: "Personal record not found or unauthorized" });
    }

    const { activity_type, distance, best_time, record_date } = req.body;

    await record.update({
      activity_type: activity_type ?? record.activity_type,
      distance: distance ?? record.distance,
      best_time: best_time ?? record.best_time,
      record_date: record_date ?? record.record_date,
    });

    res.json(record);
  } catch (error) {
    console.error("Error updating personal record:", error);
    res.status(400).json({ error: "Failed to update personal record" });
  }
});

router.delete("/:recordId", authMiddleware, async (req, res) => {
  try {
    const record = await PersonalRecord.findOne({
      where: { id: req.params.recordId, user_id: req.user.id },
    });

    if (!record) {
      return res.status(404).json({ error: "Personal record not found or unauthorized" });
    }

    await record.destroy();
    res.json({ message: "Personal record deleted successfully" });
  } catch (error) {
    console.error("Error deleting personal record:", error);
    res.status(500).json({ error: "Failed to delete personal record" });
  }
});

module.exports = router;

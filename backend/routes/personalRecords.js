const express = require("express");
const { PersonalRecord } = require("../models");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const records = await PersonalRecord.findAll({ where: { user_id: req.user.id } });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch personal records" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const record = await PersonalRecord.create({ user_id: req.user.id, ...req.body });
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ error: "Failed to create personal record" });
  }
});

router.put("/:recordId", authMiddleware, async (req, res) => {
  try {
    const record = await PersonalRecord.findOne({ where: { id: req.params.recordId, user_id: req.user.id } });

    if (!record) {
      return res.status(404).json({ error: "Personal record not found or unauthorized" });
    }

    await record.update(req.body);
    res.json(record);
  } catch (error) {
    res.status(400).json({ error: "Failed to update personal record" });
  }
});

router.delete("/:recordId", authMiddleware, async (req, res) => {
  try {
    const record = await PersonalRecord.findOne({ where: { id: req.params.recordId, user_id: req.user.id } });

    if (!record) {
      return res.status(404).json({ error: "Personal record not found or unauthorized" });
    }

    await record.destroy();
    res.json({ message: "Personal record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete personal record" });
  }
});

module.exports = router;

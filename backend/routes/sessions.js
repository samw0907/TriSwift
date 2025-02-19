const express = require("express");
const { Session } = require("../models"); // Ensure this matches your Sequelize models path

const router = express.Router();

router.get("/sessions", async (req, res) => {
  try {
    const sessions = await Session.findAll();
    res.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

module.exports = router;

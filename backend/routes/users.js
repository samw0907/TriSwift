const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { JWT_SECRET } = require("../util/config");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/signup", async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      if (!password) {
        return res.status(400).json({ error: "Password is required" });
      }
  
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: "Email is already in use" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
  
      const user = await User.create({
        name,
        email,
        password_hash: passwordHash,
      });
  
      await user.reload();
  
      res.status(201).json({ message: "User created successfully", user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
      console.error("Signup Error:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ["id", "name", "email", "created_at"] });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Profile Error:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

router.post("/logout", authMiddleware, (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;

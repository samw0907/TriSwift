const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { JWT_SECRET } = require("../util/config");

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    const user = await User.create({
      name,
      email,
      password_hash: password,
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.post("/login", async (req, res) => {
  try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });

      if (!user) {
          return res.status(401).json({ error: "Invalid email or password" });
      }

      const passwordValid = await bcrypt.compare(password, user.password_hash);

      if (!passwordValid) {
          return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

      res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ error: "Login failed" });
  }
});

router.post("/logout", (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;
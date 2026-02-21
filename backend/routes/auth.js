const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const getConfig = () => require("../util/config");

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields (name, email, password) are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ where: { email: normalizedEmail } });

    if (existingUser) {
      return res.status(400).json({ error: "Email is already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      name: name.trim(), 
      email: normalizedEmail, 
      password_hash: passwordHash 
    });

    res.status(201).json({ 
      message: "User created successfully", 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email,
        created_at: user.created_at.toISOString()
      } 
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { JWT_SECRET } = getConfig();

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    if (!JWT_SECRET) {
      console.error("JWT_SECRET is missing!");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email,
        created_at: user.created_at.toISOString()
      } 
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});


router.post("/logout", (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;


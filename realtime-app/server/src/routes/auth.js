const express   = require("express");
const jwt       = require("jsonwebtoken");
const { User }  = require("../models");

const router = express.Router();

const generateToken = (user) =>
  jwt.sign(
    { userId: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const exists = await User.findOne({ where: { email } });
    if (exists)
      return res.status(400).json({ error: "Email already taken" });

    const user  = await User.create({ username, email, password });
    const token = generateToken(user);

    res.json({ token, username: user.username });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError")
      return res.status(400).json({ error: "Username or email already taken" });
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(400).json({ error: "Invalid credentials" });

    const match = await user.comparePassword(password);
    if (!match)
      return res.status(400).json({ error: "Invalid credentials" });

    const token = generateToken(user);
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // adjust path if needed

const router = express.Router();

// REGISTER
// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      role, 
      yearsExperience, 
      region, 
      insuranceTypes 
    } = req.body;

    // check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) 
      return res.status(400).json({ success: false, message: "Email already registered" });

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      yearsExperience: role === "underwriter" ? yearsExperience : undefined,
      region: role === "underwriter" ? region : undefined,
      insuranceTypes: role === "underwriter" ? insuranceTypes : [],
    });

    await user.save();
    console.log("📩 Register payload:", req.body);
    res.json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ success: false, message: "Error registering user", error: error.message });
  }
});


// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid email or password" });

    // create JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ success: true, token, role: user.role, name: user.name, userId: user._id });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error logging in", error });
  }
});

module.exports = router;

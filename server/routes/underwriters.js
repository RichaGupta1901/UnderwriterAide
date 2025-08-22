// routes/underwriters.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Get all underwriters (exclude password)
router.get("/", async (req, res) => {
  try {
    const underwriters = await User.find({ role: "underwriter" }, "-password");
    res.json({ success: true, underwriters });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch underwriters",
      error: error.message,
    });
  }
});

module.exports = router;
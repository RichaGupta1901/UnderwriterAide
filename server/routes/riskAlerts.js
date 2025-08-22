import express from "express";
import User from "./models/User.js";

const router = express.Router();

// GET risk alerts using userId from query
router.get("/risk_alerts", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    // fetch user from MongoDB
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const location = user.location;
    console.log("Using location from DB:", location);

    // Now run your risk assessment logic with location
    // For demo: return fake alert
    const alerts = [{ type: "Weather", message: `Storm near ${location}` }];

    res.json(alerts);
  } catch (err) {
    console.error("Error fetching risk alerts:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;

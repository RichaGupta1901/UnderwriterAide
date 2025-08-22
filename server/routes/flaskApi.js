const express = require("express");
const axios = require("axios");
const router = express.Router();

const FLASK_API_BASE = "http://localhost:5001/api";

router.get("/debug/test_city/:city", async (req, res) => {
  try {
    const response = await axios.get(`${FLASK_API_BASE}/debug/test_city/${req.params.city}`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch test city" });
  }
});

router.get("/debug/finance", async (req, res) => {
  try {
    const response = await axios.get(`${FLASK_API_BASE}/debug/finance`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch finance data" });
  }
});

router.get("/risk_alerts", async (req, res) => {
  try {
    const response = await axios.get(`${FLASK_API_BASE}/risk_alerts`, { params: req.query });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch risk alerts" });
  }
});

router.post("/predict_ml", async (req, res) => {
  try {
    const response = await axios.post(`${FLASK_API_BASE}/predict_ml`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Failed to run ML prediction" });
  }
});

module.exports = router;

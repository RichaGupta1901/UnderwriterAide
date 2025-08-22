import React, { useState, useEffect } from "react";
import { AlertTriangle, TrendingUp } from "lucide-react";
import "./RiskAlerts.css";

const RiskAlerts = () => {
  const [location, setLocation] = useState(null);
  const [hazardAlerts, setHazardAlerts] = useState([]);
  const [financialAlerts, setFinancialAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Fetch user's saved location from backend (MongoDB)
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/user/location");
        const data = await res.json();
        setLocation(data.location); // Assuming { location: "Mumbai" }
      } catch (err) {
        console.error("Error fetching location:", err);
        setError("Could not fetch location");
      }
    };
    fetchLocation();
  }, []);

  // 2. Fetch alerts once we know the location
  useEffect(() => {
    if (!location) return;

    const fetchAlerts = async () => {
      try {
        setLoading(true);

        const [hazardRes, financialRes] = await Promise.all([
          fetch(`http://localhost:5000/api/risk_alerts?location=${location}`),
          fetch(`http://localhost:5000/api/predict_ml?location=${location}`)
        ]);

        const hazardData = await hazardRes.json();
        const financialData = await financialRes.json();

        setHazardAlerts(hazardData.alerts || []);
        setFinancialAlerts(financialData.alerts || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching alerts:", err);
        setError("Failed to load alerts");
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [location]);

  if (loading) return <p>Loading risk alerts...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="risk-alerts">
      <h2>Risk Alerts for {location}</h2>

      <div className="alerts-section">
        <h3><AlertTriangle size={18}/> Hazard Alerts</h3>
        {hazardAlerts.length > 0 ? (
          <ul>
            {hazardAlerts.map((alert, idx) => (
              <li key={idx}>{alert}</li>
            ))}
          </ul>
        ) : (
          <p>No hazard alerts</p>
        )}
      </div>

      <div className="alerts-section">
        <h3><TrendingUp size={18}/> Financial Alerts</h3>
        {financialAlerts.length > 0 ? (
          <ul>
            {financialAlerts.map((alert, idx) => (
              <li key={idx}>{alert}</li>
            ))}
          </ul>
        ) : (
          <p>No financial alerts</p>
        )}
      </div>
    </div>
  );
};

export default RiskAlerts;

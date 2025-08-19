// src/components/Dashboard.jsx
import React, { useState } from 'react';
import RiskAlerts from './RiskAlerts';
import GeoRiskMap from './GeoRiskMap';
import RiskScore from './RiskScore';
import ScenarioTesting from './ScenarioTesting';
import './Dashboard.css';

// It's good practice to define the initial state as a constant
const initialAssessmentData = {
  risk_score: null,
  risk_level: 'Not assessed',
  location: 'Not specified',
  weather: null,
  hazard_alerts: [],
  financial_alerts: [],
  financial_alert_count: 0,
  total_alert_count: 0,
  alert_count: 0,
  last_updated: null,
};

const Dashboard = () => {
  // State for the assessment data, which will be passed to child components
  const [assessmentData, setAssessmentData] = useState(initialAssessmentData);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  // NEW: Dedicated state for handling and displaying errors to the user
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    // Clear previous errors when a new file is selected
    setError(null);
  };

  // This function is defined but not used in the upload flow.
  // It could be used for a separate feature, like a refresh button.
  const fetchFinancialNews = async (symbols = '') => {
    try {
      const response = await fetch(`http://localhost:5000/api/finance_news?symbols=${symbols}`);
      const data = await response.json();
      return data.alerts || [];
    } catch (error) {
      console.error('Error fetching financial news:', error);
      return [];
    }
  };

  const handleUpload = async () => {
    // UPDATED: Use the new error state for clearer UI feedback instead of alert()
    if (!selectedFile) {
      setError("Please select a file first!");
      return;
    }

    // Clear any previous errors and reset state before a new upload
    setError(null);
    setUploading(true);
    setAssessmentData(initialAssessmentData); // Reset data on new assessment

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/api/assess', {
        method: 'POST',
        body: formData,
      });

      // Try to parse the JSON body regardless of the response status
      const result = await response.json();

      if (response.ok) {
        // Update the state with the new assessment data from the backend
        setAssessmentData({
          risk_score: result.risk_score || 'N/A',
          risk_level: result.risk_level || 'Analysis complete',
          location: result.location_found || 'Not specified',
          weather: result.weather_details,
          hazard_alerts: result.hazard_alerts || [],
          financial_alerts: result.financial_alerts || [],
          financial_alert_count: result.financial_alert_count || 0,
          total_alert_count: (result.alert_count || 0) + (result.financial_alert_count || 0),
          alert_count: result.alert_count || 0,
          last_updated: result.timestamp || new Date().toISOString()
        });

        console.log('Assessment complete:', result);
        console.log('Found', result.alert_count || 0, 'hazard alerts and', result.financial_alert_count || 0, 'financial alerts for', result.location_found);
      } else {
        // If the server returned an error, use its message if available
        throw new Error(result.error || `Request failed with status ${response.status}`);
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      // UPDATED: Set a user-friendly error message and reset the data
      setError(`Assessment Failed: ${err.message}`);
      setAssessmentData(initialAssessmentData); // Ensure data is reset on error
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="logo">AI Underwriter Pro</div>
        {/* Add your nav links here */}
      </nav>

      <div className="sidebar">
        <div className="upload-section">
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt"
          />
          <button
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? 'Assessing...' : 'Assess Policy'}
          </button>
          {/* NEW: Display error messages directly in the UI */}
          {error && <div className="error-message">{error}</div>}
        </div>
        {/* Add your sidebar links here */}
      </div>

      <div className="main-content">
        <div className="top-row">
          <RiskAlerts
            locationWeather={assessmentData.weather}
            location={assessmentData.location}
            hazardAlerts={assessmentData.hazard_alerts}
            financialAlerts={assessmentData.financial_alerts}
            alertCount={assessmentData.alert_count}
            financialAlertCount={assessmentData.financial_alert_count}
            lastUpdated={assessmentData.last_updated}
          />
          <GeoRiskMap />
        </div>

        <div className="bottom-row">
          <RiskScore
            score={assessmentData.risk_score}
            level={assessmentData.risk_level}
            totalAlerts={assessmentData.total_alert_count}
            hazardAlerts={assessmentData.alert_count}
            financialAlerts={assessmentData.financial_alert_count}
          />
          <ScenarioTesting />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
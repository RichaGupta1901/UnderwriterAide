// src/components/RiskAnalysisDashboard.jsx
import React, { useState } from 'react';
import RiskAlerts from './RiskAlerts';
import GeoRiskMap from './GeoRiskMap';
import RiskScore from './RiskScore';
import ScenarioTesting from './ScenarioTesting';
// UPDATED: Corrected the CSS import path
import './RiskAnalysisDashboard.css';

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

const RiskAnalysisDashboard = () => { // This component doesn't take props
    const [assessmentData, setAssessmentData] = useState(initialAssessmentData);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    // REMOVED: The unused fetchFinancialNews function has been deleted for cleanliness.

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setError(null);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError("Please select a file first!");
            return;
        }

        setError(null);
        setUploading(true);
        setAssessmentData(initialAssessmentData);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('http://localhost:5000/api/assess', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
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
            } else {
                throw new Error(result.error || `Request failed with status ${response.status}`);
            }
        } catch (err) {
            setError(`Assessment Failed: ${err.message}`);
            setAssessmentData(initialAssessmentData);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="main-content risk-analysis-page">
            <div className="upload-section-analytics">
                <input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt" />
                <button onClick={handleUpload} disabled={uploading}>
                    {uploading ? 'Assessing...' : 'Assess Policy Document'}
                </button>
                {error && <div className="error-message">{error}</div>}
            </div>

            <div className="top-row">
                {/* CHANGED: Instead of {...props}, we now spread the actual state object */}
                <RiskAlerts {...assessmentData} />
                <GeoRiskMap />
            </div>

            <div className="bottom-row">
                {/* CHANGED: Same fix here for RiskScore */}
                <RiskScore {...assessmentData} />
                <ScenarioTesting />
            </div>
        </div>
    );
};

export default RiskAnalysisDashboard;
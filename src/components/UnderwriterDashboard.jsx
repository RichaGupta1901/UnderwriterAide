import React, { useState } from 'react';
// NEW: Import routing components from react-router-dom
import { Routes, Route, NavLink, useParams } from 'react-router-dom';
import './UnderwriterDashboard.css';

// Import the individual risk analysis components
import RiskAlerts from './RiskAlerts';
import GeoRiskMap from './GeoRiskMap';
import RiskScore from './RiskScore';
import ScenarioTesting from './ScenarioTesting';

// NEW: All the logic for the main underwriting workflow is moved into its own component.
const WorkflowView = () => {
  const { status } = useParams(); // Gets the status ('in-review', 'completed') from the URL
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [riskScore, setRiskScore] = useState(null);
  const [complianceResults, setComplianceResults] = useState(null);
  const [premiumAdjustment, setPremiumAdjustment] = useState(0);

  // Risk Analysis Dashboard state
  const [assessmentData, setAssessmentData] = useState({
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
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // ... (All mock data and handler functions are moved inside here) ...
  const applications = [
    { id: 201, type: 'Life Insurance', applicant: 'Robert Chen', date: '2023-07-15', status: 'Pending', coverageAmount: 500000, policyTerm: 20, assetDetails: 'Term life insurance policy for family protection' },
    { id: 202, type: 'Property Insurance', applicant: 'Lisa Wong', date: '2023-07-18', status: 'In Review', coverageAmount: 750000, policyTerm: 5, assetDetails: 'Residential property in Sydney CBD, 3 bedroom apartment' },
    { id: 203, type: 'Auto Insurance', applicant: 'James Miller', date: '2023-07-20', status: 'Pending', coverageAmount: 35000, policyTerm: 1, assetDetails: '2022 Tesla Model 3, primarily used for commuting' },
  ];
  const completedApplications = [
    { id: 195, type: 'Health Insurance', applicant: 'Emily Johnson', date: '2023-07-01', status: 'Completed', riskScore: 65, premium: 450, notes: 'Standard health coverage with dental add-on' },
    { id: 196, type: 'Business Insurance', applicant: 'Mark Davis', date: '2023-07-05', status: 'Completed', riskScore: 72, premium: 1200, notes: 'Small business liability coverage with cyber protection' },
  ];

  const handleSelectApplication = (application) => {
    setSelectedApplication(application);
    setRiskScore(null);
    setComplianceResults(null);
    setPremiumAdjustment(0);
    // Reset risk analysis data when selecting a new application
    setAssessmentData({
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
    });
    setError(null);
  };

  const handleRunRiskAssessment = () => {
    setTimeout(() => {
      const mockRiskScore = {
        overall: Math.floor(Math.random() * 30) + 50,
        breakdown: { financial: Math.floor(Math.random() * 30) + 50, operational: Math.floor(Math.random() * 30) + 50, compliance: Math.floor(Math.random() * 30) + 50, market: Math.floor(Math.random() * 30) + 50, },
        factors: ['Asset location in high-risk area', 'Limited financial history', 'Previous claims history',]
      };
      setRiskScore(mockRiskScore);
    }, 1500);
  };

  const handleRunComplianceCheck = () => {
    setTimeout(() => {
      const mockComplianceResults = {
        status: Math.random() > 0.3 ? 'Pass' : 'Warning',
        regulations: [
          { name: 'APRA Prudential Standard CPS 220', status: 'Compliant' },
          { name: 'Insurance Contracts Act', status: 'Compliant' },
          { name: 'Privacy Act 1988', status: Math.random() > 0.3 ? 'Compliant' : 'Warning' },
        ],
        notes: 'Application generally complies with regulatory requirements with minor concerns.'
      };
      setComplianceResults(mockComplianceResults);
    }, 1500);
  };

  const handleAdjustPremium = (adjustment) => setPremiumAdjustment(adjustment);

  const handleGenerateReport = () => {
    alert('Report generated and sent to applicant');
    const updatedApplications = applications.filter(app => app.id !== selectedApplication.id);
    setSelectedApplication(null);
    setRiskScore(null);
    setComplianceResults(null);
    setPremiumAdjustment(0);
  };

  // Risk Analysis Dashboard handlers
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
    setAssessmentData({
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
    });

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
      setAssessmentData({
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
      });
    } finally {
      setUploading(false);
    }
  };

  const renderApplicationsList = (apps, title) => {
    return (
        <div className="applications-list">
        <h2>{title}</h2>
        {apps.length > 0 ? (
          <div className="table">
            <div className="table-header">
              <div className="header-cell">ID</div>
              <div className="header-cell">Type</div>
              <div className="header-cell">Applicant</div>
              <div className="header-cell">Date</div>
              <div className="header-cell">Status</div>
              <div className="header-cell">Actions</div>
            </div>
            {apps.map(app => (
              <div key={app.id} className={`table-row ${selectedApplication?.id === app.id ? 'selected' : ''}`}>
                <div className="cell">{app.id}</div>
                <div className="cell">{app.type}</div>
                <div className="cell">{app.applicant}</div>
                <div className="cell">{app.date}</div>
                <div className="cell"><span className={`status-badge ${app.status.toLowerCase().replace(' ', '-')}`}>{app.status}</span></div>
                <div className="cell"><button className="action-btn" onClick={() => handleSelectApplication(app)}>{app.status === 'Completed' ? 'View Details' : 'Review'}</button></div>
              </div>
            ))}
          </div>
        ) : (<div className="empty-state"><p>No applications available.</p></div>)}
      </div>
    );
  };

  // Updated UnderwriterDashboard.jsx - Moved applicant information above risk analysis

const renderApplicationDetails = () => {
  if (!selectedApplication) return null;
  const isCompleted = selectedApplication.status === 'Completed';

  return (
    <div className="application-details">
      <div className="details-header">
        <h2>Application #{selectedApplication.id}</h2>
        <span className={`status-badge ${selectedApplication.status.toLowerCase().replace(' ', '-')}`}>
          {selectedApplication.status}
        </span>
      </div>

      <div className="details-content">
        {/* MOVED: Application Information Section - Now at the top */}
        <div className="details-section applicant-info-section">
          <h3>📋 Application Information</h3>
          <div className="applicant-card">
            <div className="applicant-header">
              <div className="applicant-avatar">
                {selectedApplication.applicant.split(' ').map(name => name[0]).join('')}
              </div>
              <div className="applicant-details">
                <h4>{selectedApplication.applicant}</h4>
                <p className="insurance-type">{selectedApplication.type}</p>
                <p className="submission-date">Submitted: {selectedApplication.date}</p>
              </div>
              <div className="coverage-amount">
                <span className="amount-label">Coverage</span>
                <span className="amount-value">
                  ${selectedApplication.coverageAmount?.toLocaleString() || 'N/A'}
                </span>
              </div>
            </div>

            <div className="policy-details-grid">
              <div className="policy-detail">
                <span className="detail-icon">🏠</span>
                <div className="detail-content">
                  <span className="detail-label">Policy Term</span>
                  <span className="detail-value">
                    {selectedApplication.policyTerm ? `${selectedApplication.policyTerm} years` : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="policy-detail">
                <span className="detail-icon">📍</span>
                <div className="detail-content">
                  <span className="detail-label">Asset Location</span>
                  <span className="detail-value">
                    {assessmentData.location !== 'Not specified'
                      ? assessmentData.location
                      : 'To be determined'
                    }
                  </span>
                </div>
              </div>

              <div className="policy-detail">
                <span className="detail-icon">📊</span>
                <div className="detail-content">
                  <span className="detail-label">Current Risk Score</span>
                  <span className="detail-value">
                    {assessmentData.risk_score || 'Not assessed'}
                  </span>
                </div>
              </div>

              <div className="policy-detail">
                <span className="detail-icon">⚠️</span>
                <div className="detail-content">
                  <span className="detail-label">Active Alerts</span>
                  <span className="detail-value">
                    {assessmentData.total_alert_count || 0} alerts
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="asset-description">
            <h4>📝 Asset Details</h4>
            <p>{selectedApplication.assetDetails || 'No detailed information available.'}</p>
          </div>
        </div>

        {/* Risk Analysis Section - Now below applicant information */}
        {!isCompleted && (
          <div className="risk-analysis-section">
            <div className="risk-analysis-header">
              <h3>🔍 Advanced Risk Analysis Dashboard</h3>
              <p>Upload policy documents and assess comprehensive risk factors</p>
            </div>

            <div className="upload-section-analytics">
              <div className="upload-controls">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt"
                  className="file-input"
                />
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="upload-btn"
                >
                  {uploading ? '🔄 Assessing...' : '📄 Assess Policy Document'}
                </button>
              </div>

              {error && (
                <div className="error-message">
                  <span className="error-icon">❌</span>
                  {error}
                </div>
              )}

              {assessmentData.last_updated && (
                <div className="assessment-status">
                  <span className="status-icon">✅</span>
                  Last assessment: {new Date(assessmentData.last_updated).toLocaleString()}
                </div>
              )}
            </div>

            <div className="risk-analysis-grid">
              <div className="risk-analysis-row">
                <div className="risk-component">
                  <RiskAlerts
                    location={assessmentData.location}
                    locationWeather={assessmentData.weather}
                    hazardAlerts={assessmentData.hazard_alerts}
                    financialAlerts={assessmentData.financial_alerts}
                    alertCount={assessmentData.alert_count}
                    financialAlertCount={assessmentData.financial_alert_count}
                    lastUpdated={assessmentData.last_updated}
                  />
                </div>
                <div className="risk-component">
                  <GeoRiskMap />
                </div>
              </div>
              <div className="risk-analysis-row">
                <div className="risk-component">
                  <RiskScore {...assessmentData} />
                </div>
                <div className="risk-component">
                  <ScenarioTesting />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assessment Results for Completed Applications */}
        {isCompleted ? (
          <div className="details-section completed-results">
            <h3>✅ Assessment Results</h3>
            <div className="results-grid">
              <div className="result-card">
                <div className="result-icon">📊</div>
                <div className="result-content">
                  <span className="result-label">Risk Score</span>
                  <span className="result-value">{selectedApplication.riskScore}</span>
                </div>
              </div>

              <div className="result-card">
                <div className="result-icon">💰</div>
                <div className="result-content">
                  <span className="result-label">Monthly Premium</span>
                  <span className="result-value">${selectedApplication.premium}</span>
                </div>
              </div>

              <div className="result-card full-width">
                <div className="result-icon">📝</div>
                <div className="result-content">
                  <span className="result-label">Assessment Notes</span>
                  <span className="result-value">{selectedApplication.notes}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Traditional Assessment Tools - Now below risk analysis */
          <div className="assessment-tools">
            <div className="tools-header">
              <h3>🛠️ Traditional Assessment Tools</h3>
              <p>Legacy risk assessment and compliance checking tools</p>
            </div>

            <div className="tool-section">
              <h4>🎯 XGBoost/LLM Risk Assessment</h4>
              {riskScore ? (
                <div className="risk-score-results">
                  <div className="score-display">
                    <div className="score-circle" style={{
                      backgroundColor: riskScore.overall > 70 ? '#fc8181' :
                                     riskScore.overall > 50 ? '#f6ad55' : '#68d391'
                    }}>
                      <span className="score-value">{riskScore.overall}</span>
                    </div>
                    <div className="score-label">
                      {riskScore.overall > 70 ? 'High Risk' :
                       riskScore.overall > 50 ? 'Medium Risk' : 'Low Risk'}
                    </div>
                  </div>
                  <div className="score-breakdown">
                    <h5>Risk Breakdown</h5>
                    {Object.entries(riskScore.breakdown).map(([key, value]) => (
                      <div key={key} className="breakdown-item">
                        <span>{key.charAt(0).toUpperCase() + key.slice(1)} Risk</span>
                        <div className="progress-bar">
                          <div className="progress" style={{width: `${value}%`}}></div>
                        </div>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="risk-factors">
                    <h5>Key Risk Factors</h5>
                    <ul>
                      {riskScore.factors.map((factor, index) => (
                        <li key={index}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <button className="tool-btn" onClick={handleRunRiskAssessment}>
                  🚀 Run XGBoost/LLM Risk Assessment
                </button>
              )}
            </div>

            <div className="tool-section">
              <h4>📋 APRA Compliance Check</h4>
              {complianceResults ? (
                <div className="compliance-results">
                  <div className="compliance-status">
                    <span className={`compliance-badge ${complianceResults.status.toLowerCase()}`}>
                      {complianceResults.status}
                    </span>
                  </div>
                  <div className="regulations-list">
                    <h5>Regulatory Compliance</h5>
                    {complianceResults.regulations.map((reg, index) => (
                      <div key={index} className="regulation-item">
                        <span>{reg.name}</span>
                        <span className={`reg-status ${reg.status.toLowerCase()}`}>
                          {reg.status}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="compliance-notes">
                    <h5>Compliance Notes</h5>
                    <p>{complianceResults.notes}</p>
                  </div>
                </div>
              ) : (
                <button className="tool-btn" onClick={handleRunComplianceCheck}>
                  🔍 Run APRA Compliance Check
                </button>
              )}
            </div>

            <div className="tool-section">
              <h4>💵 Premium Calculator</h4>
              <div className="premium-calculator">
                <div className="base-premium">
                  <span>Base Premium:</span>
                  <span>${calculateBasePremium(selectedApplication)}/month</span>
                </div>
                <div className="adjustment-controls">
                  <label>Risk-Based Adjustment (%)</label>
                  <input
                    type="range"
                    min="-30"
                    max="50"
                    value={premiumAdjustment}
                    onChange={(e) => handleAdjustPremium(parseInt(e.target.value))}
                  />
                  <span>{premiumAdjustment > 0 ? `+${premiumAdjustment}%` : `${premiumAdjustment}%`}</span>
                </div>
                <div className="final-premium">
                  <span>Final Premium:</span>
                  <span>${calculateAdjustedPremium(selectedApplication, premiumAdjustment)}/month</span>
                </div>
                <div className="external-factors">
                  <h5>External Risk Factors</h5>
                  <div className="factor-item">
                    <span>Climate Risk (Location)</span>
                    <span className="factor-impact negative">+5%</span>
                  </div>
                  <div className="factor-item">
                    <span>Economic Indicators</span>
                    <span className="factor-impact positive">-2%</span>
                  </div>
                  <div className="factor-item">
                    <span>Industry Trends</span>
                    <span className="factor-impact neutral">0%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="report-generation">
              <h4>📊 Generate Assessment Report</h4>
              <p>Generate a comprehensive underwriting report for the applicant based on your assessment.</p>
              <button
                className="primary-btn"
                onClick={handleGenerateReport}
                disabled={!riskScore || !complianceResults}
              >
                📄 Generate & Send Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

  const calculateBasePremium = (application) => {
    if (!application || !application.coverageAmount) return 0;
    let basePremium = 0;
    switch (application.type) {
      case 'Life Insurance': basePremium = (application.coverageAmount * 0.001) / 12; break;
      case 'Health Insurance': basePremium = 400; break;
      case 'Property Insurance': basePremium = (application.coverageAmount * 0.0015) / 12; break;
      case 'Auto Insurance': basePremium = (application.coverageAmount * 0.02) / 12; break;
      case 'Business Insurance': basePremium = (application.coverageAmount * 0.002) / 12; break;
      default: basePremium = (application.coverageAmount * 0.001) / 12;
    }
    return Math.round(basePremium);
  };

  const calculateAdjustedPremium = (application, adjustment) => {
    const basePremium = calculateBasePremium(application);
    const adjustedPremium = basePremium * (1 + adjustment / 100);
    return Math.round(adjustedPremium);
  };

  // Determine which list and title to render based on the URL
  let listToRender;
  let title = '';
  switch (status) {
      case 'in-review':
          listToRender = applications.filter(app => app.status === 'In Review');
          title = 'Applications In Review';
          break;
      case 'completed':
          listToRender = completedApplications;
          title = 'Completed Applications';
          break;
      default: // for 'new-requests' and the default case
          listToRender = applications.filter(app => app.status === 'Pending');
          title = 'New Application Requests';
  }

  return (
    <div className="content-container">
      <div className="applications-panel">
        {renderApplicationsList(listToRender, title)}
      </div>
      <div className="details-panel">
        {selectedApplication ? renderApplicationDetails() : (
          <div className="empty-details">
            <p>Select an application to view details and perform assessment.</p>
          </div>
        )}
      </div>
    </div>
  );
};


// Main Component
const UnderwriterDashboard = ({ onLogout }) => {
  return (
    <div className="underwriter-dashboard">
      <header className="dashboard-header">
        <div className="logo">AI Underwriting Risk Assessment</div>
        <div className="user-menu">
          <span className="user-name">Sarah Johnson</span>
          <span className="user-role">Senior Underwriter</span>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <div className="dashboard-container">
        <aside className="sidebar">
          <div className="sidebar-header"><h2>Underwriter Portal</h2></div>
          <div className="underwriter-profile">
            <div className="profile-info">
              <h3>Sarah Johnson</h3>
              <p>Property & Auto Insurance</p>
              <p>8 years experience</p>
              <p>Europe Region</p>
            </div>
          </div>

          {/* UPDATED: Navigation now uses NavLink for routing */}
          <nav className="sidebar-nav">
            <NavLink to="/underwriter-dashboard" className="nav-item">New Requests</NavLink>
            <NavLink to="/underwriter-dashboard/in-review" className="nav-item">In Review</NavLink>
            <NavLink to="/underwriter-dashboard/completed" className="nav-item">Completed</NavLink>
            <NavLink to="/underwriter-dashboard/settings" className="nav-item">Profile Settings</NavLink>
          </nav>
        </aside>

        <main className="main-content">
          {/* UPDATED: Main content is now controlled by Routes */}
          <Routes>
            <Route path="/" element={<WorkflowView />} />
            <Route path="/:status" element={<WorkflowView />} /> {/* Handles in-review and completed */}
            {/* You can add a placeholder for settings */}
            <Route path="/settings" element={<h2>Profile Settings</h2>} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default UnderwriterDashboard;
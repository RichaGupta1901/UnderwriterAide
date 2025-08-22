import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Import routing components from react-router-dom
import { Routes, Route, NavLink, useParams } from 'react-router-dom';
import './UnderwriterDashboard.css';

// Import the individual risk analysis components
import RiskAlerts from './RiskAlerts';
import GeoRiskMap from './GeoRiskMap';
import RiskScore from './RiskScore';
import ScenarioTesting from './ScenarioTesting';
import ComplianceAnalysis from './ComplianceAnalysis';

// All the logic for the main underwriting workflow is moved into its own component.
const WorkflowView = () => {
  const { status: routeStatus } = useParams(); // Gets the status from the URL
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);

  // State from HEAD version
  const [riskScore, setRiskScore] = useState(null);
  const [complianceResults, setComplianceResults] = useState(null);
  const [premiumAdjustment, setPremiumAdjustment] = useState(0);
  const [locationInput, setLocationInput] = useState('');
  const [isAssessing, setIsAssessing] = useState(false);
  const [isRiskAssessing, setIsRiskAssessing] = useState(false);
  const [complianceAnalysisData, setComplianceAnalysisData] = useState(null);
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
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:5000/api';
  const underwriterId = localStorage.getItem("userId");

  useEffect(() => {
    fetchUnderwriterApplications();
  }, [underwriterId]);

  const fetchUnderwriterApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/applications/underwriter/${underwriterId}`);
      if (response.data.success) {
        setApplications(response.data.applications);
      } else {
        setError('Failed to fetch applications: ' + response.data.message);
        console.error('Failed to fetch applications:', response.data.message);
      }
    } catch (err) {
      setError('An error occurred while fetching applications.');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectApplication = (application) => {
    setSelectedApplication(application);
    // Reset assessment states
    setRiskScore(null);
    setComplianceResults(null);
    setComplianceAnalysisData(null);
    setPremiumAdjustment(0);
    setLocationInput(application.personalInfo?.address || '');
    setError(null);
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
  };

  // --- Start of Mock/Simulated handlers from HEAD ---
  // In a real application, these would become API calls.

    const handleLocationRiskAssessment = async () => {
    if (!locationInput.trim()) {
      alert('Please enter a location first');
      return;
    }
    setIsAssessing(true);
    setError(null); // Clear previous errors

    try {
      // We run the location-specific and general finance checks in parallel
      const [locationResponse, financeResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/debug/test_city/${locationInput.trim()}`),
        axios.get(`${API_BASE_URL}/debug/finance`)
      ]);

      // Now, we populate the state with real data from the backend
      setAssessmentData({
        risk_score: locationResponse.data.hazard_count * 10, // Create a simple risk score based on hazard count
        risk_level: locationResponse.data.hazard_count > 3 ? 'High Risk' : 'Medium Risk',
        location: locationResponse.data.city,
        weather: locationResponse.data.weather, // The weather string from the backend
        hazard_alerts: locationResponse.data.hazards, // The hazards array from the backend
        financial_alerts: financeResponse.data.financial_alerts, // The finance alerts array
        financial_alert_count: financeResponse.data.financial_alerts_count,
        alert_count: locationResponse.data.hazard_count,
        total_alert_count: locationResponse.data.hazard_count + financeResponse.data.financial_alerts_count,
        last_updated: new Date().toISOString(),
      });

    } catch (err) {
      console.error("Error during location risk assessment:", err);
      setError("Failed to fetch risk data from the backend. Is the server running?");
      // Reset the data on failure
      setAssessmentData(prev => ({
        ...prev,
        location: 'New South Wales',
        weather: null,
        hazard_alerts: [],
        financial_alerts: []
      }));
    } finally {
      setIsAssessing(false); // Ensure the loading state is turned off
    }
  };

    // This helper function now dynamically translates the selected application's
  // data into the format the backend ML model expects.
  const mapApplicationToModelData = (application) => {
    // --- THIS IS THE CRUCIAL PART ---
    // We are now deriving values directly from the user-selected 'application' object.

    // Example: Extracting the state from an address string like "Sydney, NSW"
    const address = application.personalInfo?.address || '';
    const state = address.split(',')[1]?.trim() || 'Unknown';

    // Example: Calculating a premium if it's not directly available
    const annualPremium = (application.insuranceSpecificData?.coverageAmount * 0.01) || 0;

    // The function must return a flat object where keys match the backend model's columns.
    // NOTE: You must adjust these keys and transformations to match your exact data structure.
    return {
      // Personal Info
      'Customer Name': application.personalInfo?.fullName || 'Unknown',
      'Age_x': application.personalInfo?.age || 0,
      'State_x': state,
      'Email': application.personalInfo?.email || 'Unknown',
      'Phone': application.personalInfo?.phone || 'Unknown',

      // Insurance Info
      'Insurance Type_x': application.insuranceType || 'Unknown',
      'Annual Premium (AUD)_x': annualPremium,
      'Policy Number': application._id, // Using the application ID as a policy number
      'Product Tier': application.insuranceSpecificData?.tier || 'Standard',
      'Payment Frequency': 'Annually', // Example default if not present

      // Claim Info (assuming no prior claims for a new application)
      'Claim Amount (AUD)_x': 0,
      'Claim Status_x': 'No Claim',

      // Policy Dates (providing sensible defaults if missing)
      'Policy Start Date_x': new Date().toISOString().split('T')[0],
      'Policy End Date_x': new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],

      // The model expects many columns. We provide defaults for any others.
      // In a real scenario, you'd map all available data.
      'Age_y': 0,
      'State_y': 'Unknown',
      'Insurance Type_y': 'Unknown',
      'Annual Premium (AUD)_y': 0,
      'Claim Amount (AUD)_y': 0,
      'Claim Status_y': 'Unknown',
      'Policy Start Date_y': '1970-01-01',
      'Policy End Date_y': '1970-01-01',
      'Risk Score': 0,
      'Agent Name': 'System'
    };
  };

  const handleRunRiskAssessment = async () => {
    if (!selectedApplication) {
      alert("Please select an application first.");
      return;
    }
    setIsRiskAssessing(true);
    setError(null);
    setRiskScore(null);

    try {
      // 1. DYNAMICALLY prepare the data from the user's selected application
      const modelPayload = mapApplicationToModelData(selectedApplication);

      // 2. Call the backend with the payload specific to this application
      const response = await axios.post(`${API_BASE_URL}/predict_ml`, modelPayload);

      // 3. Update the state with the real, application-specific prediction
      setRiskScore(response.data);

    } catch (err) {
      console.error("Error running AI risk assessment:", err);
      // Provide more detailed error feedback if the server sends it
      const errorMessage = err.response?.data?.error || "Failed to get a prediction from the AI model.";
      setError(errorMessage);
      setRiskScore({ score: 'Error', level: 'Failed' });
    } finally {
      setIsRiskAssessing(false);
    }
  };

  const handleRunComplianceCheck = () => {
    setTimeout(() => {
      setComplianceResults({
        status: Math.random() > 0.3 ? 'Pass' : 'Warning',
        regulations: [{ name: 'APRA Prudential Standard CPS 220', status: 'Compliant' }, { name: 'Insurance Contracts Act', status: 'Compliant' }, { name: 'Privacy Act 1988', status: Math.random() > 0.3 ? 'Compliant' : 'Warning' }],
        notes: 'Application generally complies with regulatory requirements with minor concerns.'
      });
    }, 1500);
  };

  const handleComplianceAnalysis = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockComplianceData = {
            overall_compliance_score: Math.floor(Math.random() * 20) + 75,
            summary: { compliant: Math.floor(Math.random() * 8) + 5, partially_compliant: Math.floor(Math.random() * 3) + 1, non_compliant: Math.floor(Math.random() * 2) },
            compliance_results: [
                { requirement_id: "APRA CPS 220", requirement_text: "Risk Management Framework", status: "Compliant", risk_level: "Low", evidence: "Risk management policy clearly defined.", gaps_identified: [], recommendations: [], notes: "Well documented processes" },
                { requirement_id: "APRA CPS 232", requirement_text: "Business Continuity Management", status: "Partially Compliant", risk_level: "Medium", evidence: "Basic continuity plans identified", gaps_identified: ["Missing detailed recovery procedures"], recommendations: ["Implement comprehensive BCP testing"], notes: "Requires enhancement" }
            ],
            analysis_metadata: { timestamp: new Date().toISOString(), text_length: 15000, checklist_version: "2024.1", analysis_model: "APRA-GPT-4" }
        };
        setComplianceAnalysisData(mockComplianceData);
        resolve(mockComplianceData);
      }, 3000);
    });
  };

  const handleAdjustPremium = (adjustment) => setPremiumAdjustment(adjustment);

  const handleGenerateReport = () => {
    alert('Report generated and sent to applicant');
    setSelectedApplication(null); // Deselect after action
  };
  // --- End of Mock/Simulated handlers ---

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/applications/${applicationId}/status`, { status });
      if (response.data.success) {
        setApplications(prev => prev.map(app => app._id === applicationId ? { ...app, status, updatedAt: new Date().toISOString() } : app));
        if (selectedApplication?._id === applicationId) {
          setSelectedApplication(prev => ({ ...prev, status, updatedAt: new Date().toISOString() }));
        }
        alert(`Application status updated to: ${status}`);
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Failed to update application status');
    }
  };

  const calculateBasePremium = (application) => {
      if (!application || !application.insuranceSpecificData?.coverageAmount) return 0;
      const coverageAmount = application.insuranceSpecificData.coverageAmount;
      let basePremium = 0;
      switch (application.insuranceType) {
          case 'Life': basePremium = (coverageAmount * 0.001) / 12; break;
          case 'Health': basePremium = 400; break;
          case 'Home': basePremium = (coverageAmount * 0.0015) / 12; break;
          case 'Motor': basePremium = (coverageAmount * 0.02) / 12; break;
          case 'Business': basePremium = (coverageAmount * 0.002) / 12; break;
          default: basePremium = (coverageAmount * 0.001) / 12;
      }
      return Math.round(basePremium);
  };

  const calculateAdjustedPremium = (application, adjustment) => {
      const basePremium = calculateBasePremium(application);
      return Math.round(basePremium * (1 + adjustment / 100));
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
        case 'Completed':
        case 'Approved':
            return { background: '#c6f6d5', color: '#22543d' };
        case 'In Review':
        case 'Under Review':
            return { background: '#fed7d7', color: '#742a2a' };
        case 'Pending':
            return { background: '#fef5e7', color: '#744210' };
        case 'Rejected':
            return { background: '#fbb6ce', color: '#702459' };
        case 'Requires Info':
            return { background: '#dbeafe', color: '#1e40af' };
        default:
            return { background: '#e2e8f0', color: '#4a5568' };
    }
  };

  const renderApplicationsList = (apps, title) => {
    if (loading) return <p>Loading applications...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
      <div style={{ background: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#1a202c', fontSize: '20px' }}>{title}</h2>
        {apps.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {apps.map(app => (
              <div
                key={app._id}
                style={{
                  display: 'flex', alignItems: 'center', padding: '16px',
                  border: selectedApplication?._id === app._id ? '2px solid #4299e1' : '1px solid #e2e8f0',
                  borderRadius: '8px', background: selectedApplication?._id === app._id ? '#ebf8ff' : '#f8fafc',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onClick={() => handleSelectApplication(app)}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', color: '#1a202c', marginBottom: '4px' }}>
                    #{app._id.slice(-6)} - {app.personalInfo.fullName}
                  </div>
                  <div style={{ fontSize: '14px', color: '#4a5568', marginBottom: '4px' }}>
                    {app.insuranceType} Insurance • {new Date(app.createdAt).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '12px', color: '#718096' }}>
                    📍 {app.personalInfo.address}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px',
                    fontWeight: 'bold', ...getStatusBadgeStyle(app.status)
                  }}>
                    {app.status}
                  </span>
                  <button style={{
                    padding: '6px 12px', background: '#4299e1', color: 'white', border: 'none',
                    borderRadius: '4px', fontSize: '12px', cursor: 'pointer'
                  }}>
                    {app.status === 'Completed' ? 'View' : 'Review'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
            <p>No applications found for this category.</p>
          </div>
        )}
      </div>
    );
  };

  const renderApplicationDetails = () => {
    if (!selectedApplication) return null;
    const isCompleted = selectedApplication.status === 'Completed' || selectedApplication.status === 'Approved' || selectedApplication.status === 'Rejected';

    return (
      <div style={{ background: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ margin: 0, color: '#1a202c' }}>Application #{selectedApplication._id.slice(-8)}</h2>
          <span style={{
            padding: '6px 12px', borderRadius: '6px', fontSize: '14px',
            fontWeight: 'bold', ...getStatusBadgeStyle(selectedApplication.status)
          }}>
            {selectedApplication.status}
          </span>
        </div>

        {/* Application Information */}
        <div style={{ marginBottom: '24px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1a202c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📋 Application Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div><div style={{ fontSize: '12px', color: '#718096' }}>Applicant</div><div style={{ fontWeight: 'bold' }}>{selectedApplication.personalInfo?.fullName}</div></div>
                <div><div style={{ fontSize: '12px', color: '#718096' }}>Insurance Type</div><div style={{ fontWeight: 'bold' }}>{selectedApplication.insuranceType}</div></div>
                <div><div style={{ fontSize: '12px', color: '#718096' }}>Coverage Amount</div><div style={{ fontWeight: 'bold' }}>${selectedApplication.insuranceSpecificData?.coverageAmount?.toLocaleString()}</div></div>
                <div><div style={{ fontSize: '12px', color: '#718096' }}>Policy Term</div><div style={{ fontWeight: 'bold' }}>{selectedApplication.insuranceSpecificData?.policyTerm} years</div></div>
            </div>
            <div><div style={{ fontSize: '12px', color: '#718096' }}>Location</div><div style={{ fontWeight: 'bold' }}>📍 {selectedApplication.personalInfo?.address}</div></div>
        </div>

        {/* Location-Based Risk Analysis */}
        {!isCompleted && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1a202c' }}>🌍 Location-Based Risk Analysis</h3>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center', padding: '16px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #0284c7' }}>
              <input type="text" value={locationInput} onChange={(e) => setLocationInput(e.target.value)} placeholder="Enter location for risk assessment..." style={{ flex: 1, padding: '8px 12px', border: '1px solid #cbd5e0', borderRadius: '4px' }} />
              <button onClick={handleLocationRiskAssessment} disabled={isAssessing} style={{ padding: '8px 16px', background: isAssessing ? '#a0aec0' : '#0284c7', color: 'white', border: 'none', borderRadius: '4px', cursor: isAssessing ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                {isAssessing ? '🔄 Analyzing...' : '🔍 Analyze Location Risk'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              <RiskAlerts location={assessmentData.location} locationWeather={assessmentData.weather} hazardAlerts={assessmentData.hazard_alerts} financialAlerts={assessmentData.financial_alerts} alertCount={assessmentData.alert_count} financialAlertCount={assessmentData.financial_alert_count} lastUpdated={assessmentData.last_updated} />
              <GeoRiskMap />
              <RiskScore risk_score={assessmentData.risk_score} risk_level={assessmentData.risk_level} />
              <ScenarioTesting />
            </div>
            <ComplianceAnalysis complianceData={complianceAnalysisData} onRunCheck={handleComplianceAnalysis} />
          </div>
        )}

        {/* Assessment & Decision Tools */}
        {!isCompleted ? (
            <div>
              <h3 style={{ margin: '24px 0 16px 0', color: '#1a202c' }}>🛠️ Assessment & Decision Tools</h3>
              <div style={{ display: 'grid', gap: '20px' }}>
                {/* AI Risk Assessment, Compliance, Premium Calculator ... */}
                <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 12px 0' }}>🎯 AI Risk Assessment</h4>
                    {riskScore ? ( <div> ... </div> ) : ( <button onClick={handleRunRiskAssessment} style={{ padding: '8px 16px', background: '#4299e1', color: 'white', border: 'none', borderRadius: '4px' }}>🚀 Run AI Risk Assessment</button> )}
                </div>
                <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 12px 0' }}>📋 APRA Compliance Check</h4>
                    {complianceResults ? ( <div> ... </div> ) : ( <button onClick={handleRunComplianceCheck} style={{ padding: '8px 16px', background: '#4299e1', color: 'white', border: 'none', borderRadius: '4px' }}>🔍 Run Compliance Check</button> )}
                </div>
                <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 12px 0' }}>💵 Premium Calculator</h4>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Base Premium:</span><span style={{ fontWeight: 'bold' }}>${calculateBasePremium(selectedApplication)}/month</span></div>
                        <label>Risk-Based Adjustment (%)</label>
                        <input type="range" min="-30" max="50" value={premiumAdjustment} onChange={(e) => handleAdjustPremium(parseInt(e.target.value))} style={{ width: '100%' }} />
                        <div style={{ textAlign: 'center' }}>{premiumAdjustment > 0 ? `+${premiumAdjustment}%` : `${premiumAdjustment}%`}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}><span>Final Premium:</span><span>${calculateAdjustedPremium(selectedApplication, premiumAdjustment)}/month</span></div>
                    </div>
                </div>

                {/* Final Decision */}
                <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'center' }}>
                  <h4 style={{ margin: '0 0 12px 0' }}>✅ Final Decision</h4>
                  <p style={{ color: '#4a5568', marginBottom: '16px' }}>Update the application status based on your assessment.</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <button onClick={() => updateApplicationStatus(selectedApplication._id, 'Approved')} style={{ padding: '12px 24px', background: '#38a169', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Approve</button>
                    <button onClick={() => updateApplicationStatus(selectedApplication._id, 'Rejected')} style={{ padding: '12px 24px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Reject</button>
                    <button onClick={() => updateApplicationStatus(selectedApplication._id, 'Requires Info')} style={{ padding: '12px 24px', background: '#dd6b20', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Request Info</button>
                  </div>
                </div>
              </div>
            </div>
        ) : (
            <div style={{ padding: '20px', background: '#f0fff4', borderRadius: '8px', border: '1px solid #68d391' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#22543d' }}>✅ Assessment Completed</h3>
                <p>This application has been processed. Final Status: <strong>{selectedApplication.status}</strong></p>
                {/* Display final details if available */}
            </div>
        )}
      </div>
    );
  };

  // Filter applications based on the current route
  let listToRender;
  let title = '';
  const statusMap = {
    'in-review': ['In Review', 'Under Review', 'Requires Info'],
    'completed': ['Completed', 'Approved', 'Rejected'],
    'default': ['Pending']
  };

  const currentStatuses = statusMap[routeStatus] || statusMap['default'];
  listToRender = applications.filter(app => currentStatuses.includes(app.status));

  switch(routeStatus) {
    case 'in-review': title = 'Applications In Review'; break;
    case 'completed': title = 'Completed Applications'; break;
    default: title = 'New Application Requests';
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f7fafc' }}>
      <div style={{ width: '400px', padding: '20px', borderRight: '1px solid #e2e8f0', background: '#ffffff', overflowY: 'auto' }}>
        {renderApplicationsList(listToRender, title)}
      </div>
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        {selectedApplication ? renderApplicationDetails() : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ textAlign: 'center', color: '#718096' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
              <h3 style={{ margin: '0 0 8px 0', color: '#4a5568' }}>Select an Application</h3>
              <p>Choose an application from the list to view details and perform assessment.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


// Main Dashboard Component
const UnderwriterDashboard = ({ onLogout }) => {
  const navLinkStyle = ({ isActive }) => ({
    display: 'block', padding: '12px 16px', color: 'white', textDecoration: 'none',
    borderRadius: '4px', transition: 'background 0.2s',
    background: isActive ? '#4299e1' : 'transparent'
  });

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: '#1a202c', color: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>🤖 AI Underwriting Risk Assessment</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold' }}>Sarah Johnson</div>
            <div style={{ fontSize: '12px', color: '#a0aec0' }}>Senior Underwriter</div>
          </div>
          <button onClick={onLogout} style={{ padding: '6px 12px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Logout</button>
        </div>
      </header>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <aside style={{ width: '250px', background: '#2d3748', color: 'white', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Underwriter Portal</h2>
            <div style={{ padding: '16px', background: '#4a5568', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Sarah Johnson</h3>
              <div style={{ fontSize: '12px', color: '#cbd5e0' }}>Property & Auto Insurance</div>
            </div>
          </div>
          <nav style={{ padding: '0 20px', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <NavLink to="/underwriter-dashboard" end style={navLinkStyle}>📋 New Requests</NavLink>
              <NavLink to="/underwriter-dashboard/in-review" style={navLinkStyle}>🔍 In Review</NavLink>
              <NavLink to="/underwriter-dashboard/completed" style={navLinkStyle}>✅ Completed</NavLink>
              <NavLink to="/underwriter-dashboard/settings" style={navLinkStyle}>⚙️ Profile Settings</NavLink>
            </div>
          </nav>
        </aside>
        <main style={{ flex: 1, overflow: 'hidden' }}>
          <Routes>
            <Route path="/" element={<WorkflowView />} />
            <Route path="/:status" element={<WorkflowView />} />
            <Route path="/settings" element={
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: 'white', padding: '40px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '48px' }}>⚙️</div>
                  <h2>Profile Settings</h2>
                  <p>Settings panel coming soon...</p>
                </div>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default UnderwriterDashboard;
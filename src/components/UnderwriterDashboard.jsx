import React, { useState } from 'react';
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
  const { status } = useParams(); // Gets the status ('in-review', 'completed') from the URL
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [riskScore, setRiskScore] = useState(null);
  const [complianceResults, setComplianceResults] = useState(null);
  const [premiumAdjustment, setPremiumAdjustment] = useState(0);

  const [locationInput, setLocationInput] = useState('');
  const [isAssessing, setIsAssessing] = useState(false);
  const [complianceAnalysisData, setComplianceAnalysisData] = useState(null);

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

  // Mock data for applications
  const applications = [
    { id: 201, type: 'Life Insurance', applicant: 'Robert Chen', date: '2023-07-15', status: 'Pending', coverageAmount: 500000, policyTerm: 20, assetDetails: 'Term life insurance policy for family protection', location: 'Melbourne, VIC' },
    { id: 202, type: 'Property Insurance', applicant: 'Lisa Wong', date: '2023-07-18', status: 'In Review', coverageAmount: 750000, policyTerm: 5, assetDetails: 'Residential property in Sydney CBD, 3 bedroom apartment', location: 'Sydney, NSW' },
    { id: 203, type: 'Auto Insurance', applicant: 'James Miller', date: '2023-07-20', status: 'Pending', coverageAmount: 35000, policyTerm: 1, assetDetails: '2022 Tesla Model 3, primarily used for commuting', location: 'Brisbane, QLD' },
  ];
  const completedApplications = [
    { id: 195, type: 'Health Insurance', applicant: 'Emily Johnson', date: '2023-07-01', status: 'Completed', riskScore: 65, premium: 450, notes: 'Standard health coverage with dental add-on', location: 'Perth, WA' },
    { id: 196, type: 'Business Insurance', applicant: 'Mark Davis', date: '2023-07-05', status: 'Completed', riskScore: 72, premium: 1200, notes: 'Small business liability coverage with cyber protection', location: 'Adelaide, SA' },
  ];

  const handleSelectApplication = (application) => {
    setSelectedApplication(application);
    setRiskScore(null);
    setComplianceResults(null);
    setComplianceAnalysisData(null);
    setPremiumAdjustment(0);
    setLocationInput(application.location || '');
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

  const handleLocationRiskAssessment = async () => {
    if (!locationInput.trim()) {
      alert('Please enter a location first');
      return;
    }
    setIsAssessing(true);
    // Simulate API call to assess location-based risks
    setTimeout(() => {
      const mockAssessment = {
        risk_score: Math.floor(Math.random() * 40) + 40,
        risk_level: Math.random() > 0.5 ? 'Medium Risk' : 'Low Risk',
        location: locationInput,
        weather: {
          description: 'Clear skies, low precipitation risk',
          temperature: '22°C',
          conditions: 'Stable'
        },
        hazard_alerts: [
          'Bushfire season approaching - elevated risk',
          'Flood zone classification: Low risk',
        ],
        financial_alerts: [
          'Property values stable in area',
          'Insurance claims in region below average'
        ],
        financial_alert_count: 2,
        alert_count: 2,
        last_updated: new Date().toISOString()
      };
      setAssessmentData({
        ...mockAssessment,
        total_alert_count: mockAssessment.alert_count + mockAssessment.financial_alert_count
      });
      setIsAssessing(false);
    }, 2000);
  };

  const handleRunRiskAssessment = () => {
    setTimeout(() => {
      const mockRiskScore = {
        overall: Math.floor(Math.random() * 30) + 50,
        breakdown: {
          financial: Math.floor(Math.random() * 30) + 50,
          operational: Math.floor(Math.random() * 30) + 50,
          compliance: Math.floor(Math.random() * 30) + 50,
          market: Math.floor(Math.random() * 30) + 50,
        },
        factors: [
          'Asset location in high-risk area',
          'Limited financial history',
          'Previous claims history',
        ]
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

  const handleComplianceAnalysis = async (file) => {
    // Simulate compliance analysis API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockComplianceData = {
          overall_compliance_score: Math.floor(Math.random() * 20) + 75,
          summary: {
            compliant: Math.floor(Math.random() * 8) + 5,
            partially_compliant: Math.floor(Math.random() * 3) + 1,
            non_compliant: Math.floor(Math.random() * 2)
          },
          compliance_results: [
            {
              requirement_id: "APRA CPS 220",
              requirement_text: "Risk Management Framework Requirements",
              status: "Compliant",
              risk_level: "Low",
              evidence: "Risk management policy clearly defined with governance structure",
              gaps_identified: [],
              recommendations: [],
              notes: "Well documented risk management processes"
            },
            {
              requirement_id: "APRA CPS 232",
              requirement_text: "Business Continuity Management",
              status: "Partially Compliant",
              risk_level: "Medium",
              evidence: "Basic continuity plans identified",
              gaps_identified: ["Missing detailed recovery procedures", "No testing schedule defined"],
              recommendations: ["Implement comprehensive BCP testing", "Define clear RTO/RPO metrics"],
              notes: "Requires enhancement of existing procedures"
            }
          ],
          analysis_metadata: {
            timestamp: new Date().toISOString(),
            text_length: 15000,
            checklist_version: "2024.1",
            analysis_model: "APRA-GPT-4"
          }
        };
        setComplianceAnalysisData(mockComplianceData);
        resolve(mockComplianceData);
      }, 3000);
    });
  };

  const handleAdjustPremium = (adjustment) => setPremiumAdjustment(adjustment);

  const handleGenerateReport = () => {
    alert('Report generated and sent to applicant');
    setSelectedApplication(null);
    setRiskScore(null);
    setComplianceResults(null);
    setPremiumAdjustment(0);
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
      <div style={{ background: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#1a202c', fontSize: '20px' }}>{title}</h2>
        {apps.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {apps.map(app => (
              <div
                key={app.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  border: selectedApplication?.id === app.id ? '2px solid #4299e1' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  background: selectedApplication?.id === app.id ? '#ebf8ff' : '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => handleSelectApplication(app)}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', color: '#1a202c', marginBottom: '4px' }}>
                    #{app.id} - {app.applicant}
                  </div>
                  <div style={{ fontSize: '14px', color: '#4a5568', marginBottom: '4px' }}>
                    {app.type} • {app.date}
                  </div>
                  <div style={{ fontSize: '12px', color: '#718096' }}>
                    📍 {app.location}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    background: app.status === 'Completed' ? '#c6f6d5' : app.status === 'In Review' ? '#fed7d7' : '#fef5e7',
                    color: app.status === 'Completed' ? '#22543d' : app.status === 'In Review' ? '#742a2a' : '#744210'
                  }}>
                    {app.status}
                  </span>
                  <button style={{
                    padding: '6px 12px',
                    background: '#4299e1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}>
                    {app.status === 'Completed' ? 'View' : 'Review'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
            <p>No applications available.</p>
          </div>
        )}
      </div>
    );
  };

  const renderApplicationDetails = () => {
    if (!selectedApplication) return null;
    const isCompleted = selectedApplication.status === 'Completed';

    return (
      <div style={{ background: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ margin: 0, color: '#1a202c' }}>Application #{selectedApplication.id}</h2>
          <span style={{
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 'bold',
            background: selectedApplication.status === 'Completed' ? '#c6f6d5' : selectedApplication.status === 'In Review' ? '#fed7d7' : '#fef5e7',
            color: selectedApplication.status === 'Completed' ? '#22543d' : selectedApplication.status === 'In Review' ? '#742a2a' : '#744210'
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
            <div>
              <div style={{ fontSize: '12px', color: '#718096', textTransform: 'uppercase', letterSpacing: '1px' }}>Applicant</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a202c' }}>{selectedApplication.applicant}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#718096', textTransform: 'uppercase', letterSpacing: '1px' }}>Insurance Type</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a202c' }}>{selectedApplication.type}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#718096', textTransform: 'uppercase', letterSpacing: '1px' }}>Coverage Amount</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a202c' }}>${selectedApplication.coverageAmount?.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#718096', textTransform: 'uppercase', letterSpacing: '1px' }}>Policy Term</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a202c' }}>{selectedApplication.policyTerm} years</div>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: '#718096', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Asset Details</div>
            <div style={{ color: '#4a5568' }}>{selectedApplication.assetDetails}</div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#718096', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Location</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a202c', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📍 {selectedApplication.location}
            </div>
          </div>
        </div>

        {/* Location-Based Risk Analysis */}
        {!isCompleted && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1a202c', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🌍 Location-Based Risk Analysis
            </h3>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center', padding: '16px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #0284c7' }}>
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="Enter location for risk assessment..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #cbd5e0',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
              <button
                onClick={handleLocationRiskAssessment}
                disabled={isAssessing}
                style={{
                  padding: '8px 16px',
                  background: isAssessing ? '#a0aec0' : '#0284c7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isAssessing ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {isAssessing ? '🔄 Analyzing...' : '🔍 Analyze Location Risk'}
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              <RiskAlerts
                location={assessmentData.location}
                locationWeather={assessmentData.weather}
                hazardAlerts={assessmentData.hazard_alerts}
                financialAlerts={assessmentData.financial_alerts}
                alertCount={assessmentData.alert_count}
                financialAlertCount={assessmentData.financial_alert_count}
                lastUpdated={assessmentData.last_updated}
              />
              <GeoRiskMap />
              <RiskScore
                risk_score={assessmentData.risk_score}
                risk_level={assessmentData.risk_level}
              />
              <ScenarioTesting />
            </div>

            {/* Add ComplianceAnalysis component */}
            <ComplianceAnalysis
              complianceData={complianceAnalysisData}
              onRunCheck={handleComplianceAnalysis}
            />
          </div>
        )}

        {/* Completed Application Results */}
        {isCompleted ? (
          <div style={{ padding: '20px', background: '#f0fff4', borderRadius: '8px', border: '1px solid #68d391' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#22543d', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ✅ Assessment Results
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#22543d', textTransform: 'uppercase', letterSpacing: '1px' }}>Risk Score</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#22543d' }}>{selectedApplication.riskScore}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#22543d', textTransform: 'uppercase', letterSpacing: '1px' }}>Monthly Premium</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#22543d' }}>${selectedApplication.premium}</div>
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '12px', color: '#22543d', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Assessment Notes</div>
              <div style={{ color: '#276749' }}>{selectedApplication.notes}</div>
            </div>
          </div>
        ) : (
          /* Traditional Assessment Tools */
          <div>
            <h3 style={{ margin: '0 0 16px 0', color: '#1a202c', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🛠️ Traditional Assessment Tools
            </h3>

            <div style={{ display: 'grid', gap: '20px' }}>
              {/* Risk Assessment */}
              <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#1a202c' }}>🎯 AI Risk Assessment</h4>
                {riskScore ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: riskScore.overall > 70 ? '#fed7d7' : riskScore.overall > 50 ? '#fef5e7' : '#c6f6d5',
                        color: riskScore.overall > 70 ? '#742a2a' : riskScore.overall > 50 ? '#744210' : '#22543d',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        margin: '0 auto'
                      }}>
                        {riskScore.overall}
                      </div>
                      <div style={{ marginTop: '8px', fontSize: '14px', color: '#4a5568' }}>
                        {riskScore.overall > 70 ? 'High Risk' : riskScore.overall > 50 ? 'Medium Risk' : 'Low Risk'}
                      </div>
                    </div>
                    <div>
                      <h5 style={{ margin: '0 0 8px 0', color: '#1a202c' }}>Risk Breakdown</h5>
                      {Object.entries(riskScore.breakdown).map(([key, value]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <span style={{ width: '80px', fontSize: '12px', textTransform: 'capitalize' }}>{key}</span>
                          <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px' }}>
                            <div style={{
                              width: `${value}%`,
                              height: '100%',
                              background: value > 70 ? '#e53e3e' : value > 50 ? '#dd6b20' : '#38a169',
                              borderRadius: '4px'
                            }}></div>
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleRunRiskAssessment}
                    style={{
                      padding: '8px 16px',
                      background: '#4299e1',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    🚀 Run AI Risk Assessment
                  </button>
                )}
              </div>

              {/* Compliance Check */}
              <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#1a202c' }}>📋 APRA Compliance Check</h4>
                {complianceResults ? (
                  <div>
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        background: complianceResults.status === 'Pass' ? '#c6f6d5' : '#fed7d7',
                        color: complianceResults.status === 'Pass' ? '#22543d' : '#742a2a'
                      }}>
                        {complianceResults.status}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {complianceResults.regulations.map((reg, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                          <span>{reg.name}</span>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontSize: '11px',
                            background: reg.status === 'Compliant' ? '#c6f6d5' : '#fed7d7',
                            color: reg.status === 'Compliant' ? '#22543d' : '#742a2a'
                          }}>
                            {reg.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleRunComplianceCheck}
                    style={{
                      padding: '8px 16px',
                      background: '#4299e1',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    🔍 Run Compliance Check
                  </button>
                )}
              </div>

              {/* Premium Calculator */}
              <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#1a202c' }}>💵 Premium Calculator</h4>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Base Premium:</span>
                    <span style={{ fontWeight: 'bold' }}>${calculateBasePremium(selectedApplication)}/month</span>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Risk-Based Adjustment (%)</label>
                    <input
                      type="range"
                      min="-30"
                      max="50"
                      value={premiumAdjustment}
                      onChange={(e) => handleAdjustPremium(parseInt(e.target.value))}
                      style={{ width: '100%' }}
                    />
                    <div style={{ textAlign: 'center', fontSize: '12px', color: '#4a5568' }}>
                      {premiumAdjustment > 0 ? `+${premiumAdjustment}%` : `${premiumAdjustment}%`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                    <span>Final Premium:</span>
                    <span>${calculateAdjustedPremium(selectedApplication, premiumAdjustment)}/month</span>
                  </div>
                </div>
              </div>

              {/* Generate Report */}
              <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'center' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#1a202c' }}>📊 Generate Assessment Report</h4>
                <p style={{ color: '#4a5568', marginBottom: '16px', fontSize: '14px' }}>
                  Generate a comprehensive underwriting report based on your assessment.
                </p>
                <button
                  onClick={handleGenerateReport}
                  disabled={!riskScore || !complianceResults}
                  style={{
                    padding: '12px 24px',
                    background: (!riskScore || !complianceResults) ? '#a0aec0' : '#38a169',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: (!riskScore || !complianceResults) ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  📄 Generate & Send Report
                </button>
                {(!riskScore || !complianceResults) && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#e53e3e' }}>
                    Complete risk assessment and compliance check first
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Determine which list to render based on URL
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
    default:
      listToRender = applications.filter(app => app.status === 'Pending');
      title = 'New Application Requests';
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f7fafc' }}>
      {/* Applications List Panel */}
      <div style={{ width: '400px', padding: '20px', borderRight: '1px solid #e2e8f0', background: '#ffffff', overflowY: 'auto' }}>
        {renderApplicationsList(listToRender, title)}
      </div>

      {/* Details Panel */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        {selectedApplication ? renderApplicationDetails() : (
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
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
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        background: '#1a202c',
        color: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
          🤖 AI Underwriting Risk Assessment
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold' }}>Sarah Johnson</div>
            <div style={{ fontSize: '12px', color: '#a0aec0' }}>Senior Underwriter</div>
          </div>
          <button
            onClick={onLogout}
            style={{
              padding: '6px 12px',
              background: '#e53e3e',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <aside style={{
          width: '250px',
          background: '#2d3748',
          color: 'white',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ padding: '20px' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Underwriter Portal</h2>
            <div style={{
              padding: '16px',
              background: '#4a5568',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Sarah Johnson</h3>
              <div style={{ fontSize: '12px', color: '#cbd5e0' }}>
                <div>Property & Auto Insurance</div>
                <div>8 years experience</div>
                <div>Europe Region</div>
              </div>
            </div>
          </div>

          <nav style={{ padding: '0 20px', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <NavLink
                to="/underwriter-dashboard"
                end
                style={({ isActive }) => ({
                  display: 'block',
                  padding: '12px 16px',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  transition: 'background 0.2s',
                  background: isActive ? '#4299e1' : 'transparent'
                })}
              >
                📋 New Requests
              </NavLink>
              <NavLink
                to="/underwriter-dashboard/in-review"
                style={({ isActive }) => ({
                  display: 'block',
                  padding: '12px 16px',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  transition: 'background 0.2s',
                  background: isActive ? '#4299e1' : 'transparent'
                })}
              >
                🔍 In Review
              </NavLink>
              <NavLink
                to="/underwriter-dashboard/completed"
                style={({ isActive }) => ({
                  display: 'block',
                  padding: '12px 16px',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  transition: 'background 0.2s',
                  background: isActive ? '#4299e1' : 'transparent'
                })}
              >
                ✅ Completed
              </NavLink>
              <NavLink
                to="/underwriter-dashboard/settings"
                style={({ isActive }) => ({
                  display: 'block',
                  padding: '12px 16px',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  transition: 'background 0.2s',
                  background: isActive ? '#4299e1' : 'transparent'
                })}
              >
                ⚙️ Profile Settings
              </NavLink>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, overflow: 'hidden' }}>
          <Routes>
            <Route path="/" element={<WorkflowView />} />
            <Route path="/:status" element={<WorkflowView />} />
            <Route path="/settings" element={
              <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f7fafc'
              }}>
                <div style={{
                  background: 'white',
                  padding: '40px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚙️</div>
                  <h2 style={{ margin: '0 0 8px 0', color: '#1a202c' }}>Profile Settings</h2>
                  <p style={{ color: '#4a5568' }}>Settings panel coming soon...</p>
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
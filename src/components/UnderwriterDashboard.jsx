import React, { useState, useEffect } from 'react';
// Import routing components from react-router-dom
import { Routes, Route, NavLink, useParams } from 'react-router-dom';

// Static data for Australian cities
const australianCities = {
  "NT": {"city": "Darwin", "lat": -12.4634, "lon": 130.8456},
  "ACT": {"city": "Canberra", "lat": -35.2809, "lon": 149.1300},
  "TAS": {"city": "Hobart", "lat": -42.8821, "lon": 147.3272},
  "SA": {"city": "Adelaide", "lat": -34.9285, "lon": 138.6007},
  "WA": {"city": "Perth", "lat": -31.9505, "lon": 115.8605},
  "QLD": {"city": "Brisbane", "lat": -27.4698, "lon": 153.0251},
  "VIC": {"city": "Melbourne", "lat": -37.8136, "lon": 144.9631},
  "NSW": {"city": "Sydney", "lat": -33.8688, "lon": 151.2093}
};

// Static risk alerts data for cities
const cityRiskAlerts = {
  "Sydney": [
    { id: "syd-1", title: "Coastal Flooding Risk", summary: "High tide and storm surge potential in harbor areas.", date: new Date().toISOString(), severity: "High" },
    { id: "syd-2", title: "Bushfire Watch", summary: "Elevated fire danger in western suburbs during summer.", date: new Date().toISOString(), severity: "Medium" }
  ],
  "Melbourne": [
    { id: "mel-1", title: "Hailstorm Alert", summary: "Severe hail expected in northern suburbs.", date: new Date().toISOString(), severity: "High" },
    { id: "mel-2", title: "Flash Flood Risk", summary: "Heavy rainfall may cause localized flooding.", date: new Date().toISOString(), severity: "Medium" },
    { id: "mel-3", title: "Wind Damage Warning", summary: "Strong winds up to 90km/h forecast.", date: new Date().toISOString(), severity: "Medium" }
  ],
  "Brisbane": [
    { id: "bne-1", title: "Cyclone Watch", summary: "Tropical cyclone activity possible during season.", date: new Date().toISOString(), severity: "High" },
    { id: "bne-2", title: "River Flooding", summary: "Brisbane River flood risk during heavy rainfall.", date: new Date().toISOString(), severity: "High" },
    { id: "bne-3", title: "Storm Surge Alert", summary: "King tide and storm surge combination risk.", date: new Date().toISOString(), severity: "Medium" }
  ],
  "Perth": [
    { id: "per-1", title: "Bushfire Risk", summary: "Extreme fire weather conditions in hills areas.", date: new Date().toISOString(), severity: "High" },
    { id: "per-2", title: "Severe Storm Warning", summary: "Damaging winds and large hail possible.", date: new Date().toISOString(), severity: "Medium" }
  ],
  "Adelaide": [
    { id: "adl-1", title: "Heat Wave Warning", summary: "Extreme temperatures above 40°C forecast.", date: new Date().toISOString(), severity: "High" },
    { id: "adl-2", title: "Bushfire Alert", summary: "Total fire ban conditions in Adelaide Hills.", date: new Date().toISOString(), severity: "Medium" }
  ],
  "Hobart": [
    { id: "hob-1", title: "Strong Wind Advisory", summary: "Gale force winds expected across region.", date: new Date().toISOString(), severity: "Medium" }
  ],
  "Darwin": [
    { id: "dar-1", title: "Tropical Cyclone Risk", summary: "Active cyclone season with potential impacts.", date: new Date().toISOString(), severity: "High" },
    { id: "dar-2", title: "Monsoon Flooding", summary: "Heavy wet season rainfall causing flooding.", date: new Date().toISOString(), severity: "High" },
    { id: "dar-3", title: "Storm Surge Warning", summary: "Coastal inundation during high tides.", date: new Date().toISOString(), severity: "Medium" }
  ],
  "Canberra": [
    { id: "can-1", title: "Frost Damage Risk", summary: "Severe frost conditions affecting properties.", date: new Date().toISOString(), severity: "Low" },
    { id: "can-2", title: "Bushfire Watch", summary: "Elevated fire danger in surrounding areas.", date: new Date().toISOString(), severity: "Medium" }
  ]
};

// Static financial alerts
const staticFinancialAlerts = [
  { id: "fin-1", title: "Interest Rate Rise", summary: "RBA cash rate increased by 0.25%", date: new Date().toISOString(), severity: "Medium" },
  { id: "fin-2", title: "Insurance Premium Inflation", summary: "Industry-wide premium increases of 8-12%", date: new Date().toISOString(), severity: "High" },
  { id: "fin-3", title: "Market Volatility", summary: "ASX experiencing increased volatility", date: new Date().toISOString(), severity: "Low" }
];

// Static mock applications data
const mockApplications = [
  {
    _id: "app001",
    status: "Pending",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    personalInfo: {
      fullName: "John Smith",
      age: 35,
      email: "john.smith@gmail.com",
      phone: "0412 345 678",
      address: "123 Harbor Street, Sydney, NSW"
    },
    insuranceType: "Home",
    insuranceSpecificData: {
      coverageAmount: 850000,
      policyTerm: 1,
      tier: "Premium"
    }
  },
  {
    _id: "app002",
    status: "In Review",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    personalInfo: {
      fullName: "Nisha Chawala",
      age: 28,
      email: "nisha.c@gmail.com",
      phone: "0423 456 789",
      address: "45 Collins Street, Melbourne, VIC"
    },
    insuranceType: "Motor",
    insuranceSpecificData: {
      coverageAmount: 45000,
      policyTerm: 1,
      tier: "Standard"
    }
  },
  {
    _id: "app003",
    status: "Completed",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    personalInfo: {
      fullName: "Michael Brown",
      age: 42,
      email: "m.brown@email.com",
      phone: "0434 567 890",
      address: "78 Queen Street, Brisbane, QLD"
    },
    insuranceType: "Life",
    insuranceSpecificData: {
      coverageAmount: 500000,
      policyTerm: 20,
      tier: "Standard"
    }
  }
];

// Self-contained Risk Alerts Component
const RiskAlertsComponent = ({ location, locationWeather, hazardAlerts, financialAlerts, alertCount, financialAlertCount, lastUpdated }) => {
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: 'white' }}>
      <h4 style={{ margin: '0 0 12px 0', color: '#1a202c' }}>🚨 Risk Alerts</h4>
      <div style={{ marginBottom: '12px', fontSize: '14px', color: '#4a5568' }}>
        <div><strong>Location:</strong> {location || 'Not specified'}</div>
        <div><strong>Weather:</strong> {locationWeather || 'N/A'}</div>
        <div><strong>Total Alerts:</strong> {(alertCount || 0) + (financialAlertCount || 0)}</div>
      </div>

      {hazardAlerts && hazardAlerts.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h5 style={{ margin: '0 0 8px 0', color: '#e53e3e' }}>Hazard Alerts ({hazardAlerts.length})</h5>
          {hazardAlerts.slice(0, 3).map(alert => (
            <div key={alert.id} style={{
              padding: '8px',
              margin: '4px 0',
              border: '1px solid #fed7d7',
              borderRadius: '4px',
              background: '#fef5e7',
              fontSize: '12px'
            }}>
              <div style={{ fontWeight: 'bold', color: '#744210' }}>{alert.title}</div>
              <div style={{ color: '#744210' }}>{alert.summary}</div>
            </div>
          ))}
        </div>
      )}

      {financialAlerts && financialAlerts.length > 0 && (
        <div>
          <h5 style={{ margin: '0 0 8px 0', color: '#3182ce' }}>Financial Alerts ({financialAlerts.length})</h5>
          {financialAlerts.slice(0, 2).map(alert => (
            <div key={alert.id} style={{
              padding: '8px',
              margin: '4px 0',
              border: '1px solid #bee3f8',
              borderRadius: '4px',
              background: '#ebf8ff',
              fontSize: '12px'
            }}>
              <div style={{ fontWeight: 'bold', color: '#2c5282' }}>{alert.title}</div>
              <div style={{ color: '#2c5282' }}>{alert.summary}</div>
            </div>
          ))}
        </div>
      )}

      {lastUpdated && (
        <div style={{ marginTop: '12px', fontSize: '10px', color: '#718096', fontStyle: 'italic' }}>
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  );
};

// Self-contained Risk Score Component
const RiskScoreComponent = ({ risk_score, risk_level }) => {
  const getScoreColor = (score) => {
    if (score >= 70) return '#e53e3e';
    if (score >= 40) return '#dd6b20';
    return '#38a169';
  };

  const getScoreBackground = (score) => {
    if (score >= 70) return '#fed7d7';
    if (score >= 40) return '#fef5e7';
    return '#c6f6d5';
  };

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: 'white' }}>
      <h4 style={{ margin: '0 0 16px 0', color: '#1a202c' }}>📊 Risk Score</h4>
      <div style={{ textAlign: 'center' }}>
        {risk_score !== null ? (
          <>
            <div style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: getScoreColor(risk_score),
              marginBottom: '8px'
            }}>
              {risk_score}
            </div>
            <div style={{
              padding: '6px 12px',
              borderRadius: '20px',
              background: getScoreBackground(risk_score),
              color: getScoreColor(risk_score),
              fontWeight: 'bold',
              fontSize: '14px',
              display: 'inline-block'
            }}>
              {risk_level}
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              background: '#e2e8f0',
              borderRadius: '4px',
              marginTop: '16px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${risk_score}%`,
                height: '100%',
                background: getScoreColor(risk_score),
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </>
        ) : (
          <div style={{ color: '#718096', fontSize: '16px' }}>
            No risk score calculated
          </div>
        )}
      </div>
    </div>
  );
};

// Self-contained Scenario Testing Component
const ScenarioTestingComponent = ({ onScenarioChange, currentRiskScore }) => {
    const [selectedScenario, setSelectedScenario] = useState('');
    const [intensity, setIntensity] = useState(50);

    const scenarios = [
      { name: 'Major Flood Event', baseImpact: 25, description: 'Widespread flooding affecting properties' },
      { name: 'Category 3 Cyclone', baseImpact: 35, description: 'Severe wind and storm surge damage' },
      { name: 'Severe Bushfire', baseImpact: 30, description: 'High fire risk with property threats' },
      { name: 'Hailstorm Damage', baseImpact: 20, description: 'Large hail causing structural damage' },
      { name: 'Market Crash Impact', baseImpact: 15, description: 'Economic downturn affecting claims' },
      { name: 'Extreme Heat Wave', baseImpact: 18, description: 'Infrastructure stress and health risks' },
      { name: 'Severe Storm System', baseImpact: 22, description: 'Damaging winds and flash flooding' }
    ];

    const handleScenarioChangeInternal = (scenarioName) => {
      setSelectedScenario(scenarioName);
      if (scenarioName && onScenarioChange) {
        const scenario = scenarios.find(s => s.name === scenarioName);
        const impact = Math.round(scenario.baseImpact * (intensity / 100));
        onScenarioChange({
          scenario: scenarioName,
          impact: impact,
          intensity: intensity,
          description: scenario.description
        });
      } else if (onScenarioChange) {
        onScenarioChange(null);
      }
    };

    const handleIntensityChange = (newIntensity) => {
      setIntensity(newIntensity);
      if (selectedScenario && onScenarioChange) {
        const scenario = scenarios.find(s => s.name === selectedScenario);
        const impact = Math.round(scenario.baseImpact * (newIntensity / 100));
        onScenarioChange({
          scenario: selectedScenario,
          impact: impact,
          intensity: newIntensity,
          description: scenario.description
        });
      }
    };

    return (
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: 'white' }}>
        <h4 style={{ margin: '0 0 16px 0', color: '#1a202c' }}>🧪 Dynamic Scenario Testing</h4>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>Test Scenario:</label>
          <select
            value={selectedScenario}
            onChange={(e) => handleScenarioChangeInternal(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #cbd5e0',
              borderRadius: '4px',
              background: 'white'
            }}
          >
            <option value="">No scenario (baseline)</option>
            {scenarios.map(scenario => (
              <option key={scenario.name} value={scenario.name}>{scenario.name}</option>
            ))}
          </select>
        </div>

        {selectedScenario && (
          <>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>
                Scenario Intensity: {intensity}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={intensity}
                onChange={(e) => handleIntensityChange(parseInt(e.target.value))}
                style={{ width: '100%', marginBottom: '8px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#718096' }}>
                <span>Minor (10%)</span>
                <span>Moderate (50%)</span>
                <span>Severe (100%)</span>
              </div>
            </div>

            <div style={{
              padding: '12px',
              background: '#f0f9ff',
              borderRadius: '6px',
              border: '1px solid #0284c7',
              fontSize: '14px'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#0369a1' }}>
                Active Scenario: {selectedScenario}
              </div>
              <div style={{ fontSize: '12px', color: '#0369a1', marginBottom: '8px' }}>
                {scenarios.find(s => s.name === selectedScenario)?.description}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#0369a1' }}>Risk Impact:</span>
                <span style={{ fontWeight: 'bold', color: '#dc2626' }}>
                  +{Math.round(scenarios.find(s => s.name === selectedScenario)?.baseImpact * (intensity / 100))} points
                </span>
              </div>
              {currentRiskScore !== null && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#059669' }}>
                  New Risk Score: {Math.min(100, currentRiskScore + Math.round(scenarios.find(s => s.name === selectedScenario)?.baseImpact * (intensity / 100)))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
};

// Self-contained Compliance Analysis Component
const ComplianceAnalysisComponent = ({ complianceData, onRunCheck }) => {
  const [isRunning, setIsRunning] = useState(false);

  const handleRunCheck = async () => {
    setIsRunning(true);
    await onRunCheck();
    setIsRunning(false);
  };

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: 'white', marginTop: '16px' }}>
      <h4 style={{ margin: '0 0 16px 0', color: '#1a202c' }}>📋 Compliance Analysis</h4>

      {!complianceData ? (
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleRunCheck}
            disabled={isRunning}
            style={{
              padding: '12px 24px',
              background: isRunning ? '#a0aec0' : '#4299e1',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {isRunning ? '🔄 Analyzing...' : '🔍 Run APRA Compliance Analysis'}
          </button>
        </div>
      ) : (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            padding: '12px',
            background: '#f0fff4',
            borderRadius: '6px',
            border: '1px solid #68d391'
          }}>
            <span style={{ fontWeight: 'bold' }}>Overall Compliance Score</span>
            <span style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#22543d'
            }}>
              {complianceData.overall_compliance_score}%
            </span>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h5 style={{ margin: '0 0 8px 0' }}>Summary</h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '12px' }}>
              <div style={{ textAlign: 'center', padding: '8px', background: '#c6f6d5', borderRadius: '4px' }}>
                <div style={{ fontWeight: 'bold', color: '#22543d' }}>{complianceData.summary.compliant}</div>
                <div style={{ color: '#22543d' }}>Compliant</div>
              </div>
              <div style={{ textAlign: 'center', padding: '8px', background: '#fef5e7', borderRadius: '4px' }}>
                <div style={{ fontWeight: 'bold', color: '#744210' }}>{complianceData.summary.partially_compliant}</div>
                <div style={{ color: '#744210' }}>Partial</div>
              </div>
              <div style={{ textAlign: 'center', padding: '8px', background: '#fed7d7', borderRadius: '4px' }}>
                <div style={{ fontWeight: 'bold', color: '#742a2a' }}>{complianceData.summary.non_compliant}</div>
                <div style={{ color: '#742a2a' }}>Non-Compliant</div>
              </div>
            </div>
          </div>

          <div>
            <h5 style={{ margin: '0 0 8px 0' }}>Key Requirements</h5>
            {complianceData.compliance_results.map((result, index) => (
              <div key={index} style={{
                padding: '8px',
                margin: '4px 0',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                <div style={{ fontWeight: 'bold' }}>{result.requirement_id}</div>
                <div style={{ color: '#4a5568' }}>{result.requirement_text}</div>
                <div style={{
                  display: 'inline-block',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '10px',
                  marginTop: '4px',
                  background: result.status === 'Compliant' ? '#c6f6d5' : '#fef5e7',
                  color: result.status === 'Compliant' ? '#22543d' : '#744210'
                }}>
                  {result.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


// All the logic for the main underwriting workflow
const WorkflowView = () => {
  const { status: routeStatus } = useParams();
  const [applications, setApplications] = useState(mockApplications);
  const [loading, setLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [riskScore, setRiskScore] = useState(null);
  const [complianceResults, setComplianceResults] = useState(null);
  const [premiumAdjustment, setPremiumAdjustment] = useState(0);
  const [locationInput, setLocationInput] = useState('');
  const [isAssessing, setIsAssessing] = useState(false);
  const [isRiskAssessing, setIsRiskAssessing] = useState(false);
  const [complianceAnalysisData, setComplianceAnalysisData] = useState(null);
  const [scenarioImpact, setScenarioImpact] = useState(null); // New state for scenario testing
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

  // Handle scenario changes from the scenario testing component
  const handleScenarioChange = (scenario) => {
    setScenarioImpact(scenario);

    // Auto-update premium adjustment based on scenario impact
    if (scenario) {
      const scenarioAdjustment = Math.round(scenario.impact * 0.5); // Convert risk points to percentage
      setPremiumAdjustment(prev => Math.max(-30, Math.min(50, prev + scenarioAdjustment)));
    } else {
      // Reset to base adjustment when no scenario
      setPremiumAdjustment(0);
    }
  };

  const performStaticRiskAssessment = (application) => {
    const address = application.personalInfo?.address || '';
    const addressParts = address.split(',');
    const stateAbbr = addressParts[addressParts.length - 1]?.trim();
    const cityName = addressParts[addressParts.length - 2]?.trim();

    // Find the city from our Australian cities data
    const cityInfo = australianCities[stateAbbr];
    const applicantCity = cityInfo?.city || cityName || "Sydney";

    // Get static risk alerts for the city
    const alerts = cityRiskAlerts[applicantCity] || [
      { id: "default-1", title: "No major alerts", summary: "No active risk alerts for this city.", date: new Date().toISOString(), severity: "Minor" }
    ];

    const hazardCount = alerts.length;
    const computedRiskScore = Math.min(
      100,
      hazardCount * 20 + (application.insuranceSpecificData?.coverageAmount ? Math.round(application.insuranceSpecificData.coverageAmount / 100000) : 0)
    );
    const riskLevel = computedRiskScore >= 70 ? "High Risk" : computedRiskScore >= 40 ? "Medium Risk" : "Low Risk";

    const newAssessmentData = {
      risk_score: computedRiskScore,
      risk_level: riskLevel,
      location: applicantCity,
      weather: "Clear conditions",
      hazard_alerts: alerts,
      financial_alerts: staticFinancialAlerts,
      financial_alert_count: staticFinancialAlerts.length,
      alert_count: hazardCount,
      total_alert_count: hazardCount + staticFinancialAlerts.length,
      last_updated: new Date().toISOString()
    };

    setAssessmentData(newAssessmentData);

    setRiskScore({
      score: computedRiskScore,
      level: riskLevel,
      reason: `Derived from ${hazardCount} risk alerts for ${applicantCity}`
    });
  };

  const handleSelectApplication = (app) => {
    setSelectedApplication(app);
    // Reset states for the new application
    setRiskScore(null);
    setComplianceResults(null);
    setComplianceAnalysisData(null);
    setPremiumAdjustment(0);
    setLocationInput(app.personalInfo?.address || '');
    setScenarioImpact(null);
    // Perform initial assessment based on application address
    performStaticRiskAssessment(app);
  };


  const handleLocationRiskAssessment = () => {
    if (!locationInput.trim()) {
      alert('Please enter a location first');
      return;
    }
    setIsAssessing(true);
    setError(null);

    // Simulate loading delay
    setTimeout(() => {
      try {
        const city = locationInput.split(",")[0]?.trim() || "Sydney";
        const alerts = cityRiskAlerts[city] || [
          { id: "default-1", title: "No major alerts", summary: "No active risk alerts for this city.", date: new Date().toISOString(), severity: "Minor" }
        ];
        const hazardCount = alerts.length;
        const computedRiskScore = Math.min(100, hazardCount * 20);
        const riskLevel = computedRiskScore >= 70 ? "High Risk" : computedRiskScore >= 40 ? "Medium Risk" : "Low Risk";

        const newAssessmentData = {
          risk_score: computedRiskScore,
          risk_level: riskLevel,
          location: city,
          weather: "Clear conditions",
          hazard_alerts: alerts,
          financial_alerts: staticFinancialAlerts,
          financial_alert_count: staticFinancialAlerts.length,
          alert_count: hazardCount,
          total_alert_count: hazardCount + staticFinancialAlerts.length,
          last_updated: new Date().toISOString()
        };

        setAssessmentData(newAssessmentData);

        setRiskScore({
          score: computedRiskScore,
          level: riskLevel,
          reason: `Alerts count ${hazardCount} for ${city}`
        });
      } catch (err) {
        setError("Failed to perform risk assessment.");
      } finally {
        setIsAssessing(false);
      }
    }, 1000);
  };

  // Static AI Risk Assessment
  const handleRunRiskAssessment = () => {
    if (!selectedApplication) {
      alert("Please select an application first.");
      return;
    }
    setIsRiskAssessing(true);
    setError(null);
    setRiskScore(null);

    // Simulate AI processing
    setTimeout(() => {
      try {
        // Calculate static risk score based on application data
        const baseScore = 30;
        const ageMultiplier = selectedApplication.personalInfo?.age > 65 ? 15 : selectedApplication.personalInfo?.age < 25 ? 10 : 5;
        const typeMultiplier = {
          'Life': 10,
          'Health': 15,
          'Home': 12,
          'Motor': 18,
          'Business': 20
        };
        const coverageMultiplier = Math.min(20, (selectedApplication.insuranceSpecificData?.coverageAmount || 0) / 50000);

        const finalScore = Math.min(100, baseScore + ageMultiplier + (typeMultiplier[selectedApplication.insuranceType] || 10) + coverageMultiplier);
        const level = finalScore >= 70 ? "High Risk" : finalScore >= 40 ? "Medium Risk" : "Low Risk";

        const riskResult = {
          score: Math.round(finalScore),
          level: level,
          reason: `AI model assessment based on age, insurance type, and coverage amount. Confidence: 92%`,
          factors: [
            `Age factor: ${ageMultiplier} points`,
            `Insurance type (${selectedApplication.insuranceType}): ${typeMultiplier[selectedApplication.insuranceType] || 10} points`,
            `Coverage amount: ${Math.round(coverageMultiplier)} points`
          ]
        };

        setRiskScore(riskResult);
      } catch (err) {
        setError("Failed to get a prediction from the AI model.");
        setRiskScore({ score: 'Error', level: 'Failed' });
      } finally {
        setIsRiskAssessing(false);
      }
    }, 2000);
  };

  const handleRunComplianceCheck = () => {
    setTimeout(() => {
      const result = {
        status: Math.random() > 0.3 ? 'Pass' : 'Warning',
        regulations: [
          { name: 'APRA Prudential Standard CPS 220', status: 'Compliant' },
          { name: 'Insurance Contracts Act', status: 'Compliant' },
          { name: 'Privacy Act 1988', status: Math.random() > 0.3 ? 'Compliant' : 'Warning' }
        ],
        notes: 'Application generally complies with regulatory requirements with minor concerns.'
      };
      setComplianceResults(result);
    }, 1500);
  };

  const handleComplianceAnalysis = async () => {
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
              requirement_text: "Risk Management Framework",
              status: "Compliant",
              risk_level: "Low",
              evidence: "Risk management policy clearly defined.",
              gaps_identified: [],
              recommendations: [],
              notes: "Well documented processes"
            },
            {
              requirement_id: "APRA CPS 232",
              requirement_text: "Business Continuity Management",
              status: "Partially Compliant",
              risk_level: "Medium",
              evidence: "Basic continuity plans identified",
              gaps_identified: ["Missing detailed recovery procedures"],
              recommendations: ["Implement comprehensive BCP testing"],
              notes: "Requires enhancement"
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

  const handleAdjustPremium = (adjustment) => {
    setPremiumAdjustment(adjustment);
  };

  const updateApplicationStatus = (applicationId, status) => {
    try {
      // Update local state instead of API call
      setApplications(prev => prev.map(app =>
        app._id === applicationId
          ? { ...app, status, updatedAt: new Date().toISOString() }
          : app
      ));

      if (selectedApplication?._id === applicationId) {
        setSelectedApplication(prev => ({
          ...prev,
          status,
          updatedAt: new Date().toISOString()
        }));
      }
      alert(`Application status updated to: ${status}`);
    } catch (error) {
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
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectApplication(app);
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
            <h3 style={{ margin: '0 0 16px 0', color: '#1a202c' }}>🌍 Location-Based Risk Analysis (Static Data)</h3>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center', padding: '16px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #0284c7' }}>
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="Enter Australian city for risk assessment..."
                style={{ flex: 1, padding: '8px 12px', border: '1px solid #cbd5e0', borderRadius: '4px' }}
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
                  fontWeight: 'bold'
                }}
              >
                {isAssessing ? '🔄 Analyzing...' : '🔍 Analyze Location Risk'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <RiskAlertsComponent
                location={assessmentData.location}
                locationWeather={assessmentData.weather}
                hazardAlerts={assessmentData.hazard_alerts}
                financialAlerts={assessmentData.financial_alerts}
                alertCount={assessmentData.alert_count}
                financialAlertCount={assessmentData.financial_alert_count}
                lastUpdated={assessmentData.last_updated}
              />
              <RiskScoreComponent
                risk_score={assessmentData.risk_score}
                risk_level={assessmentData.risk_level}
              />
              <ScenarioTestingComponent
                onScenarioChange={handleScenarioChange}
                currentRiskScore={assessmentData.risk_score}
              />
            </div>

            <ComplianceAnalysisComponent
              complianceData={complianceAnalysisData}
              onRunCheck={handleComplianceAnalysis}
            />
          </div>
        )}

        {/* Assessment & Decision Tools */}
        {!isCompleted ? (
          <div>
            <h3 style={{ margin: '24px 0 16px 0', color: '#1a202c' }}>🛠️ Assessment & Decision Tools</h3>
            <div style={{ display: 'grid', gap: '20px' }}>
              {/* AI Risk Assessment */}
              <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 12px 0' }}> AI Risk Assessment </h4>
                {riskScore ? (
                  <div style={{ padding: '12px', background: '#f0fff4', borderRadius: '6px', border: '1px solid #68d391' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Risk Score: {riskScore.score}</span>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#38a169', color: 'white', fontSize: '12px' }}>{riskScore.level}</span>
                    </div>
                    <p style={{ margin: '0', fontSize: '14px', color: '#22543d' }}>{riskScore.reason}</p>
                    {riskScore.factors && (
                      <ul style={{ margin: '8px 0 0 0', paddingLeft: '16px', fontSize: '12px', color: '#22543d' }}>
                        {riskScore.factors.map((factor, index) => (
                          <li key={index}>{factor}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleRunRiskAssessment}
                    disabled={isRiskAssessing}
                    style={{
                      padding: '8px 16px',
                      background: isRiskAssessing ? '#a0aec0' : '#4299e1',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: isRiskAssessing ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isRiskAssessing ? '🔄 Processing...' : '🚀 Run AI Risk Assessment'}
                  </button>
                )}
              </div>

              {/* Compliance Check */}
              <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 12px 0' }}> APRA Compliance Check</h4>
                {complianceResults ? (
                  <div style={{ padding: '12px', background: complianceResults.status === 'Pass' ? '#f0fff4' : '#fef5e7', borderRadius: '6px', border: `1px solid ${complianceResults.status === 'Pass' ? '#68d391' : '#f6ad55'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold' }}>Compliance Status</span>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: complianceResults.status === 'Pass' ? '#38a169' : '#dd6b20',
                        color: 'white',
                        fontSize: '12px'
                      }}>
                        {complianceResults.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                      <strong>Regulations Checked:</strong>
                      <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px' }}>
                        {complianceResults.regulations.map((reg, index) => (
                          <li key={index} style={{ color: reg.status === 'Compliant' ? '#22543d' : '#744210' }}>
                            {reg.name}: {reg.status}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p style={{ margin: '0', fontSize: '12px', fontStyle: 'italic' }}>{complianceResults.notes}</p>
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
                <h4 style={{ margin: '0 0 12px 0' }}>💵 Premium Calculator</h4>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Base Premium:</span>
                    <span style={{ fontWeight: 'bold' }}>${calculateBasePremium(selectedApplication)}/month</span>
                  </div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Risk-Based Adjustment (%)</label>
                  <input
                    type="range"
                    min="-30"
                    max="50"
                    value={premiumAdjustment}
                    onChange={(e) => handleAdjustPremium(parseInt(e.target.value))}
                    style={{ width: '100%', marginBottom: '8px' }}
                  />
                  <div style={{ textAlign: 'center', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
                    {premiumAdjustment > 0 ? `+${premiumAdjustment}%` : `${premiumAdjustment}%`}
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    paddingTop: '8px',
                    borderTop: '1px solid #e2e8f0'
                  }}>
                    <span>Final Premium:</span>
                    <span>${calculateAdjustedPremium(selectedApplication, premiumAdjustment)}/month</span>
                  </div>
                </div>
              </div>

              {/* Final Decision */}
              <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'center' }}>
                <h4 style={{ margin: '0 0 12px 0' }}>✅ Final Decision</h4>
                <p style={{ color: '#4a5568', marginBottom: '16px' }}>Update the application status based on your assessment.</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => updateApplicationStatus(selectedApplication._id, 'Approved')}
                    style={{
                      padding: '12px 24px',
                      background: '#38a169',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(selectedApplication._id, 'Rejected')}
                    style={{
                      padding: '12px 24px',
                      background: '#e53e3e',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    ❌ Reject
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(selectedApplication._id, 'Requires Info')}
                    style={{
                      padding: '12px 24px',
                      background: '#dd6b20',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    📝 Request Info
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '20px', background: '#f0fff4', borderRadius: '8px', border: '1px solid #68d391' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#22543d' }}>✅ Assessment Completed</h3>
            <p>This application has been processed. Final Status: <strong>{selectedApplication.status}</strong></p>
            <p style={{ fontSize: '14px', color: '#22543d', margin: '8px 0 0 0' }}>
              Completed on: {new Date(selectedApplication.updatedAt || selectedApplication.createdAt).toLocaleString()}
            </p>
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
    display: 'block',
    padding: '12px 16px',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    transition: 'background 0.2s',
    background: isActive ? '#4299e1' : 'transparent'
  });

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        background: '#1a202c',
        color: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>AI Underwriting Risk Assessment</div>
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
        <aside style={{ width: '250px', background: '#2d3748', color: 'white', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Underwriter Portal</h2>
            <div style={{ padding: '16px', background: '#4a5568', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Sarah Johnson</h3>
              <div style={{ fontSize: '12px', color: '#cbd5e0' }}>Property & Auto Insurance</div>
              <div style={{ fontSize: '10px', color: '#a0aec0', marginTop: '4px' }}>✅ Data Mode</div>
            </div>
          </div>
          <nav style={{ padding: '0 20px', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <NavLink to="/underwriter-dashboard" end style={navLinkStyle}> New Requests</NavLink>
              <NavLink to="/underwriter-dashboard/in-review" style={navLinkStyle}> In Review</NavLink>
              <NavLink to="/underwriter-dashboard/completed" style={navLinkStyle}> Completed</NavLink>
              <NavLink to="/underwriter-dashboard/settings" style={navLinkStyle}> Profile Settings</NavLink>
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
                  <p>Settings panel </p>
                  <div style={{ fontSize: '14px', color: '#718096', marginTop: '16px' }}>
                  </div>
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
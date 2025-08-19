import React, { useState } from 'react';
import './UnderwriterDashboard.css';

const UnderwriterDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('newRequests');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [riskScore, setRiskScore] = useState(null);
  const [complianceResults, setComplianceResults] = useState(null);
  const [premiumAdjustment, setPremiumAdjustment] = useState(0);
  
  // Mock data for applications
  const applications = [
    { 
      id: 201, 
      type: 'Life Insurance', 
      applicant: 'Robert Chen', 
      date: '2023-07-15', 
      status: 'Pending',
      coverageAmount: 500000,
      policyTerm: 20,
      assetDetails: 'Term life insurance policy for family protection'
    },
    { 
      id: 202, 
      type: 'Property Insurance', 
      applicant: 'Lisa Wong', 
      date: '2023-07-18', 
      status: 'In Review',
      coverageAmount: 750000,
      policyTerm: 5,
      assetDetails: 'Residential property in Sydney CBD, 3 bedroom apartment'
    },
    { 
      id: 203, 
      type: 'Auto Insurance', 
      applicant: 'James Miller', 
      date: '2023-07-20', 
      status: 'Pending',
      coverageAmount: 35000,
      policyTerm: 1,
      assetDetails: '2022 Tesla Model 3, primarily used for commuting'
    },
  ];
  
  // Mock data for completed applications
  const completedApplications = [
    { 
      id: 195, 
      type: 'Health Insurance', 
      applicant: 'Emily Johnson', 
      date: '2023-07-01', 
      status: 'Completed',
      riskScore: 65,
      premium: 450,
      notes: 'Standard health coverage with dental add-on'
    },
    { 
      id: 196, 
      type: 'Business Insurance', 
      applicant: 'Mark Davis', 
      date: '2023-07-05', 
      status: 'Completed',
      riskScore: 72,
      premium: 1200,
      notes: 'Small business liability coverage with cyber protection'
    },
  ];
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedApplication(null);
    setRiskScore(null);
    setComplianceResults(null);
    setPremiumAdjustment(0);
  };
  
  const handleSelectApplication = (application) => {
    setSelectedApplication(application);
    // Reset assessment data when selecting a new application
    setRiskScore(null);
    setComplianceResults(null);
    setPremiumAdjustment(0);
  };
  
  const handleRunRiskAssessment = () => {
    // In a real app, this would call an API to run the risk assessment model
    // Simulating a loading delay
    setTimeout(() => {
      // Mock risk assessment results
      const mockRiskScore = {
        overall: Math.floor(Math.random() * 30) + 50, // Random score between 50-80
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
    // In a real app, this would call an API to run the compliance check
    // Simulating a loading delay
    setTimeout(() => {
      // Mock compliance check results
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
  
  const handleAdjustPremium = (adjustment) => {
    setPremiumAdjustment(adjustment);
  };
  
  const handleGenerateReport = () => {
    // In a real app, this would generate a report and send it to the applicant
    alert('Report generated and sent to applicant');
    
    // Update the application status to completed
    const updatedApplications = applications.filter(app => app.id !== selectedApplication.id);
    setSelectedApplication(null);
    
    // Reset the assessment data
    setRiskScore(null);
    setComplianceResults(null);
    setPremiumAdjustment(0);
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
              <div 
                key={app.id} 
                className={`table-row ${selectedApplication && selectedApplication.id === app.id ? 'selected' : ''}`}
              >
                <div className="cell">{app.id}</div>
                <div className="cell">{app.type}</div>
                <div className="cell">{app.applicant}</div>
                <div className="cell">{app.date}</div>
                <div className="cell">
                  <span className={`status-badge ${app.status.toLowerCase().replace(' ', '-')}`}>
                    {app.status}
                  </span>
                </div>
                <div className="cell">
                  <button 
                    className="action-btn"
                    onClick={() => handleSelectApplication(app)}
                  >
                    {app.status === 'Completed' ? 'View Details' : 'Review'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
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
      <div className="application-details">
        <div className="details-header">
          <h2>Application #{selectedApplication.id}</h2>
          <span className={`status-badge ${selectedApplication.status.toLowerCase().replace(' ', '-')}`}>
            {selectedApplication.status}
          </span>
        </div>
        
        <div className="details-content">
          <div className="details-section">
            <h3>Application Information</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Insurance Type</span>
                <span className="detail-value">{selectedApplication.type}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Applicant</span>
                <span className="detail-value">{selectedApplication.applicant}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Submission Date</span>
                <span className="detail-value">{selectedApplication.date}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Coverage Amount</span>
                <span className="detail-value">
                  ${selectedApplication.coverageAmount?.toLocaleString() || 'N/A'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Policy Term</span>
                <span className="detail-value">
                  {selectedApplication.policyTerm ? `${selectedApplication.policyTerm} years` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="details-section">
            <h3>Asset Details</h3>
            <p>{selectedApplication.assetDetails || 'No detailed information available.'}</p>
          </div>
          
          {isCompleted ? (
            <div className="details-section">
              <h3>Assessment Results</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Risk Score</span>
                  <span className="detail-value">{selectedApplication.riskScore}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Premium</span>
                  <span className="detail-value">${selectedApplication.premium}/month</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Notes</span>
                  <span className="detail-value">{selectedApplication.notes}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="assessment-tools">
              <div className="tool-section">
                <h3>Risk Assessment</h3>
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
                      <h4>Risk Breakdown</h4>
                      <div className="breakdown-item">
                        <span>Financial Risk</span>
                        <div className="progress-bar">
                          <div 
                            className="progress" 
                            style={{width: `${riskScore.breakdown.financial}%`}}
                          ></div>
                        </div>
                        <span>{riskScore.breakdown.financial}</span>
                      </div>
                      <div className="breakdown-item">
                        <span>Operational Risk</span>
                        <div className="progress-bar">
                          <div 
                            className="progress" 
                            style={{width: `${riskScore.breakdown.operational}%`}}
                          ></div>
                        </div>
                        <span>{riskScore.breakdown.operational}</span>
                      </div>
                      <div className="breakdown-item">
                        <span>Compliance Risk</span>
                        <div className="progress-bar">
                          <div 
                            className="progress" 
                            style={{width: `${riskScore.breakdown.compliance}%`}}
                          ></div>
                        </div>
                        <span>{riskScore.breakdown.compliance}</span>
                      </div>
                      <div className="breakdown-item">
                        <span>Market Risk</span>
                        <div className="progress-bar">
                          <div 
                            className="progress" 
                            style={{width: `${riskScore.breakdown.market}%`}}
                          ></div>
                        </div>
                        <span>{riskScore.breakdown.market}</span>
                      </div>
                    </div>
                    
                    <div className="risk-factors">
                      <h4>Key Risk Factors</h4>
                      <ul>
                        {riskScore.factors.map((factor, index) => (
                          <li key={index}>{factor}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <button 
                    className="tool-btn" 
                    onClick={handleRunRiskAssessment}
                  >
                    Run XGBoost/LLM Risk Assessment
                  </button>
                )}
              </div>
              
              <div className="tool-section">
                <h3>Compliance Check</h3>
                {complianceResults ? (
                  <div className="compliance-results">
                    <div className="compliance-status">
                      <span className={`compliance-badge ${complianceResults.status.toLowerCase()}`}>
                        {complianceResults.status}
                      </span>
                    </div>
                    
                    <div className="regulations-list">
                      <h4>Regulatory Compliance</h4>
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
                      <h4>Notes</h4>
                      <p>{complianceResults.notes}</p>
                    </div>
                  </div>
                ) : (
                  <button 
                    className="tool-btn" 
                    onClick={handleRunComplianceCheck}
                  >
                    Run APRA Compliance Check
                  </button>
                )}
              </div>
              
              <div className="tool-section">
                <h3>Premium Adjustment</h3>
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
                    <span>
                      ${calculateAdjustedPremium(selectedApplication, premiumAdjustment)}/month
                    </span>
                  </div>
                  
                  <div className="external-factors">
                    <h4>External Factors</h4>
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
                <h3>Generate Report</h3>
                <p>Generate a comprehensive report for the applicant based on your assessment.</p>
                <button 
                  className="primary-btn" 
                  onClick={handleGenerateReport}
                  disabled={!riskScore || !complianceResults}
                >
                  Generate & Send Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Helper function to calculate base premium (simplified example)
  const calculateBasePremium = (application) => {
    if (!application || !application.coverageAmount) return 0;
    
    // Very simplified premium calculation
    let basePremium = 0;
    
    switch (application.type) {
      case 'Life Insurance':
        basePremium = (application.coverageAmount * 0.001) / 12;
        break;
      case 'Health Insurance':
        basePremium = 400;
        break;
      case 'Property Insurance':
        basePremium = (application.coverageAmount * 0.0015) / 12;
        break;
      case 'Auto Insurance':
        basePremium = (application.coverageAmount * 0.02) / 12;
        break;
      case 'Business Insurance':
        basePremium = (application.coverageAmount * 0.002) / 12;
        break;
      default:
        basePremium = (application.coverageAmount * 0.001) / 12;
    }
    
    return Math.round(basePremium);
  };
  
  // Helper function to calculate adjusted premium
  const calculateAdjustedPremium = (application, adjustment) => {
    const basePremium = calculateBasePremium(application);
    const adjustedPremium = basePremium * (1 + adjustment / 100);
    return Math.round(adjustedPremium);
  };
  
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
          <div className="sidebar-header">
            <h2>Underwriter Portal</h2>
          </div>
          
          <div className="underwriter-profile">
            <div className="profile-info">
              <h3>Sarah Johnson</h3>
              <p>Property & Auto Insurance</p>
              <p>8 years experience</p>
              <p>Europe Region</p>
            </div>
          </div>
          
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'newRequests' ? 'active' : ''}`}
              onClick={() => handleTabChange('newRequests')}
            >
              New Requests
            </button>
            <button 
              className={`nav-item ${activeTab === 'inReview' ? 'active' : ''}`}
              onClick={() => handleTabChange('inReview')}
            >
              In Review
            </button>
            <button 
              className={`nav-item ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => handleTabChange('completed')}
            >
              Completed
            </button>
            <button className="nav-item">
              Analytics
            </button>
            <button className="nav-item">
              Profile Settings
            </button>
          </nav>
        </aside>
        
        <main className="main-content">
          <div className="content-container">
            <div className="applications-panel">
              {activeTab === 'newRequests' && renderApplicationsList(
                applications.filter(app => app.status === 'Pending'),
                'New Application Requests'
              )}
              
              {activeTab === 'inReview' && renderApplicationsList(
                applications.filter(app => app.status === 'In Review'),
                'Applications In Review'
              )}
              
              {activeTab === 'completed' && renderApplicationsList(
                completedApplications,
                'Completed Applications'
              )}
            </div>
            
            <div className="details-panel">
              {selectedApplication ? (
                renderApplicationDetails()
              ) : (
                <div className="empty-details">
                  <p>Select an application to view details and perform assessment.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UnderwriterDashboard;
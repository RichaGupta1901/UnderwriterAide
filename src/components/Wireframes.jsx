import React from 'react';
import './Wireframes.css';

const Wireframes = () => {
  return (
    <div className="wireframes-container">
      <h1 className="wireframes-title">AI Underwriting Risk Assessment Platform - Wireframes</h1>
      
      <div className="wireframe-section">
        <h2>Information Architecture</h2>
        <div className="info-architecture">
          <div className="arch-box root">Landing Page</div>
          <div className="arch-branches">
            <div className="arch-branch">
              <div className="arch-box">Applicant Login/Register</div>
              <div className="arch-sub-branches">
                <div className="arch-branch">
                  <div className="arch-box">Applicant Dashboard</div>
                  <div className="arch-sub-branches">
                    <div className="arch-branch">
                      <div className="arch-box">New Application</div>
                    </div>
                    <div className="arch-branch">
                      <div className="arch-box">Underwriter Selection</div>
                    </div>
                    <div className="arch-branch">
                      <div className="arch-box">Application Status</div>
                    </div>
                    <div className="arch-branch">
                      <div className="arch-box">View Reports</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="arch-branch">
              <div className="arch-box">Underwriter Login/Register</div>
              <div className="arch-sub-branches">
                <div className="arch-branch">
                  <div className="arch-box">Underwriter Dashboard</div>
                  <div className="arch-sub-branches">
                    <div className="arch-branch">
                      <div className="arch-box">Application Queue</div>
                    </div>
                    <div className="arch-branch">
                      <div className="arch-box">Risk Assessment</div>
                    </div>
                    <div className="arch-branch">
                      <div className="arch-box">Compliance Check</div>
                    </div>
                    <div className="arch-branch">
                      <div className="arch-box">Premium Calculator</div>
                    </div>
                    <div className="arch-branch">
                      <div className="arch-box">Report Generation</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="wireframe-section">
        <h2>Login/Registration Screen</h2>
        <div className="wireframe login-wireframe">
          <div className="wireframe-header">
            <div className="logo-placeholder">LOGO</div>
            <div className="app-name">AI Underwriting Risk Assessment</div>
          </div>
          
          <div className="login-container">
            <div className="tabs">
              <div className="tab active">Applicant</div>
              <div className="tab">Underwriter</div>
            </div>
            
            <div className="form-container">
              <div className="tabs">
                <div className="tab active">Login</div>
                <div className="tab">Register</div>
              </div>
              
              <div className="form-fields">
                <div className="form-field">
                  <label>Email</label>
                  <div className="input-placeholder"></div>
                </div>
                <div className="form-field">
                  <label>Password</label>
                  <div className="input-placeholder"></div>
                </div>
                <button className="primary-button">Login</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="wireframe-section">
        <h2>Applicant Dashboard</h2>
        <div className="wireframe dashboard-wireframe">
          <div className="wireframe-header">
            <div className="logo-placeholder">LOGO</div>
            <div className="user-menu">
              <div className="user-info">John Doe (Applicant)</div>
              <button className="logout-button">Logout</button>
            </div>
          </div>
          
          <div className="dashboard-content">
            <div className="sidebar">
              <div className="nav-item active">Dashboard</div>
              <div className="nav-item">New Application</div>
              <div className="nav-item">My Applications</div>
              <div className="nav-item">Reports</div>
              <div className="nav-item">Profile</div>
            </div>
            
            <div className="main-content">
              <div className="welcome-section">
                <h2>Welcome, John!</h2>
                <p>Manage your insurance applications and view reports</p>
                <button className="primary-button">+ New Application</button>
              </div>
              
              <div className="stats-section">
                <div className="stat-card">
                  <div className="stat-number">3</div>
                  <div className="stat-label">Total Applications</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">1</div>
                  <div className="stat-label">Pending</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">1</div>
                  <div className="stat-label">In Review</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">1</div>
                  <div className="stat-label">Completed</div>
                </div>
              </div>
              
              <div className="recent-applications">
                <h3>Recent Applications</h3>
                <div className="table">
                  <div className="table-header">
                    <div className="table-cell">ID</div>
                    <div className="table-cell">Insurance Type</div>
                    <div className="table-cell">Underwriter</div>
                    <div className="table-cell">Submitted</div>
                    <div className="table-cell">Status</div>
                    <div className="table-cell">Actions</div>
                  </div>
                  <div className="table-row">
                    <div className="table-cell">APP-001</div>
                    <div className="table-cell">Home Insurance</div>
                    <div className="table-cell">Sarah Johnson</div>
                    <div className="table-cell">2023-06-15</div>
                    <div className="table-cell">
                      <span className="status completed">Completed</span>
                    </div>
                    <div className="table-cell">
                      <button className="action-button">View Report</button>
                    </div>
                  </div>
                  <div className="table-row">
                    <div className="table-cell">APP-002</div>
                    <div className="table-cell">Auto Insurance</div>
                    <div className="table-cell">Michael Chen</div>
                    <div className="table-cell">2023-06-20</div>
                    <div className="table-cell">
                      <span className="status in-review">In Review</span>
                    </div>
                    <div className="table-cell">
                      <button className="action-button">Track</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="wireframe-section">
        <h2>New Application Form</h2>
        <div className="wireframe application-wireframe">
          <div className="wireframe-header">
            <div className="logo-placeholder">LOGO</div>
            <div className="user-menu">
              <div className="user-info">John Doe (Applicant)</div>
              <button className="logout-button">Logout</button>
            </div>
          </div>
          
          <div className="dashboard-content">
            <div className="sidebar">
              <div className="nav-item">Dashboard</div>
              <div className="nav-item active">New Application</div>
              <div className="nav-item">My Applications</div>
              <div className="nav-item">Reports</div>
              <div className="nav-item">Profile</div>
            </div>
            
            <div className="main-content">
              <div className="page-header">
                <h2>New Insurance Application</h2>
                <p>Please fill out all required information</p>
              </div>
              
              <div className="form-progress">
                <div className="progress-step active">1. Insurance Details</div>
                <div className="progress-step">2. Asset Information</div>
                <div className="progress-step">3. Select Underwriter</div>
                <div className="progress-step">4. Review & Submit</div>
              </div>
              
              <div className="application-form">
                <div className="form-section">
                  <h3>Insurance Details</h3>
                  
                  <div className="form-row">
                    <div className="form-field">
                      <label>Insurance Type</label>
                      <div className="select-placeholder"></div>
                    </div>
                    <div className="form-field">
                      <label>Coverage Amount</label>
                      <div className="input-placeholder"></div>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-field">
                      <label>Policy Start Date</label>
                      <div className="input-placeholder"></div>
                    </div>
                    <div className="form-field">
                      <label>Policy Duration</label>
                      <div className="select-placeholder"></div>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-field full-width">
                      <label>Additional Coverage Options</label>
                      <div className="checkbox-group">
                        <div className="checkbox-placeholder"></div>
                        <div className="checkbox-placeholder"></div>
                        <div className="checkbox-placeholder"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button className="secondary-button">Save as Draft</button>
                  <button className="primary-button">Next: Asset Information</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="wireframe-section">
        <h2>Underwriter Selection</h2>
        <div className="wireframe underwriter-selection-wireframe">
          <div className="wireframe-header">
            <div className="logo-placeholder">LOGO</div>
            <div className="user-menu">
              <div className="user-info">John Doe (Applicant)</div>
              <button className="logout-button">Logout</button>
            </div>
          </div>
          
          <div className="dashboard-content">
            <div className="sidebar">
              <div className="nav-item">Dashboard</div>
              <div className="nav-item active">New Application</div>
              <div className="nav-item">My Applications</div>
              <div className="nav-item">Reports</div>
              <div className="nav-item">Profile</div>
            </div>
            
            <div className="main-content">
              <div className="page-header">
                <h2>Select Underwriter</h2>
                <p>Choose an underwriter to review your application</p>
              </div>
              
              <div className="form-progress">
                <div className="progress-step completed">1. Insurance Details</div>
                <div className="progress-step completed">2. Asset Information</div>
                <div className="progress-step active">3. Select Underwriter</div>
                <div className="progress-step">4. Review & Submit</div>
              </div>
              
              <div className="underwriter-list">
                <div className="filter-bar">
                  <div className="search-box">
                    <div className="input-placeholder"></div>
                  </div>
                  <div className="filter-options">
                    <div className="select-placeholder small"></div>
                    <div className="select-placeholder small"></div>
                  </div>
                </div>
                
                <div className="underwriter-cards">
                  <div className="underwriter-card">
                    <div className="underwriter-avatar"></div>
                    <div className="underwriter-name">Sarah Johnson</div>
                    <div className="underwriter-specialty">Home Insurance</div>
                    <div className="underwriter-details">
                      <div className="detail-item">
                        <span className="detail-label">Experience:</span>
                        <span className="detail-value">8 years</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Region:</span>
                        <span className="detail-value">Northeast</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Rating:</span>
                        <span className="detail-value">4.8/5</span>
                      </div>
                    </div>
                    <button className="primary-button">Select</button>
                  </div>
                  
                  <div className="underwriter-card selected">
                    <div className="underwriter-avatar"></div>
                    <div className="underwriter-name">Michael Chen</div>
                    <div className="underwriter-specialty">Auto Insurance</div>
                    <div className="underwriter-details">
                      <div className="detail-item">
                        <span className="detail-label">Experience:</span>
                        <span className="detail-value">12 years</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Region:</span>
                        <span className="detail-value">West</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Rating:</span>
                        <span className="detail-value">4.9/5</span>
                      </div>
                    </div>
                    <button className="primary-button selected">Selected</button>
                  </div>
                  
                  <div className="underwriter-card">
                    <div className="underwriter-avatar"></div>
                    <div className="underwriter-name">Emily Rodriguez</div>
                    <div className="underwriter-specialty">Business Insurance</div>
                    <div className="underwriter-details">
                      <div className="detail-item">
                        <span className="detail-label">Experience:</span>
                        <span className="detail-value">6 years</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Region:</span>
                        <span className="detail-value">South</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Rating:</span>
                        <span className="detail-value">4.7/5</span>
                      </div>
                    </div>
                    <button className="primary-button">Select</button>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button className="secondary-button">Back</button>
                  <button className="primary-button">Next: Review & Submit</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="wireframe-section">
        <h2>Underwriter Dashboard</h2>
        <div className="wireframe underwriter-dashboard-wireframe">
          <div className="wireframe-header">
            <div className="logo-placeholder">LOGO</div>
            <div className="user-menu">
              <div className="user-info">Michael Chen (Underwriter)</div>
              <button className="logout-button">Logout</button>
            </div>
          </div>
          
          <div className="dashboard-content">
            <div className="sidebar">
              <div className="nav-item active">Dashboard</div>
              <div className="nav-item">Applications</div>
              <div className="nav-item">Risk Assessment</div>
              <div className="nav-item">Reports</div>
              <div className="nav-item">Profile</div>
            </div>
            
            <div className="main-content">
              <div className="welcome-section">
                <h2>Welcome, Michael!</h2>
                <p>Manage applications and perform risk assessments</p>
              </div>
              
              <div className="stats-section">
                <div className="stat-card">
                  <div className="stat-number">12</div>
                  <div className="stat-label">Total Applications</div>
                </div>
                <div className="stat-card highlight">
                  <div className="stat-number">5</div>
                  <div className="stat-label">Pending Review</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">3</div>
                  <div className="stat-label">In Progress</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">4</div>
                  <div className="stat-label">Completed</div>
                </div>
              </div>
              
              <div className="applications-queue">
                <h3>Applications Queue</h3>
                <div className="table">
                  <div className="table-header">
                    <div className="table-cell">ID</div>
                    <div className="table-cell">Applicant</div>
                    <div className="table-cell">Insurance Type</div>
                    <div className="table-cell">Received</div>
                    <div className="table-cell">Status</div>
                    <div className="table-cell">Actions</div>
                  </div>
                  <div className="table-row">
                    <div className="table-cell">APP-002</div>
                    <div className="table-cell">John Doe</div>
                    <div className="table-cell">Auto Insurance</div>
                    <div className="table-cell">2023-06-20</div>
                    <div className="table-cell">
                      <span className="status in-review">In Review</span>
                    </div>
                    <div className="table-cell">
                      <button className="action-button">Continue</button>
                    </div>
                  </div>
                  <div className="table-row">
                    <div className="table-cell">APP-005</div>
                    <div className="table-cell">Lisa Wong</div>
                    <div className="table-cell">Auto Insurance</div>
                    <div className="table-cell">2023-06-22</div>
                    <div className="table-cell">
                      <span className="status pending">Pending</span>
                    </div>
                    <div className="table-cell">
                      <button className="action-button">Review</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="wireframe-section">
        <h2>Risk Assessment Screen</h2>
        <div className="wireframe risk-assessment-wireframe">
          <div className="wireframe-header">
            <div className="logo-placeholder">LOGO</div>
            <div className="user-menu">
              <div className="user-info">Michael Chen (Underwriter)</div>
              <button className="logout-button">Logout</button>
            </div>
          </div>
          
          <div className="dashboard-content">
            <div className="sidebar">
              <div className="nav-item">Dashboard</div>
              <div className="nav-item active">Applications</div>
              <div className="nav-item">Risk Assessment</div>
              <div className="nav-item">Reports</div>
              <div className="nav-item">Profile</div>
            </div>
            
            <div className="main-content">
              <div className="page-header">
                <h2>Application Review: APP-002</h2>
                <div className="application-status">
                  <span className="status in-review">In Review</span>
                </div>
              </div>
              
              <div className="assessment-container">
                <div className="assessment-sidebar">
                  <div className="applicant-info">
                    <h3>Applicant</h3>
                    <div className="info-item">
                      <span className="info-label">Name:</span>
                      <span className="info-value">John Doe</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email:</span>
                      <span className="info-value">john.doe@example.com</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Phone:</span>
                      <span className="info-value">(555) 123-4567</span>
                    </div>
                  </div>
                  
                  <div className="application-info">
                    <h3>Application Details</h3>
                    <div className="info-item">
                      <span className="info-label">Type:</span>
                      <span className="info-value">Auto Insurance</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Coverage:</span>
                      <span className="info-value">$50,000</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Vehicle:</span>
                      <span className="info-value">2020 Toyota Camry</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Location:</span>
                      <span className="info-value">San Francisco, CA</span>
                    </div>
                  </div>
                  
                  <div className="assessment-progress">
                    <h3>Assessment Progress</h3>
                    <div className="progress-item completed">
                      <div className="progress-icon"></div>
                      <div className="progress-label">Application Review</div>
                    </div>
                    <div className="progress-item active">
                      <div className="progress-icon"></div>
                      <div className="progress-label">Risk Assessment</div>
                    </div>
                    <div className="progress-item">
                      <div className="progress-icon"></div>
                      <div className="progress-label">Compliance Check</div>
                    </div>
                    <div className="progress-item">
                      <div className="progress-icon"></div>
                      <div className="progress-label">Premium Calculation</div>
                    </div>
                    <div className="progress-item">
                      <div className="progress-icon"></div>
                      <div className="progress-label">Report Generation</div>
                    </div>
                  </div>
                </div>
                
                <div className="assessment-content">
                  <div className="assessment-tabs">
                    <div className="tab">Application</div>
                    <div className="tab active">Risk Assessment</div>
                    <div className="tab">Compliance</div>
                    <div className="tab">Premium</div>
                    <div className="tab">Report</div>
                  </div>
                  
                  <div className="risk-assessment-panel">
                    <div className="panel-section">
                      <h3>AI Risk Analysis</h3>
                      <div className="action-button-group">
                        <button className="primary-button">Run Risk Assessment</button>
                      </div>
                      
                      <div className="risk-score-display">
                        <div className="score-circle medium">
                          <div className="score-value">65</div>
                        </div>
                        <div className="score-label">Risk Score</div>
                        <div className="score-description">Medium Risk</div>
                      </div>
                      
                      <div className="risk-breakdown">
                        <h4>Risk Breakdown</h4>
                        <div className="breakdown-item">
                          <div className="breakdown-label">Driver History</div>
                          <div className="progress-bar">
                            <div className="progress" style={{width: '40%'}}></div>
                          </div>
                          <div className="breakdown-value">40%</div>
                        </div>
                        <div className="breakdown-item">
                          <div className="breakdown-label">Vehicle Type</div>
                          <div className="progress-bar">
                            <div className="progress" style={{width: '25%'}}></div>
                          </div>
                          <div className="breakdown-value">25%</div>
                        </div>
                        <div className="breakdown-item">
                          <div className="breakdown-label">Location Risk</div>
                          <div className="progress-bar">
                            <div className="progress" style={{width: '70%'}}></div>
                          </div>
                          <div className="breakdown-value">70%</div>
                        </div>
                        <div className="breakdown-item">
                          <div className="breakdown-label">Coverage Amount</div>
                          <div className="progress-bar">
                            <div className="progress" style={{width: '55%'}}></div>
                          </div>
                          <div className="breakdown-value">55%</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="panel-section">
                      <h3>External Risk Factors</h3>
                      <div className="external-factors">
                        <div className="factor-item">
                          <div className="factor-icon climate"></div>
                          <div className="factor-details">
                            <div className="factor-name">Climate Conditions</div>
                            <div className="factor-description">Moderate flood risk in area</div>
                          </div>
                          <div className="factor-impact negative">+10%</div>
                        </div>
                        <div className="factor-item">
                          <div className="factor-icon economic"></div>
                          <div className="factor-details">
                            <div className="factor-name">Economic Indicators</div>
                            <div className="factor-description">Stable economic conditions</div>
                          </div>
                          <div className="factor-impact positive">-5%</div>
                        </div>
                        <div className="factor-item">
                          <div className="factor-icon news"></div>
                          <div className="factor-details">
                            <div className="factor-name">News Sentiment</div>
                            <div className="factor-description">Recent increase in auto thefts</div>
                          </div>
                          <div className="factor-impact negative">+8%</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="panel-actions">
                      <button className="secondary-button">Back</button>
                      <button className="primary-button">Next: Compliance Check</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="wireframe-section">
        <h2>Report Generation</h2>
        <div className="wireframe report-wireframe">
          <div className="wireframe-header">
            <div className="logo-placeholder">LOGO</div>
            <div className="user-menu">
              <div className="user-info">Michael Chen (Underwriter)</div>
              <button className="logout-button">Logout</button>
            </div>
          </div>
          
          <div className="dashboard-content">
            <div className="sidebar">
              <div className="nav-item">Dashboard</div>
              <div className="nav-item active">Applications</div>
              <div className="nav-item">Risk Assessment</div>
              <div className="nav-item">Reports</div>
              <div className="nav-item">Profile</div>
            </div>
            
            <div className="main-content">
              <div className="page-header">
                <h2>Application Review: APP-002</h2>
                <div className="application-status">
                  <span className="status in-review">In Review</span>
                </div>
              </div>
              
              <div className="assessment-container">
                <div className="assessment-sidebar">
                  <div className="applicant-info">
                    <h3>Applicant</h3>
                    <div className="info-item">
                      <span className="info-label">Name:</span>
                      <span className="info-value">John Doe</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email:</span>
                      <span className="info-value">john.doe@example.com</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Phone:</span>
                      <span className="info-value">(555) 123-4567</span>
                    </div>
                  </div>
                  
                  <div className="application-info">
                    <h3>Application Details</h3>
                    <div className="info-item">
                      <span className="info-label">Type:</span>
                      <span className="info-value">Auto Insurance</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Coverage:</span>
                      <span className="info-value">$50,000</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Vehicle:</span>
                      <span className="info-value">2020 Toyota Camry</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Location:</span>
                      <span className="info-value">San Francisco, CA</span>
                    </div>
                  </div>
                  
                  <div className="assessment-progress">
                    <h3>Assessment Progress</h3>
                    <div className="progress-item completed">
                      <div className="progress-icon"></div>
                      <div className="progress-label">Application Review</div>
                    </div>
                    <div className="progress-item completed">
                      <div className="progress-icon"></div>
                      <div className="progress-label">Risk Assessment</div>
                    </div>
                    <div className="progress-item completed">
                      <div className="progress-icon"></div>
                      <div className="progress-label">Compliance Check</div>
                    </div>
                    <div className="progress-item completed">
                      <div className="progress-icon"></div>
                      <div className="progress-label">Premium Calculation</div>
                    </div>
                    <div className="progress-item active">
                      <div className="progress-icon"></div>
                      <div className="progress-label">Report Generation</div>
                    </div>
                  </div>
                </div>
                
                <div className="assessment-content">
                  <div className="assessment-tabs">
                    <div className="tab">Application</div>
                    <div className="tab">Risk Assessment</div>
                    <div className="tab">Compliance</div>
                    <div className="tab">Premium</div>
                    <div className="tab active">Report</div>
                  </div>
                  
                  <div className="report-panel">
                    <div className="panel-section">
                      <h3>Report Preview</h3>
                      <div className="report-preview">
                        <div className="report-header">
                          <div className="report-title">Insurance Application Assessment Report</div>
                          <div className="report-meta">
                            <div className="meta-item">
                              <span className="meta-label">Application ID:</span>
                              <span className="meta-value">APP-002</span>
                            </div>
                            <div className="meta-item">
                              <span className="meta-label">Date:</span>
                              <span className="meta-value">2023-06-25</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="report-sections">
                          <div className="report-section-preview">
                            <h4>Risk Assessment Summary</h4>
                            <div className="preview-content"></div>
                          </div>
                          <div className="report-section-preview">
                            <h4>Compliance Analysis</h4>
                            <div className="preview-content"></div>
                          </div>
                          <div className="report-section-preview">
                            <h4>Premium Calculation</h4>
                            <div className="preview-content"></div>
                          </div>
                          <div className="report-section-preview">
                            <h4>Recommendations</h4>
                            <div className="preview-content"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="panel-section">
                      <h3>Explanation for Applicant</h3>
                      <div className="explanation-editor">
                        <div className="editor-placeholder"></div>
                      </div>
                    </div>
                    
                    <div className="panel-actions">
                      <button className="secondary-button">Back</button>
                      <button className="primary-button">Generate & Send Report</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="wireframe-section">
        <h2>Data Flow & API Structure</h2>
        <div className="data-flow-diagram">
          <div className="api-section">
            <h3>Authentication API</h3>
            <ul className="api-endpoints">
              <li><span className="method">POST</span> /api/auth/login</li>
              <li><span className="method">POST</span> /api/auth/register</li>
              <li><span className="method">POST</span> /api/auth/logout</li>
              <li><span className="method">GET</span> /api/auth/profile</li>
            </ul>
          </div>
          
          <div className="api-section">
            <h3>Applicant API</h3>
            <ul className="api-endpoints">
              <li><span className="method">POST</span> /api/applications</li>
              <li><span className="method">GET</span> /api/applications</li>
              <li><span className="method">GET</span> /api/applications/:id</li>
              <li><span className="method">GET</span> /api/underwriters</li>
              <li><span className="method">GET</span> /api/reports/:id</li>
            </ul>
          </div>
          
          <div className="api-section">
            <h3>Underwriter API</h3>
            <ul className="api-endpoints">
              <li><span className="method">GET</span> /api/underwriter/applications</li>
              <li><span className="method">GET</span> /api/underwriter/applications/:id</li>
              <li><span className="method">POST</span> /api/risk-assessment/:id</li>
              <li><span className="method">POST</span> /api/compliance-check/:id</li>
              <li><span className="method">POST</span> /api/premium-calculation/:id</li>
              <li><span className="method">POST</span> /api/reports</li>
            </ul>
          </div>
          
          <div className="api-section">
            <h3>External Services API</h3>
            <ul className="api-endpoints">
              <li><span className="method">GET</span> /api/external/weather/:location</li>
              <li><span className="method">GET</span> /api/external/economic-indicators</li>
              <li><span className="method">GET</span> /api/external/news-sentiment/:keywords</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="wireframe-section">
        <h2>Technology Stack</h2>
        <div className="tech-stack">
          <div className="tech-layer">
            <h3>Frontend</h3>
            <ul className="tech-list">
              <li>ReactJS for UI components</li>
              <li>React Router for navigation</li>
              <li>Redux for state management</li>
              <li>Axios for API requests</li>
              <li>Styled Components for styling</li>
              <li>React Hook Form for form handling</li>
              <li>Chart.js for data visualization</li>
            </ul>
          </div>
          
          <div className="tech-layer">
            <h3>Backend</h3>
            <ul className="tech-list">
              <li>Node.js runtime environment</li>
              <li>Express.js for API development</li>
              <li>JWT for authentication</li>
              <li>MongoDB for database</li>
              <li>Mongoose for ODM</li>
            </ul>
          </div>
          
          <div className="tech-layer">
            <h3>AI/ML Components</h3>
            <ul className="tech-list">
              <li>AWS SageMaker for ML model hosting</li>
              <li>AWS Lambda for serverless functions</li>
              <li>AWS Comprehend for sentiment analysis</li>
              <li>XGBoost for risk scoring models</li>
              <li>LangChain for RAG implementation</li>
              <li>Amazon Bedrock for LLM access</li>
            </ul>
          </div>
          
          <div className="tech-layer">
            <h3>Infrastructure</h3>
            <ul className="tech-list">
              <li>AWS EC2 for application hosting</li>
              <li>AWS S3 for file storage</li>
              <li>AWS CloudFront for content delivery</li>
              <li>AWS API Gateway for API management</li>
              <li>AWS CloudWatch for monitoring</li>
              <li>CI/CD with GitHub Actions</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="wireframe-section">
        <h2>Pages/Screens List</h2>
        <div className="pages-list">
          <div className="pages-column">
            <h3>Applicant Screens</h3>
            <ul className="page-items">
              <li>Login/Registration</li>
              <li>Applicant Dashboard</li>
              <li>New Application Form
                <ul>
                  <li>Insurance Details</li>
                  <li>Asset Information</li>
                  <li>Underwriter Selection</li>
                  <li>Review & Submit</li>
                </ul>
              </li>
              <li>My Applications List</li>
              <li>Application Details</li>
              <li>Report Viewer</li>
              <li>Profile Settings</li>
            </ul>
          </div>
          
          <div className="pages-column">
            <h3>Underwriter Screens</h3>
            <ul className="page-items">
              <li>Login/Registration</li>
              <li>Underwriter Dashboard</li>
              <li>Applications Queue</li>
              <li>Application Review
                <ul>
                  <li>Application Details</li>
                  <li>Risk Assessment</li>
                  <li>Compliance Check</li>
                  <li>Premium Calculator</li>
                  <li>Report Generation</li>
                </ul>
              </li>
              <li>Completed Applications</li>
              <li>Profile Settings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wireframes;
import React, { useState } from 'react';
import './ApplicantDashboard.css';

const ApplicantDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('newApplication');
  const [applications, setApplications] = useState([]);
  const [selectedUnderwriter, setSelectedUnderwriter] = useState(null);
  
  // Mock data for underwriters
  const underwriters = [
    { id: 1, name: 'John Smith', types: ['Life', 'Health'], experience: 12, region: 'North America' },
    { id: 2, name: 'Sarah Johnson', types: ['Property', 'Auto'], experience: 8, region: 'Europe' },
    { id: 3, name: 'Michael Chen', types: ['Business', 'Property'], experience: 15, region: 'Asia Pacific' },
    { id: 4, name: 'Emma Williams', types: ['Life', 'Health', 'Auto'], experience: 10, region: 'North America' },
    { id: 5, name: 'David Rodriguez', types: ['Property', 'Business'], experience: 7, region: 'Latin America' },
  ];
  
  // Mock data for applications
  const mockApplications = [
    { id: 101, type: 'Life Insurance', status: 'Completed', underwriter: 'John Smith', date: '2023-05-15' },
    { id: 102, type: 'Property Insurance', status: 'In Review', underwriter: 'Sarah Johnson', date: '2023-06-22' },
    { id: 103, type: 'Auto Insurance', status: 'Pending', underwriter: 'Emma Williams', date: '2023-07-10' },
  ];
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const handleUnderwriterSelect = (underwriter) => {
    setSelectedUnderwriter(underwriter);
  };
  
  const handleSubmitApplication = (e) => {
    e.preventDefault();
    // In a real app, this would send the application data to the backend
    alert(`Application submitted to ${selectedUnderwriter.name}`);
    // Reset form and selected underwriter
    setSelectedUnderwriter(null);
    e.target.reset();
  };
  
  const renderNewApplicationForm = () => {
    return (
      <div className="application-form-container">
        <h2>New Insurance Application</h2>
        
        <form onSubmit={handleSubmitApplication} className="application-form">
          <div className="form-section">
            <h3>Insurance Details</h3>
            
            <div className="form-group">
              <label htmlFor="insuranceType">Insurance Type</label>
              <select id="insuranceType" required>
                <option value="">Select Insurance Type</option>
                <option value="Life">Life Insurance</option>
                <option value="Health">Health Insurance</option>
                <option value="Property">Property Insurance</option>
                <option value="Auto">Auto Insurance</option>
                <option value="Business">Business Insurance</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="coverageAmount">Coverage Amount ($)</label>
              <input type="number" id="coverageAmount" min="1000" step="1000" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="policyTerm">Policy Term</label>
              <select id="policyTerm" required>
                <option value="">Select Term</option>
                <option value="1">1 Year</option>
                <option value="5">5 Years</option>
                <option value="10">10 Years</option>
                <option value="15">15 Years</option>
                <option value="20">20 Years</option>
                <option value="30">30 Years</option>
              </select>
            </div>
          </div>
          
          <div className="form-section">
            <h3>Asset Details</h3>
            
            <div className="form-group">
              <label htmlFor="assetName">Asset Name/Description</label>
              <input type="text" id="assetName" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="assetValue">Asset Value ($)</label>
              <input type="number" id="assetValue" min="0" step="100" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="assetLocation">Location</label>
              <input type="text" id="assetLocation" placeholder="City, Country" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="assetDetails">Additional Details</label>
              <textarea id="assetDetails" rows="3"></textarea>
            </div>
          </div>
          
          <div className="form-section">
            <h3>Select Underwriter</h3>
            {selectedUnderwriter ? (
              <div className="selected-underwriter">
                <h4>Selected: {selectedUnderwriter.name}</h4>
                <p>Specializes in: {selectedUnderwriter.types.join(', ')}</p>
                <p>{selectedUnderwriter.experience} years of experience</p>
                <p>Region: {selectedUnderwriter.region}</p>
                <button 
                  type="button" 
                  className="secondary-btn" 
                  onClick={() => setSelectedUnderwriter(null)}
                >
                  Change Underwriter
                </button>
              </div>
            ) : (
              <div className="underwriter-selection">
                <p>Please select an underwriter for your application:</p>
                <div className="underwriters-list">
                  {underwriters.map(underwriter => (
                    <div 
                      key={underwriter.id} 
                      className="underwriter-card"
                      onClick={() => handleUnderwriterSelect(underwriter)}
                    >
                      <h4>{underwriter.name}</h4>
                      <p><strong>Specializes in:</strong> {underwriter.types.join(', ')}</p>
                      <p><strong>Experience:</strong> {underwriter.experience} years</p>
                      <p><strong>Region:</strong> {underwriter.region}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="primary-btn"
              disabled={!selectedUnderwriter}
            >
              Submit Application
            </button>
          </div>
        </form>
      </div>
    );
  };
  
  const renderApplicationsList = () => {
    return (
      <div className="applications-list-container">
        <h2>My Applications</h2>
        
        <div className="applications-table">
          <div className="table-header">
            <div className="header-cell">ID</div>
            <div className="header-cell">Type</div>
            <div className="header-cell">Underwriter</div>
            <div className="header-cell">Date</div>
            <div className="header-cell">Status</div>
            <div className="header-cell">Actions</div>
          </div>
          
          {mockApplications.map(app => (
            <div key={app.id} className="table-row">
              <div className="cell">{app.id}</div>
              <div className="cell">{app.type}</div>
              <div className="cell">{app.underwriter}</div>
              <div className="cell">{app.date}</div>
              <div className="cell">
                <span className={`status-badge ${app.status.toLowerCase().replace(' ', '-')}`}>
                  {app.status}
                </span>
              </div>
              <div className="cell">
                <button className="action-btn">
                  {app.status === 'Completed' ? 'View Report' : 'View Details'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const renderReports = () => {
    const completedApplications = mockApplications.filter(app => app.status === 'Completed');
    
    return (
      <div className="reports-container">
        <h2>Generated Reports</h2>
        
        {completedApplications.length > 0 ? (
          <div className="reports-list">
            {completedApplications.map(app => (
              <div key={app.id} className="report-card">
                <div className="report-header">
                  <h3>{app.type} Report</h3>
                  <span className="report-date">{app.date}</span>
                </div>
                <div className="report-details">
                  <p><strong>Application ID:</strong> {app.id}</p>
                  <p><strong>Underwriter:</strong> {app.underwriter}</p>
                  <p><strong>Status:</strong> {app.status}</p>
                </div>
                <div className="report-actions">
                  <button className="primary-btn">View Full Report</button>
                  <button className="secondary-btn">Download PDF</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No reports available yet. Completed applications will generate reports here.</p>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="applicant-dashboard">
      <header className="dashboard-header">
        <div className="logo">AI Underwriting Risk Assessment</div>
        <div className="user-menu">
          <span className="user-name">John Applicant</span>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </header>
      
      <div className="dashboard-container">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>Applicant Portal</h2>
          </div>
          
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'newApplication' ? 'active' : ''}`}
              onClick={() => handleTabChange('newApplication')}
            >
              New Application
            </button>
            <button 
              className={`nav-item ${activeTab === 'applications' ? 'active' : ''}`}
              onClick={() => handleTabChange('applications')}
            >
              My Applications
            </button>
            <button 
              className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => handleTabChange('reports')}
            >
              Reports
            </button>
            <button className="nav-item">
              Profile Settings
            </button>
          </nav>
        </aside>
        
        <main className="main-content">
          {activeTab === 'newApplication' && renderNewApplicationForm()}
          {activeTab === 'applications' && renderApplicationsList()}
          {activeTab === 'reports' && renderReports()}
        </main>
      </div>
    </div>
  );
};

export default ApplicantDashboard;
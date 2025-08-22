import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ApplicantDashboard.css';

const ApplicantDashboard = ({ onLogout, userId = 'user123' }) => {
  const [activeTab, setActiveTab] = useState('newApplication');
  const [applications, setApplications] = useState([]);
  const [underwriters, setUnderwriters] = useState([]); // ⬅️ fetched underwriters
  const [selectedUnderwriter, setSelectedUnderwriter] = useState(null);
  const [insuranceType, setInsuranceType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api';

  // Fetch applications and underwriters on mount
  useEffect(() => {
    fetchApplications();
    fetchUnderwriters();
  }, []);

  // Fetch applications for logged-in applicant
  const fetchApplications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/applications/applicant/${userId}`);
      if (response.data.success) {
        setApplications(response.data.applications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  // ✅ Fetch underwriters from backend
  const fetchUnderwriters = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/underwriters`);
      if (response.data.success) {
        setUnderwriters(response.data.underwriters);
      }
    } catch (error) {
      console.error('Error fetching underwriters:', error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'applications') {
      fetchApplications();
    }
  };

  const handleUnderwriterSelect = (underwriter) => {
    setSelectedUnderwriter(underwriter);
  };
  
  const collectFormData = (formElement) => {
    const formData = new FormData(formElement);
    const data = {};
    
    // Collect basic form data
    for (let [key, value] of formData.entries()) {
      if (data[key]) {
        // Handle multiple values (checkboxes)
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    }
    
    // Structure the data properly
    const structuredData = {
      applicantId: userId,
      selectedUnderwriter: selectedUnderwriter,
      insuranceType: insuranceType,
      personalInfo: {
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        maritalStatus: data.maritalStatus,
        email: data.email,
        phone: data.phone,
        address: data.address,
      },
      employmentInfo: {
        occupation: data.occupation,
        industry: data.industry,
        employmentType: data.employmentType,
        annualIncome: parseInt(data.annualIncome) || 0,
      },
      consents: {
        healthConsent: !!data.healthConsent,
        creditConsent: !!data.creditConsent,
        apraConsent: !!data.apraConsent,
      },
      additionalDetails: data.assetDetails || '',
    };
    
    // Add health info for applicable insurance types
    if (['Life', 'Health', 'Income Protection', 'TPD', 'Trauma'].includes(insuranceType)) {
      structuredData.healthInfo = {
        smoker: data.smoker === 'Yes',
        alcohol: data.alcohol === 'Yes',
        height: parseInt(data.height) || 0,
        weight: parseInt(data.weight) || 0,
        preExistingConditions: data.preExistingConditions === 'Yes',
        medicalConditions: data.medicalConditions || '',
        familyHistory: Array.isArray(data.familyHistory) ? data.familyHistory : [data.familyHistory].filter(Boolean),
      };
    }
    
    // Add insurance-specific data
    const insuranceSpecificData = {};
    
    switch (insuranceType) {
      case 'Life':
        insuranceSpecificData.coverageAmount = parseInt(data.lifeCoverageAmount) || 0;
        insuranceSpecificData.policyTerm = data.lifePolicyTerm;
        insuranceSpecificData.beneficiaries = data.beneficiaries;
        insuranceSpecificData.existingLifeInsurance = data.existingLifeInsurance === 'Yes';
        insuranceSpecificData.existingLifeDetails = data.existingLifeDetails;
        break;
      case 'Health':
        insuranceSpecificData.familyComposition = data.familyComposition;
        insuranceSpecificData.extrasCover = Array.isArray(data.extrasCover) ? data.extrasCover : [data.extrasCover].filter(Boolean);
        insuranceSpecificData.existingHealthInsurance = data.existingHealthInsurance === 'Yes';
        insuranceSpecificData.medicareNumber = data.medicareNumber;
        break;
      case 'Motor':
        insuranceSpecificData.vehicleMakeModel = data.vehicleMakeModel;
        insuranceSpecificData.yearOfManufacture = parseInt(data.yearOfManufacture);
        insuranceSpecificData.registrationNumber = data.registrationNumber;
        insuranceSpecificData.vehicleUsage = data.vehicleUsage;
        insuranceSpecificData.annualKilometers = parseInt(data.annualKilometers);
        insuranceSpecificData.coverType = data.coverType;
        break;
      // Add other cases as needed
    }
    
    structuredData.insuranceSpecificData = insuranceSpecificData;
    
    return structuredData;
  };
  
  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = collectFormData(e.target);
      
      const response = await axios.post(`${API_BASE_URL}/applications`, formData);
      
      if (response.data.success) {
        alert(`Application submitted successfully! Application ID: ${response.data.applicationId}`);
        
        // Reset form
        setSelectedUnderwriter(null);
        setInsuranceType('');
        e.target.reset();
        
        // Refresh applications list
        fetchApplications();
      } else {
        alert('Failed to submit application. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Error submitting application. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleInsuranceTypeChange = (e) => {
    setInsuranceType(e.target.value);
  };
  const renderUnderwriterSelection = () => {
  return (
    <div className="form-section">
      <h3>Select Underwriter</h3>
      {selectedUnderwriter ? (
        <div className="selected-underwriter">
          <h4>Selected: {selectedUnderwriter.name}</h4>
          <p>Specializes in: {selectedUnderwriter.specializations?.join(', ')}</p>
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
            {underwriters.length === 0 ? (
              <p>No underwriters available.</p>
            ) : (
              underwriters.map((underwriter) => (
                <div 
  key={underwriter._id} 
  className="underwriter-card"
  onClick={() => handleUnderwriterSelect(underwriter)}
>
  <h4>{underwriter.name}</h4>
  <p><strong>Specializes in:</strong> {underwriter.insuranceTypes?.join(', ')}</p>
  <p><strong>Experience:</strong> {underwriter.yearsExperience} years</p>
  <p><strong>Region:</strong> {underwriter.region}</p>
</div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
  // ... (rest of the render methods remain the same, but with fixed field IDs)
  
  const renderNewApplicationForm = () => {
    return (
      <div className="application-form-container">
        <h2>New Insurance Application</h2>
        
        <form onSubmit={handleSubmitApplication} className="application-form">
          <div className="form-section">
            <h3>Insurance Details</h3>
            
            <div className="form-group">
              <label htmlFor="insuranceType">Insurance Type</label>
              <select 
                id="insuranceType" 
                name="insuranceType"
                value={insuranceType} 
                onChange={handleInsuranceTypeChange} 
                required
              >
                <option value="">Select Insurance Type</option>
                <option value="Life">Life Insurance</option>
                <option value="Health">Health Insurance</option>
                <option value="Income Protection">Income Protection Insurance</option>
                <option value="TPD">Total & Permanent Disability Insurance</option>
                <option value="Trauma">Trauma / Critical Illness Insurance</option>
                <option value="Home">Home & Contents Insurance</option>
                <option value="Motor">Motor Vehicle Insurance</option>
                <option value="Travel">Travel Insurance</option>
                <option value="Business">Business Insurance</option>
                <option value="Super">Superannuation-linked Insurance</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="baseCoverageAmount">Coverage Amount ($)</label>
              <input 
                type="number" 
                id="baseCoverageAmount" 
                name="baseCoverageAmount"
                min="1000" 
                step="1000" 
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="basePolicyTerm">Policy Term</label>
              <select id="basePolicyTerm" name="basePolicyTerm" required>
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
          
          {/* Personal & Identity Information */}
          <div className="form-section">
            <h3>Personal & Identity Information</h3>
            
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input type="text" id="fullName" name="fullName" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input type="date" id="dateOfBirth" name="dateOfBirth" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select id="gender" name="gender" required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="maritalStatus">Marital Status</label>
              <select id="maritalStatus" name="maritalStatus" required>
                <option value="">Select Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="De Facto">De Facto</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" name="email" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Contact Number</label>
              <input type="tel" id="phone" name="phone" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="address">Residential Address</label>
              <textarea id="address" name="address" rows="3" required></textarea>
            </div>
          </div>
          
          {/* Employment & Financial Information */}
          <div className="form-section">
            <h3>Employment & Financial Information</h3>
            
            <div className="form-group">
              <label htmlFor="occupation">Occupation</label>
              <input type="text" id="occupation" name="occupation" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="industry">Industry</label>
              <select id="industry" name="industry" required>
                <option value="">Select Industry</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Construction">Construction</option>
                <option value="IT">IT</option>
                <option value="Education">Education</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="employmentType">Employment Type</label>
              <select id="employmentType" name="employmentType" required>
                <option value="">Select Type</option>
                <option value="Permanent">Permanent</option>
                <option value="Contract">Contract</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Casual">Casual</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="annualIncome">Annual Income (AUD)</label>
              <input type="number" id="annualIncome" name="annualIncome" min="0" step="1000" required />
            </div>
          </div>
          
          {/* Dynamic Insurance-Specific Fields */}
          {insuranceType && (
            <div className="form-section">
              <h3>{insuranceType} Insurance Details</h3>
              
              {/* Life Insurance Fields */}
              {insuranceType === 'Life' && (
                <>
                  <div className="form-group">
                    <label htmlFor="lifeCoverageAmount">Desired Coverage Amount (AUD)</label>
                    <input 
                      type="number" 
                      id="lifeCoverageAmount" 
                      name="lifeCoverageAmount"
                      min="10000" 
                      step="10000" 
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="lifePolicyTerm">Policy Term</label>
                    <select id="lifePolicyTerm" name="lifePolicyTerm" required>
                      <option value="">Select Term</option>
                      <option value="10">10 Years</option>
                      <option value="20">20 Years</option>
                      <option value="Lifetime">Lifetime</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="beneficiaries">Beneficiaries (Name, Relationship, % Share)</label>
                    <textarea 
                      id="beneficiaries" 
                      name="beneficiaries"
                      rows="3" 
                      placeholder="John Doe, Spouse, 100%" 
                      required
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label>Do you already hold life insurance?</label>
                    <div className="radio-group">
                      <label><input type="radio" name="existingLifeInsurance" value="Yes" /> Yes</label>
                      <label><input type="radio" name="existingLifeInsurance" value="No" /> No</label>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="existingLifeDetails">If yes, provide insurer and sum insured</label>
                    <input type="text" id="existingLifeDetails" name="existingLifeDetails" />
                  </div>
                </>
              )}
              
              {/* Health Insurance Fields */}
              {insuranceType === 'Health' && (
                <>
                  <div className="form-group">
                    <label htmlFor="familyComposition">Family Composition</label>
                    <select id="familyComposition" name="familyComposition" required>
                      <option value="">Select Composition</option>
                      <option value="Single">Single</option>
                      <option value="Couple">Couple</option>
                      <option value="Family">Family</option>
                      <option value="Single Parent Family">Single Parent Family</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Do you need extras cover?</label>
                    <div className="checkbox-group">
                      <label><input type="checkbox" name="extrasCover" value="Dental" /> Dental</label>
                      <label><input type="checkbox" name="extrasCover" value="Optical" /> Optical</label>
                      <label><input type="checkbox" name="extrasCover" value="Physio" /> Physio</label>
                      <label><input type="checkbox" name="extrasCover" value="Mental Health" /> Mental Health</label>
                      <label><input type="checkbox" name="extrasCover" value="Chiropractic" /> Chiropractic</label>
                      <label><input type="checkbox" name="extrasCover" value="None" /> None</label>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Do you currently have health insurance?</label>
                    <div className="radio-group">
                      <label><input type="radio" name="existingHealthInsurance" value="Yes" /> Yes</label>
                      <label><input type="radio" name="existingHealthInsurance" value="No" /> No</label>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="medicareNumber">Medicare Number</label>
                    <input type="text" id="medicareNumber" name="medicareNumber" />
                  </div>
                </>
              )}
              
              {/* Motor Insurance Fields */}
              {insuranceType === 'Motor' && (
                <>
                  <div className="form-group">
                    <label htmlFor="vehicleMakeModel">Vehicle Make & Model</label>
                    <input type="text" id="vehicleMakeModel" name="vehicleMakeModel" required />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="yearOfManufacture">Year of Manufacture</label>
                    <input type="number" id="yearOfManufacture" name="yearOfManufacture" min="1900" max="2023" required />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="registrationNumber">Registration Number</label>
                    <input type="text" id="registrationNumber" name="registrationNumber" required />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="vehicleUsage">Vehicle Usage</label>
                    <select id="vehicleUsage" name="vehicleUsage" required>
                      <option value="">Select Usage</option>
                      <option value="Private">Private</option>
                      <option value="Business">Business</option>
                      <option value="Rideshare">Rideshare</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="annualKilometers">Annual Kilometers Driven</label>
                    <input type="number" id="annualKilometers" name="annualKilometers" min="0" step="1000" required />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="coverType">Desired Cover Type</label>
                    <select id="coverType" name="coverType" required>
                      <option value="">Select Cover Type</option>
                      <option value="Comprehensive">Comprehensive</option>
                      <option value="Third Party Fire & Theft">Third Party Fire & Theft</option>
                      <option value="Third Party Only">Third Party Only</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          )}
          
          {/* Health & Lifestyle Information */}
          {(insuranceType === 'Life' || insuranceType === 'Health' || insuranceType === 'Income Protection' || 
            insuranceType === 'TPD' || insuranceType === 'Trauma') && (
            <div className="form-section">
              <h3>Health & Lifestyle Information</h3>
              
              <div className="form-group">
                <label>Do you smoke?</label>
                <div className="radio-group">
                  <label><input type="radio" name="smoker" value="Yes" /> Yes</label>
                  <label><input type="radio" name="smoker" value="No" /> No</label>
                </div>
              </div>
              
              <div className="form-group">
                <label>Do you drink alcohol regularly?</label>
                <div className="radio-group">
                  <label><input type="radio" name="alcohol" value="Yes" /> Yes</label>
                  <label><input type="radio" name="alcohol" value="No" /> No</label>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="height">Height (cm)</label>
                <input type="number" id="height" name="height" min="0" required />
              </div>
              
              <div className="form-group">
                <label htmlFor="weight">Weight (kg)</label>
                <input type="number" id="weight" name="weight" min="0" required />
              </div>
              
              <div className="form-group">
                <label>Do you have pre-existing medical conditions?</label>
                <div className="radio-group">
                  <label><input type="radio" name="preExistingConditions" value="Yes" /> Yes</label>
                  <label><input type="radio" name="preExistingConditions" value="No" /> No</label>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="medicalConditions">If yes, please list conditions</label>
                <textarea id="medicalConditions" name="medicalConditions" rows="3"></textarea>
              </div>
              
              <div className="form-group">
                <label>Family history of illness?</label>
                <div className="checkbox-group">
                  <label><input type="checkbox" name="familyHistory" value="Heart Disease" /> Heart Disease</label>
                  <label><input type="checkbox" name="familyHistory" value="Diabetes" /> Diabetes</label>
                  <label><input type="checkbox" name="familyHistory" value="Cancer" /> Cancer</label>
                  <label><input type="checkbox" name="familyHistory" value="Stroke" /> Stroke</label>
                  <label><input type="checkbox" name="familyHistory" value="None" /> None</label>
                </div>
              </div>
            </div>
          )}
          
          {/* Compliance & Consent */}
          <div className="form-section">
            <h3>Compliance & Consent</h3>
            
            <div className="form-group">
              <div className="checkbox-group">
                <label>
                  <input type="checkbox" id="healthConsent" name="healthConsent" required />
                  I agree to share my health & financial information for underwriting purposes
                </label>
              </div>
            </div>
            
            <div className="form-group">
              <div className="checkbox-group">
                <label>
                  <input type="checkbox" id="creditConsent" name="creditConsent" required />
                  I consent to credit & identity checks
                </label>
              </div>
            </div>
            
            <div className="form-group">
              <div className="checkbox-group">
                <label>
                  <input type="checkbox" id="apraConsent" name="apraConsent" required />
                  I agree to APRA-compliant data storage and disclosure rules
                </label>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="assetDetails">Additional Details</label>
              <textarea id="assetDetails" name="assetDetails" rows="3"></textarea>
            </div>
          </div>
          
          {renderUnderwriterSelection()}
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="primary-btn"
              disabled={!selectedUnderwriter || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
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
        
        {applications.length === 0 ? (
          <div className="empty-state">
            <p>No applications found. Submit your first application to get started!</p>
          </div>
        ) : (
          <div className="applications-table">
            <div className="table-header">
              <div className="header-cell">ID</div>
              <div className="header-cell">Type</div>
              <div className="header-cell">Underwriter</div>
              <div className="header-cell">Date</div>
              <div className="header-cell">Status</div>
              <div className="header-cell">Actions</div>
            </div>
            
            {applications.map(app => (
              <div key={app._id} className="table-row">
                <div className="cell">{app._id.slice(-6)}</div>
                <div className="cell">{app.insuranceType}</div>
                <div className="cell">{app.underwriterName}</div>
                <div className="cell">{new Date(app.createdAt).toLocaleDateString()}</div>
                <div className="cell">
                  <span className={`status-badge ${app.status.toLowerCase().replace(' ', '-')}`}>
                    {app.status}
                  </span>
                </div>
                <div className="cell">
                  <button className="action-btn" onClick={() => viewApplicationDetails(app)}>
                    {app.status === 'Completed' ? 'View Report' : 'View Details'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  const viewApplicationDetails = (application) => {
    // You can implement a modal or navigate to a detailed view
    console.log('Application details:', application);
    alert(`Application Details:\nID: ${application._id}\nType: ${application.insuranceType}\nStatus: ${application.status}\nSubmitted: ${new Date(application.createdAt).toLocaleString()}`);
  };
  
  const renderReports = () => {
    const completedApplications = applications.filter(app => app.status === 'Completed');
    
    return (
      <div className="reports-container">
        <h2>Generated Reports</h2>
        
        {completedApplications.length > 0 ? (
          <div className="reports-list">
            {completedApplications.map(app => (
              <div key={app._id} className="report-card">
                <div className="report-header">
                  <h3>{app.insuranceType} Report</h3>
                  <span className="report-date">{new Date(app.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="report-details">
                  <p><strong>Application ID:</strong> {app._id.slice(-6)}</p>
                  <p><strong>Underwriter:</strong> {app.underwriterName}</p>
                  <p><strong>Status:</strong> {app.status}</p>
                </div>
                <div className="report-actions">
                  <button className="primary-btn" onClick={() => viewApplicationDetails(app)}>
                    View Full Report
                  </button>
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

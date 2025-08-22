import React, { useState } from 'react';
import './Login.css';
import axios from "axios";

const Login = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState('applicant');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Additional fields for underwriter registration
  const [yearsExperience, setYearsExperience] = useState('');
  const [region, setRegion] = useState('');
  const [insuranceTypes, setInsuranceTypes] = useState([]);
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Reset form when switching tabs
    setEmail('');
    setPassword('');
    setIsRegistering(false);
  };

  const handleInsuranceTypeChange = (type) => {
    if (insuranceTypes.includes(type)) {
      setInsuranceTypes(insuranceTypes.filter(t => t !== type));
    } else {
      setInsuranceTypes([...insuranceTypes, type]);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    if (isRegistering) {
      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      // Prepare payload
      const payload = {
        name,
        email,
        password,
        role: activeTab, // "applicant" or "underwriter"
      };

      // If underwriter, add extra fields
      if (activeTab === "underwriter") {
        payload.yearsExperience = yearsExperience;
        payload.region = region;
        payload.insuranceTypes = insuranceTypes;
      }

      // Call register API
      const res = await axios.post("http://localhost:5000/api/auth/register", payload);

      if (res.data.success) {
        alert("Account created successfully! Please login.");
        setIsRegistering(false);
      }
    } else {
      // Login
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      if (res.data.success) {
        // Save token & user info in localStorage
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("userId", res.data.userId);

        // Redirect to dashboard
        onLogin(res.data.role);
      }
    }
  } catch (error) {
    console.error(error);
    alert(error.response?.data?.message || "Something went wrong");
  }
};


  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>AI Underwriting Risk Assessment</h1>
          <div className="login-tabs">
            <button 
              className={`tab-btn ${activeTab === 'applicant' ? 'active' : ''}`}
              onClick={() => handleTabChange('applicant')}
            >
              Applicant
            </button>
            <button 
              className={`tab-btn ${activeTab === 'underwriter' ? 'active' : ''}`}
              onClick={() => handleTabChange('underwriter')}
            >
              Underwriter
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <h2>{isRegistering ? 'Create Account' : 'Login'}</h2>
          
          {isRegistering && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input 
                type="text" 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          
          {isRegistering && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input 
                type="password" 
                id="confirmPassword" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
              />
            </div>
          )}
          
          {/* Additional fields for underwriter registration */}
          {isRegistering && activeTab === 'underwriter' && (
            <div className="underwriter-fields">
              <div className="form-group">
                <label htmlFor="experience">Years of Experience</label>
                <input 
                  type="number" 
                  id="experience" 
                  value={yearsExperience} 
                  onChange={(e) => setYearsExperience(e.target.value)} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="region">Region</label>
                <select 
                  id="region" 
                  value={region} 
                  onChange={(e) => setRegion(e.target.value)} 
                  required
                >
                  <option value="">Select Region</option>
                  <option value="North America">North America</option>
                  <option value="Europe">Europe</option>
                  <option value="Asia Pacific">Asia Pacific</option>
                  <option value="Latin America">Latin America</option>
                  <option value="Africa">Africa</option>
                  <option value="Middle East">Middle East</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Insurance Types</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={insuranceTypes.includes('Life')} 
                      onChange={() => handleInsuranceTypeChange('Life')} 
                    />
                    Life Insurance
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={insuranceTypes.includes('Health')} 
                      onChange={() => handleInsuranceTypeChange('Health')} 
                    />
                    Health Insurance
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={insuranceTypes.includes('Property')} 
                      onChange={() => handleInsuranceTypeChange('Property')} 
                    />
                    Property Insurance
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={insuranceTypes.includes('Auto')} 
                      onChange={() => handleInsuranceTypeChange('Auto')} 
                    />
                    Auto Insurance
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={insuranceTypes.includes('Business')} 
                      onChange={() => handleInsuranceTypeChange('Business')} 
                    />
                    Business Insurance
                  </label>
                </div>
              </div>
            </div>
          )}
          
          <div className="form-actions">
            <button type="submit" className="primary-btn">
              {isRegistering ? 'Register' : 'Login'}
            </button>
            <button 
              type="button" 
              className="secondary-btn" 
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering ? 'Back to Login' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
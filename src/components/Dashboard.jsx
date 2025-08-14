import React from 'react';
import RiskAlerts from './RiskAlerts';
import GeoRiskMap from './GeoRiskMap';
import RiskScore from './RiskScore';
import ScenarioTesting from './ScenarioTesting';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="logo">AI Underwriter Pro</div>
        <div className="nav-links">
          <a href="#">Home</a>
          <a href="#">New Policy Design</a>
          <a href="#">Risk Evaluation</a>
          <a href="#">Compliance Check</a>
          <a href="#">Portfolio Trends</a>
          <a href="#">Underwriter</a>
        </div>
      </nav>
      
      <div className="sidebar">
        <button className="upload-btn">
          <span>Upload Policy / Application</span>
        </button>
        <button className="design-btn">
          <span>Design New Policy</span>
        </button>
        <div className="sidebar-links">
          <a href="#">Scenario Testing</a>
          <a href="#">Scenario results</a>
          <a href="#">Before vs After</a>
        </div>
      </div>

      <div className="main-content">
        <div className="top-row">
          <RiskAlerts />
          <GeoRiskMap />
        </div>
        <div className="bottom-row">
          <RiskScore />
          <ScenarioTesting />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
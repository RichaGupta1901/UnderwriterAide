import React from 'react';
import './Dashboard.css';

const ScenarioTesting = () => {
  return (
    <div className="scenario-testing">
      <h3>Scenario Testing</h3>
      <div className="scenario-controls">
        <div className="scenario-selector">
          <label>Select Scenario:</label>
          <select>
            <option>Natural Disaster Impact</option>
            <option>Market Volatility</option>
            <option>Regulatory Changes</option>
            <option>Cyber Security Breach</option>
          </select>
        </div>
        <div className="parameter-controls">
          <div className="parameter">
            <label>Severity Level:</label>
            <input type="range" min="1" max="10" defaultValue="5" />
          </div>
          <div className="parameter">
            <label>Time Horizon:</label>
            <select>
              <option>Short-term (1-3 months)</option>
              <option>Medium-term (3-12 months)</option>
              <option>Long-term (1-5 years)</option>
            </select>
          </div>
        </div>
        <button className="run-scenario-btn">Run Scenario Analysis</button>
      </div>
      <div className="scenario-results">
        <p>Select and run a scenario to see projected impact on risk profile</p>
      </div>
    </div>
  );
};

export default ScenarioTesting;
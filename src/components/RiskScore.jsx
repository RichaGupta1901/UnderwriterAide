import React from 'react';
import './Dashboard.css';

const RiskScore = () => {
  return (
    <div className="risk-score">
      <h3>AI Risk Score</h3>
      <div className="score-display">
        <div className="score-circle">
          <span className="score-value">78</span>
        </div>
        <div className="score-label">Medium Risk</div>
      </div>
      <div className="score-details">
        <div className="detail-item">
          <span className="detail-label">Financial Risk:</span>
          <span className="detail-value">Medium (65)</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Operational Risk:</span>
          <span className="detail-value">High (85)</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Compliance Risk:</span>
          <span className="detail-value">Low (45)</span>
        </div>
      </div>
    </div>
  );
};

export default RiskScore;
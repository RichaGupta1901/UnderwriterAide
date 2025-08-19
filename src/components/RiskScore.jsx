// src/components/RiskScore.jsx

import React from 'react';
//import './RiskScore.css';

// This component now receives 'score' and 'level' as props from its parent
const RiskScore = ({ score, level }) => {
  return (
    <div className="risk-score card">
      <h2>AI Risk Score</h2>
      <div className="score-circle">{score}</div>
      <p>{level}</p>
    </div>
  );
};

export default RiskScore;
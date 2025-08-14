import React from 'react';

const RiskAlerts = () => {
  const alerts = [
    { icon: '⚠️', text: 'Cyclone alert in Queensland' },
    { icon: '🦠', text: 'Pandemic health risk trends' },
    { icon: '📈', text: 'Economic instability' },
  ];

  return (
    <div className="risk-alerts">
      <h2>Current Risk Alerts</h2>
      <div className="alerts-list">
        {alerts.map((alert, index) => (
          <div key={index} className="alert-item">
            <span className="alert-icon">{alert.icon}</span>
            <span className="alert-text">{alert.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskAlerts;
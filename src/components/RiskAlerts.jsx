// src/components/RiskAlerts.jsx
import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import './RiskAlerts.css';

const RiskAlerts = ({
  locationWeather,
  location,
  hazardAlerts = [],
  financialAlerts = [], // NEW: Add financial alerts prop
  alertCount = 0,
  financialAlertCount = 0, // NEW: Add financial alert count prop
  lastUpdated
}) => {
  const [activeTab, setActiveTab] = useState('alerts');
  const [generalAlerts, setGeneralAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch general alerts when component mounts or location changes
  useEffect(() => {
    if (location && location !== 'Not specified' && location !== 'Error') {
      fetchGeneralAlerts(location);
    } else {
      fetchGeneralAlerts(); // Fetch without location
    }
  }, [location]);

  const fetchGeneralAlerts = async (locationParam = null) => {
    setLoading(true);
    try {
      const url = locationParam
        ? `http://localhost:5000/api/risk_alerts?location=${encodeURIComponent(locationParam)}`
        : 'http://localhost:5000/api/risk_alerts';

      const response = await fetch(url);
      const data = await response.json();
      setGeneralAlerts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching general alerts:', error);
      setGeneralAlerts([
        { type: 'Error', details: 'Unable to fetch current alerts' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  // Get alert type styling
  const getAlertTypeClass = (type) => {
    const typeMap = {
      'News Alert': 'alert-news',
      'Emergency Alert': 'alert-emergency',
      'Financial Alert': 'alert-financial', // NEW
      'Market Alert': 'alert-market', // NEW
      'Weather Hazard': 'alert-weather',
      'Hazard Alert': 'alert-hazard',
      'Weather': 'alert-weather',
      'Economic': 'alert-economic',
      'Error': 'alert-error'
    };
    return typeMap[type] || 'alert-general';
  };

  // Render individual alert item
  const renderAlert = (alert, index, isFromAssessment = false) => (
    <div key={`${isFromAssessment ? 'assessment' : 'general'}-${index}`}
         className={`alert-item ${getAlertTypeClass(alert.type)}`}>
      <div className="alert-header">
        <span className="alert-type">{alert.type}</span>
        {alert.symbol && <span className="alert-symbol">{alert.symbol}</span>} {/* NEW: Show stock symbol */}
        {alert.impact_level && <span className={`impact-badge ${alert.impact_level.toLowerCase()}`}>{alert.impact_level}</span>} {/* NEW: Impact level */}
        {isFromAssessment && alert.published && (
          <span className="alert-time">
            {formatTimestamp(alert.published)}
          </span>
        )}
      </div>

      <div className="alert-content">
        {alert.title && <h4 className="alert-title">{alert.title}</h4>}
        <p className="alert-details">{alert.details}</p>

        <div className="alert-footer">
          {alert.source && (
            <div className="alert-source">Source: {alert.source}</div>
          )}
          {alert.category && (
            <div className="alert-category">Category: {alert.category}</div>
          )}
        </div>

        {alert.url && (
          <a href={alert.url} target="_blank" rel="noopener noreferrer"
             className="alert-link">
            Read more →
          </a>
        )}
      </div>
    </div>
  );

  // NEW: Financial Alerts Card Component
  const FinancialAlertsCard = ({ alerts }) => (
    <div className="financial-alerts-section">
      {alerts.length > 0 ? (
        alerts.map((alert, index) => (
          <div key={index} className={`alert-item financial-alert ${
            alert.impact_level === 'High' ? 'high-impact' :
            alert.impact_level === 'Medium' ? 'medium-impact' : 'low-impact'
          }`}>
            <div className="alert-header">
              <div className="financial-header-left">
                <span className="alert-type">{alert.type}</span>
                {alert.symbol && <span className="alert-symbol">{alert.symbol}</span>}
              </div>
              <div className="financial-header-right">
                {alert.impact_level && (
                  <span className={`impact-badge ${alert.impact_level.toLowerCase()}`}>
                    {alert.impact_level}
                  </span>
                )}
                {alert.impact_level === 'High' && (
                  <AlertTriangle className="impact-icon" />
                )}
              </div>
            </div>
            <div className="alert-content">
              <h4 className="alert-title">{alert.title}</h4>
              <p className="alert-details">{alert.details}</p>
              <div className="alert-meta">
                {alert.category && <span className="alert-category">{alert.category}</span>}
                {alert.published && (
                  <span className="alert-time">
                    {new Date(alert.published).toLocaleDateString()}
                  </span>
                )}
              </div>
              {alert.url && (
                <a href={alert.url} target="_blank" rel="noopener noreferrer" className="alert-link">
                  Read more →
                </a>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="no-alerts">
          <TrendingUp className="no-alerts-icon" />
          <h4>No Financial Alerts</h4>
          <p>No significant financial market alerts at this time</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="risk-alerts">
      <div className="alerts-header">
        <h3>Risk Monitoring Dashboard</h3>
        {location && location !== 'Not specified' && location !== 'Error' && (
          <div className="location-info">
            <span className="location-label">📍 {location}</span>
            <div className="alert-summary">
              <span className="hazard-count">{alertCount} hazard</span>
              <span className="financial-count">{financialAlertCount} financial</span>
              <span className="total-count">({alertCount + financialAlertCount} total)</span>
            </div>
          </div>
        )}
        {lastUpdated && (
          <div className="last-updated">
            Last updated: {formatTimestamp(lastUpdated)}
          </div>
        )}
      </div>

      {/* Enhanced Tab Navigation */}
      <div className="alerts-tabs">
        <button
          className={`tab ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          Hazard News ({hazardAlerts.length})
        </button>
        <button
          className={`tab ${activeTab === 'financial' ? 'active' : ''}`}
          onClick={() => setActiveTab('financial')}
        >
          Financial ({financialAlerts.length})
        </button>
        <button
          className={`tab ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General ({generalAlerts.length})
        </button>
        {locationWeather && (
          <button
            className={`tab ${activeTab === 'weather' ? 'active' : ''}`}
            onClick={() => setActiveTab('weather')}
          >
            Weather
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="alerts-content">
        {loading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <span>Loading alerts...</span>
          </div>
        )}

        {/* Location-specific hazard alerts from PDF assessment */}
        {activeTab === 'alerts' && !loading && (
          <div className="alerts-list">
            {hazardAlerts.length > 0 ? (
              <>
                <div className="section-header">
                  <h4>Location-Specific Hazard News</h4>
                  <p>Emergency and hazard alerts for {location || 'the detected location'}</p>
                </div>
                {hazardAlerts.map((alert, index) => renderAlert(alert, index, true))}
              </>
            ) : (
              <div className="no-alerts">
                <div className="no-alerts-icon">📰</div>
                <h4>No Location-Specific Alerts</h4>
                <p>
                  {location === 'Not specified' || location === 'Error'
                    ? 'Upload a policy document to get location-specific risk alerts'
                    : `No current hazard alerts found for ${location}`
                  }
                </p>
                {location && location !== 'Not specified' && location !== 'Error' && (
                  <button
                    className="refresh-button"
                    onClick={() => window.location.reload()}
                  >
                    Refresh Alerts
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* NEW: Financial alerts tab */}
        {activeTab === 'financial' && !loading && (
          <div className="alerts-list">
            <div className="section-header">
              <h4>Financial Market Alerts</h4>
              <p>Recent financial news and market movements that could impact risk assessment</p>
            </div>
            <FinancialAlertsCard alerts={financialAlerts} />
          </div>
        )}

        {/* General alerts */}
        {activeTab === 'general' && !loading && (
          <div className="alerts-list">
            <div className="section-header">
              <h4>General Risk Monitoring</h4>
              <p>Broader risk alerts and monitoring information</p>
            </div>
            {generalAlerts.length > 0 ? (
              generalAlerts.map((alert, index) => renderAlert(alert, index, false))
            ) : (
              <div className="no-alerts">
                <div className="no-alerts-icon">⚠️</div>
                <h4>No General Alerts</h4>
                <p>All monitoring systems are operating normally</p>
              </div>
            )}
          </div>
        )}

        {/* Weather information */}
        {activeTab === 'weather' && locationWeather && !loading && (
          <div className="weather-info">
            <div className="section-header">
              <h4>Weather Information</h4>
              <p>Current weather conditions for {location}</p>
            </div>
            <div className="weather-card">
              <div className="weather-icon">🌤️</div>
              <div className="weather-details">
                <p>{locationWeather}</p>
                <small>Data provided by OpenWeatherMap</small>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskAlerts;
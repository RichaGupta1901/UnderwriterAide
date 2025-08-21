import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import './RiskAlerts.css';

const RiskAlerts = ({
  locationWeather,
  location,
  hazardAlerts = [],
  financialAlerts = [],
  alertCount = 0,
  financialAlertCount = 0,
  lastUpdated
}) => {
  const [activeTab, setActiveTab] = useState('alerts');
  const [generalAlerts, setGeneralAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Debugging props on change
  useEffect(() => {
    console.log('RiskAlerts Props Update:', { location, hazardAlerts, financialAlerts, locationWeather });
  }, [location, locationWeather, hazardAlerts, financialAlerts]);

  // Fetch general alerts when component mounts or location changes
  useEffect(() => {
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
        setGeneralAlerts([{ type: 'Error', details: 'Unable to fetch current alerts' }]);
      } finally {
        setLoading(false);
      }
    };

    if (location && location !== 'Not specified' && location !== 'Error') {
      fetchGeneralAlerts(location);
    } else {
      fetchGeneralAlerts();
    }
  }, [location]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  const getAlertTypeClass = (type) => {
    const typeMap = {
      'Emergency Alert': 'alert-emergency',
      'Financial Alert': 'alert-financial',
      'Hazard Alert': 'alert-hazard',
      'Weather': 'alert-weather',
      'Error': 'alert-error'
    };
    return typeMap[type] || 'alert-general';
  };

  // Renders a single alert item with all details
  const renderAlert = (alert, index, isFromAssessment = false) => (
    <div key={`${isFromAssessment ? 'assessment' : 'general'}-${index}`}
         className={`alert-item ${getAlertTypeClass(alert.type)} ${alert.severity ? `severity-${alert.severity.toLowerCase()}` : ''}`}>
      <div className="alert-header">
        <div className="alert-header-left">
          <span className="alert-type">{alert.type}</span>
          {alert.severity && <span className={`severity-badge ${alert.severity.toLowerCase()}`}>{alert.severity}</span>}
        </div>
        {isFromAssessment && alert.published && <span className="alert-time">{formatTimestamp(alert.published)}</span>}
      </div>
      <div className="alert-content">
        {alert.title && <h4 className="alert-title">{alert.title}</h4>}
        <p className="alert-details">{alert.details}</p>
        {alert.keywords_matched && alert.keywords_matched.length > 0 && (
          <div className="alert-keywords">
            <span className="keywords-label">🏷️ Hazard Types:</span>
            <div className="keywords-list">
              {alert.keywords_matched.map((keyword, idx) => (
                <span key={idx} className="keyword-tag">{keyword}</span>
              ))}
            </div>
          </div>
        )}
        <div className="alert-footer">
          {alert.source && <div className="alert-source">Source: {alert.source}</div>}
          {alert.location && <div className="alert-location">📍 {alert.location}</div>}
        </div>
        {alert.url && <a href={alert.url} target="_blank" rel="noopener noreferrer" className="alert-link">Read more →</a>}
      </div>
    </div>
  );

  // Financial Alerts Card Component
  const FinancialAlertsCard = ({ alerts }) => (
    <div className="financial-alerts-section">
      {alerts && alerts.length > 0 ? (
        alerts.map((alert, index) => (
          <div key={index} className={`alert-item financial-alert ${alert.impact_level ? `impact-${alert.impact_level.toLowerCase()}` : ''}`}>
            <div className="alert-header">
                <span className="alert-type">{alert.type}</span>
                {alert.impact_level && <span className={`impact-badge ${alert.impact_level.toLowerCase()}`}>{alert.impact_level}</span>}
            </div>
            <div className="alert-content">
              <h4 className="alert-title">{alert.title}</h4>
              <p className="alert-details">{alert.details}</p>
            </div>
          </div>
        ))
      ) : (
        <div className="no-alerts">
          <TrendingUp className="no-alerts-icon" />
          <h4>No Financial Alerts</h4>
          <p>No significant financial market alerts at this time.</p>
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
        {lastUpdated && <div className="last-updated">Last updated: {formatTimestamp(lastUpdated)}</div>}
      </div>

      <div className="alerts-tabs">
        <button className={`tab ${activeTab === 'alerts' ? 'active' : ''}`} onClick={() => setActiveTab('alerts')}>Hazard News ({hazardAlerts?.length || 0})</button>
        <button className={`tab ${activeTab === 'financial' ? 'active' : ''}`} onClick={() => setActiveTab('financial')}>Financial ({financialAlerts?.length || 0})</button>
        <button className={`tab ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>General ({generalAlerts.length})</button>
        {locationWeather && <button className={`tab ${activeTab === 'weather' ? 'active' : ''}`} onClick={() => setActiveTab('weather')}>Weather</button>}
      </div>

      <div className="alerts-content">
        {loading && <div className="loading-indicator"><div className="spinner"></div><span>Loading alerts...</span></div>}

        {/* Hazard News Tab */}
        {activeTab === 'alerts' && !loading && (
          <div className="alerts-list">
            {hazardAlerts && hazardAlerts.length > 0 ? (
              <>
                <div className="section-header">
                  <h4>🚨 Location-Specific Hazard News</h4>
                  <p>Emergency and hazard alerts for {location || 'the detected location'}</p>
                  <div className="filter-info">
                    <span className="filter-label">📋 Filtered for keywords like:</span>
                    <div className="hazard-keywords-display">
                      {["emergency", "disaster", "fire", "flood", "storm", "warning"].map((keyword, idx) => (
                        <span key={idx} className="filter-keyword">{keyword}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="hazard-summary">
                  <div className="stat-item"><span className="stat-value">{hazardAlerts.length}</span><span className="stat-label">Total Alerts</span></div>
                  <div className="stat-item"><span className="stat-value">{hazardAlerts.filter(a => a.severity === 'High').length}</span><span className="stat-label">High Severity</span></div>
                  <div className="stat-item"><span className="stat-value">{hazardAlerts.filter(a => a.severity === 'Medium').length}</span><span className="stat-label">Medium Severity</span></div>
                </div>
                {hazardAlerts.map((alert, index) => renderAlert(alert, index, true))}
              </>
            ) : (
              <div className="no-alerts">
                <div className="no-alerts-icon">📰</div>
                <h4>No Hazard-Specific Alerts Found</h4>
                <p>{location === 'Not specified' || location === 'Error' ? 'Upload a policy document to get location-specific hazard risk alerts' : `No current hazard alerts found for ${location} matching emergency keywords`}</p>
              </div>
            )}
          </div>
        )}

        {/* Financial News Tab */}
        {activeTab === 'financial' && !loading && (
          <div className="alerts-list">
             <div className="section-header">
              <h4>Financial Market Alerts</h4>
              <p>Recent financial news that could impact risk assessment.</p>
            </div>
            <FinancialAlertsCard alerts={financialAlerts || []} />
          </div>
        )}

        {/* General Alerts Tab */}
        {activeTab === 'general' && !loading && (
           <div className="alerts-list">
            <div className="section-header">
              <h4>General Risk Monitoring</h4>
              <p>Broader risk alerts and monitoring information.</p>
            </div>
            {generalAlerts.length > 0 ? generalAlerts.map((alert, index) => renderAlert(alert, index, false)) : (
              <div className="no-alerts"><div className="no-alerts-icon">⚠️</div><h4>No General Alerts</h4></div>
            )}
          </div>
        )}

        {/* Weather Tab */}
        {activeTab === 'weather' && !loading && (
          <div className="weather-info">
            <div className="section-header">
              <h4>Weather Information</h4>
              <p>Current weather conditions for {location}.</p>
            </div>
            {locationWeather ? (
              <div className="weather-card">
                <div className="weather-icon">🌤️</div>
                <div className="weather-details">
                  {/* FIX: Accessing object properties instead of rendering the object */}
                  <p><strong>{locationWeather.description}</strong></p>
                  <p>Temperature: {locationWeather.temperature}</p>
                  <p>Conditions: {locationWeather.conditions}</p>
                </div>
              </div>
            ) : (
              <div className="no-alerts"><div className="no-alerts-icon">🌤️</div><h4>No Weather Data Available</h4></div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskAlerts;
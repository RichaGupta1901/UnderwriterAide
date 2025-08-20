// Fixed RiskAlerts.jsx - Proper prop destructuring and debugging

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

  // FIX 1: Add debug logging to see what props are being received
  useEffect(() => {
    console.log('RiskAlerts Props Debug:', {
      location,
      locationWeather,
      hazardAlerts: hazardAlerts?.length || 0,
      financialAlerts: financialAlerts?.length || 0,
      alertCount,
      financialAlertCount,
      lastUpdated
    });
  }, [location, locationWeather, hazardAlerts, financialAlerts, alertCount, financialAlertCount, lastUpdated]);

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

      console.log('Fetching general alerts from:', url); // FIX 2: Debug API calls

      const response = await fetch(url);
      const data = await response.json();

      console.log('General alerts response:', data); // FIX 3: Debug API response

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
      'Financial Alert': 'alert-financial',
      'Market Alert': 'alert-market',
      'Weather Hazard': 'alert-weather',
      'Hazard Alert': 'alert-hazard',
      'Weather': 'alert-weather',
      'Economic': 'alert-economic',
      'Error': 'alert-error'
    };
    return typeMap[type] || 'alert-general';
  };

  // Render individual alert item
  // Updated RiskAlerts.jsx - Enhanced display for filtered hazard alerts

// Update the renderAlert function to show hazard keywords and severity
const renderAlert = (alert, index, isFromAssessment = false) => (
  <div key={`${isFromAssessment ? 'assessment' : 'general'}-${index}`}
       className={`alert-item ${getAlertTypeClass(alert.type)} ${
         alert.severity ? `severity-${alert.severity.toLowerCase()}` : ''
       }`}>
    <div className="alert-header">
      <div className="alert-header-left">
        <span className="alert-type">{alert.type}</span>
        {alert.symbol && <span className="alert-symbol">{alert.symbol}</span>}
        {alert.severity && (
          <span className={`severity-badge ${alert.severity.toLowerCase()}`}>
            {alert.severity}
          </span>
        )}
      </div>
      <div className="alert-header-right">
        {alert.impact_level && (
          <span className={`impact-badge ${alert.impact_level.toLowerCase()}`}>
            {alert.impact_level}
          </span>
        )}
        {isFromAssessment && alert.published && (
          <span className="alert-time">
            {formatTimestamp(alert.published)}
          </span>
        )}
      </div>
    </div>

    <div className="alert-content">
      {alert.title && <h4 className="alert-title">{alert.title}</h4>}
      <p className="alert-details">{alert.details}</p>

      {/* NEW: Display matched hazard keywords */}
      {alert.keywords_matched && alert.keywords_matched.length > 0 && (
        <div className="alert-keywords">
          <span className="keywords-label">🏷️ Hazard Types:</span>
          <div className="keywords-list">
            {alert.keywords_matched.map((keyword, idx) => (
              <span key={idx} className="keyword-tag">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="alert-footer">
        {alert.source && (
          <div className="alert-source">Source: {alert.source}</div>
        )}
        {alert.category && (
          <div className="alert-category">Category: {alert.category}</div>
        )}
        {alert.location && (
          <div className="alert-location">📍 {alert.location}</div>
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

// Update the hazard alerts section to show filtering information
{activeTab === 'alerts' && !loading && (
  <div className="alerts-list">
    {hazardAlerts && hazardAlerts.length > 0 ? (
      <>
        <div className="section-header">
          <h4>🚨 Location-Specific Hazard News</h4>
          <p>Emergency and hazard alerts for {location || 'the detected location'}</p>
          <div className="filter-info">
            <span className="filter-label">📋 Filtered for:</span>
            <div className="hazard-keywords-display">
              {[
                "emergency", "disaster", "evacuation", "fire", "flood", "earthquake",
                "storm", "hurricane", "tornado", "accident", "explosion", "spill",
                "hazard", "alert", "warning", "crisis", "incident"
              ].map((keyword, idx) => (
                <span key={idx} className="filter-keyword">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="hazard-summary">
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-value">{hazardAlerts.length}</span>
              <span className="stat-label">Total Alerts</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {hazardAlerts.filter(alert => alert.severity === 'High').length}
              </span>
              <span className="stat-label">High Severity</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {hazardAlerts.filter(alert => alert.severity === 'Medium').length}
              </span>
              <span className="stat-label">Medium Severity</span>
            </div>
          </div>
        </div>

        {hazardAlerts.map((alert, index) => renderAlert(alert, index, true))}
      </>
    ) : (
      <div className="no-alerts">
        <div className="no-alerts-icon">📰</div>
        <h4>No Hazard-Specific Alerts Found</h4>
        <p>
          {location === 'Not specified' || location === 'Error'
            ? 'Upload a policy document to get location-specific hazard risk alerts'
            : `No current hazard alerts found for ${location} matching emergency keywords`
          }
        </p>
        <div className="search-criteria">
          <h5>We monitor for these hazard types:</h5>
          <div className="monitored-hazards">
            {[
              "🚨 Emergency", "🌪️ Disaster", "🏃 Evacuation", "🔥 Fire",
              "🌊 Flood", "🏠 Earthquake", "⛈️ Storm", "🌀 Hurricane",
              "🌪️ Tornado", "💥 Accident", "💥 Explosion", "🛢️ Spill",
              "⚠️ Hazard", "📢 Alert", "⚠️ Warning", "🚨 Crisis", "📰 Incident"
            ].map((hazard, idx) => (
              <span key={idx} className="hazard-type">
                {hazard}
              </span>
            ))}
          </div>
        </div>
        {location && location !== 'Not specified' && location !== 'Error' && (
          <button
            className="refresh-button"
            onClick={() => window.location.reload()}
          >
            🔄 Refresh Hazard Alerts
          </button>
        )}
      </div>
    )}
  </div>
)}

  // Financial Alerts Card Component
  const FinancialAlertsCard = ({ alerts }) => (
    <div className="financial-alerts-section">
      {alerts && alerts.length > 0 ? (
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
          Hazard News ({hazardAlerts?.length || 0})
        </button>
        <button
          className={`tab ${activeTab === 'financial' ? 'active' : ''}`}
          onClick={() => setActiveTab('financial')}
        >
          Financial ({financialAlerts?.length || 0})
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
            {hazardAlerts && hazardAlerts.length > 0 ? (
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

        {/* Financial alerts tab - FIX 4: Add debug info */}
        {activeTab === 'financial' && !loading && (
          <div className="alerts-list">
            <div className="section-header">
              <h4>Financial Market Alerts</h4>
              <p>Recent financial news and market movements that could impact risk assessment</p>
              {/* FIX 5: Add debug display */}
              <small style={{ color: '#666', fontSize: '12px' }}>
                Debug: {financialAlerts?.length || 0} financial alerts received
              </small>
            </div>
            <FinancialAlertsCard alerts={financialAlerts || []} />
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

        {/* Weather information - FIX 6: Add debug info */}
        {activeTab === 'weather' && !loading && (
          <div className="weather-info">
            <div className="section-header">
              <h4>Weather Information</h4>
              <p>Current weather conditions for {location}</p>
              {/* FIX 7: Add debug display */}
              <small style={{ color: '#666', fontSize: '12px' }}>
                Debug: Weather data - {locationWeather ? 'Available' : 'Not available'}
              </small>
            </div>
            {locationWeather ? (
              <div className="weather-card">
                <div className="weather-icon">🌤️</div>
                <div className="weather-details">
                  <p>{locationWeather}</p>
                  <small>Data provided by OpenWeatherMap</small>
                </div>
              </div>
            ) : (
              <div className="no-alerts">
                <div className="no-alerts-icon">🌤️</div>
                <h4>No Weather Data</h4>
                <p>Weather information not available. Try uploading a document with location details.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskAlerts;
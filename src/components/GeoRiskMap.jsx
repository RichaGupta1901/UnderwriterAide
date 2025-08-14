import React from 'react';
import './Dashboard.css';

const GeoRiskMap = () => {
  return (
    <div className="geo-risk-map">
      <h3>Geospatial Risk Map</h3>
      <div className="map-container">
        {/* Map visualization would be integrated here */}
        <div className="map-placeholder">
          <p>Interactive Risk Map</p>
        </div>
      </div>
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-color high"></span>
          <span>High Risk</span>
        </div>
        <div className="legend-item">
          <span className="legend-color medium"></span>
          <span>Medium Risk</span>
        </div>
        <div className="legend-item">
          <span className="legend-color low"></span>
          <span>Low Risk</span>
        </div>
      </div>
    </div>
  );
};

export default GeoRiskMap;
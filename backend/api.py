from flask import Flask, jsonify, request
from flask_cors import CORS

# Create the Flask application instance
app = Flask(__name__)
CORS(app)


# --- Mock API Endpoints ---

# ENDPOINT 1: Get Live Risk Alerts (GET)
@app.route('/api/risk_alerts', methods=['GET'])
def get_risk_alerts():
    """
    Provides data for the 'Current Risk Alerts' widget.
    """
    mock_alerts = [
        {"type": "Cyclone", "details": "Cyclone alert in Queensland"},
        {"type": "Pandemic", "details": "Pandemic health risk trends"},
        {"type": "Economic", "details": "Economic instability"}
    ]
    return jsonify(mock_alerts)


# ENDPOINT 2: The "Upload and Assess" Endpoint (POST)
@app.route('/api/assess', methods=['POST'])
def assess_application():
    """
    Receives an application and returns a full risk assessment.
    For now, it ignores the input and returns mock data.
    """
    mock_assessment = {
      "application_id": "APP12345",
      "risk_score": 72,
      "risk_level": "High risk",
      "llm_explanation": "The risk score is high primarily due to the property's location in a designated flood zone, as per APRA regulation CPG 229.",
      "compliance_status": "PASS",
      "citations": ["APRA CPG 229", "Internal SOP 4.1"]
    }
    return jsonify(mock_assessment)


# ENDPOINT 3: Get Geospatial Risk Data (GET)
@app.route('/api/geospatial_risk', methods=['GET'])
def get_geospatial_risk():
    """
    Provides GeoJSON data for the 'Geospatial Risk Map'.
    """
    mock_geo_data = {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "geometry": { "type": "Point", "coordinates": [153.0260, -27.4705] },
          "properties": { "risk_level": "High", "city": "Brisbane" }
        },
        {
          "type": "Feature",
          "geometry": { "type": "Point", "coordinates": [144.9631, -37.8136] },
          "properties": { "risk_level": "Medium", "city": "Melbourne" }
        }
      ]
    }
    return jsonify(mock_geo_data)


# ENDPOINT 4: Run "What-If" Scenario (POST)
@app.route('/api/simulate', methods=['POST'])
def run_simulation():
    """
    Receives scenario parameters and returns a simulated score.
    For now, it checks if it received any JSON and returns a mock response.
    """
    # This line checks if the frontend sent a JSON body, which is good practice.
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    mock_simulation_result = {
      "original_score": 72,
      "simulated_score": 85,
      "summary": "Increasing climate change impact to 'High' significantly raises the projected risk score."
    }
    return jsonify(mock_simulation_result)


# --- Main entry point to run the server ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)
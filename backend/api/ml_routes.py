# backend/api/ml_routes.py

from flask import Blueprint, request, jsonify
from ml.model_loader import predict_risk
import traceback

ml_bp = Blueprint('ml_bp', __name__)

@ml_bp.route('/predict_ml', methods=['POST'])
def predict_ml_risk():
    """Endpoint for ML-based risk prediction."""
    print("🧠 Received request for ML model prediction.")
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    try:
        raw_prediction = predict_risk(data)
        score = int(raw_prediction * 100)
        level = 'Low'
        if score > 70:
            level = 'High'
        elif score > 45:
            level = 'Medium'

        response = {'score': score, 'level': level}
        return jsonify(response)
    except Exception as e:
        print(f"❌ Prediction error: {e}\n{traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500
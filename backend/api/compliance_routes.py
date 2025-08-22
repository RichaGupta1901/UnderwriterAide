# backend/api/compliance_routes.py

from flask import Blueprint, request, jsonify, current_app
from services.pdf_processor import extract_text_from_pdf
from services.openai_service import enhanced_apra_compliance_check
import json
import traceback

compliance_bp = Blueprint('compliance_bp', __name__)
APRA_CHECKLIST = {}


@compliance_bp.before_app_request
def load_checklist():
    """Load the APRA checklist from the JSON file at startup."""
    global APRA_CHECKLIST
    try:
        with open(current_app.config['APRA_CHECKLIST_PATH'], 'r') as f:
            APRA_CHECKLIST = json.load(f)
        print("✓ APRA compliance checklist loaded successfully.")
    except Exception as e:
        print(f"❌ Failed to load APRA checklist: {e}")


@compliance_bp.route('/get_compliance_checklist', methods=['GET'])
def get_compliance_checklist():
    """Endpoint to get the APRA compliance checklist."""
    if not APRA_CHECKLIST:
        return jsonify({"error": "Compliance checklist not loaded"}), 500
    return jsonify(APRA_CHECKLIST)


@compliance_bp.route('/enhanced_compliance_check', methods=['POST'])
def enhanced_compliance_check_endpoint():
    """Endpoint for AI-powered compliance checking."""
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    try:
        policy_text = extract_text_from_pdf(file.stream.read())
        if len(policy_text) < 50:
            return jsonify({"error": "Could not extract sufficient text"}), 400

        results = enhanced_apra_compliance_check(policy_text, APRA_CHECKLIST)
        return jsonify(results)
    except Exception as e:
        print(f"❌ Compliance check error: {e}\n{traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500
# backend/api/assessment_routes.py

from flask import Blueprint, request, jsonify, send_file, current_app
from datetime import datetime
import traceback
from io import BytesIO

# Import service functions
from services.pdf_processor import extract_text_from_pdf, parse_city_from_text
from services.external_apis import get_location_specific_weather, get_location_specific_hazard_news, finance_news
from services.openai_service import generate_enhanced_policy_with_user_data, save_ai_draft_pdf_enhanced

assessment_bp = Blueprint('assessment_bp', __name__)


# --- FIX 1: REMOVED the redundant '/api' prefix from the route. ---
# The '/api' is already added when the blueprint is registered in app.py.
@assessment_bp.route('/debug/config', methods=['GET'])
def debug_config():
    """Debug endpoint to check configuration."""
    # We also need to get the keys from the current_app context now
    news_key = current_app.config.get('NEWS_API_KEY')
    weather_key = current_app.config.get('OPENWEATHERMAP_API_KEY')
    return jsonify({
        "news_api_available": bool(news_key),
        "weather_api_available": bool(weather_key),
        "news_api_length": len(news_key) if news_key else 0,
        "weather_api_length": len(weather_key) if weather_key else 0
    })


@assessment_bp.route('/risk_alerts', methods=['GET'])
def get_risk_alerts():
    """Enhanced risk alerts endpoint that fetches real data."""
    try:
        location = request.args.get('location')
        alerts = []

        if location and location != 'Error fetching data':
            hazards = get_location_specific_hazard_news(location)
            alerts.extend(hazards[:5])

        if not alerts:
            financial = finance_news()
            alerts.extend(financial[:3])

        if not alerts:
            alerts.append({
                "type": "General",
                "title": "All Systems Monitoring Normally",
                "details": "No severe weather or major financial alerts at this time."
            })

        return jsonify(alerts)

    except Exception as e:
        print(f"❌ Risk alerts error: {e}")
        return jsonify([{"type": "Error", "title": "Could not load alerts."}]), 500


@assessment_bp.route('/debug/test_city/<city>', methods=['GET'])
def debug_test_city(city):
    """Provides weather and hazard news for a specific city."""
    try:
        weather = get_location_specific_weather(city)
        hazards = get_location_specific_hazard_news(city)

        return jsonify({
            "city": city,
            "weather": weather, # This will now be a JSON object, thanks to our next fix
            "hazard_count": len(hazards),
            "hazards": hazards,
            "status": "success"
        })
    except Exception as e:
        print(f"❌ Error in /debug/test_city endpoint: {e}")
        return jsonify({"city": city, "error": str(e), "status": "error"}), 500


@assessment_bp.route('/assess', methods=['POST'])
def assess_application():
    """Endpoint for standard PDF risk assessment."""
    # This function remains correct
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    try:
        # ... (rest of function is unchanged) ...
        file_content = file.read()
        full_text = extract_text_from_pdf(file_content)
        city = parse_city_from_text(full_text)
        weather_details = get_location_specific_weather(city) if city else {"error": "No location specified"}
        hazard_news = get_location_specific_hazard_news(city) if city else []
        financial_alerts = finance_news()
        risk_score = 65 + min(len(hazard_news) * 5, 20) + min(len(financial_alerts) * 2, 10)
        risk_level = "High Risk" if risk_score > 80 else "Medium Risk" if risk_score > 60 else "Low Risk"
        return jsonify({
            "risk_score": risk_score,
            "risk_level": risk_level,
            "location_found": city,
            "weather_details": weather_details,
            "hazard_alerts": hazard_news,
            "financial_alerts": financial_alerts,
            "processing_status": "success"
        })
    except Exception as e:
        print(f"❌ Assessment error: {e}\n{traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500


@assessment_bp.route('/generate_enhanced_policy', methods=['POST'])
def generate_enhanced_policy_endpoint():
    """Endpoint for generating an AI-drafted policy document."""
    # This function remains correct
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    try:
        # ... (rest of function is unchanged) ...
        product_data = data.get("product", {})
        fund_data = data.get("fund", {})
        user_data = data.get("user_data", {})
        ai_draft = generate_enhanced_policy_with_user_data(product_data, fund_data, user_data)
        pdf_bytes = save_ai_draft_pdf_enhanced(ai_draft)
        return send_file(BytesIO(pdf_bytes), mimetype='application/pdf', as_attachment=True, download_name=f'Enhanced_Policy_Draft.pdf')
    except Exception as e:
        print(f"❌ Policy generation error: {e}\n{traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500


@assessment_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    # This function remains correct
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})
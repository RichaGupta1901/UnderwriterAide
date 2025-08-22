# backend/app.py

from flask import Flask
from flask_cors import CORS

# Import configuration and initialization functions
from config import Config
from ml.model_loader import load_model
from services.openai_service import init_openai

# Import Blueprints
from api.ml_routes import ml_bp
from api.compliance_routes import compliance_bp
from api.assessment_routes import assessment_bp


def create_app(config_class=Config):
    """Creates and configures the Flask application."""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS for all routes
    CORS(app)

    with app.app_context():
        # --- Initialization ---
        # Load the machine learning model at startup
        load_model()
        # Initialize the OpenAI client
        init_openai()

        # --- Register Blueprints (API routes) ---
        app.register_blueprint(ml_bp, url_prefix='/api')
        app.register_blueprint(compliance_bp, url_prefix='/api')
        app.register_blueprint(assessment_bp, url_prefix='/api')

    @app.route('/')
    def index():
        return "UnderwriterAide Backend is running."

    return app


# Main entry point for running the application
if __name__ == '__main__':
    app = create_app()

    print("🚀 Verifying API key availability...")
    print(f"✓ Weather API available: {bool(app.config['OPENWEATHERMAP_API_KEY'])}")
    print(f"✓ News API available: {bool(app.config['NEWS_API_KEY'])}")
    print(f"✓ Finance API available: {bool(app.config['FINANCE_API_KEY'])}")
    print(f"✓ OpenAI API available: {bool(app.config['OPENAI_API_KEY'])}")

    print("🚀 Starting Flask application...")
    app.run(debug=True, port=5001)
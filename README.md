# AI Underwriting Risk Assessment Platform  
Navigate the future of insurance underwriting with real-time risk intelligence.  
This platform combines AI-powered risk scoring, regulatory compliance automation, and interactive dashboards to make underwriting faster, explainable, and adaptive.

🌟 Features  
AI-Powered Risk Scoring  
- Processes historical claims + live external feeds (climate, economic, hazard, sentiment)  
- Generates instant, explainable risk scores (SHAP-based)  

Regulatory Compliance  
- Built-in APRA compliance engine  
- Automatic policy template generation  

Interactive Dashboard  
- Risk heatmaps and trends  
- “What-if” simulations and scenario testing  

Real-Time Feeds  
- Weather data via OpenWeatherMap  
- Financial data via FinnHub and FRED  
- Hazard insights from government databases  

📁 Project Structure  
/frontend – React dashboard  
/backend – Flask API, risk model, compliance engine  
/models – XGBoost model + SHAP explainability  
/data – Sample claims and synthetic datasets  
/notebooks – Model training and evaluation demos  
/docs – References and technical documentation  

🚀 Getting Started  

**Prerequisites**  
- Python 3.9+  
- Node.js 18+  
- API keys for OpenWeatherMap, FinnHub, FRED  

**Installation**  
''bash
# Clone repository
git clone https://github.com/yourusername/ai-underwriting-risk.git
cd ai-underwriting-risk

# Backend setup
cd backend
pip install -r requirements.txt

# Frontend setup
cd backend
pip install -r requirements.txt

# Frontend setup
cd ../frontend
npm install
Run Application

# Start backend
cd backend
flask run

# Start frontend
cd frontend
npm start

📚 References
APRA Prudential Standards
OpenWeatherMap
FinnHub Economic Data
Lundberg et al. (2017) — SHAP Explainable AI
cd ../frontend
npm install

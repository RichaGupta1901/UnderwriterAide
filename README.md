# AI Underwriting Risk Assessment Platform  
Real-Time Risk Intelligence for Smarter Insurance Decisions  

An AI-powered underwriting assistant that combines historical claims data with live external feeds (climate, economic, hazard, sentiment).  
It generates instant, explainable risk scores, ensures APRA compliance, and delivers insights through an interactive dashboard.  

---

## 🌟 Features  

**AI Risk Scoring**  
- Processes claims + real-time external data  
- Explainable results with SHAP  

**Regulatory Compliance**  
- Built-in APRA compliance engine  
- Auto-generates policy templates  

**Interactive Dashboard**  
- Heatmaps, risk trends, and competitor overlays  
- “What-if” simulations and scenario testing  

---
## Methodology 

![WhatsApp Image 2025-08-22 at 12 35 47_0354cdd9](https://github.com/user-attachments/assets/4f9dd58e-7931-4a93-9987-291c07ca4531)


---

## 📁 Project Structure  

- `/frontend` – React dashboard (Recharts visualizations)  
- `/backend` – Flask API with AI model and compliance engine  
- `/models` – XGBoost model and explainability logic  
- `/data` – Sample claims + synthetic datasets  
- `/notebooks` – Model training & evaluation  
- `/docs` – Documentation and references  

---

## Getting Started  

1. Clone the repository  
```bash
git clone https://github.com/yourusername/ai-underwriting-risk.git
cd ai-underwriting-risk
```

2. Backend setup
```
cd backend
pip install -r requirements.txt
```

3. Frontend setup
```
cd ../frontend
npm install
```

4. Configure environment variables
```
Create a .env file in /backend with:
OPENWEATHER_API_KEY=""
FINNHUB_API_KEY=""
FRED_API_KEY=""
```

5. Run the application
```
# Start backend
cd backend
flask run

# Start frontend
cd frontend
npm start
```

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
## Demo

<p align="center">
  <img src="https://github.com/RichaGupta1901/UnderwriterAide/raw/main/MUFG%20-%20Usecase%208%20demo.mp4" alt="Website" width="1000">
</p>

https://drive.google.com/file/d/1wloD03FqieasdOcluZQ3iYrBRVSd0wut/view?usp=sharing
---
## Methodology 

<img width="3840" height="2685" alt="Mermaid Chart - Create complex, visual diagrams with text  A smarter way of creating diagrams -2025-08-22-071825" src="https://github.com/user-attachments/assets/c3c35c6a-580c-4c47-ba56-6ae0d0527a7b" />



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

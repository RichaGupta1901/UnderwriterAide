# backend/services/external_apis.py

import requests
import feedparser
from datetime import datetime, timedelta
from flask import current_app


def get_location_specific_weather(city):
    """Calls OpenWeatherMap and returns a structured object."""
    api_key = current_app.config.get('OPENWEATHERMAP_API_KEY')

    # --- FIX: Check for the key before using it ---
    if not api_key:
        print("⚠️ OPENWEATHERMAP_API_KEY is missing. Skipping weather fetch.")
        return {"error": "Weather API key not configured on server."}

    if not city:
        return {"error": "No location provided."}

    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        return {
            "city": data.get("name"),
            "description": data['weather'][0]['description'].title(),
            "temp": data['main']['temp'],
            "humidity": data['main']['humidity']
        }
    except requests.exceptions.RequestException as e:
        print(f"❌ Could not retrieve weather for {city}: {e}")
        return {"error": f"Could not retrieve weather for {city}."}


def get_newsapi_hazards(city):
    """Fetch hazardous news using NewsAPI."""
    api_key = current_app.config.get('NEWS_API_KEY')

    # --- FIX: Check for the key before using it ---
    if not api_key:
        print("⚠️ NEWS_API_KEY is missing. Skipping news fetch.")
        return []  # Return an empty list to prevent crashing

    hazard_keywords = ["emergency", "disaster", "evacuation", "fire", "flood"]
    keyword_query = " OR ".join([f'"{k}"' for k in hazard_keywords])
    query = f'"{city}" AND ({keyword_query})'
    url = f"https://newsapi.org/v2/everything?q={query}&apiKey={api_key}&language=en&pageSize=5"

    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()
        articles = response.json().get('articles', [])
        return [{'type': 'Hazard Alert', 'title': a['title'], 'details': a.get('description', '')} for a in articles]
    except requests.exceptions.RequestException as e:
        print(f"❌ NewsAPI request failed: {e}")
        return []


def finance_news(symbols=None):
    """Fetch financial news using FINNHUB API."""
    api_key = current_app.config.get('FINANCE_API_KEY')

    # --- FIX: Check for the key before using it ---
    if not api_key:
        print("⚠️ FINANCE_API_KEY is missing. Skipping finance news fetch.")
        return []  # Return an empty list to prevent crashing

    if not symbols:
        symbols = ['AAPL', 'GOOGL', 'MSFT']

    financial_alerts = []
    # ... (rest of the function is unchanged)
    for symbol in symbols[:3]:
        try:
            url = f"https://finnhub.io/api/v1/company-news?symbol={symbol}&token={api_key}&_from=...&to=..."
            response = requests.get(url, timeout=15)
            response.raise_for_status()
            news_data = response.json()
            for article in news_data[:2]:
                financial_alerts.append({'type': 'Financial Alert', 'symbol': symbol, 'title': article.get('headline')})
        except requests.exceptions.RequestException as e:
            print(f"❌ FINNHUB request failed for {symbol}: {e}")

    return financial_alerts


# Other functions like get_emergency_rss_feeds and get_location_specific_hazard_news remain the same
# as they don't crash the app if they fail.
def get_emergency_rss_feeds(city):
    # ... (no changes needed here)
    return []


def get_location_specific_hazard_news(city):
    # ... (no changes needed here)
    if not city:
        return []
    news_alerts = get_newsapi_hazards(city)
    rss_alerts = get_emergency_rss_feeds(city)
    return (news_alerts + rss_alerts)[:8]
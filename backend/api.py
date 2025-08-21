# --- Imports ---
from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import feedparser
import fitz  # PyMuPDF
from datetime import datetime, timedelta
import re
import traceback
import time
import os
from dotenv import load_dotenv
import pickle
import pandas as pd
from PyPDF2 import PdfReader
from jinja2 import Environment, FileSystemLoader
from openai import OpenAI
import markdown
import json
from jinja2 import Environment, BaseLoader
from fpdf import FPDF
import logging


# --- App Initialization ---
load_dotenv()  # This line loads the .env file
app = Flask(__name__)
CORS(app)

# --- GLOBAL VARIABLES & CONFIG ---

NEWS_API_KEY = os.getenv("NEWS_API_KEY")
OPENWEATHERMAP_API_KEY = os.getenv("OPENWEATHERMAP_API_KEY")
FINANCE_API_KEY = os.getenv("FINANCE_API_KEY")

# --- NEW: ML MODEL LOADING ---
# Load the model and encoders once when the server starts for efficiency.
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'Model1')
MODEL_PATH = os.path.join(MODEL_DIR, 'risk_scoring_model.pkl')
ENCODERS_PATH = os.path.join(MODEL_DIR, 'label_encoders.pkl')

model = None
label_encoders = None
model_columns = None  # This will hold the required feature order for the model

try:
    print("🧠 Loading ML model and encoders...")

    with open(MODEL_PATH, 'rb') as f_model:
        model = pickle.load(f_model)
    print("   ✓ ML model ('risk_scoring_model.pkl') loaded successfully.")

    with open(ENCODERS_PATH, 'rb') as f_encoders:
        label_encoders = pickle.load(f_encoders)
    print("   ✓ Label encoders ('label_encoders.pkl') loaded successfully.")

    # IMPORTANT: You must replace this list with the actual column names
    # in the exact order your model was trained on. This is a critical step.
    model_columns = ['Customer Name', 'Age_x', 'State_x', 'Insurance Type_x',
       'Annual Premium (AUD)_x', 'Claim Amount (AUD)_x', 'Claim Status_x',
       'Policy Start Date_x', 'Policy End Date_x', 'Age_y', 'State_y',
       'Insurance Type_y', 'Annual Premium (AUD)_y', 'Claim Amount (AUD)_y',
       'Claim Status_y', 'Policy Start Date_y', 'Policy End Date_y',
       'Policy Number', 'Product Tier', 'Payment Frequency', 'Risk Score',
       'Email', 'Phone', 'Agent Name']

    print(f"   ✓ Model expects {len(model_columns)} features in a specific order.")

except FileNotFoundError as e:
    print(f"❌ CRITICAL ERROR: Could not find model or encoder files. {e}")
    print("   The new '/api/predict_ml' endpoint will not work.")
except Exception as e:
    print(f"❌ CRITICAL ERROR: An error occurred during model loading: {e}")


# --- END OF NEW ML MODEL LOADING ---


def check_api_keys_on_startup():
    print("🚀 Verifying API key availability...")
    print(f"✓ Weather API available: {bool(OPENWEATHERMAP_API_KEY)}")
    print(f"✓ News API available: {bool(NEWS_API_KEY)}")
    print(f"✓ Finance API available: {bool(FINANCE_API_KEY)}")
    if not all([OPENWEATHERMAP_API_KEY, NEWS_API_KEY, FINANCE_API_KEY]):
        print("⚠️  One or more API keys are missing. Check your .env file.")
    else:
        print("✓ All external API keys loaded successfully from .env file.")


# --- Helper Functions (Existing code - Unchanged) ---

def get_location_specific_weather(city):
    """Calls OpenWeatherMap for a SPECIFIC city with better error handling."""
    if not city or not OPENWEATHERMAP_API_KEY:
        return f"No location found in PDF or weather API key missing."
    # ... (rest of the function is unchanged)
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={OPENWEATHERMAP_API_KEY}&units=metric"
    try:
        print(f"🌤️  Fetching weather for: {city}")
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        weather_description = data['weather'][0]['description']
        temp = data['main']['temp']
        humidity = data['main']['humidity']
        result = f"Weather in {city.title()}: {weather_description.title()}, {temp}°C, {humidity}% humidity"
        print(f"✓ Weather data retrieved: {result}")
        return result
    except requests.exceptions.RequestException as e:
        error_msg = f"Could not retrieve weather for {city}: {str(e)}"
        print(f"❌ Weather API error: {error_msg}")
        return error_msg
    except KeyError as e:
        error_msg = f"Weather data format error for {city}: missing {e}"
        print(f"❌ Weather data error: {error_msg}")
        return error_msg


def parse_city_from_text(text):
    """Enhanced city parser with better debugging and more cities."""
    if not text:
        print("❌ No text provided for city parsing")
        return None

    print(f"🔍 Parsing city from {len(text)} characters of text")
    print(f"📄 Text sample: {text[:200]}...")

    # Expanded list of cities
    known_cities = [
        # Major Australian cities
        "sydney", "melbourne", "brisbane", "perth", "adelaide", "canberra",
        "darwin", "hobart", "gold coast", "newcastle", "wollongong", "geelong",
        "townsville", "cairns", "toowoomba", "ballarat", "bendigo", "mackay",

        # Major international cities
        "london", "new york", "tokyo", "singapore", "hong kong", "auckland",
        "los angeles", "chicago", "toronto", "vancouver", "montreal", "paris",
        "berlin", "amsterdam", "zurich", "dubai", "mumbai", "delhi", "bangalore",
        "bangkok", "kuala lumpur", "manila", "jakarta", "seoul", "beijing",
        "shanghai", "boston", "washington", "miami", "san francisco", "seattle",
        "portland", "denver", "atlanta", "houston", "dallas", "phoenix",

        # European cities
        "madrid", "barcelona", "rome", "milan", "vienna", "prague", "budapest",
        "warsaw", "stockholm", "oslo", "copenhagen", "helsinki", "dublin",
        "edinburgh", "glasgow", "manchester", "liverpool", "birmingham",

        # Asian cities
        "osaka", "kyoto", "taipei", "guangzhou", "shenzhen", "chennai", "kolkata",
        "karachi", "lahore", "dhaka", "islamabad", "kathmandu", "colombo"
    ]

    text_lower = text.lower()

    # Search for cities with word boundaries
    for city in known_cities:
        pattern = r'\b' + re.escape(city.lower()) + r'\b'
        if re.search(pattern, text_lower):
            print(f"✓ City found in text: {city.title()}")
            return city.title()

    # Try location patterns if no direct match
    location_patterns = [
        r'\b([A-Z][a-zA-Z\s]{2,20}),\s*([A-Z]{2,3}|[A-Z][a-zA-Z\s]{2,20})\b',  # City, State/Country
        r'\b([A-Z][a-zA-Z\s]{3,20})\s+(?:City|Town|Municipality)\b',  # Named cities
        r'(?:located in|based in|address.*?)\s+([A-Z][a-zA-Z\s]{3,20})\b'  # Address patterns
    ]

    for pattern in location_patterns:
        matches = re.finditer(pattern, text)
        for match in matches:
            potential_city = match.group(1).strip()
            # Validate potential city (basic checks)
            if 2 < len(potential_city) < 25 and potential_city.replace(' ', '').isalpha():
                print(f"🎯 Potential city found via pattern: {potential_city}")
                return potential_city

    print("❌ No city found in PDF text")
    return None


def get_newsapi_hazards(city, max_retries=2):
    # ... (This function remains unchanged)
    """Fetch hazardous news using NewsAPI with STRICT keyword filtering."""
    if not NEWS_API_KEY:
        print("⚠️  NEWS_API_KEY not available - skipping NewsAPI")
        return []

    # STRICT hazard keywords - only these specific terms
    hazard_keywords = [
        "emergency", "disaster", "evacuation", "fire", "flood", "earthquake",
        "storm", "hurricane", "tornado", "accident", "explosion", "spill",
        "hazard", "alert", "warning", "crisis", "incident"
    ]

    # Build search query with strict keyword matching
    keyword_query = " OR ".join([f'"{keyword}"' for keyword in hazard_keywords[:8]])  # Use exact quotes
    query = f'"{city}" AND ({keyword_query})'

    url = "https://newsapi.org/v2/everything"
    params = {
        'q': query,
        'apiKey': NEWS_API_KEY,
        'language': 'en',
        'sortBy': 'publishedAt',
        'from': (datetime.now() - timedelta(days=3)).strftime('%Y-%m-%d'),
        'pageSize': 15  # Get more to filter better
    }

    for attempt in range(max_retries):
        try:
            print(f"📰 Fetching hazard news for {city} (attempt {attempt + 1}/{max_retries})")
            print(f"🔍 Query: {query}")

            response = requests.get(url, params=params, timeout=15)
            response.raise_for_status()
            data = response.json()

            if data.get('status') != 'ok':
                raise Exception(f"NewsAPI error: {data.get('message', 'Unknown error')}")

            articles = data.get('articles', [])
            alerts = []

            for article in articles:
                title = article.get('title', '').lower()
                description = article.get('description', '').lower() if article.get('description') else ''
                content = f"{title} {description}"

                # STRICT filtering: Must contain at least one exact hazard keyword
                hazard_found = False
                matched_keywords = []

                for keyword in hazard_keywords:
                    # Use word boundaries to ensure exact matches
                    if re.search(r'\b' + re.escape(keyword.lower()) + r'\b', content):
                        hazard_found = True
                        matched_keywords.append(keyword)

                # Only include if hazard keywords found AND city mentioned
                if hazard_found and city.lower() in content:
                    # Determine severity based on keywords
                    high_severity_keywords = ["emergency", "disaster", "evacuation", "explosion", "crisis"]
                    severity = "High" if any(kw in matched_keywords for kw in high_severity_keywords) else "Medium"

                    alerts.append({
                        'type': 'Hazard Alert',
                        'title': article.get('title'),
                        'details': article.get('description', 'No description available')[:150] + '...',
                        'source': article.get('source', {}).get('name', 'News'),
                        'published': article.get('publishedAt'),
                        'url': article.get('url'),
                        'location': city,
                        'severity': severity,
                        'keywords_matched': matched_keywords[:3]  # Show first 3 matched keywords
                    })

            # Sort by severity and recency
            alerts.sort(key=lambda x: (
                0 if x.get('severity') == 'High' else 1,  # High severity first
                x.get('published', '2000-01-01')  # Then by date (newest first)
            ), reverse=True)

            print(f"✓ Found {len(alerts)} filtered hazard alerts for {city}")
            return alerts[:8]  # Return top 8 most relevant

        except requests.exceptions.RequestException as e:
            print(f"❌ NewsAPI request failed (attempt {attempt + 1}): {e}")
            if attempt < max_retries - 1:
                time.sleep(2)  # Wait before retry


def get_emergency_rss_feeds(city, max_feeds=3):
    # ... (This function remains unchanged)
    """Fetch emergency alerts from RSS feeds with STRICT hazard filtering."""
    alerts = []

    # Curated list of working RSS feeds
    rss_feeds = [
        "https://alerts.weather.gov/cap/us.php?x=1",
        "https://rss.cnn.com/rss/edition.rss",
        "https://feeds.bbci.co.uk/news/rss.xml",
        "https://www.abc.net.au/news/feed/51120/rss.xml",
    ]

    # STRICT hazard keywords - same as NewsAPI
    hazard_keywords = [
        "emergency", "disaster", "evacuation", "fire", "flood", "earthquake",
        "storm", "hurricane", "tornado", "accident", "explosion", "spill",
        "hazard", "alert", "warning", "crisis", "incident"
    ]

    feeds_processed = 0
    for feed_url in rss_feeds:
        if feeds_processed >= max_feeds:
            break

        try:
            print(f"📡 Parsing RSS feed for hazards: {feed_url}")
            feed = feedparser.parse(feed_url)

            if not hasattr(feed, 'entries'):
                print(f"⚠️  Invalid RSS feed format: {feed_url}")
                continue

            feeds_processed += 1

            for entry in feed.entries[:5]:  # Check more entries per feed
                title = entry.get('title', '').lower()
                summary = entry.get('summary', '').lower()
                content = f"{title} {summary}"

                # STRICT filtering: Must contain city AND exact hazard keywords
                if city.lower() in content:
                    matched_keywords = []
                    for keyword in hazard_keywords:
                        if re.search(r'\b' + re.escape(keyword.lower()) + r'\b', content):
                            matched_keywords.append(keyword)

                    # Only include if hazard keywords found
                    if matched_keywords:
                        high_severity_keywords = ["emergency", "disaster", "evacuation", "explosion", "crisis"]
                        severity = "High" if any(kw in matched_keywords for kw in high_severity_keywords) else "Medium"

                        alerts.append({
                            'type': 'Emergency Alert',
                            'title': entry.get('title'),
                            'details': (entry.get('summary', 'No details available')[:120] + '...'),
                            'source': 'Emergency RSS',
                            'published': entry.get('published'),
                            'url': entry.get('link'),
                            'location': city,
                            'severity': severity,
                            'keywords_matched': matched_keywords[:3]
                        })

        except Exception as e:
            print(f"❌ RSS feed error for {feed_url}: {e}")
            continue

    # Sort by severity and recency
    alerts.sort(key=lambda x: (
        0 if x.get('severity') == 'High' else 1,
        x.get('published', '2000-01-01')
    ), reverse=True)

    print(f"✓ Found {len(alerts)} filtered RSS hazard alerts for {city}")
    return alerts[:5]  # Return top 5


def get_location_specific_hazard_news(city):
    # ... (This function remains unchanged)
    """Main function to get STRICTLY FILTERED hazard news for a city."""
    if not city:
        print("❌ No city provided for hazard news")
        return []

    print(f"🚨 Getting FILTERED hazard news for: {city}")
    all_alerts = []

    # Try NewsAPI with strict filtering
    try:
        news_alerts = get_newsapi_hazards(city)
        all_alerts.extend(news_alerts)
        print(f"📰 NewsAPI hazard alerts: {len(news_alerts)}")
    except Exception as e:
        print(f"❌ NewsAPI failed: {e}")

    # Try RSS feeds with strict filtering
    try:
        rss_alerts = get_emergency_rss_feeds(city)
        all_alerts.extend(rss_alerts)
        print(f"📡 RSS hazard alerts: {len(rss_alerts)}")
    except Exception as e:
        print(f"❌ RSS feeds failed: {e}")

    # Remove duplicates based on title similarity
    unique_alerts = []
    seen_titles = set()

    for alert in all_alerts:
        title_key = alert.get('title', '').lower().strip()
        # Create a simplified title for duplicate detection
        title_words = set(re.findall(r'\w+', title_key))

        # Check if this is too similar to existing alerts
        is_duplicate = False
        for seen_title in seen_titles:
            seen_words = set(re.findall(r'\w+', seen_title))
            # If more than 70% of words overlap, consider it a duplicate
            if len(title_words & seen_words) / max(len(title_words), len(seen_words), 1) > 0.7:
                is_duplicate = True
                break

        if not is_duplicate and title_key and len(title_key) > 10:
            seen_titles.add(title_key)
            unique_alerts.append(alert)

    # Final sort by severity and recency
    unique_alerts.sort(key=lambda x: (
        0 if x.get('severity') == 'High' else 1,
        x.get('published', '2000-01-01')
    ), reverse=True)

    print(f"✅ FILTERED unique hazard alerts for {city}: {len(unique_alerts)}")

    # Log what keywords were found for debugging
    all_keywords = []
    for alert in unique_alerts:
        all_keywords.extend(alert.get('keywords_matched', []))
    if all_keywords:
        keyword_counts = {}
        for kw in all_keywords:
            keyword_counts[kw] = keyword_counts.get(kw, 0) + 1
        print(f"📊 Hazard keywords found: {dict(sorted(keyword_counts.items(), key=lambda x: x[1], reverse=True))}")

    return unique_alerts[:8]  # Return top 8 most relevant alerts


def finance_news(symbols=None, max_retries=2):
    # ... (This function remains unchanged)
    """Fetch financial news using FINNHUB API with better error handling."""
    if not FINANCE_API_KEY:
        print("⚠️  FINANCE_API_KEY not available - skipping FINNHUB")
        return []

    # Default symbols if none provided
    if not symbols:
        symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA']  # Popular stocks

    financial_alerts = []

    for symbol in symbols[:5]:  # Limit to 5 symbols to avoid API limits
        for attempt in range(max_retries):
            try:
                print(f"💰 Fetching financial news for {symbol} (attempt {attempt + 1}/{max_retries})")

                # FINNHUB company news endpoint
                url = f"https://finnhub.io/api/v1/company-news"
                params = {
                    'symbol': symbol,
                    'token': FINANCE_API_KEY,
                    'from': (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d'),  # Last 7 days
                    'to': datetime.now().strftime('%Y-%m-%d')
                }

                response = requests.get(url, params=params, timeout=15)
                response.raise_for_status()
                news_data = response.json()

                # Filter for significant financial news
                financial_keywords = [
                    'earnings', 'revenue', 'loss', 'profit', 'bankruptcy', 'merger',
                    'acquisition', 'lawsuit', 'investigation', 'regulation', 'fine',
                    'crash', 'surge', 'plunge', 'rally', 'volatility', 'scandal'
                ]

                for article in news_data[:3]:  # Top 3 articles per symbol
                    headline = article.get('headline', '').lower()
                    summary = article.get('summary', '').lower()
                    content = f"{headline} {summary}"

                    # Check for significant financial impact
                    if any(keyword in content for keyword in financial_keywords):
                        # Calculate impact level based on keywords
                        high_impact_keywords = ['bankruptcy', 'crash', 'plunge', 'scandal', 'investigation']
                        impact_level = "High" if any(word in content for word in high_impact_keywords) else "Medium"

                        financial_alerts.append({
                            'type': 'Financial Alert',
                            'symbol': symbol,
                            'title': article.get('headline'),
                            'details': (article.get('summary', 'No summary available')[:150] + '...'),
                            'source': 'FINNHUB',
                            'published': datetime.fromtimestamp(article.get('datetime', 0)).isoformat() if article.get(
                                'datetime') else None,
                            'url': article.get('url'),
                            'impact_level': impact_level,
                            'category': article.get('category', 'General')
                        })

                print(f"✓ Financial news retrieved for {symbol}")
                break  # Success, break retry loop

            except requests.exceptions.RequestException as e:
                print(f"❌ FINNHUB request failed for {symbol} (attempt {attempt + 1}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(1)  # Wait before retry
                else:
                    print(f"❌ All FINNHUB attempts failed for {symbol}")
            except Exception as e:
                print(f"❌ FINNHUB error for {symbol}: {e}")
                break  # Break retry loop on non-network errors

    # Also get market indices data
    try:
        print("📊 Fetching market indices data")
        indices = ['SPY', 'QQQ', 'DIA']  # S&P 500, NASDAQ, Dow ETFs

        for index in indices:
            try:
                # Get quote data
                quote_url = f"https://finnhub.io/api/v1/quote"
                quote_params = {
                    'symbol': index,
                    'token': FINANCE_API_KEY
                }

                response = requests.get(quote_url, params=quote_params, timeout=10)
                response.raise_for_status()
                quote_data = response.json()

                current_price = quote_data.get('c', 0)  # Current price
                change = quote_data.get('d', 0)  # Change
                percent_change = quote_data.get('dp', 0)  # Percent change

                # Create alert if significant movement (>2%)
                if abs(percent_change) > 2:
                    direction = "surged" if percent_change > 0 else "dropped"
                    financial_alerts.append({
                        'type': 'Market Alert',
                        'symbol': index,
                        'title': f"{index} {direction} {abs(percent_change):.1f}%",
                        'details': f"Current: ${current_price:.2f}, Change: {change:+.2f} ({percent_change:+.1f}%)",
                        'source': 'FINNHUB',
                        'published': datetime.now().isoformat(),
                        'impact_level': "High" if abs(percent_change) > 5 else "Medium",
                        'category': 'Market Movement'
                    })

            except Exception as e:
                print(f"❌ Failed to get quote for {index}: {e}")
                continue

    except Exception as e:
        print(f"❌ Market indices error: {e}")

    # Sort by impact level and recency
    financial_alerts.sort(key=lambda x: (
        0 if x.get('impact_level') == 'High' else 1,  # High impact first
        x.get('published', '2000-01-01')  # Then by date (newest first)
    ), reverse=True)

    print(f"✓ Total financial alerts: {len(financial_alerts)}")
    return financial_alerts[:8]  # Return top 8 alerts


def extract_text_from_pdf(file_stream):
    # ... (This function remains unchanged)
    """Extract text from PDF with enhanced error handling."""
    try:
        print("📄 Starting PDF text extraction")
        doc = fitz.open(stream=file_stream, filetype="pdf")
        full_text = ""

        for page_num in range(len(doc)):
            page = doc[page_num]
            page_text = page.get_text()

            # Clean text
            page_text = re.sub(r'\s+', ' ', page_text)  # Normalize whitespace
            full_text += f" {page_text}"

        doc.close()
        full_text = full_text.strip()

        print(f"✓ Extracted {len(full_text)} characters from PDF")

        if len(full_text) < 10:
            raise Exception("PDF appears to be empty or unreadable")

        return full_text

    except Exception as e:
        print(f"❌ PDF extraction error: {e}")
        raise


# --- NEW: ML PREDICTION ENDPOINT ---
@app.route('/api/predict_ml', methods=['POST'])
def predict_ml_risk():
    """
    Predicts insurance risk using the pre-trained XGBoost model.
    Accepts applicant data as JSON.
    """
    print("🧠 Received request for ML model prediction.")
    if not model or not label_encoders:
        error_msg = "Model or encoders are not loaded. Cannot perform prediction."
        print(f"❌ {error_msg}")
        return jsonify({'error': error_msg}), 500

    # Get the JSON data sent from the React frontend
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided in JSON format'}), 400

    print("   - Input data received:", data)

    try:
        # 1. Convert incoming JSON to a pandas DataFrame
        input_df = pd.DataFrame([data])

        # 2. Preprocess categorical data using the loaded label encoders
        for column, encoder in label_encoders.items():
            if column in input_df.columns:
                # Handle potentially unseen labels gracefully
                input_df[column] = input_df[column].apply(
                    lambda x: encoder.transform([x])[0] if x in encoder.classes_ else -1
                )

        # 3. Ensure all required columns are present and in the correct order
        processed_df = pd.DataFrame(columns=model_columns)
        for col in model_columns:
            if col in input_df.columns:
                processed_df[col] = input_df[col]
            else:
                # If a column is missing, you might want to fill it with a default or raise an error
                # For now, we'll raise an error as it's better to be explicit.
                raise KeyError(f"Missing required feature in input data: '{col}'")

        # 4. Make a prediction
        # Use predict_proba to get the probability of risk (class 1)
        prediction_proba = model.predict_proba(processed_df)[:, 1]
        raw_prediction = prediction_proba[0]
        print(f"   - Raw model prediction (probability): {raw_prediction:.4f}")

        # 5. Format the response
        score = int(raw_prediction * 100)
        level = 'Low'
        if score > 70:
            level = 'High'
        elif score > 45:
            level = 'Medium'

        response = {'score': score, 'level': level}
        print(f"   ✓ Prediction successful. Score: {score}, Level: {level}")

        return jsonify(response)

    except KeyError as e:
        error_msg = f"Feature mismatch error: {e}. Ensure all required features are provided."
        print(f"❌ {error_msg}")
        return jsonify({'error': error_msg}), 400
    except Exception as e:
        error_msg = f"An internal error occurred during prediction: {e}"
        print(f"❌ {error_msg}\n{traceback.format_exc()}")
        return jsonify({'error': error_msg}), 500


# --- END OF NEW ENDPOINT ---


# --- Existing API Endpoints (Unchanged) ---

@app.route('/api/debug/config', methods=['GET'])
def debug_config():
    """Debug endpoint to check configuration."""
    return jsonify({
        "news_api_available": bool(NEWS_API_KEY),
        "weather_api_available": bool(OPENWEATHERMAP_API_KEY),
        "news_api_length": len(NEWS_API_KEY) if NEWS_API_KEY else 0,
        "weather_api_length": len(OPENWEATHERMAP_API_KEY) if OPENWEATHERMAP_API_KEY else 0
    })


@app.route('/api/debug/test_city/<city>', methods=['GET'])
def debug_test_city(city):
    """Test location-specific functions for a city."""
    try:
        weather = get_location_specific_weather(city)
        hazards = get_location_specific_hazard_news(city)

        return jsonify({
            "city": city,
            "weather": weather,
            "hazard_count": len(hazards),
            "hazards": hazards[:3],  # First 3 for debugging
            "status": "success"
        })
    except Exception as e:
        return jsonify({
            "city": city,
            "error": str(e),
            "status": "error"
        })


@app.route('/api/assess', methods=['POST'])
def assess_application():
    """Enhanced PDF assessment with better error handling."""
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    try:
        print(f"🔄 Processing file: {file.filename}")
        file_content = file.read()

        if len(file_content) == 0:
            return jsonify({"error": "Uploaded file is empty"}), 400

        # Extract text
        full_text = extract_text_from_pdf(file_content)

        # Parse location
        city = parse_city_from_text(full_text)

        # Get weather and hazards
        weather_details = get_location_specific_weather(city) if city else "No location specified"
        hazard_news = get_location_specific_hazard_news(city) if city else []
        financial_news_alerts = finance_news()

        # Calculate risk score based on hazards and financial alerts
        base_score = 65
        hazard_adjustment = min(len(hazard_news) * 5, 20)
        financial_adjustment = min(len(financial_news_alerts) * 2, 10)  # Financial news has less impact
        risk_score = base_score + hazard_adjustment + financial_adjustment

        risk_level = "High Risk" if risk_score > 80 else "Medium Risk" if risk_score > 60 else "Low Risk"

        response = {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "location_found": city or "Not specified",
            "weather_details": weather_details,
            "hazard_alerts": hazard_news,
            "financial_alerts": financial_news_alerts,  # ADDED
            "alert_count": len(hazard_news),
            "financial_alert_count": len(financial_news_alerts),  # ADDED
            "total_alert_count": len(hazard_news) + len(financial_news_alerts),  # ADDED
            "text_length": len(full_text),
            "processing_status": "success",
            "timestamp": datetime.now().isoformat()
        }

        print(
            f"✅ Assessment complete for {city}: {len(hazard_news)} hazard alerts and {len(financial_news_alerts)} financial alerts found")
        return jsonify(response)

    except Exception as e:
        error_msg = f"Failed to process PDF: {str(e)}"
        print(f"❌ Assessment error: {error_msg}")
        print(f"❌ Full traceback: {traceback.format_exc()}")

        return jsonify({
            "error": error_msg,
            "processing_status": "failed",
            "timestamp": datetime.now().isoformat()
        }), 500


@app.route('/api/risk_alerts', methods=['GET'])
def get_risk_alerts():
    """Enhanced risk alerts endpoint."""
    try:
        location = request.args.get('location')
        alerts = []

        if location:
            # Get location-specific hazards
            hazards = get_location_specific_hazard_news(location)
            for hazard in hazards[:5]:  # Limit to 5
                alerts.append({
                    "type": hazard.get("type", "Alert"),
                    "details": f"{hazard.get('title', 'Unknown')}: {hazard.get('details', '')}"[:100] + "..."
                })

        # Add general alerts
        if not alerts:  # Only add generic alerts if no location-specific ones
            alerts = [
                {"type": "Weather", "details": "No severe weather alerts at this time."},
                {"type": "Economic", "details": "Market conditions stable."},
                {"type": "General", "details": "All systems monitoring normally."}
            ]

        return jsonify(alerts)

    except Exception as e:
        print(f"❌ Risk alerts error: {e}")
        return jsonify([{"type": "Error", "details": "Could not load alerts."}])


@app.route('/api/health', methods=['GET'])
def health_check():
    """Enhanced health check."""
    return jsonify({
        "status": "healthy",
        "message": "API is running",
        "config_loaded": bool(NEWS_API_KEY and OPENWEATHERMAP_API_KEY),
        "timestamp": datetime.now().isoformat()
    })


@app.route('/api/debug/finance', methods=['GET'])
def debug_finance():
    """Debug endpoint to test financial alerts functionality."""
    try:
        print("🧪 Testing financial alerts...")

        # Test with a few popular symbols
        test_symbols = ['AAPL', 'GOOGL', 'MSFT']
        financial_alerts = finance_news(symbols=test_symbols)

        return jsonify({
            "finance_api_key_available": bool(FINANCE_API_KEY),
            "finance_api_key_length": len(FINANCE_API_KEY) if FINANCE_API_KEY else 0,
            "financial_alerts_count": len(financial_alerts),
            "financial_alerts": financial_alerts,
            "test_symbols": test_symbols,
            "status": "success"
        })
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error",
            "finance_api_key_available": bool(FINANCE_API_KEY)
        })


@app.route('/api/assess_debug', methods=['POST'])
def assess_application_debug():
    """Enhanced PDF assessment with detailed debugging."""
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    try:
        print(f"🔄 Processing file: {file.filename}")
        file_content = file.read()

        if len(file_content) == 0:
            return jsonify({"error": "Uploaded file is empty"}), 400

        # Extract text
        full_text = extract_text_from_pdf(file_content)
        print(f"📄 Text extracted: {len(full_text)} characters")

        # Parse location
        city = parse_city_from_text(full_text)
        print(f"📍 Location detected: {city}")

        # Get weather and hazards
        weather_details = get_location_specific_weather(city) if city else "No location specified"
        print(f"🌤️ Weather details: {weather_details}")

        hazard_news = get_location_specific_hazard_news(city) if city else []
        print(f"⚠️ Hazard alerts found: {len(hazard_news)}")

        # Get financial news - IMPORTANT: Make sure this is called!
        print("💰 Getting financial alerts...")
        financial_news_alerts = finance_news()
        print(f"💰 Financial alerts found: {len(financial_news_alerts)}")

        # Debug: Print first few financial alerts
        for i, alert in enumerate(financial_news_alerts[:3]):
            print(f"💰 Financial Alert {i + 1}: {alert.get('title', 'No title')}")

        # Calculate risk score
        base_score = 65
        hazard_adjustment = min(len(hazard_news) * 5, 20)
        financial_adjustment = min(len(financial_news_alerts) * 2, 10)
        risk_score = base_score + hazard_adjustment + financial_adjustment

        risk_level = "High Risk" if risk_score > 80 else "Medium Risk" if risk_score > 60 else "Low Risk"

        response = {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "location_found": city or "Not specified",
            "weather_details": weather_details,
            "hazard_alerts": hazard_news,
            "financial_alerts": financial_news_alerts,  # Make sure this is included
            "alert_count": len(hazard_news),
            "financial_alert_count": len(financial_news_alerts),  # Make sure this is included
            "total_alert_count": len(hazard_news) + len(financial_news_alerts),
            "text_length": len(full_text),
            "processing_status": "success",
            "timestamp": datetime.now().isoformat(),
            # Debug information
            "debug_info": {
                "city_detected": city,
                "weather_api_called": bool(city),
                "hazard_news_count": len(hazard_news),
                "financial_news_count": len(financial_news_alerts),
                "finance_api_key_available": bool(FINANCE_API_KEY)
            }
        }

        print(f"✅ Assessment complete. Response keys: {list(response.keys())}")
        print(f"✅ Financial alerts in response: {len(response.get('financial_alerts', []))}")

        return jsonify(response)

    except Exception as e:
        error_msg = f"Failed to process PDF: {str(e)}"
        print(f"❌ Assessment error: {error_msg}")
        print(f"❌ Full traceback: {traceback.format_exc()}")

        return jsonify({
            "error": error_msg,
            "processing_status": "failed",
            "timestamp": datetime.now().isoformat()
        }), 500


# Add these imports to the top of your existing api.py (after the existing imports)
import json
from jinja2 import Environment, BaseLoader
from fpdf import FPDF
import logging

# Add these after your existing global variables
APRA_COMPLIANCE_CHECKLIST = {
    "metadata": {
        "name": "APRA Compliance Checklist",
        "version": "1.0",
        "jurisdiction": "AU",
        "regulator": "APRA",
        "last_updated": "2025-08-21",
        "status_enum": ["pass", "fail", "partial", "not_applicable", "not_assessed"],
    },
    "standards": {
        "CPS 234 (Information Security)": [
            {
                "id": "CPS234.01",
                "clause": "Governance & Accountability",
                "requirement": "Board and senior management maintain oversight of information security capability and posture.",
                "evidence_hints": [
                    "Board/committee minutes with IS reporting",
                    "Information security policy approved by Board",
                    "CISO charter and reporting lines"
                ],
                "owner": "CISO",
                "frequency": "annual",
                "severity": "high",
                "automatable": False,
                "status": "not_assessed",
                "notes": ""
            },
            {
                "id": "CPS234.05",
                "clause": "Controls Commensurate with Vulnerabilities",
                "requirement": "Implement controls to protect information assets consistent with vulnerabilities and threats.",
                "evidence_hints": [
                    "Control library mapped to assets (e.g., CIS/NIST)",
                    "Risk assessments per asset/service",
                    "Compensating controls documentation"
                ],
                "owner": "CISO",
                "frequency": "annual",
                "severity": "high",
                "automatable": True,
                "status": "not_assessed",
                "notes": ""
            },
            {
                "id": "CPS234.08",
                "clause": "Third-Party & Supply Chain Security",
                "requirement": "Assess and manage third-party information security, including contractual obligations and assurance.",
                "evidence_hints": [
                    "Security clauses in contracts",
                    "TPRM assessments/SOC2/ISO certificates",
                    "Right-to-audit evidence"
                ],
                "owner": "Procurement/TPRM",
                "frequency": "annual",
                "severity": "high",
                "automatable": True,
                "status": "not_assessed",
                "notes": ""
            },
        ],
        "CPS 230 (Operational Risk Management)": [
            {
                "id": "CPS230.02",
                "clause": "Critical Operations & Tolerances",
                "requirement": "Identify critical operations and set impact tolerances (e.g., max tolerable outage).",
                "evidence_hints": [
                    "List of critical operations",
                    "Impact tolerance statements with metrics",
                    "Dependency maps (people/tech/third-parties)"
                ],
                "owner": "Business Resilience",
                "frequency": "annual",
                "severity": "high",
                "automatable": True,
                "status": "not_assessed",
                "notes": ""
            }
        ],
    }
}

# Enhanced policy template
ENHANCED_POLICY_TEMPLATE = """
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>{{ product.product_name or "Insurance Policy" }} - Policy Schedule</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 30px; line-height: 1.6; }
    .header { text-align: center; border-bottom: 2px solid #2c3e50; padding-bottom: 20px; }
    .section { margin: 20px 0; }
    .section h3 { color: #2c3e50; border-bottom: 1px solid #ecf0f1; padding-bottom: 5px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 15px 0; }
    .info-item { background: #f8f9fa; padding: 10px; border-radius: 5px; }
    .benefits-list { background: #f1f2f6; padding: 15px; border-radius: 8px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #bdc3c7; font-size: 12px; color: #7f8c8d; }
  </style>
</head>
<body>
  <div class="header">
    <h1>{{ fund.Name if fund else 'Private Health Fund' }}</h1>
    <h2>Policy Schedule — {{ product.product_name or "Insurance Policy" }}</h2>
    <p><strong>Extract Date:</strong> {{ product.extract_date or "Not specified" }}</p>
  </div>

  {% if user_data and user_data.personal_info %}
  <div class="section">
    <h3>Policyholder Information</h3>
    <div class="info-grid">
      <div class="info-item">
        <strong>Full Name:</strong> {{ user_data.personal_info.full_name }}
      </div>
      <div class="info-item">
        <strong>Date of Birth:</strong> {{ user_data.personal_info.dob }}
      </div>
      <div class="info-item">
        <strong>Gender:</strong> {{ user_data.personal_info.gender }}
      </div>
      <div class="info-item">
        <strong>Contact:</strong> {{ user_data.personal_info.email }}
      </div>
    </div>
  </div>
  {% endif %}

  <div class="section">
    <h3>Policy Details</h3>
    <div class="info-grid">
      <div class="info-item">
        <strong>Product ID:</strong> {{ product.product_id }}
      </div>
      <div class="info-item">
        <strong>Status:</strong> {{ product.open_closed }}
      </div>
      <div class="info-item">
        <strong>Type:</strong> {{ product.product_type }}
      </div>
      <div class="info-item">
        <strong>Sum Insured:</strong> ${{ "{:,.2f}".format(product.sum_insured) if product.sum_insured else "Not specified" }}
      </div>
    </div>
  </div>

  {% if product.benefits %}
  <div class="section">
    <h3>Benefits Coverage</h3>
    <div class="benefits-list">
      {% for benefit in product.benefits %}
      <div style="margin: 10px 0; padding: 8px; background: white; border-radius: 4px;">
        <strong>{{ benefit.code }}:</strong> {{ benefit.text }}<br>
        <em>Coverage Limit: ${{ "{:,.2f}".format(benefit.amount) if benefit.amount else "Unlimited" }}</em>
      </div>
      {% endfor %}
    </div>
  </div>
  {% endif %}

  {% if user_data and user_data.health_lifestyle %}
  <div class="section">
    <h3>Health Information</h3>
    <div class="info-grid">
      <div class="info-item">
        <strong>Smoker:</strong> {{ "Yes" if user_data.health_lifestyle.smoker else "No" }}
      </div>
      <div class="info-item">
        <strong>Pre-existing Conditions:</strong> {{ ", ".join(user_data.health_lifestyle.pre_existing_conditions) if user_data.health_lifestyle.pre_existing_conditions else "None declared" }}
      </div>
    </div>
  </div>
  {% endif %}

  <div class="footer">
    <p><em>This document is auto-generated from insurance data. This summary is generated automatically and requires legal review.</em></p>
    <p>Generated on: {{ timestamp }}</p>
  </div>
</body>
</html>
"""


# Helper functions for enhanced policy generation
def generate_enhanced_policy_with_user_data(product_json, fund_json, user_data_json):
    """Enhanced policy generation using both OpenAI and templates"""
    if not client:
        return "OpenAI client is not initialized. Check API key."

    ENHANCED_SUMMARY_PROMPT = """
    You are an expert insurance policy drafter. Use the provided product, fund, and user data JSON
    to generate a comprehensive draft policy schedule with the following sections:

    1. **Preamble** - Policy introduction and effective dates
    2. **Operative Clause** - Main coverage statement
    3. **Definitions** - Key terms and definitions
    4. **Coverage Details** - Specific coverage amounts and conditions
    5. **Cumulative Bonus** - Bonus provisions if applicable
    6. **Waiting Periods** - Any waiting periods for coverage
    7. **Exclusions** - What is not covered
    8. **Moratorium Period** - Any moratorium provisions
    9. **Claim Procedure** - How to file claims
    10. **General Terms & Conditions** - Standard policy conditions

    Structure each section clearly with headings. Be specific about coverage amounts, limits, and conditions.
    Do not invent data - if information is missing, write "[Data not provided]".
    The tone should be formal and professional, suitable for a legal document.
    End with: "This summary is generated automatically and requires legal review."
    """

    # Combine all data
    full_context = f"""
    Product Information: {json.dumps(product_json, indent=2)}

    Fund Information: {json.dumps(fund_json, indent=2)}

    Applicant Data: {json.dumps(user_data_json, indent=2)}
    """

    try:
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": ENHANCED_SUMMARY_PROMPT},
                {"role": "user", "content": full_context}
            ],
            temperature=0.1
        )
        return resp.choices[0].message.content
    except Exception as e:
        print(f"❌ OpenAI API error: {e}")
        return f"Error generating policy draft: {e}"


def render_policy_html(product_json, fund_json=None, user_data_json=None):
    """Render HTML policy using Jinja2 template"""
    env = Environment(loader=BaseLoader())
    template = env.from_string(ENHANCED_POLICY_TEMPLATE)

    return template.render(
        product=product_json,
        fund=fund_json,
        user_data=user_data_json,
        timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )


def save_ai_draft_pdf_enhanced(draft_text, out_file="ai_draft_policy.pdf"):
    """Enhanced PDF generation with better formatting"""
    try:
        # Convert markdown-style text to HTML
        html_body = markdown.markdown(draft_text) if markdown else draft_text.replace('\n', '<br>')

        html_template = f"""
        <!doctype html>
        <html>
        <head>
          <meta charset="utf-8"/>
          <style>
            body {{ font-family: 'Times New Roman', serif; margin: 40px; line-height: 1.6; color: #2c3e50; }}
            h1 {{ color: #2c3e50; text-align: center; border-bottom: 3px solid #3498db; padding-bottom: 10px; }}
            h2 {{ color: #34495e; margin-top: 25px; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; }}
            h3 {{ color: #34495e; margin-top: 20px; }}
            p {{ text-align: justify; margin: 10px 0; }}
            .disclaimer {{ background: #f39c12; color: white; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; font-weight: bold; }}
            .section {{ margin: 20px 0; padding: 15px; border-left: 4px solid #3498db; background: #f8f9fa; }}
          </style>
        </head>
        <body>
          <h1>Draft Insurance Policy Document</h1>
          <div class="disclaimer">AI-generated draft — requires legal review</div>
          <div class="content">
            {html_body}
          </div>
        </body>
        </html>
        """

        # Use WeasyPrint if available, otherwise fall back to simple PDF
        try:
            from weasyprint import HTML
            pdf_bytes = HTML(string=html_template).write_pdf()
            return pdf_bytes
        except ImportError:
            # Fallback to FPDF
            return generate_pdf_from_draft(draft_text)

    except Exception as e:
        print(f"❌ PDF generation error: {e}")
        return generate_pdf_from_draft(draft_text)


def enhanced_apra_compliance_check(policy_text):
    """Enhanced APRA compliance check with detailed analysis"""
    if not client:
        return {"error": "OpenAI client is not initialized. Check API key."}

    ENHANCED_COMPLIANCE_PROMPT = """
    You are a senior APRA compliance analyst with expertise in Australian financial services regulation.
    Analyze the provided insurance policy text against the APRA compliance requirements.

    For each requirement, provide:
    1. A compliance status: "Compliant", "Partially Compliant", "Not Compliant", or "Not Applicable"
    2. Specific evidence from the policy text (direct quotes)
    3. Gap analysis if non-compliant
    4. Recommended actions for improvement
    5. Risk level: "High", "Medium", or "Low"

    Your response must be valid JSON with the structure:
    {
        "overall_compliance_score": <percentage>,
        "compliance_results": [
            {
                "requirement_id": "string",
                "requirement_text": "string", 
                "status": "string",
                "evidence": "string",
                "gaps_identified": ["string"],
                "recommendations": ["string"],
                "risk_level": "string",
                "notes": "string"
            }
        ],
        "summary": {
            "total_requirements": <number>,
            "compliant": <number>,
            "partially_compliant": <number>,
            "non_compliant": <number>,
            "not_applicable": <number>,
            "high_risk_items": <number>
        }
    }
    """

    try:
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": ENHANCED_COMPLIANCE_PROMPT},
                {"role": "user", "content": f"""
Policy Text:
```
{policy_text}
```

APRA Compliance Checklist:
```json
{json.dumps(APRA_COMPLIANCE_CHECKLIST, indent=2)}
```
                """}
            ],
            temperature=0.0
        )

        result = json.loads(resp.choices[0].message.content)

        # Add timestamp and metadata
        result["analysis_metadata"] = {
            "timestamp": datetime.now().isoformat(),
            "checklist_version": APRA_COMPLIANCE_CHECKLIST["metadata"]["version"],
            "text_length": len(policy_text),
            "analysis_model": "gpt-4o-mini"
        }

        return result

    except Exception as e:
        print(f"❌ APRA compliance check error: {e}")
        return {
            "error": f"Compliance analysis failed: {e}",
            "overall_compliance_score": 0,
            "compliance_results": [],
            "summary": {"error": True}
        }


# Add these new endpoints to your existing api.py (before the if __name__ == '__main__': block)

@app.route('/api/generate_enhanced_policy', methods=['POST'])
def generate_enhanced_policy_endpoint():
    """Enhanced policy generation with better templates and AI integration"""
    print("📄 Received request for enhanced policy generation.")
    if not client:
        return jsonify({"error": "AI client not configured on the server."}), 500

    try:
        data = request.get_json()

        # Validate required data
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Set default values for missing data
        product_data = data.get("product", {
            "product_id": "DEFAULT-001",
            "product_name": "Standard Insurance Policy",
            "extract_date": datetime.now().strftime("%Y-%m-%d"),
            "open_closed": "Open",
            "product_type": "General",
            "sum_insured": 100000,
            "benefits": []
        })

        fund_data = data.get("fund", {"Name": "Insurance Provider"})
        user_data = data.get("user_data", {})

        # Generate both AI content and HTML template
        print("🤖 Generating AI policy content...")
        ai_draft = generate_enhanced_policy_with_user_data(product_data, fund_data, user_data)

        print("🎨 Rendering HTML template...")
        html_content = render_policy_html(product_data, fund_data, user_data)

        # Combine AI content with template
        combined_content = f"{ai_draft}\n\n--- POLICY SCHEDULE ---\n\n{html_content}"

        # Generate PDF
        print("📄 Converting to PDF...")
        pdf_bytes = save_ai_draft_pdf_enhanced(combined_content)

        # Return PDF
        from io import BytesIO
        return send_file(
            BytesIO(pdf_bytes),
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'Enhanced_Policy_Draft_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf'
        )

    except Exception as e:
        print(f"❌ Error in enhanced policy generation: {e}\n{traceback.format_exc()}")
        return jsonify({"error": f"Policy generation failed: {e}"}), 500


@app.route('/api/enhanced_compliance_check', methods=['POST'])
def enhanced_compliance_check_endpoint():
    """Enhanced APRA compliance checking endpoint"""
    print("✅ Received request for enhanced compliance check.")
    if not client:
        return jsonify({"error": "AI client not configured on the server."}), 500

    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    try:
        # Extract text from PDF
        print("📄 Extracting text from PDF...")
        policy_text = extract_text_from_pdf_stream(file.stream)

        if not policy_text or len(policy_text) < 50:
            return jsonify({"error": "Could not extract sufficient text from the PDF."}), 400

        print(f"📋 Analyzing {len(policy_text)} characters of policy text...")

        # Run enhanced compliance check
        results = enhanced_apra_compliance_check(policy_text)

        if "error" in results:
            return jsonify(results), 500

        print("✓ Enhanced compliance check completed successfully.")
        return jsonify(results)

    except Exception as e:
        print(f"❌ Error in enhanced compliance check: {e}\n{traceback.format_exc()}")
        return jsonify({"error": f"Compliance check failed: {e}"}), 500


@app.route('/api/get_compliance_checklist', methods=['GET'])
def get_compliance_checklist():
    """Get the APRA compliance checklist for frontend display"""
    try:
        return jsonify({
            "checklist": APRA_COMPLIANCE_CHECKLIST,
            "metadata": {
                "total_standards": len(APRA_COMPLIANCE_CHECKLIST["standards"]),
                "total_requirements": sum(len(reqs) for reqs in APRA_COMPLIANCE_CHECKLIST["standards"].values()),
                "last_updated": APRA_COMPLIANCE_CHECKLIST["metadata"]["last_updated"]
            }
        })
    except Exception as e:
        print(f"❌ Error getting compliance checklist: {e}")
        return jsonify({"error": "Failed to retrieve compliance checklist"}), 500


@app.route('/api/enhanced_assess', methods=['POST'])
def enhanced_assess_application():
    """Enhanced assessment combining ML prediction, risk analysis, and compliance"""
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    try:
        print(f"🔄 Processing enhanced assessment for: {file.filename}")
        file_content = file.read()

        if len(file_content) == 0:
            return jsonify({"error": "Uploaded file is empty"}), 400

        # Extract text
        full_text = extract_text_from_pdf(file_content)

        # Parse location
        city = parse_city_from_text(full_text)

        # Get external risk factors
        weather_details = get_location_specific_weather(city) if city else "No location specified"
        hazard_news = get_location_specific_hazard_news(city) if city else []
        financial_news_alerts = finance_news()

        # Calculate base risk score
        base_score = 65
        hazard_adjustment = min(len(hazard_news) * 5, 20)
        financial_adjustment = min(len(financial_news_alerts) * 2, 10)
        external_risk_score = base_score + hazard_adjustment + financial_adjustment

        # Run compliance check if OpenAI is available
        compliance_results = None
        if client:
            try:
                print("📋 Running compliance analysis...")
                compliance_results = enhanced_apra_compliance_check(full_text)
            except Exception as e:
                print(f"⚠️ Compliance check failed: {e}")

        # Determine final risk level
        risk_level = "High Risk" if external_risk_score > 80 else "Medium Risk" if external_risk_score > 60 else "Low Risk"

        response = {
            "enhanced_assessment": True,
            "risk_score": external_risk_score,
            "risk_level": risk_level,
            "location_found": city or "Not specified",
            "weather_details": weather_details,
            "hazard_alerts": hazard_news,
            "financial_alerts": financial_news_alerts,
            "alert_count": len(hazard_news),
            "financial_alert_count": len(financial_news_alerts),
            "total_alert_count": len(hazard_news) + len(financial_news_alerts),
            "text_length": len(full_text),
            "processing_status": "success",
            "timestamp": datetime.now().isoformat(),

            # Enhanced features
            "compliance_analysis": compliance_results,
            "has_compliance_data": compliance_results is not None and "error" not in compliance_results,
            "ai_features_available": client is not None,

            # Metadata for frontend
            "enhancement_features": {
                "compliance_checking": True,
                "enhanced_templates": True,
                "detailed_analysis": True,
                "apra_standards": True
            }
        }

        print(f"✅ Enhanced assessment complete for {city}: Risk Score {external_risk_score}")
        return jsonify(response)

    except Exception as e:
        error_msg = f"Enhanced assessment failed: {str(e)}"
        print(f"❌ {error_msg}")
        print(f"❌ Full traceback: {traceback.format_exc()}")

        return jsonify({
            "error": error_msg,
            "processing_status": "failed",
            "enhanced_assessment": False,
            "timestamp": datetime.now().isoformat()
        }), 500


# --- App Runner ---
if __name__ == '__main__':
    check_api_keys_on_startup()  # Run the API key check
    print("🚀 Starting Flask application...")
    print(f"   - PDF Assessment Endpoint: /api/assess [POST]")
    print(f"   - ML Prediction Endpoint: /api/predict_ml [POST]")
    print(f"   - Debug Endpoints available at /api/debug/*")
    app.run(debug=True, port=5000)
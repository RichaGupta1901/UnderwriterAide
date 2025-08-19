from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import feedparser
import fitz  # PyMuPDF
from datetime import datetime, timedelta
import re
import traceback
import time
import os  # NEW: Import the os module
from dotenv import load_dotenv  # NEW: Import the load_dotenv function

app = Flask(__name__)
CORS(app)

load_dotenv()  # NEW: This line loads the .env file

# --- GLOBAL VARIABLES & CONFIG ---

NEWS_API_KEY = os.getenv("NEWS_API_KEY")
OPENWEATHERMAP_API_KEY = os.getenv("OPENWEATHERMAP_API_KEY")
FINANCE_API_KEY = os.getenv("FINANCE_API_KEY")

# CHANGED: This function is no longer needed and can be removed,
# but we can keep the startup print messages for debugging.
def check_api_keys_on_startup():
    print("🚀 Starting Flask application...")
    print(f"✓ Weather API available: {bool(OPENWEATHERMAP_API_KEY)}")
    print(f"✓ News API available: {bool(NEWS_API_KEY)}")
    print(f"✓ Finance API available: {bool(FINANCE_API_KEY)}")
    if not all([OPENWEATHERMAP_API_KEY, NEWS_API_KEY, FINANCE_API_KEY]):
        print("⚠️  One or more API keys are missing. Check your .env file.")
    else:
        print("✓ All API keys loaded successfully from .env file.")



# --- Helper Functions ---

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
    """Fetch hazardous news using NewsAPI with better error handling."""
    if not NEWS_API_KEY:
        print("⚠️  NEWS_API_KEY not available - skipping NewsAPI")
        return []

    hazard_keywords = [
        "emergency", "disaster", "evacuation", "fire", "flood", "earthquake",
        "storm", "hurricane", "tornado", "accident", "explosion", "spill",
        "hazard", "alert", "warning", "crisis", "incident"
    ]

    # Build search query
    keyword_query = " OR ".join(hazard_keywords[:8])  # Limit query length
    query = f'"{city}" AND ({keyword_query})'

    url = "https://newsapi.org/v2/everything"
    params = {
        'q': query,
        'apiKey': NEWS_API_KEY,
        'language': 'en',
        'sortBy': 'publishedAt',
        'from': (datetime.now() - timedelta(days=3)).strftime('%Y-%m-%d'),  # Last 3 days
        'pageSize': 10
    }

    for attempt in range(max_retries):
        try:
            print(f"📰 Fetching news for {city} (attempt {attempt + 1}/{max_retries})")
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

                # Check for hazard content
                if any(keyword in content for keyword in hazard_keywords):
                    alerts.append({
                        'type': 'News Alert',
                        'title': article.get('title'),
                        'details': article.get('description', 'No description available')[:150] + '...',
                        'source': article.get('source', {}).get('name', 'News'),
                        'published': article.get('publishedAt'),
                        'url': article.get('url'),
                        'location': city
                    })

            print(f"✓ Found {len(alerts)} news alerts for {city}")
            return alerts

        except requests.exceptions.RequestException as e:
            print(f"❌ NewsAPI request failed (attempt {attempt + 1}): {e}")


def get_emergency_rss_feeds(city, max_feeds=3):
    """Fetch emergency alerts from RSS feeds with better error handling."""
    alerts = []

    # Curated list of working RSS feeds
    rss_feeds = [
        # Weather and emergency feeds
        "https://alerts.weather.gov/cap/us.php?x=1",
        "https://rss.cnn.com/rss/edition.rss",
        "https://feeds.bbci.co.uk/news/rss.xml",
        "https://www.abc.net.au/news/feed/51120/rss.xml",  # ABC Australia
    ]

    hazard_keywords = ["emergency", "alert", "warning", "disaster", "evacuation", "fire", "flood", "storm"]

    feeds_processed = 0
    for feed_url in rss_feeds:
        if feeds_processed >= max_feeds:
            break

        try:
            print(f"📡 Parsing RSS feed: {feed_url}")
            feed = feedparser.parse(feed_url)

            if not hasattr(feed, 'entries'):
                print(f"⚠️  Invalid RSS feed format: {feed_url}")
                continue

            feeds_processed += 1

            for entry in feed.entries[:3]:  # Limit per feed
                title = entry.get('title', '').lower()
                summary = entry.get('summary', '').lower()
                content = f"{title} {summary}"

                # Check relevance to city and hazard keywords
                if (city.lower() in content and
                        any(keyword in content for keyword in hazard_keywords)):
                    alerts.append({
                        'type': 'Emergency Alert',
                        'title': entry.get('title'),
                        'details': (entry.get('summary', 'No details available')[:120] + '...'),
                        'source': 'Emergency RSS',
                        'published': entry.get('published'),
                        'url': entry.get('link'),
                        'location': city
                    })

        except Exception as e:
            print(f"❌ RSS feed error for {feed_url}: {e}")
            continue

    print(f"✓ Found {len(alerts)} RSS alerts for {city}")
    return alerts


def get_location_specific_hazard_news(city):
    """Main function to get all hazard news for a city."""
    if not city:
        print("❌ No city provided for hazard news")
        return []

    print(f"🚨 Getting hazard news for: {city}")
    all_alerts = []

    # Try NewsAPI
    try:
        news_alerts = get_newsapi_hazards(city)
        all_alerts.extend(news_alerts)
    except Exception as e:
        print(f"❌ NewsAPI failed: {e}")

    # Try RSS feeds
    try:
        rss_alerts = get_emergency_rss_feeds(city)
        all_alerts.extend(rss_alerts)
    except Exception as e:
        print(f"❌ RSS feeds failed: {e}")

    # Remove duplicates based on title
    unique_alerts = []
    seen_titles = set()

    for alert in all_alerts:
        title_key = alert.get('title', '').lower().strip()
        if title_key and title_key not in seen_titles and len(title_key) > 10:
            seen_titles.add(title_key)
            unique_alerts.append(alert)

    print(f"✓ Total unique alerts for {city}: {len(unique_alerts)}")
    return unique_alerts[:10]  # Return top 10


def finance_news(symbols=None, max_retries=2):
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


# Update the get_location_specific_hazard_news function to include financial data



def extract_text_from_pdf(file_stream):
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


# --- Debug Endpoints ---

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


# --- Main API Endpoints ---

# --- Main API Endpoints ---

@app.route('/api/assess', methods=['POST'])
def assess_application():
    """Enhanced PDF assessment with better error handling."""
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    # A check for file type is good, but let's not be overly restrictive if not needed.
    # if not file.filename.lower().endswith('.pdf'):
    #     return jsonify({"error": "Only PDF files are supported"}), 400

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

        # <<< FIX 1: Call the finance news function >>>
        # We can pass symbols from the PDF later, for now we use defaults.
        financial_news_alerts = finance_news()

        # Calculate risk score based on hazards and financial alerts
        base_score = 65
        hazard_adjustment = min(len(hazard_news) * 5, 20)
        financial_adjustment = min(len(financial_news_alerts) * 2, 10) # Financial news has less impact
        risk_score = base_score + hazard_adjustment + financial_adjustment

        risk_level = "High Risk" if risk_score > 80 else "Medium Risk" if risk_score > 60 else "Low Risk"

        # <<< FIX 2: Add all the required keys to the response object >>>
        response = {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "location_found": city or "Not specified",
            "weather_details": weather_details,
            "hazard_alerts": hazard_news,
            "financial_alerts": financial_news_alerts, # ADDED
            "alert_count": len(hazard_news),
            "financial_alert_count": len(financial_news_alerts), # ADDED
            "total_alert_count": len(hazard_news) + len(financial_news_alerts), # ADDED
            "text_length": len(full_text),
            "processing_status": "success",
            "timestamp": datetime.now().isoformat()
        }

        print(f"✅ Assessment complete for {city}: {len(hazard_news)} hazard alerts and {len(financial_news_alerts)} financial alerts found")
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


if __name__ == '__main__':
    print("🚀 Starting Flask application...")
    print(f"📍 Debug endpoints available at:")
    print(f"   - /api/debug/config")
    print(f"   - /api/debug/test_city/<city>")
    app.run(debug=True, port=5000)
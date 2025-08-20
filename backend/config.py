# config.py
# Configuration file for external API keys

import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

# OpenWeatherMap API Key
# Get your free API key from: https://openweathermap.org/api
OPENWEATHERMAP_API_KEY = os.getenv('OPENWEATHERMAP_API_KEY', 'your_openweather_api_key_here')

# NewsAPI Key  
# Get your free API key from: https://newsapi.org/
NEWS_API_KEY = os.getenv('NEWS_API_KEY', 'your_newsapi_key_here')

# API Configuration
API_TIMEOUT = 10  # seconds
MAX_ALERTS_PER_SOURCE = 10

# Hazard Keywords for filtering news
HAZARD_KEYWORDS = [
    "fire", "flood", "earthquake", "storm", "hurricane", "tornado",
    "emergency", "evacuation", "disaster", "hazard", "accident",
    "explosion", "chemical spill", "gas leak", "infrastructure failure",
    "power outage", "water contamination", "landslide", "tsunami",
    "cyclone", "typhoon", "blizzard", "drought", "volcanic", "avalanche"
]

# RSS Feed URLs for emergency services (add more as needed)
EMERGENCY_RSS_FEEDS = [
    # Australia
    "http://www.emergency.wa.gov.au/rss/warnings.xml",
    "https://www.emergency.vic.gov.au/rss/warnings.xml",
    "http://www.rfs.nsw.gov.au/feeds/majorIncidents.xml",

    # United States
    "https://alerts.weather.gov/cap/us.php?x=1",

    # Canada
    "https://www.canada.ca/content/dam/hc-sc/migration/hc-sc/ahc-asc/rss/media-eng.xml",

    # International news sources
    "https://rss.cnn.com/rss/edition.rss",
    "https://feeds.bbci.co.uk/news/world/rss.xml",
    "https://www.reuters.com/rssFeed/worldNews",
]

# City to country mapping for better API queries
CITY_COUNTRY_MAPPING = {
    "sydney": "AU",
    "melbourne": "AU",
    "brisbane": "AU",
    "perth": "AU",
    "adelaide": "AU",
    "canberra": "AU",
    "darwin": "AU",
    "hobart": "AU",
    "london": "GB",
    "new york": "US",
    "tokyo": "JP",
    "singapore": "SG",
    "hong kong": "HK",
    "auckland": "NZ"
}
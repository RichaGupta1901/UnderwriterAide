import pandas as pd
import requests
from datetime import datetime
import time

# ===========================
# Load and merge datasets
# ===========================
try:
    mock_df = pd.read_csv("australia_insurance_mock_data.csv")
    extended_df = pd.read_csv("australia_insurance_extended_mo.csv")
    print(f"Loaded {len(mock_df)} records from mock data and {len(extended_df)} records from extended data")
except FileNotFoundError as e:
    print(f"Error: Could not find CSV file - {e}")
    exit(1)

# Merge on Customer Name (since no common ID)
combined_df = pd.merge(mock_df, extended_df, on="Customer Name", how="left")
print(f"Merged dataset has {len(combined_df)} records")

# Map state abbreviations to capital cities with coordinates
state_to_coords = {
    "NT": {"city": "Darwin", "lat": -12.4634, "lon": 130.8456},
    "ACT": {"city": "Canberra", "lat": -35.2809, "lon": 149.1300},
    "TAS": {"city": "Hobart", "lat": -42.8821, "lon": 147.3272},
    "SA": {"city": "Adelaide", "lat": -34.9285, "lon": 138.6007},
    "WA": {"city": "Perth", "lat": -31.9505, "lon": 115.8605},
    "QLD": {"city": "Brisbane", "lat": -27.4698, "lon": 153.0251},
    "VIC": {"city": "Melbourne", "lat": -37.8136, "lon": 144.9631},
    "NSW": {"city": "Sydney", "lat": -33.8688, "lon": 151.2093}
}

# ===========================
# OpenWeatherMap API setup
# ===========================
# You need to get a free API key from: https://openweathermap.org/api
API_KEY = "YOUR_OPENWEATHER_API_KEY_HERE"  # Replace with your OpenWeatherMap API key
BASE_URL = "http://api.openweathermap.org/data/2.5/onecall/timemachine"


def get_weather_openweather(lat, lon, date_timestamp):
    """Fetch historical weather using OpenWeatherMap One Call API."""
    url = f"{BASE_URL}?lat={lat}&lon={lon}&dt={date_timestamp}&appid={API_KEY}&units=metric"

    try:
        response = requests.get(url, timeout=30)

        if response.status_code == 200:
            data = response.json()

            if "current" in data:
                current = data["current"]
                return {
                    "temp": current.get("temp"),
                    "humidity": current.get("humidity"),
                    "wind_speed": current.get("wind_speed")
                }
            else:
                print(f"No weather data found for coordinates ({lat}, {lon}) on timestamp {date_timestamp}")
                return {"temp": None, "humidity": None, "wind_speed": None}

        elif response.status_code == 401:
            print(f"Invalid API key for OpenWeatherMap")
            return {"temp": None, "humidity": None, "wind_speed": None}
        elif response.status_code == 429:
            print(f"Rate limit exceeded - waiting longer...")
            time.sleep(5)
            return {"temp": None, "humidity": None, "wind_speed": None}
        else:
            print(f"API request failed: HTTP {response.status_code}")
            return {"temp": None, "humidity": None, "wind_speed": None}

    except requests.exceptions.Timeout:
        print(f"Request timeout for coordinates ({lat}, {lon})")
        return {"temp": None, "humidity": None, "wind_speed": None}
    except requests.exceptions.RequestException as e:
        print(f"Network error: {e}")
        return {"temp": None, "humidity": None, "wind_speed": None}
    except (KeyError, ValueError) as e:
        print(f"Data parsing error: {e}")
        return {"temp": None, "humidity": None, "wind_speed": None}


# Alternative: Use a free weather API (Visual Crossing Weather)
# They offer 1000 free API calls per day
VISUAL_CROSSING_API_KEY = "YOUR_VISUAL_CROSSING_API_KEY"  # Get free key from visualcrossing.com
VISUAL_CROSSING_URL = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline"


def get_weather_visual_crossing(city, date_str):
    """Fetch historical weather using Visual Crossing Weather API (free tier available)."""
    url = f"{VISUAL_CROSSING_URL}/{city},Australia/{date_str}/{date_str}?key={VISUAL_CROSSING_API_KEY}&include=days"

    try:
        response = requests.get(url, timeout=30)

        if response.status_code == 200:
            data = response.json()

            if "days" in data and len(data["days"]) > 0:
                day = data["days"][0]
                return {
                    "temp": day.get("temp"),
                    "humidity": day.get("humidity"),
                    "wind_speed": day.get("windspeed")
                }
            else:
                print(f"No weather data found for {city} on {date_str}")
                return {"temp": None, "humidity": None, "wind_speed": None}

        elif response.status_code == 401:
            print(f"Invalid API key for Visual Crossing")
            return {"temp": None, "humidity": None, "wind_speed": None}
        elif response.status_code == 429:
            print(f"Rate limit exceeded - waiting...")
            time.sleep(2)
            return {"temp": None, "humidity": None, "wind_speed": None}
        else:
            print(f"API request failed for {city} on {date_str}: HTTP {response.status_code}")
            return {"temp": None, "humidity": None, "wind_speed": None}

    except requests.exceptions.RequestException as e:
        print(f"Network error for {city} on {date_str}: {e}")
        return {"temp": None, "humidity": None, "wind_speed": None}
    except (KeyError, ValueError) as e:
        print(f"Data parsing error for {city} on {date_str}: {e}")
        return {"temp": None, "humidity": None, "wind_speed": None}


# Mock weather data function (for testing without API)
def get_mock_weather(city, date_str):
    """Generate mock weather data for testing purposes."""
    import random
    random.seed(hash(city + date_str))  # Consistent mock data

    return {
        "temp": round(random.uniform(10, 35), 1),
        "humidity": random.randint(30, 90),
        "wind_speed": round(random.uniform(5, 25), 1)
    }


# ===========================
# Process dataset
# ===========================
df = combined_df.copy()

# Check for required columns
required_columns = ["Policy Start Date_x", "Policy End Date_x", "State_x"]
missing_columns = [col for col in required_columns if col not in df.columns]
if missing_columns:
    print(f"Error: Missing required columns: {missing_columns}")
    print(f"Available columns: {list(df.columns)}")
    exit(1)

# Ensure dates are in proper format
df["Policy Start Date_x"] = pd.to_datetime(df["Policy Start Date_x"], errors="coerce")
df["Policy End Date_x"] = pd.to_datetime(df["Policy End Date_x"], errors="coerce")

# Check for invalid dates
invalid_start_dates = df["Policy Start Date_x"].isna().sum()
invalid_end_dates = df["Policy End Date_x"].isna().sum()
if invalid_start_dates > 0:
    print(f"Warning: {invalid_start_dates} rows have invalid start dates")
if invalid_end_dates > 0:
    print(f"Warning: {invalid_end_dates} rows have invalid end dates")

# Choose which API to use
print("Choose weather data source:")
print("1. Visual Crossing Weather API (free 1000 calls/day)")
print("2. Mock weather data (for testing)")
print("3. OpenWeatherMap (requires paid plan for historical data)")

choice = input("Enter choice (1, 2, or 3): ").strip()

if choice == "1":
    if VISUAL_CROSSING_API_KEY == "QC5UZX86FHYRAXM9PUXWZSQX2":
        print(
            "Please get a free API key from https://www.visualcrossing.com/weather-api and update VISUAL_CROSSING_API_KEY")
        exit(1)
    weather_function = lambda city, date_str: get_weather_visual_crossing(city, date_str)
    print("Using Visual Crossing Weather API")
elif choice == "2":
    weather_function = lambda city, date_str: get_mock_weather(city, date_str)
    print("Using mock weather data")
elif choice == "3":
    if API_KEY == "YOUR_OPENWEATHER_API_KEY_HERE":
        print("Please get an API key from https://openweathermap.org/api and update API_KEY")
        exit(1)
    weather_function = lambda city, date_str: get_weather_openweather(
        state_to_coords[state]["lat"],
        state_to_coords[state]["lon"],
        int(pd.to_datetime(date_str).timestamp())
    )
    print("Using OpenWeatherMap API")
else:
    print("Invalid choice, using mock data")
    weather_function = lambda city, date_str: get_mock_weather(city, date_str)

# Collect weather data for both start and end dates
start_weather, end_weather = [], []
total_rows = len(df)

for index, row in df.iterrows():
    if index % 50 == 0:  # Progress indicator
        print(f"Processing row {index + 1}/{total_rows}")

    state = row.get("State_x")
    city_info = state_to_coords.get(state, None)

    if city_info:
        city = city_info["city"]

        # Process start date weather
        if pd.notna(row["Policy Start Date_x"]):
            start_date_str = row["Policy Start Date_x"].strftime("%Y-%m-%d")
            start_weather.append(weather_function(city, start_date_str))
        else:
            start_weather.append({"temp": None, "humidity": None, "wind_speed": None})

        # Process end date weather
        if pd.notna(row["Policy End Date_x"]):
            end_date_str = row["Policy End Date_x"].strftime("%Y-%m-%d")
            end_weather.append(weather_function(city, end_date_str))
        else:
            end_weather.append({"temp": None, "humidity": None, "wind_speed": None})
    else:
        print(f"Unknown state: {state} at row {index}")
        start_weather.append({"temp": None, "humidity": None, "wind_speed": None})
        end_weather.append({"temp": None, "humidity": None, "wind_speed": None})

    # Small delay to avoid hitting API rate limits
    if choice == "1":  # Visual Crossing
        time.sleep(0.2)
    elif choice == "3":  # OpenWeatherMap
        time.sleep(1.0)

# Create weather DataFrames
start_weather_df = pd.DataFrame(start_weather).add_prefix("start_")
end_weather_df = pd.DataFrame(end_weather).add_prefix("end_")

# Combine all data
df = pd.concat([df, start_weather_df, end_weather_df], axis=1)

# Save final output
output_file = "insurance_with_weather.csv"
df.to_csv(output_file, index=False)
print(f"✅ {output_file} created with weather data for policy start and end dates.")
print(f"Final dataset has {len(df)} rows and {len(df.columns)} columns")

# Show summary of weather data collected
start_weather_collected = start_weather_df['start_temp'].notna().sum()
end_weather_collected = end_weather_df['end_temp'].notna().sum()
print(f"Weather data collected for {start_weather_collected}/{total_rows} start dates")
print(f"Weather data collected for {end_weather_collected}/{total_rows} end dates")
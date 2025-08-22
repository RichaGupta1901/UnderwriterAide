# backend/ml/model_loader.py

import pickle
import pandas as pd
from flask import current_app
from sklearn.preprocessing import LabelEncoder

model = None
label_encoders = None
model_columns = [
    'Customer Name', 'Age_x', 'State_x', 'Insurance Type_x', 'Annual Premium (AUD)_x',
    'Claim Amount (AUD)_x', 'Claim Status_x', 'Policy Start Date_x', 'Policy End Date_x',
    'Age_y', 'State_y', 'Insurance Type_y', 'Annual Premium (AUD)_y', 'Claim Amount (AUD)_y',
    'Claim Status_y', 'Policy Start Date_y', 'Policy End Date_y', 'Policy Number',
    'Product Tier', 'Payment Frequency', 'Risk Score', 'Email', 'Phone', 'Agent Name'
]


def load_model():
    """Loads the ML model and encoders from disk."""
    global model, label_encoders
    try:
        print("🧠 Loading ML model and encoders...")
        with open(current_app.config['MODEL_PATH'], 'rb') as f_model:
            model = pickle.load(f_model)
        print("   ✓ ML model loaded successfully.")

        with open(current_app.config['ENCODERS_PATH'], 'rb') as f_encoders:
            label_encoders = pickle.load(f_encoders)
        print("   ✓ Label encoders loaded successfully.")
    except FileNotFoundError as e:
        print(f"❌ CRITICAL ERROR: Could not find model or encoder files. {e}")
    except Exception as e:
        print(f"❌ CRITICAL ERROR: An error occurred during model loading: {e}")


def predict_risk(data):
    """Performs a risk prediction using the loaded model."""
    if not model or not label_encoders:
        raise RuntimeError("Model or encoders are not loaded.")

    input_df = pd.DataFrame([data])

    # Preprocess categorical data
    for column, encoder in label_encoders.items():
        if column in input_df.columns:
            input_df[column] = input_df[column].apply(
                lambda x: encoder.transform([x])[0] if x in encoder.classes_ else -1
            )

    # Ensure columns are in the correct order
    processed_df = pd.DataFrame(columns=model_columns)
    for col in model_columns:
        if col in input_df.columns:
            processed_df[col] = input_df[col]
        else:
            raise KeyError(f"Missing required feature in input data: '{col}'")

    # Make prediction
    prediction_proba = model.predict_proba(processed_df)[:, 1]
    return prediction_proba[0]
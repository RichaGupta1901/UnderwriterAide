# risk_scoring_model.py

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score
import xgboost as xgb
import joblib
import shap

# =====================
# 1. Load Data
# =====================
try:
    mock_df = pd.read_csv("australia_insurance_mock_data.csv")
    extended_df = pd.read_csv("australia_insurance_extended_mo.csv")
    print(f"Loaded {len(mock_df)} records from mock data and {len(extended_df)} records from extended data")
except FileNotFoundError as e:
    print(f"Error: Could not find CSV file - {e}")
    exit(1)

# Merge on Customer Name (since no common ID)
df = pd.merge(mock_df, extended_df, on="Customer Name", how="left")
print(f"Merged dataset has {len(df)} records")
# =====================
# 2. Preprocessing
# =====================
# Drop identifiers
drop_cols = ['Customer Name', 'Email', 'Phone', 'Agent Name']
df = df.drop(columns=drop_cols, errors="ignore")

# Convert dates to durations
date_cols = ['Policy Start Date_x', 'Policy End Date_x',
             'Policy Start Date_y', 'Policy End Date_y']

for col in date_cols:
    if col in df.columns:
        df[col] = pd.to_datetime(df[col], errors='coerce')

if {'Policy Start Date_x', 'Policy End Date_x'}.issubset(df.columns):
    df['Policy Duration_x'] = (df['Policy End Date_x'] - df['Policy Start Date_x']).dt.days

if {'Policy Start Date_y', 'Policy End Date_y'}.issubset(df.columns):
    df['Policy Duration_y'] = (df['Policy End Date_y'] - df['Policy Start Date_y']).dt.days

df = df.drop(columns=date_cols, errors="ignore")

# Handle categorical features
categorical_cols = [
    'State_x', 'State_y',
    'Insurance Type_x', 'Insurance Type_y',
    'Claim Status_x', 'Claim Status_y',
    'Policy Number', 'Product Tier', 'Payment Frequency'
]

le_dict = {}
for col in categorical_cols:
    if col in df.columns:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        le_dict[col] = le

# Fill missing values
df = df.fillna(0)

# =====================
# 3. Define Features & Target
# =====================
# Use Claim Status_x as target (1 = claim filed, 0 = no claim)
target = "Claim Status_x"

X = df.drop(columns=[target])
y = df[target]

# =====================
# 4. Train-Test Split
# =====================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# =====================
# 5. Train XGBoost
# =====================
xgb_clf = xgb.XGBClassifier(
    n_estimators=500,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    eval_metric="logloss",
    use_label_encoder=False
)

xgb_clf.fit(X_train, y_train)

explainer = shap.TreeExplainer(xgb_clf)

# Calculate SHAP values for test set
shap_values = explainer.shap_values(X_test)

# ---- Global Explainability ----
# Shows average feature importance across all predictions
shap.summary_plot(shap_values, X_test, plot_type="bar")

# ---- Detailed (per feature) ----
# Shows how each feature affects predictions positively/negatively
shap.summary_plot(shap_values, X_test)

# ---- Local Explainability ----
# Pick one customer/policy and explain its prediction

row_to_explain = 6

# 6. Evaluate
# =====================
y_pred = xgb_clf.predict(X_test)
y_pred_proba = xgb_clf.predict_proba(X_test)

print("Accuracy:", accuracy_score(y_test, y_pred))

try:
    auc = roc_auc_score(y_test, y_pred_proba, multi_class="ovr")
    print("ROC AUC:", auc)
except Exception as e:
    print("ROC AUC could not be computed:", e)

print("\nClassification Report:\n", classification_report(y_test, y_pred))

# Feature Importance
import matplotlib.pyplot as plt
xgb.plot_importance(xgb_clf, max_num_features=15)
plt.show()

# 7. Save Model & Encoders
# =====================
model_filename = "risk_scoring_model.pkl"
encoder_filename = "label_encoders.pkl"

# Save model
joblib.dump(xgb_clf, model_filename)
print(f"✅ Model saved to {model_filename}")

# Save label encoders (for preprocessing new data consistently)
joblib.dump(le_dict, encoder_filename)
print(f"✅ Label encoders saved to {encoder_filename}")


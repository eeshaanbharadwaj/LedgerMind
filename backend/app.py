from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

def analyze_transactions(df):
    try:
        # Expected columns check
        # We need flexible handling. If 'AccountID' is missing, maybe 'Account' works?
        # For simplicity, we enforce 'AccountID' and 'Amount'.
        if 'AccountID' not in df.columns or 'Amount' not in df.columns:
            return {"error": "CSV must contain 'AccountID' and 'Amount' columns."}

        # Data Cleaning
        df['Amount'] = pd.to_numeric(df['Amount'], errors='coerce').fillna(0)
        
        # Feature Engineering: Aggregation by AccountID
        # Features: Average Amount, Transaction Count, Std Dev of Amount
        features = df.groupby('AccountID')['Amount'].agg(
            Avg_Amount='mean',
            Txn_Count='count',
            Std_Amount='std'
        ).fillna(0)
        
        # Determine features for model
        feature_data = features[['Avg_Amount', 'Txn_Count', 'Std_Amount']]
        
        if feature_data.empty:
            return {"error": "Not enough data to analyze."}

        # Standardize features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(feature_data)

        # Train Isolation Forest
        # contamination='auto' performs well generally, but user mentioned anomaly detection.
        model = IsolationForest(n_estimators=100, contamination=0.1, random_state=42)
        model.fit(X_scaled)
        
        # Get anomaly scores (decision_function: higher = normal, lower = abnormal)
        raw_scores = model.decision_function(X_scaled)
        
        # Normalize scores to 0-1 range to create Trust Score
        min_score = raw_scores.min()
        max_score = raw_scores.max()
        
        # Avoid division by zero
        if max_score == min_score:
            normalized_scores = np.ones_like(raw_scores) # All same trust if logic fails
        else:
            normalized_scores = (raw_scores - min_score) / (max_score - min_score)
        
        # Calculate Trust Score (0-100)
        features['Trust_Score'] = np.round(normalized_scores * 100, 2)
        
        # Determine Risk Level
        features['Risk_Level'] = features['Trust_Score'].apply(lambda x: 'High Risk' if x < 50 else 'Low Risk')
        
        # Format Results
        results = []
        for account_id, row in features.iterrows():
            results.append({
                "AccountID": str(account_id),
                "Avg_Amount": round(row['Avg_Amount'], 2),
                "Txn_Count": int(row['Txn_Count']),
                "Trust_Score": row['Trust_Score'],
                "Risk_Level": row['Risk_Level']
            })
            
        # Summary Statistics for Dashboard
        high_risk_count = features[features['Risk_Level'] == 'High Risk'].shape[0]
        low_risk_count = features[features['Risk_Level'] == 'Low Risk'].shape[0]
        
        return {
            "success": True, 
            "results": results, 
            "summary": {
                "total_accounts": len(results),
                "high_risk_accounts": high_risk_count,
                "low_risk_accounts": low_risk_count
            }
        }

    except Exception as e:
        return {"error": str(e)}

@app.route('/')
def home():
    return "LedgerMind Backend is Running!"

@app.route('/analyze', methods=['POST'])
def analyze():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        # Check file extension
        if not file.filename.endswith('.csv'):
            return jsonify({"error": "File is not a CSV"}), 400
            
        df = pd.read_csv(file)
        result = analyze_transactions(df)
        if "error" in result:
             return jsonify(result), 400
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)

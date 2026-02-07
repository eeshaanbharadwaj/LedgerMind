from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

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
        # Features: Average Amount, Transaction Count, Std Dev of Amount, Max Amount, Total Volume
        features = df.groupby('AccountID')['Amount'].agg(
            Avg_Amount='mean',
            Txn_Count='count',
            Std_Amount='std',
            Max_Amount='max',
            Total_Volume='sum'
        ).fillna(0)
        
        # Determine features for model
        feature_data = features[['Avg_Amount', 'Txn_Count', 'Std_Amount', 'Max_Amount', 'Total_Volume']]
        
        if feature_data.empty:
            return {"error": "Not enough data to analyze."}

        # Baseline: Z-score for Amount
        # This helps in identifying gross outliers based on simple statistics
        mean_vol = features['Total_Volume'].mean()
        std_vol = features['Total_Volume'].std()
        if std_vol > 0:
            features['Z_Score'] = (features['Total_Volume'] - mean_vol) / std_vol
        else:
            features['Z_Score'] = 0

        # Standardize features for ML
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
                "Max_Amount": round(row['Max_Amount'], 2),
                "Total_Volume": round(row['Total_Volume'], 2),
                "Txn_Count": int(row['Txn_Count']),
                "Z_Score": round(row['Z_Score'], 2),
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

@app.route('/ai-insights', methods=['POST'])
def ai_insights():
    data = request.json
    if not data or 'summary' not in data or 'results' not in data:
        return jsonify({"error": "Missing analysis data"}), 400
    
    try:
        summary = data['summary']
        # Extract only essential info for AI to save tokens and avoid quota issues
        risky_accounts = []
        for r in data['results']:
            if r['Risk_Level'] == 'High Risk':
                risky_accounts.append({
                    "ID": r['AccountID'],
                    "Vol": r['Total_Volume'],
                    "Score": r['Trust_Score'],
                    "Z": r['Z_Score']
                })
        
        # Limit to top 3 instead of 5 to be even safer with free tier quotas
        risky_accounts = risky_accounts[:3]
        
        prompt = f"""
        Act as a forensic auditor. Analyze this summary:
        Accounts: {summary['total_accounts']} (Risky: {summary['high_risk_accounts']})
        
        Key Suspects:
        {risky_accounts}
        
        Provide 3 bullet points for investigation. Be extremely concise. Use markdown.
        """
        
        try:
            # Using 2.0-flash-lite which typically has more lenient free quotas
            response = client.models.generate_content(
                model='gemini-2.0-flash-lite',
                contents=prompt
            )
            
            if not response.text:
                return jsonify({"insights": "Analysis completed, but AI suggestion was empty. Try again in 60s."})
            
            return jsonify({"insights": response.text})
        except Exception as api_error:
            error_str = str(api_error)
            print(f"Gemini API Error: {error_str}")
            
            if "429" in error_str or "quota" in error_str.lower():
                return jsonify({
                    "error": "Gemini Free Tier is currently busy. Please wait 60s. (Tip: Free API keys have strict 'tokens-per-minute' limits)"
                }), 429
                
            return jsonify({"error": f"API Error: {error_str}"}), 500

    except Exception as e:
        print(f"General AI Route Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)

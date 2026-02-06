# LedgerMind – Behavior-Based Transaction Trust Scoring System

**LedgerMind** is a full-stack web application designed to analyze financial transaction behavior and assign a **Trust Score (0–100)** to accounts. By detecting deviations from historical patterns, it helps identifying risky accounts without explicitly labeling them as fraud.

---

## 🚀 Project Overview

The system uses **unsupervised machine learning (Isolation Forest)** to detect anomalies in transaction data.
- **Input**: CSV file containing transaction history.
- **Process**: 
  1. Aggregates data by Account ID.
  2. Calculates behavioral features (Average Amount, Transaction Count, Standard Deviation).
  3. Uses Isolation Forest to determine how "isolated" (anomalous) an account's behavior is compared to the group.
  4. Converts anomaly scores into a user-friendly **Trust Score**.
- **Output**: A dashboard highlighting High Risk accounts (< 50 Trust Score).

---

## 🛠 Tech Stack

### Frontend
- **React.js (Vite)**: Fast, modern UI framework.
- **Tailwind CSS**: For a premium, responsive dark-mode design.
- **Recharts**: For interactive data visualization.
- **Axios**: For handling API requests.

### Backend
- **Python (Flask)**: Lightweight web server.
- **Pandas & NumPy**: Data processing and feature engineering.
- **Scikit-learn**: Machine Learning (Isolation Forest).

---

## 🧠 ML Model Explanation

We use the **Isolation Forest** algorithm, which is effective for anomaly detection because anomalies are few and different.
1. **Feature Engineering**: We transform raw transactions into account-level summaries:
   - `Avg_Amount`: Average transaction size.
   - `Txn_Count`: Frequency of activity.
   - `Std_Amount`: Variance/volatility of transactions.
2. **Isolation Forest**: The model builds random decision trees. Normal points require many splits to isolate, while anomalies are isolated quickly (short path length).
3. **Scoring**: 
   - The model generates an "anomaly score".
   - We normalize this score to a 0–100 range.
   - **Trust Score = 100 × (Normalized Normality Probability)**.
   - Higher Trust Score = Normal Behavior. Lower Score = Anomalous/Risky.

---

## 📦 How to Run

### Prerequisities
- Python 3.8+
- Node.js & npm

### 1. Backend Setup
Navigate to the `backend` folder:
```bash
cd backend
pip install -r requirements.txt
python app.py
```
 The backend will start at `http://127.0.0.1:5000`.

### 2. Frontend Setup
Open a new terminal and navigate to the `frontend` folder:
```bash
cd frontend
npm install
npm run dev
```
The frontend will start at `http://localhost:5173`.

### 3. Usage
1. Open the frontend URL in your browser.
2. Click **Upload Transaction CSV**.
3. Select `sample_transactions.csv` (located in the `backend` folder) or upload your own.
4. Click **Analyze Behavior**.
5. View the Trust Scores and identified High Risk accounts.

---

## 📂 CSV Format
The CSV file should have at least the following columns:
- `AccountID`: Unique identifier for the account.
- `Amount`: Transaction value.

Example:
```csv
TransactionID,AccountID,Amount
1,ACC001,500.00
2,ACC002,12000.00
```

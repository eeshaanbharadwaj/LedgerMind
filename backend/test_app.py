"""
Test suite for LedgerMind Backend
"""
import pytest
import pandas as pd
import io
from app import app, analyze_transactions

def test_home_route():
    """Test the home route"""
    client = app.test_client()
    response = client.get('/')
    assert response.status_code == 200
    assert b"LedgerMind Backend is Running!" in response.data

def test_analyze_no_file():
    """Test analyze endpoint without file"""
    client = app.test_client()
    response = client.post('/analyze')
    assert response.status_code == 400
    assert b"No file uploaded" in response.data

def test_analyze_empty_filename():
    """Test analyze endpoint with empty filename"""
    client = app.test_client()
    data = {'file': (io.BytesIO(b""), '')}
    response = client.post('/analyze', data=data, content_type='multipart/form-data')
    assert response.status_code == 400

def test_analyze_valid_csv():
    """Test analyze endpoint with valid CSV"""
    client = app.test_client()
    
    # Create a sample CSV
    csv_content = """TransactionID,AccountID,Amount
1,ACC001,500.00
2,ACC001,600.00
3,ACC002,12000.00
4,ACC002,11000.00
5,ACC003,300.00
6,ACC003,350.00
7,ACC003,280.00
"""
    
    data = {
        'file': (io.BytesIO(csv_content.encode()), 'test.csv')
    }
    
    response = client.post('/analyze', data=data, content_type='multipart/form-data')
    assert response.status_code == 200
    
    json_data = response.get_json()
    assert 'success' in json_data
    assert json_data['success'] == True
    assert 'results' in json_data
    assert 'summary' in json_data
    assert len(json_data['results']) == 3  # 3 accounts

def test_analyze_transactions_function():
    """Test the analyze_transactions function directly"""
    # Create a test DataFrame
    df = pd.DataFrame({
        'TransactionID': [1, 2, 3, 4, 5, 6],
        'AccountID': ['ACC001', 'ACC001', 'ACC002', 'ACC002', 'ACC003', 'ACC003'],
        'Amount': [500, 600, 12000, 11000, 300, 350]
    })
    
    result = analyze_transactions(df)
    
    assert 'success' in result
    assert result['success'] == True
    assert 'results' in result
    assert 'summary' in result
    assert result['summary']['total_accounts'] == 3

def test_analyze_transactions_missing_columns():
    """Test analyze_transactions with missing required columns"""
    df = pd.DataFrame({
        'TransactionID': [1, 2, 3],
        'WrongColumn': ['ACC001', 'ACC002', 'ACC003']
    })
    
    result = analyze_transactions(df)
    assert 'error' in result

def test_ai_insights_missing_data():
    """Test AI insights endpoint without data"""
    client = app.test_client()
    response = client.post('/ai-insights', json={})
    assert response.status_code == 400

def test_ai_insights_with_data():
    """Test AI insights endpoint with valid data"""
    client = app.test_client()
    
    test_data = {
        'summary': {
            'total_accounts': 3,
            'high_risk_accounts': 1,
            'low_risk_accounts': 2
        },
        'results': [
            {
                'AccountID': 'ACC001',
                'Avg_Amount': 550.0,
                'Max_Amount': 600.0,
                'Total_Volume': 1100.0,
                'Txn_Count': 2,
                'Z_Score': -0.5,
                'Trust_Score': 75.0,
                'Risk_Level': 'Low Risk'
            },
            {
                'AccountID': 'ACC002',
                'Avg_Amount': 11500.0,
                'Max_Amount': 12000.0,
                'Total_Volume': 23000.0,
                'Txn_Count': 2,
                'Z_Score': 2.5,
                'Trust_Score': 25.0,
                'Risk_Level': 'High Risk'
            }
        ]
    }
    
    response = client.post('/ai-insights', json=test_data)
    assert response.status_code == 200
    
    json_data = response.get_json()
    assert 'insights' in json_data

if __name__ == '__main__':
    pytest.main([__file__, '-v'])

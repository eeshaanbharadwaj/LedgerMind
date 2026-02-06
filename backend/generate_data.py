import pandas as pd
import numpy as np
import random

def generate_data(num_records=500):
    accounts = ['ACC001', 'ACC002', 'ACC003', 'ACC004', 'ACC005']
    data = []
    
    for _ in range(num_records):
        account = random.choice(accounts)
        
        # Base behavior
        if account == 'ACC001':
            amount = np.random.normal(100, 10) # Consistent low
        elif account == 'ACC002':
            amount = np.random.normal(500, 50) # Consistent medium
        elif account == 'ACC003': 
            # High variance
            if random.random() > 0.9:
                amount = np.random.normal(5000, 500) # Spikes
            else:
                amount = np.random.normal(200, 20)
        elif account == 'ACC004':
             amount = np.random.normal(50, 5) # Micro transactions
        else:
             # ACC005 - Generally high value
             amount = np.random.normal(1000, 100)
             
        # Add some random anomalies for everyone
        if random.random() > 0.98:
            amount = amount * 10 # Massive outlier
            
        data.append([account, abs(round(amount, 2))])
        
    df = pd.DataFrame(data, columns=['AccountID', 'Amount'])
    df['TransactionID'] = range(1, len(df) + 1)
    # Shuffle columns
    df = df[['TransactionID', 'AccountID', 'Amount']]
    
    df.to_csv('sample_transactions.csv', index=False)
    print("sample_transactions.csv created.")

if __name__ == "__main__":
    generate_data()

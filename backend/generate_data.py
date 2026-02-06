import pandas as pd
import numpy as np
import random

def generate_data(num_records=1000):
    accounts = ['ACC001', 'ACC002', 'ACC003', 'ACC004', 'ACC005', 'ACC006', 'ACC007', 'ACC008']
    data = []
    
    for _ in range(num_records):
        account = random.choice(accounts)
        
        # Base behavior
        if account == 'ACC001':
            amount = np.random.normal(100, 10) # Consistent low
        elif account == 'ACC002':
            amount = np.random.normal(500, 50) # Consistent medium
        elif account == 'ACC003': 
            # High variance / Spike behavior
            if random.random() > 0.95:
                amount = np.random.normal(8000, 1000) 
            else:
                amount = np.random.normal(200, 20)
        elif account == 'ACC004':
             amount = np.random.normal(50, 5) # Micro transactions
        elif account == 'ACC005':
             amount = np.random.normal(1200, 200) # High value consistent
        elif account == 'ACC006':
             # Laundry-like behavior: many small transactions and then one huge one
             if random.random() > 0.99:
                 amount = 50000
             else:
                 amount = random.uniform(5, 50)
        else:
             amount = np.random.normal(300, 100)
             
        # Add random global outliers
        if random.random() > 0.995:
            amount = amount * 15
            
        data.append([account, abs(round(amount, 2))])
        
    df = pd.DataFrame(data, columns=['AccountID', 'Amount'])
    df['TransactionID'] = range(1, len(df) + 1)
    # Shuffle columns
    df = df[['TransactionID', 'AccountID', 'Amount']]
    
    df.to_csv('sample_transactions.csv', index=False)
    print("sample_transactions.csv created.")

if __name__ == "__main__":
    generate_data()

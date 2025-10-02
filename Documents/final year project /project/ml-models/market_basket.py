#!/usr/bin/env python3
# ml-models/market_basket.py

import argparse
import json
import sys
import pandas as pd
import mysql.connector
from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder
import warnings
warnings.filterwarnings('ignore')

from config import DB_CONFIG, APRIORI_PARAMS

class MarketBasketAnalyzer:
    def __init__(self):
        pass
        
    def connect_db(self):
        """Connect to MySQL database"""
        return mysql.connector.connect(**DB_CONFIG)
    
    def load_transaction_data(self):
        """Load sales and services data"""
        conn = self.connect_db()
        cursor = conn.cursor(dictionary=True)
        
        query = """
        SELECT 
            ss.sale_id,
            s.name as service_name
        FROM sales_services ss
        JOIN services s ON ss.service_id = s.id
        ORDER BY ss.sale_id
        """
        
        cursor.execute(query)
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return pd.DataFrame(results)
    
    def prepare_transactions(self, df):
        """Prepare transaction data for apriori algorithm"""
        if df.empty:
            return None
        
        # Group services by sale_id
        transactions = df.groupby('sale_id')['service_name'].apply(list).values.tolist()
        
        return transactions
    
    def run_apriori(self, transactions, min_support=0.01):
        """Run Apriori algorithm"""
        if not transactions or len(transactions) < 3:
            return None
        
        # Transform transactions to one-hot encoded DataFrame
        te = TransactionEncoder()
        te_ary = te.fit(transactions).transform(transactions)
        df_encoded = pd.DataFrame(te_ary, columns=te.columns_)
        
        # Run Apriori algorithm
        frequent_itemsets = apriori(df_encoded, min_support=min_support, use_colnames=True)
        
        if frequent_itemsets.empty:
            return None
        
        return frequent_itemsets, df_encoded
    
    def generate_rules(self, frequent_itemsets, min_confidence=0.3, min_lift=1.0):
        """Generate association rules"""
        if frequent_itemsets is None or frequent_itemsets.empty:
            return []
        
        try:
            rules = association_rules(
                frequent_itemsets, 
                metric="confidence", 
                min_threshold=min_confidence
            )
            
            if rules.empty:
                return []
            
            # Filter by lift
            rules = rules[rules['lift'] >= min_lift]
            
            # Sort by lift
            rules = rules.sort_values('lift', ascending=False)
            
            # Format results
            results = []
            for _, rule in rules.head(20).iterrows():  # Top 20 rules
                results.append({
                    'antecedent': list(rule['antecedents']),
                    'consequent': list(rule['consequents']),
                    'support': float(rule['support']),
                    'confidence': float(rule['confidence']),
                    'lift': float(rule['lift']),
                    'conviction': float(rule.get('conviction', 1.0))
                })
            
            return results
        except Exception as e:
            print(f"Error generating rules: {str(e)}", file=sys.stderr)
            return []

def main():
    parser = argparse.ArgumentParser(description='Market Basket Analysis')
    parser.add_argument('--min_support', type=float, default=APRIORI_PARAMS['min_support'],
                       help='Minimum support threshold')
    parser.add_argument('--min_confidence', type=float, default=APRIORI_PARAMS['min_confidence'],
                       help='Minimum confidence threshold')
    parser.add_argument('--min_lift', type=float, default=APRIORI_PARAMS['min_lift'],
                       help='Minimum lift threshold')
    
    args = parser.parse_args()
    
    try:
        analyzer = MarketBasketAnalyzer()
        
        # Load transaction data
        df = analyzer.load_transaction_data()
        
        if df.empty:
            print(json.dumps([]))
            return
        
        # Prepare transactions
        transactions = analyzer.prepare_transactions(df)
        
        if not transactions:
            print(json.dumps([]))
            return
        
        # Run Apriori
        result = analyzer.run_apriori(transactions, args.min_support)
        
        if result is None:
            print(json.dumps([]))
            return
        
        frequent_itemsets, df_encoded = result
        
        # Generate association rules
        rules = analyzer.generate_rules(
            frequent_itemsets, 
            args.min_confidence, 
            args.min_lift
        )
        
        print(json.dumps(rules))
    
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()

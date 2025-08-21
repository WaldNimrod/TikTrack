#!/usr/bin/env python3
import sqlite3
import os
from datetime import datetime

def create_trade_plans_table():
    current_db = "db/simpleTrade_new.db"
    
    if not os.path.exists(current_db):
        print(f"❌ Database not found: {current_db}")
        return
    
    try:
        # Connect to database
        conn = sqlite3.connect(current_db)
        cursor = conn.cursor()
        
        # Create trade_plans table according to model
        cursor.execute("""
            CREATE TABLE trade_plans (
                id INTEGER PRIMARY KEY,
                account_id INTEGER NOT NULL,
                ticker_id INTEGER NOT NULL,
                investment_type VARCHAR(20) DEFAULT 'swing',
                side VARCHAR(10) DEFAULT 'Long',
                status VARCHAR(20) DEFAULT 'open',
                planned_amount FLOAT DEFAULT 0,
                entry_conditions VARCHAR(500),
                stop_price FLOAT,
                target_price FLOAT,
                reasons VARCHAR(500),
                canceled_at DATETIME,
                cancel_reason VARCHAR(500),
                created_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
                FOREIGN KEY(account_id) REFERENCES accounts (id),
                FOREIGN KEY(ticker_id) REFERENCES tickers (id)
            )
        """)
        
        print("✅ Trade plans table created successfully!")
        
        # Verify table was created
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='trade_plans'")
        if cursor.fetchone():
            print("✅ Table verification successful!")
        else:
            print("❌ Table creation failed!")
            return
        
        # Insert sample data
        sample_data = [
            # Plan 1: Apple - swing
            (1, 1, 'swing', 'Long', 'open', 10000.0, 'Price below $150', 140.0, 180.0, 'Strong company with quality products', None, None),
            
            # Plan 2: Google - investment
            (2, 2, 'investment', 'Long', 'open', 8000.0, 'Price below $120', 110.0, 150.0, 'Dominance in search and advertising', None, None),
            
            # Plan 3: SPY ETF - passive
            (2, 9, 'passive', 'Long', 'open', 5000.0, 'Price below $400', 380.0, 450.0, 'Investment in S&P 500 index', None, None),
            
            # Plan 4: Microsoft - swing
            (1, 3, 'swing', 'Long', 'open', 12000.0, 'Price below $400', 380.0, 450.0, 'Strong technology company', None, None),
            
            # Plan 5: Tesla - investment
            (2, 4, 'investment', 'Long', 'open', 15000.0, 'Price below $200', 180.0, 300.0, 'Innovation in electric vehicles', None, None),
            
            # Plan 6: NVIDIA - swing
            (1, 5, 'swing', 'Long', 'open', 20000.0, 'Price below $800', 750.0, 1000.0, 'Dominance in AI field', None, None),
            
            # Plan 7: QQQ ETF - passive
            (3, 10, 'passive', 'Long', 'open', 3000.0, 'Price below $380', 360.0, 420.0, 'Investment in technology ETF', None, None),
            
            # Plan 8: Amazon - investment (closed)
            (1, 6, 'investment', 'Long', 'closed', 18000.0, 'Price below $3200', 3000.0, 4000.0, 'Dominance in e-commerce', None, None),
            
            # Plan 9: Meta - swing (cancelled)
            (2, 7, 'swing', 'Long', 'cancelled', 9000.0, 'Price below $380', 350.0, 450.0, 'Advanced social media', datetime.now(), 'Strategy change'),
            
            # Plan 10: Netflix - investment
            (1, 8, 'investment', 'Long', 'open', 7000.0, 'Price below $580', 550.0, 700.0, 'Dominance in streaming', None, None)
        ]
        
        # Insert data
        for data in sample_data:
            cursor.execute("""
                INSERT INTO trade_plans (
                    account_id, ticker_id, investment_type, side, status, 
                    planned_amount, entry_conditions, stop_price, target_price, 
                    reasons, canceled_at, cancel_reason
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, data)
        
        print(f"✅ Inserted {len(sample_data)} sample trade plans!")
        
        # Test relationships
        print("\n🔍 Testing relationships...")
        
        # Test account relationships
        cursor.execute("""
            SELECT tp.id, tp.investment_type, tp.status, a.name as account_name
            FROM trade_plans tp
            LEFT JOIN accounts a ON tp.account_id = a.id
            LIMIT 5
        """)
        accounts_test = cursor.fetchall()
        print(f"✅ Account relationships: {len(accounts_test)} records found")
        
        # Test ticker relationships
        cursor.execute("""
            SELECT tp.id, tp.investment_type, tp.status, t.symbol as ticker_symbol
            FROM trade_plans tp
            LEFT JOIN tickers t ON tp.ticker_id = t.id
            LIMIT 5
        """)
        tickers_test = cursor.fetchall()
        print(f"✅ Ticker relationships: {len(tickers_test)} records found")
        
        # Check statistics
        cursor.execute("SELECT COUNT(*) FROM trade_plans")
        total_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT status, COUNT(*) FROM trade_plans GROUP BY status")
        status_stats = cursor.fetchall()
        
        cursor.execute("SELECT investment_type, COUNT(*) FROM trade_plans GROUP BY investment_type")
        type_stats = cursor.fetchall()
        
        print(f"\n📊 Statistics:")
        print(f"  - Total trade plans: {total_count}")
        print(f"  - Status breakdown: {dict(status_stats)}")
        print(f"  - Type breakdown: {dict(type_stats)}")
        
        # Show examples
        cursor.execute("""
            SELECT tp.id, tp.investment_type, tp.status, tp.planned_amount,
                   a.name as account_name, t.symbol as ticker_symbol
            FROM trade_plans tp
            LEFT JOIN accounts a ON tp.account_id = a.id
            LEFT JOIN tickers t ON tp.ticker_id = t.id
            LIMIT 5
        """)
        
        examples = cursor.fetchall()
        print(f"\n📋 Sample trade plans:")
        for example in examples:
            print(f"  - ID: {example[0]}, Type: {example[1]}, Status: {example[2]}, Amount: ${example[3]}, Account: {example[4]}, Ticker: {example[5]}")
        
        # Save changes
        conn.commit()
        print("\n✅ Trade plans table created and populated successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    create_trade_plans_table()

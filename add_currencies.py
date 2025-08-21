#!/usr/bin/env python3
"""
Script to add basic currencies
"""

import sqlite3
import os

# Database path
DB_PATH = "Backend/db/simpleTrade_new.db"

def add_currencies():
    """Add basic currencies"""
    
    if not os.path.exists(DB_PATH):
        print(f"❌ Database not found: {DB_PATH}")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        print("🔄 Adding basic currencies...")
        
        # Basic currencies
        currencies_data = [
            ('USD', 'US Dollar', 1.000000),
            ('ILS', 'Israeli Shekel', 3.650000),
            ('EUR', 'Euro', 0.920000),
            ('GBP', 'British Pound', 0.790000),
            ('JPY', 'Japanese Yen', 150.000000),
            ('CAD', 'Canadian Dollar', 1.350000),
            ('AUD', 'Australian Dollar', 1.520000),
            ('CHF', 'Swiss Franc', 0.880000),
        ]
        
        for symbol, name, usd_rate in currencies_data:
            try:
                cursor.execute("""
                    INSERT INTO currencies (symbol, name, usd_rate)
                    VALUES (?, ?, ?)
                """, (symbol, name, usd_rate))
                print(f"✅ Added currency: {symbol} - {name}")
            except sqlite3.IntegrityError:
                print(f"⚠️  Currency {symbol} already exists")
        
        conn.commit()
        print("✅ Currencies added successfully")
        
        # Display added currencies
        cursor.execute("SELECT symbol, name, usd_rate FROM currencies ORDER BY symbol")
        currencies = cursor.fetchall()
        
        print("\n📊 Currencies in system:")
        for symbol, name, rate in currencies:
            print(f"  {symbol}: {name} (rate: {rate})")
        
    except Exception as e:
        print(f"❌ Error adding currencies: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    print("🔄 Adding basic currencies...")
    add_currencies()
    print("✅ Completed")

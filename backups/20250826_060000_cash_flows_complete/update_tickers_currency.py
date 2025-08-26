#!/usr/bin/env python3
"""
Migration script to update tickers table to use currency_id instead of currency string

This script:
1. Creates a new currency_id column in the tickers table
2. Maps existing currency strings to currency IDs
3. Removes the old currency column
4. Updates the table structure

Author: TikTrack Development Team
Version: 1.0
Last Updated: 2025-08-21
"""

import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add the Backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from config.settings import DATABASE_URL

def update_tickers_currency_table():
    """Update tickers table to use currency ID"""
    
    try:
        # Create database connection
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
        
        with engine.connect() as connection:
            print("🔄 Starting tickers table update...")
            
            # 1. Check that currencies table exists
            result = connection.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='currencies'"))
            if not result.fetchone():
                print("❌ Error: Currencies table does not exist. Run create_currencies_table.py first")
                return False
            
            # 2. Check that there are currencies in the table
            result = connection.execute(text("SELECT COUNT(*) as count FROM currencies"))
            currency_count = result.fetchone()[0]
            if currency_count == 0:
                print("❌ Error: No currencies in currencies table. Run add_currencies.py first")
                return False
            
            print(f"✓ Found {currency_count} currencies in currencies table")
            
            # 3. Check if currency_id column already exists
            result = connection.execute(text("PRAGMA table_info(tickers)"))
            columns = [col[1] for col in result.fetchall()]
            
            if 'currency_id' in columns:
                print("⚠️  Currency_id column already exists in tickers table")
                return True
            
            # 4. Create new currency_id column
            connection.execute(text("ALTER TABLE tickers ADD COLUMN currency_id INTEGER"))
            connection.commit()
            print("✓ Added currency_id column to tickers table")
            
            # 5. Map existing currencies to IDs
            currency_mapping = {}
            result = connection.execute(text("SELECT id, symbol FROM currencies"))
            for row in result.fetchall():
                currency_mapping[row[1]] = row[0]
            
            print(f"✓ Currency mapping: {currency_mapping}")
            
            # 6. Update existing records
            result = connection.execute(text("SELECT id, symbol, currency FROM tickers WHERE currency IS NOT NULL"))
            tickers_to_update = result.fetchall()
            
            updated_count = 0
            for ticker_id, symbol, currency_str in tickers_to_update:
                currency_str = currency_str.upper() if currency_str else 'USD'
                
                if currency_str in currency_mapping:
                    currency_id = currency_mapping[currency_str]
                    connection.execute(
                        text("UPDATE tickers SET currency_id = :currency_id WHERE id = :ticker_id"),
                        {"currency_id": currency_id, "ticker_id": ticker_id}
                    )
                    updated_count += 1
                else:
                    # If currency doesn't exist, use USD as default
                    default_currency_id = currency_mapping.get('USD', 1)
                    connection.execute(
                        text("UPDATE tickers SET currency_id = :currency_id WHERE id = :ticker_id"),
                        {"currency_id": default_currency_id, "ticker_id": ticker_id}
                    )
                    updated_count += 1
                    print(f"⚠️  Ticker {symbol}: Currency '{currency_str}' not found, set to USD")
            
            connection.commit()
            print(f"✓ Updated {updated_count} tickers with currency IDs")
            
            # 7. Set default for records without currency
            usd_id = currency_mapping.get('USD', 1)
            result = connection.execute(
                text("UPDATE tickers SET currency_id = :usd_id WHERE currency_id IS NULL"),
                {"usd_id": usd_id}
            )
            connection.commit()
            
            if result.rowcount > 0:
                print(f"✓ Set default currency (USD) for {result.rowcount} tickers")
            
            # 8. Data validation check
            result = connection.execute(text("""
                SELECT COUNT(*) as invalid_count 
                FROM tickers t 
                LEFT JOIN currencies c ON t.currency_id = c.id 
                WHERE t.currency_id IS NOT NULL AND c.id IS NULL
            """))
            
            invalid_count = result.fetchone()[0]
            if invalid_count > 0:
                print(f"❌ Error: Found {invalid_count} tickers with invalid currency IDs")
                return False
            
            print("✓ All currency IDs in tickers are valid")
            
            print("\n🎉 Tickers table update completed successfully!")
            return True
            
    except Exception as e:
        print(f"❌ Error updating tickers table: {e}")
        return False

def verify_tickers_update():
    """Check update results"""
    
    try:
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
        
        with engine.connect() as connection:
            print("\n📋 Checking update results:")
            print("=" * 50)
            
            # Check table structure
            result = connection.execute(text("PRAGMA table_info(tickers)"))
            columns = result.fetchall()
            
            print("Tickers table structure:")
            for col in columns:
                col_name, col_type = col[1], col[2]
                print(f"  {col_name}: {col_type}")
            
            # Check data
            result = connection.execute(text("""
                SELECT 
                    t.id, 
                    t.symbol, 
                    t.name,
                    t.currency_id, 
                    c.symbol as currency_symbol,
                    c.name as currency_name
                FROM tickers t
                LEFT JOIN currencies c ON t.currency_id = c.id
                LIMIT 10
            """))
            
            tickers = result.fetchall()
            if tickers:
                print("\nSample tickers:")
                for ticker in tickers:
                    print(f"  {ticker[1]} ({ticker[2]}): Currency {ticker[4]} ({ticker[5]})")
            
            return True
            
    except Exception as e:
        print(f"❌ Error checking update: {e}")
        return False

if __name__ == "__main__":
    print("🔄 Updating tickers table to use currency IDs - TikTrack")
    print("=" * 70)
    
    # Update table
    if update_tickers_currency_table():
        # Check results
        verify_tickers_update()
    else:
        print("\n❌ Update failed")
        sys.exit(1)

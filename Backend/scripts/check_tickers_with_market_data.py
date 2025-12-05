#!/usr/bin/env python3
"""
Check Tickers with Market Data
===============================
Quick script to check if tickers have market data in the database
"""

import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from models.ticker import Ticker
from models.user_ticker import UserTicker
from models.external_data import MarketDataQuote
from sqlalchemy import desc

# Database connection
POSTGRES_HOST = os.getenv('POSTGRES_HOST', 'localhost')
POSTGRES_DB = os.getenv('POSTGRES_DB', 'TikTrack-db-development')
POSTGRES_USER = os.getenv('POSTGRES_USER', 'TikTrakDBAdmin')
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD', 'BigMeZoo1974!?')

DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}/{POSTGRES_DB}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def main():
    db = SessionLocal()
    
    try:
        print("\n" + "="*60)
        print("📊 בדיקת טיקרים עם נתוני שוק")
        print("="*60 + "\n")
        
        # Get first user_id
        user_result = db.execute(text("SELECT id FROM users LIMIT 1"))
        user_row = user_result.fetchone()
        
        if not user_row:
            print("❌ לא נמצא משתמש במערכת")
            return
        
        user_id = user_row[0]
        print(f"👤 משתמש: {user_id}\n")
        
        # Get user tickers
        user_tickers = db.query(UserTicker).filter(
            UserTicker.user_id == user_id
        ).all()
        
        print(f"📋 סה\"כ טיקרים למשתמש: {len(user_tickers)}\n")
        
        if not user_tickers:
            print("❌ לא נמצאו טיקרים למשתמש")
            return
        
        # Check market data for each ticker
        tickers_with_data = []
        tickers_without_data = []
        
        for user_ticker in user_tickers[:10]:  # Check first 10
            ticker = user_ticker.ticker
            if not ticker:
                continue
            
            latest_quote = db.query(MarketDataQuote).filter(
                MarketDataQuote.ticker_id == ticker.id
            ).order_by(desc(MarketDataQuote.fetched_at)).first()
            
            if latest_quote:
                tickers_with_data.append({
                    'symbol': ticker.symbol,
                    'id': ticker.id,
                    'price': latest_quote.price,
                    'change_percent': latest_quote.change_pct_day if latest_quote.change_pct_day is not None else 0,
                    'updated_at': latest_quote.fetched_at
                })
            else:
                tickers_without_data.append({
                    'symbol': ticker.symbol,
                    'id': ticker.id
                })
        
        print("✅ טיקרים עם נתוני שוק:")
        print("-" * 60)
        if tickers_with_data:
            for ticker in tickers_with_data:
                print(f"  {ticker['symbol']} (ID: {ticker['id']})")
                if ticker['price'] is not None:
                    print(f"    מחיר: ${ticker['price']:.2f}")
                else:
                    print(f"    מחיר: N/A")
                if ticker['change_percent'] is not None:
                    print(f"    שינוי: {ticker['change_percent']:.2f}%")
                else:
                    print(f"    שינוי: N/A")
                print(f"    עודכן: {ticker['updated_at']}")
                print()
        else:
            print("  ❌ לא נמצאו טיקרים עם נתוני שוק\n")
        
        print("❌ טיקרים ללא נתוני שוק:")
        print("-" * 60)
        if tickers_without_data:
            for ticker in tickers_without_data:
                print(f"  {ticker['symbol']} (ID: {ticker['id']})")
        else:
            print("  ✅ כל הטיקרים יש להם נתוני שוק")
        
        print("\n" + "="*60)
        print(f"סיכום: {len(tickers_with_data)} עם נתונים, {len(tickers_without_data)} ללא נתונים")
        print("="*60 + "\n")
        
        if tickers_with_data:
            print("✅ נמצא לפחות טיקר אחד עם נתוני שוק - ניתן לבדוק!")
            return True
        else:
            print("❌ לא נמצאו טיקרים עם נתוני שוק - צריך לטעון נתונים")
            return False
            
    except Exception as e:
        print(f"❌ שגיאה: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)


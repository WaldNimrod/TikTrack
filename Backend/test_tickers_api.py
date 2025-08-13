#!/usr/bin/env python3
"""
קובץ זמני לבדיקת ה-API של טיקרים
"""

import requests
import json
import sqlite3

def test_database_direct():
    """בדיקה ישירה של בסיס הנתונים"""
    print("=== בדיקה ישירה של בסיס הנתונים ===")
    
    conn = sqlite3.connect('Backend/simpleTrade.db')
    cursor = conn.cursor()
    
    # בדיקת מבנה הטבלה
    print("\nמבנה טבלת tickers:")
    cursor.execute("PRAGMA table_info(tickers)")
    columns = cursor.fetchall()
    for col in columns:
        print(f"  {col[1]} ({col[2]})")
    
    # בדיקת נתונים
    print("\nנתונים בטבלת tickers:")
    cursor.execute("SELECT id, symbol, name, type, remarks, currency, active_trades FROM tickers LIMIT 5")
    rows = cursor.fetchall()
    for row in rows:
        print(f"  {row}")
    
    conn.close()

def test_api_endpoint():
    """בדיקת ה-API endpoint"""
    print("\n=== בדיקת ה-API endpoint ===")
    
    try:
        response = requests.get('http://localhost:5002/api/database/tickers')
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Number of records: {len(data)}")
            
            if data:
                print("\nFirst record:")
                first_record = data[0]
                for key, value in first_record.items():
                    print(f"  {key}: {value}")
                
                print("\nAll records keys:")
                all_keys = set()
                for record in data:
                    all_keys.update(record.keys())
                print(f"  {sorted(all_keys)}")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Error connecting to API: {e}")

def test_sql_query():
    """בדיקת השאילתה SQL ישירות"""
    print("\n=== בדיקת השאילתה SQL ישירות ===")
    
    conn = sqlite3.connect('Backend/simpleTrade.db')
    cursor = conn.cursor()
    
    query = """
    SELECT 
        id,
        symbol,
        name,
        type,
        remarks,
        currency,
        active_trades
    FROM tickers
    ORDER BY symbol
    LIMIT 3
    """
    
    print(f"Query: {query}")
    
    cursor.execute(query)
    rows = cursor.fetchall()
    
    print("\nResults:")
    for row in rows:
        print(f"  {row}")
    
    conn.close()

if __name__ == "__main__":
    print("בדיקת API טיקרים")
    print("=" * 50)
    
    test_database_direct()
    test_api_endpoint()
    test_sql_query()

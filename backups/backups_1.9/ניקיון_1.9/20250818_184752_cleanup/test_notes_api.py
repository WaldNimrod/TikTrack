#!/usr/bin/env python3
"""
סקריפט בדיקה ל-API של הערות
"""

import requests
import json

def test_notes_api():
    """בדיקת ה-API של הערות"""
    
    base_url = "http://127.0.0.1:8080"
    
    try:
        # בדיקת GET /api/v1/notes/
        print("🔄 בודק GET /api/v1/notes/...")
        response = requests.get(f"{base_url}/api/v1/notes/")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:500]}...")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ הצלחה! נטענו {len(data.get('data', []))} הערות")
        else:
            print("❌ שגיאה בטעינת הערות")
            
    except Exception as e:
        print(f"❌ שגיאה: {e}")

if __name__ == "__main__":
    test_notes_api()

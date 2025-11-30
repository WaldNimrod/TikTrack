#!/usr/bin/env python3
"""
Find icon alternatives in Tabler Icons repository
"""
import requests
import json

BASE_URL = "https://api.github.com/repos/tabler/tabler-icons/contents/icons"

def find_icons(search_terms):
    """Find icons matching search terms"""
    try:
        response = requests.get(BASE_URL, timeout=10)
        if response.status_code != 200:
            print(f"❌ שגיאה: {response.status_code}")
            return
        
        icons = response.json()
        icon_names = [item['name'].replace('.svg', '') for item in icons if item['name'].endswith('.svg')]
        
        for term in search_terms:
            print(f"\n🔍 מחפש איקונים עם '{term}':")
            matches = [name for name in icon_names if term.lower() in name.lower()]
            if matches:
                for match in sorted(matches)[:10]:  # Show first 10
                    print(f"  ✅ {match}.svg")
            else:
                print(f"  ❌ לא נמצא")
    except Exception as e:
        print(f"❌ שגיאה: {e}")

if __name__ == "__main__":
    find_icons(["table", "flame", "coin", "card", "flag", "layout", "grid", "money", "currency", "play", "fire"])

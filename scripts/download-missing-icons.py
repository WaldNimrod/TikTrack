#!/usr/bin/env python3
"""
Download missing icons from Tabler Icons GitHub repository
"""
import os
import requests
import sys

# Base URL for Tabler Icons GitHub
BASE_URL = "https://raw.githubusercontent.com/tabler/tabler-icons/master/icons"

# Target directory
TARGET_DIR = "trading-ui/images/icons/tabler"

# Icon mappings: alias -> possible names in Tabler Icons
ICON_MAPPINGS = {
    "table": ["layout-grid", "layout-list", "table-columns", "table"],
    "flame": ["flame", "flame-off"],
    "coins": ["currency-bitcoin", "coins", "coin", "currency-dollar"],
    "cards": ["card-play", "card", "cards", "card-stack"],
    "flag": ["flag", "flag-2", "flag-3"],
    "flag-filled": ["flag-filled", "flag-3-filled"]
}

def download_icon(icon_name, alias=None):
    """Try to download an icon with given name, return True if successful"""
    url = f"{BASE_URL}/{icon_name}.svg"
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200 and len(response.content) > 200:
            # Save with original name
            filepath = os.path.join(TARGET_DIR, f"{icon_name}.svg")
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            # Also create alias if provided
            if alias and alias != icon_name:
                alias_path = os.path.join(TARGET_DIR, f"{alias}.svg")
                with open(alias_path, 'wb') as f:
                    f.write(response.content)
                print(f"✅ הורד: {icon_name}.svg + alias: {alias}.svg ({len(response.content)} bytes)")
            else:
                print(f"✅ הורד: {icon_name}.svg ({len(response.content)} bytes)")
            return True
    except Exception as e:
        pass
    return False

def main():
    """Main function to download all missing icons"""
    # Ensure target directory exists
    os.makedirs(TARGET_DIR, exist_ok=True)
    
    print("📥 מוריד איקונים חסרים מ-Tabler Icons...\n")
    
    downloaded = []
    failed = []
    
    for alias, possible_names in ICON_MAPPINGS.items():
        # Check if alias already exists
        alias_path = os.path.join(TARGET_DIR, f"{alias}.svg")
        if os.path.exists(alias_path):
            print(f"⏭️  {alias}.svg כבר קיים - מדלג")
            continue
        
        print(f"🔍 מחפש: {alias}...")
        found = False
        
        for icon_name in possible_names:
            if download_icon(icon_name, alias=alias):
                downloaded.append(f"{alias} ({icon_name})")
                found = True
                break
        
        if not found:
            failed.append(alias)
            print(f"❌ {alias} - לא נמצא ב-Tabler Icons\n")
        else:
            print("")
    
    # Summary
    print("\n" + "="*60)
    print("📊 סיכום:")
    print(f"✅ הורד בהצלחה: {len(downloaded)}")
    for item in downloaded:
        print(f"   - {item}")
    
    if failed:
        print(f"\n❌ נכשל: {len(failed)}")
        for item in failed:
            print(f"   - {item}")
        print("\n💡 הצעה: נסה לחפש איקונים דומים ב-Tabler Icons או ליצור איקונים מותאמים")
    
    return len(failed) == 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

#!/usr/bin/env python3
import os
import json

# Test file writing
preferences_path = "/Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/config/preferences.json"

print(f"Testing file write to: {preferences_path}")
print(f"File exists: {os.path.exists(preferences_path)}")
print(f"Directory exists: {os.path.exists(os.path.dirname(preferences_path))}")
print(f"File writable: {os.access(preferences_path, os.W_OK) if os.path.exists(preferences_path) else 'N/A'}")

# Try to read the current file
try:
    with open(preferences_path, 'r', encoding='utf-8') as f:
        current_data = json.load(f)
    print(f"Current defaultTypeFilter: {current_data.get('user', {}).get('defaultTypeFilter', 'NOT_FOUND')}")
except Exception as e:
    print(f"Error reading file: {e}")

# Try to write to the file
try:
    # Update the value
    current_data['user']['defaultTypeFilter'] = 'test_write'
    current_data['users']['nimrod']['defaultTypeFilter'] = 'test_write'
    
    with open(preferences_path, 'w', encoding='utf-8') as f:
        json.dump(current_data, f, indent=2, ensure_ascii=False)
    print("✅ File written successfully")
    
    # Read back to verify
    with open(preferences_path, 'r', encoding='utf-8') as f:
        new_data = json.load(f)
    print(f"New defaultTypeFilter: {new_data.get('user', {}).get('defaultTypeFilter', 'NOT_FOUND')}")
    
except Exception as e:
    print(f"❌ Error writing file: {e}")

#!/usr/bin/env python3
import requests
import json
import os

# Preferences API
base_url = "http://localhost:8080"

def preferences_api():
    print("Preferences API...")
    
    # Get current preferences
    print("\n1. Getting current preferences...")
    response = requests.get(f"{base_url}/api/v1/preferences/")
    if response.status_code == 200:
        preferences = response.json()
        print(f"Current defaultTypeFilter: {preferences.get('user', {}).get('defaultTypeFilter', 'NOT_FOUND')}")
    else:
        print(f"Error getting preferences: {response.status_code}")
        return
    
    # Update a preference
    print("\n2. Updating defaultTypeFilter to 'test_value'...")
    update_data = {"value": "test_value"}
    response = requests.put(
        f"{base_url}/api/v1/preferences/defaultTypeFilter",
        headers={"Content-Type": "application/json"},
        json=update_data
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"Update response: {result}")
    else:
        print(f"Error updating preference: {response.status_code}")
        print(f"Response: {response.text}")
        return
    
    # Get preferences again to verify
    print("\n3. Getting preferences again to verify...")
    response = requests.get(f"{base_url}/api/v1/preferences/")
    if response.status_code == 200:
        preferences = response.json()
        new_value = preferences.get('user', {}).get('defaultTypeFilter', 'NOT_FOUND')
        print(f"New defaultTypeFilter: {new_value}")
        
        if new_value == "test_value":
            print("✅ Success! Preference was updated correctly.")
        else:
            print("❌ Failed! Preference was not updated.")
    else:
        print(f"Error getting preferences: {response.status_code}")
    
    # Check the actual file
    print("\n4. Checking the preferences.json file...")
    file_path = "/Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/config/preferences.json"
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            file_content = json.load(f)
        file_value = file_content.get('user', {}).get('defaultTypeFilter', 'NOT_FOUND')
        print(f"File defaultTypeFilter: {file_value}")
        
        if file_value == "test_value":
            print("✅ Success! File was updated correctly.")
        else:
            print("❌ Failed! File was not updated.")
    else:
        print(f"❌ File not found: {file_path}")

if __name__ == "__main__":
    preferences_api()

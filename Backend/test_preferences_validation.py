#!/usr/bin/env python3
"""
Test Preferences Validation System
==================================

Tests for the preferences validation system with constraints

Author: TikTrack Development Team
Date: January 2025
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

from services.preferences_service import PreferencesService, ValidationError

def test_validation():
    """Test preference validation with constraints"""
    
    print("🚀 Testing Preferences Validation System...")
    print()
    
    # Initialize service
    service = PreferencesService()
    
    # Test 1: Valid values
    print("📋 Test 1: Valid values")
    try:
        # This should work (existing preference)
        result = service.save_preference(1, "timezone", "Asia/Jerusalem")
        print(f"✅ Valid timezone saved: {result}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
    
    # Test 2: Invalid data type for float
    print("\n📋 Test 2: Invalid data type for float")
    try:
        # Try to save a non-numeric value for defaultStopLoss (should be float)
        result = service.save_preference(1, "defaultStopLoss", "not_a_number")
        print(f"❌ Should have failed but succeeded: {result}")
    except ValidationError as e:
        print(f"✅ Validation error caught: {e}")
    except Exception as e:
        print(f"⚠️  Other error: {e}")
    
    # Test 3: Invalid color format
    print("\n📋 Test 3: Invalid color format")
    try:
        # Try to save an invalid color
        result = service.save_preference(1, "primaryColor", "not_a_color")
        print(f"❌ Should have failed but succeeded: {result}")
    except ValidationError as e:
        print(f"✅ Validation error caught: {e}")
    except Exception as e:
        print(f"⚠️  Other error: {e}")
    
    # Test 4: Valid color format
    print("\n📋 Test 4: Valid color format")
    try:
        result = service.save_preference(1, "primaryColor", "#ff5733")
        print(f"✅ Valid color saved: {result}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
    
    # Test 5: Boolean validation
    print("\n📋 Test 5: Boolean validation")
    try:
        result = service.save_preference(1, "enableNotifications", "true")
        print(f"✅ Valid boolean saved: {result}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
    
    # Test 6: Invalid boolean
    print("\n📋 Test 6: Invalid boolean")
    try:
        result = service.save_preference(1, "enableNotifications", "maybe")
        print(f"❌ Should have failed but succeeded: {result}")
    except ValidationError as e:
        print(f"✅ Validation error caught: {e}")
    except Exception as e:
        print(f"⚠️  Other error: {e}")
    
    # Test 7: Non-existent preference
    print("\n📋 Test 7: Non-existent preference")
    try:
        result = service.save_preference(1, "nonExistentPreference", "value")
        print(f"❌ Should have failed but succeeded: {result}")
    except ValidationError as e:
        print(f"✅ Validation error caught: {e}")
    except Exception as e:
        print(f"⚠️  Other error: {e}")
    
    print("\n🎉 Validation tests completed!")

if __name__ == "__main__":
    test_validation()

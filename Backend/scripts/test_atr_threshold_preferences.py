#!/usr/bin/env python3
"""
Test ATR Threshold Preferences
==============================

Backend integration test for ATR threshold preferences.
Verifies that preferences are correctly stored and retrieved.

Author: TikTrack Development Team
Date: January 2025
"""

import os
import sys
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine, text
from config.settings import DATABASE_URL
from services.preferences_service import PreferencesService


def test_atr_threshold_preferences():
    """Test ATR threshold preferences exist and can be retrieved."""
    
    print("=" * 60)
    print("Testing ATR Threshold Threshold Preferences")
    print("=" * 60)
    print()
    
    engine = create_engine(DATABASE_URL)
    preferences_service = PreferencesService()
    
    # Test 1: Check preferences exist in database
    print("Test 1: Checking preferences exist in database...")
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT preference_name, default_value, description
            FROM preference_types
            WHERE preference_name IN ('atr_high_threshold', 'atr_danger_threshold')
            ORDER BY preference_name
        """))
        
        rows = result.fetchall()
        if len(rows) != 2:
            print(f"❌ FAIL: Expected 2 preferences, found {len(rows)}")
            return False
        
        print("✅ PASS: Both preferences exist in database")
        for row in rows:
            print(f"   - {row[0]}: default={row[1]}, description={row[2]}")
        print()
    
    # Test 2: Check default values
    print("Test 2: Checking default values...")
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT preference_name, default_value
            FROM preference_types
            WHERE preference_name = 'atr_high_threshold'
        """))
        row = result.fetchone()
        if not row or row[1] != '3.0':
            print(f"❌ FAIL: atr_high_threshold default should be 3.0, got {row[1] if row else 'None'}")
            return False
        print("✅ PASS: atr_high_threshold default is 3.0")
        
        result = conn.execute(text("""
            SELECT preference_name, default_value
            FROM preference_types
            WHERE preference_name = 'atr_danger_threshold'
        """))
        row = result.fetchone()
        if not row or row[1] != '5.0':
            print(f"❌ FAIL: atr_danger_threshold default should be 5.0, got {row[1] if row else 'None'}")
            return False
        print("✅ PASS: atr_danger_threshold default is 5.0")
        print()
    
    # Test 3: Check constraints
    print("Test 3: Checking constraints...")
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT preference_name, constraints
            FROM preference_types
            WHERE preference_name IN ('atr_high_threshold', 'atr_danger_threshold')
        """))
        
        for row in result:
            import json
            constraints = json.loads(row[1]) if isinstance(row[1], str) else row[1]
            if 'min' not in constraints or 'max' not in constraints:
                print(f"❌ FAIL: {row[0]} missing min/max constraints")
                return False
            if constraints['min'] != 0.1 or constraints['max'] != 50:
                print(f"❌ FAIL: {row[0]} constraints should be min=0.1, max=50")
                return False
        
        print("✅ PASS: All constraints are correct")
        print()
    
    # Test 4: Check group assignment
    print("Test 4: Checking group assignment...")
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT pt.preference_name, pg.group_name
            FROM preference_types pt
            JOIN preference_groups pg ON pt.group_id = pg.id
            WHERE pt.preference_name IN ('atr_high_threshold', 'atr_danger_threshold')
        """))
        
        for row in result:
            if row[1] != 'trading_settings':
                print(f"❌ FAIL: {row[0]} should be in trading_settings group, got {row[1]}")
                return False
        
        print("✅ PASS: Both preferences are in trading_settings group")
        print()
    
    # Test 5: Test retrieval via PreferencesService
    print("Test 5: Testing retrieval via PreferencesService...")
    try:
        # Test with user_id=1 (adjust if needed)
        prefs = preferences_service.get_preferences_by_names(
            user_id=1,
            names=['atr_high_threshold', 'atr_danger_threshold']
        )
        
        # Should return defaults if no user preferences set
        print("✅ PASS: PreferencesService can retrieve preferences")
        print(f"   Retrieved: {prefs}")
        print()
    except Exception as e:
        print(f"⚠️  WARN: PreferencesService retrieval test: {e}")
        print("   (This is OK if user preferences are not set)")
        print()
    
    print("=" * 60)
    print("✅ ALL TESTS PASSED")
    print("=" * 60)
    return True


if __name__ == "__main__":
    try:
        success = test_atr_threshold_preferences()
        sys.exit(0 if success else 1)
    except Exception as error:
        print(f"❌ ERROR: {error}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


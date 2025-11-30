#!/usr/bin/env python3
"""
Test Script for Preferences System Integration
===============================================

בדיקת אינטגרציה מלאה של מערכת העדפות החדשה

תרחישי בדיקה:
1. טעינת עמוד העדפות
2. שמירת העדפות
3. ריענון עמוד
4. החלפת פרופיל
5. בדיקת ביצועים

Usage:
    python3 Backend/scripts/test_preferences_integration.py
"""

import sys
import os
import time
import json
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from models import Base
from models.user_preferences import PreferenceType, UserPreference, PreferenceGroup
from config.settings import get_database_url

# Test configuration
TEST_USER_ID = 1
TEST_PROFILE_ID = 0
TEST_GROUP_NAME = 'trading_settings'
TEST_PREFERENCE_NAME = 'atr_period'
TEST_PREFERENCE_VALUE = '21'  # Changed from default 14

class PreferencesIntegrationTest:
    def __init__(self):
        self.db_url = get_database_url()
        self.engine = create_engine(self.db_url)
        self.Session = sessionmaker(bind=self.engine)
        self.session = self.Session()
        self.test_results = []
        
    def log_test(self, test_name, passed, message='', duration=0):
        """Log test result"""
        status = '✅ PASS' if passed else '❌ FAIL'
        self.test_results.append({
            'test': test_name,
            'status': status,
            'passed': passed,
            'message': message,
            'duration': duration
        })
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        if duration > 0:
            print(f"   Duration: {duration:.2f}ms")
        print()
    
    def test_1_preference_exists(self):
        """Test 1: Verify preference exists in database"""
        test_name = "Test 1: Preference exists in database"
        start_time = time.time()
        
        try:
            pref_type = self.session.query(PreferenceType).filter_by(
                preference_name=TEST_PREFERENCE_NAME
            ).first()
            
            if pref_type:
                duration = (time.time() - start_time) * 1000
                self.log_test(test_name, True, f"Found preference: {pref_type.preference_name}", duration)
                return True
            else:
                duration = (time.time() - start_time) * 1000
                self.log_test(test_name, False, f"Preference {TEST_PREFERENCE_NAME} not found", duration)
                return False
        except Exception as e:
            duration = (time.time() - start_time) * 1000
            self.log_test(test_name, False, f"Error: {str(e)}", duration)
            return False
    
    def test_2_preference_group_exists(self):
        """Test 2: Verify preference group exists"""
        test_name = "Test 2: Preference group exists"
        start_time = time.time()
        
        try:
            group = self.session.query(PreferenceGroup).filter_by(
                group_name=TEST_GROUP_NAME
            ).first()
            
            if group:
                duration = (time.time() - start_time) * 1000
                self.log_test(test_name, True, f"Found group: {group.group_name}", duration)
                return True
            else:
                duration = (time.time() - start_time) * 1000
                self.log_test(test_name, False, f"Group {TEST_GROUP_NAME} not found", duration)
                return False
        except Exception as e:
            duration = (time.time() - start_time) * 1000
            self.log_test(test_name, False, f"Error: {str(e)}", duration)
            return False
    
    def test_3_get_user_preference(self):
        """Test 3: Get user preference value"""
        test_name = "Test 3: Get user preference value"
        start_time = time.time()
        
        try:
            user_pref = self.session.query(UserPreference).filter_by(
                user_id=TEST_USER_ID,
                profile_id=TEST_PROFILE_ID,
                preference_name=TEST_PREFERENCE_NAME
            ).first()
            
            if user_pref:
                duration = (time.time() - start_time) * 1000
                self.log_test(test_name, True, 
                    f"Found preference value: {user_pref.saved_value}", duration)
                return user_pref.saved_value
            else:
                # Check default value
                pref_type = self.session.query(PreferenceType).filter_by(
                    preference_name=TEST_PREFERENCE_NAME
                ).first()
                default_value = pref_type.default_value if pref_type else None
                duration = (time.time() - start_time) * 1000
                self.log_test(test_name, True, 
                    f"No saved value, using default: {default_value}", duration)
                return default_value
        except Exception as e:
            duration = (time.time() - start_time) * 1000
            self.log_test(test_name, False, f"Error: {str(e)}", duration)
            return None
    
    def test_4_save_preference(self):
        """Test 4: Save preference value"""
        test_name = "Test 4: Save preference value"
        start_time = time.time()
        
        try:
            # Get or create user preference
            user_pref = self.session.query(UserPreference).filter_by(
                user_id=TEST_USER_ID,
                profile_id=TEST_PROFILE_ID,
                preference_name=TEST_PREFERENCE_NAME
            ).first()
            
            if user_pref:
                old_value = user_pref.saved_value
                user_pref.saved_value = TEST_PREFERENCE_VALUE
            else:
                # Create new user preference
                pref_type = self.session.query(PreferenceType).filter_by(
                    preference_name=TEST_PREFERENCE_NAME
                ).first()
                
                if not pref_type:
                    duration = (time.time() - start_time) * 1000
                    self.log_test(test_name, False, 
                        f"Preference type {TEST_PREFERENCE_NAME} not found", duration)
                    return False
                
                user_pref = UserPreference(
                    user_id=TEST_USER_ID,
                    profile_id=TEST_PROFILE_ID,
                    preference_name=TEST_PREFERENCE_NAME,
                    saved_value=TEST_PREFERENCE_VALUE,
                    preference_type_id=pref_type.id
                )
                self.session.add(user_pref)
                old_value = None
            
            self.session.commit()
            duration = (time.time() - start_time) * 1000
            self.log_test(test_name, True, 
                f"Saved value: {old_value} -> {TEST_PREFERENCE_VALUE}", duration)
            return True
        except Exception as e:
            self.session.rollback()
            duration = (time.time() - start_time) * 1000
            self.log_test(test_name, False, f"Error: {str(e)}", duration)
            return False
    
    def test_5_verify_saved_value(self):
        """Test 5: Verify saved value"""
        test_name = "Test 5: Verify saved value"
        start_time = time.time()
        
        try:
            user_pref = self.session.query(UserPreference).filter_by(
                user_id=TEST_USER_ID,
                profile_id=TEST_PROFILE_ID,
                preference_name=TEST_PREFERENCE_NAME
            ).first()
            
            if user_pref and user_pref.saved_value == TEST_PREFERENCE_VALUE:
                duration = (time.time() - start_time) * 1000
                self.log_test(test_name, True, 
                    f"Value verified: {user_pref.saved_value}", duration)
                return True
            else:
                actual_value = user_pref.saved_value if user_pref else None
                duration = (time.time() - start_time) * 1000
                self.log_test(test_name, False, 
                    f"Value mismatch: expected {TEST_PREFERENCE_VALUE}, got {actual_value}", duration)
                return False
        except Exception as e:
            duration = (time.time() - start_time) * 1000
            self.log_test(test_name, False, f"Error: {str(e)}", duration)
            return False
    
    def test_6_get_group_preferences(self):
        """Test 6: Get all preferences in group"""
        test_name = "Test 6: Get group preferences"
        start_time = time.time()
        
        try:
            # Get group
            group = self.session.query(PreferenceGroup).filter_by(
                group_name=TEST_GROUP_NAME
            ).first()
            
            if not group:
                duration = (time.time() - start_time) * 1000
                self.log_test(test_name, False, 
                    f"Group {TEST_GROUP_NAME} not found", duration)
                return False
            
            # Get all preference types in group
            pref_types = self.session.query(PreferenceType).filter_by(
                group_id=group.id
            ).all()
            
            # Get user preferences for this group
            pref_names = [pt.preference_name for pt in pref_types]
            user_prefs = self.session.query(UserPreference).filter(
                UserPreference.user_id == TEST_USER_ID,
                UserPreference.profile_id == TEST_PROFILE_ID,
                UserPreference.preference_name.in_(pref_names)
            ).all()
            
            duration = (time.time() - start_time) * 1000
            self.log_test(test_name, True, 
                f"Found {len(user_prefs)} user preferences in group (out of {len(pref_types)} total)", 
                duration)
            return True
        except Exception as e:
            duration = (time.time() - start_time) * 1000
            self.log_test(test_name, False, f"Error: {str(e)}", duration)
            return False
    
    def run_all_tests(self):
        """Run all tests"""
        print("=" * 60)
        print("Preferences System Integration Tests")
        print("=" * 60)
        print()
        
        # Run tests
        self.test_1_preference_exists()
        self.test_2_preference_group_exists()
        self.test_3_get_user_preference()
        self.test_4_save_preference()
        self.test_5_verify_saved_value()
        self.test_6_get_group_preferences()
        
        # Summary
        print("=" * 60)
        print("Test Summary")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for r in self.test_results if r['passed'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print()
        
        if failed_tests > 0:
            print("Failed tests:")
            for result in self.test_results:
                if not result['passed']:
                    print(f"  - {result['test']}: {result['message']}")
            print()
        
        # Average duration
        avg_duration = sum(r['duration'] for r in self.test_results) / total_tests
        print(f"Average test duration: {avg_duration:.2f}ms")
        print()
        
        return failed_tests == 0

if __name__ == '__main__':
    try:
        test = PreferencesIntegrationTest()
        success = test.run_all_tests()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"❌ Test execution failed: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


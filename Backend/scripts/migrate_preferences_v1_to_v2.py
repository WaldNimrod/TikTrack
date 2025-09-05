#!/usr/bin/env python3
"""
Preferences Migration Script V1 to V2
=====================================

כלי מיגרציה שמעביר את כל הנתונים הקיימים ממערכת העדפות V1 
למערכת החדשה V2 עם שמירת כל ההגדרות.

Usage:
    python3 migrate_preferences_v1_to_v2.py [--dry-run] [--force] [--user-id USER_ID]

Author: TikTrack Development Team
Version: 2.0
Date: January 2025
"""

import os
import sys
import argparse
import json
from datetime import datetime
from typing import Dict, Any, List

# הוסף את הנתיב של Backend לPython path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.database import get_db
from models.user import User
from models.user_preferences import UserPreferences  # V1
from models.user_preferences_v2 import UserPreferencesV2, PreferenceProfile, PreferenceHistory
from services.preferences_service_v2 import PreferencesServiceV2
from sqlalchemy.exc import SQLAlchemyError


class PreferencesMigrator:
    """כלי מיגרציה למערכת העדפות"""
    
    def __init__(self, dry_run: bool = False, force: bool = False):
        self.dry_run = dry_run
        self.force = force
        self.db = next(get_db())
        self.migration_stats = {
            'users_processed': 0,
            'users_migrated': 0,
            'users_skipped': 0,
            'users_failed': 0,
            'errors': []
        }
    
    def migrate_all_users(self) -> Dict[str, Any]:
        """מגרר את כל המשתמשים"""
        print("🚀 Starting migration of all users from V1 to V2...")
        print(f"📋 Mode: {'DRY RUN' if self.dry_run else 'LIVE MIGRATION'}")
        print(f"⚡ Force: {'YES' if self.force else 'NO'}")
        print("-" * 50)
        
        try:
            # קבל את כל המשתמשים
            users = self.db.query(User).all()
            print(f"👥 Found {len(users)} users in system")
            
            for user in users:
                self.migration_stats['users_processed'] += 1
                result = self.migrate_user(user.id)
                
                if result['success']:
                    self.migration_stats['users_migrated'] += 1
                    print(f"✅ User {user.id} ({user.username}): {result['message']}")
                else:
                    if result.get('skipped'):
                        self.migration_stats['users_skipped'] += 1
                        print(f"⏭️ User {user.id} ({user.username}): {result['message']}")
                    else:
                        self.migration_stats['users_failed'] += 1
                        print(f"❌ User {user.id} ({user.username}): {result['message']}")
                        self.migration_stats['errors'].append({
                            'user_id': user.id,
                            'username': user.username,
                            'error': result['message']
                        })
            
            print("-" * 50)
            self._print_summary()
            
            return {
                'success': True,
                'stats': self.migration_stats
            }
            
        except Exception as e:
            error_msg = f"Critical error during migration: {e}"
            print(f"💥 {error_msg}")
            return {
                'success': False,
                'error': error_msg,
                'stats': self.migration_stats
            }
    
    def migrate_user(self, user_id: int) -> Dict[str, Any]:
        """מגרר משתמש ספציפי"""
        try:
            # בדוק אם יש כבר V2
            existing_v2 = PreferencesServiceV2.get_preferences_v2(self.db, user_id)
            if existing_v2 and not self.force:
                return {
                    'success': False,
                    'skipped': True,
                    'message': 'V2 preferences already exist (use --force to override)'
                }
            
            # קבל נתונים מV1
            v1_data = self._extract_v1_data(user_id)
            if not v1_data:
                return {
                    'success': False,
                    'message': 'No V1 preferences found'
                }
            
            if self.dry_run:
                return {
                    'success': True,
                    'message': f'Would migrate {len(v1_data)} preference keys (DRY RUN)'
                }
            
            # בצע מיגרציה
            return self._perform_migration(user_id, v1_data, existing_v2 is not None)
            
        except Exception as e:
            return {
                'success': False,
                'message': f'Migration failed: {str(e)}'
            }
    
    def _extract_v1_data(self, user_id: int) -> Dict[str, Any]:
        """חלץ נתונים מV1"""
        v1_data = {}
        
        try:
            # נסה מטבלת user_preferences
            v1_prefs = self.db.query(UserPreferences).filter(
                UserPreferences.user_id == user_id
            ).first()
            
            if v1_prefs:
                v1_data.update(v1_prefs.to_dict())
                print(f"📊 Found structured V1 preferences for user {user_id}")
            
            # נסה מהשדה JSON של המשתמש
            user = self.db.query(User).filter(User.id == user_id).first()
            if user:
                # preferences_json (חדש יותר)
                if hasattr(user, 'preferences_json') and user.preferences_json:
                    try:
                        json_data = json.loads(user.preferences_json)
                        v1_data.update(json_data)
                        print(f"📊 Found JSON preferences for user {user_id}")
                    except (json.JSONDecodeError, TypeError):
                        pass
                
                # preferences (legacy)
                if hasattr(user, 'preferences') and user.preferences:
                    try:
                        legacy_data = json.loads(user.preferences)
                        # מעדיף JSON מבנה חדש יותר
                        for key, value in legacy_data.items():
                            if key not in v1_data:
                                v1_data[key] = value
                        print(f"📊 Found legacy preferences for user {user_id}")
                    except (json.JSONDecodeError, TypeError):
                        pass
            
            return v1_data
            
        except Exception as e:
            print(f"⚠️ Error extracting V1 data for user {user_id}: {e}")
            return {}
    
    def _perform_migration(self, user_id: int, v1_data: Dict[str, Any], 
                          has_existing_v2: bool) -> Dict[str, Any]:
        """בצע את המיגרציה בפועל"""
        try:
            # צור או עדכן פרופיל ברירת מחדל
            default_profile = PreferencesServiceV2.get_default_profile(self.db, user_id)
            if not default_profile:
                default_profile = PreferencesServiceV2.create_profile(
                    self.db, user_id, "ברירת מחדל", 
                    is_default=True,
                    description="פרופיל ברירת מחדל שנוצר ממיגרציה מV1"
                )
                print(f"📁 Created default profile for user {user_id}")
            
            # מחק V2 קיים אם force
            if has_existing_v2 and self.force:
                existing = PreferencesServiceV2.get_preferences_v2(self.db, user_id, default_profile.id)
                if existing:
                    self.db.delete(existing)
                    self.db.commit()
                    print(f"🗑️ Removed existing V2 preferences for user {user_id}")
            
            # צור V2 חדש
            v2_preferences = UserPreferencesV2(
                user_id=user_id,
                profile_id=default_profile.id,
                migrated_from_v1=True,
                migration_date=datetime.utcnow(),
                version='2.0'
            )
            
            # מפה נתונים מV1 לV2
            self._map_detailed_v1_to_v2(v1_data, v2_preferences)
            
            self.db.add(v2_preferences)
            self.db.commit()
            self.db.refresh(v2_preferences)
            
            # צור רשומת היסטוריה
            history_entry = PreferenceHistory(
                user_id=user_id,
                profile_id=default_profile.id,
                change_type='migrate_from_v1',
                old_value=json.dumps({'v1_keys': list(v1_data.keys())}),
                new_value=json.dumps({'migrated_at': datetime.utcnow().isoformat()}),
                changed_by=user_id,
                change_reason='Automated migration from V1 to V2'
            )
            
            self.db.add(history_entry)
            self.db.commit()
            
            return {
                'success': True,
                'message': f'Successfully migrated {len(v1_data)} preferences'
            }
            
        except Exception as e:
            self.db.rollback()
            raise e
    
    def _map_detailed_v1_to_v2(self, v1_data: Dict[str, Any], v2_prefs: UserPreferencesV2):
        """מיפוי מפורט מV1 לV2"""
        try:
            print(f"🔄 Mapping {len(v1_data)} preferences from V1 to V2...")
            
            # הגדרות בסיסיות
            basic_mappings = {
                'primaryCurrency': 'primary_currency',
                'timezone': 'timezone',
                'defaultStopLoss': 'default_stop_loss',
                'defaultTargetPrice': 'default_target_price',
                'defaultCommission': 'default_commission'
            }
            
            for v1_key, v2_attr in basic_mappings.items():
                if v1_key in v1_data:
                    setattr(v2_prefs, v2_attr, v1_data[v1_key])
            
            # פילטרים ברירת מחדל
            filter_mappings = {
                'defaultStatusFilter': 'default_status_filter',
                'defaultTypeFilter': 'default_type_filter',
                'defaultAccountFilter': 'default_account_filter',
                'defaultDateRangeFilter': 'default_date_range_filter',
                'defaultSearchFilter': 'default_search_filter'
            }
            
            for v1_key, v2_attr in filter_mappings.items():
                if v1_key in v1_data:
                    setattr(v2_prefs, v2_attr, v1_data[v1_key])
            
            # נתונים חיצוניים
            external_mappings = {
                'dataRefreshInterval': 'data_refresh_interval',
                'primaryDataProvider': 'primary_data_provider',
                'secondaryDataProvider': 'secondary_data_provider',
                'cacheTTL': 'cache_ttl',
                'maxBatchSize': 'max_batch_size',
                'requestDelay': 'request_delay',
                'retryAttempts': 'retry_attempts',
                'retryDelay': 'retry_delay',
                'showPercentageChanges': 'show_percentage_changes',
                'showVolume': 'show_volume',
                'notifyOnDataFailures': 'notify_on_data_failures',
                'notifyOnStaleData': 'notify_on_stale_data'
            }
            
            for v1_key, v2_attr in external_mappings.items():
                if v1_key in v1_data:
                    value = v1_data[v1_key]
                    # המרות טיפוס נדרשות
                    if v2_attr in ['data_refresh_interval', 'cache_ttl', 'max_batch_size', 
                                  'request_delay', 'retry_attempts', 'retry_delay']:
                        value = int(value) if value is not None else None
                    elif v2_attr in ['show_percentage_changes', 'show_volume', 
                                   'notify_on_data_failures', 'notify_on_stale_data']:
                        value = bool(value)
                    
                    if value is not None:
                        setattr(v2_prefs, v2_attr, value)
            
            # הגדרות קונסול
            console_mappings = {
                'consoleCleanupInterval': 'console_cleanup_interval',
                'verboseLogging': 'verbose_logging'
            }
            
            for v1_key, v2_attr in console_mappings.items():
                if v1_key in v1_data:
                    value = v1_data[v1_key]
                    if v2_attr == 'console_cleanup_interval':
                        # המר מ-milliseconds ל-seconds
                        value = int(value / 1000) if isinstance(value, (int, float)) else 60
                    elif v2_attr == 'verbose_logging':
                        value = bool(value)
                    
                    setattr(v2_prefs, v2_attr, value)
            
            # הגדרות ממשק משתמש
            if 'autoRefresh' in v1_data:
                v2_prefs.table_auto_refresh = bool(v1_data['autoRefresh'])
            
            # JSON Fields - צור מערכת צבעים מאוחדת
            color_scheme = {}
            
            # צבעים מספריים
            if 'numericValueColors' in v1_data:
                color_scheme['numericValues'] = v1_data['numericValueColors']
            
            # צבעי ישויות
            if 'entityColors' in v1_data:
                color_scheme['entities'] = v1_data['entityColors']
            
            # צבעי סטטוסים
            if 'statusColors' in v1_data:
                color_scheme['status'] = v1_data['statusColors']
            
            # צבעי סוגי השקעה
            if 'investmentTypeColors' in v1_data:
                color_scheme['investmentTypes'] = v1_data['investmentTypeColors']
            
            if color_scheme:
                v2_prefs.color_scheme_json = json.dumps(color_scheme)
            
            # הגדרות שקיפות
            if 'headerOpacity' in v1_data:
                v2_prefs.opacity_settings_json = json.dumps({
                    'header': v1_data['headerOpacity']
                })
            
            # הגדרות רענון מתקדמות
            if 'refreshOverrides' in v1_data:
                v2_prefs.refresh_overrides_json = json.dumps(v1_data['refreshOverrides'])
            
            # הגדרות קונסול מV1
            if 'consoleSettings' in v1_data:
                console_settings = v1_data['consoleSettings']
                if 'autoClear' in console_settings:
                    v2_prefs.console_auto_clear = bool(console_settings['autoClear'])
                if 'clearInterval' in console_settings:
                    v2_prefs.console_cleanup_interval = int(console_settings['clearInterval'])
                if 'suppressDuration' in console_settings:
                    # שמור בהגדרות מתקדמות
                    advanced_console = {
                        'suppressDuration': console_settings['suppressDuration']
                    }
                    v2_prefs.advanced_alerts_json = json.dumps(advanced_console)
            
            print(f"✅ Successfully mapped all V1 preferences to V2")
            
        except Exception as e:
            print(f"❌ Error mapping V1 to V2: {e}")
            raise e
    
    def _print_summary(self):
        """הדפס סיכום המיגרציה"""
        stats = self.migration_stats
        print("📊 MIGRATION SUMMARY")
        print(f"👥 Total users processed: {stats['users_processed']}")
        print(f"✅ Users migrated: {stats['users_migrated']}")
        print(f"⏭️ Users skipped: {stats['users_skipped']}")
        print(f"❌ Users failed: {stats['users_failed']}")
        
        if stats['errors']:
            print("\n🚨 ERRORS:")
            for error in stats['errors']:
                print(f"   User {error['user_id']} ({error['username']}): {error['error']}")
    
    def verify_migration(self, user_id: int = None) -> Dict[str, Any]:
        """בדוק שהמיגרציה הושלמה בהצלחה"""
        try:
            users_to_check = [user_id] if user_id else [u.id for u in self.db.query(User).all()]
            
            verification_results = {
                'total_users': len(users_to_check),
                'verified_users': 0,
                'issues': []
            }
            
            for uid in users_to_check:
                v1_data = self._extract_v1_data(uid)
                v2_prefs = PreferencesServiceV2.get_preferences_v2(self.db, uid)
                
                if not v1_data:
                    continue  # אין נתונים לבדוק
                
                if not v2_prefs:
                    verification_results['issues'].append({
                        'user_id': uid,
                        'issue': 'V1 data exists but no V2 preferences found'
                    })
                    continue
                
                if not v2_prefs.migrated_from_v1:
                    verification_results['issues'].append({
                        'user_id': uid,
                        'issue': 'V2 preferences not marked as migrated from V1'
                    })
                
                # בדוק כמה שדות מפתח
                key_checks = [
                    ('primaryCurrency', 'primary_currency'),
                    ('defaultStopLoss', 'default_stop_loss'),
                    ('defaultStatusFilter', 'default_status_filter'),
                    ('dataRefreshInterval', 'data_refresh_interval')
                ]
                
                for v1_key, v2_attr in key_checks:
                    if v1_key in v1_data:
                        v1_value = v1_data[v1_key]
                        v2_value = getattr(v2_prefs, v2_attr, None)
                        
                        # השווה ערכים (עם התחשבות בהמרות טיפוס)
                        if str(v1_value) != str(v2_value):
                            verification_results['issues'].append({
                                'user_id': uid,
                                'issue': f'Value mismatch for {v1_key}: V1={v1_value}, V2={v2_value}'
                            })
                
                verification_results['verified_users'] += 1
            
            return verification_results
            
        except Exception as e:
            return {
                'error': f'Verification failed: {str(e)}'
            }


def main():
    parser = argparse.ArgumentParser(description='Migrate preferences from V1 to V2')
    parser.add_argument('--dry-run', action='store_true', 
                       help='Run in dry-run mode (no actual changes)')
    parser.add_argument('--force', action='store_true',
                       help='Force migration even if V2 preferences exist')
    parser.add_argument('--user-id', type=int,
                       help='Migrate specific user only')
    parser.add_argument('--verify', action='store_true',
                       help='Verify migration results')
    
    args = parser.parse_args()
    
    try:
        migrator = PreferencesMigrator(dry_run=args.dry_run, force=args.force)
        
        if args.verify:
            print("🔍 Verifying migration results...")
            results = migrator.verify_migration(args.user_id)
            print(f"✅ Verification complete: {results}")
            return
        
        if args.user_id:
            print(f"👤 Migrating user {args.user_id}...")
            result = migrator.migrate_user(args.user_id)
            print(f"Result: {result}")
        else:
            result = migrator.migrate_all_users()
        
        if result['success']:
            print("\n🎉 Migration completed successfully!")
            if not args.dry_run:
                print("💡 Run with --verify to check migration results")
        else:
            print(f"\n💥 Migration failed: {result.get('error', 'Unknown error')}")
            sys.exit(1)
    
    except KeyboardInterrupt:
        print("\n⚠️ Migration cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
#!/usr/bin/env python3
"""
TikTrack User Data Cleanup Script
==================================

Performs complete cleanup of user data from the database according to
the USER_DATA_CLEANUP_PROCESS.md specification.

This script executes Phase 1 of the cleanup process:
- Step 2: Notes and Alerts
- Step 3: Cash Flows and Executions
- Step 4: Conditions (preserving base structure)
- Step 5: Trade Plans and Trades
- Step 6: Import Sessions and Tags (preserving built-in tags)
- Step 7: Trading Accounts
- Step 8: Tickers and Market Data (preserving SPY only)
- Step 9: Preferences and Profiles (preserving active profile only)
- Step 10: Final Verification

IMPORTANT NOTES:
- This script works on the currently active database.
- Users are NOT deleted - the existing user is preserved (no full user system yet).
- Only user preferences values are deleted, the user profile structure is preserved.

Usage:
    python3 Backend/scripts/cleanup_user_data.py [--dry-run] [--verbose]

Options:
    --dry-run: Show what would be done without making changes
    --verbose: Show detailed progress information

Documentation:
    See documentation/05-REPORTS/USER_DATA_CLEANUP_PROCESS.md for full process

Author: TikTrack Development Team
Version: 1.0.0
Date: January 2025
"""

import sys
import os
import argparse
from typing import Dict, List, Optional, Tuple
from datetime import datetime

# Add Backend to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

from config.settings import DATABASE_URL, USING_SQLITE
from models.ticker import Ticker
from models.user import User
from models.preferences import PreferenceProfile
from models.tag_category import TagCategory
from models.tag import Tag

# ============================================================================
# Exception Classes
# ============================================================================

class CleanupError(Exception):
    """שגיאה בתהליך הניקוי"""
    
    def __init__(self, step: str, message: str, details: Optional[str] = None):
        self.step = step
        self.message = message
        self.details = details
        
        msg = f"❌ שגיאה בשלב {step}: {message}"
        if details:
            msg += f"\n📍 פרטים: {details}"
        msg += f"\n💡 פתרון: בדוק את המסמך documentation/05-REPORTS/USER_DATA_CLEANUP_PROCESS.md"
        
        super().__init__(msg)


class VerificationError(Exception):
    """שגיאה באימות"""
    
    def __init__(self, step: str, expected: str, actual: str):
        self.step = step
        self.expected = expected
        self.actual = actual
        
        msg = f"❌ שגיאת אימות בשלב {step}"
        msg += f"\n📊 צפוי: {expected}"
        msg += f"\n📊 בפועל: {actual}"
        
        super().__init__(msg)


# ============================================================================
# User Data Cleanup
# ============================================================================

class UserDataCleanup:
    """מבצע ניקוי מלא של נתוני משתמש לפי המסמך"""
    
    def __init__(self, db_session: Session, dry_run: bool = False, verbose: bool = False):
        self.db = db_session
        self.dry_run = dry_run
        self.verbose = verbose
        self.stats = {
            'deleted': {},
            'preserved': {},
            'verified': {}
        }
    
    def cleanup_all(self) -> Dict[str, any]:
        """מבצע את כל שלבי הניקוי"""
        if self.dry_run:
            print("🔍 DRY RUN - רק הדגמה, ללא שינויים")
            print()
        
        print("=" * 70)
        print("🧹 TikTrack - ניקוי נתוני משתמש")
        print("=" * 70)
        print()
        
        try:
            # Step 2: Notes and Alerts
            self._step2_notes_and_alerts()
            
            # Step 3: Cash Flows and Executions
            self._step3_cash_flows_and_executions()
            
            # Step 4: Conditions (preserving base structure)
            self._step4_conditions()
            
            # Step 5: Trade Plans and Trades
            self._step5_trade_plans_and_trades()
            
            # Step 6: Import Sessions and Tags
            self._step6_import_sessions_and_tags()
            
            # Step 7: Trading Accounts
            self._step7_trading_accounts()
            
            # Step 8: Tickers and Market Data
            self._step8_tickers_and_market_data()
            
            # Step 9: Preferences and Profiles
            self._step9_preferences_and_profiles()
            
            # Step 10: Final Verification
            self._step10_final_verification()
            
            # Commit if not dry run
            if not self.dry_run:
                self.db.commit()
                print()
                print("✅ כל השינויים נשמרו בהצלחה!")
            else:
                self.db.rollback()
                print()
                print("🔍 DRY RUN הושלם - לא בוצעו שינויים")
            
            return self.stats
            
        except Exception as e:
            self.db.rollback()
            print()
            print(f"❌ שגיאה בתהליך הניקוי: {str(e)}")
            raise
    
    # ========================================================================
    # Step 2: Notes and Alerts
    # ========================================================================
    
    def _step2_notes_and_alerts(self) -> None:
        """שלב 2: מחיקת הערות והתראות"""
        print("\n📝 שלב 2: הערות והתראות")
        print("-" * 70)
        
        # Count before
        notes_count = self._count_table('notes')
        alerts_count = self._count_table('alerts')
        mapping_count = self._count_table('condition_alerts_mapping', table_exists=True)
        
        print(f"   לפני: {notes_count} הערות, {alerts_count} התראות")
        
        if not self.dry_run:
            # Delete notes
            result = self.db.execute(text("DELETE FROM notes"))
            deleted_notes = result.rowcount
            
            # Delete alerts
            result = self.db.execute(text("DELETE FROM alerts"))
            deleted_alerts = result.rowcount
            
            # Delete condition alerts mapping (if table exists)
            deleted_mapping = 0
            try:
                result = self.db.execute(text("DELETE FROM condition_alerts_mapping"))
                deleted_mapping = result.rowcount
            except Exception:
                pass  # Table might not exist
            
            self.stats['deleted']['notes'] = deleted_notes
            self.stats['deleted']['alerts'] = deleted_alerts
            self.stats['deleted']['condition_alerts_mapping'] = deleted_mapping
            
            print(f"   ✅ נמחקו: {deleted_notes} הערות, {deleted_alerts} התראות")
            
            # Verify
            self._verify_count('notes', 0)
            self._verify_count('alerts', 0)
        else:
            print(f"   🔍 DRY RUN: היה נמחק {notes_count} הערות, {alerts_count} התראות")
    
    # ========================================================================
    # Step 3: Cash Flows and Executions
    # ========================================================================
    
    def _step3_cash_flows_and_executions(self) -> None:
        """שלב 3: מחיקת תזרימי מזומן וביצועים"""
        print("\n💰 שלב 3: תזרימי מזומן וביצועים")
        print("-" * 70)
        
        # Count before
        cash_flows_count = self._count_table('cash_flows')
        executions_count = self._count_table('executions')
        
        print(f"   לפני: {cash_flows_count} תזרימי מזומן, {executions_count} ביצועים")
        
        if not self.dry_run:
            # Delete cash flows
            result = self.db.execute(text("DELETE FROM cash_flows"))
            deleted_cash_flows = result.rowcount
            
            # Delete executions
            result = self.db.execute(text("DELETE FROM executions"))
            deleted_executions = result.rowcount
            
            self.stats['deleted']['cash_flows'] = deleted_cash_flows
            self.stats['deleted']['executions'] = deleted_executions
            
            print(f"   ✅ נמחקו: {deleted_cash_flows} תזרימי מזומן, {deleted_executions} ביצועים")
            
            # Verify
            self._verify_count('cash_flows', 0)
            self._verify_count('executions', 0)
        else:
            print(f"   🔍 DRY RUN: היה נמחק {cash_flows_count} תזרימי מזומן, {executions_count} ביצועים")
    
    # ========================================================================
    # Step 4: Conditions
    # ========================================================================
    
    def _step4_conditions(self) -> None:
        """שלב 4: מחיקת תנאים (שמירת מבנה בסיסי)"""
        print("\n🔧 שלב 4: תנאים וסיבות")
        print("-" * 70)
        
        # Preserve base structure
        trading_methods_count = self._count_table('trading_methods', table_exists=True)
        method_parameters_count = self._count_table('method_parameters', table_exists=True)
        
        print(f"   ✅ נשמר: {trading_methods_count} שיטות מסחר, {method_parameters_count} פרמטרים")
        self.stats['preserved']['trading_methods'] = trading_methods_count
        self.stats['preserved']['method_parameters'] = method_parameters_count
        
        # Count before
        plan_conditions_count = self._count_table('plan_conditions', table_exists=True)
        trade_conditions_count = self._count_table('trade_conditions', table_exists=True)
        
        print(f"   לפני: {plan_conditions_count} תנאי תוכניות, {trade_conditions_count} תנאי טריידים")
        
        if not self.dry_run:
            # Delete plan conditions
            deleted_plan_conditions = 0
            try:
                result = self.db.execute(text("DELETE FROM plan_conditions"))
                deleted_plan_conditions = result.rowcount
            except Exception:
                pass
            
            # Delete trade conditions
            deleted_trade_conditions = 0
            try:
                result = self.db.execute(text("DELETE FROM trade_conditions"))
                deleted_trade_conditions = result.rowcount
            except Exception:
                pass
            
            self.stats['deleted']['plan_conditions'] = deleted_plan_conditions
            self.stats['deleted']['trade_conditions'] = deleted_trade_conditions
            
            print(f"   ✅ נמחקו: {deleted_plan_conditions} תנאי תוכניות, {deleted_trade_conditions} תנאי טריידים")
            
            # Verify base structure preserved
            final_methods = self._count_table('trading_methods', table_exists=True)
            final_parameters = self._count_table('method_parameters', table_exists=True)
            
            if final_methods != trading_methods_count:
                raise VerificationError(
                    'step4',
                    f"{trading_methods_count} שיטות מסחר",
                    f"{final_methods} שיטות מסחר"
                )
            
            if final_parameters != method_parameters_count:
                raise VerificationError(
                    'step4',
                    f"{method_parameters_count} פרמטרים",
                    f"{final_parameters} פרמטרים"
                )
        else:
            print(f"   🔍 DRY RUN: היה נמחק {plan_conditions_count} תנאי תוכניות, {trade_conditions_count} תנאי טריידים")
    
    # ========================================================================
    # Step 5: Trade Plans and Trades
    # ========================================================================
    
    def _step5_trade_plans_and_trades(self) -> None:
        """שלב 5: מחיקת תוכניות טריידים וטריידים"""
        print("\n📋 שלב 5: תוכניות טריידים וטריידים")
        print("-" * 70)
        
        # Count before
        trade_plans_count = self._count_table('trade_plans')
        trades_count = self._count_table('trades')
        
        print(f"   לפני: {trade_plans_count} תוכניות, {trades_count} טריידים")
        
        if not self.dry_run:
            # Delete trade plans
            result = self.db.execute(text("DELETE FROM trade_plans"))
            deleted_trade_plans = result.rowcount
            
            # Delete trades
            result = self.db.execute(text("DELETE FROM trades"))
            deleted_trades = result.rowcount
            
            self.stats['deleted']['trade_plans'] = deleted_trade_plans
            self.stats['deleted']['trades'] = deleted_trades
            
            print(f"   ✅ נמחקו: {deleted_trade_plans} תוכניות, {deleted_trades} טריידים")
            
            # Verify
            self._verify_count('trade_plans', 0)
            self._verify_count('trades', 0)
        else:
            print(f"   🔍 DRY RUN: היה נמחק {trade_plans_count} תוכניות, {trades_count} טריידים")
    
    # ========================================================================
    # Step 6: Import Sessions and Tags
    # ========================================================================
    
    def _step6_import_sessions_and_tags(self) -> None:
        """שלב 6: מחיקת סשני ייבוא ותגיות (שמירת תגיות מובנות)"""
        print("\n🏷️  שלב 6: סשני ייבוא ותגיות")
        print("-" * 70)
        
        # Count before
        import_sessions_count = self._count_table('import_sessions')
        tag_links_count = self._count_table('tag_links', table_exists=True)
        tags_count = self._count_table('tags')
        tag_categories_count = self._count_table('tag_categories')
        
        print(f"   לפני: {import_sessions_count} סשני ייבוא, {tags_count} תגים, {tag_categories_count} קטגוריות")
        
        if not self.dry_run:
            # Delete import sessions
            result = self.db.execute(text("DELETE FROM import_sessions"))
            deleted_sessions = result.rowcount
            
            # Delete tag links
            deleted_tag_links = 0
            try:
                result = self.db.execute(text("DELETE FROM tag_links"))
                deleted_tag_links = result.rowcount
            except Exception:
                pass
            
            # Find import data categories to preserve
            import_categories = self.db.execute(
                text("SELECT id FROM tag_categories WHERE name LIKE '%ייבוא נתונים%'")
            ).fetchall()
            import_category_ids = [row[0] for row in import_categories]
            
            preserved_tags_count = 0
            if import_category_ids:
                # Count tags in import categories
                placeholders = ','.join([str(cat_id) for cat_id in import_category_ids])
                result = self.db.execute(
                    text(f"SELECT COUNT(*) FROM tags WHERE category_id IN ({placeholders})")
                )
                preserved_tags_count = result.scalar()
            
            # Delete tags not in import categories
            deleted_tags = 0
            if import_category_ids:
                placeholders = ','.join([str(cat_id) for cat_id in import_category_ids])
                result = self.db.execute(
                    text(f"DELETE FROM tags WHERE category_id NOT IN ({placeholders})")
                )
                deleted_tags = result.rowcount
            else:
                result = self.db.execute(text("DELETE FROM tags"))
                deleted_tags = result.rowcount
            
            # Delete tag categories except import data
            deleted_categories = 0
            result = self.db.execute(
                text("DELETE FROM tag_categories WHERE name NOT LIKE '%ייבוא נתונים%'")
            )
            deleted_categories = result.rowcount
            
            self.stats['deleted']['import_sessions'] = deleted_sessions
            self.stats['deleted']['tag_links'] = deleted_tag_links
            self.stats['deleted']['tags'] = deleted_tags
            self.stats['preserved']['tags'] = preserved_tags_count
            self.stats['preserved']['tag_categories'] = len(import_category_ids)
            
            print(f"   ✅ נמחקו: {deleted_sessions} סשנים, {deleted_tags} תגים, {deleted_categories} קטגוריות")
            print(f"   ✅ נשמרו: {preserved_tags_count} תגים מובנים, {len(import_category_ids)} קטגוריות ייבוא")
            
            # Verify
            self._verify_count('import_sessions', 0)
            self._verify_count('tag_links', 0)
        else:
            print(f"   🔍 DRY RUN: היה נמחק {import_sessions_count} סשנים, {tags_count} תגים")
    
    # ========================================================================
    # Step 7: Trading Accounts
    # ========================================================================
    
    def _step7_trading_accounts(self) -> None:
        """שלב 7: מחיקת חשבונות מסחר"""
        print("\n💼 שלב 7: חשבונות מסחר")
        print("-" * 70)
        
        # Count before
        accounts_count = self._count_table('trading_accounts')
        
        print(f"   לפני: {accounts_count} חשבונות מסחר")
        
        if not self.dry_run:
            # Delete trading accounts
            result = self.db.execute(text("DELETE FROM trading_accounts"))
            deleted_accounts = result.rowcount
            
            self.stats['deleted']['trading_accounts'] = deleted_accounts
            
            print(f"   ✅ נמחקו: {deleted_accounts} חשבונות מסחר")
            
            # Verify
            self._verify_count('trading_accounts', 0)
        else:
            print(f"   🔍 DRY RUN: היה נמחק {accounts_count} חשבונות מסחר")
    
    # ========================================================================
    # Step 8: Tickers and Market Data
    # ========================================================================
    
    def _step8_tickers_and_market_data(self) -> None:
        """שלב 8: ניקוי טיקרים ומחירים (שמירת SPY בלבד)"""
        print("\n📈 שלב 8: טיקרים ומחירים")
        print("-" * 70)
        
        # Check if SPY exists
        spy = self.db.query(Ticker).filter(Ticker.symbol == 'SPY').first()
        
        if not spy:
            raise CleanupError(
                'step8',
                "טיקר SPY לא נמצא",
                "SPY חייב להתקיים לפני הניקוי"
            )
        
        # Count before
        tickers_count = self._count_table('tickers')
        market_quotes_count = self._count_table('market_data_quotes', table_exists=True)
        refresh_logs_count = self._count_table('data_refresh_logs', table_exists=True)
        intraday_slots_count = self._count_table('intraday_data_slots', table_exists=True)
        quotes_last_count = self._count_table('quotes_last', table_exists=True)
        provider_symbols_count = self._count_table('ticker_provider_symbols', table_exists=True)
        
        print(f"   לפני: {tickers_count} טיקרים")
        print(f"   ✅ SPY קיים (ID: {spy.id})")
        
        if not self.dry_run:
            # Delete all tickers except SPY
            result = self.db.execute(text("DELETE FROM tickers WHERE symbol != 'SPY'"))
            deleted_tickers = result.rowcount
            
            # Clean up ticker_provider_symbols - keep only SPY
            deleted_provider_symbols = 0
            try:
                result = self.db.execute(
                    text("DELETE FROM ticker_provider_symbols WHERE ticker_id NOT IN (SELECT id FROM tickers WHERE symbol = 'SPY')")
                )
                deleted_provider_symbols = result.rowcount
            except Exception:
                pass
            
            # Delete market data
            deleted_market_quotes = 0
            try:
                result = self.db.execute(text("DELETE FROM market_data_quotes"))
                deleted_market_quotes = result.rowcount
            except Exception:
                pass
            
            deleted_refresh_logs = 0
            try:
                result = self.db.execute(text("DELETE FROM data_refresh_logs"))
                deleted_refresh_logs = result.rowcount
            except Exception:
                pass
            
            deleted_intraday_slots = 0
            try:
                result = self.db.execute(text("DELETE FROM intraday_data_slots"))
                deleted_intraday_slots = result.rowcount
            except Exception:
                pass
            
            deleted_quotes_last = 0
            try:
                result = self.db.execute(text("DELETE FROM quotes_last"))
                deleted_quotes_last = result.rowcount
            except Exception:
                pass
            
            self.stats['deleted']['tickers'] = deleted_tickers
            self.stats['deleted']['ticker_provider_symbols'] = deleted_provider_symbols
            self.stats['deleted']['market_data_quotes'] = deleted_market_quotes
            self.stats['deleted']['data_refresh_logs'] = deleted_refresh_logs
            self.stats['deleted']['intraday_data_slots'] = deleted_intraday_slots
            self.stats['deleted']['quotes_last'] = deleted_quotes_last
            self.stats['preserved']['tickers'] = 1  # SPY
            
            print(f"   ✅ נמחקו: {deleted_tickers} טיקרים (SPY נשמר)")
            print(f"   ✅ נמחקו: כל נתוני השוק")
            
            # Verify
            final_tickers = self._count_table('tickers')
            if final_tickers != 1:
                raise VerificationError('step8', "1 טיקר (SPY)", f"{final_tickers} טיקרים")
            
            spy_symbol = self.db.execute(text("SELECT symbol FROM tickers")).scalar()
            if spy_symbol != 'SPY':
                raise VerificationError('step8', "SPY", spy_symbol)
            
            print(f"   ✅ אימות: נשאר רק SPY")
        else:
            print(f"   🔍 DRY RUN: היה נמחק {tickers_count - 1} טיקרים (SPY נשמר)")
    
    # ========================================================================
    # Step 9: Preferences and Profiles
    # ========================================================================
    
    def _step9_preferences_and_profiles(self) -> None:
        """שלב 9: ניקוי העדפות ופרופילים (שמירת פרופיל פעיל בלבד)"""
        print("\n⚙️  שלב 9: העדפות ופרופילים")
        print("-" * 70)
        
        # Check active profile
        active_profile = self.db.query(PreferenceProfile).filter(
            PreferenceProfile.is_active == True
        ).first()
        
        if not active_profile:
            raise CleanupError(
                'step9',
                "פרופיל פעיל לא נמצא",
                "חייב להיות פרופיל פעיל אחד לפני הניקוי"
            )
        
        # Count before
        profiles_count = self._count_table('preference_profiles')
        preferences_count = self._count_table('user_preferences')
        preference_groups_count = self._count_table('preference_groups', table_exists=True)
        preference_types_count = self._count_table('preference_types', table_exists=True)
        
        print(f"   לפני: {profiles_count} פרופילים, {preferences_count} העדפות")
        print(f"   ✅ פרופיל פעיל קיים (ID: {active_profile.id}, User: {active_profile.user_id})")
        
        if not self.dry_run:
            # Delete all user preferences (values only, profile stays)
            result = self.db.execute(text("DELETE FROM user_preferences"))
            deleted_preferences = result.rowcount
            
            # Delete all profiles except active one
            result = self.db.execute(
                text(f"DELETE FROM preference_profiles WHERE is_active != TRUE OR user_id != {active_profile.user_id}")
            )
            deleted_profiles = result.rowcount
            
            self.stats['deleted']['user_preferences'] = deleted_preferences
            self.stats['deleted']['preference_profiles'] = deleted_profiles
            self.stats['preserved']['preference_profiles'] = 1
            self.stats['preserved']['preference_groups'] = preference_groups_count
            self.stats['preserved']['preference_types'] = preference_types_count
            
            print(f"   ✅ נמחקו: {deleted_preferences} העדפות, {deleted_profiles} פרופילים")
            print(f"   ✅ נשמר: פרופיל פעיל אחד, {preference_groups_count} קבוצות, {preference_types_count} סוגים")
            
            # Verify
            final_profiles = self._count_table('preference_profiles')
            if final_profiles != 1:
                raise VerificationError('step9', "1 פרופיל", f"{final_profiles} פרופילים")
            
            self._verify_count('user_preferences', 0)
            
            print(f"   ✅ אימות: נשאר פרופיל פעיל אחד")
        else:
            print(f"   🔍 DRY RUN: היה נמחק {preferences_count} העדפות, {profiles_count - 1} פרופילים")
    
    # ========================================================================
    # Step 10: Final Verification
    # ========================================================================
    
    def _step10_final_verification(self) -> None:
        """שלב 10: בדיקות סופיות"""
        print("\n✅ שלב 10: בדיקות סופיות")
        print("-" * 70)
        
        verifications = []
        
        # Verify tickers - only SPY
        tickers_count = self._count_table('tickers')
        if tickers_count == 1:
            spy_symbol = self.db.execute(text("SELECT symbol FROM tickers")).scalar()
            if spy_symbol == 'SPY':
                verifications.append(("טיקרים", "✅ רק SPY"))
            else:
                verifications.append(("טיקרים", f"❌ נמצא {spy_symbol} במקום SPY"))
        else:
            verifications.append(("טיקרים", f"❌ {tickers_count} טיקרים במקום 1"))
        
        # Verify profiles - only one active
        profiles_count = self._count_table('preference_profiles')
        active_profiles = self.db.execute(
            text("SELECT COUNT(*) FROM preference_profiles WHERE is_active = TRUE")
        ).scalar()
        
        if profiles_count == 1 and active_profiles == 1:
            verifications.append(("פרופילים", "✅ פרופיל פעיל אחד"))
        else:
            verifications.append(("פרופילים", f"❌ {profiles_count} פרופילים, {active_profiles} פעילים"))
        
        # Verify preferences - all deleted
        preferences_count = self._count_table('user_preferences')
        if preferences_count == 0:
            verifications.append(("העדפות", "✅ כל הערכים נמחקו"))
        else:
            verifications.append(("העדפות", f"❌ {preferences_count} העדפות נותרו"))
        
        # Verify import tags preserved
        import_categories_count = self.db.execute(
            text("SELECT COUNT(*) FROM tag_categories WHERE name LIKE '%ייבוא נתונים%'")
        ).scalar()
        
        if import_categories_count > 0:
            verifications.append(("תגיות ייבוא", f"✅ {import_categories_count} קטגוריות ייבוא נשמרו"))
        else:
            verifications.append(("תגיות ייבוא", "⚠️  לא נמצאו קטגוריות ייבוא"))
        
        # Verify base conditions preserved
        trading_methods_count = self._count_table('trading_methods', table_exists=True)
        if trading_methods_count > 0:
            verifications.append(("שיטות מסחר", f"✅ {trading_methods_count} שיטות נשמרו"))
        else:
            verifications.append(("שיטות מסחר", "⚠️  לא נמצאו שיטות מסחר"))
        
        # Print all verifications
        print("   📊 תוצאות אימות:")
        for name, result in verifications:
            print(f"      - {name}: {result}")
            self.stats['verified'][name] = result
        
        # Check for errors
        errors = [r for _, r in verifications if r.startswith('❌')]
        if errors:
            print()
            print(f"   ⚠️  נמצאו {len(errors)} בעיות באימות!")
            for error in errors:
                print(f"      {error}")
        else:
            print()
            print("   ✅ כל האימותים עברו בהצלחה!")
    
    # ========================================================================
    # Helper Methods
    # ========================================================================
    
    def _count_table(self, table_name: str, table_exists: bool = False) -> int:
        """סופר רשומות בטבלה"""
        try:
            if USING_SQLITE:
                result = self.db.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
            else:
                result = self.db.execute(text(f'SELECT COUNT(*) FROM "{table_name}"'))
            return result.scalar() or 0
        except Exception as e:
            if table_exists:
                return 0  # Table doesn't exist, count is 0
            raise CleanupError(
                'count',
                f"לא ניתן לספור רשומות בטבלה {table_name}",
                str(e)
            )
    
    def _verify_count(self, table_name: str, expected: int) -> None:
        """מוודא שמספר הרשומות בטבלה תואם לצפוי"""
        actual = self._count_table(table_name, table_exists=True)
        if actual != expected:
            raise VerificationError(
                f'verify_{table_name}',
                f"{expected} רשומות",
                f"{actual} רשומות"
            )


# ============================================================================
# Main Entry Point
# ============================================================================

def _build_engine_kwargs():
    """בונה פרמטרים ל-engine"""
    kwargs = {
        "poolclass": QueuePool,
        "pool_size": 10,
        "max_overflow": 20,
        "pool_timeout": 60,
        "pool_recycle": 3600,
        "pool_pre_ping": True,
        "echo": False,
    }
    if USING_SQLITE:
        kwargs["connect_args"] = {"check_same_thread": False}
    return kwargs


def main():
    """Entry point"""
    parser = argparse.ArgumentParser(
        description='Cleanup user data from TikTrack database',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be done without making changes'
    )
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Show detailed progress information'
    )
    parser.add_argument(
        '--confirm',
        action='store_true',
        help='Skip confirmation prompt (use with caution!)'
    )
    
    args = parser.parse_args()
    
    # Warning if not dry run
    if not args.dry_run and not args.confirm:
        print("⚠️  אזהרה: סקריפט זה ימחק נתוני משתמש מבסיס הנתונים הפעיל!")
        print("⚠️  ודא שיש לך גיבוי לפני המשך!")
        print()
        response = input("האם אתה בטוח שברצונך להמשיך? (הקלד 'yes' לאישור): ")
        if response.lower() != 'yes':
            print("❌ בוטל על ידי המשתמש")
            sys.exit(0)
    
    # Create database connection
    engine = create_engine(DATABASE_URL, **_build_engine_kwargs())
    Session = sessionmaker(bind=engine)
    db = Session()
    
    try:
        # Run cleanup
        cleanup = UserDataCleanup(db, dry_run=args.dry_run, verbose=args.verbose)
        stats = cleanup.cleanup_all()
        
        print()
        print("=" * 70)
        print("📊 סיכום:")
        print("=" * 70)
        
        if stats.get('deleted'):
            print("\n🗑️  נמחק:")
            for entity, count in stats['deleted'].items():
                print(f"   - {entity}: {count}")
        
        if stats.get('preserved'):
            print("\n✅ נשמר:")
            for entity, count in stats['preserved'].items():
                print(f"   - {entity}: {count}")
        
        print()
        print("=" * 70)
        
        if args.dry_run:
            print("✅ DRY RUN הושלם בהצלחה")
            print("💡 להרצה מלאה, הסר את הפלאג --dry-run")
        else:
            print("✅ ניקוי נתוני משתמש הושלם בהצלחה!")
            print("💡 המשך לשלב 10.5 - בדיקה ידנית בדפדפן")
            print("💡 לאחר מכן ניתן להמשיך לפייז 2 - יצירת נתוני דוגמה")
        
    except CleanupError as e:
        print(f"\n❌ שגיאה בתהליך הניקוי:")
        print(str(e))
        sys.exit(1)
    except VerificationError as e:
        print(f"\n❌ שגיאת אימות:")
        print(str(e))
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ שגיאה לא צפויה: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


if __name__ == '__main__':
    main()


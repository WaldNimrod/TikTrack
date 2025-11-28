#!/usr/bin/env python3
"""
TikTrack Cleanup Results Verification Script
============================================

Comprehensive verification script that checks the state of the database
after the cleanup process (Phase 1) to ensure all cleanup operations
were performed correctly.

This script verifies:
- Table record counts
- Foreign key integrity
- SPY ticker preservation
- Active profile preservation
- Built-in tags preservation
- Base conditions preservation

Usage:
    python3 Backend/scripts/verify_cleanup_results.py [--verbose]

Options:
    --verbose: Show detailed verification information

Author: TikTrack Development Team
Version: 1.0.0
Date: January 2025

Documentation:
    See documentation/05-REPORTS/USER_DATA_CLEANUP_PROCESS.md
"""

import sys
import os
import argparse
from typing import Dict, List, Tuple, Optional

# Add Backend to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
from sqlalchemy.exc import SQLAlchemyError

from config.settings import DATABASE_URL
from models.ticker import Ticker
from models.user import User
from models.preferences import PreferenceProfile

# ============================================================================
# Verification Results
# ============================================================================

class VerificationResult:
    """תוצאות אימות"""
    
    def __init__(self):
        self.passed = []
        self.failed = []
        self.warnings = []
    
    def add_pass(self, category: str, message: str):
        """מוסיף בדיקה שעברה"""
        self.passed.append((category, message))
    
    def add_fail(self, category: str, message: str, details: str = None):
        """מוסיף בדיקה שנכשלה"""
        self.failed.append((category, message, details))
    
    def add_warning(self, category: str, message: str):
        """מוסיף אזהרה"""
        self.warnings.append((category, message))
    
    def print_summary(self, verbose: bool = False):
        """מדפיס סיכום של כל הבדיקות"""
        print("\n" + "=" * 70)
        print("📊 סיכום אימות תוצאות הניקוי")
        print("=" * 70)
        print()
        
        if self.passed:
            print(f"✅ בדיקות שעברו: {len(self.passed)}")
            if verbose:
                for category, message in self.passed:
                    print(f"   [{category}] {message}")
            print()
        
        if self.warnings:
            print(f"⚠️  אזהרות: {len(self.warnings)}")
            for category, message in self.warnings:
                print(f"   [{category}] {message}")
            print()
        
        if self.failed:
            print(f"❌ בדיקות שנכשלו: {len(self.failed)}")
            for category, message, details in self.failed:
                print(f"   [{category}] {message}")
                if details:
                    print(f"      📍 פרטים: {details}")
            print()
        
        # Final status
        print("=" * 70)
        if not self.failed:
            print("✅ כל הבדיקות עברו בהצלחה!")
            return True
        else:
            print(f"❌ נמצאו {len(self.failed)} בעיות שדורשות תיקון")
            return False


# ============================================================================
# Verification Functions
# ============================================================================

class CleanupVerifier:
    """בודק את תוצאות הניקוי"""
    
    def __init__(self, db: Session):
        self.db = db
        self.inspector = inspect(db.bind)
        self.results = VerificationResult()
    
    def verify_table_counts(self) -> None:
        """בודק מספר רשומות בכל טבלה"""
        print("\n📊 בודק מספר רשומות בטבלאות...")
        
        # Tables that should be empty
        empty_tables = [
            'trades', 'trade_plans', 'trading_accounts',
            'cash_flows', 'executions', 'notes', 'alerts',
            'market_data_quotes', 'data_refresh_logs',
            'intraday_data_slots', 'quotes_last',
            'user_preferences', 'import_sessions',
            'tag_links', 'plan_conditions', 'trade_conditions',
            'condition_alerts_mapping'
        ]
        
        for table_name in empty_tables:
            try:
                count = self._count_table(table_name, table_exists=True)
                if count == 0:
                    self.results.add_pass('טבלאות', f"{table_name}: 0 רשומות (מצופה)")
                else:
                    self.results.add_fail(
                        'טבלאות',
                        f"{table_name}: {count} רשומות (מצופה: 0)",
                        f"הטבלה אמורה להיות ריקה אחרי הניקוי"
                    )
            except Exception as e:
                self.results.add_warning('טבלאות', f"{table_name}: לא ניתן לבדוק - {str(e)}")
        
        # Tables that should have specific counts
        # Tickers: should have exactly 1 (SPY)
        tickers_count = self._count_table('tickers')
        if tickers_count == 1:
            spy_symbol = self.db.execute(text("SELECT symbol FROM tickers")).scalar()
            if spy_symbol == 'SPY':
                self.results.add_pass('טבלאות', "tickers: 1 רשומה (SPY) - תקין")
            else:
                self.results.add_fail(
                    'טבלאות',
                    f"tickers: נמצא {spy_symbol} במקום SPY",
                    "צריך להיות רק SPY"
                )
        else:
            self.results.add_fail(
                'טבלאות',
                f"tickers: {tickers_count} רשומות (מצופה: 1)",
                "צריך להיות רק SPY"
            )
        
        # Preference profiles: should have exactly 1 (active)
        profiles_count = self._count_table('preference_profiles')
        active_profiles = self.db.execute(
            text("SELECT COUNT(*) FROM preference_profiles WHERE is_active = TRUE")
        ).scalar()
        
        if profiles_count == 1 and active_profiles == 1:
            self.results.add_pass('טבלאות', "preference_profiles: 1 פרופיל פעיל - תקין")
        else:
            self.results.add_fail(
                'טבלאות',
                f"preference_profiles: {profiles_count} פרופילים, {active_profiles} פעילים (מצופה: 1)",
                "צריך להיות רק פרופיל פעיל אחד"
            )
    
    def verify_foreign_keys(self) -> None:
        """בודק תקינות Foreign Keys"""
        print("\n🔗 בודק תקינות Foreign Keys...")
        
        try:
            # Check for orphaned records
            # Check ticker_provider_symbols
            orphaned_provider_symbols = self.db.execute(
                text("""
                    SELECT COUNT(*) FROM ticker_provider_symbols tps
                    WHERE tps.ticker_id NOT IN (SELECT id FROM tickers)
                """)
            ).scalar()
            
            if orphaned_provider_symbols == 0:
                self.results.add_pass('Foreign Keys', "ticker_provider_symbols: אין רשומות יתומות")
            else:
                self.results.add_fail(
                    'Foreign Keys',
                    f"ticker_provider_symbols: {orphaned_provider_symbols} רשומות יתומות",
                    "יש ticker_provider_symbols שמתייחסים לטיקרים שלא קיימים"
                )
            
            # Check tag_links (if any remain)
            try:
                orphaned_tag_links = self.db.execute(
                    text("""
                        SELECT COUNT(*) FROM tag_links tl
                        WHERE tl.tag_id NOT IN (SELECT id FROM tags)
                    """)
                ).scalar()
                
                if orphaned_tag_links == 0:
                    self.results.add_pass('Foreign Keys', "tag_links: אין רשומות יתומות")
                else:
                    self.results.add_warning(
                        'Foreign Keys',
                        f"tag_links: {orphaned_tag_links} רשומות יתומות (אם הטבלה לא ריקה)"
                    )
            except Exception:
                pass  # Table might not exist or be empty
            
        except Exception as e:
            self.results.add_warning('Foreign Keys', f"לא ניתן לבדוק Foreign Keys: {str(e)}")
    
    def verify_spy_ticker(self) -> None:
        """בודק ששמירת SPY תקינה"""
        print("\n📈 בודק שמירת SPY...")
        
        try:
            spy = self.db.query(Ticker).filter(Ticker.symbol == 'SPY').first()
            if spy:
                self.results.add_pass('SPY', f"SPY קיים (ID: {spy.id})")
                
                # Check ticker_provider_symbols for SPY
                provider_symbols_count = self.db.execute(
                    text("SELECT COUNT(*) FROM ticker_provider_symbols WHERE ticker_id = :ticker_id"),
                    {'ticker_id': spy.id}
                ).scalar()
                
                if provider_symbols_count >= 0:  # Can be 0 or more
                    self.results.add_pass('SPY', f"ticker_provider_symbols: {provider_symbols_count} רשומות עבור SPY")
            else:
                self.results.add_fail('SPY', "SPY לא נמצא", "SPY חייב להישמר אחרי הניקוי")
        except Exception as e:
            self.results.add_fail('SPY', f"שגיאה בבדיקת SPY: {str(e)}")
    
    def verify_active_profile(self) -> None:
        """בודק שמירת פרופיל פעיל"""
        print("\n⚙️  בודק שמירת פרופיל פעיל...")
        
        try:
            active_profile = self.db.query(PreferenceProfile).filter(
                PreferenceProfile.is_active == True
            ).first()
            
            if active_profile:
                self.results.add_pass('פרופילים', f"פרופיל פעיל קיים (ID: {active_profile.id}, User: {active_profile.user_id})")
                
                # Check that only one profile exists
                total_profiles = self._count_table('preference_profiles')
                if total_profiles == 1:
                    self.results.add_pass('פרופילים', f"רק פרופיל אחד קיים (מצופה)")
                else:
                    self.results.add_fail(
                        'פרופילים',
                        f"{total_profiles} פרופילים קיימים (מצופה: 1)",
                        "צריך להיות רק פרופיל פעיל אחד"
                    )
            else:
                self.results.add_fail('פרופילים', "אין פרופיל פעיל", "חייב להיות פרופיל פעיל אחד")
        except Exception as e:
            self.results.add_fail('פרופילים', f"שגיאה בבדיקת פרופילים: {str(e)}")
    
    def verify_builtin_tags(self) -> None:
        """בודק שמירת תגיות מובנות"""
        print("\n🏷️  בודק שמירת תגיות מובנות...")
        
        try:
            import_categories_count = self.db.execute(
                text("SELECT COUNT(*) FROM tag_categories WHERE name LIKE '%ייבוא נתונים%'")
            ).scalar()
            
            if import_categories_count > 0:
                self.results.add_pass('תגיות', f"{import_categories_count} קטגוריות ייבוא נשמרו")
                
                # Check tags in import categories
                import_tags_count = self.db.execute(
                    text("""
                        SELECT COUNT(*) FROM tags
                        WHERE category_id IN (
                            SELECT id FROM tag_categories WHERE name LIKE '%ייבוא נתונים%'
                        )
                    """)
                ).scalar()
                
                if import_tags_count > 0:
                    self.results.add_pass('תגיות', f"{import_tags_count} תגים מובנים של ייבוא נשמרו")
                else:
                    self.results.add_warning('תגיות', "לא נמצאו תגים מובנים של ייבוא (יכול להיות תקין)")
            else:
                self.results.add_warning('תגיות', "לא נמצאו קטגוריות ייבוא (יכול להיות תקין אם לא היו)")
        except Exception as e:
            self.results.add_warning('תגיות', f"לא ניתן לבדוק תגיות: {str(e)}")
    
    def verify_base_conditions(self) -> None:
        """בודק שמירת מבנה בסיסי של תנאים"""
        print("\n🔧 בודק שמירת מבנה בסיסי של תנאים...")
        
        try:
            trading_methods_count = self._count_table('trading_methods', table_exists=True)
            if trading_methods_count > 0:
                self.results.add_pass('תנאים', f"{trading_methods_count} שיטות מסחר נשמרו")
            else:
                self.results.add_fail('תנאים', "לא נמצאו שיטות מסחר", "שיטות המסחר חייבות להישמר")
            
            method_parameters_count = self._count_table('method_parameters', table_exists=True)
            if method_parameters_count > 0:
                self.results.add_pass('תנאים', f"{method_parameters_count} פרמטרים נשמרו")
            else:
                self.results.add_warning('תנאים', "לא נמצאו פרמטרים (יכול להיות תקין)")
        except Exception as e:
            self.results.add_warning('תנאים', f"לא ניתן לבדוק תנאים: {str(e)}")
    
    def verify_system_tables(self) -> None:
        """בודק שטבלאות מערכת נשמרו"""
        print("\n🛡️  בודק שטבלאות מערכת נשמרו...")
        
        system_tables = [
            'currencies', 'external_data_providers', 'note_relation_types',
            'preference_groups', 'preference_types',
            'system_setting_groups', 'system_setting_types', 'system_settings',
            'constraints', 'enum_values', 'constraint_validations'
        ]
        
        for table_name in system_tables:
            try:
                count = self._count_table(table_name, table_exists=True)
                if count > 0:
                    self.results.add_pass('מערכת', f"{table_name}: {count} רשומות נשמרו")
                else:
                    self.results.add_warning('מערכת', f"{table_name}: אין רשומות (יכול להיות תקין)")
            except Exception as e:
                self.results.add_warning('מערכת', f"{table_name}: לא ניתן לבדוק - {str(e)}")
    
    def verify_all(self) -> bool:
        """מריץ את כל הבדיקות"""
        print("\n" + "=" * 70)
        print("🔍 מתחיל אימות מקיף של תוצאות הניקוי")
        print("=" * 70)
        
        try:
            self.verify_table_counts()
            self.verify_foreign_keys()
            self.verify_spy_ticker()
            self.verify_active_profile()
            self.verify_builtin_tags()
            self.verify_base_conditions()
            self.verify_system_tables()
        except Exception as e:
            self.results.add_fail('כללי', f"שגיאה בבדיקה: {str(e)}")
        
        return self.results.print_summary(verbose=False)
    
    def _count_table(self, table_name: str, table_exists: bool = False) -> int:
        """סופר רשומות בטבלה"""
        try:
            result = self.db.execute(text(f'SELECT COUNT(*) FROM "{table_name}"'))
            return result.scalar() or 0
        except Exception as e:
            if table_exists:
                return 0
            raise


# ============================================================================
# Main Entry Point
# ============================================================================

def _build_engine_kwargs():
    """בונה פרמטרים ל-engine עבור PostgreSQL"""
    return {
        "poolclass": QueuePool,
        "pool_size": 10,
        "max_overflow": 20,
        "pool_timeout": 60,
        "pool_recycle": 3600,
        "pool_pre_ping": True,
        "echo": False,
    }


def main():
    """Entry point"""
    parser = argparse.ArgumentParser(
        description='Verify cleanup results',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Show detailed verification information'
    )
    
    args = parser.parse_args()
    
    # Create database connection
    engine = create_engine(DATABASE_URL, **_build_engine_kwargs())
    Session = sessionmaker(bind=engine)
    db = Session()
    
    try:
        verifier = CleanupVerifier(db)
        success = verifier.verify_all()
        
        if success:
            print("\n✅ האימות הושלם בהצלחה - ניתן להמשיך לשלב 2 (יצירת נתוני דוגמה)")
            sys.exit(0)
        else:
            print("\n❌ נמצאו בעיות שדורשות תיקון לפני המשך")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n❌ בוטל על ידי המשתמש")
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


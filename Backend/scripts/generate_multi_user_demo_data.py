#!/usr/bin/env python3
"""
TikTrack Multi-User Demo Data Generation Script
===============================================

Generates demo data for all users in the system according to the
MULTI_USER_DATA_DISTRIBUTION.md specification.

This script creates data for:
- user: Full demo data (120 trade plans, 80 trades, 50 tickers, etc.)
- admin: Limited demo data (20 trade plans, 15 trades, 10 tickers, etc.)
- nimrod: No data (clean user)

Usage:
    python3 Backend/scripts/generate_multi_user_demo_data.py [--dry-run] [--verbose]

Options:
    --dry-run: Validate schema only, don't create data
    --verbose: Show detailed progress information

Author: TikTrack Development Team
Version: 1.0.0
Date: January 2025

Documentation:
    See documentation/05-REPORTS/MULTI_USER_DATA_DISTRIBUTION.md for full guide
"""

import sys
import os
import argparse
from typing import Dict, Any

# Add Backend to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool

from config.settings import DATABASE_URL

# Import from generate_demo_data module
# Add the scripts directory to path to import generate_demo_data
scripts_dir = os.path.dirname(os.path.abspath(__file__))
if scripts_dir not in sys.path:
    sys.path.insert(0, scripts_dir)

# Import directly from the module file
from generate_demo_data import DemoDataGenerator, DatabaseValidator, SchemaValidationError, DataGenerationError

# ============================================================================
# User Configurations
# ============================================================================

# Configuration for 'user' - Full demo data
USER_FULL_CONFIG = {
    'trading_accounts': {
        'count': 2,
        'primary_account_activity_percent': 70,
        'primary_account_swing_only': True
    },
    'tickers': {
        'count': 50,
        'usd_percent': 90,
        'other_currencies': ['ILS', 'EUR']
    },
    'trade_plans': {
        'count': 120,
        'swing_percent': 50,
        'long_percent': 90
    },
    'trades': {
        'count': 80,
        'from_plans_percent': 70
    },
    'watch_lists': {
        'count': 3
    },
    'time_distribution': {
        'last_6_months_percent': 40,
        'last_3_months_of_6_percent': 70,
        'total_years_back': 2
    }
}

# Configuration for 'admin' - Limited demo data
ADMIN_LIMITED_CONFIG = {
    'trading_accounts': {
        'count': 1,
        'primary_account_activity_percent': 100,
        'primary_account_swing_only': False
    },
    'tickers': {
        'count': 10,
        'usd_percent': 100,
        'other_currencies': []
    },
    'trade_plans': {
        'count': 20,
        'swing_percent': 50,
        'long_percent': 90
    },
    'trades': {
        'count': 15,
        'from_plans_percent': 70
    },
    'watch_lists': {
        'count': 2
    },
    'time_distribution': {
        'last_6_months_percent': 40,
        'last_3_months_of_6_percent': 70,
        'total_years_back': 2
    }
}

# Configuration mapping
USER_CONFIGS = {
    'user': USER_FULL_CONFIG,
    'admin': ADMIN_LIMITED_CONFIG,
    'nimrod': None  # No data for nimrod
}

# ============================================================================
# Multi-User Data Generator
# ============================================================================

def generate_for_user(db: Session, username: str, config: Dict[str, Any], dry_run: bool = False, verbose: bool = False) -> Dict[str, int]:
    """Generates demo data for a specific user"""
    print(f"\n{'=' * 70}")
    print(f"👤 יוצר נתונים עבור משתמש: {username}")
    print(f"{'=' * 70}")
    
    generator = DemoDataGenerator(db, config, dry_run=dry_run, verbose=verbose, username=username)
    results = generator.generate_all()
    
    return results

def _build_engine_kwargs():
    """Builds engine kwargs based on database type"""
    kwargs = {
        "poolclass": QueuePool,
        "pool_size": 10,
        "max_overflow": 20,
        "pool_pre_ping": True,
        "echo": False,
    }
    
    # PostgreSQL only - no SQLite support
    return kwargs

def main():
    """Entry point"""
    parser = argparse.ArgumentParser(
        description='Generate multi-user demo data for TikTrack system',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Validate schema only, do not create data'
    )
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Show detailed progress information'
    )
    
    args = parser.parse_args()
    
    print("=" * 70)
    print("🎨 TikTrack - יצירת נתוני דוגמה לכל המשתמשים")
    print("=" * 70)
    print()
    
    # Create database connection
    engine = create_engine(DATABASE_URL, **_build_engine_kwargs())
    Session = sessionmaker(bind=engine)
    db = Session()
    
    try:
        # Validate schema
        validator = DatabaseValidator(db)
        validator.validate()
        
        if args.dry_run:
            print("\n✅ אימות הצליח - מבנה DB תקין")
            print("\n📋 המשתמשים שיקבלו נתונים:")
            for username, config in USER_CONFIGS.items():
                if config is None:
                    print(f"   - {username}: ללא נתונים (נקי)")
                else:
                    print(f"   - {username}: {config['trade_plans']['count']} תוכניות, {config['trades']['count']} טריידים, {config['tickers']['count']} טיקרים")
            return
        
        # Generate data for each user
        all_results = {}
        
        for username, config in USER_CONFIGS.items():
            if config is None:
                # Skip nimrod - no data
                print(f"\n⏭️  מדלג על משתמש '{username}' - ללא נתונים (נקי)")
                continue
            
            try:
                results = generate_for_user(db, username, config, dry_run=args.dry_run, verbose=args.verbose)
                all_results[username] = results
                
                # Commit after each user
                db.commit()
                
            except DataGenerationError as e:
                print(f"\n❌ שגיאה ביצירת נתונים עבור משתמש '{username}':")
                print(str(e))
                db.rollback()
                # Continue with next user
                continue
        
        # Load external market data for all tickers (after all users)
        print("\n" + "=" * 70)
        print("📡 טוען נתוני שוק חיצוניים ראשוניים לכל הטיקרים...")
        print("=" * 70)
        
        try:
            from scripts.load_market_data_for_tickers import MarketDataLoader
            
            loader = MarketDataLoader(db, dry_run=args.dry_run)
            loader.load_data_for_all_tickers()  # Load for all tickers
            loader.print_summary()
            
        except ImportError as e:
            print(f"   ⚠️  לא ניתן לייבא את MarketDataLoader: {e}")
            print(f"      ודא שהסקריפט load_market_data_for_tickers.py קיים")
        except Exception as e:
            print(f"   ⚠️  שגיאה בטעינת נתונים חיצוניים: {e}")
            if args.verbose:
                import traceback
                traceback.print_exc()
            # Don't fail the entire process if external data loading fails
        
        # Final summary
        print("\n" + "=" * 70)
        print("✅ יצירת נתוני דוגמה לכל המשתמשים הושלמה!")
        print("=" * 70)
        print("\n📊 סיכום לפי משתמש:")
        
        for username, results in all_results.items():
            print(f"\n   👤 משתמש: {username}")
            for entity, count in results.items():
                print(f"      - {entity}: {count}")
        
        print("\n" + "=" * 70)
        
    except SchemaValidationError as e:
        print(f"\n❌ שגיאת אימות מבנה:")
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


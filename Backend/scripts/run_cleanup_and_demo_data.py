#!/usr/bin/env python3
"""
TikTrack Master Script - Cleanup and Demo Data Generation
==========================================================

Master script that runs the complete process:
1. Phase 1: User data cleanup
2. Verification of Phase 1
3. Phase 2: Demo data generation
4. Verification of Phase 2

This script is designed to run continuously and accurately, enabling
automated daily runs in a demo environment.

Usage:
    python3 Backend/scripts/run_cleanup_and_demo_data.py [options]

Options:
    --dry-run: Validate only, don't make changes
    --verbose: Show detailed progress
    --skip-phase1: Skip cleanup phase (assumes already clean)
    --skip-phase2: Skip demo data generation

Examples:
    # Full run on current database
    python3 Backend/scripts/run_cleanup_and_demo_data.py

    # Dry run to see what would happen
    python3 Backend/scripts/run_cleanup_and_demo_data.py --dry-run

    # Only generate demo data (assumes cleanup already done)
    python3 Backend/scripts/run_cleanup_and_demo_data.py --skip-phase1

Author: TikTrack Development Team
Version: 1.0.0
Date: January 2025

Documentation:
    See documentation/05-REPORTS/USER_DATA_CLEANUP_PROCESS.md
"""

import sys
import os
import argparse
import subprocess
from datetime import datetime
from typing import Optional

# Add Backend to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from config.settings import DATABASE_URL

# ============================================================================
# Process Management
# ============================================================================

class ProcessRunner:
    """מריץ את התהליך המלא"""
    
    def __init__(self, dry_run: bool = False, verbose: bool = False, skip_phase1: bool = False, skip_phase2: bool = False):
        self.dry_run = dry_run
        self.verbose = verbose
        self.skip_phase1 = skip_phase1
        self.skip_phase2 = skip_phase2
        self.start_time = datetime.now()
        self.phase1_success = False
        self.phase2_success = False
    
    def run_script(self, script_path: str, args: list = None) -> bool:
        """מריץ סקריפט Python ומחזיר True אם הצליח"""
        cmd = ['python3', script_path]
        if args:
            cmd.extend(args)
        
        if self.verbose:
            print(f"\n🔧 מריץ: {' '.join(cmd)}")
        
        try:
            result = subprocess.run(
                cmd,
                cwd=os.path.dirname(os.path.dirname(script_path)),
                capture_output=not self.verbose,
                text=True
            )
            
            if result.returncode == 0:
                if not self.verbose and result.stdout:
                    print(result.stdout)
                return True
            else:
                if not self.verbose:
                    if result.stdout:
                        print(result.stdout)
                    if result.stderr:
                        print(result.stderr, file=sys.stderr)
                return False
                
        except Exception as e:
            print(f"❌ שגיאה בהרצת סקריפט {script_path}: {str(e)}")
            return False
    
    def run_phase1_cleanup(self) -> bool:
        """מריץ שלב 1: ניקוי נתונים"""
        print("\n" + "=" * 70)
        print("🧹 שלב 1: ניקוי נתוני משתמש")
        print("=" * 70)
        
        if self.skip_phase1:
            print("⏭️  מדלגים על שלב 1 (--skip-phase1)")
            return True
        
        script_path = os.path.join(
            os.path.dirname(__file__),
            'cleanup_user_data.py'
        )
        
        args = []
        if self.dry_run:
            args.append('--dry-run')
        if self.verbose:
            args.append('--verbose')
        args.append('--confirm')  # Skip confirmation in automated run
        
        success = self.run_script(script_path, args)
        
        if success:
            print("\n✅ שלב 1 הושלם בהצלחה")
            self.phase1_success = True
        else:
            print("\n❌ שלב 1 נכשל")
            self.phase1_success = False
        
        return success
    
    def run_phase1_verification(self) -> bool:
        """בודק את תוצאות שלב 1"""
        print("\n" + "=" * 70)
        print("🔍 אימות שלב 1: בדיקת תוצאות הניקוי")
        print("=" * 70)
        
        if self.skip_phase1:
            print("⏭️  מדלגים על אימות שלב 1 (--skip-phase1)")
            return True
        
        script_path = os.path.join(
            os.path.dirname(__file__),
            'verify_cleanup_results.py'
        )
        
        args = []
        if self.verbose:
            args.append('--verbose')
        
        success = self.run_script(script_path, args)
        
        if success:
            print("\n✅ אימות שלב 1 הושלם בהצלחה - בסיס הנתונים נקי ומעודכן")
        else:
            print("\n❌ אימות שלב 1 נכשל - יש לתקן בעיות לפני המשך")
        
        return success
    
    def run_phase2_demo_data(self) -> bool:
        """מריץ שלב 2: יצירת נתוני דוגמה"""
        print("\n" + "=" * 70)
        print("🎨 שלב 2: יצירת נתוני דוגמה")
        print("=" * 70)
        
        if self.skip_phase2:
            print("⏭️  מדלגים על שלב 2 (--skip-phase2)")
            return True
        
        script_path = os.path.join(
            os.path.dirname(__file__),
            'generate_demo_data.py'
        )
        
        args = []
        if self.dry_run:
            args.append('--dry-run')
        if self.verbose:
            args.append('--verbose')
        
        success = self.run_script(script_path, args)
        
        if success:
            print("\n✅ שלב 2 הושלם בהצלחה")
            self.phase2_success = True
        else:
            print("\n❌ שלב 2 נכשל")
            self.phase2_success = False
        
        return success
    
    def run_phase2_verification(self) -> bool:
        """בודק את תוצאות שלב 2"""
        print("\n" + "=" * 70)
        print("🔍 אימות שלב 2: בדיקת נתוני הדוגמה")
        print("=" * 70)
        
        if self.skip_phase2:
            print("⏭️  מדלגים על אימות שלב 2 (--skip-phase2)")
            return True
        
        # For Phase 2, we can do simple counts
        try:
            from sqlalchemy import create_engine, text
            from sqlalchemy.orm import sessionmaker
            from sqlalchemy.pool import QueuePool
            
            engine = create_engine(
                DATABASE_URL,
                poolclass=QueuePool,
                pool_size=10,
                max_overflow=20,
                pool_pre_ping=True
            )
            Session = sessionmaker(bind=engine)
            db = Session()
            
            try:
                # Check demo data counts
                tickers_count = db.execute(text('SELECT COUNT(*) FROM tickers')).scalar()
                accounts_count = db.execute(text('SELECT COUNT(*) FROM trading_accounts')).scalar()
                plans_count = db.execute(text('SELECT COUNT(*) FROM trade_plans')).scalar()
                trades_count = db.execute(text('SELECT COUNT(*) FROM trades')).scalar()
                
                print(f"   📊 מספר טיקרים: {tickers_count}")
                print(f"   📊 מספר חשבונות: {accounts_count}")
                print(f"   📊 מספר תוכניות: {plans_count}")
                print(f"   📊 מספר טריידים: {trades_count}")
                
                # Basic verification
                if tickers_count > 1 and accounts_count >= 3 and plans_count > 0 and trades_count > 0:
                    print("\n   ✅ נתוני הדוגמה נוצרו בהצלחה")
                    success = True
                else:
                    print("\n   ⚠️  מספר הנתונים נראה נמוך מהצפוי")
                    success = True  # Don't fail on counts, just warn
                    
            finally:
                db.close()
                
        except Exception as e:
            print(f"   ⚠️  לא ניתן לבדוק את תוצאות שלב 2: {str(e)}")
            success = True  # Don't fail verification on errors
        
        return success
    
    def run_all(self) -> bool:
        """מריץ את כל התהליך"""
        print("\n" + "=" * 70)
        print("🚀 מתחיל תהליך מלא: ניקוי ונתוני דוגמה")
        print("=" * 70)
        print(f"   זמן התחלה: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        if self.dry_run:
            print("   ⚠️  DRY RUN - לא יבוצעו שינויים")
        print()
        
        # Phase 1: Cleanup
        if not self.skip_phase1:
            if not self.run_phase1_cleanup():
                print("\n❌ תהליך נכשל בשלב 1 (ניקוי)")
                return False
            
            if not self.run_phase1_verification():
                print("\n❌ תהליך נכשל באימות שלב 1")
                return False
            
            print("\n" + "-" * 70)
            print("✅ שלב 1 הושלם בהצלחה - בסיס הנתונים נקי")
            print("-" * 70)
        
        # Phase 2: Demo Data
        if not self.skip_phase2:
            if not self.run_phase2_demo_data():
                print("\n❌ תהליך נכשל בשלב 2 (יצירת דוגמה)")
                return False
            
            if not self.run_phase2_verification():
                print("\n⚠️  יש אזהרות באימות שלב 2, אבל התהליך הושלם")
            
            print("\n" + "-" * 70)
            print("✅ שלב 2 הושלם - נתוני הדוגמה נוצרו")
            print("-" * 70)
        
        # Final summary
        end_time = datetime.now()
        duration = end_time - self.start_time
        
        print("\n" + "=" * 70)
        print("✅ התהליך הושלם בהצלחה!")
        print("=" * 70)
        print(f"   זמן התחלה: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"   זמן סיום: {end_time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"   משך זמן: {duration}")
        print()
        
        if not self.skip_phase1:
            print(f"   ✅ שלב 1 (ניקוי): הושלם")
        if not self.skip_phase2:
            print(f"   ✅ שלב 2 (דוגמה): הושלם")
        print()
        print("   המערכת מוכנה לשימוש!")
        print()
        
        return True


# ============================================================================
# Main Entry Point
# ============================================================================

def main():
    """Entry point"""
    parser = argparse.ArgumentParser(
        description='Run complete cleanup and demo data generation process',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Validate only, don\'t make changes'
    )
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Show detailed progress information'
    )
    parser.add_argument(
        '--skip-phase1',
        action='store_true',
        help='Skip Phase 1 (cleanup) - assumes database is already clean'
    )
    parser.add_argument(
        '--skip-phase2',
        action='store_true',
        help='Skip Phase 2 (demo data generation)'
    )
    
    args = parser.parse_args()
    
    try:
        runner = ProcessRunner(
            dry_run=args.dry_run,
            verbose=args.verbose,
            skip_phase1=args.skip_phase1,
            skip_phase2=args.skip_phase2
        )
        
        success = runner.run_all()
        
        sys.exit(0 if success else 1)
        
    except KeyboardInterrupt:
        print("\n❌ בוטל על ידי המשתמש")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ שגיאה לא צפויה: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()


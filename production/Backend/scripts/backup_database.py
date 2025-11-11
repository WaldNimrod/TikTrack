#!/usr/bin/env python3
"""
Database Backup Script - TikTrack
==================================

יצירת גיבוי מקיף לבסיס הנתונים כולל מבנה ונתונים
מטפל נכון ב-WAL files ו-consistency

Usage:
    python3 Backend/scripts/backup_database.py [--output-dir PATH]
"""

import sqlite3
import os
import shutil
import sys
from pathlib import Path
from datetime import datetime
import argparse

from config.settings import DB_PATH

def get_db_info(db_path):
    """קבלת מידע על בסיס הנתונים"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # גודל בסיס הנתונים
    db_size = os.path.getsize(db_path)
    
    # מצב journal
    cursor.execute("PRAGMA journal_mode")
    journal_mode = cursor.fetchone()[0]
    
    # מספר טבלאות
    cursor.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    table_count = cursor.fetchone()[0]
    
    # סה"כ רשומות (משוער)
    total_records = 0
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    for row in cursor.fetchall():
        try:
            cursor.execute(f'SELECT COUNT(*) FROM "{row[0]}"')
            count = cursor.fetchone()[0]
            total_records += count
        except:
            pass
    
    # WAL info
    wal_path = f"{db_path}-wal"
    shm_path = f"{db_path}-shm"
    wal_exists = os.path.exists(wal_path)
    wal_size = os.path.getsize(wal_path) if wal_exists else 0
    
    conn.close()
    
    return {
        'db_size': db_size,
        'journal_mode': journal_mode,
        'table_count': table_count,
        'total_records': total_records,
        'wal_exists': wal_exists,
        'wal_size': wal_size
    }

def checkpoint_wal(db_path):
    """ביצוע checkpoint של WAL לתוך DB"""
    print("🔄 מבצע checkpoint של WAL...")
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Passive checkpoint (לא חוסם)
        cursor.execute("PRAGMA wal_checkpoint(PASSIVE)")
        result = cursor.fetchone()
        
        if result and result[0] == 0:  # 0 = לא busy
            # Full checkpoint כדי לסנכרן הכל
            cursor.execute("PRAGMA wal_checkpoint(TRUNCATE)")
            result2 = cursor.fetchone()
            print(f"   ✓ Checkpoint: log_size={result[1]}, checkpointed={result[2]}")
            if result2 and result2[0] == 0:
                print(f"   ✓ Truncate checkpoint: log_size={result2[1]}, checkpointed={result2[2]}")
        else:
            print(f"   ⚠️  Database busy, checkpoint may be incomplete")
        
        conn.close()
        return True
    except Exception as e:
        print(f"   ❌ שגיאה ב-checkpoint: {e}")
        return False

def create_backup(db_path, output_dir=None, include_wal=False):
    """
    יצירת גיבוי מקיף של בסיס הנתונים
    
    Args:
        db_path: נתיב לבסיס הנתונים
        output_dir: תיקיית יעד (אם לא מצוין - תיקיית db/backups)
        include_wal: האם לכלול קבצי WAL/SHM (לא מומלץ בדרך כלל)
    """
    db_path = Path(db_path)
    
    if not db_path.exists():
        print(f"❌ בסיס הנתונים לא נמצא: {db_path}")
        return None
    
    # קביעת תיקיית יעד
    if output_dir:
        output_dir = Path(output_dir)
    else:
        output_dir = db_path.parent / "backups"
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # יצירת שם קובץ עם timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_name = f"{db_path.stem}_backup_{timestamp}.db"
    backup_path = output_dir / backup_name
    
    print("=" * 80)
    print("📦 יצירת גיבוי בסיס נתונים - TikTrack")
    print("=" * 80)
    print(f"\n📂 בסיס נתונים: {db_path}")
    print(f"📂 תיקיית גיבוי: {output_dir}")
    
    # מידע על בסיס הנתונים
    print("\n📊 מידע על בסיס הנתונים:")
    db_info = get_db_info(str(db_path))
    print(f"   - גודל: {db_info['db_size']:,} bytes ({db_info['db_size']/1024/1024:.2f} MB)")
    print(f"   - Journal mode: {db_info['journal_mode']}")
    print(f"   - מספר טבלאות: {db_info['table_count']}")
    print(f"   - סה\"כ רשומות: {db_info['total_records']:,}")
    if db_info['wal_exists']:
        print(f"   - WAL file: קיים ({db_info['wal_size']:,} bytes)")
    
    # Checkpoint לפני הגיבוי
    if db_info['journal_mode'] == 'wal':
        if not checkpoint_wal(str(db_path)):
            print("⚠️  Checkpoint נכשל, אך ממשיך עם הגיבוי...")
    
    # יצירת הגיבוי
    print(f"\n💾 יוצר גיבוי: {backup_path}")
    
    try:
        # שימוש ב-sqlite3 backup API (יותר בטוח מ-copy)
        source_conn = sqlite3.connect(str(db_path))
        
        # יצירת בסיס נתונים ריק לגיבוי
        backup_conn = sqlite3.connect(str(backup_path))
        
        # העתקת כל הנתונים
        source_conn.backup(backup_conn, pages=1, progress=None)
        
        backup_conn.close()
        source_conn.close()
        
        # אימות הגיבוי
        backup_size = os.path.getsize(backup_path)
        print(f"   ✓ גיבוי נוצר בהצלחה!")
        print(f"   - גודל: {backup_size:,} bytes ({backup_size/1024/1024:.2f} MB)")
        
        # בדיקה שהגיבוי תקין
        print("\n🔍 בודק תקינות הגיבוי...")
        test_conn = sqlite3.connect(str(backup_path))
        test_cursor = test_conn.cursor()
        
        # בדיקת מספר טבלאות
        test_cursor.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        backup_table_count = test_cursor.fetchone()[0]
        
        # בדיקת מספר רשומות (דוגמא)
        test_cursor.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        test_cursor.execute("SELECT COUNT(*) FROM alerts")
        alerts_count = test_cursor.fetchone()[0]
        
        test_conn.close()
        
        print(f"   ✓ מספר טבלאות: {backup_table_count}")
        print(f"   ✓ דוגמא: alerts table - {alerts_count} רשומות")
        
        if backup_table_count == db_info['table_count']:
            print("   ✅ הגיבוי תקין!")
        else:
            print(f"   ⚠️  מספר טבלאות שונה: {backup_table_count} vs {db_info['table_count']}")
        
        # אם צריך, העתק גם קבצי WAL/SHM
        if include_wal:
            wal_path = Path(f"{db_path}-wal")
            shm_path = Path(f"{db_path}-shm")
            
            if wal_path.exists():
                shutil.copy2(wal_path, output_dir / f"{backup_name}-wal")
                print(f"   ✓ הועתק WAL file")
            if shm_path.exists():
                shutil.copy2(shm_path, output_dir / f"{backup_name}-shm")
                print(f"   ✓ הועתק SHM file")
        
        print("\n" + "=" * 80)
        print(f"✅ גיבוי הושלם בהצלחה!")
        print(f"📁 נתיב: {backup_path}")
        print("=" * 80)
        
        return str(backup_path)
        
    except Exception as e:
        print(f"\n❌ שגיאה ביצירת הגיבוי: {e}")
        if backup_path.exists():
            backup_path.unlink()
        return None

def main():
    parser = argparse.ArgumentParser(description='יצירת גיבוי מקיף לבסיס הנתונים')
    parser.add_argument('--db-path', type=str, default=None,
                       help='נתיב לבסיס הנתונים (default: production/Backend/db/tiktrack.db)')
    parser.add_argument('--output-dir', type=str, default=None,
                       help='תיקיית יעד לגיבוי (default: Backend/db/backups)')
    parser.add_argument('--include-wal', action='store_true',
                       help='כלול קבצי WAL/SHM בגיבוי (לא מומלץ)')
    
    args = parser.parse_args()
    
    # קביעת נתיב בסיס הנתונים
    if args.db_path:
        db_path = Path(args.db_path)
    else:
        db_path = Path(DB_PATH)
    
    if not db_path.exists():
        print(f"❌ בסיס הנתונים לא נמצא: {db_path}")
        sys.exit(1)
    
    # יצירת הגיבוי
    backup_path = create_backup(
        db_path,
        output_dir=args.output_dir,
        include_wal=args.include_wal
    )
    
    if backup_path:
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()



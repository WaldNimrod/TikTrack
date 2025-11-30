#!/usr/bin/env python3
"""
מחיקת הערות והתראות ישנות לא רלוונטיות

סקריפט זה מוחק הערות והתראות ישנות עם תוכן לא רלוונטי או לא מרשים,
כדי לאפשר ליצור הערות והתראות חדשות ומרשימות יותר.

Usage:
    python3 Backend/scripts/cleanup_old_notes_and_alerts.py [--dry-run]
"""

import sys
import os
import argparse

# Add Backend to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool

from config.settings import DATABASE_URL

# Patterns of content to delete (not impressive or irrelevant)
IRRELEVANT_NOTE_PATTERNS = [
    'אחלה הערה',
    'ככככ',
    'הערה על',  # Generic notes without real content
]

IRRELEVANT_ALERT_PATTERNS = [
    'SP5C',  # Old ticker that was replaced
    'התראה על',  # Generic alerts
]

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

def cleanup_old_notes_and_alerts(db: Session, dry_run: bool = False) -> dict:
    """מוחק הערות והתראות ישנות לא רלוונטיות"""
    
    print("=" * 70)
    print("🧹 ניקוי הערות והתראות ישנות לא רלוונטיות")
    print("=" * 70)
    print()
    
    stats = {
        'notes_deleted': 0,
        'alerts_deleted': 0,
        'notes_kept': 0,
        'alerts_kept': 0
    }
    
    # Find notes to delete
    print("📝 בודק הערות...")
    all_notes = db.execute(text('''
        SELECT id, content
        FROM notes
    ''')).fetchall()
    
    notes_to_delete = []
    for note_id, content in all_notes:
        should_delete = False
        content_lower = (content or '').lower()
        
        for pattern in IRRELEVANT_NOTE_PATTERNS:
            if pattern.lower() in content_lower:
                should_delete = True
                break
        
        # Also delete very short notes (less than 20 characters)
        if content and len(content.strip()) < 20:
            should_delete = True
        
        if should_delete:
            notes_to_delete.append(note_id)
        else:
            stats['notes_kept'] += 1
    
    print(f"   נמצאו {len(notes_to_delete)} הערות למחיקה")
    print(f"   יישמרו {stats['notes_kept']} הערות")
    
    if notes_to_delete:
        if not dry_run:
            # Delete notes
            for note_id in notes_to_delete:
                db.execute(text('DELETE FROM notes WHERE id = :id'), {'id': note_id})
                stats['notes_deleted'] += 1
            db.commit()
            print(f"   ✅ נמחקו {stats['notes_deleted']} הערות")
        else:
            stats['notes_deleted'] = len(notes_to_delete)
            print(f"   🔍 DRY RUN - היה נמחק {stats['notes_deleted']} הערות")
    
    print()
    
    # Find alerts to delete
    print("🔔 בודק התראות...")
    all_alerts = db.execute(text('''
        SELECT id, message
        FROM alerts
    ''')).fetchall()
    
    alerts_to_delete = []
    for alert_id, message in all_alerts:
        should_delete = False
        message_lower = (message or '').lower()
        
        for pattern in IRRELEVANT_ALERT_PATTERNS:
            if pattern.lower() in message_lower:
                should_delete = True
                break
        
        # Also delete very short alerts (less than 10 characters)
        if message and len(message.strip()) < 10:
            should_delete = True
        
        if should_delete:
            alerts_to_delete.append(alert_id)
        else:
            stats['alerts_kept'] += 1
    
    print(f"   נמצאו {len(alerts_to_delete)} התראות למחיקה")
    print(f"   יישמרו {stats['alerts_kept']} התראות")
    
    if alerts_to_delete:
        if not dry_run:
            # Delete alerts
            for alert_id in alerts_to_delete:
                db.execute(text('DELETE FROM alerts WHERE id = :id'), {'id': alert_id})
                stats['alerts_deleted'] += 1
            db.commit()
            print(f"   ✅ נמחקו {stats['alerts_deleted']} התראות")
        else:
            stats['alerts_deleted'] = len(alerts_to_delete)
            print(f"   🔍 DRY RUN - היה נמחק {stats['alerts_deleted']} התראות")
    
    print()
    print("=" * 70)
    print("📊 סיכום:")
    print("=" * 70)
    print(f"   הערות שנמחקו: {stats['notes_deleted']}")
    print(f"   הערות שנשמרו: {stats['notes_kept']}")
    print(f"   התראות שנמחקו: {stats['alerts_deleted']}")
    print(f"   התראות שנשמרו: {stats['alerts_kept']}")
    print()
    
    return stats

def main():
    parser = argparse.ArgumentParser(
        description='Cleanup old notes and alerts',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be done without making changes.'
    )
    
    args = parser.parse_args()
    
    # Create database connection
    engine = create_engine(DATABASE_URL, **_build_engine_kwargs())
    Session = sessionmaker(bind=engine)
    db = Session()
    
    try:
        stats = cleanup_old_notes_and_alerts(db, dry_run=args.dry_run)
        sys.exit(0)
    except Exception as e:
        print(f"❌ שגיאה: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()


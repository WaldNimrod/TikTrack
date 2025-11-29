#!/usr/bin/env python3
"""
Check Email Logs - TikTrack
בדיקת לוגי מיילים

This script checks the email logs in the database.

Author: TikTrack Development Team
Version: 1.0.0
Last Updated: January 28, 2025
"""

import sys
from pathlib import Path

# Add Backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from sqlalchemy.orm import Session
from config.database import SessionLocal
from models.email_log import EmailLog
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def check_email_logs():
    """
    Check email logs in the database
    """
    print("=" * 70)
    print("📧 בדיקת לוגי מיילים")
    print("=" * 70)
    print()
    
    db: Session = SessionLocal()
    try:
        # Get all email logs, ordered by most recent first
        logs = db.query(EmailLog).order_by(EmailLog.created_at.desc()).limit(10).all()
        
        if not logs:
            print("📭 אין לוגי מיילים במסד הנתונים")
            return
        
        print(f"📊 נמצאו {len(logs)} לוגי מיילים (10 האחרונים):")
        print()
        
        for i, log in enumerate(logs, 1):
            status_icon = "✅" if log.status == "success" else "❌"
            print(f"{i}. {status_icon} {log.recipient}")
            print(f"   Subject: {log.subject}")
            print(f"   Status: {log.status}")
            print(f"   Type: {log.email_type or 'N/A'}")
            print(f"   Created: {log.created_at.strftime('%Y-%m-%d %H:%M:%S')}")
            if log.error_message:
                print(f"   Error: {log.error_message[:80]}...")
            print()
        
        # Summary
        success_count = sum(1 for log in logs if log.status == "success")
        failed_count = sum(1 for log in logs if log.status == "failed")
        
        print("=" * 70)
        print(f"📊 סיכום: {success_count} הצליחו, {failed_count} נכשלו")
        print("=" * 70)
        
    except Exception as e:
        logger.error(f"❌ שגיאה: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == '__main__':
    check_email_logs()


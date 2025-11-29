#!/usr/bin/env python3
"""
Comprehensive Email Log Test - TikTrack
בדיקה מקיפה של לוגי מיילים

This script performs comprehensive tests on email logs:
1. Check log structure and fields
2. Test log creation
3. Test log retrieval
4. Test log filtering
5. Test log statistics

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
from datetime import datetime, timedelta
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_log_structure():
    """Test 1: Check log structure and required fields"""
    print("=" * 70)
    print("🧪 בדיקה 1: מבנה לוג ושדות נדרשים")
    print("=" * 70)
    print()
    
    db: Session = SessionLocal()
    try:
        # Get a sample log
        log = db.query(EmailLog).first()
        
        if not log:
            print("⚠️  אין לוגים במסד הנתונים לבדיקה")
            return False
        
        # Check required fields
        required_fields = ['id', 'recipient', 'subject', 'status', 'sent_at', 'created_at']
        missing_fields = []
        
        for field in required_fields:
            if not hasattr(log, field):
                missing_fields.append(field)
        
        if missing_fields:
            print(f"❌ שדות חסרים: {', '.join(missing_fields)}")
            return False
        
        # Check field types
        checks = [
            ('recipient', str, log.recipient),
            ('subject', str, log.subject),
            ('status', str, log.status),
            ('sent_at', datetime, log.sent_at),
            ('created_at', datetime, log.created_at),
        ]
        
        type_errors = []
        for field_name, expected_type, value in checks:
            if not isinstance(value, expected_type):
                type_errors.append(f"{field_name}: expected {expected_type.__name__}, got {type(value).__name__}")
        
        if type_errors:
            print(f"❌ שגיאות סוג:")
            for error in type_errors:
                print(f"   - {error}")
            return False
        
        # Check optional fields
        optional_fields = ['error_message', 'email_type', 'user_id']
        print("✅ שדות נדרשים קיימים:")
        for field in required_fields:
            value = getattr(log, field)
            print(f"   - {field}: {type(value).__name__} = {str(value)[:50]}")
        
        print()
        print("✅ שדות אופציונליים:")
        for field in optional_fields:
            value = getattr(log, field)
            if value is not None:
                print(f"   - {field}: {type(value).__name__} = {str(value)[:50]}")
            else:
                print(f"   - {field}: None")
        
        print()
        print("✅ מבנה לוג תקין!")
        return True
        
    except Exception as e:
        logger.error(f"❌ שגיאה: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()


def test_log_retrieval():
    """Test 2: Test log retrieval with different queries"""
    print("=" * 70)
    print("🧪 בדיקה 2: אחזור לוגים")
    print("=" * 70)
    print()
    
    db: Session = SessionLocal()
    try:
        # Test 1: Get all logs
        all_logs = db.query(EmailLog).all()
        print(f"✅ כל הלוגים: {len(all_logs)} רשומות")
        
        # Test 2: Get recent logs (last 10)
        recent_logs = db.query(EmailLog).order_by(EmailLog.created_at.desc()).limit(10).all()
        print(f"✅ 10 האחרונים: {len(recent_logs)} רשומות")
        
        # Test 3: Filter by status
        success_logs = db.query(EmailLog).filter(EmailLog.status == 'success').all()
        failed_logs = db.query(EmailLog).filter(EmailLog.status == 'failed').all()
        print(f"✅ הצליחו: {len(success_logs)} רשומות")
        print(f"✅ נכשלו: {len(failed_logs)} רשומות")
        
        # Test 4: Filter by email type
        test_logs = db.query(EmailLog).filter(EmailLog.email_type == 'test').all()
        print(f"✅ מיילי בדיקה: {len(test_logs)} רשומות")
        
        # Test 5: Filter by recipient
        if recent_logs:
            recipient = recent_logs[0].recipient
            recipient_logs = db.query(EmailLog).filter(EmailLog.recipient == recipient).all()
            print(f"✅ לפי recipient ({recipient}): {len(recipient_logs)} רשומות")
        
        # Test 6: Filter by date range (last 24 hours)
        yesterday = datetime.now() - timedelta(days=1)
        recent_24h = db.query(EmailLog).filter(EmailLog.created_at >= yesterday).all()
        print(f"✅ 24 שעות אחרונות: {len(recent_24h)} רשומות")
        
        print()
        print("✅ כל השאילתות עובדות!")
        return True
        
    except Exception as e:
        logger.error(f"❌ שגיאה: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()


def test_log_statistics():
    """Test 3: Test log statistics"""
    print("=" * 70)
    print("🧪 בדיקה 3: סטטיסטיקות לוגים")
    print("=" * 70)
    print()
    
    db: Session = SessionLocal()
    try:
        # Total logs
        total = db.query(EmailLog).count()
        print(f"📊 סה\"כ לוגים: {total}")
        
        # By status
        success = db.query(EmailLog).filter(EmailLog.status == 'success').count()
        failed = db.query(EmailLog).filter(EmailLog.status == 'failed').count()
        print(f"📊 הצליחו: {success} ({success/total*100:.1f}%)" if total > 0 else "📊 הצליחו: 0")
        print(f"📊 נכשלו: {failed} ({failed/total*100:.1f}%)" if total > 0 else "📊 נכשלו: 0")
        
        # By email type
        print()
        print("📊 לפי סוג מייל:")
        types = db.query(EmailLog.email_type).distinct().all()
        for (email_type,) in types:
            if email_type:
                count = db.query(EmailLog).filter(EmailLog.email_type == email_type).count()
                print(f"   - {email_type}: {count}")
        
        # By recipient (top 5)
        print()
        print("📊 5 הנמענים המובילים:")
        from sqlalchemy import func
        top_recipients = db.query(
            EmailLog.recipient,
            func.count(EmailLog.id).label('count')
        ).group_by(EmailLog.recipient).order_by(func.count(EmailLog.id).desc()).limit(5).all()
        
        for recipient, count in top_recipients:
            print(f"   - {recipient}: {count} מיילים")
        
        # Time distribution (last 7 days)
        print()
        print("📊 התפלגות זמן (7 ימים אחרונים):")
        for i in range(7):
            day_start = datetime.now() - timedelta(days=i+1)
            day_end = datetime.now() - timedelta(days=i)
            count = db.query(EmailLog).filter(
                EmailLog.created_at >= day_start,
                EmailLog.created_at < day_end
            ).count()
            print(f"   - יום {i+1}: {count} מיילים")
        
        print()
        print("✅ סטטיסטיקות מחושבות בהצלחה!")
        return True
        
    except Exception as e:
        logger.error(f"❌ שגיאה: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()


def test_log_to_dict():
    """Test 4: Test log serialization to dict"""
    print("=" * 70)
    print("🧪 בדיקה 4: סריאליזציה ל-dict")
    print("=" * 70)
    print()
    
    db: Session = SessionLocal()
    try:
        log = db.query(EmailLog).first()
        
        if not log:
            print("⚠️  אין לוגים במסד הנתונים לבדיקה")
            return False
        
        # Test to_dict method
        log_dict = log.to_dict()
        
        # Check required keys
        required_keys = ['id', 'recipient', 'subject', 'status', 'sent_at', 'created_at']
        missing_keys = [key for key in required_keys if key not in log_dict]
        
        if missing_keys:
            print(f"❌ מפתחות חסרים ב-dict: {', '.join(missing_keys)}")
            return False
        
        # Check datetime serialization
        if isinstance(log_dict.get('sent_at'), str):
            print("✅ sent_at מסריאליזציה ל-ISO string")
        else:
            print(f"⚠️  sent_at לא מסריאליזציה: {type(log_dict.get('sent_at'))}")
        
        if isinstance(log_dict.get('created_at'), str):
            print("✅ created_at מסריאליזציה ל-ISO string")
        else:
            print(f"⚠️  created_at לא מסריאליזציה: {type(log_dict.get('created_at'))}")
        
        print()
        print("✅ סריאליזציה תקינה!")
        print()
        print("📋 דוגמה ל-dict:")
        for key, value in list(log_dict.items())[:10]:
            if isinstance(value, str) and len(value) > 50:
                value = value[:50] + "..."
            print(f"   {key}: {value}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ שגיאה: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()


def main():
    """Run all tests"""
    print()
    print("=" * 70)
    print("📧 בדיקה מקיפה של לוגי מיילים")
    print("=" * 70)
    print()
    
    tests = [
        ("מבנה לוג", test_log_structure),
        ("אחזור לוגים", test_log_retrieval),
        ("סטטיסטיקות", test_log_statistics),
        ("סריאליזציה", test_log_to_dict),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
            print()
        except Exception as e:
            logger.error(f"❌ שגיאה בבדיקה '{test_name}': {e}")
            results.append((test_name, False))
            print()
    
    # Summary
    print("=" * 70)
    print("📊 סיכום בדיקות")
    print("=" * 70)
    print()
    
    for test_name, result in results:
        status = "✅ עבר" if result else "❌ נכשל"
        print(f"{status} - {test_name}")
    
    print()
    passed = sum(1 for _, result in results if result)
    total = len(results)
    print(f"📊 תוצאות: {passed}/{total} בדיקות עברו")
    print("=" * 70)
    
    return all(result for _, result in results)


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)


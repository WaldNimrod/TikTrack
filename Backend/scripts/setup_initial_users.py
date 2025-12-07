#!/usr/bin/env python3
"""
Setup Initial Users Script
סקריפט להגדרת משתמשים ראשוניים במערכת

מגדיר:
1. נימרוד - מנהל ראשי (is_default=True)
2. admin - משתמש מנהל
3. user - משתמש רגיל
"""

import sys
import os
from pathlib import Path

# Add Backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from sqlalchemy import select, text
from config.database import get_db
from models.user import User
from services.auth_service import AuthService
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# הגדרת משתמשים
USERS_TO_CREATE = [
    {
        "username": "nimrod",
        "password": "nimw",
        "email": "nimrod@tiktrack.com",
        "first_name": "נימרוד",
        "last_name": "",
        "is_default": True,  # מנהל ראשי
        "description": "מנהל ראשי של המערכת"
    },
    {
        "username": "admin",
        "password": "admin123",
        "email": "admin@tiktrack.com",
        "first_name": "מנהל",
        "last_name": "מערכת",
        "is_default": False,
        "description": "משתמש מנהל"
    },
    {
        "username": "user",
        "password": "user123",
        "email": "user@tiktrack.com",
        "first_name": "משתמש",
        "last_name": "רגיל",
        "is_default": False,
        "description": "משתמש רגיל"
    }
]


def setup_initial_users():
    """הגדרת משתמשים ראשוניים במערכת"""
    logger.info("=" * 70)
    logger.info("התחלת הגדרת משתמשים ראשוניים")
    logger.info("=" * 70)
    
    db = None
    try:
        db = next(get_db())
        auth_service = AuthService()
        
        # איפוס sequence ל-1 לפני יצירת משתמשים (למקרה של בסיס נתונים חדש)
        try:
            db.execute(text("ALTER SEQUENCE users_id_seq RESTART WITH 1"))
            db.commit()
            logger.info("✅ אופס sequence של users ל-1")
        except Exception as seq_error:
            logger.warning(f"⚠️  לא הצלחתי לאפס sequence (אולי לא PostgreSQL?): {seq_error}")
            db.rollback()
        
        # מחיקת כל המשתמשים הקיימים (למקרה של יצירת בסיס נתונים חדש)
        existing_users_count = db.scalars(select(User)).all()
        if existing_users_count:
            logger.info(f"🧹 מוחק {len(existing_users_count)} משתמשים קיימים...")
            # Use TRUNCATE CASCADE to bypass foreign key constraints
            db.execute(text("TRUNCATE TABLE users CASCADE"))
            db.commit()
            logger.info("✅ כל המשתמשים נמחקו")
        
        # שלב 1: יצירת נימרוד כמנהל ראשי (ID: 1)
        logger.info("\n📋 שלב 1: יצירת נימרוד כמנהל ראשי (ID: 1)")
        logger.info("-" * 70)
        
        logger.info("   יוצר משתמש נימרוד...")
        nimrod_config = USERS_TO_CREATE[0]
        
        # יצירה ישירה עם ID מוגדר
        nimrod_user = User(
            id=1,  # Force ID to be 1
            username=nimrod_config["username"],
            email=nimrod_config["email"],
            first_name=nimrod_config["first_name"],
            last_name=nimrod_config["last_name"],
            is_active=True,
            is_default=True,
            updated_at=datetime.utcnow()
        )
        nimrod_user.set_password(nimrod_config["password"])
        db.add(nimrod_user)
        db.flush()  # Get the ID assigned
        logger.info(f"   ✅ נימרוד נוצר (ID: {nimrod_user.id})")
        
        # שלב 2: יצירת משתמשים נוספים (admin: ID 2, user: ID 3)
        logger.info("\n📋 שלב 2: יצירת משתמשים נוספים")
        logger.info("-" * 70)
        
        expected_id = 2  # Start from ID 2 (nimrod is 1)
        for user_config in USERS_TO_CREATE[1:]:  # דילוג על נימרוד שכבר טופל
            username = user_config["username"]
            
            try:
                logger.info(f"   יוצר משתמש '{username}' ({user_config['description']})...")
                # יצירה ישירה עם ID מוגדר
                new_user = User(
                    id=expected_id,  # Force sequential ID
                    username=user_config["username"],
                    email=user_config["email"],
                    first_name=user_config["first_name"],
                    last_name=user_config["last_name"],
                    is_active=True,
                    is_default=False,
                    updated_at=datetime.utcnow()
                )
                new_user.set_password(user_config["password"])
                db.add(new_user)
                db.flush()  # Get the ID assigned
                logger.info(f"   ✅ משתמש '{username}' נוצר בהצלחה (ID: {new_user.id})")
                expected_id += 1
            except Exception as e:
                logger.error(f"   ❌ שגיאה בטיפול במשתמש '{username}': {e}")
                db.rollback()  # Rollback במקרה של שגיאה
                return False
        
        # Commit all users
        db.commit()
        
        # תיקון sequence אחרי יצירת כל המשתמשים
        try:
            max_id = db.execute(text("SELECT COALESCE(MAX(id), 0) FROM users")).scalar() or 0
            if max_id > 0:
                db.execute(text(f"SELECT setval('users_id_seq', {max_id}, true)"))
                db.commit()
                logger.info(f"✅ תוקן sequence של users ל-{max_id}")
        except Exception as seq_error:
            logger.warning(f"⚠️  לא הצלחתי לתקן sequence: {seq_error}")
            db.rollback()
        
        # שלב 3: סיכום
        logger.info("\n📋 שלב 3: סיכום משתמשים")
        logger.info("-" * 70)
        
        all_users = db.scalars(select(User)).all()
        logger.info(f"\nסה\"כ משתמשים במערכת: {len(all_users)}")
        logger.info("\nרשימת משתמשים:")
        for user in all_users:
            role = "מנהל ראשי" if user.is_default else "משתמש רגיל"
            status = "פעיל" if user.is_active else "לא פעיל"
            logger.info(f"  • {user.username} ({user.first_name or ''} {user.last_name or ''}) - {role} - {status}")
        
        logger.info("\n" + "=" * 70)
        logger.info("✅ הגדרת משתמשים הושלמה בהצלחה!")
        logger.info("=" * 70)
        logger.info("\nפרטי התחברות:")
        logger.info("  מנהל ראשי: nimrod / nimw")
        logger.info("  מנהל: admin / admin123")
        logger.info("  משתמש: user / user123")
        logger.info("")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ שגיאה בהגדרת משתמשים: {e}")
        import traceback
        logger.error(traceback.format_exc())
        if db:
            db.rollback()
        return False
    finally:
        if db:
            db.close()


if __name__ == "__main__":
    success = setup_initial_users()
    sys.exit(0 if success else 1)


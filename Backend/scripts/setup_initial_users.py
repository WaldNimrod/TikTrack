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
        
        # תיקון sequence של PostgreSQL אם צריך
        try:
            max_id_result = db.execute(text("SELECT COALESCE(MAX(id), 0) FROM users"))
            max_id = max_id_result.scalar() or 0
            if max_id > 0:
                db.execute(text(f"SELECT setval('users_id_seq', {max_id}, true)"))
                db.commit()
                logger.info(f"✅ תוקן sequence של users ל-{max_id}")
        except Exception as seq_error:
            logger.warning(f"⚠️  לא הצלחתי לתקן sequence (אולי לא PostgreSQL?): {seq_error}")
            db.rollback()
        
        # שלב 1: בדיקה והגדרת נימרוד כמנהל ראשי
        logger.info("\n📋 שלב 1: הגדרת נימרוד כמנהל ראשי")
        logger.info("-" * 70)
        
        nimrod_user = db.scalars(
            select(User).where(User.username == "nimrod")
        ).first()
        
        if nimrod_user:
            logger.info("✅ משתמש נימרוד כבר קיים")
            # עדכון למנהל ראשי
            if not nimrod_user.is_default:
                logger.info("   מעדכן למנהל ראשי...")
                # הסרת is_default מכל המשתמשים האחרים
                db.query(User).update({User.is_default: False})
                nimrod_user.is_default = True
                nimrod_user.is_active = True
                db.commit()
                logger.info("   ✅ נימרוד עודכן למנהל ראשי")
            else:
                logger.info("   ✅ נימרוד כבר מוגדר כמנהל ראשי")
            
            # עדכון סיסמה אם צריך
            if not nimrod_user.check_password("nimw"):
                logger.info("   מעדכן סיסמה...")
                nimrod_user.set_password("nimw")
                db.commit()
                logger.info("   ✅ סיסמה עודכנה")
        else:
            logger.info("   יוצר משתמש נימרוד חדש...")
            # הסרת is_default מכל המשתמשים האחרים
            db.query(User).update({User.is_default: False})
            db.commit()
            
            # יצירת נימרוד
            result = auth_service.register_user(
                username="nimrod",
                password="nimw",
                email="nimrod@tiktrack.com",
                first_name="נימרוד",
                last_name=""
            )
            
            if result['success']:
                # הגדרת is_default
                nimrod_user = db.scalars(
                    select(User).where(User.username == "nimrod")
                ).first()
                if nimrod_user:
                    nimrod_user.is_default = True
                    db.commit()
                    logger.info("   ✅ נימרוד נוצר והוגדר כמנהל ראשי")
            else:
                logger.error(f"   ❌ שגיאה ביצירת נימרוד: {result.get('error')}")
                return False
        
        # שלב 2: יצירת משתמשים נוספים
        logger.info("\n📋 שלב 2: יצירת משתמשים נוספים")
        logger.info("-" * 70)
        
        for user_config in USERS_TO_CREATE[1:]:  # דילוג על נימרוד שכבר טופל
            username = user_config["username"]
            
            try:
                # בדיקה אם המשתמש כבר קיים
                existing_user = db.scalars(
                    select(User).where(User.username == username)
                ).first()
                
                if existing_user:
                    logger.info(f"✅ משתמש '{username}' כבר קיים - מדלג")
                    # עדכון סיסמה אם צריך
                    if not existing_user.check_password(user_config["password"]):
                        logger.info(f"   מעדכן סיסמה למשתמש '{username}'...")
                        existing_user.set_password(user_config["password"])
                        db.commit()
                        logger.info(f"   ✅ סיסמה עודכנה למשתמש '{username}'")
                else:
                    logger.info(f"   יוצר משתמש '{username}' ({user_config['description']})...")
                    # יצירה ישירה ב-db כדי להימנע מבעיות sequence
                    new_user = User(
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
                    db.commit()
                    db.refresh(new_user)
                    logger.info(f"   ✅ משתמש '{username}' נוצר בהצלחה (ID: {new_user.id})")
            except Exception as e:
                logger.error(f"   ❌ שגיאה בטיפול במשתמש '{username}': {e}")
                db.rollback()  # Rollback במקרה של שגיאה
                continue  # המשך למשתמש הבא
        
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


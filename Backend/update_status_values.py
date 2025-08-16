#!/usr/bin/env python3
"""
Update Status Values Script

This script updates all status values in the database to use the new Hebrew values:
- 'active' -> 'פתוח'
- 'inactive' -> 'סגור'
- 'open' -> 'פתוח'
- 'closed' -> 'סגור'
- 'cancelled' -> 'מבוטל'

Author: TikTrack Development Team
Version: 1.0
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from config.database import DATABASE_URL

def update_status_values():
    """Update all status values in the database to use Hebrew values."""
    
    # יצירת חיבור לבסיס הנתונים
    engine = create_engine(DATABASE_URL)
    
    try:
        with engine.connect() as conn:
            print("🔄 מתחיל עדכון ערכי סטטוס...")
            
            # עדכון טבלת accounts
            print("📝 מעדכן טבלת accounts...")
            conn.execute(text("""
                UPDATE accounts 
                SET status = CASE 
                    WHEN status = 'active' THEN 'פתוח'
                    WHEN status = 'inactive' THEN 'סגור'
                    WHEN status = 'cancelled' THEN 'מבוטל'
                    ELSE status
                END
                WHERE status IN ('active', 'inactive', 'cancelled')
            """))
            
            # עדכון טבלת trades
            print("📝 מעדכן טבלת trades...")
            conn.execute(text("""
                UPDATE trades 
                SET status = CASE 
                    WHEN status = 'open' THEN 'פתוח'
                    WHEN status = 'closed' THEN 'סגור'
                    WHEN status = 'cancelled' THEN 'מבוטל'
                    ELSE status
                END
                WHERE status IN ('open', 'closed', 'cancelled')
            """))
            
            # עדכון טבלת trade_plans (אם יש שדה status)
            print("📝 מעדכן טבלת trade_plans...")
            try:
                conn.execute(text("""
                    UPDATE trade_plans 
                    SET status = CASE 
                        WHEN status = 'active' THEN 'פתוח'
                        WHEN status = 'inactive' THEN 'סגור'
                        WHEN status = 'cancelled' THEN 'מבוטל'
                        ELSE status
                    END
                    WHERE status IN ('active', 'inactive', 'cancelled')
                """))
            except Exception as e:
                print(f"⚠️ שדה status לא קיים בטבלת trade_plans: {e}")
            
            # עדכון טבלת alerts (אם יש שדה status)
            print("📝 מעדכן טבלת alerts...")
            try:
                conn.execute(text("""
                    UPDATE alerts 
                    SET status = CASE 
                        WHEN status = 'active' THEN 'פתוח'
                        WHEN status = 'inactive' THEN 'סגור'
                        WHEN status = 'cancelled' THEN 'מבוטל'
                        ELSE status
                    END
                    WHERE status IN ('active', 'inactive', 'cancelled')
                """))
            except Exception as e:
                print(f"⚠️ שדה status לא קיים בטבלת alerts: {e}")
            
            # אישור השינויים
            conn.commit()
            
            print("✅ עדכון ערכי סטטוס הושלם בהצלחה!")
            
            # הצגת סטטיסטיקות
            print("\n📊 סטטיסטיקות עדכון:")
            
            # ספירת חשבונות לפי סטטוס
            result = conn.execute(text("SELECT status, COUNT(*) as count FROM accounts GROUP BY status"))
            print("חשבונות לפי סטטוס:")
            for row in result:
                print(f"  {row.status}: {row.count}")
            
            # ספירת טריידים לפי סטטוס
            result = conn.execute(text("SELECT status, COUNT(*) as count FROM trades GROUP BY status"))
            print("טריידים לפי סטטוס:")
            for row in result:
                print(f"  {row.status}: {row.count}")
            
    except Exception as e:
        print(f"❌ שגיאה בעדכון ערכי סטטוס: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 מתחיל עדכון ערכי סטטוס בבסיס הנתונים...")
    success = update_status_values()
    
    if success:
        print("\n🎉 עדכון הושלם בהצלחה!")
        print("עכשיו כל הסטטוסים בבסיס הנתונים משתמשים בערכים בעברית:")
        print("  - פתוח")
        print("  - סגור") 
        print("  - מבוטל")
    else:
        print("\n❌ עדכון נכשל!")
        sys.exit(1)

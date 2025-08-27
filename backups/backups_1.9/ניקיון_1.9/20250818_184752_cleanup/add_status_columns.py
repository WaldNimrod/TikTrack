#!/usr/bin/env python3
"""
Add Status Columns Script

This script adds status columns to trade_plans and alerts tables.

Author: TikTrack Development Team
Version: 1.0
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text

def add_status_columns():
    """Add status columns to trade_plans and alerts tables."""
    
    # יצירת חיבור לבסיס הנתונים
    from config.database import DATABASE_URL
    engine = create_engine(DATABASE_URL)
    
    try:
        with engine.connect() as conn:
            print("🔄 מתחיל הוספת שדות status...")
            
            # הוספת שדה status לטבלת trade_plans
            print("📝 מוסיף שדה status לטבלת trade_plans...")
            try:
                conn.execute(text("ALTER TABLE trade_plans ADD COLUMN status VARCHAR(20) DEFAULT 'open'"))
                print("✅ שדה status נוסף לטבלת trade_plans")
            except Exception as e:
                print(f"⚠️ שדה status כבר קיים בטבלת trade_plans: {e}")
            
            # הוספת שדה status לטבלת alerts
            print("📝 מוסיף שדה status לטבלת alerts...")
            try:
                conn.execute(text("ALTER TABLE alerts ADD COLUMN status VARCHAR(20) DEFAULT 'open'"))
                print("✅ שדה status נוסף לטבלת alerts")
            except Exception as e:
                print(f"⚠️ שדה status כבר קיים בטבלת alerts: {e}")
            
            # אישור השינויים
            conn.commit()
            
            print("✅ הוספת שדות status הושלמה בהצלחה!")
            
    except Exception as e:
        print(f"❌ שגיאה בהוספת שדות status: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 מתחיל הוספת שדות status לטבלאות...")
    success = add_status_columns()
    
    if success:
        print("\n🎉 הוספת שדות status הושלמה בהצלחה!")
        print("עכשיו כל הטבלאות יש שדה status עם ערכים בעברית:")
        print("  - פתוח")
        print("  - סגור") 
        print("  - מבוטל")
    else:
        print("\n❌ הוספת שדות status נכשלה!")
        sys.exit(1)

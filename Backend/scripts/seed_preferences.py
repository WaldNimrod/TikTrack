#!/usr/bin/env python3
"""
Seed preferences data from preferences_defaults.json
"""

import json
import os
from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Database connection
DATABASE_URL = "postgresql+psycopg2://TikTrakDBAdmin:BigMeZoo1974!?@localhost:5432/TikTrack-db-testing"
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

def seed_preferences():
    """Seed preference groups and types from preferences_defaults.json"""
    
    # Load preferences defaults
    config_path = Path(__file__).parent.parent / "config" / "preferences_defaults.json"
    with open(config_path, 'r', encoding='utf-8') as f:
        defaults = json.load(f)
    
    with Session() as session:
        try:
            # Create preference groups
            groups = {
                'general': 'הגדרות כלליות',
                'ui': 'ממשק משתמש', 
                'charts': 'גרפים',
                'notifications': 'התראות',
                'trading': 'מסחר',
                'data': 'נתונים'
            }
            
            group_ids = {}
            for group_key, group_name in groups.items():
                result = session.execute(text("""
                    INSERT INTO preference_groups (group_name, description, created_at)
                    VALUES (:name, :desc, NOW())
                    ON CONFLICT (group_name) DO UPDATE SET description = EXCLUDED.description
                    RETURNING id
                """), {'name': group_name, 'desc': f'קבוצת {group_name}'})
                group_ids[group_key] = result.scalar()
            
            # Create preference types from defaults
            preferences_to_create = [
                # General
                ('primaryCurrency', 'USD', 'string', 'מטבע עיקרי', 'general'),
                ('secondaryCurrency', 'ILS', 'string', 'מטבע משני', 'general'),
                ('language', 'he', 'string', 'שפה', 'general'),
                ('timezone', 'Asia/Jerusalem', 'string', 'אזור זמן', 'general'),
                
                # UI
                ('sidebarPosition', 'right', 'string', 'מיקום סרגל צד', 'ui'),
                ('defaultPage', 'dashboard', 'string', 'עמוד ברירת מחדל', 'ui'),
                
                # Charts  
                ('chartTheme', 'modern', 'string', 'ערכת נושא גרפים', 'charts'),
                ('chartAnimation', 'true', 'boolean', 'אנימציה בגרפים', 'charts'),
                
                # Trading
                ('defaultStopLoss', '5.0', 'number', 'סטופ לוס ברירת מחדל', 'trading'),
                ('defaultTargetPrice', '10.0', 'number', 'יעד ברירת מחדל', 'trading'),
                ('riskPercentage', '2.0', 'number', 'אחוז סיכון', 'trading'),
                
                # Notifications
                ('enableDataUpdateNotifications', 'true', 'boolean', 'התראות עדכון נתונים', 'notifications'),
                ('enableSystemEventNotifications', 'true', 'boolean', 'התראות אירועי מערכת', 'notifications'),
                
                # Data
                ('autoRefresh', 'false', 'boolean', 'רענון אוטומטי', 'data'),
                ('refreshInterval', '30', 'number', 'מרווח רענון (שניות)', 'data'),
            ]
            
            for pref_name, default_val, data_type, desc, group_key in preferences_to_create:
                session.execute(text("""
                    INSERT INTO preference_types
                    (preference_name, data_type, default_value, description, group_id, is_active, created_at)
                    VALUES (:name, :type, :default, :desc, :group_id, true, NOW())
                    ON CONFLICT (preference_name) DO NOTHING
                """), {
                    'name': pref_name,
                    'type': data_type, 
                    'default': default_val,
                    'desc': desc,
                    'group_id': group_ids[group_key]
                })
            
            session.commit()
            print("✅ Preferences seeded successfully")
            
        except Exception as e:
            session.rollback()
            print(f"❌ Error seeding preferences: {e}")
            raise

if __name__ == "__main__":
    seed_preferences()

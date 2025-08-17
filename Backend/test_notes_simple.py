#!/usr/bin/env python3
"""
בדיקה פשוטה של המודל ישירות
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.note import Note
from config.database import DATABASE_URL

def test_notes_direct():
    """בדיקה ישירה של המודל"""
    
    try:
        # יצירת engine ו-session
        engine = create_engine(DATABASE_URL)
        Session = sessionmaker(bind=engine)
        session = Session()
        
        print("🔄 בודק טעינת הערות...")
        
        # טעינת הערות
        notes = session.query(Note).all()
        print(f"✅ נטענו {len(notes)} הערות")
        
        # הצגת דוגמאות
        for note in notes[:3]:
            print(f"  - ID: {note.id}, Type: {note.related_type}, Related ID: {note.related_id}")
            print(f"    Content: {note.content[:50]}...")
            print(f"    Dict: {note.to_dict()}")
            print()
        
        session.close()
        print("✅ בדיקה הושלמה בהצלחה")
        
    except Exception as e:
        print(f"❌ שגיאה: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_notes_direct()

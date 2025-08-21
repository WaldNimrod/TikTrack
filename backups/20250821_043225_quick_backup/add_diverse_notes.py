#!/usr/bin/env python3
"""
סקריפט להוספת הערות מגוונות לבסיס הנתונים
"""

import sqlite3
import os
import shutil
from datetime import datetime, timedelta
import random

# נתיב לבסיס הנתונים
DB_PATH = 'Backend/db/simpleTrade_new.db'

# נתיב לתיקיית הקבצים
UPLOAD_FOLDER = 'Backend/uploads/notes'

# יצירת תיקיית הקבצים אם לא קיימת
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# נתונים לדוגמה
SAMPLE_NOTES = [
    # הערות לחשבונות
    {
        'content': '<h3>פתיחת חשבון חדש</h3><p>נפתח חשבון חדש בבנק הפועלים עם יתרת פתיחה של ₪50,000. החשבון מיועד לטריידים יומיים.</p>',
        'related_type_id': 1,  # חשבון
        'related_id': 1,
        'attachment': 'account_opening.pdf',
        'created_at': datetime.now() - timedelta(days=30)
    },
    {
        'content': '<h4>עדכון יתרה</h4><p>יתרת החשבון עודכנה ל-₪75,000 לאחר רווחים מהטריידים האחרונים.</p><strong>סטטוס:</strong> <span style="color: green;">מעודכן</span>',
        'related_type_id': 1,
        'related_id': 2,
        'attachment': 'balance_update.jpg',
        'created_at': datetime.now() - timedelta(days=15)
    },
    
    # הערות לטריידים
    {
        'content': '<h3>טרייד AAPL</h3><p>קנייה של 100 מניות Apple במחיר $150. <br><strong>סיבה:</strong> דוח רווחים חיובי</p><ul><li>תמיכה: $145</li><li>התנגדות: $160</li></ul>',
        'related_type_id': 2,  # טרייד
        'related_id': 1,
        'attachment': 'aapl_analysis.pdf',
        'created_at': datetime.now() - timedelta(days=10)
    },
    {
        'content': '<h4>מכירת TSLA</h4><p>מכירה של 50 מניות Tesla במחיר $250. <br><span style="color: red;">רווח: $5,000</span></p>',
        'related_type_id': 2,
        'related_id': 2,
        'attachment': 'tsla_sale.png',
        'created_at': datetime.now() - timedelta(days=5)
    },
    {
        'content': '<h3>טרייד MSFT</h3><p>קנייה של 75 מניות Microsoft במחיר $300. <br><strong>אסטרטגיה:</strong> השקעה ארוכת טווח</p>',
        'related_type_id': 2,
        'related_id': 3,
        'attachment': 'msft_chart.jpg',
        'created_at': datetime.now() - timedelta(days=3)
    },
    
    # הערות לתכנונים
    {
        'content': '<h3>תכנון Q4 2025</h3><p>תכנון לטריידים ברבעון הרביעי של 2025. <br><strong>מטרות:</strong></p><ol><li>הגדלת תיק ההשקעות ב-20%</li><li>פיזור סיכונים</li><li>מעקב יומי</li></ol>',
        'related_type_id': 3,  # תכנון
        'related_id': 1,
        'attachment': 'q4_planning.pdf',
        'created_at': datetime.now() - timedelta(days=25)
    },
    {
        'content': '<h4>תכנון טכנולוגיה</h4><p>תכנון לטריידים במגזר הטכנולוגיה. <br><span style="color: blue;">מניות מומלצות:</span> AAPL, MSFT, GOOGL</p>',
        'related_type_id': 3,
        'related_id': 2,
        'attachment': 'tech_plan.png',
        'created_at': datetime.now() - timedelta(days=20)
    },
    
    # הערות לטיקרים
    {
        'content': '<h3>ניתוח AAPL</h3><p>ניתוח טכני של Apple. <br><strong>אינדיקטורים:</strong></p><ul><li>RSI: 65</li><li>MACD: חיובי</li><li>תמיכה חזקה</li></ul>',
        'related_type_id': 4,  # טיקר
        'related_id': 1,
        'attachment': 'aapl_technical.pdf',
        'created_at': datetime.now() - timedelta(days=12)
    },
    {
        'content': '<h4>עדכון TSLA</h4><p>עדכון על Tesla - דוח מכירות חיובי. <br><span style="color: green;">צפי: עלייה של 15%</span></p>',
        'related_type_id': 4,
        'related_id': 2,
        'attachment': 'tsla_update.jpg',
        'created_at': datetime.now() - timedelta(days=8)
    },
    
    # הערות נוספות
    {
        'content': '<h3>סיכום שבועי</h3><p>סיכום הטריידים השבוע. <br><strong>תוצאות:</strong></p><ul><li>רווח כולל: ₪12,000</li><li>5 טריידים מוצלחים</li><li>2 טריידים עם הפסד</li></ul>',
        'related_type_id': 1,
        'related_id': 3,
        'attachment': 'weekly_summary.pdf',
        'created_at': datetime.now() - timedelta(days=7)
    },
    {
        'content': '<h4>ניתוח שוק</h4><p>ניתוח השוק הנוכחי. <br><span style="color: orange;">אזהרה:</span> תנודתיות גבוהה צפויה</p>',
        'related_type_id': 2,
        'related_id': 4,
        'attachment': 'market_analysis.png',
        'created_at': datetime.now() - timedelta(days=2)
    },
    {
        'content': '<h3>אסטרטגיה חדשה</h3><p>פיתוח אסטרטגיה חדשה לטריידים. <br><strong>עקרונות:</strong></p><ol><li>ניהול סיכונים קפדני</li><li>מעקב טכני</li><li>תזמון מדויק</li></ol>',
        'related_type_id': 3,
        'related_id': 3,
        'attachment': 'new_strategy.pdf',
        'created_at': datetime.now() - timedelta(days=1)
    },
    {
        'content': '<h4>עדכון GOOGL</h4><p>עדכון על Google - השקה של מוצר חדש. <br><span style="color: green;">הזדמנות טרייד</span></p>',
        'related_type_id': 4,
        'related_id': 3,
        'attachment': 'googl_news.jpg',
        'created_at': datetime.now() - timedelta(hours=6)
    }
]

def create_sample_files():
    """יצירת קבצי דוגמה"""
    sample_files = {
        'account_opening.pdf': b'%PDF-1.4\n%Sample PDF content\n',
        'balance_update.jpg': b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x11\x08\x00\x01\x00\x01\x01\x01\x11\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x08\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x0c\x03\x01\x00\x02\x11\x03\x11\x00\x3f\x00\xaa\xff\xd9',
        'aapl_analysis.pdf': b'%PDF-1.4\n%AAPL Analysis Report\n',
        'tsla_sale.png': b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\x07tIME\x07\xe5\x08\x13\x0c\x1d\x00\x00\x00\x0cIDATx\x9cc```\x00\x00\x00\x04\x00\x01\xf5\x27\xde\xfc\x00\x00\x00\x00IEND\xaeB`\x82',
        'msft_chart.jpg': b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x11\x08\x00\x01\x00\x01\x01\x01\x11\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x08\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x0c\x03\x01\x00\x02\x11\x03\x11\x00\x3f\x00\xaa\xff\xd9',
        'q4_planning.pdf': b'%PDF-1.4\n%Q4 Planning Document\n',
        'tech_plan.png': b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\x07tIME\x07\xe5\x08\x13\x0c\x1d\x00\x00\x00\x0cIDATx\x9cc```\x00\x00\x00\x04\x00\x01\xf5\x27\xde\xfc\x00\x00\x00\x00IEND\xaeB`\x82',
        'aapl_technical.pdf': b'%PDF-1.4\n%AAPL Technical Analysis\n',
        'tsla_update.jpg': b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x11\x08\x00\x01\x00\x01\x01\x01\x11\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x08\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x0c\x03\x01\x00\x02\x11\x03\x11\x00\x3f\x00\xaa\xff\xd9',
        'weekly_summary.pdf': b'%PDF-1.4\n%Weekly Summary Report\n',
        'market_analysis.png': b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\x07tIME\x07\xe5\x08\x13\x0c\x1d\x00\x00\x00\x0cIDATx\x9cc```\x00\x00\x00\x04\x00\x01\xf5\x27\xde\xfc\x00\x00\x00\x00IEND\xaeB`\x82',
        'new_strategy.pdf': b'%PDF-1.4\n%New Trading Strategy\n',
        'googl_news.jpg': b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x11\x08\x00\x01\x00\x01\x01\x01\x11\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x08\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x0c\x03\x01\x00\x02\x11\x03\x11\x00\x3f\x00\xaa\xff\xd9'
    }
    
    for filename, content in sample_files.items():
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        with open(file_path, 'wb') as f:
            f.write(content)
        print(f"✅ Created sample file: {filename}")

def add_notes_to_database():
    """הוספת הערות לבסיס הנתונים"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # בדיקה אם יש כבר הערות
        cursor.execute("SELECT COUNT(*) FROM notes")
        existing_count = cursor.fetchone()[0]
        
        if existing_count > 0:
            print(f"⚠️  Found {existing_count} existing notes. Skipping...")
            return
        
        # הוספת הערות
        for note in SAMPLE_NOTES:
            cursor.execute("""
                INSERT INTO notes (content, related_type_id, related_id, attachment, created_at)
                VALUES (?, ?, ?, ?, ?)
            """, (
                note['content'],
                note['related_type_id'],
                note['related_id'],
                note['attachment'],
                note['created_at'].isoformat()
            ))
        
        conn.commit()
        print(f"✅ Added {len(SAMPLE_NOTES)} notes to database")
        
    except Exception as e:
        print(f"❌ Error adding notes: {e}")
        conn.rollback()
    finally:
        conn.close()

def main():
    """פונקציה ראשית"""
    print("🚀 Starting notes data generation...")
    
    # יצירת קבצי דוגמה
    print("📁 Creating sample files...")
    create_sample_files()
    
    # הוספת הערות לבסיס הנתונים
    print("💾 Adding notes to database...")
    add_notes_to_database()
    
    print("✅ Notes data generation completed!")

if __name__ == "__main__":
    main()


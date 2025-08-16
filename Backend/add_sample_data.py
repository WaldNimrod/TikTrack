#!/usr/bin/env python3
"""
סקריפט להוספת נתונים לדוגמה לטבלאות ביצועים, תזרימי מזומנים, התראות והערות
"""

from app import app
from models.execution import Execution
from models.cash_flow import CashFlow
from models.alert import Alert
from models.note import Note
from config.database import get_db
from datetime import datetime, timedelta
import random

def add_sample_data():
    """הוספת נתונים לדוגמה לכל הטבלאות"""
    
    with app.app_context():
        db = next(get_db())
        
        try:
            # הוספת ביצועים נוספים
            print("➕ מוסיף ביצועים נוספים...")
            executions_data = [
                {
                    'trade_id': 1,
                    'action': 'sell',
                    'date': datetime.now() - timedelta(days=5),
                    'quantity': 50,
                    'price': 175.50,
                    'fee': 5.25,
                    'source': 'Interactive Brokers'
                },
                {
                    'trade_id': 3,
                    'action': 'sell',
                    'date': datetime.now() - timedelta(days=2),
                    'quantity': 25,
                    'price': 890.00,
                    'fee': 8.90,
                    'source': 'TD Ameritrade'
                },
                {
                    'trade_id': 4,
                    'action': 'buy',
                    'date': datetime.now() - timedelta(days=1),
                    'quantity': 100,
                    'price': 45.75,
                    'fee': 4.58,
                    'source': 'Robinhood'
                },
                {
                    'trade_id': 5,
                    'action': 'buy',
                    'date': datetime.now(),
                    'quantity': 75,
                    'price': 320.00,
                    'fee': 6.40,
                    'source': 'Fidelity'
                }
            ]
            
            for exec_data in executions_data:
                execution = Execution(**exec_data)
                db.add(execution)
            
            # הוספת תזרימי מזומנים נוספים
            print("💰 מוסיף תזרימי מזומנים נוספים...")
            cash_flows_data = [
                {
                    'account_id': 1,
                    'type': 'dividend',
                    'amount': 750.00,
                    'date': datetime.now() - timedelta(days=30),
                    'description': 'דיבידנדים מאפל'
                },
                {
                    'account_id': 2,
                    'type': 'dividend',
                    'amount': 1200.00,
                    'date': datetime.now() - timedelta(days=25),
                    'description': 'דיבידנדים מ-ETF'
                },
                {
                    'account_id': 3,
                    'type': 'deposit',
                    'amount': 15000.00,
                    'date': datetime.now() - timedelta(days=20),
                    'description': 'הפקדה חודשית'
                },
                {
                    'account_id': 1,
                    'type': 'withdrawal',
                    'amount': -3000.00,
                    'date': datetime.now() - timedelta(days=15),
                    'description': 'משיכה לצרכים אישיים'
                },
                {
                    'account_id': 2,
                    'type': 'dividend',
                    'amount': 850.00,
                    'date': datetime.now() - timedelta(days=10),
                    'description': 'דיבידנדים מטסלה'
                }
            ]
            
            for cf_data in cash_flows_data:
                cash_flow = CashFlow(**cf_data)
                db.add(cash_flow)
            
            # הוספת התראות נוספות
            print("🔔 מוסיף התראות נוספות...")
            alerts_data = [
                {
                    'account_id': 1,
                    'ticker_id': 1,
                    'type': 'price_alert',
                    'condition': 'מחיר > 180$',
                    'message': 'אפל הגיעה ליעד המחיר',
                    'is_active': True,
                    'triggered_at': None
                },
                {
                    'account_id': 2,
                    'ticker_id': 2,
                    'type': 'stop_loss',
                    'condition': 'מחיר < 120$',
                    'message': 'טסלה ירדה מתחת לסטופ לוס',
                    'is_active': True,
                    'triggered_at': None
                },
                {
                    'account_id': 3,
                    'ticker_id': 3,
                    'type': 'volume_alert',
                    'condition': 'נפח > 50M',
                    'message': 'נפח מסחר גבוה ב-NVIDIA',
                    'is_active': False,
                    'triggered_at': None
                },
                {
                    'account_id': 1,
                    'ticker_id': 4,
                    'type': 'price_alert',
                    'condition': 'מחיר > 3500$',
                    'message': 'אמזון הגיעה ליעד המחיר',
                    'is_active': True,
                    'triggered_at': None
                },
                {
                    'account_id': 2,
                    'ticker_id': 5,
                    'type': 'earnings_alert',
                    'condition': 'דוחות רווחים',
                    'message': 'דוחות רווחים של מיקרוסופט',
                    'is_active': True,
                    'triggered_at': None
                }
            ]
            
            for alert_data in alerts_data:
                alert = Alert(**alert_data)
                db.add(alert)
            
            # הוספת הערות נוספות
            print("📝 מוסיף הערות נוספות...")
            notes_data = [
                {
                    'account_id': 1,
                    'trade_id': None,
                    'trade_plan_id': 1,
                    'content': 'אפל - החברה ממשיכה להציג ביצועים חזקים. iPhone 15 נמכר היטב והשירותים צומחים. כדאי לשקול הגדלת פוזיציה.',
                    'attachment': None
                },
                {
                    'account_id': 2,
                    'trade_id': 2,
                    'trade_plan_id': None,
                    'content': 'טסלה - הטרייד היה מוצלח. מכרתי ברווח של 15%. החברה עדיין תנודתית אבל יש פוטנציאל לטווח ארוך.',
                    'attachment': None
                },
                {
                    'account_id': 3,
                    'trade_id': None,
                    'trade_plan_id': 3,
                    'content': 'NVIDIA - מובילה בתחום ה-AI. הצמיחה מרשימה והפוטנציאל גדול. כדאי להחזיק לטווח ארוך.',
                    'attachment': None
                },
                {
                    'account_id': 1,
                    'trade_id': None,
                    'trade_plan_id': None,
                    'content': 'אמזון - דיבידנדים יציבים וצמיחה בענן. השקעה טובה לפיזור סיכונים.',
                    'attachment': None
                },
                {
                    'account_id': 2,
                    'trade_id': None,
                    'trade_plan_id': 2,
                    'content': 'מיקרוסופט - ביצועים יציבים, AI מתקדם, דיבידנדים צומחים. השקעה איכותית לטווח ארוך.',
                    'attachment': None
                },
                {
                    'account_id': 3,
                    'trade_id': 3,
                    'trade_plan_id': None,
                    'content': 'Google - AI מתקדם, חיפוש חזק, ענן צומח. החברה מתאימה לטווח ארוך.',
                    'attachment': None
                }
            ]
            
            for note_data in notes_data:
                note = Note(**note_data)
                db.add(note)
            
            # שמירת השינויים
            db.commit()
            
            print("✅ הנתונים נוספו בהצלחה!")
            
            # הצגת סיכום
            print(f"\n📊 סיכום נתונים:")
            print(f"ביצועים: {db.query(Execution).count()} רשומות")
            print(f"תזרימי מזומנים: {db.query(CashFlow).count()} רשומות")
            print(f"התראות: {db.query(Alert).count()} רשומות")
            print(f"הערות: {db.query(Note).count()} רשומות")
            
        except Exception as e:
            print(f"❌ שגיאה בהוספת נתונים: {e}")
            db.rollback()
        finally:
            db.close()

if __name__ == "__main__":
    add_sample_data()



"""
מערכת ההתראות - Alert System
==============================

מערכת ההתראות מאפשרת למשתמשים להגדיר התראות על תנאים שונים בשוק
ולקבל עדכונים כאשר התנאים מתממשים.

מחזור החיים של התראה:
-----------------------

1. יצירת התראה חדשה:
   - סטטוס: 'open' (פתוח)
   - is_triggered: 'false'
   - התראה פעילה וממתינה להתממשות התנאי

2. התממשות התנאי:
   - סטטוס: 'closed' (סגור)
   - is_triggered: 'new'
   - triggered_at: מתעדכן לתאריך ההפעלה
   - התראה מוצגת בחלון ההתראות בכל העמודים

3. קריאת ההתראה ע"י המשתמש:
   - is_triggered: 'true'
   - התראה מוצגת בדף ההתראות בלבד
   - לא מוצגת בחלון ההתראות בשאר העמודים

4. ניהול התראה בדף ההתראות:
   - החזרה למצב פעיל: סטטוס -> 'open', is_triggered -> 'false'
   - ביטול התראה: סטטוס -> 'cancelled'

משמעות השדות:
---------------
- status: מצב ההתראה ('open', 'closed', 'cancelled')
- is_triggered: מצב הפעלה ('false', 'new', 'true')
- triggered_at: תאריך הפעלת ההתראה
- type: סוג ההתראה ('price_alert', 'stop_loss', 'volume_alert', וכו')
- condition: התנאי להפעלת ההתראה
- message: הודעה שתוצג למשתמש
- related_type_id: סוג הישות המשויכת (מצביע ל-note_relation_types)
- related_id: מזהה הישות הספציפית

סוגי התראות:
-------------
- price_alert: התראה על מחיר
- stop_loss: התראה על עצירת הפסד
- volume_alert: התראה על נפח מסחר
- custom_alert: התראה מותאמת אישית

סוגי שיוך (דרך note_relation_types):
-------------------------------------
- account: התראה משויכת לחשבון
- trade: התראה משויכת לטרייד
- trade_plan: התראה משויכת לתכנון טרייד
- ticker: התראה משויכת לטיקר
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class Alert(BaseModel):
    __tablename__ = "alerts"
    
    type = Column(String(50), nullable=False)
    status = Column(String(20), default='open', nullable=True)
    condition = Column(String(500), nullable=False)
    message = Column(String(500), nullable=True)
    triggered_at = Column(DateTime, nullable=True)
    is_triggered = Column(String(20), default='false', nullable=True)  # false, new, true
    
    # שיוך גמיש לישויות שונות
    related_type_id = Column(Integer, ForeignKey('note_relation_types.id'), nullable=False)
    related_id = Column(Integer, nullable=False)
    
    # יחסים
    related_type = relationship("NoteRelationType")
    
    def __repr__(self):
        related_type = 'account' if self.related_type_id == 1 else 'trade' if self.related_type_id == 2 else 'trade_plan' if self.related_type_id == 3 else 'ticker' if self.related_type_id == 4 else 'none'
        return f"<Alert(id={self.id}, type='{self.type}', status={self.status}, is_triggered={self.is_triggered}, related_type='{related_type}', related_id={self.related_id})>"
    
    def to_dict(self):
        """המרה למילון עם תאימות לאחור"""
        result = super().to_dict()
        
        # קביעת related_type לפי related_type_id
        if self.related_type_id == 1:
            result['related_type'] = 'account'
        elif self.related_type_id == 2:
            result['related_type'] = 'trade'
        elif self.related_type_id == 3:
            result['related_type'] = 'trade_plan'
        elif self.related_type_id == 4:
            result['related_type'] = 'ticker'
        else:
            result['related_type'] = None
        
        result['related_id'] = self.related_id
        
        # הוספת שדות לתאימות לאחור
        if self.related_type_id == 1:  # account
            result['account_id'] = self.related_id
            result['trade_id'] = None
            result['trade_plan_id'] = None
            result['ticker_id'] = None
        elif self.related_type_id == 2:  # trade
            result['account_id'] = None
            result['trade_id'] = self.related_id
            result['trade_plan_id'] = None
            result['ticker_id'] = None
        elif self.related_type_id == 3:  # trade_plan
            result['account_id'] = None
            result['trade_id'] = None
            result['trade_plan_id'] = self.related_id
            result['ticker_id'] = None
        elif self.related_type_id == 4:  # ticker
            result['account_id'] = None
            result['trade_id'] = None
            result['trade_plan_id'] = None
            result['ticker_id'] = self.related_id
        
        return result

from sqlalchemy import Column, Integer, String, ForeignKey
from .base import BaseModel

class Note(BaseModel):
    """
    מודל הערות עם מערכת שיוך גמישה
    
    מערכת השיוך מאפשרת לקשר הערות לישויות שונות במערכת:
    - account (id=1): הערה משויכת לחשבון
    - trade (id=2): הערה משויכת לטרייד  
    - trade_plan (id=3): הערה משויכת לתכנון טרייד
    - ticker (id=4): הערה משויכת לטיקר
    
    יתרונות המערכת:
    - גמישות: אפשרות לשייך הערות לכל סוג של ישות
    - הרחבה קלה: הוספת סוגי ישות חדשים ללא שינוי מבנה הטבלה
    - עקביות: שימוש באותה מערכת שיוך כמו התראות
    """
    __tablename__ = "notes"
    
    content = Column(String(1000), nullable=False)
    attachment = Column(String(500), nullable=True)  # path to file
    related_type_id = Column(Integer, ForeignKey('note_relation_types.id'), nullable=False)
    related_id = Column(Integer, nullable=False)
    
    def __repr__(self):
        related_type = 'account' if self.related_type_id == 1 else 'trade' if self.related_type_id == 2 else 'trade_plan' if self.related_type_id == 3 else 'none'
        return f"<Note(id={self.id}, related_type='{related_type}', related_id={self.related_id}, content='{self.content[:50]}...')>"
    
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
        else:
            result['related_type'] = None
        
        result['related_id'] = self.related_id
        
        # הוספת שדות לתאימות לאחור
        if self.related_type_id == 1:  # account
            result['account_id'] = self.related_id
            result['trade_id'] = None
            result['trade_plan_id'] = None
        elif self.related_type_id == 2:  # trade
            result['account_id'] = None
            result['trade_id'] = self.related_id
            result['trade_plan_id'] = None
        elif self.related_type_id == 3:  # trade_plan
            result['account_id'] = None
            result['trade_id'] = None
            result['trade_plan_id'] = self.related_id
        
        return result

from sqlalchemy.orm import Session
from models.alert import Alert
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class AlertService:
    """שירות לניהול התראות"""
    
    @staticmethod
    def get_all(db: Session):
        """קבלת כל ההתראות"""
        try:
            alerts = db.query(Alert).all()
            logger.info(f"נטענו {len(alerts)} התראות")
            return alerts
        except Exception as e:
            logger.error(f"שגיאה בטעינת התראות: {e}")
            raise
    
    @staticmethod
    def get_by_id(db: Session, alert_id: int):
        """קבלת התראה לפי מזהה"""
        try:
            alert = db.query(Alert).filter(Alert.id == alert_id).first()
            return alert
        except Exception as e:
            logger.error(f"שגיאה בטעינת התראה {alert_id}: {e}")
            raise
    
    @staticmethod
    def create(db: Session, alert_data: dict):
        """יצירת התראה חדשה"""
        try:
            # הגדרת ברירת מחדל ל-is_triggered
            if 'is_triggered' not in alert_data:
                alert_data['is_triggered'] = 'false'
            
            alert = Alert(**alert_data)
            db.add(alert)
            db.commit()
            db.refresh(alert)
            
            logger.info(f"התראה נוצרה בהצלחה: {alert.id}")
            return alert
        except Exception as e:
            db.rollback()
            logger.error(f"שגיאה ביצירת התראה: {e}")
            raise
    
    @staticmethod
    def update(db: Session, alert_id: int, alert_data: dict):
        """עדכון התראה קיימת"""
        try:
            alert = db.query(Alert).filter(Alert.id == alert_id).first()
            if not alert:
                raise ValueError(f"התראה {alert_id} לא נמצאה")
            
            # עדכון השדות
            for field, value in alert_data.items():
                if hasattr(alert, field):
                    setattr(alert, field, value)
            
            # לוגיקה מיוחדת ל-is_triggered
            if 'is_triggered' in alert_data:
                new_triggered_status = alert_data['is_triggered']
                
                # אם ההתראה הופעלה (new), עדכן את triggered_at
                if new_triggered_status == 'new' and not alert.triggered_at:
                    alert.triggered_at = datetime.now()
                
                # אם ההתראה נקראה (true), עדכן את הסטטוס לסגור
                if new_triggered_status == 'true':
                    alert.status = 'סגור'
                    logger.info(f"התראה {alert_id} סומנה כנקראה, הסטטוס עודכן לסגור")
            
            db.commit()
            db.refresh(alert)
            
            logger.info(f"התראה {alert_id} עודכנה בהצלחה")
            return alert
        except Exception as e:
            db.rollback()
            logger.error(f"שגיאה בעדכון התראה {alert_id}: {e}")
            raise
    
    @staticmethod
    def delete(db: Session, alert_id: int):
        """מחיקת התראה"""
        try:
            alert = db.query(Alert).filter(Alert.id == alert_id).first()
            if not alert:
                raise ValueError(f"התראה {alert_id} לא נמצאה")
            
            db.delete(alert)
            db.commit()
            
            logger.info(f"התראה {alert_id} נמחקה בהצלחה")
            return True
        except Exception as e:
            db.rollback()
            logger.error(f"שגיאה במחיקת התראה {alert_id}: {e}")
            raise
    
    @staticmethod
    def mark_as_triggered(db: Session, alert_id: int):
        """סימון התראה כמופעלת (new)"""
        try:
            alert = db.query(Alert).filter(Alert.id == alert_id).first()
            if not alert:
                raise ValueError(f"התראה {alert_id} לא נמצאה")
            
            alert.is_triggered = 'new'
            alert.triggered_at = datetime.now()
            
            db.commit()
            db.refresh(alert)
            
            logger.info(f"התראה {alert_id} סומנה כמופעלת")
            return alert
        except Exception as e:
            db.rollback()
            logger.error(f"שגיאה בסימון התראה {alert_id} כמופעלת: {e}")
            raise
    
    @staticmethod
    def mark_as_read(db: Session, alert_id: int):
        """סימון התראה כנקראה (true)"""
        try:
            alert = db.query(Alert).filter(Alert.id == alert_id).first()
            if not alert:
                raise ValueError(f"התראה {alert_id} לא נמצאה")
            
            alert.is_triggered = 'true'
            alert.status = 'סגור'  # עדכון הסטטוס לסגור
            
            db.commit()
            db.refresh(alert)
            
            logger.info(f"התראה {alert_id} סומנה כנקראה, הסטטוס עודכן לסגור")
            return alert
        except Exception as e:
            db.rollback()
            logger.error(f"שגיאה בסימון התראה {alert_id} כנקראה: {e}")
            raise
    
    @staticmethod
    def get_unread_alerts(db: Session):
        """קבלת התראות שלא נקראו (new)"""
        try:
            alerts = db.query(Alert).filter(Alert.is_triggered == 'new').all()
            logger.info(f"נמצאו {len(alerts)} התראות שלא נקראו")
            return alerts
        except Exception as e:
            logger.error(f"שגיאה בטעינת התראות שלא נקראו: {e}")
            raise
    
    @staticmethod
    def get_active_alerts(db: Session):
        """קבלת התראות פעילות (is_triggered = false)"""
        try:
            alerts = db.query(Alert).filter(Alert.is_triggered == 'false').all()
            logger.info(f"נמצאו {len(alerts)} התראות פעילות")
            return alerts
        except Exception as e:
            logger.error(f"שגיאה בטעינת התראות פעילות: {e}")
            raise

from sqlalchemy.orm import Session
from models.alert import Alert
from models.note_relation_type import NoteRelationType
from datetime import datetime
import logging
from typing import List, Optional, Dict, Any

logger = logging.getLogger(__name__)

class AlertService:
    """שירות לניהול התראות"""
    
    @staticmethod
    def get_all(db: Session) -> List[Alert]:
        """קבלת כל ההתראות"""
        try:
            alerts = db.query(Alert).all()
            logger.info(f"נטענו {len(alerts)} התראות")
            return alerts
        except Exception as e:
            logger.error(f"שגיאה בטעינת התראות: {e}")
            raise
    
    @staticmethod
    def get_by_id(db: Session, alert_id: int) -> Optional[Alert]:
        """קבלת התראה לפי מזהה"""
        try:
            alert = db.query(Alert).filter(Alert.id == alert_id).first()
            return alert
        except Exception as e:
            logger.error(f"שגיאה בטעינת התראה {alert_id}: {e}")
            raise
    
    @staticmethod
    def get_unread_alerts(db: Session) -> List[Alert]:
        """קבלת התראות שלא נקראו (is_triggered = 'new')"""
        try:
            alerts = db.query(Alert).filter(Alert.is_triggered == 'new').all()
            logger.info(f"נטענו {len(alerts)} התראות שלא נקראו")
            return alerts
        except Exception as e:
            logger.error(f"שגיאה בטעינת התראות שלא נקראו: {e}")
            raise
    
    @staticmethod
    def create(db: Session, alert_data: Dict[str, Any]) -> Alert:
        """יצירת התראה חדשה"""
        try:
            # הגדרת ברירת מחדל ל-is_triggered
            if 'is_triggered' not in alert_data:
                alert_data['is_triggered'] = 'false'
            
            # המרת related_type ל-related_type_id
            if 'related_type' in alert_data:
                related_type = alert_data.pop('related_type')
                related_type_id = AlertService._get_relation_type_id(db, related_type)
                alert_data['related_type_id'] = related_type_id
            
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
    def update(db: Session, alert_id: int, alert_data: Dict[str, Any]) -> Alert:
        """עדכון התראה קיימת"""
        try:
            alert = db.query(Alert).filter(Alert.id == alert_id).first()
            if not alert:
                raise ValueError(f"התראה {alert_id} לא נמצאה")
            
            # המרת related_type ל-related_type_id אם קיים
            if 'related_type' in alert_data:
                related_type = alert_data.pop('related_type')
                related_type_id = AlertService._get_relation_type_id(db, related_type)
                alert_data['related_type_id'] = related_type_id
            
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
                    alert.status = 'closed'
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
    def delete(db: Session, alert_id: int) -> bool:
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
    def mark_as_triggered(db: Session, alert_id: int) -> Alert:
        """הפעלת התראה (שינוי ל-new)"""
        try:
            alert = db.query(Alert).filter(Alert.id == alert_id).first()
            if not alert:
                raise ValueError(f"התראה {alert_id} לא נמצאה")
            
            alert.status = 'closed'
            alert.is_triggered = 'new'
            alert.triggered_at = datetime.now()
            
            db.commit()
            db.refresh(alert)
            
            logger.info(f"התראה {alert_id} הופעלה")
            return alert
        except Exception as e:
            db.rollback()
            logger.error(f"שגיאה בהפעלת התראה {alert_id}: {e}")
            raise
    
    @staticmethod
    def mark_as_read(db: Session, alert_id: int) -> Alert:
        """סימון התראה כנקראה (true)"""
        try:
            alert = db.query(Alert).filter(Alert.id == alert_id).first()
            if not alert:
                raise ValueError(f"התראה {alert_id} לא נמצאה")
            
            alert.is_triggered = 'true'
            alert.status = 'closed'  # עדכון הסטטוס לסגור
            
            db.commit()
            db.refresh(alert)
            
            logger.info(f"התראה {alert_id} סומנה כנקראה, הסטטוס עודכן לסגור")
            return alert
        except Exception as e:
            db.rollback()
            logger.error(f"שגיאה בסימון התראה {alert_id} כנקראה: {e}")
            raise
    
    @staticmethod
    def get_unread_alerts(db: Session) -> List[Alert]:
        """קבלת התראות שלא נקראו (new)"""
        try:
            alerts = db.query(Alert).filter(Alert.is_triggered == 'new').all()
            logger.info(f"נמצאו {len(alerts)} התראות שלא נקראו")
            return alerts
        except Exception as e:
            logger.error(f"שגיאה בטעינת התראות שלא נקראו: {e}")
            raise
    
    @staticmethod
    def get_unread_alerts_with_symbols(db: Session) -> List[Dict[str, Any]]:
        """קבלת התראות שלא נקראו עם סימבולי טיקרים"""
        try:
            from models.ticker import Ticker
            
            # קבלת כל ההתראות החדשות
            alerts = db.query(Alert).filter(Alert.is_triggered == 'new').all()
            
            # יצירת רשימה של dictionaries
            alerts_with_symbols: List[Dict[str, Any]] = []
            for alert in alerts:
                alert_dict = alert.to_dict()
                
                # הוספת סימבול טיקר אם ההתראה משויכת לטיקר
                if alert.related_type_id == 4:  # ticker
                    ticker = db.query(Ticker).filter(Ticker.id == alert.related_id).first()
                    if ticker:
                        alert_dict['ticker_symbol'] = ticker.symbol
                    else:
                        alert_dict['ticker_symbol'] = None
                else:
                    alert_dict['ticker_symbol'] = None
                
                alerts_with_symbols.append(alert_dict)
            
            logger.info(f"נמצאו {len(alerts_with_symbols)} התראות שלא נקראו")
            return alerts_with_symbols
        except Exception as e:
            logger.error(f"שגיאה בטעינת התראות שלא נקראו עם סימבולים: {e}")
            raise
    

    
    @staticmethod
    def get_alerts_by_entity(db: Session, entity_type: str, entity_id: int) -> List[Alert]:
        """קבלת התראות לפי סוג ישות ומזהה"""
        try:
            related_type_id = AlertService._get_relation_type_id(db, entity_type)
            alerts = db.query(Alert).filter(
                Alert.related_type_id == related_type_id,
                Alert.related_id == entity_id
            ).all()
            
            logger.info(f"נמצאו {len(alerts)} התראות לישות {entity_type} {entity_id}")
            return alerts
        except Exception as e:
            logger.error(f"שגיאה בטעינת התראות לישות {entity_type} {entity_id}: {e}")
            raise
    
    @staticmethod
    def reactivate(db: Session, alert_id: int) -> Alert:
        """החזרת התראה למצב פעיל"""
        try:
            alert = db.query(Alert).filter(Alert.id == alert_id).first()
            if not alert:
                raise ValueError(f"התראה {alert_id} לא נמצאה")
            
            alert.status = 'open'
            alert.is_triggered = 'false'
            alert.triggered_at = None
            
            db.commit()
            db.refresh(alert)
            
            logger.info(f"התראה {alert_id} הוחזרה למצב פעיל")
            return alert
        except Exception as e:
            db.rollback()
            logger.error(f"שגיאה בהחזרת התראה {alert_id} למצב פעיל: {e}")
            raise
    
    @staticmethod
    def cancel(db: Session, alert_id: int) -> Alert:
        """ביטול התראה"""
        try:
            alert = db.query(Alert).filter(Alert.id == alert_id).first()
            if not alert:
                raise ValueError(f"התראה {alert_id} לא נמצאה")
            
            alert.status = 'cancelled'
            alert.is_triggered = 'true'
            
            db.commit()
            db.refresh(alert)
            
            logger.info(f"התראה {alert_id} בוטלה")
            return alert
        except Exception as e:
            db.rollback()
            logger.error(f"שגיאה בביטול התראה {alert_id}: {e}")
            raise
    
    @staticmethod
    def _get_relation_type_id(db: Session, relation_type: str) -> int:
        """קבלת מזהה סוג השיוך לפי שם"""
        try:
            relation_type_obj = db.query(NoteRelationType).filter(
                NoteRelationType.note_relation_type == relation_type
            ).first()
            
            if not relation_type_obj:
                raise ValueError(f"סוג שיוך '{relation_type}' לא נמצא")
            
            return relation_type_obj.id
        except Exception as e:
            logger.error(f"שגיאה בקבלת מזהה סוג שיוך '{relation_type}': {e}")
            raise

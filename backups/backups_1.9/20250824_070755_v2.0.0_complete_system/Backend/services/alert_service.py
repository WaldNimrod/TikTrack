from sqlalchemy.orm import Session
from models.alert import Alert
from models.note_relation_type import NoteRelationType
from services.validation_service import ValidationService
from datetime import datetime
import logging
from typing import List, Optional, Dict, Any

logger = logging.getLogger(__name__)

class AlertService:
    """Service for managing alerts"""
    
    @staticmethod
    def get_all(db: Session) -> List[Alert]:
        """Get all alerts"""
        try:
            alerts = db.query(Alert).all()
            logger.info(f"נטענו {len(alerts)} התראות")
            return alerts
        except Exception as e:
            logger.error(f"שגיאה בטעינת התראות: {e}")
            raise
    
    @staticmethod
    def get_by_id(db: Session, alert_id: int) -> Optional[Alert]:
        """Get alert by ID"""
        try:
            alert = db.query(Alert).filter(Alert.id == alert_id).first()
            return alert
        except Exception as e:
            logger.error(f"שגיאה בטעינת התראה {alert_id}: {e}")
            raise
    
    @staticmethod
    def get_unread_alerts(db: Session) -> List[Alert]:
        """Get unread alerts (is_triggered = 'new')"""
        try:
            alerts = db.query(Alert).filter(Alert.is_triggered == 'new').all()
            logger.info(f"נטענו {len(alerts)} התראות שלא נקראו")
            return alerts
        except Exception as e:
            logger.error(f"שגיאה בטעינת התראות שלא נקראו: {e}")
            raise
    
    @staticmethod
    def create(db: Session, alert_data: Dict[str, Any]) -> Alert:
        """Create a new alert"""
        try:
            # Set default value for is_triggered
            if 'is_triggered' not in alert_data:
                alert_data['is_triggered'] = 'false'
            
            # Convert related_type to related_type_id
            if 'related_type' in alert_data:
                related_type = alert_data.pop('related_type')
                related_type_id = AlertService._get_relation_type_id(db, related_type)
                alert_data['related_type_id'] = related_type_id
            
            # Validate data against constraints
            logger.info("Validating alert data before creation")
            is_valid, errors = ValidationService.validate_data(db, 'alerts', alert_data)
            if not is_valid:
                error_message = "; ".join(errors)
                logger.error(f"Alert validation failed: {error_message}")
                raise ValueError(f"Alert validation failed: {error_message}")
            
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
        """Update an existing alert"""
        try:
            alert = db.query(Alert).filter(Alert.id == alert_id).first()
            if not alert:
                raise ValueError(f"Alert {alert_id} not found")
            
            # Convert related_type to related_type_id if exists
            if 'related_type' in alert_data:
                related_type = alert_data.pop('related_type')
                related_type_id = AlertService._get_relation_type_id(db, related_type)
                alert_data['related_type_id'] = related_type_id
            
            # Validate data against constraints
            logger.info("Validating alert data before update")
            is_valid, errors = ValidationService.validate_data(db, 'alerts', alert_data, exclude_id=alert_id)
            if not is_valid:
                error_message = "; ".join(errors)
                logger.error(f"Alert validation failed: {error_message}")
                raise ValueError(f"Alert validation failed: {error_message}")
            
            # Update fields
            for field, value in alert_data.items():
                if hasattr(alert, field):
                    setattr(alert, field, value)
            
            # Special logic for is_triggered
            if 'is_triggered' in alert_data:
                new_triggered_status = alert_data['is_triggered']
                
                # If alert was triggered (new), update triggered_at
                if new_triggered_status == 'new' and not alert.triggered_at:
                    alert.triggered_at = datetime.now()
                
                # If alert was read (true), update status to closed
                if new_triggered_status == 'true':
                    alert.status = 'closed'
                    logger.info(f"Alert {alert_id} marked as read, status updated to closed")
            
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
        """Delete an alert"""
        try:
            # Check that the alert exists
            alert = db.query(Alert).filter(Alert.id == alert_id).first()
            if not alert:
                raise ValueError(f"Alert {alert_id} not found")
            
            # Delete the alert
            db.delete(alert)
            db.commit()
            
            logger.info(f"Alert {alert_id} deleted successfully")
            return True
            
        except ValueError as e:
            # Known error - alert not found
            logger.warning(f"Alert {alert_id} not found for deletion: {e}")
            raise
            
        except Exception as e:
            # General error
            db.rollback()
            logger.error(f"Error deleting alert {alert_id}: {e}")
            logger.error(f"Error type: {type(e).__name__}")
            logger.error(f"Error details: {str(e)}")
            raise
    
    @staticmethod
    def mark_as_triggered(db: Session, alert_id: int) -> Alert:
        """Trigger alert (change to new)"""
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
            logger.error(f"Error triggering alert {alert_id}: {e}")
            raise
    
    @staticmethod
    def mark_as_read(db: Session, alert_id: int) -> Alert:
        """Mark alert as read (true)"""
        try:
            alert = db.query(Alert).filter(Alert.id == alert_id).first()
            if not alert:
                raise ValueError(f"Alert {alert_id} not found")
            
            alert.is_triggered = 'true'
            alert.status = 'closed'  # Update status to closed
            
            db.commit()
            db.refresh(alert)
            
            logger.info(f"Alert {alert_id} marked as read, status updated to closed")
            return alert
        except Exception as e:
            db.rollback()
            logger.error(f"Error marking alert {alert_id} as read: {e}")
            raise
    
    @staticmethod
    def get_unread_alerts(db: Session) -> List[Alert]:
        """Get unread alerts (new)"""
        try:
            alerts = db.query(Alert).filter(Alert.is_triggered == 'new').all()
            logger.info(f"Found {len(alerts)} unread alerts")
            return alerts
        except Exception as e:
            logger.error(f"Error loading unread alerts: {e}")
            raise
    
    @staticmethod
    def get_unread_alerts_with_symbols(db: Session) -> List[Dict[str, Any]]:
        """Get unread alerts with ticker symbols"""
        try:
            from models.ticker import Ticker
            
            # Get all new alerts
            alerts = db.query(Alert).filter(Alert.is_triggered == 'new').all()
            
            # Create list of dictionaries
            alerts_with_symbols: List[Dict[str, Any]] = []
            for alert in alerts:
                alert_dict = alert.to_dict()
                
                # Add ticker symbol if alert is linked to ticker
                if alert.related_type_id == 4:  # ticker
                    ticker = db.query(Ticker).filter(Ticker.id == alert.related_id).first()
                    if ticker:
                        alert_dict['ticker_symbol'] = ticker.symbol
                    else:
                        alert_dict['ticker_symbol'] = None
                else:
                    alert_dict['ticker_symbol'] = None
                
                alerts_with_symbols.append(alert_dict)
            
            logger.info(f"Found {len(alerts_with_symbols)} unread alerts")
            return alerts_with_symbols
        except Exception as e:
            logger.error(f"Error loading unread alerts with symbols: {e}")
            raise
    

    
    @staticmethod
    def get_alerts_by_entity(db: Session, entity_type: str, entity_id: int) -> List[Alert]:
        """Get alerts by entity type and ID"""
        try:
            related_type_id = AlertService._get_relation_type_id(db, entity_type)
            alerts = db.query(Alert).filter(
                Alert.related_type_id == related_type_id,
                Alert.related_id == entity_id
            ).all()
            
            logger.info(f"Found {len(alerts)} alerts for entity {entity_type} {entity_id}")
            return alerts
        except Exception as e:
            logger.error(f"Error loading alerts for entity {entity_type} {entity_id}: {e}")
            raise
    
    @staticmethod
    def reactivate(db: Session, alert_id: int) -> Alert:
        """Reactivate alert to active state"""
        try:
            alert = db.query(Alert).filter(Alert.id == alert_id).first()
            if not alert:
                raise ValueError(f"Alert {alert_id} not found")
            
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
        """Cancel alert"""
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
        """Get relation type ID by name"""
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

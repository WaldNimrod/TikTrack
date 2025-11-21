from sqlalchemy.orm import Session
from sqlalchemy import func, case
from models.alert import Alert
from models.note_relation_type import NoteRelationType
from services.validation_service import ValidationService
from datetime import datetime
import logging
from typing import List, Optional, Dict, Any

logger = logging.getLogger(__name__)

class AlertService:
    """Service for managing alerts"""
    
    def __init__(self, db: Session):
        """Initialize AlertService with database session"""
        self.db = db
    
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
            logger.info(f"AlertService.create called with data: {alert_data}")
            logger.info(f"condition_attribute in data: {'condition_attribute' in alert_data}")
            logger.info(f"condition_attribute value: {alert_data.get('condition_attribute')}")
            
            # Set default value for is_triggered
            if 'is_triggered' not in alert_data:
                alert_data['is_triggered'] = 'false'
            
            # Ensure created_at exists (rounded to minute precision)
            if not alert_data.get('created_at'):
                alert_data['created_at'] = datetime.utcnow().replace(second=0, microsecond=0)
            
            # Convert related_type to related_type_id
            if 'related_type' in alert_data:
                related_type = alert_data.pop('related_type')
                related_type_id = AlertService._get_relation_type_id(db, related_type)
                alert_data['related_type_id'] = related_type_id
            
            logger.info(f"Before _process_condition_fields - condition_attribute: {alert_data.get('condition_attribute')}")
            
            # Handle new condition fields
            AlertService._process_condition_fields(alert_data)
            
            logger.info(f"After _process_condition_fields - condition_attribute: {alert_data.get('condition_attribute')}")
            
            # Validate expiry_date format if provided
            AlertService._validate_expiry_date(alert_data)
            
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
    
    def create_alert(self, alert_data: Dict[str, Any]) -> Alert:
        """Create a new alert (instance method for compatibility with condition evaluation)"""
        return self.create(self.db, alert_data)
    
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
            
            # Handle new condition fields
            AlertService._process_condition_fields(alert_data)
            
            # Validate expiry_date format if provided
            AlertService._validate_expiry_date(alert_data)
            
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
    
    @staticmethod
    def _process_condition_fields(alert_data: Dict[str, Any]) -> None:
        """Process condition fields for new format"""
        try:
            logger.info(f"Processing condition fields - input data: {alert_data}")
            
            # If legacy condition field is provided, convert to new format
            if 'condition' in alert_data and alert_data['condition']:
                legacy_condition = alert_data['condition']
                
                # Check if it's already in new format (contains |)
                if ' | ' in legacy_condition:
                    parts = legacy_condition.split(' | ')
                    if len(parts) == 3:
                        alert_data['condition_attribute'] = parts[0].strip()
                        alert_data['condition_operator'] = parts[1].strip()
                        alert_data['condition_number'] = parts[2].strip()
                        # Remove legacy field
                        del alert_data['condition']
                else:
                    # Convert old format to new format
                    condition_mapping = {
                        'below': ('price', 'less_than', '0'),
                        'above': ('price', 'more_than', '0'),
                        'equals': ('price', 'equals', '0'),
                        'price_target': ('price', 'more_than', '0'),
                        'volume_high': ('volume', 'more_than', '0'),
                        'stop_loss': ('price', 'less_than', '0'),
                        'breakout': ('price', 'more_than', '0'),
                        'daily_change_positive': ('change', 'more_than', '0'),
                        'profit_target': ('price', 'more_than', '0'),
                        'entry_condition': ('price', 'cross', '0'),
                        'balance_low': ('price', 'less_than', '0'),
                        'profit_milestone': ('price', 'more_than', '0')
                    }
                    
                    if legacy_condition in condition_mapping:
                        attribute, operator, number = condition_mapping[legacy_condition]
                        alert_data['condition_attribute'] = attribute
                        alert_data['condition_operator'] = operator
                        alert_data['condition_number'] = number
                        # Remove legacy field
                        del alert_data['condition']
            
            # IMPORTANT: Check if fields already exist and are not None/empty before setting defaults
            # Only set defaults if field is truly missing, not if it's None or empty string
            if 'condition_attribute' not in alert_data or not alert_data.get('condition_attribute'):
                logger.warning(f"condition_attribute missing or empty, setting default. Current value: {alert_data.get('condition_attribute')}")
                alert_data['condition_attribute'] = 'price'
            if 'condition_operator' not in alert_data or not alert_data.get('condition_operator'):
                logger.warning(f"condition_operator missing or empty, setting default. Current value: {alert_data.get('condition_operator')}")
                alert_data['condition_operator'] = 'more_than'
            if 'condition_number' not in alert_data or not alert_data.get('condition_number'):
                logger.warning(f"condition_number missing or empty, setting default. Current value: {alert_data.get('condition_number')}")
                alert_data['condition_number'] = '0'
            
            logger.info(f"After processing - condition_attribute: {alert_data.get('condition_attribute')}, condition_operator: {alert_data.get('condition_operator')}, condition_number: {alert_data.get('condition_number')}")
            
            # Validate new condition fields
            valid_attributes = ['price', 'change', 'ma', 'volume', 'balance']
            valid_operators = ['more_than', 'less_than', 'cross', 'cross_up', 'cross_down', 'change', 'change_up', 'change_down', 'equals']
            
            condition_attribute = alert_data.get('condition_attribute')
            if not condition_attribute or condition_attribute not in valid_attributes:
                logger.error(f"Invalid condition_attribute: {condition_attribute}. Valid values: {valid_attributes}")
                raise ValueError(f"Invalid condition_attribute: {condition_attribute}")
            
            condition_operator = alert_data.get('condition_operator')
            if not condition_operator or condition_operator not in valid_operators:
                logger.error(f"Invalid condition_operator: {condition_operator}. Valid values: {valid_operators}")
                raise ValueError(f"Invalid condition_operator: {condition_operator}")
            
            # Validate condition_number is numeric
            condition_number = alert_data.get('condition_number')
            if condition_number:
                try:
                    float(condition_number)
                except (ValueError, TypeError):
                    logger.error(f"Invalid condition_number: {condition_number}")
                    raise ValueError(f"Invalid condition_number: {condition_number}")
                
        except Exception as e:
            logger.error(f"Error processing condition fields: {e}")
            logger.error(f"Alert data at error: {alert_data}")
            raise
    
    @staticmethod
    def _validate_expiry_date(alert_data: Dict[str, Any]) -> None:
        """Validate expiry_date format (YYYY-MM-DD) if provided"""
        try:
            if 'expiry_date' in alert_data and alert_data['expiry_date']:
                expiry_date = alert_data['expiry_date']
                
                # Allow empty string or None (no expiration)
                if expiry_date == '' or expiry_date is None:
                    alert_data['expiry_date'] = None
                    return
                
                # Validate format YYYY-MM-DD
                import re
                date_pattern = r'^\d{4}-\d{2}-\d{2}$'
                if not re.match(date_pattern, expiry_date):
                    raise ValueError(f"Invalid expiry_date format: {expiry_date}. Expected YYYY-MM-DD")
                
                # Validate that it's a valid date
                try:
                    datetime.strptime(expiry_date, '%Y-%m-%d')
                except ValueError:
                    raise ValueError(f"Invalid expiry_date value: {expiry_date}. Not a valid date")
        except Exception as e:
            logger.error(f"Error validating expiry_date: {e}")
            raise
    
    @staticmethod
    def get_alert_by_condition(db: Session, plan_condition_id: int = None, trade_condition_id: int = None) -> Optional[Alert]:
        """מצא התראה לפי תנאי"""
        try:
            if plan_condition_id:
                alert = db.query(Alert).filter(Alert.plan_condition_id == plan_condition_id).first()
            elif trade_condition_id:
                alert = db.query(Alert).filter(Alert.trade_condition_id == trade_condition_id).first()
            else:
                return None
            
            return alert
        except Exception as e:
            logger.error(f"Error finding alert by condition: {e}")
            return None
    
    @staticmethod
    def create_or_update_alert_for_condition(db: Session, condition_id: int, condition_type: str, alert_data: Dict) -> Alert:
        """צור או עדכן התראה לתנאי"""
        try:
            # Check if alert already exists
            if condition_type == 'plan':
                existing_alert = db.query(Alert).filter(Alert.plan_condition_id == condition_id).first()
            else:
                existing_alert = db.query(Alert).filter(Alert.trade_condition_id == condition_id).first()
            
            if existing_alert:
                # Update existing alert
                for key, value in alert_data.items():
                    if hasattr(existing_alert, key):
                        setattr(existing_alert, key, value)
                db.commit()
                db.refresh(existing_alert)
                logger.info(f"Updated existing alert {existing_alert.id} for condition {condition_id}")
                return existing_alert
            else:
                # Create new alert
                if condition_type == 'plan':
                    alert_data['plan_condition_id'] = condition_id
                else:
                    alert_data['trade_condition_id'] = condition_id
                
                alert = Alert(**alert_data)
                db.add(alert)
                db.commit()
                db.refresh(alert)
                logger.info(f"Created new alert {alert.id} for condition {condition_id}")
                return alert
                
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating/updating alert for condition: {e}")
            raise
    
    @staticmethod
    def reactivate_alert(db: Session, alert_id: int) -> Alert:
        """הפעל התראה מחדש (true -> new)"""
        try:
            alert = db.query(Alert).filter(Alert.id == alert_id).first()
            if not alert:
                raise ValueError(f"Alert {alert_id} not found")
            
            alert.is_triggered = 'new'
            alert.triggered_at = datetime.now()
            alert.status = 'open'  # Reopen if it was closed
            
            db.commit()
            db.refresh(alert)
            
            logger.info(f"Alert {alert_id} reactivated")
            return alert
        except Exception as e:
            db.rollback()
            logger.error(f"Error reactivating alert {alert_id}: {e}")
            raise
    
    @staticmethod
    def cancel_condition_alerts(db: Session, plan_condition_id: int = None, trade_condition_id: int = None) -> int:
        """בטל (status=closed) התראות של תנאי"""
        try:
            if plan_condition_id:
                alerts = db.query(Alert).filter(Alert.plan_condition_id == plan_condition_id).all()
            elif trade_condition_id:
                alerts = db.query(Alert).filter(Alert.trade_condition_id == trade_condition_id).all()
            else:
                return 0
            
            count = 0
            for alert in alerts:
                alert.status = 'closed'
                count += 1
            
            db.commit()
            logger.info(f"Cancelled {count} alerts for condition")
            return count
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error cancelling condition alerts: {e}")
            raise
    
    @staticmethod
    def delete_condition_alerts(db: Session, plan_condition_id: int = None, trade_condition_id: int = None) -> int:
        """מחק התראות של תנאי"""
        try:
            if plan_condition_id:
                alerts = db.query(Alert).filter(Alert.plan_condition_id == plan_condition_id).all()
            elif trade_condition_id:
                alerts = db.query(Alert).filter(Alert.trade_condition_id == trade_condition_id).all()
            else:
                return 0
            
            count = len(alerts)
            for alert in alerts:
                db.delete(alert)
            
            db.commit()
            logger.info(f"Deleted {count} alerts for condition")
            return count
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting condition alerts: {e}")
            raise

    @staticmethod
    def default_condition_stats() -> Dict[str, Any]:
        return {
            'total': 0,
            'open': 0,
            'closed': 0,
            'triggered': 0,
            'last_triggered_at': None
        }

    @staticmethod
    def get_condition_alert_stats(
        db: Session,
        condition_ids: List[int],
        condition_type: str = 'plan'
    ) -> Dict[int, Dict[str, Any]]:
        """Return aggregated alert statistics for the provided condition IDs."""
        if not condition_ids:
            return {}

        # Determine which column to aggregate on
        condition_column = Alert.plan_condition_id if condition_type == 'plan' else Alert.trade_condition_id

        try:
            rows = (
                db.query(
                    condition_column.label('condition_id'),
                    func.count(Alert.id).label('total_alerts'),
                    func.sum(case((Alert.status == 'closed', 1), else_=0)).label('closed_alerts'),
                    func.sum(case((Alert.status != 'closed', 1), else_=0)).label('open_alerts'),
                    func.sum(case((Alert.is_triggered == 'true', 1), else_=0)).label('triggered_alerts'),
                    func.max(Alert.triggered_at).label('last_triggered_at')
                )
                .filter(condition_column.in_(condition_ids))
                .group_by(condition_column)
                .all()
            )

            stats_map: Dict[int, Dict[str, Any]] = {}
            for row in rows:
                stats_map[row.condition_id] = {
                    'total': int(row.total_alerts or 0),
                    'open': int(row.open_alerts or 0),
                    'closed': int(row.closed_alerts or 0),
                    'triggered': int(row.triggered_alerts or 0),
                    'last_triggered_at': row.last_triggered_at.isoformat() if row.last_triggered_at else None
                }

            return stats_map
        except Exception as exc:
            logger.error(f"Error aggregating alert stats for conditions: {exc}")
            raise

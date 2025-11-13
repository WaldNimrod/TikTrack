"""
Condition Evaluation Background Task - TikTrack
==============================================

Background task for automatic evaluation of trading conditions.
Runs every 15-30 minutes to check all active conditions against market data.

Features:
- Automatic condition evaluation
- Alert generation when conditions are met
- Comprehensive logging
- Error handling and recovery

Author: TikTrack Development Team
Version: 1.0
Date: October 2025
"""

import logging
from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from services.condition_evaluator import ConditionEvaluator
from services.alert_service import AlertService
from config.database import get_db

logger = logging.getLogger(__name__)

def condition_evaluation_task():
    """
    Background task to evaluate all active conditions and create alerts
    """
    task_start_time = datetime.now(timezone.utc)
    logger.info("🔄 Starting condition evaluation task...")
    
    try:
        # Get database session
        db_session = next(get_db())
        
        # Initialize services
        evaluator = ConditionEvaluator(db_session)
        alert_service = AlertService(db_session)
        
        # Evaluate all active conditions
        evaluation_results = evaluator.evaluate_all_active_conditions()
        
        # Process results and create alerts
        alerts_created = 0
        conditions_met = 0
        errors = 0
        
        for result in evaluation_results:
            try:
                condition_id = result.get('condition_id')
                condition_type = result.get('condition_type', 'plan')
                condition_met = result.get('met', False)
                
                if condition_met:
                    conditions_met += 1
                
                # Check if auto-generate alerts is enabled for this condition
                auto_generate = True  # Default to True
                condition = None
                try:
                    if condition_type == 'plan':
                        from models.plan_condition import PlanCondition
                        condition = db_session.query(PlanCondition).filter(PlanCondition.id == condition_id).first()
                        if condition:
                            auto_generate = condition.auto_generate_alerts
                            result.setdefault('plan_id', getattr(condition, 'trade_plan_id', None))
                    else:
                        from models.trade_condition import TradeCondition
                        condition = db_session.query(TradeCondition).filter(TradeCondition.id == condition_id).first()
                        if condition:
                            auto_generate = condition.auto_generate_alerts
                            result.setdefault('trade_id', getattr(condition, 'trade_id', None))
                except Exception as e:
                    logger.warning(f"⚠️ Could not check auto_generate_alerts for condition {condition_id}: {str(e)}")
                
                # Process alert lifecycle
                if auto_generate:
                    alert_result = process_condition_alert_lifecycle(
                        alert_service, 
                        result, 
                        db_session
                    )
                    
                    if alert_result.get('success', False):
                        if alert_result.get('action') == 'created':
                            alerts_created += 1
                        logger.info(f"✅ Alert processed for condition {condition_id}: {alert_result.get('message')}")
                    else:
                        logger.warning(f"⚠️ Failed to process alert for condition {condition_id}: {alert_result.get('error')}")
                else:
                    logger.info(f"ℹ️ Auto-generate alerts disabled for condition {condition_id}, skipping alert processing")
                
            except Exception as e:
                errors += 1
                logger.error(f"❌ Error processing condition {result.get('condition_id', 'unknown')}: {str(e)}")
        
        # Log task completion
        task_duration = (datetime.now(timezone.utc) - task_start_time).total_seconds()
        logger.info(f"✅ Condition evaluation task completed in {task_duration:.2f}s")
        logger.info(f"📊 Results: {conditions_met} conditions met, {alerts_created} alerts created, {errors} errors")
        
        return {
            'success': True,
            'conditions_evaluated': len(evaluation_results),
            'conditions_met': conditions_met,
            'alerts_created': alerts_created,
            'errors': errors,
            'duration_seconds': task_duration
        }
        
    except Exception as e:
        logger.error(f"❌ Condition evaluation task failed: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'duration_seconds': (datetime.now(timezone.utc) - task_start_time).total_seconds()
        }

def process_condition_alert_lifecycle(alert_service, result: Dict[str, Any], db_session) -> Dict[str, Any]:
    """
    Process alert lifecycle for condition evaluation
    
    Args:
        alert_service: AlertService instance
        result: Evaluation result
        db_session: Database session
        
    Returns:
        Result dictionary with success status and details
    """
    try:
        condition_id = result.get('condition_id')
        condition_type = result.get('condition_type', 'plan')
        condition_met = result.get('met', False)
        
        # Check if alert already exists for this condition
        existing_alert = alert_service.get_alert_by_condition(
            db_session, 
            plan_condition_id=condition_id if condition_type == 'plan' else None,
            trade_condition_id=condition_id if condition_type == 'trade' else None
        )
        
        related_type_id = 3 if condition_type == 'plan' else 2
        related_id = None
        if condition_type == 'plan':
            related_id = result.get('plan_id')
        else:
            related_id = result.get('trade_id')
        if related_id is None:
            related_id = condition_id

        if not existing_alert:
            # No existing alert - create one if condition is met
            if condition_met:
                alert_data = {
                    'message': generate_alert_message(
                        result.get('method_name', 'Unknown'),
                        result.get('current_price', 0),
                        result.get('details', {}),
                        condition_type
                    ),
                    'related_id': related_id,
                    'related_type_id': related_type_id,
                    'condition_attribute': 'price',
                    'condition_operator': 'more_than',
                    'condition_number': str(result.get('current_price', 0)),
                    'status': 'open',
                    'is_triggered': 'new',  # Immediately triggered
                    'triggered_at': datetime.now(timezone.utc)
                }
                
                alert = alert_service.create_or_update_alert_for_condition(
                    db_session, condition_id, condition_type, alert_data
                )
                
                return {
                    'success': True,
                    'action': 'created',
                    'alert_id': alert.id,
                    'message': f'Alert created and triggered for condition {condition_id}'
                }
            else:
                # Condition not met, no alert needed yet
                return {
                    'success': True,
                    'action': 'none',
                    'message': f'Condition {condition_id} not met, no alert needed'
                }
        else:
            # Alert exists - handle lifecycle
            if condition_met:
                # Condition is met
                if existing_alert.is_triggered == 'false':
                    # Alert was waiting - trigger it
                    existing_alert.is_triggered = 'new'
                    existing_alert.triggered_at = datetime.now(timezone.utc)
                    db_session.commit()
                    
                    return {
                        'success': True,
                        'action': 'triggered',
                        'alert_id': existing_alert.id,
                        'message': f'Alert triggered for condition {condition_id}'
                    }
                elif existing_alert.is_triggered == 'true':
                    # Alert was read - check cooldown and reactivate if needed
                    cooldown_minutes = get_condition_alert_cooldown(db_session)
                    if should_reactivate_alert(existing_alert, cooldown_minutes):
                        alert_service.reactivate_alert(db_session, existing_alert.id)
                        return {
                            'success': True,
                            'action': 'reactivated',
                            'alert_id': existing_alert.id,
                            'message': f'Alert reactivated for condition {condition_id}'
                        }
                    else:
                        return {
                            'success': True,
                            'action': 'cooldown',
                            'message': f'Alert for condition {condition_id} in cooldown period'
                        }
                elif existing_alert.is_triggered == 'new':
                    # Alert already active - do nothing
                    return {
                        'success': True,
                        'action': 'none',
                        'message': f'Alert for condition {condition_id} already active'
                    }
            else:
                # Condition not met - do nothing
                return {
                    'success': True,
                    'action': 'none',
                    'message': f'Condition {condition_id} not met, alert remains {existing_alert.is_triggered}'
                }
                
    except Exception as e:
        logger.error(f"Error processing alert lifecycle: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def get_condition_alert_cooldown(db_session) -> int:
    """Get cooldown minutes from preferences"""
    try:
        from services.preferences_service import PreferencesService
        preferences_service = PreferencesService()
        cooldown = preferences_service.get_preference_value(
            db_session, 'condition_alert_cooldown_minutes', 60
        )
        return int(cooldown)
    except Exception as e:
        logger.warning(f"Could not get cooldown preference, using default: {e}")
        return 60

def should_reactivate_alert(alert, cooldown_minutes: int) -> bool:
    """Check if alert should be reactivated based on cooldown"""
    if not alert.triggered_at:
        return True
    
    time_since_triggered = datetime.now(timezone.utc) - alert.triggered_at
    return time_since_triggered.total_seconds() >= (cooldown_minutes * 60)

def create_alert_from_condition(alert_service: AlertService, evaluation_result: Dict[str, Any], db_session: Session) -> Dict[str, Any]:
    """
    Create alert from condition evaluation result
    
    Args:
        alert_service: AlertService instance
        evaluation_result: Result from condition evaluation
        db_session: Database session
        
    Returns:
        Dict with alert creation result
    """
    try:
        condition_id = evaluation_result.get('condition_id')
        condition_type = evaluation_result.get('condition_type', 'plan')
        method_name = evaluation_result.get('method_name', 'Unknown')
        current_price = evaluation_result.get('current_price', 0)
        details = evaluation_result.get('details', {})
        
        # Generate alert message
        alert_message = generate_alert_message(method_name, current_price, details, condition_type)
        
        # Determine related_type_id based on condition type
        # Assuming we have note_relation_types table with IDs for plan/trade conditions
        related_type_id = 4 if condition_type == 'plan' else 5  # Adjust based on your note_relation_types
        
        # Create alert data
        alert_data = {
            'message': alert_message,
            'related_id': condition_id,
            'related_type_id': related_type_id,
            'condition_attribute': 'price',
            'condition_operator': 'more_than',
            'condition_number': str(current_price),
            'status': 'open',
            'is_triggered': 'true',
            'triggered_at': datetime.now(timezone.utc)
        }
        
        # Create alert
        alert = alert_service.create_alert(alert_data)
        
        if alert:
            return {
                'success': True,
                'alert_id': alert.id,
                'message': 'Alert created successfully'
            }
        else:
            return {
                'success': False,
                'error': 'Failed to create alert'
            }
            
    except Exception as e:
        logger.error(f"Error creating alert from condition: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def generate_alert_message(method_name: str, current_price: float, details: Dict[str, Any], condition_type: str) -> str:
    """
    Generate human-readable alert message
    
    Args:
        method_name: Trading method name
        current_price: Current price
        details: Evaluation details
        condition_type: 'plan' or 'trade'
        
    Returns:
        Alert message string
    """
    try:
        # Base message
        condition_text = "תכנית מסחר" if condition_type == 'plan' else "טרייד"
        base_message = f"תנאי {method_name} התקיים עבור {condition_text}"
        
        # Add specific details based on method
        if 'moving average' in method_name.lower() or 'ma' in method_name.lower():
            ma_value = details.get('ma_value', 0)
            ma_period = details.get('ma_period', 0)
            comparison_type = details.get('comparison_type', '')
            
            if comparison_type == 'above':
                message = f"{base_message} - מחיר {current_price:.2f} מעל ממוצע {ma_period} ({ma_value:.2f})"
            elif comparison_type == 'below':
                message = f"{base_message} - מחיר {current_price:.2f} מתחת לממוצע {ma_period} ({ma_value:.2f})"
            elif comparison_type == 'cross_up':
                message = f"{base_message} - מחיר {current_price:.2f} חוצה מעל ממוצע {ma_period} ({ma_value:.2f})"
            elif comparison_type == 'cross_down':
                message = f"{base_message} - מחיר {current_price:.2f} חוצה מתחת לממוצע {ma_period} ({ma_value:.2f})"
            else:
                message = f"{base_message} - מחיר {current_price:.2f}, ממוצע {ma_period}: {ma_value:.2f}"
        
        elif 'volume' in method_name.lower():
            current_volume = details.get('current_volume', 0)
            avg_volume = details.get('avg_volume', 0)
            volume_multiplier = details.get('volume_multiplier', 1)
            
            message = f"{base_message} - נפח {current_volume:,} (ממוצע: {avg_volume:,.0f}, {volume_multiplier}x)"
        
        elif 'support' in method_name.lower() or 'resistance' in method_name.lower():
            level_price = details.get('level_price', 0)
            level_type = details.get('level_type', '')
            comparison_type = details.get('comparison_type', '')
            
            level_text = "תמיכה" if level_type == 'support' else "התנגדות"
            if comparison_type == 'near':
                message = f"{base_message} - מחיר {current_price:.2f} ליד {level_text} {level_price:.2f}"
            elif comparison_type == 'break_up':
                message = f"{base_message} - מחיר {current_price:.2f} שובר מעל {level_text} {level_price:.2f}"
            elif comparison_type == 'break_down':
                message = f"{base_message} - מחיר {current_price:.2f} שובר מתחת ל{level_text} {level_price:.2f}"
            else:
                message = f"{base_message} - מחיר {current_price:.2f}, {level_text}: {level_price:.2f}"
        
        elif 'trend' in method_name.lower():
            expected_price = details.get('expected_price', 0)
            trend_slope = details.get('trend_slope', 0)
            
            trend_direction = "עולה" if trend_slope > 0 else "יורד"
            message = f"{base_message} - מחיר {current_price:.2f} על קו מגמה {trend_direction} (צפוי: {expected_price:.2f})"
        
        elif 'pattern' in method_name.lower() or 'technical' in method_name.lower():
            pattern_type = details.get('pattern_type', '')
            confidence = details.get('pattern_confidence', 0)
            
            message = f"{base_message} - זוהה דפוס {pattern_type} (ביטחון: {confidence:.0%})"
        
        elif 'fibonacci' in method_name.lower() or 'golden' in method_name.lower():
            current_retracement = details.get('current_retracement_pct', 0)
            golden_zone_upper = details.get('golden_zone_upper', 0)
            golden_zone_lower = details.get('golden_zone_lower', 0)
            
            message = f"{base_message} - מחיר {current_price:.2f} באזור הזהב ({current_retracement:.1f}% retracement)"
        
        else:
            # Default message
            message = f"{base_message} - מחיר נוכחי: {current_price:.2f}"
        
        return message
        
    except Exception as e:
        logger.error(f"Error generating alert message: {str(e)}")
        return f"תנאי {method_name} התקיים - מחיר: {current_price:.2f}"

def register_condition_evaluation_task(background_task_manager):
    """
    Register the condition evaluation task with the background task manager
    
    Args:
        background_task_manager: BackgroundTaskManager instance
    """
    try:
        background_task_manager.register_task(
            name='condition_evaluation',
            func=condition_evaluation_task,
            schedule_interval='20m',  # Every 20 minutes
            description='Evaluate all active trading conditions and create alerts when conditions are met',
            enabled=True
        )
        logger.info("✅ Condition evaluation task registered successfully")
        
    except Exception as e:
        logger.error(f"❌ Failed to register condition evaluation task: {str(e)}")
        raise

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
                if result.get('met', False):
                    conditions_met += 1
                    
                    # Check if auto-generate alerts is enabled for this condition
                    condition_id = result.get('condition_id')
                    condition_type = result.get('condition_type', 'plan')
                    
                    # Get condition to check auto_generate_alerts setting
                    auto_generate = True  # Default to True
                    try:
                        if condition_type == 'plan':
                            from models.plan_condition import PlanCondition
                            condition = db_session.query(PlanCondition).filter(PlanCondition.id == condition_id).first()
                        else:
                            from models.plan_condition import TradeCondition
                            condition = db_session.query(TradeCondition).filter(TradeCondition.id == condition_id).first()
                        
                        if condition:
                            auto_generate = condition.auto_generate_alerts
                    except Exception as e:
                        logger.warning(f"⚠️ Could not check auto_generate_alerts for condition {condition_id}: {str(e)}")
                    
                    # Create alert only if auto-generate is enabled
                    if auto_generate:
                        alert_result = create_alert_from_condition(
                            alert_service, 
                            result, 
                            db_session
                        )
                        
                        if alert_result.get('success', False):
                            alerts_created += 1
                            logger.info(f"✅ Alert created for condition {condition_id}: {alert_result.get('alert_id')}")
                        else:
                            logger.warning(f"⚠️ Failed to create alert for condition {condition_id}: {alert_result.get('error')}")
                    else:
                        logger.info(f"ℹ️ Auto-generate alerts disabled for condition {condition_id}, skipping alert creation")
                
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

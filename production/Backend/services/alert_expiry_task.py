"""
Alert Expiry Background Task - TikTrack
========================================

Background task for automatic expiration of alerts based on expiry_date.
Runs daily at midnight to cancel alerts that have passed their expiry date.

Features:
- Automatic alert expiration
- Updates status to 'cancelled' and is_triggered to 'false'
- Comprehensive logging
- Error handling and recovery

Author: TikTrack Development Team
Version: 1.0
Date: November 2025
"""

import logging
from datetime import datetime, date, timezone
from typing import Dict, Any
from sqlalchemy.orm import Session

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from models.alert import Alert
from config.database import get_db

logger = logging.getLogger(__name__)

def expire_alerts_task():
    """
    Background task to expire alerts that have passed their expiry_date
    Runs daily at midnight - cancels alerts with expiry_date < current_date
    """
    task_start_time = datetime.now(timezone.utc)
    logger.info("🔄 Starting alert expiry task...")
    
    try:
        # Get database session
        db_session = next(get_db())
        
        # Get current date (date only, no time)
        current_date = date.today()
        current_date_str = current_date.strftime('%Y-%m-%d')
        
        logger.info(f"📅 Checking for alerts expiring before {current_date_str}")
        
        # Find alerts that have expired
        # Query: expiry_date IS NOT NULL AND expiry_date < current_date AND status != 'cancelled'
        expired_alerts = db_session.query(Alert).filter(
            Alert.expiry_date.isnot(None),
            Alert.expiry_date < current_date_str,
            Alert.status != 'cancelled'
        ).all()
        
        alerts_expired = 0
        errors = 0
        
        for alert in expired_alerts:
            try:
                # Update alert status to cancelled and is_triggered to false
                alert.status = 'cancelled'
                alert.is_triggered = 'false'
                
                logger.info(f"✅ Expired alert {alert.id} (expiry_date: {alert.expiry_date})")
                alerts_expired += 1
                
            except Exception as e:
                errors += 1
                logger.error(f"❌ Error expiring alert {alert.id}: {str(e)}")
        
        # Commit all changes
        if alerts_expired > 0:
            db_session.commit()
            logger.info(f"✅ Committed {alerts_expired} expired alert updates")
        else:
            logger.info("ℹ️ No alerts to expire")
        
        # Log task completion
        task_duration = (datetime.now(timezone.utc) - task_start_time).total_seconds()
        logger.info(f"✅ Alert expiry task completed in {task_duration:.2f}s")
        logger.info(f"📊 Results: {alerts_expired} alerts expired, {errors} errors")
        
        return {
            'success': True,
            'alerts_expired': alerts_expired,
            'errors': errors,
            'current_date': current_date_str,
            'duration_seconds': task_duration
        }
        
    except Exception as e:
        logger.error(f"❌ Alert expiry task failed: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'duration_seconds': (datetime.now(timezone.utc) - task_start_time).total_seconds()
        }
    finally:
        # Close database session if it exists
        try:
            db_session.close()
        except:
            pass

def register_alert_expiry_task(background_task_manager):
    """
    Register the alert expiry task with the background task manager
    
    Args:
        background_task_manager: BackgroundTaskManager instance
    """
    try:
        background_task_manager.register_task(
            name='expire_alerts',
            func=expire_alerts_task,
            schedule_interval='1d',  # Daily at midnight
            description='Cancel expired alerts daily at midnight based on expiry_date',
            enabled=True
        )
        logger.info("✅ Alert expiry task registered successfully")
        
    except Exception as e:
        logger.error(f"❌ Failed to register alert expiry task: {str(e)}")
        raise

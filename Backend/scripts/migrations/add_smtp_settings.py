#!/usr/bin/env python3
"""
Add SMTP Settings to System Settings
הוספת הגדרות SMTP למערכת ההגדרות הכלליות

This script creates SMTP settings in the SystemSettings system.

Author: TikTrack Development Team
Version: 1.0.0
Last Updated: January 28, 2025
"""

import sys
import os
from pathlib import Path

# Add Backend to path
backend_path = Path(__file__).parent.parent.parent
sys.path.insert(0, str(backend_path))

from sqlalchemy import text, select
from sqlalchemy.orm import Session
from config.database import get_db
from models.system_settings import SystemSettingGroup, SystemSettingType
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def add_smtp_settings():
    """
    Add SMTP settings to SystemSettings
    
    Creates:
    - Group: smtp_settings
    - Setting types: smtp_host, smtp_port, smtp_user, smtp_password, etc.
    """
    logger.info("=" * 70)
    logger.info("Adding SMTP settings to SystemSettings")
    logger.info("=" * 70)
    
    db = None
    try:
        db = next(get_db())
        
        # 1. Create or get smtp_settings group
        logger.info("Creating smtp_settings group...")
        group = db.scalars(
            select(SystemSettingGroup).where(SystemSettingGroup.name == 'smtp_settings')
        ).first()
        
        if not group:
            group = SystemSettingGroup(
                name='smtp_settings',
                description='SMTP email server configuration settings'
            )
            db.add(group)
            db.commit()
            db.refresh(group)
            logger.info("✅ Created smtp_settings group")
        else:
            logger.info("✅ smtp_settings group already exists")
        
        # 2. Define SMTP setting types
        smtp_settings = [
            {
                'key': 'smtp_host',
                'data_type': 'string',
                'description': 'SMTP server hostname',
                'default_value': 'smtp.gmail.com'
            },
            {
                'key': 'smtp_port',
                'data_type': 'integer',
                'description': 'SMTP server port',
                'default_value': '587'
            },
            {
                'key': 'smtp_user',
                'data_type': 'string',
                'description': 'SMTP username/email',
                'default_value': 'admin@mezoo.co'
            },
            {
                'key': 'smtp_password',
                'data_type': 'string',
                'description': 'SMTP password (encrypted)',
                'default_value': None  # Will be set by setup script
            },
            {
                'key': 'smtp_from_email',
                'data_type': 'string',
                'description': 'From email address',
                'default_value': 'admin@mezoo.co'
            },
            {
                'key': 'smtp_from_name',
                'data_type': 'string',
                'description': 'From name',
                'default_value': 'TikTrack'
            },
            {
                'key': 'smtp_use_tls',
                'data_type': 'boolean',
                'description': 'Use TLS encryption',
                'default_value': 'true'
            },
            {
                'key': 'smtp_enabled',
                'data_type': 'boolean',
                'description': 'Enable SMTP service',
                'default_value': 'true'
            },
            {
                'key': 'smtp_test_email',
                'data_type': 'string',
                'description': 'Test email address for testing',
                'default_value': ''
            }
        ]
        
        # 3. Create setting types
        logger.info("Creating SMTP setting types...")
        created_count = 0
        for setting in smtp_settings:
            existing = db.scalars(
                select(SystemSettingType).where(SystemSettingType.key == setting['key'])
            ).first()
            
            if not existing:
                setting_type = SystemSettingType(
                    group_id=group.id,
                    key=setting['key'],
                    data_type=setting['data_type'],
                    description=setting['description'],
                    default_value=setting['default_value'],
                    is_active=True
                )
                db.add(setting_type)
                created_count += 1
                logger.info(f"  ✅ Created setting type: {setting['key']}")
            else:
                logger.info(f"  ⏭️  Setting type already exists: {setting['key']}")
        
        if created_count > 0:
            db.commit()
            logger.info(f"✅ Created {created_count} new setting types")
        else:
            logger.info("✅ All setting types already exist")
        
        logger.info("=" * 70)
        logger.info("✅ SMTP settings migration completed successfully")
        logger.info("=" * 70)
        return True
        
    except Exception as e:
        logger.error(f"❌ Error adding SMTP settings: {e}")
        import traceback
        logger.error(traceback.format_exc())
        if db:
            db.rollback()
        return False
    finally:
        if db:
            db.close()


if __name__ == "__main__":
    success = add_smtp_settings()
    sys.exit(0 if success else 1)


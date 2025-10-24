#!/usr/bin/env python3
"""
Comprehensive Migration: Add Missing Preference Types
====================================================

This migration adds all the missing preference types that are causing 500 errors
in the preferences system. Based on the browser logs analysis.

Author: TikTrack Development Team
Date: January 23, 2025
Version: 1.0.0
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.database import engine
from sqlalchemy import text
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def add_missing_preferences():
    """Add all missing preference types to the database."""
    
    # Missing preferences identified from browser logs
    missing_preferences = [
        # Critical missing preferences
        {
            'preference_name': 'backgroundColor',
            'description': 'Main background color for the application',
            'data_type': 'string',
            'default_value': '#ffffff',
            'group_id': 12,  # ui_colors
            'is_required': True,
            'constraints': '{"type": "color_format"}'
        },
        {
            'preference_name': 'textColor',
            'description': 'Main text color for the application',
            'data_type': 'string',
            'default_value': '#000000',
            'group_id': 12,  # ui_colors
            'is_required': True,
            'constraints': '{"type": "color_format"}'
        },
        
        # High priority missing preferences
        {
            'preference_name': 'statusPendingColor',
            'description': 'Color for pending status items',
            'data_type': 'string',
            'default_value': '#ffc107',
            'group_id': 12,  # ui_colors (status colors)
            'is_required': True,
            'constraints': '{"type": "color_format"}'
        },
        
        # Medium priority missing preferences
        {
            'preference_name': 'entityInfoColor',
            'description': 'Color for entity information display',
            'data_type': 'string',
            'default_value': '#17a2b8',
            'group_id': 13,  # entity_colors
            'is_required': False,
            'constraints': '{"type": "color_format"}'
        },
        {
            'preference_name': 'entityInfoColorDark',
            'description': 'Dark variant of entity info color',
            'data_type': 'string',
            'default_value': '#0c5460',
            'group_id': 13,  # entity_colors
            'is_required': False,
            'constraints': '{"type": "color_format"}'
        },
        {
            'preference_name': 'entityInfoColorLight',
            'description': 'Light variant of entity info color',
            'data_type': 'string',
            'default_value': '#bee5eb',
            'group_id': 13,  # entity_colors
            'is_required': False,
            'constraints': '{"type": "color_format"}'
        },
        
        # Low priority missing preferences
        {
            'preference_name': 'borderColor',
            'description': 'Color for borders and outlines',
            'data_type': 'string',
            'default_value': '#dee2e6',
            'group_id': 12,  # ui_colors
            'is_required': False,
            'constraints': '{"type": "color_format"}'
        },
        {
            'preference_name': 'shadowColor',
            'description': 'Color for shadows and depth effects',
            'data_type': 'string',
            'default_value': '#00000020',
            'group_id': 12,  # ui_colors
            'is_required': False,
            'constraints': '{"type": "color_format"}'
        },
        {
            'preference_name': 'highlightColor',
            'description': 'Color for highlighting selected items',
            'data_type': 'string',
            'default_value': '#007bff',
            'group_id': 12,  # ui_colors
            'is_required': False,
            'constraints': '{"type": "color_format"}'
        }
    ]
    
    try:
        # Use database engine
        with engine.connect() as conn:
            logger.info("🚀 Starting comprehensive preference migration...")
            
            # Start transaction
            trans = conn.begin()
            
            try:
                added_count = 0
                skipped_count = 0
                
                for pref in missing_preferences:
                    # Check if preference already exists
                    check_query = text("""
                        SELECT COUNT(*) FROM preference_types 
                        WHERE preference_name = :preference_name
                    """)
                    
                    result = conn.execute(check_query, {"preference_name": pref['preference_name']}).fetchone()
                    
                    if result[0] > 0:
                        logger.info(f"⏭️  Skipping {pref['preference_name']} - already exists")
                        skipped_count += 1
                        continue
                    
                    # Insert new preference type
                    insert_query = text("""
                        INSERT INTO preference_types (
                            group_id, preference_name, description, data_type, 
                            default_value, is_required, constraints
                        ) VALUES (
                            :group_id, :preference_name, :description, :data_type,
                            :default_value, :is_required, :constraints
                        )
                    """)
                    
                    conn.execute(insert_query, {
                        "group_id": pref['group_id'],
                        "preference_name": pref['preference_name'],
                        "description": pref['description'],
                        "data_type": pref['data_type'],
                        "default_value": pref['default_value'],
                        "is_required": pref['is_required'],
                        "constraints": pref['constraints']
                    })
                    
                    # Get the preference_id that was just inserted
                    get_id_query = text("""
                        SELECT id FROM preference_types 
                        WHERE preference_name = :preference_name
                    """)
                    
                    pref_id_result = conn.execute(get_id_query, {"preference_name": pref['preference_name']}).fetchone()
                    preference_id = pref_id_result[0]
                    
                    # Insert default user preference
                    user_pref_query = text("""
                        INSERT INTO user_preferences_v3 (
                            user_id, profile_id, preference_id, saved_value
                        ) VALUES (
                            1, 3, :preference_id, :default_value
                        )
                    """)
                    
                    conn.execute(user_pref_query, {
                        "preference_id": preference_id,
                        "default_value": pref['default_value']
                    })
                    
                    logger.info(f"✅ Added {pref['preference_name']}")
                    added_count += 1
                
                # Commit transaction
                trans.commit()
                
                logger.info(f"🎉 Migration completed successfully!")
                logger.info(f"📊 Added: {added_count} preferences")
                logger.info(f"⏭️  Skipped: {skipped_count} preferences")
                logger.info(f"📋 Total processed: {len(missing_preferences)} preferences")
                
                return True
                
            except Exception as e:
                trans.rollback()
                logger.error(f"❌ Migration failed: {e}")
                return False
                
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        return False

if __name__ == "__main__":
    logger.info("🔧 TikTrack - Comprehensive Preference Migration")
    logger.info("=" * 50)
    
    success = add_missing_preferences()
    
    if success:
        logger.info("✅ Migration completed successfully!")
        sys.exit(0)
    else:
        logger.error("❌ Migration failed!")
        sys.exit(1)

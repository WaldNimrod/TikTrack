"""
Seed Trading Methods Migration
Date: 2025
Description: Seeds initial 6 trading methods with parameters
"""

import sqlite3
import os
import sys
import json
from datetime import datetime

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def seed_trading_methods(connection):
    """Seed initial 6 trading methods with parameters"""
    cursor = connection.cursor()
    
    print("Seeding trading methods...")
    
    # Check if methods already exist
    cursor.execute("SELECT COUNT(*) FROM trading_methods")
    count = cursor.fetchone()[0]
    if count > 0:
        print(f"⚠️ Trading methods already exist ({count} methods). Skipping seeding.")
        return
    
    # Define the 6 trading methods with their parameters
    methods_data = [
        {
            'name_en': 'Moving Averages',
            'name_he': 'ממוצעים נעים',
            'category': 'technical_indicators',
            'description_en': 'Moving average crossovers and price/MA relationships',
            'description_he': 'חציות ממוצעים נעים ויחסי מחיר/ממוצע',
            'icon_class': 'fa-chart-line',
            'sort_order': 1,
            'parameters': [
                {
                    'parameter_key': 'ma_period',
                    'parameter_name_en': 'Period',
                    'parameter_name_he': 'תקופה',
                    'parameter_type': 'period',
                    'default_value': '50',
                    'min_value': '1',
                    'max_value': '500',
                    'is_required': True,
                    'sort_order': 1,
                    'help_text_en': 'Number of periods for moving average calculation',
                    'help_text_he': 'מספר התקופות לחישוב הממוצע הנע'
                },
                {
                    'parameter_key': 'ma_type',
                    'parameter_name_en': 'MA Type',
                    'parameter_name_he': 'סוג ממוצע',
                    'parameter_type': 'dropdown',
                    'default_value': 'SMA',
                    'validation_rule': 'SMA,EMA,WMA',
                    'is_required': True,
                    'sort_order': 2,
                    'help_text_en': 'Type of moving average: Simple, Exponential, or Weighted',
                    'help_text_he': 'סוג הממוצע הנע: פשוט, אקספוננציאלי או משוקלל'
                }
            ]
        },
        {
            'name_en': 'Volume Analysis',
            'name_he': 'ניתוח נפח',
            'category': 'volume_analysis',
            'description_en': 'Volume-based conditions and analysis',
            'description_he': 'תנאים וניתוח מבוססי נפח',
            'icon_class': 'fa-chart-bar',
            'sort_order': 2,
            'parameters': [
                {
                    'parameter_key': 'volume_threshold',
                    'parameter_name_en': 'Volume Threshold',
                    'parameter_name_he': 'סף נפח',
                    'parameter_type': 'number',
                    'default_value': '1000000',
                    'min_value': '1',
                    'is_required': True,
                    'sort_order': 1,
                    'help_text_en': 'Minimum volume threshold for condition',
                    'help_text_he': 'סף נפח מינימלי לתנאי'
                },
                {
                    'parameter_key': 'comparison_period',
                    'parameter_name_en': 'Comparison Period',
                    'parameter_name_he': 'תקופת השוואה',
                    'parameter_type': 'period',
                    'default_value': '20',
                    'min_value': '1',
                    'max_value': '100',
                    'is_required': True,
                    'sort_order': 2,
                    'help_text_en': 'Number of days to compare volume against',
                    'help_text_he': 'מספר ימים להשוואת הנפח'
                }
            ]
        },
        {
            'name_en': 'Support & Resistance',
            'name_he': 'תמיכה והתנגדות',
            'category': 'support_resistance',
            'description_en': 'Support and resistance level analysis',
            'description_he': 'ניתוח רמות תמיכה והתנגדות',
            'icon_class': 'fa-chart-area',
            'sort_order': 3,
            'parameters': [
                {
                    'parameter_key': 'level_price',
                    'parameter_name_en': 'Level Price',
                    'parameter_name_he': 'מחיר רמה',
                    'parameter_type': 'price',
                    'is_required': True,
                    'sort_order': 1,
                    'help_text_en': 'Support or resistance level price',
                    'help_text_he': 'מחיר רמת התמיכה או ההתנגדות'
                },
                {
                    'parameter_key': 'tolerance_percentage',
                    'parameter_name_en': 'Tolerance %',
                    'parameter_name_he': 'סובלנות %',
                    'parameter_type': 'percentage',
                    'default_value': '0.5',
                    'min_value': '0.1',
                    'max_value': '5.0',
                    'is_required': True,
                    'sort_order': 2,
                    'help_text_en': 'Tolerance percentage for level touch',
                    'help_text_he': 'אחוז סובלנות למגע ברמה'
                }
            ]
        },
        {
            'name_en': 'Trend Lines',
            'name_he': 'קווי מגמה',
            'category': 'trend_analysis',
            'description_en': 'Trend line analysis and breakouts',
            'description_he': 'ניתוח קווי מגמה ושבירות',
            'icon_class': 'fa-chart-line',
            'sort_order': 4,
            'parameters': [
                {
                    'parameter_key': 'start_price',
                    'parameter_name_en': 'Start Price',
                    'parameter_name_he': 'מחיר התחלה',
                    'parameter_type': 'price',
                    'is_required': True,
                    'sort_order': 1,
                    'help_text_en': 'Starting price of the trend line',
                    'help_text_he': 'מחיר ההתחלה של קו המגמה'
                },
                {
                    'parameter_key': 'end_price',
                    'parameter_name_en': 'End Price',
                    'parameter_name_he': 'מחיר סיום',
                    'parameter_type': 'price',
                    'is_required': True,
                    'sort_order': 2,
                    'help_text_en': 'Ending price of the trend line',
                    'help_text_he': 'מחיר הסיום של קו המגמה'
                },
                {
                    'parameter_key': 'tolerance_percentage',
                    'parameter_name_en': 'Tolerance %',
                    'parameter_name_he': 'סובלנות %',
                    'parameter_type': 'percentage',
                    'default_value': '1.0',
                    'min_value': '0.1',
                    'max_value': '5.0',
                    'is_required': True,
                    'sort_order': 3,
                    'help_text_en': 'Tolerance percentage for trend line touch',
                    'help_text_he': 'אחוז סובלנות למגע בקו המגמה'
                }
            ]
        },
        {
            'name_en': 'Technical Patterns',
            'name_he': 'מבנים טכניים',
            'category': 'price_patterns',
            'description_en': 'Technical chart pattern recognition',
            'description_he': 'זיהוי מבנים טכניים בגרף',
            'icon_class': 'fa-shapes',
            'sort_order': 5,
            'parameters': [
                {
                    'parameter_key': 'pattern_type',
                    'parameter_name_en': 'Pattern Type',
                    'parameter_name_he': 'סוג מבנה',
                    'parameter_type': 'dropdown',
                    'default_value': 'cup_and_handle',
                    'validation_rule': 'cup_and_handle,head_and_shoulders,inverse_head_and_shoulders,double_top,double_bottom,triangle,flag',
                    'is_required': True,
                    'sort_order': 1,
                    'help_text_en': 'Type of technical pattern to detect',
                    'help_text_he': 'סוג המבנה הטכני לזיהוי'
                },
                {
                    'parameter_key': 'timeframe',
                    'parameter_name_en': 'Timeframe (Days)',
                    'parameter_name_he': 'מסגרת זמן (ימים)',
                    'parameter_type': 'period',
                    'default_value': '30',
                    'min_value': '5',
                    'max_value': '365',
                    'is_required': True,
                    'sort_order': 2,
                    'help_text_en': 'Timeframe in days for pattern formation',
                    'help_text_he': 'מסגרת זמן בימים להיווצרות המבנה'
                }
            ]
        },
        {
            'name_en': 'Fibonacci & Golden Zone',
            'name_he': 'פיבונאצ\'י ואזור הזהב',
            'category': 'fibonacci',
            'description_en': 'Fibonacci retracement levels and golden zone analysis',
            'description_he': 'רמות פיבונאצ\'י ואזור הזהב',
            'icon_class': 'fa-chart-pie',
            'sort_order': 6,
            'parameters': [
                {
                    'parameter_key': 'swing_high',
                    'parameter_name_en': 'Swing High',
                    'parameter_name_he': 'גבוה של תנודה',
                    'parameter_type': 'price',
                    'is_required': True,
                    'sort_order': 1,
                    'help_text_en': 'Highest price point for Fibonacci calculation',
                    'help_text_he': 'נקודת המחיר הגבוהה ביותר לחישוב פיבונאצ\'י'
                },
                {
                    'parameter_key': 'swing_low',
                    'parameter_name_en': 'Swing Low',
                    'parameter_name_he': 'נמוך של תנודה',
                    'parameter_type': 'price',
                    'is_required': True,
                    'sort_order': 2,
                    'help_text_en': 'Lowest price point for Fibonacci calculation',
                    'help_text_he': 'נקודת המחיר הנמוכה ביותר לחישוב פיבונאצ\'י'
                },
                {
                    'parameter_key': 'retracement_levels',
                    'parameter_name_en': 'Retracement Levels',
                    'parameter_name_he': 'רמות רטרייסמנט',
                    'parameter_type': 'dropdown',
                    'default_value': '23.6,38.2,50.0,61.8,78.6',
                    'validation_rule': '23.6,38.2,50.0,61.8,78.6',
                    'is_required': True,
                    'sort_order': 3,
                    'help_text_en': 'Fibonacci retracement levels to monitor',
                    'help_text_he': 'רמות הפיבונאצ\'י למעקב'
                }
            ]
        }
    ]
    
    # Insert methods and their parameters
    for method_data in methods_data:
        print(f"Inserting method: {method_data['name_en']}")
        
        # Insert method
        cursor.execute("""
            INSERT INTO trading_methods 
            (name_en, name_he, category, description_en, description_he, icon_class, sort_order, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            method_data['name_en'],
            method_data['name_he'],
            method_data['category'],
            method_data['description_en'],
            method_data['description_he'],
            method_data['icon_class'],
            method_data['sort_order'],
            True
        ))
        
        method_id = cursor.lastrowid
        
        # Insert parameters
        for param_data in method_data['parameters']:
            cursor.execute("""
                INSERT INTO method_parameters 
                (method_id, parameter_key, parameter_name_en, parameter_name_he, 
                 parameter_type, default_value, min_value, max_value, validation_rule,
                 is_required, sort_order, help_text_en, help_text_he)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                method_id,
                param_data['parameter_key'],
                param_data['parameter_name_en'],
                param_data['parameter_name_he'],
                param_data['parameter_type'],
                param_data.get('default_value'),
                param_data.get('min_value'),
                param_data.get('max_value'),
                param_data.get('validation_rule'),
                param_data['is_required'],
                param_data['sort_order'],
                param_data.get('help_text_en'),
                param_data.get('help_text_he')
            ))
    
    connection.commit()
    print("✅ Trading methods seeded successfully!")

def clear_trading_methods(connection):
    """Clear all trading methods and parameters"""
    cursor = connection.cursor()
    
    print("Clearing trading methods...")
    
    # Delete in reverse order (respecting foreign key constraints)
    cursor.execute("DELETE FROM method_parameters")
    cursor.execute("DELETE FROM trading_methods")
    
    connection.commit()
    print("✅ Trading methods cleared successfully!")

def main():
    """Run seeding directly"""
    # Get database path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(current_dir, "..", "db", "simpleTrade_new.db")
    
    if not os.path.exists(db_path):
        print(f"❌ Database not found at {db_path}")
        return
    
    # Connect to database
    connection = sqlite3.connect(db_path)
    
    try:
        seed_trading_methods(connection)
        print("Seeding completed successfully!")
    except Exception as e:
        print(f"❌ Seeding failed: {e}")
        connection.rollback()
    finally:
        connection.close()

if __name__ == "__main__":
    main()

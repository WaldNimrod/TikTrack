#!/usr/bin/env python3
"""
Script to add 6 diverse sample alerts covering all constraints
"""
import sqlite3
import os
from datetime import datetime, timedelta

def add_sample_alerts():
    # Path to database
    db_path = 'db/simpleTrade_new.db'
    
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("Adding 6 diverse sample alerts...")
    
    # Sample alerts data - covering all constraints
    sample_alerts = [
        {
            'type': 'price_alert',
            'condition_attribute': 'price',
            'condition_operator': 'more_than',
            'condition_number': '180.50',
            'message': 'AAPL הגיע ליעד מחיר של 180.50',
            'related_type_id': 4,  # ticker
            'related_id': 1,
            'status': 'open',
            'is_triggered': 'false'
        },
        {
            'type': 'stop_loss',
            'condition_attribute': 'price',
            'condition_operator': 'less_than',
            'condition_number': '150.00',
            'message': 'TSLA מתחת לסטופ לוס של 150.00',
            'related_type_id': 2,  # trade
            'related_id': 1,
            'status': 'open',
            'is_triggered': 'false'
        },
        {
            'type': 'volume_alert',
            'condition_attribute': 'volume',
            'condition_operator': 'more_than',
            'condition_number': '1000000',
            'message': 'נפח מסחר גבוה ב-NVDA',
            'related_type_id': 4,  # ticker
            'related_id': 2,
            'status': 'open',
            'is_triggered': 'false'
        },
        {
            'type': 'custom_alert',
            'condition_attribute': 'change',
            'condition_operator': 'more_than',
            'condition_number': '5.0',
            'message': 'שינוי יומי של יותר מ-5% ב-META',
            'related_type_id': 3,  # trade plan
            'related_id': 1,
            'status': 'open',
            'is_triggered': 'false'
        },
        {
            'type': 'price_alert',
            'condition_attribute': 'ma',
            'condition_operator': 'cross_up',
            'condition_number': '200.00',
            'message': 'ממוצע נע חוצה למעלה 200.00 ב-GOOGL',
            'related_type_id': 4,  # ticker
            'related_id': 3,
            'status': 'open',
            'is_triggered': 'false'
        },
        {
            'type': 'custom_alert',
            'condition_attribute': 'price',
            'condition_operator': 'equals',
            'condition_number': '100.00',
            'message': 'מחיר שווה בדיוק 100.00 ב-AMZN',
            'related_type_id': 1,  # account
            'related_id': 1,
            'status': 'open',
            'is_triggered': 'false'
        }
    ]
    
    # Insert sample alerts
    for i, alert_data in enumerate(sample_alerts, 1):
        # Create legacy condition string for backward compatibility
        legacy_condition = f"{alert_data['condition_attribute']} | {alert_data['condition_operator']} | {alert_data['condition_number']}"
        
        cursor.execute("""
            INSERT INTO alerts (
                type, condition, condition_attribute, condition_operator, condition_number,
                message, related_type_id, related_id, status, is_triggered,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            alert_data['type'],
            legacy_condition,
            alert_data['condition_attribute'],
            alert_data['condition_operator'],
            alert_data['condition_number'],
            alert_data['message'],
            alert_data['related_type_id'],
            alert_data['related_id'],
            alert_data['status'],
            alert_data['is_triggered'],
            datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        ))
        
        print(f"✅ Added alert {i}: {alert_data['type']} - {alert_data['condition_attribute']} {alert_data['condition_operator']} {alert_data['condition_number']}")
    
    # Commit changes
    conn.commit()
    
    # Show results
    cursor.execute("SELECT COUNT(*) FROM alerts")
    total_alerts = cursor.fetchone()[0]
    
    print(f"\n📊 Total alerts in database: {total_alerts}")
    
    # Show sample of alerts
    cursor.execute("""
        SELECT id, type, condition_attribute, condition_operator, condition_number, 
               related_type_id, status, is_triggered 
        FROM alerts 
        ORDER BY id DESC 
        LIMIT 10
    """)
    
    print("\n📋 Recent alerts:")
    for row in cursor.fetchall():
        print(f"  - ID: {row[0]}, Type: {row[1]}, Condition: {row[2]} {row[3]} {row[4]}, Related: {row[5]}, Status: {row[6]}")
    
    conn.close()
    print("\n✅ Sample alerts added successfully!")

if __name__ == "__main__":
    add_sample_alerts()

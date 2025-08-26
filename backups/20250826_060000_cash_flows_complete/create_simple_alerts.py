#!/usr/bin/env python3
"""
Script to create 10 simple alerts using allowed condition values
"""
import sqlite3
import os
from datetime import datetime, timedelta

def create_simple_alerts():
    # Path to database
    db_path = 'db/simpleTrade_new.db'
    
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("Creating 10 simple alerts...")
    
    # Simple alerts data using new condition fields
    simple_alerts = [
        # 1. Price Alert - Ticker (AAPL)
        {
            'type': 'price_alert',
            'condition_attribute': 'price',
            'condition_operator': 'more_than',
            'condition_number': '180.50',
            'message': 'AAPL הגיע ליעד מחיר של 180.50',
            'related_type_id': 4,  # ticker
            'related_id': 1,
            'status': 'open',
            'is_triggered': 'false',
            'created_at': (datetime.now() - timedelta(hours=2)).strftime('%Y-%m-%d %H:%M:%S')
        },
        
        # 2. Stop Loss - Trade (TSLA)
        {
            'type': 'stop_loss',
            'condition_attribute': 'price',
            'condition_operator': 'less_than',
            'condition_number': '150.00',
            'message': 'TSLA מתחת לסטופ לוס של 150.00',
            'related_type_id': 2,  # trade
            'related_id': 1,
            'status': 'open',
            'is_triggered': 'false',
            'created_at': (datetime.now() - timedelta(hours=4)).strftime('%Y-%m-%d %H:%M:%S')
        },
        
        # 3. Volume Alert - Ticker (NVDA)
        {
            'type': 'volume_alert',
            'condition_attribute': 'volume',
            'condition_operator': 'more_than',
            'condition_number': '1000000',
            'message': 'נפח מסחר גבוה ב-NVDA',
            'related_type_id': 4,  # ticker
            'related_id': 5,
            'status': 'open',
            'is_triggered': 'false',
            'created_at': (datetime.now() - timedelta(hours=6)).strftime('%Y-%m-%d %H:%M:%S')
        },
        
        # 4. Custom Alert - Trade Plan (META)
        {
            'type': 'custom_alert',
            'condition_attribute': 'change',
            'condition_operator': 'more_than',
            'condition_number': '5.0',
            'message': 'שינוי יומי חיובי ב-META',
            'related_type_id': 3,  # trade plan
            'related_id': 1,
            'status': 'open',
            'is_triggered': 'false',
            'created_at': (datetime.now() - timedelta(hours=8)).strftime('%Y-%m-%d %H:%M:%S')
        },
        
        # 5. Moving Average Alert - Ticker (GOOGL)
        {
            'type': 'price_alert',
            'condition_attribute': 'ma',
            'condition_operator': 'cross_up',
            'condition_number': '200.00',
            'message': 'ממוצע נע חוצה 200.00 ב-GOOGL',
            'related_type_id': 4,  # ticker
            'related_id': 2,
            'status': 'open',
            'is_triggered': 'false',
            'created_at': (datetime.now() - timedelta(hours=10)).strftime('%Y-%m-%d %H:%M:%S')
        },
        
        # 6. Account Alert - Account
        {
            'type': 'custom_alert',
            'condition_attribute': 'price',
            'condition_operator': 'equals',
            'condition_number': '100.00',
            'message': 'יתרה בחשבון השקעות הגיעה ל-100,000',
            'related_type_id': 1,  # account
            'related_id': 1,
            'status': 'open',
            'is_triggered': 'false',
            'created_at': (datetime.now() - timedelta(hours=12)).strftime('%Y-%m-%d %H:%M:%S')
        },
        
        # 7. Triggered Alert - Ticker (MSFT) - Already triggered
        {
            'type': 'price_alert',
            'condition_attribute': 'price',
            'condition_operator': 'more_than',
            'condition_number': '350.00',
            'message': 'MSFT הגיע ליעד מחיר של 350.00',
            'related_type_id': 4,  # ticker
            'related_id': 3,
            'status': 'closed',
            'is_triggered': 'true',
            'created_at': (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d %H:%M:%S')
        },
        
        # 8. New Alert - Trade (AMZN) - Triggered but not read
        {
            'type': 'stop_loss',
            'condition_attribute': 'price',
            'condition_operator': 'less_than',
            'condition_number': '120.00',
            'message': 'AMZN מתחת לסטופ לוס של 120.00',
            'related_type_id': 2,  # trade
            'related_id': 2,
            'status': 'closed',
            'is_triggered': 'new',
            'created_at': (datetime.now() - timedelta(hours=1)).strftime('%Y-%m-%d %H:%M:%S')
        },
        
        # 9. Cancelled Alert - Trade Plan (NFLX)
        {
            'type': 'custom_alert',
            'condition_attribute': 'volume',
            'condition_operator': 'less_than',
            'condition_number': '500000',
            'message': 'נפח מסחר נמוך ב-NFLX',
            'related_type_id': 3,  # trade plan
            'related_id': 2,
            'status': 'cancelled',
            'is_triggered': 'false',
            'created_at': (datetime.now() - timedelta(days=2)).strftime('%Y-%m-%d %H:%M:%S')
        },
        
        # 10. Breakout Alert - Ticker (TSLA)
        {
            'type': 'price_alert',
            'condition_attribute': 'price',
            'condition_operator': 'more_than',
            'condition_number': '250.00',
            'message': 'פריצה טכנית ב-TSLA',
            'related_type_id': 4,  # ticker
            'related_id': 4,
            'status': 'open',
            'is_triggered': 'false',
            'created_at': (datetime.now() - timedelta(hours=3)).strftime('%Y-%m-%d %H:%M:%S')
        }
    ]
    
    # Insert simple alerts
    for i, alert_data in enumerate(simple_alerts, 1):
        cursor.execute("""
            INSERT INTO alerts (
                type, message, related_type_id, related_id, status, is_triggered,
                condition_attribute, condition_operator, condition_number, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            alert_data['type'],
            alert_data['message'],
            alert_data['related_type_id'],
            alert_data['related_id'],
            alert_data['status'],
            alert_data['is_triggered'],
            alert_data['condition_attribute'],
            alert_data['condition_operator'],
            alert_data['condition_number'],
            alert_data['created_at']
        ))
        
        print(f"✅ Added alert {i}: {alert_data['type']} - {alert_data['condition_attribute']} {alert_data['condition_operator']} {alert_data['condition_number']}")
    
    # Commit changes
    conn.commit()
    
    # Show results
    cursor.execute("SELECT COUNT(*) FROM alerts")
    total_alerts = cursor.fetchone()[0]
    
    print(f"\n📊 Total alerts in database: {total_alerts}")
    
    # Show breakdown by status
    cursor.execute("SELECT status, COUNT(*) FROM alerts GROUP BY status ORDER BY COUNT(*) DESC")
    status_dist = cursor.fetchall()
    print("\n📋 Alerts by status:")
    for status, count in status_dist:
        print(f"  - {status}: {count} alerts")
    
    # Show breakdown by type
    cursor.execute("SELECT type, COUNT(*) FROM alerts GROUP BY type ORDER BY COUNT(*) DESC")
    type_dist = cursor.fetchall()
    print("\n📋 Alerts by type:")
    for alert_type, count in type_dist:
        print(f"  - {alert_type}: {count} alerts")
    
    # Show breakdown by related_type_id
    cursor.execute("SELECT related_type_id, COUNT(*) FROM alerts GROUP BY related_type_id ORDER BY COUNT(*) DESC")
    related_dist = cursor.fetchall()
    print("\n📋 Alerts by related type:")
    type_names = {1: 'Account', 2: 'Trade', 3: 'Trade Plan', 4: 'Ticker'}
    for related_type, count in related_dist:
        type_name = type_names.get(related_type, f'Unknown({related_type})')
        print(f"  - {type_name}: {count} alerts")
    
    # Show recent alerts
    cursor.execute("""
        SELECT id, type, condition_attribute, condition_operator, condition_number, related_type_id, status, is_triggered, created_at
        FROM alerts 
        ORDER BY created_at DESC 
        LIMIT 5
    """)
    
    print("\n📋 Recent alerts:")
    for row in cursor.fetchall():
        type_name = {1: 'Account', 2: 'Trade', 3: 'Trade Plan', 4: 'Ticker'}.get(row[5], 'Unknown')
        condition = f"{row[2]} {row[3]} {row[4]}"
        print(f"  - ID: {row[0]}, Type: {row[1]}, Condition: {condition}, Related: {type_name}, Status: {row[6]}, Triggered: {row[7]}, Created: {row[8]}")
    
    conn.close()
    print("\n✅ Simple alerts created successfully!")

if __name__ == "__main__":
    create_simple_alerts()

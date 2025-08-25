#!/usr/bin/env python3
"""
Script to create 10 diverse sample alerts covering all constraints and validation rules
"""
import sqlite3
import os
from datetime import datetime, timedelta

def create_diverse_alerts():
    # Path to database
    db_path = 'db/simpleTrade_new.db'
    
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("Creating 10 diverse sample alerts...")
    
    # Diverse alerts data - covering all constraints and validation rules
    diverse_alerts = [
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
            'message': 'שינוי יומי של יותר מ-5% ב-META',
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
            'message': 'ממוצע נע חוצה למעלה 200.00 ב-GOOGL',
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
        
        # 10. Cross Down Alert - Ticker (TSLA)
        {
            'type': 'price_alert',
            'condition_attribute': 'ma',
            'condition_operator': 'cross_down',
            'condition_number': '180.00',
            'message': 'ממוצע נע חוצה למטה 180.00 ב-TSLA',
            'related_type_id': 4,  # ticker
            'related_id': 4,
            'status': 'open',
            'is_triggered': 'false',
            'created_at': (datetime.now() - timedelta(hours=3)).strftime('%Y-%m-%d %H:%M:%S')
        }
    ]
    
    # Insert diverse alerts
    for i, alert_data in enumerate(diverse_alerts, 1):
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
    cursor.execute("""
        SELECT status, COUNT(*) as count 
        FROM alerts 
        GROUP BY status 
        ORDER BY count DESC
    """)
    
    print("\n📋 Alerts by status:")
    for row in cursor.fetchall():
        print(f"  - {row[0]}: {row[1]} alerts")
    
    # Show breakdown by type
    cursor.execute("""
        SELECT type, COUNT(*) as count 
        FROM alerts 
        GROUP BY type 
        ORDER BY count DESC
    """)
    
    print("\n📋 Alerts by type:")
    for row in cursor.fetchall():
        print(f"  - {row[0]}: {row[1]} alerts")
    
    # Show breakdown by related_type_id
    cursor.execute("""
        SELECT related_type_id, COUNT(*) as count 
        FROM alerts 
        GROUP BY related_type_id 
        ORDER BY count DESC
    """)
    
    print("\n📋 Alerts by related type:")
    for row in cursor.fetchall():
        type_name = {1: 'Account', 2: 'Trade', 3: 'Trade Plan', 4: 'Ticker'}.get(row[0], 'Unknown')
        print(f"  - {type_name} ({row[0]}): {row[1]} alerts")
    
    # Show breakdown by condition_attribute
    cursor.execute("""
        SELECT condition_attribute, COUNT(*) as count 
        FROM alerts 
        GROUP BY condition_attribute 
        ORDER BY count DESC
    """)
    
    print("\n📋 Alerts by condition attribute:")
    for row in cursor.fetchall():
        print(f"  - {row[0]}: {row[1]} alerts")
    
    # Show breakdown by condition_operator
    cursor.execute("""
        SELECT condition_operator, COUNT(*) as count 
        FROM alerts 
        GROUP BY condition_operator 
        ORDER BY count DESC
    """)
    
    print("\n📋 Alerts by condition operator:")
    for row in cursor.fetchall():
        print(f"  - {row[0]}: {row[1]} alerts")
    
    # Show recent alerts
    cursor.execute("""
        SELECT id, type, condition_attribute, condition_operator, condition_number, 
               related_type_id, status, is_triggered, created_at
        FROM alerts 
        ORDER BY created_at DESC 
        LIMIT 5
    """)
    
    print("\n📋 Recent alerts:")
    for row in cursor.fetchall():
        type_name = {1: 'Account', 2: 'Trade', 3: 'Trade Plan', 4: 'Ticker'}.get(row[5], 'Unknown')
        print(f"  - ID: {row[0]}, Type: {row[1]}, Condition: {row[2]} {row[3]} {row[4]}, Related: {type_name}, Status: {row[6]}, Triggered: {row[7]}, Created: {row[8]}")
    
    conn.close()
    print("\n✅ Diverse alerts created successfully!")

if __name__ == "__main__":
    create_diverse_alerts()



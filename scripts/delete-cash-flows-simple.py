#!/usr/bin/env python3
import sqlite3
import sys

db_path = 'Backend/db/simpleTrade_new.db'

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Count before
    cursor.execute('SELECT COUNT(*) FROM cash_flows')
    count_before = cursor.fetchone()[0]
    print(f'Found {count_before} cash flows')
    sys.stdout.flush()
    
    if count_before > 0:
        # Delete all
        cursor.execute('DELETE FROM cash_flows')
        conn.commit()
        
        # Count after
        cursor.execute('SELECT COUNT(*) FROM cash_flows')
        count_after = cursor.fetchone()[0]
        print(f'Deleted {count_before - count_after} records')
        print(f'Remaining: {count_after}')
    else:
        print('Table is already empty')
    
    conn.close()
    print('Done!')
    sys.stdout.flush()
except Exception as e:
    print(f'ERROR: {e}')
    sys.exit(1)


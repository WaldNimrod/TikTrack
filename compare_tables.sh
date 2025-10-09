#!/bin/bash
# Script to compare database schema with API endpoint output

echo "============================================"
echo "  COMPARING DATABASE vs API ENDPOINT"
echo "============================================"
echo ""

for table in trading_accounts trades tickers trade_plans executions alerts notes cash_flows; do
    echo "TABLE: $table"
    echo "-------------------------------------------"
    
    # Get database columns
    echo "DATABASE COLUMNS (physical order):"
    sqlite3 /Users/nimrod/Documents/TikTrack/TikTrackApp/Backend/db/simpleTrade_new.db "PRAGMA table_info($table)" | \
        awk -F'|' '{printf "  %2d. %s\n", $1, $2}'
    
    echo ""
    echo "API ENDPOINT COLUMNS:"
    curl -s "http://localhost:8080/api/database-schema/table/$table/data" | \
        python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data['status'] == 'success':
        columns = data['data']['columns']
        for i, col in enumerate(columns):
            print(f'  {i:2d}. {col}')
    else:
        print('  ERROR:', data.get('error', 'Unknown'))
except Exception as e:
    print('  ERROR:', str(e))
"
    
    echo ""
    echo "MATCH CHECK:"
    # Get both and compare
    db_cols=$(sqlite3 /Users/nimrod/Documents/TikTrack/TikTrackApp/Backend/db/simpleTrade_new.db "PRAGMA table_info($table)" | awk -F'|' '{print $2}' | tr '\n' ',' | sed 's/,$//')
    api_cols=$(curl -s "http://localhost:8080/api/database-schema/table/$table/data" | python3 -c "import sys, json; data=json.load(sys.stdin); print(','.join(data['data']['columns']) if data['status']=='success' else 'ERROR')")
    
    if [ "$db_cols" = "$api_cols" ]; then
        echo "  ✅ PERFECT MATCH - Column order is identical!"
    else
        echo "  ⚠️  MISMATCH - Columns differ!"
        echo "  DB:  $db_cols"
        echo "  API: $api_cols"
    fi
    
    echo ""
    echo "============================================"
    echo ""
done


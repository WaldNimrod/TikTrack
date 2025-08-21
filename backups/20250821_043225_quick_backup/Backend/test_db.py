#!/usr/bin/env python3
from config.database import engine
from sqlalchemy import text

print('Testing database connection...')

try:
    with engine.connect() as conn:
        result = conn.execute(text('SELECT COUNT(*) FROM trades'))
        count = result.scalar()
        print(f'✅ Trades count: {count}')
        
        result = conn.execute(text('SELECT COUNT(*) FROM accounts'))
        count = result.scalar()
        print(f'✅ Accounts count: {count}')
        
        result = conn.execute(text('SELECT COUNT(*) FROM tickers'))
        count = result.scalar()
        print(f'✅ Tickers count: {count}')
        
        print('✅ Database connection successful!')
        
except Exception as e:
    print(f'❌ Database error: {e}')

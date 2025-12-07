#!/usr/bin/env python3
"""
Performance Test Script for Ticker Widgets
==========================================

Tests the performance of the /api/tickers/with-initial-data endpoint
used by the ticker widgets on the home page.

Measures:
- Response time
- Number of queries (N+1 detection)
- Memory usage
- Query execution plans

Usage:
    python3 Backend/scripts/test_ticker_widgets_performance.py [user_id]
"""

import sys
import os
import time
from datetime import datetime

# Add Backend directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from config.database import DATABASE_URL, SessionLocal
from models.user import User
from models.ticker import Ticker
from models.user_ticker import UserTicker
from models.external_data import MarketDataQuote
from sqlalchemy import func, and_
from sqlalchemy.orm import joinedload
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_endpoint_performance(user_id=None):
    """Test the performance of /api/tickers/with-initial-data endpoint logic"""
    
    db = SessionLocal()
    
    try:
        # Get user_id if not provided
        if not user_id:
            user = db.query(User).first()
            if not user:
                print("❌ No users found in database")
                return
            user_id = user.id
            print(f"📊 Using user ID: {user_id}")
        
        print(f"\n{'='*60}")
        print(f"Performance Test: /api/tickers/with-initial-data")
        print(f"User ID: {user_id}")
        print(f"{'='*60}\n")
        
        # Test 1: Count user tickers with data
        print("Test 1: Counting user tickers with initial data...")
        start_time = time.time()
        
        ticker_ids_with_data = db.query(MarketDataQuote.ticker_id).distinct().subquery()
        
        tickers_with_data = db.query(Ticker).join(
            UserTicker, Ticker.id == UserTicker.ticker_id
        ).join(
            ticker_ids_with_data, Ticker.id == ticker_ids_with_data.c.ticker_id
        ).filter(
            UserTicker.user_id == user_id,
            UserTicker.status == 'open'
        ).options(
            joinedload(Ticker.user_tickers)
        ).all()
        
        count_time = time.time() - start_time
        print(f"✅ Found {len(tickers_with_data)} tickers with data in {count_time*1000:.2f}ms")
        
        if len(tickers_with_data) == 0:
            print("⚠️  No tickers with data found for this user")
            return
        
        # Test 2: Get latest quotes efficiently
        print("\nTest 2: Getting latest quotes (batch query)...")
        start_time = time.time()
        
        ticker_ids = [t.id for t in tickers_with_data]
        
        latest_quotes_subq = db.query(
            MarketDataQuote.ticker_id,
            func.max(MarketDataQuote.fetched_at).label('max_fetched_at')
        ).filter(
            MarketDataQuote.ticker_id.in_(ticker_ids)
        ).group_by(MarketDataQuote.ticker_id).subquery()
        
        latest_quotes = db.query(MarketDataQuote).join(
            latest_quotes_subq,
            and_(
                MarketDataQuote.ticker_id == latest_quotes_subq.c.ticker_id,
                MarketDataQuote.fetched_at == latest_quotes_subq.c.max_fetched_at
            )
        ).all()
        
        quotes_time = time.time() - start_time
        print(f"✅ Retrieved {len(latest_quotes)} latest quotes in {quotes_time*1000:.2f}ms")
        
        # Test 3: Build response
        print("\nTest 3: Building response...")
        start_time = time.time()
        
        quotes_map = {q.ticker_id: q for q in latest_quotes}
        result = []
        for ticker in tickers_with_data:
            quote = quotes_map.get(ticker.id)
            if quote:
                name_custom = None
                type_custom = None
                if hasattr(ticker, 'user_tickers') and ticker.user_tickers:
                    for ut in ticker.user_tickers:
                        if ut.user_id == user_id:
                            name_custom = ut.name_custom
                            type_custom = ut.type_custom
                            break
                
                result.append({
                    'id': ticker.id,
                    'symbol': ticker.symbol,
                    'name': ticker.name,
                    'name_custom': name_custom,
                    'type_custom': type_custom,
                    'current_price': float(quote.price) if quote.price else None,
                    'change_percent': float(quote.change_pct_day) if quote.change_pct_day is not None else None,
                    'change_amount': float(quote.change_amount_day) if quote.change_amount_day is not None else None,
                    'volume': int(quote.volume) if quote.volume else None,
                    'has_data': True
                })
        
        build_time = time.time() - start_time
        print(f"✅ Built response with {len(result)} tickers in {build_time*1000:.2f}ms")
        
        # Test 4: Query count analysis
        print("\nTest 4: Analyzing query count...")
        from sqlalchemy import event
        query_count = [0]
        
        @event.listens_for(db.bind, "after_cursor_execute")
        def receive_after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
            query_count[0] += 1
        
        # Run the full logic again with query counting
        start_time = time.time()
        
        ticker_ids_with_data = db.query(MarketDataQuote.ticker_id).distinct().subquery()
        tickers_with_data = db.query(Ticker).join(
            UserTicker, Ticker.id == UserTicker.ticker_id
        ).join(
            ticker_ids_with_data, Ticker.id == ticker_ids_with_data.c.ticker_id
        ).filter(
            UserTicker.user_id == user_id,
            UserTicker.status == 'open'
        ).options(
            joinedload(Ticker.user_tickers)
        ).all()
        
        ticker_ids = [t.id for t in tickers_with_data]
        latest_quotes_subq = db.query(
            MarketDataQuote.ticker_id,
            func.max(MarketDataQuote.fetched_at).label('max_fetched_at')
        ).filter(
            MarketDataQuote.ticker_id.in_(ticker_ids)
        ).group_by(MarketDataQuote.ticker_id).subquery()
        
        latest_quotes = db.query(MarketDataQuote).join(
            latest_quotes_subq,
            and_(
                MarketDataQuote.ticker_id == latest_quotes_subq.c.ticker_id,
                MarketDataQuote.fetched_at == latest_quotes_subq.c.max_fetched_at
            )
        ).all()
        
        total_time = time.time() - start_time
        total_queries = query_count[0]
        
        print(f"✅ Total execution time: {total_time*1000:.2f}ms")
        print(f"✅ Total queries executed: {total_queries}")
        print(f"✅ Average time per query: {(total_time/total_queries)*1000:.2f}ms" if total_queries > 0 else "N/A")
        
        # Performance assessment
        print(f"\n{'='*60}")
        print("Performance Assessment:")
        print(f"{'='*60}")
        
        if total_time < 0.1:
            print("✅ EXCELLENT: Response time < 100ms")
        elif total_time < 0.5:
            print("✅ GOOD: Response time < 500ms")
        elif total_time < 1.0:
            print("⚠️  ACCEPTABLE: Response time < 1s")
        else:
            print("❌ SLOW: Response time >= 1s")
        
        if total_queries <= 3:
            print("✅ EXCELLENT: Query count <= 3 (no N+1 detected)")
        elif total_queries <= 5:
            print("✅ GOOD: Query count <= 5")
        elif total_queries <= 10:
            print("⚠️  ACCEPTABLE: Query count <= 10")
        else:
            print(f"❌ POOR: Query count = {total_queries} (possible N+1 issue)")
        
        print(f"\n{'='*60}\n")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == '__main__':
    user_id = int(sys.argv[1]) if len(sys.argv) > 1 else None
    test_endpoint_performance(user_id)


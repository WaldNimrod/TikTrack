#!/usr/bin/env python3
"""
Performance Test for User-Ticker Integration
============================================

Tests performance of key operations and identifies bottlenecks.

Author: TikTrack Development Team
Date: January 2025
"""

import os
import sys
import time
from collections import defaultdict

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine, text, event
from sqlalchemy.orm import sessionmaker
from config.settings import DATABASE_URL
from services.ticker_service import TickerService
from models.user import User

# Track queries
queries = []
query_times = []

def setup_query_tracking(engine):
    """Setup query tracking for an engine"""
    @event.listens_for(engine, "before_cursor_execute")
    def receive_before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
        conn.info.setdefault('query_start_time', []).append(time.time())
    
    @event.listens_for(engine, "after_cursor_execute")
    def receive_after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
        total = time.time() - conn.info['query_start_time'].pop(-1)
        queries.append(statement)
        query_times.append(total)

def test_get_user_tickers_performance(db, user_id, iterations=10):
    """Test get_user_tickers performance with query counting"""
    print(f"\n{'='*60}")
    print(f"Performance Test: get_user_tickers (user_id={user_id})")
    print(f"{'='*60}")
    
    queries.clear()
    query_times.clear()
    
    times = []
    for i in range(iterations):
        start = time.time()
        tickers = TickerService.get_user_tickers(db, user_id)
        elapsed = time.time() - start
        times.append(elapsed)
    
    avg_time = sum(times) / len(times)
    min_time = min(times)
    max_time = max(times)
    
    print(f"Results: {len(tickers)} tickers retrieved")
    print(f"Average time: {avg_time:.4f}s")
    print(f"Min time: {min_time:.4f}s")
    print(f"Max time: {max_time:.4f}s")
    print(f"Total queries executed: {len(queries)}")
    print(f"Average queries per call: {len(queries) / iterations:.1f}")
    
    if len(queries) / iterations > 2:
        print(f"⚠️  WARNING: Potential N+1 query problem detected!")
        print(f"   Expected ~2 queries (one for user_tickers, one for tickers)")
        print(f"   Got {len(queries) / iterations:.1f} queries per call")
        
        # Analyze query patterns
        query_counts = defaultdict(int)
        for q in queries:
            # Simplify query for counting
            if 'user_tickers' in q.lower():
                query_counts['user_tickers'] += 1
            elif 'tickers' in q.lower():
                query_counts['tickers'] += 1
            else:
                query_counts['other'] += 1
        
        print(f"   Query breakdown:")
        for qtype, count in query_counts.items():
            print(f"     {qtype}: {count} queries")
    else:
        print(f"✅ Query count is optimal")
    
    # Check for slow queries
    if query_times:
        avg_query_time = sum(query_times) / len(query_times)
        max_query_time = max(query_times)
        print(f"Average query time: {avg_query_time:.4f}s")
        print(f"Max query time: {max_query_time:.4f}s")
        
        if max_query_time > 0.1:
            print(f"⚠️  WARNING: Slow query detected ({max_query_time:.4f}s)")
            # Find the slow query
            slow_idx = query_times.index(max_query_time)
            if slow_idx < len(queries):
                print(f"   Slow query: {queries[slow_idx][:200]}...")
    
    return avg_time, len(queries) / iterations

def test_status_update_performance(db, ticker_id, iterations=10):
    """Test status update performance"""
    print(f"\n{'='*60}")
    print(f"Performance Test: update_ticker_status_auto (ticker_id={ticker_id})")
    print(f"{'='*60}")
    
    queries.clear()
    query_times.clear()
    
    times = []
    for i in range(iterations):
        start = time.time()
        TickerService.update_ticker_status_auto(db, ticker_id)
        elapsed = time.time() - start
        times.append(elapsed)
    
    avg_time = sum(times) / len(times)
    print(f"Average time: {avg_time:.4f}s")
    print(f"Total queries: {len(queries)}")
    print(f"Average queries per call: {len(queries) / iterations:.1f}")
    
    if len(queries) / iterations > 3:
        print(f"⚠️  WARNING: Too many queries for status update")
    else:
        print(f"✅ Query count is reasonable")
    
    return avg_time

def test_user_ticker_status_performance(db, user_id, ticker_id, iterations=10):
    """Test user-ticker status update performance"""
    print(f"\n{'='*60}")
    print(f"Performance Test: update_user_ticker_status (user_id={user_id}, ticker_id={ticker_id})")
    print(f"{'='*60}")
    
    queries.clear()
    query_times.clear()
    
    times = []
    for i in range(iterations):
        start = time.time()
        TickerService.update_user_ticker_status(db, user_id, ticker_id)
        elapsed = time.time() - start
        times.append(elapsed)
    
    avg_time = sum(times) / len(times)
    print(f"Average time: {avg_time:.4f}s")
    print(f"Total queries: {len(queries)}")
    print(f"Average queries per call: {len(queries) / iterations:.1f}")
    
    return avg_time

def test_bulk_operations(db):
    """Test bulk operations performance"""
    print(f"\n{'='*60}")
    print("Performance Test: Bulk Operations")
    print(f"{'='*60}")
    
    # Get all users with tickers
    result = db.execute(text("""
        SELECT DISTINCT user_id, COUNT(*) as ticker_count
        FROM user_tickers
        GROUP BY user_id
        ORDER BY ticker_count DESC
        LIMIT 5
    """))
    
    users = result.fetchall()
    
    print("Testing get_user_tickers for multiple users:")
    total_time = 0
    for user_id, ticker_count in users:
        start = time.time()
        tickers = TickerService.get_user_tickers(db, user_id)
        elapsed = time.time() - start
        total_time += elapsed
        print(f"  User {user_id}: {len(tickers)} tickers in {elapsed:.4f}s")
    
    avg_time = total_time / len(users) if users else 0
    print(f"Average time per user: {avg_time:.4f}s")
    
    return avg_time

def main():
    """Run performance tests"""
    print("\n" + "="*60)
    print("USER-TICKER INTEGRATION PERFORMANCE TESTS")
    print("="*60)
    
    engine = create_engine(DATABASE_URL, echo=False)
    setup_query_tracking(engine)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    try:
        # Find test user
        user = db.query(User).filter(User.id == 10).first()
        if not user:
            print("❌ User 10 not found")
            return 1
        
        user_id = user.id
        
        # Get a ticker for testing
        result = db.execute(text("""
            SELECT ticker_id FROM user_tickers WHERE user_id = :user_id LIMIT 1
        """), {"user_id": user_id})
        row = result.fetchone()
        ticker_id = row[0] if row else 7
        
        # Run tests
        get_tickers_time, get_tickers_queries = test_get_user_tickers_performance(db, user_id, 10)
        status_update_time = test_status_update_performance(db, ticker_id, 10)
        user_status_time = test_user_ticker_status_performance(db, user_id, ticker_id, 10)
        bulk_time = test_bulk_operations(db)
        
        # Summary
        print(f"\n{'='*60}")
        print("PERFORMANCE SUMMARY")
        print(f"{'='*60}")
        print(f"get_user_tickers:        {get_tickers_time:.4f}s ({get_tickers_queries:.1f} queries)")
        print(f"update_ticker_status:    {status_update_time:.4f}s")
        print(f"update_user_ticker_status: {user_status_time:.4f}s")
        print(f"Bulk operations (avg):   {bulk_time:.4f}s")
        
        # Performance recommendations
        print(f"\n{'='*60}")
        print("RECOMMENDATIONS")
        print(f"{'='*60}")
        
        if get_tickers_time > 0.1:
            print("⚠️  get_user_tickers is slow - consider adding indexes or optimizing query")
        if get_tickers_queries > 2:
            print("⚠️  N+1 query problem detected - optimize get_user_tickers to use joinedload")
        if status_update_time > 0.05:
            print("⚠️  Status update is slow - check for missing indexes")
        
        if get_tickers_time < 0.1 and get_tickers_queries <= 2 and status_update_time < 0.05:
            print("✅ All performance metrics are within acceptable ranges")
        
        return 0
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1
    finally:
        db.close()

if __name__ == "__main__":
    sys.exit(main())

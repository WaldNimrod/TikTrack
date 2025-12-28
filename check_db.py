#!/usr/bin/env python3
"""
Check database for SPY ticker and watch list items
"""

import os
import sys
from pathlib import Path

# Add Backend directory to path
backend_path = Path(__file__).resolve().parent / "Backend"
sys.path.insert(0, str(backend_path))

from config.database import SessionLocal
from models.ticker import Ticker
from models.watch_list import WatchList, WatchListItem

def check_db():
    db = SessionLocal()
    try:
        # Check if SPY exists in tickers
        spy_ticker = db.query(Ticker).filter(Ticker.symbol == 'SPY').first()
        print(f"SPY ticker in database: {spy_ticker.id if spy_ticker else None} - {spy_ticker.name if spy_ticker else 'Not found'}")

        # Check watch lists for user 2
        watch_lists = db.query(WatchList).filter(WatchList.user_id == 2).all()
        print(f"User 2 has {len(watch_lists)} watch lists:")

        for wl in watch_lists:
            print(f"  Watch List {wl.id}: {wl.name}, is_default={wl.is_default}")
            items = db.query(WatchListItem).filter(WatchListItem.watch_list_id == wl.id).all()
            print(f"    Has {len(items)} items:")
            for item in items:
                ticker_name = "Unknown"
                if item.ticker_id:
                    ticker = db.query(Ticker).filter(Ticker.id == item.ticker_id).first()
                    ticker_name = ticker.symbol if ticker else "Unknown"
                elif item.external_symbol:
                    ticker_name = item.external_symbol

                print(f"      Item {item.id}: {ticker_name}")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_db()

#!/usr/bin/env python3
"""
Cleanup script for removing invalid ticker symbols in development databases.

Usage:
    python3 Backend/scripts/cleanup/remove_invalid_tickers.py
"""

import os
import sys


def main() -> None:
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    if root_dir not in sys.path:
        sys.path.append(root_dir)

    from config.database import SessionLocal  # type: ignore
    from services.ticker_service import TickerService  # type: ignore

    session = SessionLocal()
    try:
        result = TickerService.cleanup_invalid_tickers(session)

        print("=== Ticker cleanup summary ===")
        print(f"Total processed : {result['total_processed']}")
        print(f"Deleted         : {result['deleted']}")
        print(f"Normalized      : {result['normalized']}")
        if result['invalid_ids']:
            print(f"Invalid ticker IDs removed: {result['invalid_ids']}")
        else:
            print("No invalid tickers were removed.")
    finally:
        session.close()


if __name__ == "__main__":
    main()


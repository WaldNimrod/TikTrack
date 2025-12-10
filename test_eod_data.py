#!/usr/bin/env python3
"""
Test EOD Data Generation for TikTrack
"""

import sys
import os
sys.path.append('/Users/nimrod/Documents/TikTrack/TikTrackApp')

from datetime import date, datetime
from Backend.services.eod_metrics_service import EODMetricsService

def test_eod_calculation():
    """Test EOD calculation for user 1"""
    print("🧪 Testing EOD Calculation for user_id=1")

    try:
        service = EODMetricsService()
        target_date = date.today()

        print(f"📅 Calculating for date: {target_date}")

        # Calculate metrics
        metrics = service.calculate_daily_portfolio_metrics(1, None, target_date)
        print("✅ Calculation successful!")
        print(f"NAV Total: ${metrics.get('nav_total', 0):,.2f}")
        print(f"Market Value: ${metrics.get('market_value_total', 0):,.2f}")
        print(f"Cash Total: ${metrics.get('cash_total', 0):,.2f}")
        print(f"Positions Count: {metrics.get('positions_count_open', 0)}")
        print(f"Realized P&L: ${metrics.get('realized_pl_total', 0):,.2f}")
        print(f"Unrealized P&L: ${metrics.get('unrealized_pl_total', 0):,.2f}")

        # Try to save
        print("\n💾 Attempting to save to database...")
        saved = service.save_daily_portfolio_metrics(metrics)
        if saved:
            print("✅ Saved successfully to database!")
        else:
            print("❌ Save failed")

        return True

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_eod_calculation()
    sys.exit(0 if success else 1)

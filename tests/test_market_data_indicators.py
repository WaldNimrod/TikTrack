#!/usr/bin/env python3
"""
P3-014 — Unit tests: Indicators Service (ATR, MA, CCI)
SSOT: MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC
"""
import sys
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from api.integrations.market_data.provider_interface import OHLCVRow
from api.integrations.market_data.indicators_service import (
    compute_atr,
    compute_ma,
    compute_cci,
    compute_indicators,
)


def _row(o, h, l, c, v=1000):
    return OHLCVRow(
        date=datetime.now(timezone.utc),
        open_price=Decimal(str(o)),
        high_price=Decimal(str(h)),
        low_price=Decimal(str(l)),
        close_price=Decimal(str(c)),
        volume=v,
    )


def test_compute_ma():
    rows = [_row(10, 11, 9, 10 + i) for i in range(25)]
    ma20 = compute_ma(rows, 20)
    assert ma20 is not None
    assert isinstance(ma20, Decimal)
    assert ma20 > 0


def test_compute_atr():
    rows = [_row(100, 105, 98, 102) for _ in range(20)]
    atr = compute_atr(rows, 14)
    assert atr is not None
    assert isinstance(atr, Decimal)
    assert atr >= 0


def test_compute_cci():
    rows = [_row(50 + i, 52 + i, 48 + i, 51 + i) for i in range(25)]
    cci = compute_cci(rows, 20)
    assert cci is not None
    assert isinstance(cci, Decimal)


def test_compute_indicators_returns_dict():
    rows = [_row(50 + i, 52 + i, 48 + i, 51 + i) for i in range(260)]
    out = compute_indicators(rows)
    assert isinstance(out, dict)
    assert "atr_14" in out or "ma_20" in out or "ma_50" in out or "cci_20" in out


def test_compute_indicators_insufficient_data():
    rows = [_row(10, 11, 9, 10) for _ in range(5)]
    out = compute_indicators(rows)
    assert out == {} or len(out) < 6


def test_compute_ma_insufficient():
    rows = [_row(10, 11, 9, 10) for _ in range(10)]
    ma50 = compute_ma(rows, 50)
    assert ma50 is None


if __name__ == "__main__":
    test_compute_ma()
    test_compute_atr()
    test_compute_cci()
    test_compute_indicators_returns_dict()
    test_compute_indicators_insufficient_data()
    test_compute_ma_insufficient()
    print("All indicator tests PASSED")

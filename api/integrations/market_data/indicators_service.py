"""
Indicators Service — P3-014
SSOT: MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC
ATR(14), MA(20/50/150/200), CCI(20) — compute-on-read from 250d OHLC.
Precision: NUMERIC(20,8).
"""

from decimal import Decimal
from typing import List, Optional

from .provider_interface import OHLCVRow

DEFAULT_ATR_PERIOD = 14
DEFAULT_CCI_PERIOD = 20
MA_PERIODS = (20, 50, 150, 200)


def _to_decimal(val) -> Decimal:
    """Precision 20,8."""
    if val is None:
        return Decimal("0")
    try:
        return Decimal(str(float(val))).quantize(Decimal("0.00000001"))
    except (TypeError, ValueError):
        return Decimal("0")


def compute_atr(rows: List[OHLCVRow], period: int = DEFAULT_ATR_PERIOD) -> Optional[Decimal]:
    """
    ATR(14) — Average True Range.
    TR = max(H-L, |H-prev_close|, |L-prev_close|).
    Requires period+1 rows.
    """
    if len(rows) < period + 1:
        return None
    trs = []
    for i in range(1, len(rows)):
        h, l_ = rows[i].high_price, rows[i].low_price
        prev_c = rows[i - 1].close_price
        tr = max(
            h - l_,
            abs(h - prev_c),
            abs(l_ - prev_c),
        )
        trs.append(tr)
    if len(trs) < period:
        return None
    atr = sum(trs[-period:]) / period
    return _to_decimal(atr)


def compute_ma(rows: List[OHLCVRow], period: int) -> Optional[Decimal]:
    """Simple Moving Average of close over period."""
    if len(rows) < period:
        return None
    closes = [r.close_price for r in rows[-period:]]
    return _to_decimal(sum(closes) / period)


def compute_cci(rows: List[OHLCVRow], period: int = DEFAULT_CCI_PERIOD) -> Optional[Decimal]:
    """
    CCI(20) — Commodity Channel Index.
    TP = (H+L+C)/3. CCI = (TP - SMA(TP)) / (0.015 * Mean Deviation).
    """
    if len(rows) < period:
        return None
    recent = rows[-period:]
    tps = [(r.high_price + r.low_price + r.close_price) / 3 for r in recent]
    sma_tp = sum(tps) / period
    mean_dev = sum(abs(tp - sma_tp) for tp in tps) / period
    if mean_dev == 0:
        return None
    cci = (tps[-1] - sma_tp) / (Decimal("0.015") * mean_dev)
    return _to_decimal(cci)


def compute_indicators(rows: List[OHLCVRow]) -> dict:
    """
    Returns ATR(14), MA(20/50/150/200), CCI(20) per spec.
    Keys: atr_14, ma_20, ma_50, ma_150, ma_200, cci_20.
    """
    out = {}
    atr = compute_atr(rows, DEFAULT_ATR_PERIOD)
    if atr is not None:
        out["atr_14"] = atr
    for p in MA_PERIODS:
        ma = compute_ma(rows, p)
        if ma is not None:
            out[f"ma_{p}"] = ma
    cci = compute_cci(rows, DEFAULT_CCI_PERIOD)
    if cci is not None:
        out["cci_20"] = cci
    return out

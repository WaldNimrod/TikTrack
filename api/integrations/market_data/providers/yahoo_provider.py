"""
Yahoo Finance Provider — P3-009
SSOT: EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC, MARKET_DATA_PIPE_SPEC §2.2
Guardrail: User-Agent Rotation required.
Role: Primary Prices / Fallback FX. Interval 1d (EOD). Precision 20,8.
"""

import asyncio
import logging
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from ..provider_interface import (
    ExchangeRateResult,
    MarketDataProvider,
    OHLCVRow,
    PriceResult,
)

logger = logging.getLogger(__name__)

# User-Agent Rotation — per EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC
_YAHOO_USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
]
_ua_index = 0


def _next_user_agent() -> str:
    """Rotate User-Agent per guardrail."""
    global _ua_index
    ua = _YAHOO_USER_AGENTS[_ua_index % len(_YAHOO_USER_AGENTS)]
    _ua_index += 1
    return ua


def _to_decimal(val) -> Optional[Decimal]:
    """Force precision 20,8 per spec."""
    if val is None:
        return None
    try:
        return Decimal(str(float(val))).quantize(Decimal("0.00000001"))
    except (TypeError, ValueError):
        return None


def _fetch_price_sync(symbol: str) -> Optional[PriceResult]:
    """Sync fetch — runs in executor."""
    try:
        import yfinance as yf
        from requests import Session

        session = Session()
        session.headers["User-Agent"] = _next_user_agent()
        ticker = yf.Ticker(symbol, session=session)
        info = ticker.history(period="5d", interval="1d")
        if info is None or info.empty:
            return None
        last = info.iloc[-1]
        ts = last.name
        if hasattr(ts, "to_pydatetime"):
            ts = ts.to_pydatetime()
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        close = last["Close"]
        try:
            vol = int(last["Volume"]) if "Volume" in last.index and str(last["Volume"]) != "nan" else None
        except (ValueError, TypeError, KeyError):
            vol = None
        market_cap = None
        try:
            info = ticker.info
            if isinstance(info, dict) and info.get("marketCap"):
                market_cap = _to_decimal(info["marketCap"])
        except Exception:
            pass
        return PriceResult(
            symbol=symbol,
            price=_to_decimal(close),
            open_price=_to_decimal(last.get("Open")),
            high_price=_to_decimal(last.get("High")),
            low_price=_to_decimal(last.get("Low")),
            close_price=_to_decimal(close),
            volume=vol,
            market_cap=market_cap,
            as_of=ts,
            provider="YAHOO_FINANCE",
        )
    except Exception as e:
        logger.warning("Yahoo price fetch failed for %s: %s", symbol, e)
        return None


def _fetch_fx_sync(from_ccy: str, to_ccy: str) -> Optional[ExchangeRateResult]:
    """FX via Yahoo (Fallback). Sync — runs in executor."""
    try:
        import yfinance as yf
        from requests import Session

        session = Session()
        session.headers["User-Agent"] = _next_user_agent()
        pair = f"{from_ccy}{to_ccy}=X"
        ticker = yf.Ticker(pair, session=session)
        info = ticker.history(period="5d", interval="1d")
        if info is None or info.empty:
            return None
        last = info.iloc[-1]
        rate = _to_decimal(last["Close"])
        if not rate or rate <= 0:
            return None
        ts = last.name
        if hasattr(ts, "to_pydatetime"):
            ts = ts.to_pydatetime()
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        return ExchangeRateResult(
            from_currency=from_ccy,
            to_currency=to_ccy,
            rate=rate,
            as_of=ts,
            provider="YAHOO_FINANCE",
        )
    except Exception as e:
        logger.warning("Yahoo FX fetch failed for %s/%s: %s", from_ccy, to_ccy, e)
        return None


def _fetch_history_sync(symbol: str, trading_days: int) -> list:
    """P3-015 — 250d OHLCV. period 1y for ~252 trading days."""
    result = []
    try:
        import yfinance as yf
        from requests import Session

        session = Session()
        session.headers["User-Agent"] = _next_user_agent()
        ticker = yf.Ticker(symbol, session=session)
        period = "2y" if trading_days > 252 else "1y"
        info = ticker.history(period=period, interval="1d")
        if info is None or info.empty:
            return result
        rows = info.tail(trading_days)
        for idx in range(len(rows)):
            row = rows.iloc[idx]
            ts = row.name
            if hasattr(ts, "to_pydatetime"):
                ts = ts.to_pydatetime()
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)
            result.append(OHLCVRow(
                date=ts,
                open_price=_to_decimal(row.get("Open")) or Decimal("0"),
                high_price=_to_decimal(row.get("High")) or Decimal("0"),
                low_price=_to_decimal(row.get("Low")) or Decimal("0"),
                close_price=_to_decimal(row.get("Close")) or Decimal("0"),
                volume=int(row["Volume"]) if "Volume" in row.index and str(row.get("Volume", "")) != "nan" else None,
            ))
    except Exception as e:
        logger.warning("Yahoo history fetch failed for %s: %s", symbol, e)
    return result


class YahooProvider(MarketDataProvider):
    """User-Agent Rotation required — EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC."""

    async def get_ticker_price(self, symbol: str) -> Optional[PriceResult]:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _fetch_price_sync, symbol)

    async def get_exchange_rate(
        self, from_ccy: str, to_ccy: str
    ) -> Optional[ExchangeRateResult]:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, _fetch_fx_sync, from_ccy, to_ccy
        )

    async def get_ticker_history(
        self, symbol: str, trading_days: int = 250
    ) -> list:
        """P3-015 — 250d OHLCV. period 1y ≈ 252 trading days."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, _fetch_history_sync, symbol, trading_days
        )

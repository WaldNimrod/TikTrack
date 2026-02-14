"""
Yahoo Finance Provider — P3-009
SSOT: EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC, MARKET_DATA_PIPE_SPEC §2.2
Guardrail: User-Agent Rotation required.
Role: Primary Prices / Fallback FX. Interval 1d (EOD). Precision 20,8.
REPLAY mode: returns fixtures — zero HTTP calls (TEAM_90 Automated Testing Directive).
"""

import asyncio
import logging
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
from pathlib import Path
from typing import List, Optional

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


# US market proxy for market status (SPY = S&P 500 ETF)
_MARKET_STATUS_SYMBOL = "SPY"


def _fetch_market_status_sync() -> Optional[str]:
    """
    Fetch US market state from Yahoo v7/finance/quote.
    Returns: REGULAR | PRE | POST | CLOSED | None (on failure).
    """
    try:
        import httpx
        url = "https://query1.finance.yahoo.com/v7/finance/quote"
        params = {"symbols": _MARKET_STATUS_SYMBOL}
        headers = {"User-Agent": _next_user_agent()}
        with httpx.Client(timeout=5.0, headers=headers) as client:
            r = client.get(url, params=params)
            r.raise_for_status()
        data = r.json()
        results = data.get("quoteResponse", {}).get("result", [])
        if not results:
            logger.warning("Yahoo market status: empty result for SPY")
            return None
        q = results[0]
        state = q.get("marketState")
        if isinstance(state, str) and state:
            return state
        logger.warning("Yahoo market status: marketState missing or empty (got %r)", state)
        return None
    except Exception as e:
        status = getattr(e, "response", None)
        if status is not None:
            code = getattr(status, "status_code", None)
            logger.warning("Yahoo market status fetch failed: HTTP %s — %s", code, e)
        else:
            logger.warning("Yahoo market status fetch failed: %s", e)
        return None


def _fetch_price_via_quote_api(symbol: str) -> Optional[PriceResult]:
    """Fallback: v7/finance/quote when history() fails. Requires User-Agent."""
    try:
        import httpx
        url = "https://query1.finance.yahoo.com/v7/finance/quote"
        params = {"symbols": symbol}
        headers = {"User-Agent": _next_user_agent()}
        with httpx.Client(timeout=10.0, headers=headers) as client:
            r = client.get(url, params=params)
            r.raise_for_status()
        data = r.json()
        results = data.get("quoteResponse", {}).get("result", [])
        if not results:
            return None
        q = results[0]
        price = _to_decimal(q.get("regularMarketPrice") or q.get("regularMarketPreviousClose"))
        if not price or price <= 0:
            return None
        ts_raw = q.get("regularMarketTime") or q.get("regularMarketOpen")
        if ts_raw:
            try:
                ts = datetime.fromtimestamp(int(ts_raw), tz=timezone.utc)
            except (ValueError, TypeError, OSError):
                ts = datetime.now(timezone.utc)
        else:
            ts = datetime.now(timezone.utc)
        vol = q.get("regularMarketVolume")
        vol = int(vol) if vol is not None and str(vol) != "nan" else None
        market_cap_raw = q.get("marketCap")
        market_cap = _to_decimal(market_cap_raw) if market_cap_raw else None
        return PriceResult(
            symbol=q.get("symbol", symbol),
            price=price,
            open_price=_to_decimal(q.get("regularMarketOpen")),
            high_price=_to_decimal(q.get("regularMarketDayHigh")),
            low_price=_to_decimal(q.get("regularMarketDayLow")),
            close_price=price,
            volume=vol,
            market_cap=market_cap,
            as_of=ts,
            provider="YAHOO_FINANCE",
        )
    except Exception as e:
        logger.debug("Yahoo quote API fallback failed for %s: %s", symbol, e)
        return None


def _fetch_price_sync(symbol: str) -> Optional[PriceResult]:
    """Sync fetch. Primary: history(5d). Fallback: history(start,end) for historical range.
    When period returns empty (e.g. weekend), retry with explicit start/end — historical OHLC
    is always available. Final fallback: v7/finance/quote. No custom Session."""
    try:
        import yfinance as yf
        from datetime import timedelta

        ticker = yf.Ticker(symbol)  # no session — let YF handle
        info = ticker.history(period="5d", interval="1d", debug=False)
        if info is None or info.empty:
            # Weekend/outside hours: period="5d" may return empty. Retry with explicit dates.
            # Historical OHLC is always available. end is exclusive in Yahoo.
            end_d = datetime.now(timezone.utc).date()
            start_d = end_d - timedelta(days=14)  # ~10 trading days
            end_exclusive = (end_d + timedelta(days=1)).isoformat()
            info = ticker.history(
                start=start_d.isoformat(),
                end=end_exclusive,
                interval="1d",
                debug=False,
            )
        if info is not None and not info.empty:
            last = info.iloc[-1]
            return _history_to_price_result(symbol, last, ticker)
    except Exception as e:
        logger.warning("Yahoo history fetch failed for %s: %s", symbol, e)

    return _fetch_price_via_quote_api(symbol)


def _history_to_price_result(
    symbol: str, last, ticker
) -> Optional[PriceResult]:
    """Build PriceResult from history row. Avoid calling ticker.info (quoteSummary → 429)."""
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
        ticker_info = ticker.info
        if isinstance(ticker_info, dict) and ticker_info.get("marketCap"):
            market_cap = _to_decimal(ticker_info["marketCap"])
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


def _fetch_fx_via_quote_api(from_ccy: str, to_ccy: str) -> Optional[ExchangeRateResult]:
    """Fallback: v7/finance/quote for FX when history() fails."""
    try:
        import httpx
        pair = f"{from_ccy}{to_ccy}=X"
        url = "https://query1.finance.yahoo.com/v7/finance/quote"
        params = {"symbols": pair}
        headers = {"User-Agent": _next_user_agent()}
        with httpx.Client(timeout=10.0, headers=headers) as client:
            r = client.get(url, params=params)
            r.raise_for_status()
        data = r.json()
        results = data.get("quoteResponse", {}).get("result", [])
        if not results:
            return None
        q = results[0]
        rate = _to_decimal(q.get("regularMarketPrice") or q.get("regularMarketPreviousClose"))
        if not rate or rate <= 0:
            return None
        ts_raw = q.get("regularMarketTime") or q.get("regularMarketOpen")
        if ts_raw:
            try:
                ts = datetime.fromtimestamp(int(ts_raw), tz=timezone.utc)
            except (ValueError, TypeError, OSError):
                ts = datetime.now(timezone.utc)
        else:
            ts = datetime.now(timezone.utc)
        return ExchangeRateResult(
            from_currency=from_ccy,
            to_currency=to_ccy,
            rate=rate,
            as_of=ts,
            provider="YAHOO_FINANCE",
        )
    except Exception as e:
        logger.debug("Yahoo FX quote API fallback failed for %s/%s: %s", from_ccy, to_ccy, e)
        return None


def _fetch_fx_sync(from_ccy: str, to_ccy: str) -> Optional[ExchangeRateResult]:
    """FX via Yahoo. Primary: history(5d). Fallback: history(start,end). Final: quote API."""
    try:
        import yfinance as yf
        from datetime import timedelta

        pair = f"{from_ccy}{to_ccy}=X"
        ticker = yf.Ticker(pair)  # no session
        info = ticker.history(period="5d", interval="1d", debug=False)
        if info is None or info.empty:
            end_d = datetime.now(timezone.utc).date()
            start_d = end_d - timedelta(days=14)
            end_exclusive = (end_d + timedelta(days=1)).isoformat()
            info = ticker.history(
                start=start_d.isoformat(),
                end=end_exclusive,
                interval="1d",
                debug=False,
            )
        if info is not None and not info.empty:
            last = info.iloc[-1]
            rate = _to_decimal(last["Close"])
            if rate and rate > 0:
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
        logger.warning("Yahoo FX history fetch failed for %s/%s: %s", from_ccy, to_ccy, e)

    return _fetch_fx_via_quote_api(from_ccy, to_ccy)


def _fetch_history_sync(
    symbol: str,
    trading_days: int,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
) -> List:
    """P3-015 — 250d OHLCV. Optional date_from/date_to for gap-fill (SMART_HISTORY_FILL_SPEC).
    Uses session with User-Agent — required for Yahoo to return data (avoid 401/429)."""
    result: List = []
    try:
        import yfinance as yf
        from requests import Session

        session = Session()
        session.headers["User-Agent"] = _next_user_agent()
        ticker = yf.Ticker(symbol, session=session)
        end_d = date_to or datetime.now(timezone.utc).date()
        start_d = date_from
        if start_d and date_to:
            info = ticker.history(start=start_d.isoformat(), end=(end_d + timedelta(days=1)).isoformat(), interval="1d", debug=False)
        else:
            period = "2y" if trading_days > 252 else "1y"
            info = ticker.history(period=period, interval="1d", debug=False)
        if info is None or info.empty:
            if not start_d:
                start_d = end_d - timedelta(days=400)
            info = ticker.history(
                start=start_d.isoformat(),
                end=(end_d + timedelta(days=1)).isoformat(),
                interval="1d",
                debug=False,
            )
        if info is None or info.empty:
            return result
        rows = info.tail(trading_days) if not (date_from or date_to) else info
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


def _replay_price(fixtures_dir: Optional[Path], symbol: str) -> Optional[PriceResult]:
    """REPLAY: load from fixtures — zero HTTP calls."""
    from ..replay_loader import load_prices_eod, load_prices_intraday
    base = fixtures_dir or (Path(__file__).resolve().parent.parent.parent.parent / "tests" / "fixtures" / "market_data")
    for loader in (load_prices_intraday, load_prices_eod):
        data = loader(base) if base else {}
        raw = data.get(symbol) if isinstance(data, dict) else None
        if not raw:
            continue
        try:
            ts = raw.get("as_of", "")
            as_of = datetime.fromisoformat(ts.replace("Z", "+00:00")) if ts else datetime.now(timezone.utc)
            return PriceResult(
                symbol=raw.get("symbol", symbol),
                price=_to_decimal(raw.get("price")),
                open_price=_to_decimal(raw.get("open_price")),
                high_price=_to_decimal(raw.get("high_price")),
                low_price=_to_decimal(raw.get("low_price")),
                close_price=_to_decimal(raw.get("close_price")),
                volume=int(raw["volume"]) if raw.get("volume") is not None else None,
                market_cap=_to_decimal(raw.get("market_cap")),
                as_of=as_of,
                provider=raw.get("provider", "YAHOO_FINANCE"),
            )
        except (KeyError, TypeError, ValueError):
            pass
    return None


def _replay_fx(fixtures_dir: Optional[Path], from_ccy: str, to_ccy: str) -> Optional[ExchangeRateResult]:
    """REPLAY: load from fixtures — zero HTTP calls."""
    from ..replay_loader import load_fx_eod
    base = fixtures_dir or (Path(__file__).resolve().parent.parent.parent.parent / "tests" / "fixtures" / "market_data")
    data = load_fx_eod(base) if base else {}
    key = f"{from_ccy}_{to_ccy}"
    raw = data.get(key)
    if not raw:
        return None
    try:
        ts = raw.get("as_of", "")
        as_of = datetime.fromisoformat(ts.replace("Z", "+00:00")) if ts else datetime.now(timezone.utc)
        return ExchangeRateResult(
            from_currency=raw.get("from_currency", from_ccy),
            to_currency=raw.get("to_currency", to_ccy),
            rate=_to_decimal(raw.get("rate")),
            as_of=as_of,
            provider=raw.get("provider", "YAHOO_FINANCE"),
        )
    except (KeyError, TypeError, ValueError):
        return None


def _replay_history(fixtures_dir: Optional[Path], symbol: str, trading_days: int) -> list:
    """REPLAY: load 250d history from fixtures — zero HTTP calls."""
    from ..replay_loader import load_prices_history
    base = fixtures_dir or (Path(__file__).resolve().parent.parent.parent.parent / "tests" / "fixtures" / "market_data")
    data = load_prices_history(base) if base else {}
    rows_data = data.get(symbol, []) if isinstance(data, dict) else []
    result = []
    for item in rows_data[-trading_days:]:
        try:
            d = item.get("date", "")
            ts = datetime.fromisoformat(d.replace("Z", "+00:00")) if d else datetime.now(timezone.utc)
            result.append(OHLCVRow(
                date=ts,
                open_price=_to_decimal(item.get("open_price")) or Decimal("0"),
                high_price=_to_decimal(item.get("high_price")) or Decimal("0"),
                low_price=_to_decimal(item.get("low_price")) or Decimal("0"),
                close_price=_to_decimal(item.get("close_price")) or Decimal("0"),
                volume=int(item["volume"]) if item.get("volume") is not None else None,
            ))
        except (KeyError, TypeError, ValueError):
            pass
    return result


class YahooProvider(MarketDataProvider):
    """User-Agent Rotation required — EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC. Supports mode=REPLAY."""

    def __init__(self, mode: str = "LIVE", fixtures_dir: Optional[Path] = None):
        self._mode = (mode or "LIVE").upper()
        self._fixtures_dir = fixtures_dir

    async def get_ticker_price(self, symbol: str) -> Optional[PriceResult]:
        if self._mode == "REPLAY":
            return _replay_price(self._fixtures_dir, symbol)
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _fetch_price_sync, symbol)

    async def get_exchange_rate(
        self, from_ccy: str, to_ccy: str
    ) -> Optional[ExchangeRateResult]:
        if self._mode == "REPLAY":
            return _replay_fx(self._fixtures_dir, from_ccy, to_ccy)
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, _fetch_fx_sync, from_ccy, to_ccy
        )

    async def get_ticker_history(
        self,
        symbol: str,
        trading_days: int = 250,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
    ) -> list:
        """P3-015 — 250d OHLCV. date_from/date_to for gap-fill (SMART_HISTORY_FILL_SPEC)."""
        if self._mode == "REPLAY":
            return _replay_history(self._fixtures_dir, symbol, trading_days)
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, _fetch_history_sync, symbol, trading_days, date_from, date_to
        )

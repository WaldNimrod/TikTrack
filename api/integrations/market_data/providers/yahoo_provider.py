"""
Yahoo Finance Provider — P3-009
SSOT: EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC, MARKET_DATA_PIPE_SPEC §2.2
Guardrail: User-Agent Rotation required.
Role: Primary Prices / Fallback FX. Interval 1d (EOD). Precision 20,8.
REPLAY mode: returns fixtures — zero HTTP calls (TEAM_90 Automated Testing Directive).
"""

import asyncio
import logging
import os
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
from pathlib import Path
from typing import Dict, List, Optional

from ..provider_interface import (
    ExchangeRateResult,
    MarketDataProvider,
    OHLCVRow,
    PriceResult,
)

logger = logging.getLogger(__name__)


class YahooSymbolRateLimitedException(Exception):
    """Raised when a single symbol exhausts Yahoo v8/chart retry attempts.

    Distinct from a systemic Yahoo rate limit. Per-symbol failures must NOT
    trigger a global provider cooldown (Iron Rule #10).
    """

    def __init__(self, symbol: str):
        self.symbol = symbol
        super().__init__(f"Yahoo per-symbol rate limit exhausted: {symbol}")


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


def _tase_agorot_to_ils(val: Optional[Decimal], symbol: str) -> Optional[Decimal]:
    """TASE (.TA) agorot → ILS. 1 ILS = 100 agorot. Mandate B2."""
    if val is None or not symbol or not symbol.upper().endswith(".TA"):
        return val
    if val <= 0:
        return val
    return (val / Decimal("100")).quantize(Decimal("0.00000001"))


# US market proxy for market status (SPY = S&P 500 ETF)
_MARKET_STATUS_SYMBOL = "SPY"

# AUTO-WP003-05: market_cap NOT NULL for these symbols — v8/chart lacks marketCap; enrich from v7/quote
_AUTO_WP003_05_SYMBOLS = frozenset(("ANAU.MI", "BTC-USD", "TEVA.TA", "SPY"))


def _fetch_prices_batch_sync(symbols: List[str]) -> Dict[str, PriceResult]:
    """
    Synchronous batch price fetch using Yahoo v7/finance/quote. FIX-2.
    Returns dict {symbol: PriceResult} for symbols with valid, non-zero price.
    Symbols absent or invalid are NOT in the return dict — caller does individual fallback.
    """
    from api.integrations.market_data.market_data_settings import get_max_symbols_per_request

    batch_size = get_max_symbols_per_request()
    result: Dict[str, PriceResult] = {}

    for i in range(0, len(symbols), batch_size):
        # 100ms between batches — Legacy pattern (yahoo_finance_adapter.py §1.2)
        if i > 0:
            import time
            time.sleep(0.1)
        batch = symbols[i : i + batch_size]
        symbols_param = ",".join(batch)
        try:
            import httpx

            url = "https://query1.finance.yahoo.com/v7/finance/quote"
            params = {
                "symbols": symbols_param,
                "fields": (
                    "regularMarketPrice,regularMarketOpen,regularMarketDayHigh,"
                    "regularMarketDayLow,regularMarketPreviousClose,"
                    "regularMarketVolume,marketCap,regularMarketTime"
                ),
            }
            headers = {
                "User-Agent": _next_user_agent(),
                "Accept": "application/json",
                "Accept-Language": "en-US,en;q=0.9",
                "Origin": "https://finance.yahoo.com",
                "Referer": "https://finance.yahoo.com/",
            }
            if os.environ.get("GATE7_CC_EVIDENCE"):
                logger.info("GATE7_CC_YAHOO_HTTP")
            with httpx.Client(timeout=10) as client:
                resp = client.get(url, params=params, headers=headers)
                resp.raise_for_status()
                data = resp.json()
            quotes = (data or {}).get("quoteResponse", {}).get("result") or []
            for q in quotes:
                sym = q.get("symbol")
                raw_price = q.get("regularMarketPrice")
                if not sym or raw_price is None:
                    continue
                try:
                    price = _to_decimal(raw_price)
                    if not price or price <= 0:
                        continue
                    # TASE agorot → ILS (Mandate B2: 1 ILS = 100 agorot)
                    price = _tase_agorot_to_ils(price, sym)
                    raw_time = q.get("regularMarketTime")
                    as_of = (
                        datetime.fromtimestamp(int(raw_time), tz=timezone.utc)
                        if raw_time
                        else datetime.now(timezone.utc)
                    )
                    close_raw = q.get("regularMarketPreviousClose")
                    close_dec = _tase_agorot_to_ils(_to_decimal(close_raw), sym) if close_raw else price
                    vol_raw = q.get("regularMarketVolume")
                    vol = int(vol_raw) if vol_raw is not None and str(vol_raw) != "nan" else None
                    result[sym] = PriceResult(
                        symbol=sym,
                        price=price,
                        open_price=_tase_agorot_to_ils(_to_decimal(q.get("regularMarketOpen")), sym),
                        high_price=_tase_agorot_to_ils(_to_decimal(q.get("regularMarketDayHigh")), sym),
                        low_price=_tase_agorot_to_ils(_to_decimal(q.get("regularMarketDayLow")), sym),
                        close_price=close_dec if close_dec else price,
                        volume=vol,
                        market_cap=_to_decimal(q.get("marketCap")),
                        as_of=as_of,
                        provider="YAHOO_FINANCE",
                    )
                except (TypeError, ValueError):
                    continue
        except httpx.HTTPStatusError:
            raise
        except Exception:
            continue
    return result


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


def _to_forex_style_symbol(symbol: str) -> Optional[str]:
    """BTC-USD → BTCUSD=X. Yahoo משתמש בשני פורמטים (תיעוד רישמי)."""
    if "-" in symbol and len(symbol) >= 6:
        parts = symbol.split("-", 1)
        if len(parts) == 2 and parts[0].isalpha() and parts[1].isalpha():
            return f"{parts[0]}{parts[1]}=X"
    return None


def _fetch_last_close_via_v8_chart(symbol: str) -> Optional[PriceResult]:
    """Primary for EOD: v8/chart — היסטוריה תמיד קיימת (YAHOO_FINANCE_DATA_AND_REQUEST_LOGIC §1).
    מחירי סגירה חייבים להחזיר תמיד — לא תוך־יום; השוק סגור לא משנה.
    Crypto: Yahoo תומך ב־BTC-USD ו־BTCUSD=X (תיעוד רישמי) — מנסים שניהם.
    Retry 3×5s on 429 — כמו _fetch_history_v8_chart."""
    result = _fetch_last_close_via_v8_chart_inner(symbol)
    if result:
        return result
    alt = _to_forex_style_symbol(symbol)
    if alt and alt != symbol:
        import time
        time.sleep(2)  # רווח לפני ניסיון פורמט חלופי (BTCUSD=X)
        return _fetch_last_close_via_v8_chart_inner(alt, preferred_symbol=symbol)
    return None


def _fetch_last_close_via_v8_chart_inner(
    symbol: str, preferred_symbol: Optional[str] = None
) -> Optional[PriceResult]:
    """Inner: fetch from v8/chart. preferred_symbol = סימבול להחזרה (e.g. BTC-USD when fetching BTCUSD=X)."""
    import time
    import httpx
    out_sym = preferred_symbol or symbol
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
    params = {"interval": "1d", "range": "1mo"}  # 1mo = ~22 trading days, תמיד יש נתונים
    headers = {"User-Agent": _next_user_agent()}
    for attempt in range(3):
        try:
            if os.environ.get("GATE7_CC_EVIDENCE"):
                logger.info("GATE7_CC_YAHOO_HTTP")
            with httpx.Client(timeout=10.0, headers=headers) as client:
                r = client.get(url, params=params)
                if r.status_code == 429:
                    # Exponential backoff: 5s → 10s → 20s (Legacy pattern: yahoo_finance_adapter.py L349-354)
                    wait_time = (2 ** attempt) * 5
                    if attempt < 2:
                        logger.warning(
                            "Yahoo v8/chart 429 for %s (attempt %d/3) — backing off %ds",
                            symbol, attempt + 1, wait_time,
                        )
                        time.sleep(wait_time)
                        continue
                    # All retries exhausted for this symbol — per-symbol rate limit, NOT systemic (G7-FIX-2A)
                    logger.warning(
                        "Yahoo v8/chart 429 exhausted for %s — per-symbol rate limit (no global cooldown)",
                        symbol,
                    )
                    raise YahooSymbolRateLimitedException(symbol)
                r.raise_for_status()
            data = r.json()
            chart = data.get("chart", {}).get("result")
            if not chart:
                return None
            c0 = chart[0]
            timestamps = c0.get("timestamp", []) or []
            quote = (c0.get("indicators", {}).get("quote", [{}]) or [{}])[0]
            closes = quote.get("close", []) or []
            price = None
            if timestamps and closes:
                i = -1
                close_val = closes[i]
                price = _to_decimal(close_val)
            if (not price or price <= 0) and c0.get("meta"):
                meta = c0["meta"]
                price = _to_decimal(meta.get("regularMarketPrice"))
            if not price or price <= 0:
                return None
            ts_unix = timestamps[-1] if timestamps else None
            try:
                ts = datetime.fromtimestamp(ts_unix, tz=timezone.utc) if ts_unix else datetime.now(timezone.utc)
            except (ValueError, TypeError, OSError):
                ts = datetime.now(timezone.utc)
            i = -1
            opens = quote.get("open", []) or []
            highs = quote.get("high", []) or []
            lows = quote.get("low", []) or []
            vols = quote.get("volume", []) or []
            o = _to_decimal(opens[i]) if abs(i) <= len(opens) and opens[i] else None
            h = _to_decimal(highs[i]) if abs(i) <= len(highs) and highs[i] else None
            lw = _to_decimal(lows[i]) if abs(i) <= len(lows) and lows[i] else None
            vol = int(vols[i]) if abs(i) <= len(vols) and vols[i] is not None and str(vols[i]) != "nan" else None
            # TASE agorot → ILS (Mandate B2)
            price = _tase_agorot_to_ils(price, out_sym)
            o = _tase_agorot_to_ils(o, out_sym)
            h = _tase_agorot_to_ils(h, out_sym)
            lw = _tase_agorot_to_ils(lw, out_sym)
            mc = None
            if out_sym in _AUTO_WP003_05_SYMBOLS:
                mc = _fetch_market_cap_only_v7(symbol)
            return PriceResult(
                symbol=out_sym,
                price=price,
                open_price=o,
                high_price=h,
                low_price=lw,
                close_price=price,
                volume=vol,
                market_cap=mc,
                as_of=ts,
                provider="YAHOO_FINANCE",
            )
        except Exception as e:
            logger.debug("Yahoo v8/chart last-close attempt %s failed for %s: %s", attempt + 1, symbol, e)
            if attempt < 2:
                time.sleep(5)
    return None


def _fetch_market_cap_only_v7(symbol: str) -> Optional[Decimal]:
    """AUTO-WP003-05: Minimal v7/quote request to get marketCap. v8/chart does not return it. H3: headers for 401."""
    try:
        import httpx
        if os.environ.get("GATE7_CC_EVIDENCE"):
            logger.info("GATE7_CC_YAHOO_HTTP")
        url = "https://query1.finance.yahoo.com/v7/finance/quote"
        params = {"symbols": symbol}
        headers = {
            "User-Agent": _next_user_agent(),
            "Accept": "application/json",
            "Accept-Language": "en-US,en;q=0.9",
            "Origin": "https://finance.yahoo.com",
            "Referer": "https://finance.yahoo.com/",
        }
        with httpx.Client(timeout=5.0, headers=headers) as client:
            r = client.get(url, params=params)
            r.raise_for_status()
        data = r.json()
        results = data.get("quoteResponse", {}).get("result", [])
        if not results:
            return None
        raw = results[0].get("marketCap")
        return _to_decimal(raw) if raw else None
    except Exception:
        return None


def _fetch_price_via_quote_api(symbol: str) -> Optional[PriceResult]:
    """v7/finance/quote — CC-WP003-04 v7-first path; also used as fallback. H3: Accept/Referer to reduce 401."""
    try:
        import httpx
        if os.environ.get("GATE7_CC_EVIDENCE"):
            logger.info("GATE7_CC_YAHOO_HTTP")
        url = "https://query1.finance.yahoo.com/v7/finance/quote"
        params = {"symbols": symbol}
        headers = {
            "User-Agent": _next_user_agent(),
            "Accept": "application/json",
            "Accept-Language": "en-US,en;q=0.9",
            "Origin": "https://finance.yahoo.com",
            "Referer": "https://finance.yahoo.com/",
        }
        with httpx.Client(timeout=10.0, headers=headers) as client:
            r = client.get(url, params=params)
            r.raise_for_status()
        data = r.json()
        results = data.get("quoteResponse", {}).get("result", [])
        if not results:
            return None
        q = results[0]
        out_sym = q.get("symbol", symbol)
        price = _to_decimal(q.get("regularMarketPrice") or q.get("regularMarketPreviousClose"))
        if not price or price <= 0:
            return None
        price = _tase_agorot_to_ils(price, out_sym)
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
            symbol=out_sym,
            price=price,
            open_price=_tase_agorot_to_ils(_to_decimal(q.get("regularMarketOpen")), out_sym),
            high_price=_tase_agorot_to_ils(_to_decimal(q.get("regularMarketDayHigh")), out_sym),
            low_price=_tase_agorot_to_ils(_to_decimal(q.get("regularMarketDayLow")), out_sym),
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
    """מחיר סגירה EOD — חייב להחזיר תמיד. לא תוך־יום; שוק סגור לא משנה.
    CC-WP003-04 / Team 50: v7→yfinance→v8. v7 (401) + v8 (429) common; yfinance bypasses Yahoo direct HTTP."""
    # v7 first (least 429 when it works)
    result = _fetch_price_via_quote_api(symbol)
    if result and result.price and result.price > 0:
        return result
    # yfinance before v8 — avoids v8 429 when v7 returns 401 (Yahoo anti-scraping)
    try:
        import yfinance as yf
        from datetime import timedelta

        ticker = yf.Ticker(symbol)  # NO session — per DEBUG_YAHOO_RESULTS
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
            return _history_to_price_result(symbol, last)
    except Exception as e:
        logger.warning("Yahoo history fetch failed for %s: %s", symbol, e)

    # v8 last — most rate-limited, only when v7 and yfinance both fail
    return _fetch_last_close_via_v8_chart(symbol)


def _history_to_price_result(symbol: str, last) -> Optional[PriceResult]:
    """Build PriceResult from history row. NO ticker.info — quoteSummary causes 429 (YAHOO_FINANCE_DATA_AND_REQUEST_LOGIC)."""
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
    return PriceResult(
        symbol=symbol,
        price=_to_decimal(close),
        open_price=_to_decimal(last.get("Open")),
        high_price=_to_decimal(last.get("High")),
        low_price=_to_decimal(last.get("Low")),
        close_price=_to_decimal(close),
        volume=vol,
        market_cap=None,  # avoid ticker.info (quoteSummary → 429)
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


def _fetch_history_v8_chart(
    symbol: str,
    trading_days: int,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
) -> List:
    """Direct v8/chart — עובד (v7/quote = 401). SPEC-PROV-YF-HIST. Retry 3×5s.
    250d full: range=2y (~504 cal days). Gap-fill: period1/period2 only (no range)."""
    import time
    for attempt in range(3):
        try:
            import httpx
            url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
            if date_from and date_to:
                # Gap-fill: use period1/period2 only. period2 = start of day after date_to (to include date_to)
                p1 = datetime.combine(date_from, datetime.min.time()).replace(tzinfo=timezone.utc)
                p2 = datetime.combine(date_to + timedelta(days=1), datetime.min.time()).replace(tzinfo=timezone.utc)
                period1_ts = int(p1.timestamp())
                period2_ts = int(p2.timestamp())
                params = {"interval": "1d", "period1": period1_ts, "period2": period2_ts}
                logger.info(
                    "Yahoo gap-fill: symbol=%s date_from=%s date_to=%s period1=%d period2=%d",
                    symbol, date_from, date_to, period1_ts, period2_ts,
                )
            else:
                # Full 250d: range=2y covers ~504 cal days (~252 trading days)
                range_val = "2y" if trading_days > 252 else "1y"
                params = {"interval": "1d", "range": range_val}
            headers = {"User-Agent": _next_user_agent()}
            with httpx.Client(timeout=15.0) as client:
                r = client.get(url, params=params, headers=headers)
                if r.status_code == 429:
                    # Exponential backoff: 5s → 10s → 20s (Legacy pattern)
                    wait_time = (2 ** attempt) * 5
                    if attempt < 2:
                        logger.warning(
                            "Yahoo v8/chart 429 for %s history (attempt %d/3) — backing off %ds",
                            symbol, attempt + 1, wait_time,
                        )
                        time.sleep(wait_time)
                        continue
                    # All retries exhausted — set cooldown (SOP-015)
                    from ..provider_cooldown import set_cooldown
                    from ..market_data_settings import get_provider_cooldown_minutes
                    cooldown_min = get_provider_cooldown_minutes()
                    set_cooldown("YAHOO_FINANCE", cooldown_min)
                    logger.warning("Yahoo v8/chart 429 — cooldown %d min (SOP-015)", cooldown_min)
                r.raise_for_status()
            data = r.json()
            chart = data.get("chart", {}).get("result")
            if not chart:
                err = data.get("chart", {}).get("error")
                if attempt < 2:
                    time.sleep(5)
                    continue
                logger.warning("Yahoo v8/chart empty for %s: %s", symbol, err)
                return []
            c0 = chart[0]
            timestamps = c0.get("timestamp", [])
            quote = (c0.get("indicators", {}).get("quote", [{}]) or [{}])[0]
            opens = quote.get("open", []) or []
            highs = quote.get("high", []) or []
            lows = quote.get("low", []) or []
            closes = quote.get("close", []) or []
            volumes = quote.get("volume", []) or []
            result: List = []
            for i, ts_unix in enumerate(timestamps):
                try:
                    ts = datetime.fromtimestamp(ts_unix, tz=timezone.utc)
                except (ValueError, TypeError, OSError):
                    continue
                o = _to_decimal(opens[i] if i < len(opens) else None) or Decimal("0")
                h = _to_decimal(highs[i] if i < len(highs) else None) or Decimal("0")
                lw = _to_decimal(lows[i] if i < len(lows) else None) or Decimal("0")
                c = _to_decimal(closes[i] if i < len(closes) else None) or Decimal("0")
                v = volumes[i] if i < len(volumes) else None
                v = int(v) if v is not None and str(v) != "nan" else None
                if date_from and ts.date() < date_from:
                    continue
                if date_to and ts.date() > date_to:
                    continue
                result.append(OHLCVRow(date=ts, open_price=o, high_price=h, low_price=lw, close_price=c, volume=v))
            if result:
                # Dedupe by date (keep last occurrence)
                seen: set = set()
                deduped: List = []
                for r in reversed(result):
                    d = r.date.date() if hasattr(r.date, "date") else r.date
                    d_str = d.isoformat() if hasattr(d, "isoformat") else str(d)[:10]
                    if d_str not in seen:
                        seen.add(d_str)
                        deduped.append(r)
                deduped.reverse()
                out = deduped[-trading_days:] if not (date_from or date_to) else deduped
                if date_from and date_to:
                    logger.info("Yahoo gap-fill: symbol=%s returned %d rows", symbol, len(out))
                return out
            if date_from and date_to:
                logger.warning("Yahoo gap-fill: symbol=%s returned 0 rows (empty chart)", symbol)
            if attempt < 2:
                time.sleep(5)
        except Exception as e:
            logger.warning("Yahoo v8/chart failed for %s (attempt %d/3): %s", symbol, attempt + 1, e)
            if attempt < 2:
                time.sleep(5)
    if date_from and date_to:
        logger.warning("Yahoo gap-fill: symbol=%s failed after retries, returning empty", symbol)
    return []


def _fetch_history_sync(
    symbol: str,
    trading_days: int,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
) -> List:
    """P3-015 — 250d OHLCV. Primary: v8/chart (עובד). Fallback: yfinance."""
    result = _fetch_history_v8_chart(symbol, trading_days, date_from, date_to)
    if result:
        return result
    try:
        import yfinance as yf
        # RULE 1: NO custom Session for yfinance — causes 429 (DEBUG_YAHOO_RESULTS, YAHOO_FINANCE_DATA_AND_REQUEST_LOGIC)
        ticker = yf.Ticker(symbol)
        end_d = date_to or datetime.now(timezone.utc).date()
        start_d = date_from or (end_d - timedelta(days=400))
        info = ticker.history(start=start_d.isoformat(), end=(end_d + timedelta(days=1)).isoformat(), interval="1d", debug=False)
        if info is None or info.empty:
            return []
        rows = info.tail(trading_days) if not (date_from or date_to) else info
        out: List = []
        for idx in range(len(rows)):
            row = rows.iloc[idx]
            ts = row.name
            if hasattr(ts, "to_pydatetime"):
                ts = ts.to_pydatetime()
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)
            out.append(OHLCVRow(
                date=ts,
                open_price=_to_decimal(row.get("Open")) or Decimal("0"),
                high_price=_to_decimal(row.get("High")) or Decimal("0"),
                low_price=_to_decimal(row.get("Low")) or Decimal("0"),
                close_price=_to_decimal(row.get("Close")) or Decimal("0"),
                volume=int(row["Volume"]) if "Volume" in row.index and str(row.get("Volume", "")) != "nan" else None,
            ))
        return out
    except Exception as e:
        logger.warning("Yahoo yfinance fallback failed for %s: %s", symbol, e)
    return []


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

    async def get_ticker_prices_batch(self, symbols: List[str]) -> Dict[str, PriceResult]:
        """FIX-2: Batch fetch via v7/finance/quote. REPLAY returns {}; caller falls back to per-symbol."""
        if not symbols:
            return {}
        if self._mode == "REPLAY":
            return {}
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _fetch_prices_batch_sync, symbols)

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

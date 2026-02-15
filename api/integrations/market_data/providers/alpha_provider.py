"""
Alpha Vantage Provider — P3-009
SSOT: EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC, MARKET_DATA_PIPE_SPEC §2.2
Guardrail: RateLimitQueue 12.5s (5 calls/min).
Role: Primary FX / Fallback Prices. Precision 20,8.
REPLAY mode: returns fixtures — zero HTTP calls (TEAM_90 Automated Testing Directive).
"""

import asyncio
import logging
import os
from datetime import date, datetime, timezone
from decimal import Decimal
from pathlib import Path
from typing import Optional

import httpx

from ..provider_interface import (
    ExchangeRateResult,
    MarketDataProvider,
    OHLCVRow,
    PriceResult,
)

logger = logging.getLogger(__name__)

ALPHA_BASE_URL = "https://www.alphavantage.co/query"
ALPHA_RATE_LIMIT_SECONDS = 12.5  # 5 calls/min per spec

# Module-level rate limit — shared across ALL AlphaProvider instances (per EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC)
_alpha_last_call: float = 0.0
_alpha_rate_lock = asyncio.Lock()


def _replay_fx_alpha(fixtures_dir: Optional[Path], from_ccy: str, to_ccy: str) -> Optional[ExchangeRateResult]:
    """REPLAY: load FX from fixtures — zero HTTP calls."""
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
            rate=Decimal(str(raw.get("rate", "0"))).quantize(Decimal("0.00000001")),
            as_of=as_of,
            provider=raw.get("provider", "ALPHA_VANTAGE"),
        )
    except (KeyError, TypeError, ValueError):
        return None


def _replay_price_alpha(fixtures_dir: Optional[Path], symbol: str) -> Optional[PriceResult]:
    """REPLAY: load price from fixtures — zero HTTP calls."""
    from ..replay_loader import load_prices_eod
    base = fixtures_dir or (Path(__file__).resolve().parent.parent.parent.parent / "tests" / "fixtures" / "market_data")
    data = load_prices_eod(base) if base else {}
    raw = data.get(symbol)
    if not raw:
        return None
    try:
        ts = raw.get("as_of", "")
        as_of = datetime.fromisoformat(ts.replace("Z", "+00:00")) if ts else datetime.now(timezone.utc)
        return PriceResult(
            symbol=raw.get("symbol", symbol),
            price=Decimal(str(raw.get("price", "0"))).quantize(Decimal("0.00000001")),
            open_price=Decimal(str(raw.get("open_price", "0"))).quantize(Decimal("0.00000001")) if raw.get("open_price") else None,
            high_price=Decimal(str(raw.get("high_price", "0"))).quantize(Decimal("0.00000001")) if raw.get("high_price") else None,
            low_price=Decimal(str(raw.get("low_price", "0"))).quantize(Decimal("0.00000001")) if raw.get("low_price") else None,
            close_price=Decimal(str(raw.get("close_price", raw.get("price", "0")))).quantize(Decimal("0.00000001")),
            volume=int(raw["volume"]) if raw.get("volume") is not None else None,
            market_cap=Decimal(str(raw["market_cap"])).quantize(Decimal("0.00000001")) if raw.get("market_cap") else None,
            as_of=as_of,
            provider=raw.get("provider", "ALPHA_VANTAGE"),
        )
    except (KeyError, TypeError, ValueError):
        return None


def _replay_history_alpha(fixtures_dir: Optional[Path], symbol: str, trading_days: int) -> list:
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
                open_price=Decimal(str(item.get("open_price", "0"))).quantize(Decimal("0.00000001")),
                high_price=Decimal(str(item.get("high_price", "0"))).quantize(Decimal("0.00000001")),
                low_price=Decimal(str(item.get("low_price", "0"))).quantize(Decimal("0.00000001")),
                close_price=Decimal(str(item.get("close_price", "0"))).quantize(Decimal("0.00000001")),
                volume=int(item["volume"]) if item.get("volume") is not None else None,
            ))
        except (KeyError, TypeError, ValueError):
            pass
    return result


class AlphaProvider(MarketDataProvider):
    """
    RateLimitQueue 12.5s — per EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC.
    API key from env: ALPHA_VANTAGE_API_KEY (Team 60 config).
    Supports mode=REPLAY — zero HTTP calls.
    """

    def __init__(self, api_key: Optional[str] = None, mode: str = "LIVE", fixtures_dir: Optional[Path] = None):
        self._api_key = api_key or os.environ.get("ALPHA_VANTAGE_API_KEY", "")
        self._mode = (mode or "LIVE").upper()
        self._fixtures_dir = fixtures_dir

    async def _rate_limit(self) -> None:
        """Enforce 12.5s between calls — 5 calls/min per spec. Shared across ALL instances."""
        global _alpha_last_call
        async with _alpha_rate_lock:
            now = asyncio.get_event_loop().time()
            elapsed = now - _alpha_last_call
            if elapsed < ALPHA_RATE_LIMIT_SECONDS:
                await asyncio.sleep(ALPHA_RATE_LIMIT_SECONDS - elapsed)
            _alpha_last_call = asyncio.get_event_loop().time()

    def _to_decimal(self, val) -> Optional[Decimal]:
        """Force precision 20,8 per spec."""
        if val is None:
            return None
        try:
            return Decimal(str(float(val))).quantize(Decimal("0.00000001"))
        except (TypeError, ValueError):
            return None

    async def get_ticker_price_crypto(self, symbol: str, market: str = "USD") -> Optional[PriceResult]:
        """
        Crypto-specific: DIGITAL_CURRENCY_DAILY endpoint.
        Per CORRECTIVE: Alpha must NOT use GLOBAL_QUOTE for crypto.
        symbol: base (e.g. BTC), market: quote (e.g. USD).
        """
        if self._mode == "REPLAY":
            return _replay_price_alpha(self._fixtures_dir, f"{symbol}-{market}")
        if not self._api_key:
            logger.warning("Alpha Vantage: no API key")
            return None
        await self._rate_limit()
        try:
            params = {
                "function": "DIGITAL_CURRENCY_DAILY",
                "symbol": symbol,
                "market": market,
                "apikey": self._api_key,
            }
            async with httpx.AsyncClient(timeout=15.0) as client:
                r = await client.get(ALPHA_BASE_URL, params=params)
                r.raise_for_status()
                data = r.json()
            if data.get("Information") or data.get("Note"):
                logger.warning(
                    "Alpha Vantage rate limit (crypto) for %s/%s: %s",
                    symbol, market,
                    (data.get("Information") or data.get("Note"))[:120],
                )
                return None
            series = data.get("Time Series (Digital Currency Daily)", {})
            if not series:
                return None
            sorted_dates = sorted(series.keys(), reverse=True)
            latest_key = sorted_dates[0]
            v = series[latest_key]
            # Alpha returns "1a. open (USD)", "2a. high (USD)" etc when market=USD
            def _get(key_candidates):
                for k in key_candidates:
                    if k in v and v[k] is not None:
                        return v[k]
                return None
            open_val = _get([f"1a. open ({market})", "1a. open (USD)", "1. open"])
            high_val = _get([f"2a. high ({market})", "2a. high (USD)", "2. high"])
            low_val = _get([f"3a. low ({market})", "3a. low (USD)", "3. low"])
            close_val = _get([f"4a. close ({market})", "4a. close (USD)", "4. close"])
            vol_val = v.get("5. volume")
            price = self._to_decimal(close_val or open_val)
            if not price or price <= 0:
                return None
            # Alpha returns volume as float string (e.g. "352.20690897") — ROOT_FIX: int(float(...))
            vol_int = None
            if vol_val is not None and str(vol_val).strip():
                try:
                    vol_int = int(float(vol_val))
                except (TypeError, ValueError):
                    pass
            return PriceResult(
                symbol=f"{symbol}-{market}",
                price=price,
                open_price=self._to_decimal(open_val),
                high_price=self._to_decimal(high_val),
                low_price=self._to_decimal(low_val),
                close_price=price,
                volume=vol_int,
                market_cap=None,
                as_of=datetime.now(timezone.utc),
                provider="ALPHA_VANTAGE",
            )
        except Exception as e:
            logger.warning("Alpha crypto price fetch failed for %s/%s: %s", symbol, market, e)
            return None

    async def get_ticker_price(self, symbol: str) -> Optional[PriceResult]:
        """Fallback for Prices. GLOBAL_QUOTE primary; TIME_SERIES_DAILY fallback for international symbols."""
        if self._mode == "REPLAY":
            return _replay_price_alpha(self._fixtures_dir, symbol)
        if not self._api_key:
            logger.warning("Alpha Vantage: no API key")
            return None
        await self._rate_limit()
        try:
            params = {
                "function": "GLOBAL_QUOTE",
                "symbol": symbol,
                "apikey": self._api_key,
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                r = await client.get(ALPHA_BASE_URL, params=params)
                r.raise_for_status()
                data = r.json()
            # Rate limit: Alpha returns {"Information":"..."} or {"Note":"..."} — do NOT call fallback (saves quota)
            if data.get("Information") or data.get("Note"):
                logger.warning(
                    "Alpha Vantage rate limit for %s: %s",
                    symbol,
                    (data.get("Information") or data.get("Note"))[:120],
                )
                return None
            quote = data.get("Global Quote", {})
            price = self._to_decimal(quote.get("05. price")) if quote else None
            if price and price > 0:
                market_cap = await self._fetch_market_cap(symbol)
                return PriceResult(
                    symbol=symbol,
                    price=price,
                    open_price=self._to_decimal(quote.get("02. open")),
                    high_price=self._to_decimal(quote.get("03. high")),
                    low_price=self._to_decimal(quote.get("04. low")),
                    close_price=price,
                    volume=int(quote.get("06. volume", 0)) if quote.get("06. volume") else None,
                    market_cap=market_cap,
                    as_of=datetime.now(timezone.utc),
                    provider="ALPHA_VANTAGE",
                )
            # Fallback: GLOBAL_QUOTE empty for some international symbols — try TIME_SERIES_DAILY
            result = await self._get_price_from_timeseries_daily(symbol)
            if result:
                return result
            return None
        except Exception as e:
            logger.warning("Alpha price fetch failed for %s: %s", symbol, e)
            return None

    async def _get_price_from_timeseries_daily(self, symbol: str) -> Optional[PriceResult]:
        """Fallback when GLOBAL_QUOTE empty (e.g. TEVA.TA, ANAU.MI per Alpha docs)."""
        await self._rate_limit()
        try:
            params = {
                "function": "TIME_SERIES_DAILY",
                "symbol": symbol,
                "outputsize": "compact",
                "apikey": self._api_key,
            }
            async with httpx.AsyncClient(timeout=15.0) as client:
                r = await client.get(ALPHA_BASE_URL, params=params)
                r.raise_for_status()
                data = r.json()
            series = data.get("Time Series (Daily)", {})
            if not series:
                return None
            sorted_dates = sorted(series.keys(), reverse=True)
            latest_key = sorted_dates[0]
            v = series[latest_key]
            close_val = v.get("4. close")
            price = self._to_decimal(close_val)
            if not price or price <= 0:
                return None
            vol_raw = v.get("5. volume")
            vol_int = None
            if vol_raw is not None and str(vol_raw).strip():
                try:
                    vol_int = int(float(vol_raw))
                except (TypeError, ValueError):
                    pass
            return PriceResult(
                symbol=symbol,
                price=price,
                open_price=self._to_decimal(v.get("1. open")),
                high_price=self._to_decimal(v.get("2. high")),
                low_price=self._to_decimal(v.get("3. low")),
                close_price=price,
                volume=vol_int,
                market_cap=None,
                as_of=datetime.now(timezone.utc),
                provider="ALPHA_VANTAGE",
            )
        except Exception as e:
            logger.debug("Alpha TIME_SERIES_DAILY fallback failed for %s: %s", symbol, e)
            return None

    async def _fetch_market_cap(self, symbol: str) -> Optional[Decimal]:
        """P3-013 — OVERVIEW endpoint has MarketCapitalization."""
        await self._rate_limit()
        try:
            params = {
                "function": "OVERVIEW",
                "symbol": symbol,
                "apikey": self._api_key,
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                r = await client.get(ALPHA_BASE_URL, params=params)
                r.raise_for_status()
                data = r.json()
            mc = data.get("MarketCapitalization")
            return self._to_decimal(mc) if mc else None
        except Exception as e:
            logger.debug("Alpha market cap fetch failed for %s: %s", symbol, e)
            return None

    async def get_ticker_history_crypto(
        self,
        symbol: str,
        market: str = "USD",
        trading_days: int = 250,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
    ) -> list:
        """Crypto: DIGITAL_CURRENCY_DAILY — 250d OHLCV. Per CORRECTIVE: not TIME_SERIES_DAILY."""
        if self._mode == "REPLAY":
            return _replay_history_alpha(self._fixtures_dir, f"{symbol}-{market}", trading_days)
        if not self._api_key:
            return []
        await self._rate_limit()
        result = []
        try:
            params = {
                "function": "DIGITAL_CURRENCY_DAILY",
                "symbol": symbol,
                "market": market,
                "apikey": self._api_key,
            }
            async with httpx.AsyncClient(timeout=15.0) as client:
                r = await client.get(ALPHA_BASE_URL, params=params)
                r.raise_for_status()
                data = r.json()
            series = data.get("Time Series (Digital Currency Daily)", {})
            if not series:
                return []
            sorted_dates = sorted(series.keys(), reverse=True)[:trading_days]
            for d in reversed(sorted_dates):
                try:
                    d_date = datetime.strptime(d, "%Y-%m-%d").date()
                except (ValueError, TypeError):
                    d_date = None
                if date_from is not None and d_date is not None and d_date < date_from:
                    continue
                if date_to is not None and d_date is not None and d_date > date_to:
                    continue
                v = series[d]
                open_val = v.get(f"1a. open ({market})") or v.get("1a. open (USD)") or v.get("1. open")
                high_val = v.get(f"2a. high ({market})") or v.get("2a. high (USD)") or v.get("2. high")
                low_val = v.get(f"3a. low ({market})") or v.get("3a. low (USD)") or v.get("3. low")
                close_val = v.get(f"4a. close ({market})") or v.get("4a. close (USD)") or v.get("4. close")
                vol_val = v.get("5. volume")
                vol_int = None
                if vol_val is not None and str(vol_val).strip():
                    try:
                        vol_int = int(float(vol_val))  # ROOT_FIX: Alpha returns float string
                    except (TypeError, ValueError):
                        pass
                try:
                    ts = datetime.fromisoformat(d).replace(tzinfo=timezone.utc)
                except (ValueError, TypeError):
                    ts = datetime.now(timezone.utc)
                result.append(OHLCVRow(
                    date=ts,
                    open_price=self._to_decimal(open_val) or Decimal("0"),
                    high_price=self._to_decimal(high_val) or Decimal("0"),
                    low_price=self._to_decimal(low_val) or Decimal("0"),
                    close_price=self._to_decimal(close_val) or Decimal("0"),
                    volume=vol_int,
                ))
        except Exception as e:
            logger.warning("Alpha crypto history fetch failed for %s/%s: %s", symbol, market, e)
        return result

    async def get_ticker_history(
        self,
        symbol: str,
        trading_days: int = 250,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
    ) -> list:
        """P3-015 — 250d OHLCV. compact = 100 days. Filters to date_from/date_to when provided — only return needed range. Do NOT use for crypto — use get_ticker_history_crypto."""
        if self._mode == "REPLAY":
            return _replay_history_alpha(self._fixtures_dir, symbol, trading_days)
        if not self._api_key:
            return []
        await self._rate_limit()
        result = []
        try:
            params = {
                "function": "TIME_SERIES_DAILY",
                "symbol": symbol,
                "outputsize": "compact",  # min request; Alpha API lacks range param
                "apikey": self._api_key,
            }
            async with httpx.AsyncClient(timeout=15.0) as client:
                r = await client.get(ALPHA_BASE_URL, params=params)
                r.raise_for_status()
                data = r.json()
            series = data.get("Time Series (Daily)", {})
            if not series:
                return []
            sorted_dates = sorted(series.keys(), reverse=True)[:trading_days]
            for d in reversed(sorted_dates):
                try:
                    d_date = datetime.strptime(d, "%Y-%m-%d").date()
                except (ValueError, TypeError):
                    d_date = None
                if date_from is not None and d_date is not None and d_date < date_from:
                    continue
                if date_to is not None and d_date is not None and d_date > date_to:
                    continue
                v = series[d]
                try:
                    ts = datetime.fromisoformat(d).replace(tzinfo=timezone.utc)
                except (ValueError, TypeError):
                    ts = datetime.now(timezone.utc)
                vol_raw = v.get("5. volume")
                vol_int = None
                if vol_raw is not None and str(vol_raw).strip():
                    try:
                        vol_int = int(float(vol_raw))  # ROOT_FIX: Alpha may return float string
                    except (TypeError, ValueError):
                        pass
                result.append(OHLCVRow(
                    date=ts,
                    open_price=self._to_decimal(v.get("1. open")) or Decimal("0"),
                    high_price=self._to_decimal(v.get("2. high")) or Decimal("0"),
                    low_price=self._to_decimal(v.get("3. low")) or Decimal("0"),
                    close_price=self._to_decimal(v.get("4. close")) or Decimal("0"),
                    volume=vol_int,
                ))
        except Exception as e:
            logger.warning("Alpha history fetch failed for %s: %s", symbol, e)
        return result

    async def get_exchange_rate(
        self, from_ccy: str, to_ccy: str
    ) -> Optional[ExchangeRateResult]:
        """Primary for FX. CURRENCY_EXCHANGE_RATE endpoint. REPLAY: fixtures only."""
        if self._mode == "REPLAY":
            return _replay_fx_alpha(self._fixtures_dir, from_ccy, to_ccy)
        if not self._api_key:
            logger.warning("Alpha Vantage: no API key")
            return None
        await self._rate_limit()
        try:
            params = {
                "function": "CURRENCY_EXCHANGE_RATE",
                "from_currency": from_ccy,
                "to_currency": to_ccy,
                "apikey": self._api_key,
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                r = await client.get(ALPHA_BASE_URL, params=params)
                r.raise_for_status()
                data = r.json()
            rate_info = data.get("Realtime Currency Exchange Rate", {})
            if not rate_info:
                return None
            rate = self._to_decimal(rate_info.get("5. Exchange Rate"))
            if not rate or rate <= 0:
                return None
            last_refresh = rate_info.get("6. Last Refreshed")
            ts = datetime.now(timezone.utc)
            if last_refresh:
                try:
                    ts = datetime.fromisoformat(
                        str(last_refresh).replace(" ", "T")
                    )
                    if ts.tzinfo is None:
                        ts = ts.replace(tzinfo=timezone.utc)
                except (ValueError, TypeError):
                    pass
            return ExchangeRateResult(
                from_currency=from_ccy,
                to_currency=to_ccy,
                rate=rate,
                as_of=ts,
                provider="ALPHA_VANTAGE",
            )
        except Exception as e:
            logger.warning("Alpha FX fetch failed for %s/%s: %s", from_ccy, to_ccy, e)
            return None

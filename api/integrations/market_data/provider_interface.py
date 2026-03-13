"""
Provider Interface — P3-008
SSOT: MARKET_DATA_PIPE_SPEC §2.1, M2 Mandate, TEAM_20_TO_ARCHITECT_SMART_HISTORY_FILL_SPEC
Agnostic interface: swap provider without changing engine logic.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal
from typing import Optional


@dataclass
class PriceResult:
    """Per MARKET_DATA_PIPE_SPEC §4.1, PRECISION_POLICY_SSOT — Precision 20,8."""

    symbol: str
    price: Decimal
    open_price: Optional[Decimal] = None
    high_price: Optional[Decimal] = None
    low_price: Optional[Decimal] = None
    close_price: Optional[Decimal] = None
    volume: Optional[int] = None
    market_cap: Optional[Decimal] = None  # P3-013 — MARKET_DATA_COVERAGE_MATRIX
    as_of: Optional[datetime] = None
    provider: str = ""


@dataclass
class ExchangeRateResult:
    """Per FOREX_MARKET_SPEC — conversion_rate NUMERIC(20,8)."""

    from_currency: str
    to_currency: str
    rate: Decimal
    as_of: Optional[datetime] = None
    provider: str = ""


@dataclass
class OHLCVRow:
    """Single day OHLCV — for 250d historical (P3-015)."""

    date: datetime
    open_price: Decimal
    high_price: Decimal
    low_price: Decimal
    close_price: Decimal
    volume: Optional[int] = None


class MarketDataProvider(ABC):
    """
    Agnostic interface — config-driven swap without changing engine.
    Domain mapping per MARKET_DATA_PIPE_SPEC §2.1:
    - FX: Alpha → Yahoo
    - Prices: Yahoo → Alpha
    """

    @abstractmethod
    async def get_ticker_price(self, symbol: str) -> Optional[PriceResult]:
        """Fetch ticker price. Returns None on failure."""
        pass

    @abstractmethod
    async def get_exchange_rate(self, from_ccy: str, to_ccy: str) -> Optional[ExchangeRateResult]:
        """Fetch FX rate. Returns None on failure."""
        pass

    async def get_ticker_history(
        self,
        symbol: str,
        trading_days: int = 250,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
    ) -> list:
        """
        P3-015 — 250d OHLCV. Override in providers.
        date_from/date_to optional — for gap-fill; providers may use or ignore.
        Default returns [].
        """
        return []

"""
Symbol Metadata Service
=======================

Provides shared logic for extracting and enriching symbol metadata
across all import connectors. The service consolidates company name,
exchange, and external link generation so that individual connectors
can remain lean and avoid duplicating mapping logic.

Key responsibilities:
- Collect raw metadata emitted by connectors.
- Enrich missing details via the external data adapters (Yahoo Finance).
- Generate Google Finance and Yahoo Finance links using a consistent
  priority order (Google+Yahoo → Google only → Yahoo only → Not found).
- Normalise outputs into JSON-serialisable dictionaries that can be
  stored in the import session summary and consumed by the frontend.
"""

from __future__ import annotations

from typing import Dict, Any, List, Optional, Iterable
from dataclasses import dataclass
from sqlalchemy.orm import Session

from config.logging import get_logger
from services.external_data.yahoo_finance_adapter import YahooFinanceAdapter, QuoteData

logger = get_logger(__name__)


@dataclass
class SymbolMetadata:
    """Canonical representation for metadata collected per symbol."""

    symbol: str
    display_symbol: str
    company_name: Optional[str] = None
    exchange_code: Optional[str] = None
    google_exchange_code: Optional[str] = None
    currency: Optional[str] = None
    links: Optional[Dict[str, Optional[str]]] = None
    sources: Optional[List[str]] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "symbol": self.symbol,
            "display_symbol": self.display_symbol,
            "company_name": self.company_name,
            "exchange_code": self.exchange_code,
            "google_exchange_code": self.google_exchange_code,
            "currency": self.currency,
            "links": self.links or {},
            "sources": self.sources or [],
        }


class SymbolMetadataService:
    """
    Shared metadata extractor for import connectors.
    """

    def __init__(self, db_session: Session):
        self.db_session = db_session
        self._yahoo_adapter: Optional[YahooFinanceAdapter] = None

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def build_metadata_map(
        self,
        connector,
        file_content: str,
        raw_records: Optional[Iterable[Dict[str, Any]]] = None
    ) -> Dict[str, Dict[str, Any]]:
        """
        Build a metadata dictionary for all symbols discovered in the import.

        Args:
            connector: The active connector instance.
            file_content: Raw file content (string).
            raw_records: Optional raw records produced during parsing.

        Returns:
            Dict keyed by normalised symbol containing metadata dictionaries.
        """
        entries = self._collect_connector_entries(connector, file_content, raw_records)
        metadata_map: Dict[str, SymbolMetadata] = {}

        for entry in entries:
            symbol = (entry.get("symbol") or "").strip()
            if not symbol:
                continue

            normalised_symbol = symbol.upper()
            display_symbol = entry.get("display_symbol") or symbol

            if normalised_symbol not in metadata_map:
                metadata_map[normalised_symbol] = SymbolMetadata(
                    symbol=normalised_symbol,
                    display_symbol=display_symbol,
                    company_name=entry.get("company_name") or None,
                    exchange_code=entry.get("exchange_code") or entry.get("exchange"),
                    google_exchange_code=None,
                    currency=entry.get("currency"),
                    sources=self._initial_sources(entry),
                )
            else:
                self._merge_entry(metadata_map[normalised_symbol], entry)

        self._enrich_with_external_data(metadata_map)
        self._attach_links(metadata_map)

        return {
            symbol: metadata.to_dict() for symbol, metadata in metadata_map.items()
        }

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------
    def _collect_connector_entries(
        self,
        connector,
        file_content: str,
        raw_records: Optional[Iterable[Dict[str, Any]]]
    ) -> List[Dict[str, Any]]:
        entries: List[Dict[str, Any]] = []
        extractor = getattr(connector, "extract_symbol_metadata", None)

        if callable(extractor):
            try:
                connector_entries = extractor(
                    file_content=file_content,
                    raw_records=raw_records,
                ) or []
                entries.extend(connector_entries)
            except Exception as extractor_error:
                logger.error(
                    "Failed to extract connector metadata: %s",
                    extractor_error,
                    exc_info=True,
                )

        # Fallback: derive minimal metadata from raw records when available
        if raw_records:
            for record in raw_records:
                symbol = (record.get("Symbol") or record.get("symbol") or "").strip()
                if not symbol:
                    continue
                entries.append({
                    "symbol": symbol,
                    "display_symbol": symbol,
                    "currency": record.get("Currency") or record.get("currency"),
                    "source": "raw_record",
                })

        return entries

    def _merge_entry(self, metadata: SymbolMetadata, entry: Dict[str, Any]) -> None:
        company_name = entry.get("company_name") or entry.get("name")
        if company_name and not metadata.company_name:
            metadata.company_name = company_name

        exchange = entry.get("exchange_code") or entry.get("exchange")
        if exchange and not metadata.exchange_code:
            metadata.exchange_code = exchange

        currency = entry.get("currency")
        if currency and not metadata.currency:
            metadata.currency = currency

        metadata.sources = self._merge_sources(metadata.sources, entry)

    def _initial_sources(self, entry: Dict[str, Any]) -> List[str]:
        source = entry.get("source")
        if source:
            return [source]
        return ["connector"]

    def _merge_sources(self, existing: Optional[List[str]], entry: Dict[str, Any]) -> List[str]:
        merged = set(existing or [])
        source = entry.get("source")
        if source:
            merged.add(source)
        return sorted(merged)

    # ------------------------------------------------------------------
    # External data enrichment
    # ------------------------------------------------------------------
    def _enrich_with_external_data(self, metadata_map: Dict[str, SymbolMetadata]) -> None:
        symbols_to_enrich = [
            metadata.display_symbol
            for metadata in metadata_map.values()
            if not metadata.company_name or not metadata.exchange_code
        ]

        if not symbols_to_enrich:
            return

        try:
            yahoo_adapter = self._get_yahoo_adapter()
        except Exception as adapter_error:
            logger.error("Failed to initialise YahooFinanceAdapter: %s", adapter_error)
            return

        try:
            quotes = yahoo_adapter.get_quotes_batch(symbols_to_enrich)
        except Exception as fetch_error:
            logger.error("Failed to fetch Yahoo Finance metadata: %s", fetch_error)
            return

        for quote in quotes or []:
            symbol_key = quote.symbol.upper()
            if symbol_key not in metadata_map:
                metadata_map[symbol_key] = SymbolMetadata(
                    symbol=symbol_key,
                    display_symbol=quote.symbol,
                    sources=["yahoo_finance"],
                )

            metadata = metadata_map[symbol_key]
            metadata.sources = self._merge_sources(metadata.sources, {"source": "yahoo_finance"})

            if quote.long_name and not metadata.company_name:
                metadata.company_name = quote.long_name

            if quote.exchange_code and not metadata.exchange_code:
                metadata.exchange_code = quote.exchange_code

            if quote.currency and not metadata.currency:
                metadata.currency = quote.currency

            google_exchange = self._map_to_google_exchange(
                quote.exchange_name,
                quote.exchange_code,
            )
            if google_exchange:
                metadata.google_exchange_code = google_exchange

    def _get_yahoo_adapter(self) -> YahooFinanceAdapter:
        if not self._yahoo_adapter:
            self._yahoo_adapter = YahooFinanceAdapter(self.db_session)
        return self._yahoo_adapter

    # ------------------------------------------------------------------
    # Link generation
    # ------------------------------------------------------------------
    def _attach_links(self, metadata_map: Dict[str, SymbolMetadata]) -> None:
        for metadata in metadata_map.values():
            google_exchange = metadata.google_exchange_code or self._map_to_google_exchange(
                None, metadata.exchange_code
            )
            yahoo_url = self._build_yahoo_link(metadata.display_symbol)
            google_url = self._build_google_link(metadata.display_symbol, google_exchange)

            if google_url and yahoo_url:
                status = "google_and_yahoo"
            elif google_url:
                status = "google_only"
            elif yahoo_url:
                status = "yahoo_only"
            else:
                status = "not_found"

            metadata.links = {
                "google_finance": google_url,
                "yahoo_finance": yahoo_url,
                "status": status,
            }

            if google_exchange and not metadata.google_exchange_code:
                metadata.google_exchange_code = google_exchange

    def _build_google_link(self, symbol: str, exchange: Optional[str]) -> Optional[str]:
        if not symbol or not exchange:
            return None
        return f"https://www.google.com/finance/quote/{symbol}:{exchange}"

    def _build_yahoo_link(self, symbol: str) -> Optional[str]:
        if not symbol:
            return None
        return f"https://finance.yahoo.com/quote/{symbol}"

    # ------------------------------------------------------------------
    # Exchange mapping utilities
    # ------------------------------------------------------------------
    def _map_to_google_exchange(
        self,
        yahoo_exchange_name: Optional[str],
        yahoo_exchange_code: Optional[str]
    ) -> Optional[str]:
        if not yahoo_exchange_name and not yahoo_exchange_code:
            return None

        code_mapping = {
            "NYQ": "NYSE",
            "NYS": "NYSE",
            "NMS": "NASDAQ",
            "NGM": "NASDAQ",
            "NCM": "NASDAQ",
            "BATS": "NYSEARCA",
            "PCX": "NYSEARCA",
            "ASE": "NYSEAMERICAN",
            "TSX": "TSE",
            "TSXV": "CVE",
            "LSE": "LON",
            "ASX": "ASX",
            "HKEX": "HKG",
            "HKG": "HKG",
            "JPX": "TYO",
            "TSE": "TYO",
        }

        name_mapping = {
            "NYSE": "NYSE",
            "NasdaqGS": "NASDAQ",
            "NasdaqGM": "NASDAQ",
            "NasdaqCM": "NASDAQ",
            "Nasdaq": "NASDAQ",
            "NYSE Arca": "NYSEARCA",
            "NYSE American": "NYSEAMERICAN",
            "NYSEAmerican": "NYSEAMERICAN",
            "Toronto": "TSE",
            "TSX": "TSE",
            "TSXV": "CVE",
            "London Stock Exchange": "LON",
            "LSE": "LON",
            "Australian Securities Exchange": "ASX",
            "ASX": "ASX",
            "Hong Kong Stock Exchange": "HKG",
            "HKEX": "HKG",
            "Tokyo Stock Exchange": "TYO",
            "JPX": "TYO",
        }

        if yahoo_exchange_code and yahoo_exchange_code in code_mapping:
            return code_mapping[yahoo_exchange_code]

        if yahoo_exchange_name and yahoo_exchange_name in name_mapping:
            return name_mapping[yahoo_exchange_name]

        if yahoo_exchange_name:
            # Handle composite names like "NasdaqGS - Nasdaq Global Select"
            for name, mapped in name_mapping.items():
                if name.lower() in yahoo_exchange_name.lower():
                    return mapped

        return None



"""
Provider Mapping Utils — shared logic for sync scripts and user_tickers_service
Per WP_20_09_FIELD_MAP_TICKERS_MAPPINGS, TEAM_10_USER_TICKERS_ROOT_FIX — נעילה אדריכלית
Locked format: yahoo_finance, alpha_vantage (per TEAM_10_TO_TEAM_20_USER_TICKERS_ROOT_FIX_DIRECTIVE)
"""

from typing import Any, Dict, Optional, Tuple

# Locked format keys per TEAM_10_ROOT_FIX
_YAHOO_KEY = "yahoo_finance"
_ALPHA_KEY = "alpha_vantage"
_LEGACY_YAHOO = "yahoo"
_LEGACY_ALPHA = "alpha"


def infer_provider_mapping(
    symbol: str, ticker_type: str, market: Optional[str] = None
) -> Dict[str, Any]:
    """
    Build provider_mapping_data per WP_20_09 (locked format).
    CRYPTO: Yahoo BTC-USD; Alpha symbol=BTC, market=USD.
    """
    mapping: Dict[str, Any] = {}
    if ticker_type == "CRYPTO":
        if "-" in symbol:
            parts = symbol.split("-", 1)
            base, quote = parts[0].strip().upper(), parts[1].strip().upper()
        else:
            base = symbol.strip().upper()
            quote = (market or "USD").upper()
        mapping[_YAHOO_KEY] = {"symbol": f"{base}-{quote}"}
        mapping[_ALPHA_KEY] = {"symbol": base, "market": quote}
    else:
        mapping[_YAHOO_KEY] = {"symbol": symbol}
        mapping[_ALPHA_KEY] = {"symbol": symbol}
    return mapping


def get_provider_mapping(
    symbol: str,
    ticker_type: str = "STOCK",
    market: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Get provider mapping from metadata.provider_mapping_data or infer from symbol+ticker_type.
    """
    pm = None
    if metadata:
        pm = metadata.get("provider_mapping_data") or metadata.get("provider_mapping")
    if pm and isinstance(pm, dict):
        return pm
    return infer_provider_mapping(symbol, ticker_type, market)


def _get_cfg(pm: Dict[str, Any], primary: str, fallback: str) -> Dict[str, Any]:
    """Read config — locked format first, legacy fallback."""
    return pm.get(primary) or pm.get(fallback) or {}


def resolve_symbols_for_fetch(
    symbol: str,
    ticker_type: str,
    provider_mapping: Dict[str, Any],
) -> Tuple[str, str, str]:
    """
    Resolve symbols for Yahoo and Alpha fetches.
    Returns (yahoo_symbol, alpha_symbol, alpha_market).
    Supports both locked (yahoo_finance, alpha_vantage) and legacy (yahoo, alpha) keys.
    """
    yahoo_cfg = _get_cfg(provider_mapping, _YAHOO_KEY, _LEGACY_YAHOO)
    alpha_cfg = _get_cfg(provider_mapping, _ALPHA_KEY, _LEGACY_ALPHA)
    yahoo_sym = yahoo_cfg.get("symbol") or symbol
    alpha_sym = alpha_cfg.get("symbol") or symbol
    alpha_market = alpha_cfg.get("market") or "USD"
    return (yahoo_sym, alpha_sym, alpha_market)

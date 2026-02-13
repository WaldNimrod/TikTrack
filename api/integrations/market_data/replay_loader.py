"""
Replay Loader — P3-008 Automated Testing Mandate
Loads fixtures for mode=REPLAY. Zero HTTP calls.
SSOT: TEAM_90_TO_TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_DIRECTIVE
"""

import json
from pathlib import Path
from typing import Any, Optional

_DEFAULT_FIXTURES_DIR = Path(__file__).resolve().parent.parent.parent.parent / "tests" / "fixtures" / "market_data"


def _load_json(path: Path) -> Optional[dict]:
    if not path.exists():
        return None
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return None


def load_fx_eod(fixtures_dir: Optional[Path] = None) -> dict:
    """FX EOD by pair key (from_ccy_to_ccy)."""
    base = fixtures_dir or _DEFAULT_FIXTURES_DIR
    data = _load_json(base / "fx_eod_by_pair.json")
    return data or {}


def load_prices_eod(fixtures_dir: Optional[Path] = None) -> dict:
    """Prices EOD by symbol."""
    base = fixtures_dir or _DEFAULT_FIXTURES_DIR
    data = _load_json(base / "prices_eod_by_symbol.json")
    return data or {}


def load_prices_intraday(fixtures_dir: Optional[Path] = None) -> dict:
    """Prices intraday by symbol."""
    base = fixtures_dir or _DEFAULT_FIXTURES_DIR
    data = _load_json(base / "prices_intraday_sample.json")
    return data or {}


def load_prices_history(fixtures_dir: Optional[Path] = None) -> dict:
    """250d history by symbol — list of OHLCV dicts."""
    base = fixtures_dir or _DEFAULT_FIXTURES_DIR
    data = _load_json(base / "prices_history_250d_sample.json")
    return data or {}


def load_indicators_sample(fixtures_dir: Optional[Path] = None) -> dict:
    """Indicators (ATR/MA/CCI) sample."""
    base = fixtures_dir or _DEFAULT_FIXTURES_DIR
    data = _load_json(base / "indicators_sample.json")
    return data or {}

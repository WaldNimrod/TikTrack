#!/usr/bin/env python3
"""
Direct provider test — Yahoo + Alpha for various symbols.
Output: JSON table of success/failure per provider and symbol.
Run: cd project && python3 scripts/test-providers-direct.py
"""
import asyncio
import json
import os
import sys
from pathlib import Path

# Add api to path and load .env
_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_root))
_env = _root / "api" / ".env"
if _env.exists():
    from dotenv import load_dotenv
    load_dotenv(_env)

from api.integrations.market_data.provider_mapping_utils import get_provider_mapping
from api.integrations.market_data.providers.yahoo_provider import YahooProvider
from api.integrations.market_data.providers.alpha_provider import AlphaProvider


async def test_yahoo(symbol: str) -> tuple[bool, str]:
    try:
        p = YahooProvider(mode="LIVE")
        r = await p.get_ticker_price(symbol)
        if r and r.price and r.price > 0:
            return True, f"price={r.price}"
        return False, "no price" if r else "None"
    except Exception as e:
        return False, str(e)[:80]


async def test_alpha_stock(symbol: str) -> tuple[bool, str]:
    try:
        p = AlphaProvider(mode="LIVE")
        r = await p.get_ticker_price(symbol)
        if r and r.price and r.price > 0:
            return True, f"price={r.price}"
        return False, "no price" if r else "None"
    except Exception as e:
        return False, str(e)[:80]


async def test_alpha_crypto(symbol: str, market: str = "USD") -> tuple[bool, str]:
    try:
        p = AlphaProvider(mode="LIVE")
        r = await p.get_ticker_price_crypto(symbol, market)
        if r and r.price and r.price > 0:
            return True, f"price={r.price}"
        return False, "no price" if r else "None"
    except Exception as e:
        return False, str(e)[:80]


async def main():
    cases = [
        ("AAPL", "STOCK", None),
        ("BTC", "CRYPTO", "USD"),
        ("TEVA.TA", "STOCK", None),
        ("ANAU.MI", "STOCK", None),
        ("ZZZZZZZFAKE999", "STOCK", None),
    ]
    api_key = os.environ.get("ALPHA_VANTAGE_API_KEY", "")
    has_key = bool(api_key and len(api_key) > 10)

    print("=== Provider Direct Test (LIVE mode) ===")
    print(f"ALPHA_VANTAGE_API_KEY: {'SET' if has_key else 'NOT SET'}\n")

    rows = []
    for symbol, ticker_type, market in cases:
        from api.integrations.market_data.provider_mapping_utils import resolve_symbols_for_fetch
        pm = get_provider_mapping(symbol, ticker_type, market)
        yahoo_sym, alpha_sym, alpha_mkt = resolve_symbols_for_fetch(symbol, ticker_type, pm)

        y_ok, y_msg = await test_yahoo(yahoo_sym)
        if ticker_type == "CRYPTO":
            a_ok, a_msg = await test_alpha_crypto(alpha_sym, alpha_mkt)
        else:
            a_ok, a_msg = await test_alpha_stock(alpha_sym)

        rows.append({
            "symbol": symbol,
            "type": ticker_type,
            "yahoo": "✅" if y_ok else "❌",
            "yahoo_note": y_msg,
            "alpha": "✅" if a_ok else "❌",
            "alpha_note": a_msg,
        })
        if ticker_type == "CRYPTO":
            await asyncio.sleep(13)  # Alpha rate limit
        await asyncio.sleep(0.5)

    # Print table
    print("| Symbol        | Type   | Yahoo | Alpha | Yahoo note | Alpha note |")
    print("|---------------|--------|-------|-------|------------|------------|")
    for r in rows:
        print(f"| {r['symbol']:13} | {r['type']:6} | {r['yahoo']:5} | {r['alpha']:5} | {r['yahoo_note'][:10]:10} | {r['alpha_note'][:10]:10} |")
    print()
    # JSON for programmatic use
    print(json.dumps(rows, indent=2))


if __name__ == "__main__":
    asyncio.run(main())

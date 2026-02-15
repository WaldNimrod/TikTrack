#!/usr/bin/env python3
"""
Direct provider test — Yahoo + Alpha for various symbols.
Output: JSON table of success/failure per provider and symbol.
Run: cd project && python3 scripts/test-providers-direct.py
      python3 scripts/test-providers-direct.py --verbose   # debug when None
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

VERBOSE = "--verbose" in sys.argv or "-v" in sys.argv


async def _debug_yahoo_raw(symbol: str) -> None:
    """When Yahoo returns None — print raw HTTP response."""
    import httpx
    url = "https://query1.finance.yahoo.com/v7/finance/quote"
    headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0 Safari/537.36"}
    try:
        async with httpx.AsyncClient(timeout=10.0, headers=headers) as c:
            r = await c.get(url, params={"symbols": symbol})
        print(f"  [Yahoo raw] {symbol}: HTTP {r.status_code} | body[:300]: {r.text[:300]!r}")
    except Exception as e:
        print(f"  [Yahoo raw] {symbol}: EXCEPTION {type(e).__name__}: {e}")


async def _debug_alpha_raw(symbol: str, market: str = "USD", is_crypto: bool = False) -> None:
    """When Alpha returns None — print raw HTTP response."""
    import httpx
    api_key = os.environ.get("ALPHA_VANTAGE_API_KEY", "")
    if not api_key:
        print(f"  [Alpha raw] {symbol}: ALPHA_VANTAGE_API_KEY not set")
        return
    fn = "DIGITAL_CURRENCY_DAILY" if is_crypto else "GLOBAL_QUOTE"
    params = {"function": fn, "apikey": api_key}
    if is_crypto:
        params["symbol"], params["market"] = symbol, market
    else:
        params["symbol"] = symbol
    try:
        async with httpx.AsyncClient(timeout=10.0) as c:
            r = await c.get("https://www.alphavantage.co/query", params=params)
        # Mask key in output
        body = r.text.replace(api_key[:8], "***") if len(api_key) > 8 else r.text
        print(f"  [Alpha raw] {symbol}: HTTP {r.status_code} | body[:400]: {body[:400]!r}")
    except Exception as e:
        print(f"  [Alpha raw] {symbol}: EXCEPTION {type(e).__name__}: {e}")


async def test_yahoo(symbol: str) -> tuple[bool, str]:
    try:
        from api.integrations.market_data.providers.yahoo_provider import YahooProvider
        p = YahooProvider(mode="LIVE")
        r = await p.get_ticker_price(symbol)
        if r and r.price and r.price > 0:
            return True, f"price={r.price}"
        if VERBOSE and r is None:
            print(f"[DEBUG] Yahoo returned None for {symbol}:")
            await _debug_yahoo_raw(symbol)
        return False, "no price" if r else "None"
    except Exception as e:
        if VERBOSE:
            import traceback
            traceback.print_exc()
        return False, str(e)[:80]


async def test_alpha_stock(symbol: str) -> tuple[bool, str]:
    try:
        from api.integrations.market_data.providers.alpha_provider import AlphaProvider
        p = AlphaProvider(mode="LIVE")
        r = await p.get_ticker_price(symbol)
        if r and r.price and r.price > 0:
            return True, f"price={r.price}"
        if VERBOSE and r is None:
            print(f"[DEBUG] Alpha (stock) returned None for {symbol}:")
            await _debug_alpha_raw(symbol, is_crypto=False)
        return False, "no price" if r else "None"
    except Exception as e:
        if VERBOSE:
            import traceback
            traceback.print_exc()
        return False, str(e)[:80]


async def test_alpha_crypto(symbol: str, market: str = "USD") -> tuple[bool, str]:
    try:
        from api.integrations.market_data.providers.alpha_provider import AlphaProvider
        p = AlphaProvider(mode="LIVE")
        r = await p.get_ticker_price_crypto(symbol, market)
        if r and r.price and r.price > 0:
            return True, f"price={r.price}"
        if VERBOSE and r is None:
            print(f"[DEBUG] Alpha (crypto) returned None for {symbol}:")
            await _debug_alpha_raw(symbol, market, is_crypto=True)
        return False, "no price" if r else "None"
    except Exception as e:
        if VERBOSE:
            import traceback
            traceback.print_exc()
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
        from api.integrations.market_data.provider_mapping_utils import get_provider_mapping, resolve_symbols_for_fetch
        pm = get_provider_mapping(symbol, ticker_type, market)
        yahoo_sym, alpha_sym, alpha_mkt = resolve_symbols_for_fetch(symbol, ticker_type, pm)

        await asyncio.sleep(4)  # Yahoo rate limit — רווח בין קריאות (ANAU.MI, BTC-USD)
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
        # Alpha rate limit 12.5s between symbols (module-level, shared)
        await asyncio.sleep(13)

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

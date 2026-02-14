#!/usr/bin/env python3
"""
דיאגנוסטיקה — Yahoo, טיקר אחד, צעדים קטנים.
בודק כל שלב בנפרד — ללא Alpha.
"""

import sys
from pathlib import Path

_project = Path(__file__).parent.parent
sys.path.insert(0, str(_project))

SYMBOL = "AAPL"
USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"


def step1_raw_quote_api():
    """צעד 1: קריאה ישירה ל־v7/finance/quote עם User-Agent"""
    print("\n=== צעד 1: HTTP ישיר → query1.finance.yahoo.com/v7/finance/quote ===")
    try:
        import httpx
        url = "https://query1.finance.yahoo.com/v7/finance/quote"
        r = httpx.get(url, params={"symbols": SYMBOL}, headers={"User-Agent": USER_AGENT}, timeout=10.0)
        print(f"Status: {r.status_code}")
        print(f"Body (first 600 chars): {r.text[:600]}")
        if r.status_code == 200:
            data = r.json()
            results = data.get("quoteResponse", {}).get("result", [])
            if results:
                q = results[0]
                price = q.get("regularMarketPrice") or q.get("regularMarketPreviousClose")
                print(f"✓ Price: {price}")
            else:
                print("✗ result ריק")
        return r.status_code
    except Exception as e:
        print(f"✗ Error: {e}")
        return None


def step2_yfinance_history():
    """צעד 2: yfinance + Session + User-Agent → history(period='5d')"""
    print("\n=== צעד 2: yfinance.Ticker.history(period='5d') + User-Agent ===")
    try:
        import yfinance as yf
        from requests import Session

        session = Session()
        session.headers["User-Agent"] = USER_AGENT
        ticker = yf.Ticker(SYMBOL, session=session)
        info = ticker.history(period="5d", interval="1d")
        print(f"history type: {type(info)}")
        print(f"history empty: {info.empty if info is not None else 'N/A'}")
        if info is not None and not info.empty:
            last = info.iloc[-1]
            close = last["Close"]
            print(f"✓ Last row Close: {close}")
            return close
        else:
            print("✗ history ריק או None")
        return None
    except Exception as e:
        print(f"✗ Error: {type(e).__name__}: {e}")
        return None


def step3_yfinance_info():
    """צעד 3: yfinance → ticker.info (נתוני quote)"""
    print("\n=== צעד 3: yfinance.Ticker.info (quote/current) ===")
    try:
        import yfinance as yf
        from requests import Session

        session = Session()
        session.headers["User-Agent"] = USER_AGENT
        ticker = yf.Ticker(SYMBOL, session=session)
        info = ticker.info
        print(f"info type: {type(info)}")
        if isinstance(info, dict):
            price = info.get("currentPrice") or info.get("regularMarketPrice") or info.get("previousClose")
            print(f"currentPrice: {info.get('currentPrice')}")
            print(f"regularMarketPrice: {info.get('regularMarketPrice')}")
            print(f"previousClose: {info.get('previousClose')}")
            if price:
                print(f"✓ Price from info: {price}")
                return price
        print("✗ אין מחיר ב-info")
        return None
    except Exception as e:
        print(f"✗ Error: {type(e).__name__}: {e}")
        return None


def step4_yfinance_fast_info():
    """צעד 4: yfinance → fast_info (מעקף חלקי)"""
    print("\n=== צעד 4: yfinance.Ticker.fast_info ===")
    try:
        import yfinance as yf
        from requests import Session

        session = Session()
        session.headers["User-Agent"] = USER_AGENT
        ticker = yf.Ticker(SYMBOL, session=session)
        fi = ticker.fast_info
        print(f"fast_info keys: {list(fi.keys()) if hasattr(fi, 'keys') else type(fi)}")
        price = fi.get("lastPrice") if isinstance(fi, dict) else getattr(fi, "lastPrice", None) or getattr(fi, "previous_close", None)
        if price:
            print(f"✓ Price: {price}")
            return price
        print("✗ אין מחיר ב-fast_info")
        return None
    except Exception as e:
        print(f"✗ Error: {type(e).__name__}: {e}")
        return None


def step5_full_browser_headers():
    """צעד 5: headers מלאים כמו דפדפן אמיתי"""
    print("\n=== צעד 5: HTTP עם headers מלאים (דפדפן) ===")
    try:
        import httpx
        headers = {
            "User-Agent": USER_AGENT,
            "Accept": "application/json",
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": "https://finance.yahoo.com/",
        }
        r = httpx.get(
            "https://query1.finance.yahoo.com/v7/finance/quote",
            params={"symbols": SYMBOL},
            headers=headers,
            timeout=10.0,
        )
        print(f"Status: {r.status_code}")
        if r.status_code == 200:
            data = r.json()
            q = data.get("quoteResponse", {}).get("result", [{}])[0]
            p = q.get("regularMarketPrice") or q.get("regularMarketPreviousClose")
            print(f"✓ Price: {p}")
        else:
            print(f"Body: {r.text[:300]}")
        return r.status_code
    except Exception as e:
        print(f"✗ Error: {e}")
        return None


def step6_try_query2():
    """צעד 6: נסיון query2 במקום query1 (subdomain אחר)"""
    print("\n=== צעד 6: HTTP ישיר → query2.finance.yahoo.com ===")
    try:
        import httpx
        url = "https://query2.finance.yahoo.com/v7/finance/quote"
        r = httpx.get(url, params={"symbols": SYMBOL}, headers={"User-Agent": USER_AGENT}, timeout=10.0)
        print(f"Status: {r.status_code}")
        print(f"Body (first 400 chars): {r.text[:400]}")
        return r.status_code
    except Exception as e:
        print(f"✗ Error: {e}")
        return None


def main():
    print(f"Debug Yahoo — טיקר אחד: {SYMBOL}")
    step1_raw_quote_api()
    step2_yfinance_history()
    step3_yfinance_info()
    step4_yfinance_fast_info()
    step5_full_browser_headers()
    step6_try_query2()
    print("\n--- סיום ---")


if __name__ == "__main__":
    main()

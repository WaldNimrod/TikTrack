# 📊 מפרט ספק: Yahoo Finance
---
- **Role:** Primary for Prices / Fallback for FX.
- **Method:** Python library 'yfinance' + Query V8 chart API (HTTP ישיר ל־v8/finance/chart).
- **History 250d:** Primary v8/chart — `range=2y` (full) או `period1`/`period2` (gap-fill); Fallback yfinance.
- **Interval:** 1d (EOD).
- **Enforcement:** User-Agent Rotation required.
- **Precision:** Forced 20,8 conversion.
- **Crypto Symbol Contract (Locked):** `BASE-QUOTE` format (for example: `BTC-USD`, `ETH-USD`, `SOL-USD`).
- **Equity Symbol Contract:** Native exchange symbol (for example: `AAPL`, `MSFT`, `ANAU.MI`).

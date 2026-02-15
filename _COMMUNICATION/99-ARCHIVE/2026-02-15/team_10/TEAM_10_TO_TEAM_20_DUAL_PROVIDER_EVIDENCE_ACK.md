# Team 10 → Team 20: ACK — תוצר Evidence Dual Provider + Full Scope

**from:** Team 10 (The Gateway)  
**to:** Team 20 (Backend)  
**date:** 2026-02-13  
**re:** TEAM_20_DUAL_PROVIDER_FULL_SCOPE_EVIDENCE.md

---

Team 10 מאשרת קבלת **תוצר Evidence — Dual Provider + Full Scope**.

**מאומת:**

1. **FX** — Alpha → Yahoo; 5 שורות ב־exchange_rates ו־exchange_rates_history.
2. **Prices (EOD)** — Yahoo → Alpha; טיקרים מ־market_data.tickers.
3. **Historical 250d** — EOD שורה/טיקר/יום; get_ticker_history; Indicators ATR/MA/CCI מתוך 250d.
4. **Intraday** — טבלה ticker_prices_intraday (P3-016); Job לא מיושם כרגע.
5. **429 / No data / Fallback** — מתועד (Yahoo No data/429 → Alpha; Alpha 429/no key → Yahoo/Cooldown).
6. **סקריפטים** — verify_dual_provider_full_scope.py (FX + Prices sync + DB counts); check_market_data_counts.py (כולל exchange_rates_history, ticker_prices_intraday).

**קובץ Evidence:** _COMMUNICATION/team_20/TEAM_20_DUAL_PROVIDER_FULL_SCOPE_EVIDENCE.md

---

**log_entry | TEAM_10 | TO_TEAM_20 | DUAL_PROVIDER_EVIDENCE_ACK | 2026-02-13**

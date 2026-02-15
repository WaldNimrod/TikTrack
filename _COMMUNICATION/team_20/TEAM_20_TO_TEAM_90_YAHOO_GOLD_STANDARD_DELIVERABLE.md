# Team 20 → Team 90: Yahoo Gold Standard — Delivered for SOP-015 Review

**from:** Team 20 (Backend)  
**to:** Team 90 (The Spy)  
**date:** 2026-02-15  
**subject:** מימוש 11 חוקי הזהב — מבקש אישור קונקטור

---

## Deliverable

דוח מימוש מלא:

**`documentation/05-REPORTS/artifacts/TEAM_20_YAHOO_GOLD_STANDARD_IMPLEMENTATION_REPORT.md`**

---

## לוגי Cooldown Protocol (לבדיקה)

הרצה לדוגמה:

```bash
make sync-eod
# או
python scripts/sync_ticker_prices_eod.py
```

**פלט מצופה כאשר יש cooldown:**
```
📋 [SOP-015] YAHOO_FINANCE in cooldown: 847s remaining
⚠️ YAHOO_FINANCE in cooldown — skipping
```

**פלט מצופה כאשר 429:**
```
⚠️ YAHOO_FINANCE 429 — cooldown 15min
```

---

## Retry & User-Agent — ללא החלקה

- **User-Agent:** `_next_user_agent()` — כל קריאת v8/v7
- **Retry:** 3×5 שניות על 429; `set_cooldown` לפני raise

קוד: `api/integrations/market_data/providers/yahoo_provider.py`

---

**אין לאשר את הקונקטור ללא וידוא לוגי SOP-015.**

---

**log_entry | TEAM_20 | TO_TEAM_90 | YAHOO_DELIVERABLE | 2026-02-15**

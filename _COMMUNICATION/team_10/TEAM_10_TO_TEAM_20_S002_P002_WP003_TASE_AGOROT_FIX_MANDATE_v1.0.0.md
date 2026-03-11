# Team 10 → Team 20 | S002-P002-WP003 — TASE Agorot Fix Mandate (B2)

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_20_S002_P002_WP003_TASE_AGOROT_FIX_MANDATE  
**from:** Team 10 (Gateway Orchestration)  
**to:** Team 20 (Backend)  
**date:** 2026-03-11  
**status:** MANDATE_ACTIVE  
**gate_id:** GATE_3  
**sub_stage:** G3.7  
**authority:** ARCHITECT_GATE7_REVIEW_S002_P002_WP003_TEAM10_DOCS_v1.0.0 (B2)  
**priority:** P0

---

## 1) בעיה

Yahoo Finance ו-Alpha מחזירים מחירי TASE (סיומת `.TA`, כגון TEVA.TA) ב**אגורות** (ILA), לא שקלים. 1 ש"ח = 100 אגורות. אין המרה בקוד הנוכחי.

---

## 2) Spec — yahoo_provider.py

**פונקציה 1:** `_fetch_prices_batch_sync()` — לאחר `price = _to_decimal(raw_price)`:
```python
# TASE agorot-to-ILS conversion
if sym.upper().endswith('.TA') and price and price > 0:
    price = (price / Decimal("100")).quantize(Decimal("0.00000001"))
# Also apply to close_raw (regularMarketPreviousClose)
if sym.upper().endswith('.TA') and close_raw:
    close_raw_dec = _to_decimal(close_raw)
    if close_raw_dec:
        close_raw = (close_raw_dec / Decimal("100")).quantize(Decimal("0.00000001"))
```

**פונקציה 2:** `_fetch_last_close_via_v8_chart()` — אותה לוגיקה על כל שדות המחיר לאחר parse.

---

## 3) Spec — alpha_provider.py

**פונקציה:** `_get_price_from_timeseries_daily()` — בדיקה: אם Alpha מחזיר TEVA.TA באגורות (`price > 1000` לטיקר ILS ידוע) → `÷100`.

---

## 4) Deliverable

**נתיב:** `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_S002_P002_WP003_TASE_AGOROT_FIX_COMPLETION.md`

**בדיקה:** TEVA.TA `current_price < 200` (טווח שקלים).

---

**log_entry | TEAM_10 | TASE_AGOROT_FIX_MANDATE_B2 | TO_TEAM_20 | 2026-03-11**

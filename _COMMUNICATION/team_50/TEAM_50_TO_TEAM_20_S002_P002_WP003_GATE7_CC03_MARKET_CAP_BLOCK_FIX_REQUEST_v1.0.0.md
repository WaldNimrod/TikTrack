

# Team 50 → Team 20 | S002-P002-WP003 GATE_7 — דרישת תיקון CC-03 (market_cap)

**project_domain:** TIKTRACK  
**id:** TEAM_50_TO_TEAM_20_S002_P002_WP003_GATE7_CC03_MARKET_CAP_BLOCK_FIX_REQUEST_v1.0.0  
**from:** Team 50 (QA & Fidelity)  
**to:** Team 20 (Backend)  
**cc:** Team 10  
**date:** 2026-03-12  
**historical_record:** true
**status:** ACTION_REQUIRED  
**blocker:** CC-WP003-03 / AUTO-WP003-05 — market_cap null  

---

## 1) כלל PASS

לכל אחד מ־ANAU.MI, BTC-USD, TEVA.TA (ו־SPY לפי verify_g7_prehuman) — השדה `market_cap` בשורת `ticker_prices` האחרונה (לפי `price_timestamp DESC`) חייב להיות **NOT NULL**.

---

## 2) Evidence — מה בוצע באימות

| כלי | תוצאה |
|-----|--------|
| `python3 scripts/verify_g7_prehuman_automation.py` | BLOCK — market_cap null for: ['TEVA.TA', 'SPY'] |
| `node tests/auto-wp003-runtime.test.js` | AUTO-WP003-3 FAIL — market_cap null for: TEVA.TA |

---

## 3) סיבת הכשל

- **TEVA.TA:** אין מילוי `market_cap` ב־ticker_prices. FIX-4: Alpha לא שולף; EOD לא ממלא.
- **SPY:** verify_g7_prehuman בודק 4 symbols; SPY null.

---

## 4) מיקום רלוונטי בקוד

| קובץ | תיאור |
|------|--------|
| `scripts/sync_ticker_prices_eod.py` | מילוי market_cap מ־Alpha/Yahoo |
| `scripts/backfill_market_cap_auto_wp003_05.py` | Backfill |
| `api/integrations/market_data/providers/alpha_provider.py` | Alpha market_cap |

---

## 5) דרישת תיקון

1. **Backfill / EOD:** וידוא ש־market_cap ממולא ל־ANAU.MI, BTC-USD, TEVA.TA, SPY (אם נדרש).
2. **אימות:** `python3 scripts/verify_g7_prehuman_automation.py` → PASS.
3. **אימות:** `node tests/auto-wp003-runtime.test.js` → AUTO-WP003-3 PASS.

---

## 6) תיעוד קיים

- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_S002_P002_WP003_AUTO_WP003_05_MANDATE.md`
- `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_20_S002_P002_WP003_AUTO_WP003_05_REMEDIATION_REQUEST.md`

---

**log_entry | TEAM_50 | TO_TEAM_20 | CC03_MARKET_CAP_BLOCK_FIX_REQUEST | ACTION_REQUIRED | 2026-03-12**

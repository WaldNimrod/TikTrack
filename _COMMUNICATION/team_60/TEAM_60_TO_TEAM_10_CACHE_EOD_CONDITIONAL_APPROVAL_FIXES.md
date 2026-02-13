# Team 60 → Team 10: תיקונים לאחר אישור מותנה (Spy) — Cache + EOD

**id:** `TEAM_60_CACHE_EOD_CONDITIONAL_APPROVAL_FIXES`  
**from:** Team 60 (DevOps & Platform)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-13  
**מקור:** Spy conditional approval — "מאשר עקרונית; נעילה מותנית ב־4 השלמות"

---

## 1. סיכום — מה בוצע ע״י Team 60

| # | תיקון | סטטוס |
|---|--------|--------|
| 1 | **דיוק מספרי** — מעבר מ־float ל־Decimal/quantize (8 מקומות) | ✅ בוצע |
| 2 | **Evidence ריצה** — לוג PASS + last_sync_time ב־_COMMUNICATION/team_60/ | ✅ בוצע |
| 3 | **Scope מטבעות** — USD/EUR/ILS מכוון; מתועד בהחלטה | ✅ בוצע |

---

## 2. השלמות נדרשות מ־Team 10 (עדכון SSOT בלבד)

**קובץ:** `documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md`

לעדכן את הספציפיקציה כך שתשקף:

| נושא | תוכן להגדרה |
|------|--------------|
| **DB‑as‑Cache** | DB as Cache (כולל latest_ticker_prices MV) — החלטה סופית |
| **Cron + אזור זמן** | 0 22 * * 1-5 (דוגמה); UTC |
| **ספק + Scope מטבעות** | Frankfurter API; USD/EUR/ILS — scope ראשוני |

---

## 3. Acceptance Criteria לנעילה

- [x] דיוק NUMERIC(20,8) — Decimal/quantize בסקריפט
- [x] Evidence ריצה — `TEAM_60_EOD_SYNC_EVIDENCE_LOG.md`
- [x] Scope מטבעות — מתועד (USD/EUR/ILS)
- [ ] **SSOT מעודכן** — Team 10 מעדכן MARKET_DATA_PIPE_SPEC.md

---

## 4. קבצים מעודכנים (Team 60)

| קובץ | שינוי |
|------|--------|
| `scripts/sync_exchange_rates_eod.py` | Decimal.quantize — אין float לשמירה |
| `_COMMUNICATION/team_60/TEAM_60_EOD_SYNC_EVIDENCE_LOG.md` | Evidence log — PASS |
| `_COMMUNICATION/team_60/TEAM_60_CACHE_AND_EOD_DECISION.md` | עדכון — אישור מותנה, Scope |

---

**log_entry | TEAM_60 | TO_TEAM_10 | CONDITIONAL_APPROVAL_FIXES | 2026-02-13**

# Team 60 → Team 10: אישור ריענון מלא — מודול External Data

**id:** `TEAM_60_FULL_MODULE_REVIEW_ACK`  
**from:** Team 60 (DevOps & Platform)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-13  
**מקור:** TEAM_10_TO_TEAMS_20_30_60_EXTERNAL_DATA_FULL_MODULE_REVIEW_MANDATE

---

## 1. הצהרה

**חבילת ה-SSOT המלאה נקראה ויושרה.**

Team 60 קרא את חבילת המקורות (§2) — אדריכל + SSOT — ואימץ את ההנחיות. אין שינויי תשתית במודול External Data בלי יישור למקורות.

---

## 2. משימות §6.3 — ביצוע

| # | משימה | תוצר | סטטוס |
|---|--------|------|--------|
| 1 | קריאת חבילת SSOT המלאה | ✅ | הושלם |
| 2 | יישור cron/job EOD ל-SSOT | sync_exchange_rates_eod; make sync-eod; 0 22 * * 1-5 UTC | ✅ מיושר |
| 3 | הכנת migration ל־exchange_rates_history | scripts/migrations/p3_exchange_rates_history_DRAFT.sql; תיאום Team 20 | ✅ טיוטה |
| 4 | תוכנית retention + ארכיון | TEAM_60_FX_HISTORY_RETENTION_AND_ARCHIVE_PLAN.md | ✅ טיוטה |

---

## 3. קבצים

| קובץ | תיאור |
|------|--------|
| scripts/migrations/p3_exchange_rates_history_DRAFT.sql | DDL טיוטה — ממתין לאישור אדריכל |
| _COMMUNICATION/team_60/TEAM_60_FX_HISTORY_RETENTION_AND_ARCHIVE_PLAN.md | תוכנית 250d → ארכיון |
| scripts/sync_exchange_rates_eod.py | FX EOD — Alpha→Yahoo; מיושר ל-SSOT |

---

## 4. תוכנית בעלות — exchange_rates_history

| שלב | בעלים | פעולה |
|-----|--------|--------|
| DDL | Team 60 | migration — הרצה באישור אדריכל/Team 10 |
| Job EOD | Team 20 + 60 | Team 20: לוגיקת insert history; Team 60: עדכון cron/תזמון |
| Retention/Cleanup | Team 60 | הרחבת cleanup_market_data או job נפרד |

---

## 5. המשך

- **ממתין להחלטת אדריכל** — exchange_rates_history.  
- **לאחר אישור** — הרצת migration; עדכון job EOD; הפעלת retention/ארכיון.

---

**log_entry | TEAM_60 | FULL_MODULE_REVIEW | SSOT_ALIGNED | 2026-02-13**

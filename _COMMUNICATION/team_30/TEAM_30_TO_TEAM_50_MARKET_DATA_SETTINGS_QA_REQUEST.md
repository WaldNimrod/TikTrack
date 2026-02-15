# Team 30 → Team 50 | בקשת QA — Market Data Settings UI (Gate-A)

**id:** TEAM_30_TO_TEAM_50_MARKET_DATA_SETTINGS_QA_REQUEST  
**from:** Team 30 (Frontend)  
**to:** Team 50 (QA)  
**date:** 2026-01-31  
**משימה:** MD-SETTINGS — Gate-A

---

## 1. פרומט להפעלה

```
Team 30 → Team 50 | בקשת בדיקות — Market Data Settings UI (Gate-A)

המימוש הושלם. Build מוכן לבדיקות Gate-A.

משימה: Gate-A — תרחישי קצה (טווח min/max, role Admin vs non-admin, השפעה runtime, stale/no-crash).
דוח Gate-A + Seal (SOP-013) חובה.

מנדט: TEAM_10_TO_TEAM_50_MARKET_DATA_SETTINGS_UI_MANDATE.md
תוכנית עבודה: TEAM_10_MARKET_DATA_SETTINGS_UI_WORK_PLAN.md
תיאום API: TEAM_20_TO_TEAM_30_MARKET_DATA_SETTINGS_UI_COORDINATION.md

דוח: TEAM_50_TO_TEAM_10_*_MARKET_DATA_SETTINGS_QA_REPORT
סגירה: Seal לפי SOP-013 בלבד.
```

---

## 2. מה נבדק (Team 30 — היקף UI)

| # | תרחיש | פרטים |
|---|--------|--------|
| 1 | טעינה ראשונית | GET /settings/market-data — 6 שדות מוצגים (כולל delay_between_symbols_seconds, intraday_enabled) |
| 2 | עריכה ושמירה | PATCH — עדכון ערכים, 200 → state reload, הודעת "נשמר בהצלחה" |
| 3 | שגיאות UI | 403 — "אין הרשאה — נדרש תפקיד Admin."; 422 — validation_errors; 500/503 — הודעות מתאימות |
| 4 | No crash | טעינה עם Backend down / 503 — הודעה ברורה, אין crash |
| 5 | ולידציה client | min/max מוצגים כ-hint; ערכים מחוץ לטווח — Backend מחזיר 422 |

---

## 3. Acceptance Criteria (מנדט Team 50 — לאימות)

| # | קריטריון | אימות |
|---|-----------|--------|
| 1 | PATCH משנה ערכים ונשמר ב-DB עם audit | API + DB |
| 2 | ערכים מחוץ לטווח נדחים (400/422) | API |
| 3 | non-admin נדחה (403) | role test |
| 4 | intraday_enabled=false → skip intraday job | תיאום 60; Evidence |
| 5 | delay_between_symbols_seconds משפיע בסקריפטי sync | תיאום 20/60 |
| 6 | אין crash/stale ב-UI | E2E / Manual |

---

## 4. נתיב לבדיקה

- **עמוד:** ניהול מערכת (`/system_management.html`)
- **סעיף:** "הגדרות נתוני שוק (Market Data)"
- **תלות:** Build 20+60 (API GET+PATCH, migration) מוכן

---

## 5. תוצרים מצופים

- `TEAM_50_TO_TEAM_10_*_MARKET_DATA_SETTINGS_QA_REPORT`
- Seal (SOP-013) — אישור Gate-A

---

**log_entry | TEAM_30 | TO_TEAM_50 | MARKET_DATA_SETTINGS_QA_REQUEST | 2026-01-31**

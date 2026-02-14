# Team 10 → Team 50: הערת QA — מפתח מצב שוק (Market Status) ליד שעון Staleness

**id:** `TEAM_10_TO_TEAM_50_MARKET_STATUS_QA_NOTE`  
**from:** Team 10 (The Gateway)  
**to:** Team 50 (QA)  
**re:** TEAM_20_TO_TEAMS_10_30_MARKET_STATUS_UI_COMPLETE.md  
**date:** 2026-02-14

---

## 1. הקשר

Team 20 השלים מימוש **מצב שוק** (Market Status) — מפתח צבעים ליד שעון עדכון הנתונים (staleness) בדפים: tickers, trading_accounts, cash_flows, brokers_fees, דשבורד נתונים.

---

## 2. פריטים לבדיקה (במועד המתאים)

| # | פריט | תוצאה מצופה |
|---|--------|--------------|
| 1 | **שעון + מפתח צבעים** — מופיעים בדפים הרלוונטיים | מפתח צבעים ליד השעון; צבעים: פתוח (ירוק), פרהמרקט/אפטר (כתום), סגור (אפור). |
| 2 | **כישלון (401, network)** | מפתח הצבעים מוסתר (ללא קריסה). |
| 3 | **נגישות** | `aria-label` ו־`title` על מפתח הצבעים. |

**API:** `GET /api/v1/system/market-status` (Auth) — מחזיר `market_state`, `display_label`.

---

## 3. מקור

- _COMMUNICATION/team_20/TEAM_20_TO_TEAMS_10_30_MARKET_STATUS_UI_COMPLETE.md  
- documentation/00-MANAGEMENT/00_MASTER_INDEX.md — System API מצב שוק  

---

**log_entry | TEAM_10 | TO_TEAM_50 | MARKET_STATUS_QA_NOTE | 2026-02-14**  
**סטטוס:** ✅ **CLOSED** — דוח התקבל ואושר: TEAM_50_TO_TEAM_10_MARKET_STATUS_QA_REPORT.md; ACK: TEAM_10_TO_TEAM_50_MARKET_STATUS_QA_ACK.md (2026-02-14).

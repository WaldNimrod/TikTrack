# Team 10 → Team 90 | הגשת חבילת תכנון — ניהול תזמוני נתונים חיצוניים (Market Data Settings UI)

**from:** Team 10 (The Gateway)  
**to:** Team 90 / האדריכלית  
**date:** 2026-02-15  
**subject:** הגשת תוכנית מפורטת לאישור — ממשק הגדרות נתוני שוק (תזמון, Intraday, Rate-Limit)

---

## מטרה

בהתאם לבקשה שלכם לאחר קריאת [TEAM_20_TO_ARCHITECT_MARKET_DATA_SETTINGS_UI_PLAN.md](../90_Architects_comunication/TEAM_20_TO_ARCHITECT_MARKET_DATA_SETTINGS_UI_PLAN.md) — **דרישת תכנון מפורט לפני הפעלת צוותים** — Team 10 מגיש את חבילת התכנון הבאה לאישורכם.

---

## חבילה מוגשת (רשימה מלאה)

| # | מסמך | תיאור |
|---|------|--------|
| 1 | [TEAM_10_MARKET_DATA_SETTINGS_UI_WORK_PLAN.md](TEAM_10_MARKET_DATA_SETTINGS_UI_WORK_PLAN.md) | תוכנית עבודה: הקשר, החלטות נעולות, משתנים וטווחים, חלוקת עבודה 20/30/50/60/10, שערי איכות (Gate-0 → A → B → KP), Acceptance Criteria. |
| 2 | [documentation/09-GOVERNANCE/TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT.md](../../documentation/09-GOVERNANCE/TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT.md) | SSOT ייעודי: מקור אמת (DB > env), טבלת מפתחות/טווחים, אחסון market_data.system_settings, השלכות תפעוליות (intraday_enabled, delay_between_symbols). |
| 3 | [TEAM_10_SSOT_DELTA_MARKET_DATA_SETTINGS.md](TEAM_10_SSOT_DELTA_MARKET_DATA_SETTINGS.md) | רשימת מסמכי SSOT ליצירה/עדכון (DDL, OpenAPI, MARKET_DATA_PIPE_SPEC §8.3, 00_MASTER_INDEX). |
| 4 | מנדטים 20/30/50/60 | [TEAM_10_TO_TEAM_20_MARKET_DATA_SETTINGS_UI_MANDATE.md](TEAM_10_TO_TEAM_20_MARKET_DATA_SETTINGS_UI_MANDATE.md), [30](TEAM_10_TO_TEAM_30_MARKET_DATA_SETTINGS_UI_MANDATE.md), [50](TEAM_10_TO_TEAM_50_MARKET_DATA_SETTINGS_UI_MANDATE.md), [60](TEAM_10_TO_TEAM_60_MARKET_DATA_SETTINGS_UI_MANDATE.md) — Acceptance Criteria מדידים לכל צוות. |
| 5 | [TEAM_10_MASTER_TASK_LIST.md](TEAM_10_MASTER_TASK_LIST.md) | משימת MD-SETTINGS ברשימת המשימות המרכזית (סעיף MARKET_DATA_SETTINGS_UI). |

---

## דגשים ששולבו (לפי המשוב שלכם)

- **נעילת מקור אמת:** SSOT ייעודי; קדימות DB > env.
- **סכמת אחסון אחת:** `market_data.system_settings` (key/value + type + constraints + audit).
- **ולידציה קשיחה:** min/max/default נאכפים ב-Backend; PATCH מחזיר 400/403/422; Admin-only.
- **intraday_enabled:** אכיפה ב-job runtime (skip + לוג); תיאום Cron כך ששינוי setting לא דורש שינוי ידני.
- **delay_between_symbols_seconds:** מחייב בסקריפטי sync בפועל.
- **יישור TT2_TICKER_STATUS:** התכנון תואם ל-TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT (pending/active/inactive/cancelled).

---

## בקשת אישור

לאחר אישורכם על החבילה — Team 10 יפנה להפעלת צוותים (20, 30, 50, 60) לפי המנדטים, ו-Gate-0 (SSOT/DDL/OpenAPI delta) יושלם בהתאם ל-Work Plan.

סגירה מלאה של המשימה — רק עם **Seal (SOP-013)** לאחר Gate-A ו-Gate-B.

---

**log_entry | TEAM_10 | TO_TEAM_90 | MARKET_DATA_SETTINGS_UI_PLANNING_PACKAGE_SUBMISSION | 2026-02-15**

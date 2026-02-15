# הגדרות מערכת — נתוני שוק (Market Data System Settings) — SSOT

**id:** `TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT`  
**owner:** Team 10 (The Gateway)  
**status:** 🔒 **SSOT — LOCKED** (אישור ביצוע Team 90 / אדריכלית — TEAM_10_TO_TEAM_90_MARKET_DATA_SETTINGS_UI_PLANNING_PACKAGE_SUBMISSION)  
**last_updated:** 2026-02-15  
**מקור:** TEAM_20_TO_ARCHITECT_MARKET_DATA_SETTINGS_UI_PLAN; Team 90 Review — דרישת תכנון מפורט.

**תלויות:** [MARKET_DATA_PIPE_SPEC](../01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md) §8.3, [TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT](./TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT.md).

---

## 1. מקור אמת וקדימות

- **מקור אמת:** טבלה **`market_data.system_settings`** (key/value + type + constraints + updated_by/updated_at + audit).
- **קדימות ערכים:** **DB > env**. אם קיים ערך ב-DB — משתמשים בו; אחרת — ערך מ-env (ברירת מחדל). מנגנון חירום override (למשל env force) — אם יוגדר בעתיד — יתועד כאן.
- **Admin-only:** GET/PATCH להגדרות — רק למשתמשים עם תפקיד Admin.

---

## 2. טבלת הגדרות — מפתחות וטווחים

כל ה-min/max/default **חייבים** להיאכף ב-Backend (ולידציה קשיחה). PATCH מחזיר **422** (validation / no fields) ו-**403** (non-admin) לפי חוזה OpenAPI.

| key | type | min | max | default | תיאור |
|-----|------|-----|-----|---------|--------|
| max_active_tickers | integer | 1 | 500 | 50 | מקסימום טיקרים "פעילים" (לפי TT2_TICKER_STATUS: active) לרענון Intraday |
| intraday_interval_minutes | integer | 5 | 240 | 15 | מרווח רענון Intraday (דקות); כפולות 5 מומלץ |
| provider_cooldown_minutes | integer | 5 | 120 | 15 | Cooldown (דקות) אחרי 429 |
| max_symbols_per_request | integer | 1 | 50 | 5 | מקסימום סימבולים בבאץ' אחד לספק |
| delay_between_symbols_seconds | integer | 0 | 30 | 0 | רווח (שניות) בין סימבולים בבאץ' — **מחייב בסקריפטי sync** |
| intraday_enabled | boolean | — | — | true | הפעלה/כיבוי רענון Intraday — **אכיפה ב-job runtime** (skip + לוג) |

**יישור סטטוס טיקר:** "פעילים" מתייחסים ל-[TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT](./TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT.md) (pending/active/inactive/cancelled). במצב נוכחי: is_active=true; ביעד: status=active.

---

## 3. אחסון — טבלה מומלצת

**סכמה:** `market_data.system_settings` (לא לפזר בין schemas).

- **מבנה:** key (unique), value (text/json לפי type), type (integer|boolean|...), updated_by, updated_at; audit log לפי מדיניות פרויקט.
- **Migration:** Team 60 — DDL ייעודי או addendum ל-PHX_DB_SCHEMA.

---

## 4. השלכות תפעוליות

- **intraday_enabled=false:** Job Intraday **מדלג** (skip) — עם לוג מפורש; אין שינוי ידני ב-Cron בכל שינוי setting — הקריאה מ-DB/שירות בעת ריצת Job.
- **delay_between_symbols_seconds:** **מחייב** בסקריפטי sync (sync_ticker_prices_*, וכו') — לא רק בכלי בדיקה.
- **תיאום Cron:** Team 60 — תזמון ורשימת טיקרים מתואמים ל-TT2_TICKER_STATUS; טעינת הגדרות מ-DB/env בעת ריצה.

---

## 5. מקורות קשורים

| מסמך | תוכן |
|------|--------|
| MARKET_DATA_PIPE_SPEC §8.3 | System Settings Required — מתואם למסמך זה |
| TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT | סטטוס טיקר → טעינת נתונים |
| TEAM_20_RATELIMIT_SCALING_LOCK_EVIDENCE | Evidence נעילה קודמת |

---

**log_entry | TEAM_10 | TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT | DRAFT_LOCKED | 2026-02-15**

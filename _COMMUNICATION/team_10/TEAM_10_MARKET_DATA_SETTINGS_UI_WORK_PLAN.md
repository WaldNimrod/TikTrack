# תוכנית עבודה — Market Data Settings UI (מיני-פרויקט תשתיתי)

**id:** TEAM_10_MARKET_DATA_SETTINGS_UI_WORK_PLAN  
**מקור:** Team 90 Review — [TEAM_20_TO_ARCHITECT_MARKET_DATA_SETTINGS_UI_PLAN.md](../90_Architects_comunication/TEAM_20_TO_ARCHITECT_MARKET_DATA_SETTINGS_UI_PLAN.md)  
**סטטוס:** חבילת תכנון מפורטת — ממתין לאישור Team 90 לפני הפעלת צוותים  
**last_updated:** 2026-02-15

---

## 1. הקשר ומסקנה

- **כיוון:** נכון ומוצדק תפעולית (אישור 90).
- **מצב נוכחי:** read-only + env בלבד:
  - API: GET `/settings/market-data` בלבד (`api/routers/settings.py`)
  - מקור ערכים: env בלבד (`api/integrations/market_data/market_data_settings.py`)
  - UI: תצוגה בלבד (`systemManagementSettingsInit.js`)
- **היקף:** מיני-פרויקט **תשתיתי מלא** (לא רק UI) — DB, API GET+PATCH, validation, Cron/job integration, UI עריכה.

---

## 2. החלטות נעולות (דרישות 90 — חובה לתכנון)

| נושא | החלטה |
|------|--------|
| **מקור אמת** | SSOT ייעודי ל-System Settings של Market Data. קדימות: **DB > env** (ברירת מחדל); מנגנון חירום override אם נדרש — מתועד ב-SSOT. |
| **סכמת אחסון** | טבלה אחת: **`market_data.system_settings`** (key/value + type + constraints + updated_by/updated_at + audit log). לא לפזר בין schemas. |
| **ולידציה** | כל min/max/default מהתוכנית **נאכפים ב-Backend** (לא רק UI). PATCH מחזיר חוזי שגיאה: **422** (validation / no fields), **403** (non-admin). |
| **הרשאה** | **Admin-only** — PATCH ו-GET לממשק הגדרות. |
| **intraday_enabled** | לא מספיק להציג — **אכיפה ב-job runtime**: skip ברור + לוג. עדכון תיאום Cron (Team 60) כך ששינוי setting לא דורש שינוי ידני. |
| **delay_between_symbols_seconds** | **חובה ליישם בסקריפטי sync בפועל** (לא רק בכלי בדיקה). |
| **יישור סטטוס טיקר** | התכנון **תואם** ל-[TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT](../../documentation/09-GOVERNANCE/TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT.md) (pending/active/inactive/cancelled) — לא רק is_active. |

---

## 3. משתנים וטווחים (מהתוכנית Team 20 — מאושרים)

| משתנה | min | max | default | הערות |
|-------|-----|-----|---------|------|
| max_active_tickers | 1 | 500 | 50 | integer |
| intraday_interval_minutes | 5 | 240 | 15 | integer; כפולות 5 מומלץ |
| provider_cooldown_minutes | 5 | 120 | 15 | integer |
| max_symbols_per_request | 1 | 50 | 5 | integer |
| delay_between_symbols_seconds | 0 | 30 | 0 | integer; **בסקריפטי sync** |
| intraday_enabled | — | — | true | boolean; **אכיפה ב-Cron/Job** |

---

## 4. חלוקת עבודה (Level-2/3)

| צוות | אחריות | תוצרים מצופים |
|------|--------|-----------------|
| **Team 20** | API GET+PATCH; שכבת שירות DB/env (קדימות DB > env); ולידציה קשיחה (min/max); audit; Admin-only; runtime hooks לקריאת settings | Endpoints מתועדים ב-OpenAPI; 403/422; Evidence |
| **Team 30** | UI עריכה + שמירה + הצגת שגיאות חוזה + state reload אחרי PATCH | עמוד ניהול מערכת — שדות ניתנים לעריכה, כפתור שמירה, הודעות שגיאה |
| **Team 60** | DB migration (`market_data.system_settings`); אינטגרציית Cron/Job — טעינת settings, skip intraday אם intraday_enabled=false (עם evidence + לוג); עדכון תיאום Cron | Migration רץ; Evidence runtime (skip + log); תיעוד |
| **Team 50** | QA Gate-A: תרחישי קצה (טווח, role, השפעה runtime, stale/no-crash) | דוח Gate-A; Seal (SOP-013) |
| **Team 10** | קידום SSOT; מנדטים; תזמון שערים; KP closure | SSOT delta; מנדטים; 00_MASTER_INDEX; Evidence |

---

## 5. שערי איכות (Gate criteria)

| שער | בעלים | תנאי כניסה | תנאי יציאה | Evidence |
|-----|--------|------------|------------|----------|
| **Gate-0** | Team 10 | מנדט 90 מאושר | SSOT ייעודי מפורסם; טבלת DDL מוגדרת; OpenAPI delta מפורסם | TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT; DDL; OpenAPI |
| **Gate-A** | Team 50 | Build מוכן (20+30+60) | דוח QA PASS; תרחישי קצה; role; runtime; Seal (SOP-013) | TEAM_50_TO_TEAM_10_*_MARKET_DATA_SETTINGS_QA_REPORT |
| **Gate-B** | Team 90 | Gate-A PASS | אימות Spy; אישור סופי | הודעת 90; Seal |
| **Gate-KP** | Team 10 | Gate-B PASS | קידום ידע; Index מעודכן; ארכיון תקשורת | CONSOLIDATION; 00_MASTER_INDEX |

**סגירה מלאה:** רק עם **Seal (SOP-013)**.

---

## 6. Acceptance Criteria מחייבים לסגירה

1. **PATCH** משנה ערכים ונשמר ב-DB עם **audit** (updated_by, updated_at / audit log).
2. ערכים **מחוץ לטווח** נדחים (422).
3. **non-admin** נדחה (403) — **חובה אימות בפועל עם משתמש USER** + Evidence.
4. **intraday_enabled=false** גורם ל-**skip אמיתי** של intraday job (עם **evidence** + לוג).
5. **delay_between_symbols_seconds** משפיע **בפועל** על קצב קריאות בסקריפטי sync.
6. כל מסמכי **SSOT, OpenAPI, ו-Index** מעודכנים ומיושרים.
7. סגירה רק עם **Seal** לפי SOP-013.

---

## 7. SSOT Delta (רשימת מסמכים ליצירה/עדכון)

ראה: [TEAM_10_SSOT_DELTA_MARKET_DATA_SETTINGS.md](TEAM_10_SSOT_DELTA_MARKET_DATA_SETTINGS.md).

---

## 8. מנדטים

- [TEAM_10_TO_TEAM_20_MARKET_DATA_SETTINGS_UI_MANDATE.md](TEAM_10_TO_TEAM_20_MARKET_DATA_SETTINGS_UI_MANDATE.md)
- [TEAM_10_TO_TEAM_30_MARKET_DATA_SETTINGS_UI_MANDATE.md](TEAM_10_TO_TEAM_30_MARKET_DATA_SETTINGS_UI_MANDATE.md)
- [TEAM_10_TO_TEAM_50_MARKET_DATA_SETTINGS_UI_MANDATE.md](TEAM_10_TO_TEAM_50_MARKET_DATA_SETTINGS_UI_MANDATE.md)
- [TEAM_10_TO_TEAM_60_MARKET_DATA_SETTINGS_UI_MANDATE.md](TEAM_10_TO_TEAM_60_MARKET_DATA_SETTINGS_UI_MANDATE.md)

---

**log_entry | TEAM_10 | MARKET_DATA_SETTINGS_UI | WORK_PLAN_DRAFT | 2026-02-15** — חבילת תכנון מפורטת לאישור Team 90 לפני הפצה לצוותים.

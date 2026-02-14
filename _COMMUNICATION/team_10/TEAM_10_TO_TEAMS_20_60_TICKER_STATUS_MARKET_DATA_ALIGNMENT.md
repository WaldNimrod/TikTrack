# Team 10 → Teams 20 & 60: תיאום סטטוס טיקר והתנהגות טעינת נתונים

**id:** `TEAM_10_TO_TEAMS_20_60_TICKER_STATUS_MARKET_DATA_ALIGNMENT`  
**from:** Team 10 (The Gateway)  
**to:** Team 20 (Backend), Team 60 (Infrastructure)  
**date:** 2026-02-14  
**נושא:** שדה סטטוס בעמוד טיקרים — חובה לפי הסטטוסים המערכתיים; התנהגות טעינת נתונים מתואמת לכל סטטוס

---

## 1. רקע

נדרש **תיאום מלא** לכל הסטטוסים: שדה הסטטוס בעמוד טיקרים חייב להיות **סטנדרטי** — לפי הסטטוסים של המערכת (ממתין, פתוח, סגור, מבוטל), עם **משמעות ברורה** לכל סטטוס לגבי טעינת נתוני שוק.

**Team 30** כבר בונה את הממשק — יישור לתבנית זו (statusValues.js + statusAdapter.js, ארבעת הערכים בלבד).  
**Teams 20 ו-60** — נדרש יישור לוגיקת סנכרון ו-Cron/Jobs להתנהגות המפורטת להלן.

**מצב נוכחי (קוד/DB):** טבלת טיקרים — שדה **`is_active` (boolean)** בלבד. `is_active = true` → Intraday+EOD+היסטוריה; `is_active = false` → EOD+היסטוריה בלבד (ללא Intraday). **יעד:** שדה `status` (pending/active/inactive/cancelled) — מיגרציה. עד אז: סקריפטים ו-Cron מסתמכים על `is_active`; מקור אמת: TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT.

---

## 2. טבלת סטטוס → התנהגות טעינת נתונים (מחייבת)

| סטטוס (עברית) | ערך קנוני (DB/API) | התנהגות טעינת נתונים |
|----------------|---------------------|------------------------|
| **ממתין** | `pending` | **בדיקת נתונים בלבד** — משפיע **נתוני סוף יום (EOD) והיסטוריה (250d) בלבד**. אין טעינת Intraday בקצב מלא. |
| **פתוח** | `active` | **טעינת נתונים מלאה בקצב מלא** — Intraday + EOD + היסטוריה. |
| **סגור** | `inactive` | **טעינת נתונים מלאה בקצב מופחת** — EOD + היסטוריה; Intraday בקצב מופחת (או רק EOD לפי הגדרות). |
| **מבוטל** | `cancelled` | **לא פעיל** — **לא טוען נתונים** (אין Intraday, אין EOD פעיל, אין היסטוריה ממושכת). |

---

## 3. דרישות לצוותים

### Team 20 (Backend)

- **שדה status** בישות/טבלת טיקרים — ערכים **רק**: `pending` | `active` | `inactive` | `cancelled` (תואם TT2_SYSTEM_STATUS_VALUES_SSOT).
- **לוגיקת סנכרון** (סקריפטי EOD, Intraday, History Backfill) — **תבסס** על סטטוס הטיקר לפי הטבלה למעלה:
  - `cancelled` — לא לכלול ב-backfill / לא לטעון נתונים.
  - `pending` — EOD + היסטוריה (250d) בלבד; ללא Intraday בקצב מלא.
  - `active` — טעינה מלאה בקצב מלא (Intraday + EOD + היסטוריה).
  - `inactive` — טעינה מלאה בקצב מופחת (EOD + היסטוריה; Intraday מופחת או לפי config).
- **API / מודלים** — להחזיר ולקבל רק ערכים קנוניים; תצוגה עברית ב-Frontend דרך Adapter.

### Team 60 (Infrastructure)

- **Cron / Jobs** — רשימת טיקרים לסנכרון (History Backfill, EOD, Intraday) — **תבסס** על סטטוס טיקר:
  - Backfill/EOD — לא לכלול טיקרים ב-`cancelled` (או לכלול רק pending/active/inactive לפי אפיון).
  - Intraday — רק טיקרים ב-`active` (או `active` + `inactive` בקצב מופחת לפי config).
- **תיעוד** (TEAM_60_CRON_SCHEDULE, env, Make) — לציין שהתנהגות לפי סטטוס טיקר (הפניה ל-SSOT).

---

## 4. תיעוד מעודכן (SSOT)

**מסמך מחייב:** `documentation/09-GOVERNANCE/TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT.md`

- טבלת ארבעת הסטטוסים והתנהגות טעינת הנתונים — **נעולה**.
- כל שינוי עתידי — רק דרך עדכון SSOT ואישור Team 10.

**מקור סטטוסים מערכתיים:** `documentation/09-GOVERNANCE/TT2_SYSTEM_STATUS_VALUES_SSOT.md` (ערכים קנוניים + עברית).

---

## 5. Team 30 (להערה)

Team 30 בונה את ממשק עמוד הטיקרים — **חובה** ששדה הסטטוס יהיה לפי TT2_SYSTEM_STATUS_VALUES_SSOT (ארבעת הערכים, תצוגה דרך statusValues.js + statusAdapter.js). אין ערכי סטטוס אחרים בעמוד הטיקרים.

---

## 6. הפניות

| מסמך | נתיב |
|------|------|
| SSOT סטטוס טיקר + טעינת נתונים | documentation/09-GOVERNANCE/TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT.md |
| SSOT סטטוסים מערכתיים | documentation/09-GOVERNANCE/TT2_SYSTEM_STATUS_VALUES_SSOT.md |
| MARKET_DATA_PIPE_SPEC | documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md |

---

**log_entry | TEAM_10 | TO_TEAMS_20_60 | TICKER_STATUS_MARKET_DATA_ALIGNMENT | 2026-02-14**

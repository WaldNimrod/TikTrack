# Team 20 → האדריכלית: תוכנית מפורטת — ממשק הגדרות נתוני שוק

**from:** Team 20 (Backend)  
**to:** Chief Architect  
**date:** 2026-02-15  
**subject:** תוכנית ממשק הגדרות אינטרוולים — שליטה בעומס ספקים חיצוניים  
**מקור:** בקשה ממשק בעמוד ניהול מערכת; סביבת פיתוח — קצבי רענון נמוכים  
**סטטוס:** ממתין לאישור האדריכלית

---

## 1. רקע

בעמוד ניהול מערכת קיימת כיום **תצוגה בלבד** (read-only) של 4 בקרי Rate-Limit. הבקשות:
1. **ממשק עריכה** — אפשרות להגדיר ערכים מתוך ה-UI.
2. **התאמה לסביבת פיתוח** — קצבי רענון נמוכים מאוד (Yahoo 429, Alpha limits).
3. **ערכים מומלצים וקצה** — טווחים תקפים לכל משתנה.

**SSOT:** MARKET_DATA_PIPE_SPEC §8.3, TEAM_20_RATELIMIT_SCALING_LOCK_EVIDENCE

---

## 2. משתנים קיימים — ערכים מומלצים וקצה

### 2.1 max_active_tickers

| שדה | ערך |
|-----|-----|
| **תיאור** | מקסימום טיקרים "פעילים" (is_active=true) שעוברים רענון Intraday |
| **מקור** | market_data_settings.get_max_active_tickers() |
| **Env var** | MAX_ACTIVE_TICKERS |
| **ברירת מחדל** | 50 |
| **מינימום** | 1 |
| **מקסימום** | 500 |
| **מומלץ Production** | 50 |
| **מומלץ Dev (קצב נמוך)** | 10 |
| **ולידציה** | 1 ≤ value ≤ 500; integer |

---

### 2.2 intraday_interval_minutes

| שדה | ערך |
|-----|-----|
| **תיאור** | מרווח רענון Intraday (דקות) — Cron */N * * * 1-5 |
| **מקור** | market_data_settings.get_intraday_interval_minutes() |
| **Env var** | INTRADAY_INTERVAL_MINUTES |
| **ברירת מחדל** | 15 |
| **מינימום** | 5 |
| **מקסימום** | 240 (4 שעות) |
| **מומלץ Production** | 15 |
| **מומלץ Dev (קצב נמוך)** | 60 |
| **ולידציה** | 5 ≤ value ≤ 240; integer; מומלץ כפולות 5 |

---

### 2.3 provider_cooldown_minutes

| שדה | ערך |
|-----|-----|
| **תיאור** | Cooldown (דקות) אחרי 429 — אין קריאות נוספות לספק בחלון |
| **מקור** | market_data_settings.get_provider_cooldown_minutes() |
| **Env var** | PROVIDER_COOLDOWN_MINUTES |
| **ברירת מחדל** | 15 |
| **מינימום** | 5 |
| **מקסימום** | 120 |
| **מומלץ Production** | 15 |
| **מומלץ Dev (קצב נמוך)** | 30 |
| **ולידציה** | 5 ≤ value ≤ 120; integer |

---

### 2.4 max_symbols_per_request

| שדה | ערך |
|-----|-----|
| **תיאור** | מקסימום סימבולים בבאץ' אחד לספק (אם תומך) |
| **מקור** | market_data_settings.get_max_symbols_per_request() |
| **Env var** | MAX_SYMBOLS_PER_REQUEST |
| **ברירת מחדל** | 5 |
| **מינימום** | 1 |
| **מקסימום** | 50 |
| **מומלץ Production** | 5 |
| **מומלץ Dev (קצב נמוך)** | 2 |
| **ולידציה** | 1 ≤ value ≤ 50; integer |

---

## 3. משתנים חדשים מומלצים (לאשר)

### 3.1 delay_between_symbols_seconds

| שדה | ערך |
|-----|-----|
| **תיאור** | רווח (שניות) בין סימבולים בבאץ' — מפחית burst ל-Yahoo |
| **מימוש נוכחי** | test-providers-direct.py: 4s קבוע; לא בסקריפטי sync |
| **ברירת מחדל** | 0 |
| **מינימום** | 0 |
| **מקסימום** | 30 |
| **מומלץ Production** | 0 |
| **מומלץ Dev (קצב נמוך)** | 4 |
| **ולידציה** | 0 ≤ value ≤ 30; integer |

---

### 3.2 intraday_enabled

| שדה | ערך |
|-----|-----|
| **תיאור** | הפעלה/כיבוי רענון Intraday — ב-Dev יכול לכבות לגמרי |
| **מימוש נוכחי** | לא קיים — Cron תמיד רץ |
| **ברירת מחדל** | true |
| **ערכים** | true | false |
| **מומלץ Production** | true |
| **מומלץ Dev (קצב נמוך)** | false |
| **ולידציה** | boolean |

**הערה:** כיבוי יצריך Team 60 — Cron בודק את הערך או Job לא ממומש כשהערך false.

---

## 4. טבלת סיכום — ערכי קצה ומומלצים

| משתנה | min | max | default | Prod | Dev (נמוך) |
|-------|-----|-----|---------|------|------------|
| max_active_tickers | 1 | 500 | 50 | 50 | 10 |
| intraday_interval_minutes | 5 | 240 | 15 | 15 | 60 |
| provider_cooldown_minutes | 5 | 120 | 15 | 15 | 30 |
| max_symbols_per_request | 1 | 50 | 5 | 5 | 2 |
| delay_between_symbols_seconds | 0 | 30 | 0 | 0 | 4 |
| intraday_enabled | — | — | true | true | false |

---

## 5. אחסון והפעלה

| נושא | הצעה |
|------|------|
| **אחסון** | טבלת `market_data.system_settings` (key-value) או `user_data.system_settings` — override ל-env |
| **קדימות** | DB > env — אם קיים ערך ב-DB, להשתמש בו; אחרת env |
| **הפעלה** | ערכים נטענים ב־startup של scripts / בעת קריאה — אין reload חם (שינוי יחול בריצה הבאה של Job) |
| **Admin-only** | ממשק — רק Admin |

---

## 6. חלוקת עבודה מוצעת (לאחר אישור)

| צוות | אחריות |
|------|--------|
| **Team 20** | API: GET + PATCH; market_data_settings — קריאה מ-DB/env; ולידציה; migration טבלת settings |
| **Team 30** | UI: שדות עריכה, כפתור שמירה, טעינה מ-API |
| **Team 60** | Cron: טעינת intraday_enabled; דילוג על Job Intraday אם false |

---

## 7. בקשה לאישור

**מבקשים את אישור האדריכלית על:**
1. טבלת הערכים והקצוות (§2, §3, §4).
2. שני המשתנים החדשים: delay_between_symbols_seconds, intraday_enabled.
3. מנגנון האחסון (DB override ל-env).
4. חלוקת העבודה (§6).

לאחר אישור — Team 20 יקבל מנדט יישום לחלקו.

---

**log_entry | TEAM_20 | TO_ARCHITECT | MARKET_DATA_SETTINGS_UI_PLAN | PENDING_APPROVAL | 2026-02-15**

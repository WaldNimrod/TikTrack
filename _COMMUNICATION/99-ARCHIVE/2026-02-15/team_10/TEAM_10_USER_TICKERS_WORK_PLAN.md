# תוכנית עבודה מפורטת — User Tickers ("הטיקרים שלי")

**From:** Team 10 (The Gateway)  
**To:** Team 90 (The Spy), Teams 20 / 30 / 60 / 50  
**Date:** 2026-02-14  
**Subject:** USER_TICKERS — Work Plan per SSOT Brief  
**מקור מחייב:** `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_USER_TICKERS_IMPLEMENTATION_BRIEF.md`

---

## 1. Decision Locked (GIN)

**Decision Locked:** join table + inline create + live data check.  
הבריף נועל: טבלת צומת ייעודית `user_data.user_tickers`, יצירת טיקר חדש inline, ו**בדיקת נתונים חיים (live data-load check)** לפני יצירה. כל סטייה מהבריף = החזרה לתיקון.

---

## 2. חלוקה לפי צוותים

### 2.1 Team 20 (Backend) — Owner: Team 20

| # | משימה | תוצרים | קריטריוני קבלה | תלויות |
|---|--------|--------|-----------------|--------|
| 20.UT.1 | DDL + Migration: `user_data.user_tickers` | DDL, migration script, Evidence | טבלה עם `user_id`, `ticker_id`, `created_at`, `deleted_at`; FK ל-users ו-tickers; **UNIQUE (user_id, ticker_id) WHERE deleted_at IS NULL** (מניעת כפילות); אינדקסים | אין |
| 20.UT.2 | API: `GET /me/tickers` | Endpoint מתועד, Evidence | מחזיר רשימת טיקרים של המשתמש המחובר; auth + tenant | 20.UT.1 |
| 20.UT.3 | API: `POST /me/tickers` (הוספת קיים או יצירת טיקר חדש) | Endpoint, לוגיקת בדיקת נתונים חיים, Evidence | אם טיקר לא במערכת: קריאה ל-provider (Yahoo→Alpha) ל-EOD/last; אם אין נתונים — 4xx, **לא יוצרים** טיקר; אם יש — יוצרים ב-`market_data.tickers` ומקשרים ב-`user_tickers` | 20.UT.1 |
| 20.UT.4 | API: `DELETE /me/tickers/{ticker_id}` | Endpoint, Evidence | הסרה מהרשימה (soft delete ב-`user_tickers` או עדכון `deleted_at`) | 20.UT.1 |
| 20.UT.5 | בדיקת נתונים לפני יצירת טיקר חדש | תיעוד + קוד | לפני יצירת רשומה ב-`market_data.tickers` — חובה fetch מוצלח (לפחות EOD/last price); כישלון → שגיאה למשתמש | 20.UT.3 |

**סיכום תוצרים:** DDL/migration, 3 endpoints מתועדים, לוגיקת live data-load check, Evidence ב-`documentation/05-REPORTS/artifacts/`.

---

### 2.2 Team 30 (Frontend) — Owner: Team 30

| # | משימה | תוצרים | קריטריוני קבלה | תלויות |
|---|--------|--------|-----------------|--------|
| 30.UT.1 | Template Factory / Page Manifest — חיבור העמוד | `user_ticker.content.html`, `page-manifest.json`, `vite.config.js` mapping, `routes.json` (נתיב `user_ticker.html`) | העמוד מופיע ב-build ובתפריט; Route תקין | Blueprint + Spec (קיימים) |
| 30.UT.2 | יצירת `user_ticker.html` (שכפול/התאמה מ-`tickers.html`) | `ui/.../user_ticker.html` | כותרת/תוויות "הטיקרים שלי"; Route קיים בתפריט | 30.UT.1 |
| 30.UT.3 | PageConfig + TableInit למקור `/me/tickers` | קבצי config/table | טבלה נטענת מ-`GET /me/tickers` | 20.UT.2 הושלם |
| 30.UT.4 | מודול הוספה: "טיקר חדש" + הוספת קיים | UI מודל/ formula | כפתור הוספה; אפשרות להוסיף טיקר קיים או **ליצור טיקר חדש** (inline) לפי הבריף | 20.UT.3 |
| 30.UT.5 | טיפול בשגיאות | הודעות למשתמש | שגיאת provider (אין נתונים) מוצגת ברור; לא יוצרים טיקר אם API החזיר שגיאה | 20.UT.3 |
| 30.UT.6 | הסרה מהרשימה | פעולת Delete/הסרה | קריאה ל-`DELETE /me/tickers/{ticker_id}`; רענון רשימה | 20.UT.4 |

**סיכום תוצרים:** Template Factory (user_ticker.content.html, page-manifest.json, vite.config.js, routes.json), `user_ticker.html`, PageConfig, TableInit, מודול הוספה (כולל "טיקר חדש"), טיפול בשגיאות, Evidence.

---

### 2.3 Team 60 (DevOps / Infra) — Owner: Team 60

| # | משימה | תוצרים | קריטריוני קבלה | תלויות |
|---|--------|--------|-----------------|--------|
| 60.UT.1 | הרצת migration ל-`user_data.user_tickers` | Migration הורץ בסביבות רלוונטיות, Evidence | טבלה קיימת ב-DB; אין שבירת build | 20.UT.1 (DDL מוכן) |
| 60.UT.2 | תחזוקה/ניקוי (אם נדרש) | תיעוד / job (אם יש soft delete) | לפי הבריף: אין שינויי cron אלא אם טבלה חדשה דורשת cleanup | אחרי 60.UT.1 |

**סיכום תוצרים:** Migration runner, Evidence; תחזוקה רק אם נדרש לפי SSOT.

---

### 2.4 Team 50 (QA) — Owner: Team 50

| # | משימה | תוצרים | קריטריוני קבלה | תלויות |
|---|--------|--------|-----------------|--------|
| 50.UT.1 | QA לפי קריטריוני הבריף (§5) | דוח QA, Evidence | עמוד נטען; מקור נתונים `/me/tickers`; הוספה/הסרה עובדות; הוספת טיקר חדש מפעילה בדיקת נתונים — כישלון provider לא יוצר טיקר; משתמש לא עורך מטא-דאטה מערכתית | 30.UT.* ו-20.UT.* |
| 50.UT.2 | Sanity: DB, API, UI, שגיאות | Checklist + Evidence | checklist ל-DB schema, endpoints, UI, טיפול בשגיאות | 50.UT.1 |

**סיכום תוצרים:** דוח QA, Sanity checklist, Evidence ב-`documentation/05-REPORTS/artifacts/`.

---

## 3. תלויות בין צוותים (Critical Path)

```
20.UT.1 (DDL + Migration)
  → 60.UT.1 (Run migration)
  → 20.UT.2, 20.UT.3, 20.UT.4 (API)
  → 30.UT.1–30.UT.6 (Frontend, כולל Template Factory)
  → 50.UT.1, 50.UT.2 (QA)
```

---

## 4. עדכון SSOT (Team 10)

- נעדכן מסמכי TT2_* רלוונטיים (אם יש עמוד/תהליך User Tickers).
- נעדכן MARKET_DATA_* רק אם יש שינוי במדיניות טיקרים/ספקים.
- נעדכן `documentation/00-MANAGEMENT/00_MASTER_INDEX.md` עם הפניה לתוכנית זו ולביצוע User Tickers.
- אין סטיות ואין ניחושים מהבריף.

(פירוט העדכונים — בקובץ נפרד או בסעיף עדכונים לאחר נעילה.)

---

## 5. ניהול תהליך וסגירה

- Team 10 מנהל את הביצוע עד סיום (מעקב אחרי Evidence, חסימות, דיווחים).
- בסיום — הגשת **דוח מסכם** ל-Team 90 לפי הנוהל, לאישור/ביקורת.
- מקור אמת יחיד: `TEAM_90_TO_TEAM_10_USER_TICKERS_IMPLEMENTATION_BRIEF.md`. כל סטייה = החזרה לתיקון.

---

## 6. סטטוס ברירת מחדל לטיקר חדש — **LOCKED**

**החלטה נעולה (SSOT):** טיקר חדש שנוצר דרך "הטיקרים שלי" יקבל **status = pending** כברירת מחדל.  
המשמעות: נתוני EOD + היסטוריה בלבד עד לקידום סטטוס ידני (לפי TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT).

---

**Prepared by:** Team 10 (The Gateway)  
**Status:** ✅ APPROVED — EXECUTION MAY START (אישור 2026-02-14; ראה TEAM_10_USER_TICKERS_APPROVAL_AND_GO.md)  
**log_entry | TEAM_10 | USER_TICKERS_WORK_PLAN | 2026-02-14**

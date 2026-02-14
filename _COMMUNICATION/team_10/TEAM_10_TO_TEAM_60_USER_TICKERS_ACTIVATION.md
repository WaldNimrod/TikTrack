# הודעת הפעלה — User Tickers ("הטיקרים שלי") | Team 60

**From:** Team 10 (The Gateway)  
**To:** Team 60 (DevOps / Infra)  
**Date:** 2026-02-14  
**Subject:** USER_TICKERS — Activation | מיגרציה/תחזוקה (במידת הצורך)  
**מקור מחייב:** `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_USER_TICKERS_IMPLEMENTATION_BRIEF.md`

---

## 1. מטרה

תמיכה ב-Backend לעמוד "הטיקרים שלי": **הרצת מיגרציה** לטבלה `user_data.user_tickers`, ו**תחזוקה/ניקוי** רק אם נדרש לפי SSOT (למשל soft delete retention). לפי הבריף — אין שינויי cron אלא אם הטבלה החדשה דורשת cleanup.

---

## 2. מקורות חובה

- **בריף SSOT:** `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_USER_TICKERS_IMPLEMENTATION_BRIEF.md` (§4.3 Infra)
- **תוכנית עבודה:** `_COMMUNICATION/team_10/TEAM_10_USER_TICKERS_WORK_PLAN.md` (סעיף 2.3 Team 60)

---

## 3. משימות לביצוע

1. **הרצת Migration** — לאחר ש-Team 20 מספק DDL + migration ל-`user_data.user_tickers`, להריץ בסביבות הרלוונטיות (dev/build כראוי). לוודא שאין שבירת build.
2. **תחזוקה/ניקוי** — רק אם ה-SSOT או הבריף מגדירים job לניקוי (למשל רשומות עם `deleted_at` ישנות). אם לא הוגדר — לא להוסיף cron.
3. **Evidence** — תיעוד הרצת מיגרציה ו-(אם יש) תחזוקה; Evidence ב-`documentation/05-REPORTS/artifacts/`.

---

## 4. כללים

- אין סטיות מהבריף. תיאום עם Team 20 על מועד ה-DDL. דיווח ל-Team 10 על סיום.

---

**Prepared by:** Team 10 (The Gateway)  
**Status:** MANDATORY — Awaiting Team 60 execution (תלוי ב-20: DDL + migration script)

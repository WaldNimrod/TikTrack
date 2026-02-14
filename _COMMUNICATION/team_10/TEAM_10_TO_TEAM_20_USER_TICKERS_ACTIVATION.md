# הודעת הפעלה — User Tickers ("הטיקרים שלי") | Team 20

**From:** Team 10 (The Gateway)  
**To:** Team 20 (Backend)  
**Date:** 2026-02-14  
**Subject:** USER_TICKERS — Activation | API + DB + בדיקת נתונים לפני יצירת טיקר חדש  
**מקור מחייב:** `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_USER_TICKERS_IMPLEMENTATION_BRIEF.md`

---

## 1. מטרה

מימוש Backend מלא לעמוד "הטיקרים שלי": טבלת צומת, API למשתמש המחובר, ו**בדיקת נתונים חיים (live data-load check)** לפני יצירת טיקר מערכתי חדש. כל סטייה מהבריף = החזרה לתיקון.

---

## 2. מקורות חובה

- **בריף SSOT:** `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_USER_TICKERS_IMPLEMENTATION_BRIEF.md`
- **תוכנית עבודה:** `_COMMUNICATION/team_10/TEAM_10_USER_TICKERS_WORK_PLAN.md` (סעיף 2.1 Team 20)
- **Readiness:** `documentation/05-REPORTS/artifacts_SESSION_01/USER_TICKER_PAGE_READINESS_REPORT.md`

---

## 3. משימות לביצוע (תואם לתוכנית העבודה)

1. **DDL + Migration:** טבלה `user_data.user_tickers` (`user_id`, `ticker_id`, `created_at`, `deleted_at`), FK, **UNIQUE (user_id, ticker_id) WHERE deleted_at IS NULL**, אינדקסים. מסירת DDL + migration ל-Team 60 להרצה.
2. **GET /me/tickers** — רשימת טיקרים של המשתמש המחובר; auth + tenant.
3. **POST /me/tickers** — הוספת טיקר קיים לרשימה, או **יצירת טיקר מערכתי חדש + הוספה**.  
   **חובה:** לפני יצירת רשומה ב-`market_data.tickers` — **בדיקת נתונים חיים**: fetch מ-provider (Yahoo→Alpha) ל-EOD/last price. אם fetch נכשל — **לא ליצור** טיקר, להחזיר 4xx. אם הצליח — ליצור טיקר ולקשר ב-`user_tickers`.
4. **DELETE /me/tickers/{ticker_id}** — הסרה מהרשימה (soft delete ב-`user_tickers`).
5. **תיעוד + Evidence** — כל endpoint ולוגיקת הבדיקה מתועדים; Evidence ב-`documentation/05-REPORTS/artifacts/`.

---

## 4. כללים

- אין סטיות מהבריף. אין המצאות שדות/endpoints בלי GIN.
- כסף: Decimal(20,8). מזהים חיצוניים: ULID ב-API לפי תקן.
- דיווח EOD / סגירת משימות ל-Team 10.

---

**Prepared by:** Team 10 (The Gateway)  
**Status:** MANDATORY — Awaiting Team 20 execution

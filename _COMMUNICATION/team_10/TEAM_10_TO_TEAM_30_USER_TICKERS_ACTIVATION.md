# הודעת הפעלה — User Tickers ("הטיקרים שלי") | Team 30

**From:** Team 10 (The Gateway)  
**To:** Team 30 (Frontend)  
**Date:** 2026-02-14  
**Subject:** USER_TICKERS — Activation | מודול הוספה כולל "טיקר חדש" + טיפול בשגיאות  
**מקור מחייב:** `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_USER_TICKERS_IMPLEMENTATION_BRIEF.md`

---

## 1. מטרה

מימוש Frontend לעמוד "הטיקרים שלי": עמוד, טבלה, **מודול הוספה** (כולל "טיקר חדש" inline), והסרה מהרשימה, עם **טיפול ברור בשגיאות** (במיוחד כישלון provider — אין נתונים). כל סטייה מהבריף = החזרה לתיקון.

---

## 2. מקורות חובה

- **בריף SSOT:** `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_USER_TICKERS_IMPLEMENTATION_BRIEF.md`
- **תוכנית עבודה:** `_COMMUNICATION/team_10/TEAM_10_USER_TICKERS_WORK_PLAN.md` (סעיף 2.2 Team 30)
- **מפרט + Blueprint:** `_COMMUNICATION/team_31/team_31_staging/TEAM_31_USER_TICKER_COMPLETE_SPEC.md`, `user_ticker_BLUEPRINT.html`

---

## 3. משימות לביצוע (תואם לתוכנית העבודה)

1. **Template Factory / Page Manifest** — חיבור העמוד: `user_ticker.content.html`, `page-manifest.json`, mapping ב-`vite.config.js`, `routes.json` (נתיב `user_ticker.html`). חובה להעלאת העמוד בפועל.
2. **user_ticker.html** — שכפול/התאמה מ-`tickers.html`; כותרת/תוויות "הטיקרים שלי"; Route בתפריט קיים.
3. **PageConfig + TableInit** — מקור נתונים `GET /me/tickers` (אחרי ש-Team 20 מספק את ה-endpoint).
4. **מודול הוספה:**  
   - הוספת טיקר **קיים** מהמערכת.  
   - **"טיקר חדש"** — inline בתוך המודול: משתמש מזין טיקר שלא במערכת; קריאה ל-`POST /me/tickers`; Backend מבצע בדיקת נתונים חיים.  
5. **טיפול בשגיאות:** אם ה-API מחזיר שגיאה (כולל "אין נתונים מספק") — להציג הודעה ברורה; **לא** ליצור טיקר בממשק.
6. **הסרה מהרשימה** — פעולת Delete/הסרה → `DELETE /me/tickers/{ticker_id}` + רענון.
7. **Evidence** — תיעוד ו-Evidence ב-`documentation/05-REPORTS/artifacts/`.

---

## 4. כללים

- לוגיקה ו-API אצלכם; מראה/CSS דרך Team 40. Transformation Layer: payloads ב-`snake_case` ברשת.
- אין סטיות מהבריף. דיווח EOD / סגירת משימות ל-Team 10.

---

**Prepared by:** Team 10 (The Gateway)  
**Status:** MANDATORY — Awaiting Team 30 execution (תלוי ב-20: GET/POST/DELETE /me/tickers)

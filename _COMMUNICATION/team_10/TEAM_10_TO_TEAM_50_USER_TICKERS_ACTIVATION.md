# הודעת הפעלה — User Tickers ("הטיקרים שלי") | Team 50

**From:** Team 10 (The Gateway)  
**To:** Team 50 (QA)  
**Date:** 2026-02-14  
**Subject:** USER_TICKERS — Activation | QA לפי הקריטריונים החדשים  
**מקור מחייב:** `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_USER_TICKERS_IMPLEMENTATION_BRIEF.md`

---

## 1. מטרה

ביצוע QA לעמוד "הטיקרים שלי" לפי **קריטריוני הקבלה** המפורטים בבריף (§5) ובתוכנית העבודה. כל סטייה מהבריף = החזרה לתיקון.

---

## 2. מקורות חובה

- **בריף SSOT:** `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_USER_TICKERS_IMPLEMENTATION_BRIEF.md` (סעיף 5 Acceptance Criteria)
- **תוכנית עבודה:** `_COMMUNICATION/team_10/TEAM_10_USER_TICKERS_WORK_PLAN.md` (סעיף 2.4 Team 50)

---

## 3. קריטריונים לבדיקה (מבריף §5)

- [ ] `/user_ticker.html` נטען ב-dev/build ומופיע בתפריט.
- [ ] מקור נתונים = `/me/tickers` (או מקור מתועד אם read-only).
- [ ] הוספה/הסרה עובדות ונשמרות לפי GIN.
- [ ] הוספת **טיקר חדש** מפעילה בדיקת נתונים חיים; **אם provider לא מחזיר נתונים — יצירה נכשלת**, הודעת שגיאה למשתמש.
- [ ] משתמש לא יכול לערוך מטא-דאטה מערכתית של טיקר.
- [ ] כל הלוגיקה תואמת להחלטת SSOT; Evidence log מעודכן.

---

## 4. משימות לביצוע (תואם לתוכנית העבודה)

1. **דוח QA** — בדיקות לפי הקריטריונים למעלה; תיעוד ב-Artifacts.
2. **Sanity Checklist** — DB schema (`user_data.user_tickers`), API endpoints (`/me/tickers`), UI, טיפול בשגיאות, אבטחה/tenant.
3. **Evidence** — כל בדיקה מתועדת; שמירה ב-`documentation/05-REPORTS/artifacts/`.
4. **דיווח ל-Team 10** — תוצאות, חסימות, 0 SEVERE לפני מעבר לשלב הבא (לפי נוהל שער א').

---

## 5. כללים

- Evidence Based. שער א' — 0 SEVERE. דיווח ל-Team 10 על סיום/ממצאים.

---

**Prepared by:** Team 10 (The Gateway)  
**Status:** MANDATORY — Awaiting Team 50 execution (אחרי 20 + 30)

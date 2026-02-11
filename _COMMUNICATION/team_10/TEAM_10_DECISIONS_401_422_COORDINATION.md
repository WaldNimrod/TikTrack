# 📋 Team 10: החלטות — אימות 401, מקור 422, תאום צוותים

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-01-30  
**סטטוס:** 🔒 **החלטות מחייבות — SSOT**  
**הקשר:** תאום וסגירת תיקונים — 401 Unauthorized, 422 Register, דוגמאות request body.

---

## 1. סיכום מצב (לפני החלטות)

| נושא | מצב | חסר |
|------|-----|-----|
| **401 Unauthorized** | Team 30 תיקן (DataStage + Shared_Services) — `TEAM_30_GATE_A_SEVERE_FIXES_COMPLETION_REPORT.md` | Team 20 לא נדרש לתיקון (הבעיה בפרונט). אימות מחדש של Team 50 נדרש לאישור ש־SEVERE ירד. |
| **422 Register** | Team 20 ביקש דוגמאות ל־request body שגרם ל־422 | החלטה מי מספק: 50 / 30 / 20. |
| **brokers_fees/summary** | Team 20 תיקן ואימת ב־6 תרחישים — `TEAM_20_TO_TEAM_10_BLOCKING_FIX_COMPLETE.md` | מוכן לבדיקה חוזרת. |

---

## 2. החלטות Team 10

### 2.1 בדיקת אימות מחדש (401)

**החלטה:** **כן — Team 10 מבקש מ־Team 50 להריץ שוב את בדיקות Gate A** לאחר תיקון ה־401 (תיקון Team 30), כדי לאשר שהתיקון אכן מפחית את ה־SEVERE errors (401 Unauthorized).

**פעולה:** הודעה ל־Team 50 — `TEAM_10_TO_TEAM_50_REVERIFICATION_AND_422_CAPTURE.md`.

---

### 2.2 מי מספק דוגמאות 422 (request body)

**החלטה:**

| עדיפות | צוות | פעולה |
|--------|------|--------|
| **ראשית** | **Team 50** | בזמן בדיקה — כשמופיע 422 ב־Register, לתעד/להעתיק את ה־request body מ־Network tab ולמסור ל־Team 10 / Team 20. |
| **משלים** | **Team 30** | לתעד במסמך את פורמט ה־payload שהפרונטאנד שולח ב־Register (שדות, טיפוסים, דוגמה); ולמסור Handoff קצר ל־Team 20: תיקון 401 הושלם + קישור לתיעוד ה־payload. |
| **אופציונלי** | **Team 20** | להוסיף logging ב־Backend כדי לתעד את ה־request הנכנס כש־422 חוזר — לנוחות עתידית; לא חוסם. |

**פעולה:** הודעות ל־Team 50 (לכידת body ב־בדיקה), ל־Team 30 (תיעוד payload + Handoff ל־20), ל־Team 20 (אישור + מקור 422).

---

### 2.3 תאום Team 30 → Team 20 (Handoff)

**החלטה:** **כן — Team 10 מוציא הנחיה ל־Team 30** לשלוח מסמך Handoff קצר ל־Team 20 עם:
- עדכון שתיקון ה־401 בוצע (פרונט).
- Team 30 יכול לספק תיעוד של ה־register payload שהפרונטאנד שולח (שדות, פורמט, דוגמה).

**פעולה:** כלולה בהודעה ל־Team 30 — `TEAM_10_TO_TEAM_30_422_DOCUMENTATION_AND_HANDOFF_TO_20.md`.

---

## 3. סיכום תמציתי

- **אימות 401:** Team 50 מריצה מחדש את Gate A — מאשרים ש־SEVERE ירד.
- **דוגמאות 422:** ראשית — Team 50 (לכידה ב־Network); משלים — Team 30 (תיעוד payload + Handoff ל־20); אופציונלי — Team 20 (לוגינג).
- **תיאום:** Team 30 שולח Handoff ל־Team 20 (401 הושלם + payload).

---

**Team 10 (The Gateway)**  
**log_entry | DECISIONS_401_422_COORDINATION | 2026-01-30**

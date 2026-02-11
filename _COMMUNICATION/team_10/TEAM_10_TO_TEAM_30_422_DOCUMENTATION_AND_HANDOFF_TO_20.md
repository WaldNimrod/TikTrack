# 📋 Team 10 → Team 30: תיעוד Register payload + Handoff ל־Team 20

**מאת:** Team 10 (The Gateway)  
**אל:** Team 30 (Frontend)  
**תאריך:** 2026-01-30  
**סטטוס:** 📋 **בקשה מחייבת**  
**מקור החלטות:** `TEAM_10_DECISIONS_401_422_COORDINATION.md`

---

## 1. תיעוד פורמט Register payload

**בקשה:** לתעד **במסמך** את פורמט ה־payload שהפרונטאנד שולח ב־Register (שדות, טיפוסים, דוגמה JSON).

**סיבה:** Team 20 ביקש דוגמאות ל־request body שגרם ל־422. Team 10 קבע ש־**Team 50** יספק לכידה בזמן בדיקה (ראשי), ו־**Team 30** יספק תיעוד משלים של הפורמט — כדי ש־Team 20 יוכל להבין מה הפרונט שולח ולתקן ולידציה אם נדרש.

**פעולה:**  
- מסמך קצר ב־`_COMMUNICATION/team_30/` (למשל `TEAM_30_REGISTER_PAYLOAD_SPEC.md`) עם:  
  - רשימת שדות (username, email, password, וכו').  
  - טיפוסים (string, וכו').  
  - דוגמת JSON (ערך לדוגמה).  
- אופציונלי: לוגינג זמני בפרונט ש־log את ה־payload לפני שליחה — רק אם לא מספיק תיעוד סטטי.

---

## 2. Handoff ל־Team 20

**בקשה:** לשלוח **מסמך Handoff קצר** ל־Team 20 (ב־`_COMMUNICATION/team_20/` או העתקה ל־team_10 לצורך העברה) עם:

1. **עדכון:** תיקון ה־401 (Unauthorized) בוצע בפרונט — DataStage + Shared_Services; דוח: `TEAM_30_GATE_A_SEVERE_FIXES_COMPLETION_REPORT.md`.  
2. **מקור 422:** Team 30 יכול לספק תיעוד של ה־register payload שהפרונטאנד שולח — קישור למסמך (למשל `TEAM_30_REGISTER_PAYLOAD_SPEC.md`).

**שם מוצע למסמך:** `TEAM_30_TO_TEAM_20_401_FIX_AND_422_PAYLOAD_HANDOFF.md`.

---

## 3. סיכום

| # | פעולה | תוצר |
|---|--------|------|
| 1 | תיעוד Register payload | מסמך עם שדות, טיפוסים, דוגמת JSON |
| 2 | Handoff ל־Team 20 | מסמך קצר: 401 הושלם + קישור לתיעוד payload |

---

**Team 10 (The Gateway)**  
**log_entry | 422_DOCUMENTATION_HANDOFF | TO_TEAM_30 | 2026-01-30**

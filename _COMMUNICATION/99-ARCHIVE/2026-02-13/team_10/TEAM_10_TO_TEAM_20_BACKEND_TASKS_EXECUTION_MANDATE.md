# Team 10 → Team 20: מנדט ביצוע — משימות Backend (סגירת פערים)

**מאת:** Team 10 (The Gateway)  
**אל:** Team 20 (Backend & DB)  
**תאריך:** 2026-02-12  
**נושא:** 🔧 **ביצוע מידי** — אחרת המשימות לא יקרו  
**מקור:** TEAM_10_BACKEND_SIDE_20_60_GAPS_AND_DECISIONS.md, TEAM_10_BACKEND_GAPS_20_60_TEAM_90_RESPONSE_ACK.md

---

## 1. מטרה

הוצאה מפורשת לביצוע המשימות הפתוחות בצד השאת (Team 20). נדרש ביצוע ודיווח — לא להשאיר בתיעוד בלבד.

---

## 2. משימה א' — אימות Summary Endpoints + עדכון SSOT (1.2.1)

**מה לעשות:**

1. **לאמת בפועל** (הרצה/בדיקה) שהנתיבים הבאים מגיבים כראוי:
   - `GET /api/v1/trading_accounts/summary`
   - `GET /api/v1/brokers_fees/summary`
   - `GET /api/v1/cash_flows/summary` (אם קיים כנתיב נפרד)
   - `GET /api/v1/cash_flows/currency_conversions`
2. **לאחר אימות** — לעדכן OpenAPI / מסמך SSOT כך שכל ה-Endpoints (Summary + Conversions) מתועדים ומסומנים כ-Option A.

**תוצר מבוקש:** דיווח ב-`_COMMUNICATION/team_20/` — אילו endpoints אומתו, וקישור למפרט/OpenAPI המעודכן.

**אפשרות:** לבקש מ-Team 50 הרצת בדיקות API לאימות הפורמלי (אופציונלי).

---

## 3. משימה ב' — Auth Contract + עדכון SSOT/OpenAPI

**מה לעשות:**

1. **חוזה Response אחיד** בכל auth endpoints:
   - שדות: `access_token`, `token_type`, `expires_at`, `user` (או כפי שמוגדר בחוזה).
   - Endpoints: `/auth/login`, `/auth/register`, `/auth/refresh`, `/users/me`, `/users/profile`.
2. **עדכון SSOT/OpenAPI** — המפרט ישקף את המבנה האחיד; אין סטיות בין קוד למפרט.

**מקור מפורט:** `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_AUTH_CONTRACT_AND_SSOT_MANDATE.md`

**תוצר מבוקש:** דיווח ב-`_COMMUNICATION/team_20/` — אימות חוזה, קבצים/מפרט שעודכנו.

---

## 4. משימה ג' — PDSC Boundary Contract ✅ החלטה התקבלה

**סטטוס:** **הודעת Team 90 אושרה על ידי האדריכלית.**

**Scope מאושר:** **שלושת הרכיבים המלאים** — JSON Error Schema, Response Contract, Error Codes Enum (תיאום עם Team 30 לפני סיום).

**מה נדרש מכם:**
- **שלד מחייב + דוגמאות (SSOT)** — נמסר על ידי Team 90 ואושר על ידי האדריכלית. **מיקום:** `documentation/01-ARCHITECTURE/TT2_PDSC_BOUNDARY_CONTRACT.md` — סעיף **"שלד מחייב (Team 90)"** (כולל Error Schema, Response Contract, Error Codes Enum, Auth Contract).
- **הודעה רשמית עם Acceptance Criteria:** `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_PDSC_AUTH_SKELETON_SSOT_DELIVERY.md`.
- **להמשיך לביצוע** לפי השלד והמנדט; לעדכן OpenAPI/SSOT בהתאם. אם נדרש — Team 90 יספק בדיקה מהירה מול הקוד.

---

## 5. סדר ביצוע מומלץ

| סדר | משימה | תלות |
|-----|--------|------|
| 1 | **משימה א'** — אימות Summary + עדכון OpenAPI/SSOT | אין |
| 2 | **משימה ב'** — Auth Contract + OpenAPI | אין |
| 3 | **משימה ג'** — PDSC | ✅ החלטה התקבלה — 3 רכיבים מלאים; להמשיך לביצוע |

---

## 6. דיווח

כל השלמה — דיווח ל-Team 10 ב-`_COMMUNICATION/team_20/` (מסמך עם תיאור בוצע + קישורים).

---

**Team 10 (The Gateway)**  
**log_entry | TEAM_10 | TO_TEAM_20_BACKEND_TASKS_EXECUTION_MANDATE | 2026-02-12**

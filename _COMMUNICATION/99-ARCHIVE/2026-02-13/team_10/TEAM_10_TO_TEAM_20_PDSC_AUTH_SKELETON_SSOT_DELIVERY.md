# Team 10 → Team 20: ✅ PDSC Boundary + Auth Contract — שלד מחייב + דוגמאות (SSOT)

**מאת:** Team 10 (The Gateway)  
**אל:** Team 20 (Backend & DB)  
**תאריך:** 2026-02-12  
**נושא:** שלד מחייב ודוגמאות למימוש — נמסר מצוות 90 ואושר על ידי האדריכלית

---

## 1. מקור

הודעת Team 90 (PDSC Boundary + Auth Contract — שלד מחייב + דוגמאות) **אושרה על ידי האדריכלית.**  
נדרש להשלים PDSC Boundary Contract + Auth Contract **בתיעוד SSOT/OpenAPI** לפי השלד המדויק להלן.

---

## 2. מיקום SSOT — שלד מחייב

**קובץ:** `documentation/01-ARCHITECTURE/TT2_PDSC_BOUNDARY_CONTRACT.md`  
**סעיף:** **"שלד מחייב (Team 90 — SSOT למימוש מהיר)"**

הסעיף כולל:

- **A. Error Schema (JSON Error)** — מבנה מחייב: `error_code`, `detail`, `field_errors`, `trace_id` (אופציונלי).
- **B. Response Contract (Success)** — מבנה מחייב: `status: "ok"`, `data`, `meta` (page, page_size, total).
- **C. Error Codes Enum (SSOT)** — רשימת קודים: VALIDATION_INVALID_FORMAT, AUTH_INVALID_TOKEN, AUTH_EXPIRED_TOKEN, RESOURCE_NOT_FOUND, PERMISSION_DENIED, SERVER_ERROR.
- **D. Auth Contract** — Auth Response מחייב: `access_token`, `token_type`, `expires_at`, `user` (id, email, role, user_tier).  
  Endpoints: `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh`, `GET /users/me`, `GET /users/profile`.

---

## 3. Acceptance Criteria (חובה)

| # | קריטריון |
|---|----------|
| 1 | Error Schema אחיד בכל endpoint. |
| 2 | Success Contract אחיד בכל endpoint. |
| 3 | Auth responses זהים בכל זרימה. |
| 4 | OpenAPI/SSOT מעודכן לפי השלד. |
| 5 | אם נדרש — Team 90 יספק בדיקה מהירה מול הקוד. |

---

## 4. פעולה נדרשת

1. **מימוש** — Backend (API) מתאים לשלד ב-`TT2_PDSC_BOUNDARY_CONTRACT.md` (סעיף שלד מחייב).
2. **תיעוד** — עדכון OpenAPI/מסמך חוזים כך שישקף את השלד והדוגמאות.
3. **דיווח** — השלמה ודיווח ל-Team 10 ב-`_COMMUNICATION/team_20/` (כולל קישור ל-OpenAPI/SSOT המעודכן).

---

## 5. הפניות

| מסמך | נתיב |
|------|------|
| **שלד מחייב (PDSC + Auth)** | documentation/01-ARCHITECTURE/TT2_PDSC_BOUNDARY_CONTRACT.md — סעיף "שלד מחייב (Team 90)" |
| מנדט PDSC מפורט | _COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_PDSC_BOUNDARY_CONTRACT_MANDATE.md |
| מנדט ביצוע Backend | _COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_BACKEND_TASKS_EXECUTION_MANDATE.md |

---

**Team 10 (The Gateway)**  
**log_entry | TEAM_10 | TO_TEAM_20_PDSC_AUTH_SKELETON_SSOT_DELIVERY | 2026-02-12**

# SSOT: Auth Guards, מיפוי A/B/C/D והתמדת Header

**id:** `TT2_AUTH_GUARDS_AND_ROUTE_SSOT`  
**owner:** Team 10 (The Gateway)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None  
**last_updated:** 2026-02-12  
**version:** v1.1 (יישור ל-ADR-013)  
**מקור מחייב:** **ADR-013** (פסיקה אדריכל — ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT). מסמך זה מפרט ו**מפנה** ל-ADR-013 כ-SSOT מקור.

---

## 1. מקור SSOT — ADR-013

**החלטת האדריכל (ADR-013):** מודל האוטנטיקציה המרובע A/B/C/D.

| טיפוס | הגדרה (ADR-013) |
|-------|------------------|
| **A) Open** | ציבורי (Login, Register, Reset-Password). Header מוסתר. |
| **B) Shared** | משותף (Home). Container שיווקי לאורח / נתונים למחובר. |
| **C) Auth-only** | מוגן (D16, D18, D21). אורח מופנה ל-Home (Redirect). |
| **D) Admin-only** | מנהלים (/admin/design-system). בדיקת JWT Role. |

**רפרנס מקור:** `_COMMUNICATION/team_10/ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md` (id: ADR-013).

---

## 2. טיפוסי Routes (A/B/C/D) — מפורט (תואם ADR-013)

| טיפוס | הגדרה | התנהגות |
|-------|--------|----------|
| **A** | Open | גישה חופשית; Header **לא מוצג**. (Login, Register, Reset-Password.) |
| **B** | **Shared (Home)** | **עמוד יחיד עם שני Containers** — Guest (אורח) + Logged-in (מחובר). **אין Redirect** לאורח; אורח רואה Guest Container, מחובר רואה Logged-in. |
| **C** | Auth-only | דורש התחברות; אורח **מופנה ל-Home** (לא ל-/login). (D16, D18, D21, Profile.) |
| **D** | **Admin-only (JWT role)** | גישה **רק למנהל** — מקור הרשאה: **JWT (שדה role)**. אורח → הפניה ל-Home; משתמש מחובר לא מורשה → **הודעת חסימה** (אין הרשאה). (למשל /admin/design-system.) |

---

## 3. יישום מחייב

- **Redirect אורח (C):** `ProtectedRoute.jsx` — אורח ב-route auth-only מפנה ל-**Home** (לא ל-/login).  
- **Type B (Shared):** Home = עמוד יחיד; שני containers; אין Redirect לאורח; אין ProtectedRoute על Home.  
- **הודעת חסימה (D):** משתמש מחובר לא מורשה ב-Admin-only — `.auth-block-message` (D15_IDENTITY_STYLES.css); הצגת הודעה (לא redirect).  
- **Profile:** `/profile` — טיפוס **C (Auth-only)**. ראה [TT2_DECISION_PROFILE_ROUTE.md](./TT2_DECISION_PROFILE_ROUTE.md).

---

## 4. Header Persistence (התמדת Header)

- **עקרון:** Header **תמיד** קיים בכל עמוד שאינו Open (לא בתוך Auth Open pages).  
- **מקור יחיד:** `unified-header.html`; טעינה דינמית דרך `header-loader.js`.  
- **מפרט מלא:** [TT2_HEADER_BLUEPRINT.md](./TT2_HEADER_BLUEPRINT.md).

---

## 5. רפרנסים

- **ADR-013 (SSOT מקור):** `_COMMUNICATION/team_10/ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md`
- Profile Route: [TT2_DECISION_PROFILE_ROUTE.md](./TT2_DECISION_PROFILE_ROUTE.md)
- Header: [TT2_HEADER_BLUEPRINT.md](./TT2_HEADER_BLUEPRINT.md)
- דוח קונסולידציה: `_COMMUNICATION/team_10/CONSOLIDATION_BATCH_2.md`

---

**Team 10 (The Gateway)**  
**log_entry | TT2_AUTH_GUARDS_AND_ROUTE_SSOT | V1.1 | ALIGNED_TO_ADR_013 | 2026-02-12**

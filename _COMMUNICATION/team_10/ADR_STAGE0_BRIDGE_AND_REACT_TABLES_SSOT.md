# 🔒 ADR / SSOT — Stage 0 (React↔HTML Bridge) + React Tables

**מאת:** Team 10 (The Gateway) — לפי מנדט Team 90  
**תאריך:** 2026-02-10  
**סטטוס:** 🔒 **נעול — אין חלופות**  
**הקשר:** סגירה סופית בסבב אחד (Blocking)

---

## 1. Stage 0 — React↔HTML Bridge (Blocking)

**שלב 0 חובה לפני כל סעיף אחר.** אין קידוד React Tables ואין מעבר לשלב 1 לפני השלמת Stage 0.

### 1.1 Hybrid Model (נעול)

| סוג | טכנולוגיה | דוגמאות |
|-----|------------|---------|
| **D16 / D18 / D21** | **HTML** | trading_accounts.html, brokers_fees.html, cash_flows.html |
| **Auth / Home / Admin** | **React** | Login, Register, Reset-password, Home, /admin/* |

### 1.2 Redirect Rules (ADR‑013)

| טיפוס | כלל |
|--------|------|
| **C** (Auth-only) | אורח → **Home** (לא /login). |
| **A** (Open) | **No Header** — login, register, reset-password. |
| **B** (Shared) | **Home** — logged-out container (שיווקי) + logged-in. |
| **D** (Admin-only) | **Role-based** — JWT role; אחר → redirect/403. |

### 1.3 routes.json (נעול)

- **להסיר:** `login.html`, `register.html` מנתיבי auth.
- **להתאים ל־React routes:** `/login`, `/register`, `/reset-password` (ללא .html).
- **מקור:** `ui/public/routes.json` — SSOT ל־routes; חייב לשקף את ה־React routes בפועל.

### 1.4 Header Path (נעול)

- **נתיב יחיד:** `ui/src/views/shared/unified-header.html`.
- אין הפניות לנתיבים חלופיים (למשל `ui/src/components/core/unified-header.html`).

### 1.5 React Tables (נעול — SSOT)

- **React Tables נטענות רק דרך TablesReactStage ב־UAI.**
- **אין mount per page.** אין חריגים.
- **TablesReactStage רץ אחרי DataStage.**

---

## 2. React Tables Root Strategy (נעול — Option B בלבד)

**החלטה:** **UAI TablesReactStage בלבד.**

| כלל | תיאור |
|------|--------|
| **TablesReactStage only** | טעינת ו־mount של טבלאות React מתבצע **רק** בשלב TablesReactStage ב־UAI. |
| **No mount per page** | אסור mount נפרד per page (סקריפט mount ייעודי לעמוד). |
| **After DataStage** | TablesReactStage רץ **אחרי** DataStage. |
| **No exceptions** | אין חלופות ואין ניסוחים פתוחים. |

**מסמכים כפופים:**  
`TEAM_10_REACT_TABLES_MINI_WORK_PLAN.md`, `TEAM_10_REACT_TABLES_MAPPING_DOCUMENT.md`, תוכנית העבודה הכללית — כולם חייבים להפנות למסמך זה (SSOT) ו־לעמוד בהחלטות לעיל.

---

## 3. Acceptance Criteria (סגירה בסבב אחד)

- [x] מופיע במסמך SSOT/ADR: **TablesReactStage only**.
- [x] Stage 0 מוגדר כ־**Blocking** ונכנס לתוכנית הכללית **קודם לכל שלב אחר**.
- [x] **routes.json** — עודכן: auth routes = /login, /register, /reset-password (ללא .html). **Header Path** — נעילה על unified-header.html (תיעוד ב־SSOT; ביצוע: וידוא בקוד).
- [ ] **Redirect rules** תואמים ADR‑013 (ביצוע: קוד + אימות).
- [x] **אין חלופות או ניסוחים פתוחים** בתוכנית — Mini Work Plan ו־Mapping Document מעודכנים ונעולים.

---

**Team 10 (The Gateway)**  
**log_entry | ADR_STAGE0_BRIDGE_REACT_TABLES_SSOT | LOCKED | 2026-02-10**

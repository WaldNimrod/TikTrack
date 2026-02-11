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

## 3. שער אוטנטיקציה — מודל 4 טיפוסים (ADR‑013, נעול)

**Shared Pages (Type B) = טיפוס רשמי במודל האוטנטיקציה (חובה בתוכנית העבודה), לא רק פרשנות UI.**

| טיפוס | הגדרה | Header | התנהגות |
|--------|--------|--------|----------|
| **A) Open** | Login / Register / Reset-Password | **מוסתר** | אין Header. |
| **B) Shared** | **עמוד יחיד עם שני Containers** — רשמי | מוצג | **אורח:** Guest Container. **מחובר:** Logged-in Container. **אין Redirect** לאורח (בניגוד ל‑Type C). |
| **C) Auth-only** | כל שאר העמודים (D16, D18, D21 וכו') | מוצג | אורח **מופנה ל־Home** (לא ל־/login). |
| **D) Admin-only** | /admin/design-system | מוצג | בדיקת **role מתוך JWT**; אחר → redirect/403. |

- **User Icon:** Success למחובר, Warning לא מחובר; **אסור שחור**.  
- **Header Persistence:** חייב להיות **תמיד** (מלבד טיפוס A).

### 3.1 דרישות יישום — Shared Pages (Type B) (חובה)

- **Auth Guard** מבחין בין A/B/C/D.  
- **Type B:** Allowed לכל המשתמשים + **render לפי auth state** (אורח ↔ מחובר).  
- **Type C:** אורח → **Home** (redirect).  
- **UI Composition:** שני containers **באותו עמוד**; **אין עמודים נפרדים** לאורח ולמחובר.  
- **בדיקות חובה:**  
  - אורח רואה **Guest Container בלבד**.  
  - מחובר רואה **Logged-in Container בלבד**.  
  - **Login → Home** מחליף תצוגה (מעבר מ־Guest ל־Logged-in).  
  - **אין Redirect** ב‑Type B (אורח נשאר באותו route ורואה Guest Container).

---

## 4. React vs HTML Bridge — Stage 0 (Blocking)

- **שלב 0 ראשון** אחרי המיפוי, **לפני כל שלב אחר**.  
- **אין מימוש React Tables** לפני סגירת Stage 0.  
- **Header נטען לפני React mount.**  
- **routes.json** מיושר: /login, /register, /reset-password (ללא .html).  
- **איסור:** Header **בתוך Containers** (מניעת SSR כפול).

---

## 5. החלטות ADR‑013 שהוטמעו (חובה בתוכנית + SSOT)

| החלטה | תיאור |
|--------|--------|
| **TipTap** | Rich Text — **TipTap** נבחרה. |
| **Broker List** | API **GET /api/v1/reference/brokers**. |
| **DNA_BUTTON_SYSTEM.md** | Team 40 מפיק תוך 24h (עם אישור אדריכלית). |
| **/admin/design-system** | Type D (Admin-only). |

**מקור:** `ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md` (ADR‑013).

---

## 6. תיקונים ויזואליים ותפקודיים (חובה בתוכנית — סעיפים נפרדים)

כל סעיף להלן **חייב** להיכנס לתוכנית העבודה כסעיף נפרד, עם **Required Actions** + **Acceptance Criteria**.

| # | נושא | Required Action (עיקרי) | Acceptance |
|---|------|--------------------------|------------|
| 6.1 | **שדות Select במקום Text** | ברוקר, סוג תזרים, חשבון מסחר — **דינאמי** + תואם Data Map. | שדות רלוונטיים כ־Select; נתונים מ־API/Data Map. |
| 6.2 | **שדות תיאור/הערה = Rich Text** | TipTap (ADR‑013). | אין שדה טקסט פשוט לתיאור/הערה; TipTap בשימוש. |
| 6.3 | **כפתורים RTL** | Cancel **לפני** Confirm. מחלקות אחידות בלבד. | סדר כפתורים RTL; שימוש ב־DNA_BUTTON_SYSTEM בלבד. |
| 6.4 | **רקע כותרת מודל** | צבע **בהיר** לפי ישות. | כותרת מודל עם צבע entity; Button System SSOT. |
| 6.5 | **Button System SSOT** | Team 40 (עם אישור אדריכלית). | DNA_BUTTON_SYSTEM.md מעודכן; כל הכפתורים תואמים. |
| 6.6 | **Design Admin Dashboard** | /admin/design-system, Type D (Admin-only). | עמוד נגיש רק למנהל; JWT role. |
| 6.7 | **Header נעלם אחרי Login** | **תקלה קריטית — תיקון ראשון.** Header חייב להישאר אחרי מעבר Login → Home. | Header מוצג אחרי login; Header Loader לפני React mount. |

---

## 7. קבצים מרכזיים להפניה (SSOT & Mandates)

| קובץ | שימוש |
|------|--------|
| **ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md** | ADR‑013 — החלטות אדריכלית. |
| **ARCHITECT_PRE_CODING_MAPPING_MANDATE.md** | Pre‑coding Mapping — BLOCKING. |
| **TT2_SLA_TEAMS_30_40.md** | SLA 30/40 — תפקידים ומגבלות. |
| **ADR_STAGE0_BRIDGE_AND_REACT_TABLES_SSOT.md** | **מסמך זה** — נעילה Stage 0 + React Tables (Option B). |

---

## 8. Acceptance Criteria (סגירה בסבב אחד)

- [x] מופיע במסמך SSOT/ADR: **TablesReactStage only**.
- [x] Stage 0 מוגדר כ־**Blocking** ונכנס לתוכנית הכללית **קודם לכל שלב אחר**.
- [x] **routes.json** — עודכן: auth routes = /login, /register, /reset-password (ללא .html). **Header Path** — נעילה על unified-header.html (תיעוד ב־SSOT; ביצוע: וידוא בקוד).
- [ ] **Redirect rules** תואמים ADR‑013 (ביצוע: קוד + אימות).
- [x] **אין חלופות או ניסוחים פתוחים** בתוכנית — Mini Work Plan ו־Mapping Document מעודכנים ונעולים.
- [x] **User Icon rules** — Success/Warning; אסור שחור (מתועד ב‑SSOT).
- [x] **Header תמיד** (מלבד A) — מתועד ב‑SSOT.
- [x] **routes.json** מיושר ל־/login, /register, /reset-password.

---

**Team 10 (The Gateway)**  
**log_entry | ADR_STAGE0_BRIDGE_REACT_TABLES_SSOT | LOCKED | 2026-02-10**

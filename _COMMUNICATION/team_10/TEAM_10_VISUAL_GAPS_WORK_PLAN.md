# תוכנית עבודה מאוחדת: סבב חוסרים ויזואליים + שער אוטנטיקציה — Team 10

**id:** `TEAM_10_VISUAL_GAPS_WORK_PLAN`  
**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-10  
**מקור:** `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_ADDITIONAL_VISUAL_GAPS_TASKS.md` (כל הסעיפים והתת־סעיפים)  
**סטטוס:** 🔒 **ADR‑013 LOCKED — MAPPING_MODE (Pre‑coding חוסם)**  
**תאימות:** PHOENIX_MASTER_BIBLE, CURSOR_INTERNAL_PLAYBOOK, TT2_QUALITY_ASSURANCE_GATE_PROTOCOL, TT2_DESIGN_FIDELITY_FIX_PROTOCOL, GIN_004, TEAM_50_QA_WORKFLOW_PROTOCOL, **TT2_SLA_TEAMS_30_40**  

**הפעלה מחייבת:** `TEAM_90_TO_TEAM_10_ADR_013_SLA_ACTIVATION_MANDATE.md` — הודעה מרכזית אחת; החלטות ADR‑013 ושלב המיפוי המקדים מחייבים. **אין קידוד לפני** קובצי מיפוי + אישור ויזואלי (נמרוד). דוח עדכון ל‑Team 90 לפני פנייה לאדריכלית.

**סטטוס שער א':** ✅ **Gate A מאושר** (2026-02-10) — Passed 11, Failed 0, 0 SEVERE. SSOT: `TEAM_10_GATE_A_FINAL_APPROVAL_AND_STATUS.md`.  
**סטטוס שער ב':** ✅ **Gate B מאושר** (2026-02-11) — E2E 5/5, Round-trip BE PASS. SSOT: `TEAM_10_GATE_B_APPROVAL_AND_STATUS.md`. הצעד הבא: שער ג' (אישור ויזואלי) / Design Fidelity לפי נוהל.

---

## 1. מטרה ועקרונות

- **מטרה:** (א) **שער אוטנטיקציה** — חלוקת כל העמודים במערכת ל־**4 טיפוסי אוטנטיקציה** (A/B/C/D) ויישום לוגיקת גישה ו־UI. (ב) סגירת כל החוסרים וה־Visual Gaps לפי מסמך Team 90 — **כל הסעיפים והתת־סעיפים** מהמסמך כלולים בתוכנית.
- **עקרונות:**  
  - **סעיף ראשון בתוכנית:** שער אוטנטיקציה (4 טיפוסים) — **חובה** לפני יתר המשימות.  
  - **בדיקות מקדימות לכל משימה:** וידוא שיש כל המידע, ההחלטות והפרטים לביצוע מסודר ומלא **לפני** כתיבת קוד; מיפוי/דוקומנטציה מלאה ככל שנדרש; חסר מידע או שאלה פתוחה → מתועד ומועבר להחלטת אדריכל.  
  - שערים (Gate A → Gate B → Design Fidelity) לפי נהלים.

---

## 2. רפרנסים מחייבים

| מסמך | שימוש |
|------|--------|
| `TEAM_90_TO_TEAM_10_ADDITIONAL_VISUAL_GAPS_TASKS.md` | מקור **כל** המשימות (1–7 + Auth Page Types) — סעיפים ותת־סעיפים |
| `TEAM_90_TO_TEAM_30_AUTH_ACCESS_UI_REQUIREMENTS.md` | הרחבת שער אוטנטיקציה, כללי Header ו־User Icon |
| `ui/public/routes.json` | SSOT ל־routes; רשימת עמודים קיימים |
| `documentation/01-ARCHITECTURE/TT2_OFFICIAL_PAGE_TRACKER.md` | מטריצת עמודים, D15/D16/D18/D21 |
| `documentation/05-PROCEDURES/TT2_QUALITY_ASSURANCE_GATE_PROTOCOL.md` | שערי איכות, מסירת קונטקסט ל־QA |
| `documentation/09-GOVERNANCE/standards/TT2_DESIGN_FIDELITY_FIX_PROTOCOL.md` | דיוק עיצוב, Visionary |
| `documentation/09-GOVERNANCE/standards/TEAM_50_QA_WORKFLOW_PROTOCOL.md` | בדיקות Team 50 |
| `documentation/09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md` | SSOT, Transformation Layer |
| `ui/src/styles/phoenix-base.css` | SSOT למשתני CSS, entity colors |
| **`ARCHITECT_PHASE_2_FINAL_CONSOLIDATED_VERDICT.md`** | **SSOT להחלטות אדריכלית — Auth Model** |
| **`ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md`** | **ADR‑013 LOCKED** — Auth 4‑Type, TipTap, Broker API, Admin JWT, Design route, User Icon, Header Loader |
| **`ARCHITECT_PRE_CODING_MAPPING_MANDATE.md`** | **Pre‑coding Mapping — BLOCKING** (אין קידוד לפני מיפוי + אישור נמרוד) |
| **`documentation/05-PROCEDURES/TT2_SLA_TEAMS_30_40.md`** | **SLA 30/40** — 40=Presentational, 30=Containers/Logic/API; איסור API בתיקיות UI |
| **`ADR_STAGE0_BRIDGE_AND_REACT_TABLES_SSOT.md`** | **SSOT נעילה** — Stage 0 Blocking, React Tables (TablesReactStage בלבד), Auth 4-Type, תיקונים ויזואליים (§6) |

### 2.1 Auth Model — החלטות ADR‑013 (LOCKED)

**מסמכי מקור:** `ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md` (ADR‑013), `ARCHITECT_PHASE_2_FINAL_CONSOLIDATED_VERDICT.md`.

**החלטות מחייבות (LOCKED):**
- **A) Open:** /login, /register, **/reset-password** — Header מוסתר.
- **B) Shared:** עמוד יחיד עם שני Containers (Guest + Logged-in); אין Redirect לאורח. חובה בתוכנית — ראה §4 ו־ADR SSOT §3.1.
- **C) Auth-only:** D16, D18, D21 — אורח → Home.
- **D) Admin-only:** **/admin/design-system** — מקור role: **JWT (שדה role)**; אחר → redirect/403.
- User Icon: **Success / Warning** בלבד (אסור שחור).
- **Header Loader:** חייב לרוץ **לפני** React mount.
- **Rich‑Text:** TipTap (Headless UI).
- **Broker List:** API **GET /api/v1/reference/brokers**.
- **Buttons:** Team 40 מפיק **DNA_BUTTON_SYSTEM.md** תוך 24 שעות.

---

## 3. סדר ביצוע (מאוחד)

**🔒 Stage 0 = Blocking — קודם לכל שלב אחר.**  
**SSOT:** `_COMMUNICATION/team_10/ADR_STAGE0_BRIDGE_AND_REACT_TABLES_SSOT.md`.  
**איסור:** Header **בתוך Containers** (מניעת SSR כפול). **Header נטען לפני React mount.**

| שלב | נושא | הערה |
|-----|------|------|
| **‑1** | **Pre‑coding Mapping** | ✅ **סגור** — DATA_MAP_FINAL, CSS_RETROFIT_PLAN, DNA_BUTTON_SYSTEM/PALETTE_SSOT, ROUTES_MAP. ראה `TEAM_10_MAPPING_MODE_CLOSURE_NOTICE.md`. |
| **0** | **גשר React/HTML (Bridge) — BLOCKING** | **חובה לפני כל סעיף אחר.** Hybrid: D16/D18/D21=HTML, Auth/Home/Admin=React. Redirect (ADR‑013): C→Home, A=No Header, B=Home Shared, D=JWT role. routes.json: /login, /register, /reset-password (ללא .html). Header: unified-header.html בלבד. React Tables: **רק** דרך TablesReactStage ב‑UAI — ראה `ADR_STAGE0_BRIDGE_AND_REACT_TABLES_SSOT.md`, `TEAM_10_REACT_TABLES_MINI_WORK_PLAN.md`, `TEAM_90_REACT_HTML_BRIDGE_FINDINGS_DRAFT.md`. |
| **1** | **שער אוטנטיקציה — 4 טיפוסים (A/B/C/D)** | ADR‑013 LOCKED. |
| 2 | Header תמיד אחרי Login → Home (משימה 7) | Header Loader לפני React mount — חסימת UX |
| **שער א'** | **Gate A — אושר** | ✅ Passed 11, Failed 0, 0 SEVERE. ראה `TEAM_10_GATE_A_FINAL_APPROVAL_AND_STATUS.md`. |
| 3 | Select vs Text + Rich Text (משימות 1, 2) | ✅ Broker API, TipTap, Rich-Text, Design System — הושלמו. |
| 4 | סדר כפתורים במודל + RTL (משימה 3) | ✅ |
| 5 | צבע כותרת מודל לפי Entity (משימה 4) | ✅ |
| 6 | תקנון כפתורים גלובלי (משימה 5) | ✅ DNA_BUTTON_SYSTEM |
| 7 | דף טבלת צבעים דינמית (משימה 6) | ✅ **/admin/design-system** (Type D) |
| **שער ב'** | **Gate B — אושר** | ✅ E2E 5/5, Round-trip BE PASS (2026-02-11). ראה `TEAM_10_GATE_B_APPROVAL_AND_STATUS.md`. הצעד הבא: שער ג' / Design Fidelity. |

---

## 4. סעיף 1 (ראשון): שער אוטנטיקציה — חלוקת העמודים ל־4 טיפוסים

**מקור:** `TEAM_90_TO_TEAM_10_ADDITIONAL_VISUAL_GAPS_TASKS.md` — "🔐 Auth Page Types + Redirect Rules"; הרחבת טיפוס **D) Admin-only** (הנחיית מנהל).  
**החלטה נעולה:** **Shared Pages (Type B)** = טיפוס **רשמי** במודל האוטנטיקציה (חובה בתוכנית העבודה), לא רק פרשנות UI. ראה `ADR_STAGE0_BRIDGE_AND_REACT_TABLES_SSOT.md` §3 ו־§3.1.

### 4.1 הגדרת הטיפוסים (חובה)

| טיפוס | הגדרה | Header | התנהגות |
|--------|--------|--------|----------|
| **A) Open** | ציבורי — זמין לכולם | **לא מוצג** | login, register, forgot-password (reset-password) |
| **B) Shared** | **עמוד יחיד עם שני Containers** — טיפוס רשמי | מוצג | **אורח:** Guest Container. **מחובר:** Logged-in Container. **אין Redirect** לאורח (בניגוד ל‑C). |
| **C) Auth-only** | דורש התחברות | מוצג | כל עמוד שלא ב־A/B/D — אורח **מופנה ל־Home** (לא ל־/login) |
| **D) Admin-only** | למשתמש מנהל בלבד | מוצג | רק משתמש עם תפקיד מנהל; אחר — הפניה (ל־Home או 403 לפי החלטה) |

### 4.2 כללי User Icon (Header) — ממסמך Team 90

- **Logged-in:** צבע success.  
- **Logged-out:** צבע warning.  
- **אסור:** אייקון שחור (black) — כל מופע = פגם.

### 4.3 Required Actions (מסמך + השלמות)

- **Auth Guard** מבחין בין A/B/C/D.  
- **Type B (Shared):** Allowed לכל המשתמשים + **render לפי auth state**; שני containers **באותו עמוד**; **אין עמודים נפרדים**; **אין Redirect** לאורח.  
- לבטל הגנת Home (לא ProtectedRoute על Home).  
- ליישם רינדור משותף לפי מצב auth (Guest Container / Logged-in Container).  
- אורח שנכנס לעמוד **auth-only (C)** → **הפניה ל־Home**.  
- לאכוף לוגיקת צבע User Icon (success / warning; לא black).  
- **טיפוס D:** להגדיר אילו routes הם admin-only; ליישם בדיקת תפקיד ו־redirect/403.

### 4.3.1 דרישות יישום — Shared Pages (Type B) (חובה)

- שני containers **באותו עמוד** (Guest + Logged-in); אין עמודים נפרדים.  
- **בדיקות חובה:** אורח רואה Guest Container בלבד; מחובר רואה Logged-in בלבד; Login → Home מחליף תצוגה; **אין Redirect** ב‑B.

### 4.4 Acceptance Criteria (מסמך)

- **Type B (Shared):** Home = עמוד יחיד; אורח רואה Guest Container בלבד; מחובר רואה Logged-in בלבד; Login → Home מחליף תצוגה; **אין Redirect** לאורח ב‑B.  
- Home נגיש תמיד (אורח + מחובר) ומציג container נכון למצב.  
- ניווט אורח לעמוד auth-only (C) מפנה ל־Home.  
- Header תמיד קיים (מלבד עמודי Open).  
- User Icon תמיד success או warning (לעולם לא black).  
- עמודי Admin-only נגישים רק למנהל; אחר — הפניה/403.

### 4.5 Code Evidence (מסמך — לטפל)

- `ui/src/router/AppRouter.jsx` — Home כרגע ב־ProtectedRoute (שגוי).  
- `ui/src/cubes/identity/components/auth/ProtectedRoute.jsx` — מפנה ל־/login (שגוי; נדרש ל־Home).  
- `ui/src/components/HomePage.jsx` — חסר logged-out container.  
- `unified-header.html` / `phoenix-header.css` — אייקון ברירת מחדל שחור (להסיר).

### 4.6 רשימת כל העמודים הקיימים במערכת (סקופ מלא)

מקור: `ui/public/routes.json` + `TT2_OFFICIAL_PAGE_TRACKER`.

**טבלת Routes רשמית (לעדכון SSOT — ראה דוח השלמה פריט 2). Shared (Type B) = טיפוס רשמי במודל — מופיע בטבלה.**

| Route | קובץ / רכיב | טיפוס | הערה |
|-------|-------------|--------|------|
| / | **index.html** | **B) Shared** | **Home = `/` = index.html** — עמוד יחיד, שני Containers (Guest + Logged-in); אין Redirect לאורח. (SSOT מפורש) |
| /login | login.html | **A) Open** | |
| /register | register.html | **A) Open** | |
| **/reset-password** | **PasswordResetFlow.jsx** (blueprint: D15_RESET_PWD.html) | **A) Open** | **ADR‑013 LOCKED** — מאושר כ־Open; Header מוסתר. |
| /profile (או path פרופיל) | D15_PROF_VIEW | **C) Auth-only** | עמוד פרופיל משתמש — למשתמשים רשומים בלבד. החלטה: `TEAM_10_DECISION_PROFILE_ROUTE.md`. |
| /trading_accounts | trading_accounts.html (D16) | **C) Auth-only** | |
| /brokers_fees | brokers_fees.html (D18) | **C) Auth-only** | |
| /cash_flows | cash_flows.html (D21) | **C) Auth-only** | |
| /trade_plans | trade_plans.html | **C) Auth-only** | |
| /trades_history | trades_history.html | **C) Auth-only** | |
| **/admin/design-system** | Design Admin Dashboard (צבעים + כפתורים) | **D) Admin-only** | **ADR‑013 LOCKED** — route רשמי; מקור role: **JWT (שדה role)**. |

**טיפוס D (Admin-only):** מקור הרשאות: **JWT (שדה role)**. אורח/לא־מנהל → redirect או 403 לפי החלטה. צוות 10 מוציא הנחיות לצוותים בהתאם ל־SLA 30/40.

### 4.7 בדיקות מקדימות לשער 0

- [x] וידוא רשימת עמודים מלאה (כל ה־routes + דאשבורד/פרופיל) — **בוצע:** טבלה רשמית ב־§4.6; התאמה ל־`ui/public/routes.json`.  
- [ ] החלטת אדריכל: מיפוי סופי A/B/C/D לכל עמוד; התנהגות redirect ל־D (Home vs 403).  
- [x] מיפוי ותיעוד: **מטריצת route→טיפוס רשמית:** §4.6 במסמך זה (טבלת Routes). עדכון routes.json/SSOT — לפי צורך.  
- [ ] רק לאחר מכן: יישום קוד (Guard, redirect, Home containers, User Icon).

### 4.8 משימות משנה ואחראים

| שלב | פעולה | אחראי |
|-----|--------|--------|
| 0.1 | השלמת מידע/החלטה — מיפוי A/B/C/D לכל עמוד | אדריכל / Team 10 |
| 0.2 | תיעוד מטריצה + עדכון routes/SSOT | Team 10 |
| 0.3 | יישום לוגיקת גישה (Guard, redirect, Home containers, User Icon) | Team 30 |
| 0.4 | יישום בדיקת תפקיד ל־Admin-only (D) | Team 20 + 30 |
| 0.5 | QA — E2E וולידציה | Team 50 |

---

## 5. משימות ויזואליות (מסמך — כל הסעיפים והתת־סעיפים)

**נעילה ב‑SSOT:** כל הסעיפים להלן תואמים ל־`ADR_STAGE0_BRIDGE_AND_REACT_TABLES_SSOT.md` §6 (תיקונים ויזואליים ותפקודיים). חובה כסעיפים נפרדים עם Required Actions + Acceptance Criteria.

### משימה 7: Header תמיד אחרי Login → Home (Critical — **תיקון ראשון**)

**דרישה (מסמך):** Header מוצג תמיד מלבד login/register/reset-password; **תקלה קריטית:** Header נעלם אחרי Login → תיקון **ראשון** בתעדוף.

**Required Actions (מסמך):**  
- לתקן זרימת טעינת Header כך ש־Header תמיד קיים.  
- לוולידט ב־מעבר login → home.

**Acceptance Criteria:**  
- Header תמיד קיים בכל העמודים שאינם auth (Open).

**בדיקות מקדימות:**  
- [ ] תיעוד זרימת Header (קבצים, layout); איתור נקודת כשל.  
- [ ] וידוא שאין חוסר מידע — אחרת העברה לאדריכל.

**אחראי:** Team 30 (קוד); Team 10 (תיעוד); Team 50 (ולידציה).

---

### משימה 1: Text Fields vs Select Fields (Add/Edit Modules)

**דרישה (מסמך):** שדות חייבים להתאים לטיפוס קלט (dropdown vs text). Broker כ־**dynamic select** ממקור רשימת ברוקרים תקפה.

**Code Evidence (מסמך):**  
- `tradingAccountsForm.js` — Broker כ־text input (שגוי).  
- `brokersFeesForm.js` — Broker כ־text input (שגוי).  
- `cashFlowsForm.js` — trading account + flow type כ־select (ok); description כ־textarea (ראו משימה 2).

**Required Actions:**  
- להחליף שדות broker ב־**dynamic select** ממקור רשימה תקפה.  
- ליישר את כל מודולי הוספה/עריכה ל־SSOT/Blueprint.

**Acceptance Criteria:**  
- כל שדות ה־choice כ־select.  
- Selects מתמלאים דינמית מרשימות תקפות.  
- אין free-text ידני לשדות שמוגדרים כ־choices.

**בדיקות מקדימות:**  
- [ ] **ADR‑013 LOCKED:** מקור = **API GET /api/v1/reference/brokers** (Team 20 מספק endpoint).  
- [ ] מיפוי שדות choice לכל טופס (D16, D18, D21) מול Blueprint.  
- [ ] רק לאחר מכן: קוד.

**מידע משלים:** דוח השלמה פריט 5 — **החלטה:** API GET /api/v1/reference/brokers. אחראי: Team 20 (API), Team 30 (UI).

**אחראי:** Team 20 (API אם נדרש); Team 30 (UI); Team 10 (מיפוי, העברת החלטות).

---

### משימה 2: Description/Notes = Rich Text Editor

**דרישה (מסמך):** שדות description/notes עם **rich text editing** (מעוצב ומפורמט).

**Code Evidence:**  
- `cashFlowsForm.js` — description כ־`<textarea>`.

**Required Actions:**  
- להחליף textarea ב־**rich text editor** (לפי תקן UI).  
- להחיל בכל המודולים עם שדות description/notes.

**Acceptance Criteria:**  
- Description/Notes מציגים UI של rich text.  
- פורמט נשמר בשמירה/עריכה.

**בדיקות מקדימות:**  
- [ ] **ADR‑013 LOCKED:** **TipTap (Headless UI)** — מיפוי שדות description/notes; מדיניות סניטיזציה.  
- [ ] רק לאחר מכן: קוד.

**מידע משלים:** **ADR‑013 LOCKED:** TipTap (Headless UI).

**אחראי:** Team 30 (מימוש); Team 40 (תקן אם רלוונטי); Team 10 (העברת החלטות).

---

### משימה 3: Modal Buttons Order + RTL Layout

**דרישה (מסמך):** ב־RTL — **Cancel ראשון (ימין)**, אחריו Confirm (שמור). + היררכיית כפתורים תקנית.

**Code Evidence:**  
- `PhoenixModal.js` — כפתור Save נוסף **לפני** Cancel.  
- `phoenix-modal.css` — footer מיושר ל־end, סדר לפי DOM.

**Required Actions:**  
- להחליף סדר או להחיל `flex-direction: row-reverse` ל־RTL.  
- לוודא כפתורים עם design tokens/classes תקניים.

**Acceptance Criteria:**  
- בכל המודלים: Cancel ימין, Confirm שמאל (סדר RTL).  
- עיצוב כפתורים עקבי עם ברירת המחדל של המערכת.

**בדיקות מקדימות:**  
- [ ] תיעוד קצר: DOM order vs CSS (row-reverse).  
- [ ] וידוא תקן מחלקות כפתורים (קישור למשימה 5 אם נדרש).

**אחראי:** Team 30; Team 40 (אישור עיצוב).

---

### משימה 4: Modal Header Color Per Entity (Light Variant)

**דרישה (מסמך):** כל מודול מציג **רקע כותרת בצבע entity** (גוון בהיר).

**Code Evidence:**  
- `phoenix-modal.css` — ל־header אין צבע entity.

**Required Actions:**  
- להוסיף class/attribute ל־modals לפי entity.  
- להחיל רקע **light variant** לפי entity.

**Acceptance Criteria:**  
- כותרת כל מודול מציגה צבע entity נכון (light variant).  
- אין כותרת נייטרלית בהקשר entity.

**בדיקות מקדימות:**  
- [ ] החלטת אדריכל: משתני CSS ל־entity brokers_fees, cash_flows (או מיפוי ל־entity קיים).  
- [ ] מיפוי entity → מודול (D16, D18, D21 וכו').  
- [ ] רק לאחר מכן: קוד.

**אחראי:** Team 40 (Design Tokens); Team 30 (שימוש ב־modal).

---

### משימה 5: Standard Button Classes (Global)

**דרישה (מסמך):** כל הכפתורים עם **מחלקות קבועות + צבעים דינמיים** (פלטת SSOT).

**Required Actions:**  
- לזהות מערכת מחלקות כפתורים ולאכוף בכל המודולים.  
- להסיר סגנונות ad-hoc בטפסים.

**Acceptance Criteria:**  
- כל הכפתורים עוקבים אחר מערכת מחלקות אחידה.  
- צבעים רק מ־CSS variables.

**בדיקות מקדימות:**  
- [ ] החלטה/תיעוד: רשימת מחלקות כפתור רשמית (אם חסרה — לאדריכל).  
- [ ] איתור סטיות בטפסים.  
- [ ] רק לאחר מכן: יישום והסרת ad-hoc.

**מידע משלים:** **ADR‑013 LOCKED:** Team 40 מפיק **DNA_BUTTON_SYSTEM.md** (מסמך מחלקות כפתור — שמות + שימוש) **תוך 24 שעות.** בעלות: Team 40.

**אחראי:** Team 40 (מערכת); Team 30 (יישום).

---

### משימה 6: Dynamic Color Table Page (New)

**דרישה (מסמך):** עמוד (dev-only) שמציג את **כל משתני צבע ה־CSS**, תיאור ו־swatch.

**Reference:** `phoenix-base.css` — SSOT.

**Required Actions:**  
- ליצור עמוד עם טבלה: שם משתנה, תיאור, עמודת theme (נוכחי), צבע (swatch).

**Acceptance Criteria:**  
- עמוד אחד להשוואה ויזואלית של כל משתני הפלטה.  
- שימוש ככלי אודיט לצבעים דינמיים.

**בדיקות מקדימות:**  
- [ ] ספציפיקציה: אילו משתנים לכלול; route רק ב־dev.  
- [ ] וידוא שאין חסימה — אחרת לאדריכל.

**מידע משלים:** **ADR‑013 LOCKED:** route **/admin/design-system** (Type D). מקור role: JWT (שדה role).

**אחראי:** Team 30/40 (מימוש); Team 10 (תיעוד).

---

## 6. שערים ובדיקות (לפי נהלים)

- **שער א' (Team 50):** לאחר כל שלב — **רק אחרי** ש־Team 10 אישר השלמה ומסר קונטקסט מפורט; הרצת סוויטת הבדיקות (E2E וכו'); 0 SEVERE.  
- **שער ב' (Team 90):** ביקורת חיצונית לאחר שער א'.  
- **Design Fidelity (Visionary):** השוואה ויזואלית מול Blueprint/תקן; אישור נמרוד ולד או רשימת תיקונים — **לפי הנהלים**.

---

## 7. חובת בדיקות מקדימות ומיפוי לפני קוד

**לכל משימה:**  
1. **בדיקה מקדימה:** וידוא שיש את כל המידע, ההחלטות והפרטים לביצוע מלא **בלי ניחושים**.  
2. **מיפוי/דוקומנטציה:** שלב מיפוי ותיעוד מלא לפני כתיבת קוד — ככל שנדרש.  
3. **חסר/שאלה פתוחה:** מתועד ומועבר להחלטת אדריכל בדוח מפורט; לא מפתחים קוד עד להחלטה.

---

## 8. תפקיד Team 10

- עדכון תוכנית זו ומעקב אחר משימות ושערים.  
- מסירת קונטקסט מפורט ל־Team 50 לפני כל סבב QA.  
- ריכוז שאלות פתוחות והעברת דוח לאדריכל; עדכון התוכנית לאחר החלטות.  
- עדכון Page Tracker / SSOT לפי נהלים.

---

## 9. מסמכי המשך

- **שאלות להחלטת אדריכל:** `TEAM_10_TO_ARCHITECT_VISUAL_GAPS_OPEN_QUESTIONS.md` (כל המשימות + סקופ מלא + עמודים).  
- **דוח השלמה — מידע משלים:** `TEAM_10_VISUAL_GAPS_SUPPLEMENT_INFO_REPORT.md` — רשימת 7 פריטי השלמה (שחזור סיסמה, Home SSOT, מקור admin role, Rich-text, רשימת ברוקרים, מחלקות כפתור SSOT, עמוד צבעים Admin-only).  
- **מקור משימות:** `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_ADDITIONAL_VISUAL_GAPS_TASKS.md`.

---

## 10. מפת סקופ — כל הנושאים לפי סדר (מאוחד)

| # | נושא | כלול מהמסמך | בדיקות מקדימות |
|---|------|-------------|-----------------|
| **0** | **שער אוטנטיקציה — 4 טיפוסים (A/B/C/D)** | ✅ סעיף Auth Page Types + D | ✅ מיפוי עמודים, החלטת A/B/C/D |
| 1 | Header תמיד אחרי Login → Home | ✅ משימה 7 | ✅ תיעוד זרימה |
| 2 | Select vs Text (ברוקר וכו') | ✅ משימה 1 | ✅ מקור רשימות, מיפוי choice |
| 3 | Rich Text — Description/Notes | ✅ משימה 2 | ✅ רכיב/סטנדרט, מיפוי שדות |
| 4 | סדר כפתורים במודל + RTL | ✅ משימה 3 | ✅ תיעוד סדר/CSS |
| 5 | צבע כותרת מודל לפי Entity | ✅ משימה 4 | ✅ משתני entity, מיפוי |
| 6 | תקנון כפתורים גלובלי | ✅ משימה 5 | ✅ רשימת מחלקות |
| 7 | דף טבלת צבעים דינמית | ✅ משימה 6 | ✅ ספציפיקציה |

**סה"כ:** 8 פריטים (שער 0 + משימות 1–7). **טיפוס D (Admin-only)** נוסף לפי הנחיית מנהל. כל הסעיפים והתת־סעיפים מהמסמך המקורי כלולים.

---

## 10. דרישות פעולה מצוות 10 (לפי הפעלת Team 90)

**מקור:** `TEAM_90_TO_TEAM_10_ADR_013_SLA_ACTIVATION_MANDATE.md`

1. **לעדכן** תוכנית עבודה לפי ADR‑013 — ✅ בוצע במסמך זה.
2. **MAPPING_MODE:** להשלים שלושת קבצי המיפוי (DATA_MAP_FINAL.json, CSS_RETROFIT_PLAN, ROUTES_MAP A/B/C/D). **משימות מדויקות לכל צוות:** `TEAM_10_MAPPING_MODE_TASK_DISTRIBUTION.md` (מקום הגשה, פורמט, רפרנסים).
3. **לא לאשר קידוד** לפני אישור מיפוי ויזואלי (נמרוד).
4. **להוציא הנחיות** לצוותים בהתאם ל־SLA 30/40 (`TT2_SLA_TEAMS_30_40.md`).
5. **דוח עדכון** ל‑Team 90 לפני פנייה לאדריכלית (Team 90 יכול לבדוק עדכונים לפני שליחה).

---

**Team 10 (The Gateway)**  
**log_entry | VISUAL_GAPS_WORK_PLAN | ADR_013_LOCKED_MAPPING_MODE | 2026-02-10**

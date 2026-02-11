# 📐 סדר עבודה עד לשער א' — Team 10 (תזמור)

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-10  
**סטטוס:** 📋 **מסמך תזמור — סדר ביצוע מחייב**  
**מקור:** `TEAM_10_VISUAL_GAPS_WORK_PLAN.md`, `TEAM_90_TO_TEAM_10_ADR_013_SLA_ACTIVATION_MANDATE.md`, מנדט Pre‑coding.  
**SSOT & Mandates:** `ADR_STAGE0_BRIDGE_AND_REACT_TABLES_SSOT.md`, `ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md`, `ARCHITECT_PRE_CODING_MAPPING_MANDATE.md`, `TT2_SLA_TEAMS_30_40.md`.

---

## 1. תצוגה כללית

הסדר להלן מגדיר **עד מתי** כל שלב ואת **המעבר לשער א'** (Team 50 — הרצת סוויטת בדיקות, 0 SEVERE). אין לדלג על שלב; מיפוי מאושר לפני קידוד.

```
[שלב -1] MAPPING_MODE — ✅ סגור
    ↓
[שלב 0] גשר React/HTML (Bridge) — BLOCKING (קודם לכל שלב); SSOT: ADR_STAGE0_BRIDGE_AND_REACT_TABLES_SSOT.md
    ↓
[שלב 1] שער אוטנטיקציה (A/B/C/D) — יישום
    ↓
[שלב 2] Header Loader לפני React mount
    ↓
Team 10: אישור השלמה + מסירת קונטקסט ל־QA
    ↓
[שער א'] Team 50: הרצת בדיקות — 0 SEVERE
```

---

## 2. סדר עבודה מפורט עד לשער א'

### שלב ‑1: MAPPING_MODE (Pre‑coding) — **חוסם**

| # | פעולה | אחראי | מסירה / תוצר |
|---|--------|--------|----------------|
| 1.1 | פרסום הודעות לצוותים + ROUTES_MAP | **Team 10** | הודעות ל־20/30, 40; טבלת ROUTES_MAP (בתוכנית או `ROUTES_MAP_A_B_C_D.md`) |
| 1.2 | מיפוי שדות ברוקרים — DATA_MAP_FINAL.json | **Team 20 + 30** | `_COMMUNICATION/team_20/DATA_MAP_FINAL.json` |
| 1.3 | רשימת CSS ל־Sticky — CSS_RETROFIT_PLAN | **Team 40** | `_COMMUNICATION/team_40/CSS_RETROFIT_PLAN.md` |
| 1.4 | מסמך מחלקות כפתור — DNA_BUTTON_SYSTEM.md (24h) | **Team 40** | `_COMMUNICATION/team_40/DNA_BUTTON_SYSTEM.md` |
| 1.5 | איסוף מסירות, בדיקת שלמות | **Team 10** | רשימת מסירות מלאה |
| 1.6 | **אישור ויזואלי נמרוד** על המיפוי | **נמרוד** | אישור לפתיחת קידוד |

**יציאה משלב ‑1:** ✅ MAPPING_MODE נסגר (הודעה: `TEAM_10_MAPPING_MODE_CLOSURE_NOTICE.md`).

---

### שלב 0: גשר React/HTML (Bridge) — **BLOCKING (קודם לכל שלב)**

**SSOT:** `_COMMUNICATION/team_10/ADR_STAGE0_BRIDGE_AND_REACT_TABLES_SSOT.md`.  
**מקור:** `_COMMUNICATION/team_90/TEAM_90_REACT_HTML_BRIDGE_FINDINGS_DRAFT.md` (Team 90).

| # | פעולה | אחראי | הערה |
|---|--------|--------|------|
| 0.1 | Lock ל־Hybrid Model: D16/D18/D21=HTML, Auth/Home/Admin=React | **לפי SSOT** | |
| 0.2 | Auth Redirect Rules (ADR‑013): C→Home, A=No Header, B=Home Shared, D=JWT role | **Team 30** | |
| 0.3 | routes.json: /login, /register, /reset-password (ללא .html) | **Team 10/30** | ✅ עודכן ב־routes.json |
| 0.4 | Header Path: נעילה על unified-header.html בלבד | **Team 30/40** | |
| 0.5 | **React Tables:** רק דרך TablesReactStage ב‑UAI (אין mount per page) | **לפי SSOT** | ראה `TEAM_10_REACT_TABLES_MINI_WORK_PLAN.md`, ADR SSOT. |
| 0.6 | איסור Header **בתוך Containers** (מניעת SSR כפול) | **Team 30** | SSOT §4. |
| 0.7 | דיווח השלמה ל־Team 10 | **צוות מוביל** | |

**הערה:** Stage 0 חוסם את כל השלבים הבאים. React Tables — TablesReactStage בלבד (נעול).

---

### שלב 1: שער אוטנטיקציה (4 טיפוסים A/B/C/D)

**Shared Pages (Type B) = טיפוס רשמי (חובה):** עמוד יחיד עם שני Containers; Auth Guard מבחין A/B/C/D; Type B: Allowed + render לפי auth state; **אין Redirect** ב‑B. ראה ADR SSOT §3.1.

| # | פעולה | אחראי | הערה |
|---|--------|--------|------|
| 1.1 | Auth Guard מבחין A/B/C/D; Type C: אורח → Home; Type B: **אין redirect** | **Team 30** | לא ProtectedRoute על Home; redirect ל־Home רק ב‑C (לא ב‑B). |
| 1.2 | **Type B (Shared):** Home = עמוד יחיד — Guest Container (אורח) + Logged-in Container (מחובר) | **Team 30** | שני containers **באותו עמוד**; אין עמודים נפרדים. |
| 1.3 | בדיקות חובה Type B: אורח רואה Guest בלבד; מחובר רואה Logged-in בלבד; Login→Home מחליף תצוגה | **Team 30/50** | אין Redirect ב‑B. |
| 1.4 | User Icon: Success (logged-in) / Warning (logged-out); אסור שחור | **Team 30/40** | לפי SLA. |
| 1.5 | Admin-only: בדיקת JWT role, redirect/403 ל־/admin/design-system | **Team 20 + 30** | מקור: שדה `role` ב־JWT. |
| 1.6 | וידוא עמודי A) Open ללא Header (login, register, reset-password) | **Team 30** | |
| 1.7 | דיווח השלמה ל־Team 10 | **Team 30** | |

**רפרנס:** `TEAM_10_VISUAL_GAPS_WORK_PLAN.md` סעיף 4 ו־4.3.1; ADR‑013; ADR SSOT §3.1.

---

### שלב 2: Header תמיד אחרי Login → Home

| # | פעולה | אחראי | הערה |
|---|--------|--------|------|
| **2.0** | **Header נעלם אחרי Login — תיקון קריטי ראשון** | **Team 30** | Header חייב להישאר אחרי מעבר Login → Home; תיקון **ראשון** בתעדוף. |
| 2.1 | Header Loader רץ **לפני** React mount | **Team 30** | ADR‑013 |
| 2.2 | וידוא Header מוצג בכל עמוד שאינו A) Open | **Team 30** | |
| 2.3 | דיווח השלמה ל־Team 10 | **Team 30** | |

**רפרנס:** `TEAM_10_VISUAL_GAPS_WORK_PLAN.md` משימה 7; SSOT §6.7.

---

### חוב לפני אישור השער באופן סופי — איחוד Auth תחת Shared_Services (Option B)

**SSOT:** `SSOT_AUTH_UNIFIED_SHARED_SERVICES_OPTION_B.md` (החלטה מאושרת Team 90 / G‑Lead).  
**ביצוע מידי** — חוסם אישור שער סופי.

| # | פעולה | אחראי | הערה |
|---|--------|--------|------|
| A.1 | כל auth דרך Shared_Services (ללא axios ישיר); תיקון שמירת token אחרי refresh | **Team 30** | ראה `TEAM_10_TO_TEAM_30_AUTH_UNIFIED_SHARED_SERVICES_MANDATE.md` |
| A.2 | חוזה Response אחיד (access_token, token_type, expires_at, user); עדכון OpenAPI/SSOT | **Team 20** | ראה `TEAM_10_TO_TEAM_20_AUTH_CONTRACT_AND_SSOT_MANDATE.md` |
| A.3 | עדכון Gate A QA: auth דרך Shared_Services; token אחרי refresh; Gate A PASS | **Team 50** | ראה `TEAM_10_TO_TEAM_50_GATE_A_AUTH_QA_UPDATE_MANDATE.md` |

---

### הכנה לשער א'

| # | פעולה | אחראי | הערה |
|---|--------|--------|------|
| G.1 | **Team 10:** וידוא ששלבים 0 ו־1 הושלמו לפי התוכנית | Team 10 | |
| G.2 | **Team 10:** מסירת **קונטקסט מפורט** ל־Team 50 (מה בוצע, קבצים רלוונטיים, תרחישים) | Team 10 | לפי נהלי QA |
| G.3 | **Team 50:** הרצת סוויטת הבדיקות (E2E וכו') | Team 50 | 0 SEVERE — תנאי למעבר |

---

## 3. שער א' — הגדרה

- **שער א' (Team 50):** לאחר השלמת שלבים 0 ו־1 — **רק אחרי** ש־Team 10 אישר השלמה ומסר קונטקסט מפורט; הרצת סוויטת הבדיקות; **0 SEVERE**.
- **מסמך נהלי QA:** `documentation/09-GOVERNANCE/standards/TEAM_50_QA_WORKFLOW_PROTOCOL.md`  
- **תזכורת:** אין להריץ שער א' לפני סגירת MAPPING_MODE ואישור נמרוד.

---

## 4. מסמכי הודעות לצוותים (שפורסמו)

### MAPPING_MODE (שלב ‑1 — סגור)

| צוות | מסמך הודעה |
|------|-------------|
| **20 + 30** | `TEAM_10_TO_TEAMS_20_30_MAPPING_MODE_MANDATE.md` |
| **40** | `TEAM_10_TO_TEAM_40_MAPPING_MODE_MANDATE.md` |
| **כולם** | `TEAM_10_MAPPING_MODE_TASK_DISTRIBUTION.md` (חלוקת משימות מלאה) |

### הנעה עד שער א' (שלבים 0, 1, 2 — 2026-01-30)

| צוות | מסמך הודעה |
|------|-------------|
| **30** | `TEAM_10_TO_TEAM_30_GATE_A_KICKOFF_MANDATE.md` |
| **20** | `TEAM_10_TO_TEAM_20_GATE_A_KICKOFF_MANDATE.md` |
| **40** | `TEAM_10_TO_TEAM_40_GATE_A_KICKOFF_MANDATE.md` |
| **50** | `TEAM_10_TO_TEAM_50_GATE_A_READINESS_NOTICE.md` |
| **כולם** | `TEAM_10_TO_ALL_TEAMS_GATE_A_ORDER_KICKOFF.md` |

### משימות Team 10 (G.1, G.2) + רשימת משימות עצמיות

| מסמך | תיאור |
|------|--------|
| `TEAM_10_OWN_TASKS_MASTER_CHECKLIST.md` | רשימת כל המשימות שהוגדרו ל־Team 10 — ביצוע מסודר |
| `TEAM_10_GATE_A_VERIFICATION_AND_SIGN_OFF.md` | G.1 — אימות השלמת שלבים 0, 1, 2; אישור לשער א' |
| `TEAM_10_TO_TEAM_50_GATE_A_CONTEXT_HANDOFF.md` | G.2 — מסירת קונטקסט מפורט ל־Team 50 (תנאי להרצת שער א') |

### איחוד Auth תחת Shared_Services — Option B (2026-02-10)

| מסמך | תיאור |
|------|--------|
| `SSOT_AUTH_UNIFIED_SHARED_SERVICES_OPTION_B.md` | SSOT — החלטה נעולה (Team 90); Root cause, Acceptance |
| `TEAM_10_TO_TEAM_30_AUTH_UNIFIED_SHARED_SERVICES_MANDATE.md` | Team 30 — כל auth דרך Shared_Services; תיקון refresh |
| `TEAM_10_TO_TEAM_20_AUTH_CONTRACT_AND_SSOT_MANDATE.md` | Team 20 — חוזה אחיד; OpenAPI/SSOT |
| `TEAM_10_TO_TEAM_50_GATE_A_AUTH_QA_UPDATE_MANDATE.md` | Team 50 — עדכון Gate A; token אחרי refresh |
| `TEAM_10_TO_ALL_TEAMS_AUTH_UNIFIED_OPTION_B_KICKOFF.md` | הודעה כללית — חלוקת משימות |

---

## 5. סיכום טבלארי — סדר עד שער א'

| שלב | תיאור קצר | סטטוס |
|-----|------------|--------|
| **‑1** | MAPPING_MODE | ✅ סגור |
| **0** | גשר React/HTML (Bridge) — דוח Team 90 | ✅ |
| **1** | אוטנטיקציה: Guards, Home containers, **Type B (Shared) רשמי** — שני containers באותו עמוד, אין Redirect ב‑B, User Icon, Admin JWT, עמודי Open בלי Header | ✅ |
| **2** | Header Loader לפני React mount; Header בכל עמוד לא־Open | ✅ |
| **G** | Team 10: אישור (G.1) + קונטקסט ל־QA (G.2) → Team 50: הרצת בדיקות, 0 SEVERE (שער א') | ✅ G.1+G.2 בוצעו; שער א' הורצה — ראה `TEAM_10_GATE_A_QA_REPORT_ACKNOWLEDGMENT.md` |
| **A** | **חוב לפני אישור סופי:** איחוד Auth תחת Shared_Services (Option B) — 30/20/50 | ⬜ SSOT נעול; מנדטים נשלחו; ביצוע מידי |

---

## 6. קבצים מרכזיים להפניה (SSOT & Mandates)

| קובץ | שימוש |
|------|--------|
| **ADR_STAGE0_BRIDGE_AND_REACT_TABLES_SSOT.md** | נעילה Stage 0 + React Tables (Option B); Auth 4-Type; תיקונים ויזואליים (§6). |
| **SSOT_AUTH_UNIFIED_SHARED_SERVICES_OPTION_B.md** | איחוד Auth תחת Shared_Services (Option B) — החלטה מאושרת Team 90; חוב לפני אישור שער סופי. |
| **ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md** | ADR‑013 — החלטות אדריכלית. |
| **ARCHITECT_PRE_CODING_MAPPING_MANDATE.md** | Pre‑coding Mapping — BLOCKING. |
| **TT2_SLA_TEAMS_30_40.md** | SLA 30/40 — תפקידים ומגבלות. |

---

**Team 10 (The Gateway)**  
**log_entry | ORDER_OF_WORK_UNTIL_GATE_A | UPDATED_SSOT_LOCK | 2026-02-10**

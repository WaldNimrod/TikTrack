# Team 10 → Team 50: קונטקסט וסקופ בדיקות — הכנה לשער ב'

**מאת:** Team 10 (The Gateway)  
**אל:** Team 50 (QA)  
**תאריך:** 2026-02-10  
**נוהל:** `TT2_QUALITY_ASSURANCE_GATE_PROTOCOL` §1ב, `TEAM_50_QA_WORKFLOW_PROTOCOL` — תנאי הפעלה: קבלת קונטקסט מפורט מצוות 10 לפני הרצת QA.  
**משימות QA:** `TEAM_10_TO_TEAM_50_ARCHITECT_IMPLEMENTATION_TASKS.md` (T50.1, T50.2)

---

## 1. מה פותח (סבב שהסתיים)

**תוכנית:** יישום תשובת האדריכלית ADR-013 + SOP-012 (משימות מטריצת היישום).

**צוותים שהשלימו:**

| צוות | מה הושלם |
|------|----------|
| **Team 20** | T20.2 סניטיזציה בשרת (Python, `api/utils/rich_text_sanitizer.py`, bleach); T20.3 אימות ש־HTML נשמר במלואו (ללא חיתוך). שילוב ב־**Cash Flows** — create/update מסננים את שדה `description`. תמיכה ב־`dir` על `p` (rtl/ltr/auto). |
| **Team 30** | T30.2 TipTap ב־**Cash Flows** (שדה description); T30.3 כפתור סגנונות (רק .phx-rt--success/warning/danger/highlight); T30.4 DOMPurify עם Allowlist לפי `SOP_012_DOMPURIFY_ALLOWLIST.md`; T30.5 דף **Design System** (/admin/design-system) — React Type D, טבלאות Rich-Text Styles ו־Color Variables. |
| **Team 40** | T40.2 ארבע מחלקות Rich-Text ב־`phoenix-components.css` (.phx-rt--*); T40.3 רכיב DesignSystemStylesTable ו־DesignSystemDashboard מעודכן. |

**קבצים עיקריים ששונו/נוספו:**

- **BE:** `api/utils/rich_text_sanitizer.py`, `api/utils/RICH_TEXT_SANITIZATION_POLICY.md`, `api/routers/cash_flows.py` (שימוש בסניטייזר ב־description).
- **FE:** TipTap + DOMPurify — `phoenixRTStyleMark.js`, `phoenixRichTextEditor.js`, `dompurifyRichText.js`, `cashFlowsForm.js` (description); `DesignSystemDashboard.jsx`, `DesignSystemColorsTable.jsx`, `DesignSystemStylesTable`; `phoenix-components.css` (מחלקות .phx-rt--*).
- **בדיקות BE:** `api/scripts/test_rich_text_roundtrip.py`.

---

## 2. מה נדרש לבדוק (Scope מפורט)

לפי **T50.1** ו־**T50.2** והנוהל — להריץ בדיקות אוטומטיות (כולל E2E/Runtime לפי `TEAM_50_QA_WORKFLOW_PROTOCOL`) ולוודא את הנקודות הבאות.

### 2.1 T50.1 — Regression / Rich-Text / Brokers / Sanitization

| # | בדיקה | תיאור מפורט |
|---|--------|-------------|
| 1 | **רשימת ברוקרים מ־API** | בטפסים D16 (Trading Accounts), D18 (Brokers Fees), D21 (Cash Flows) — שדה Broker/ברוקר מתמלא מ־**GET /api/v1/reference/brokers** (dynamic select). אין רשימה סטטית ריקה או hardcoded. |
| 2 | **Rich-Text — ללא Inline Style** | ב־Cash Flows (שדה description): ה־Editor מוסיף רק מחלקות (.phx-rt--success וכו'). **אין** `style="..."` בתוכן שנשמר או מוצג. בדיקה: הזרקת טקסט עם סגנון → שמירה → טעינה — אין תגית `style` ב־HTML. |
| 3 | **סניטיזציה FE** | לפני שליחה לשרת — DOMPurify רץ; רק תגיות/attributes מ־Allowlist (`SOP_012_DOMPURIFY_ALLOWLIST.md`). לדוגמה: `<script>`, `onclick`, `style` — מוסרים. |
| 4 | **סניטיזציה BE** | שמירת Cash Flow עם description מכיל HTML — השרת מסנן; רק תגיות/קלאסים מאושרים נשמרים. בדיקה: שליחת payload עם `class="evil"` או `<script>` — לא נשמר; קלאס `phx-rt--success` נשמר. |
| 5 | **Round-trip HTML** | שמירת description עם תגיות מאושרות (למשל `<p>`, `<span class="phx-rt--success">`) — לאחר טעינה העמוד מציג את התוכן **במלואו** ללא חיתוך או שיבוש encoding. |

### 2.2 T50.2 — Design System (Type D)

| # | בדיקה | תיאור מפורט |
|---|--------|-------------|
| 6 | **גישה למנהל** | משתמש עם **JWT role מתאים** (מנהל) — גישה ל־**/admin/design-system** מצליחה; הדף נטען; טבלאות Rich-Text Styles ו־Color Variables מוצגות. |
| 7 | **אורח / לא־מנהל** | אורח (לא מחובר) או משתמש מחובר **בלי** תפקיד מנהל — גישה ל־/admin/design-system מפנה (redirect) או 403; הדף לא נגיש. |

### 2.3 Gate A (Regression כללי)

- להריץ את סוויטת **Gate A** הקיימת (למשל `tests/gate-a-e2e.test.js` או המקביל) — **0 SEVERE**.
- וידוא שאין regressions בעמודי Auth, Home, D16/D18/D21 (ניווט, טעינה).

---

## 3. קונטקסט והפניות

| פריט | מקור |
|------|------|
| **משימות QA (T50.1, T50.2)** | `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_50_ARCHITECT_IMPLEMENTATION_TASKS.md` |
| **מטריצת משימות** | `_COMMUNICATION/team_10/TEAM_10_ARCHITECT_IMPLEMENTATION_TASK_MATRIX.md` |
| **ADR-013** | `_COMMUNICATION/team_10/ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md` |
| **SOP-012** | `documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_RICH_TEXT_AND_DESIGN_SYSTEM_SPEC.md` |
| **Allowlist DOMPurify** | `_COMMUNICATION/team_10/SOP_012_DOMPURIFY_ALLOWLIST.md` |
| **נוהל QA** | `documentation/09-GOVERNANCE/standards/TEAM_50_QA_WORKFLOW_PROTOCOL.md` |
| **פרוטוקול שערים** | `documentation/05-PROCEDURES/TT2_QUALITY_ASSURANCE_GATE_PROTOCOL.md` |
| **תוכנית עבודה** | `_COMMUNICATION/team_10/TEAM_10_VISUAL_GAPS_WORK_PLAN.md` |

**API:** GET /api/v1/reference/brokers — Endpoint פעיל (value/label).  
**שדה Rich-Text:** Cash Flows — `description` (create + update).

---

## 4. תוצר מצופה

- דוח סיכום בדיקות (או עדכון ל־Team 10) — אילו פריטים עברו, אילו נכשלו.
- במקרה כשל — לפי `TT2_TEAM_50_DEFECT_REPORTING_PROCEDURE`: עדכון ל־Team 10 + דרישת תיקון מפורטת לצוות הרלוונטי.
- **מעבר:** 0 SEVERE; כל הפריטים בסעיף 2 עברו → ניתן להעביר לשער ב' (Team 90 ביקורת חיצונית).

---

**Team 10 (The Gateway)**  
**log_entry | TEAM_50_GATE_B_SCOPE_AND_CONTEXT | 2026-02-10**

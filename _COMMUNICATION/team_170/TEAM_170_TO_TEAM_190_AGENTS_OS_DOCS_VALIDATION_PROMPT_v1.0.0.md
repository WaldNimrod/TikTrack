# Team 170 → Team 190 | Agents_OS Docs Mandate — פרומט קאנוני להפעלת ולידציה

**project_domain:** AGENTS_OS  
**id:** TEAM_170_TO_TEAM_190_AGENTS_OS_DOCS_VALIDATION_PROMPT_v1.0.0  
**from:** Team 170 (Governance Spec / Documentation)  
**to:** Team 190 (Constitutional Architectural Validator)  
**cc:** Team 00, Team 10  
**date:** 2026-03-14  
**status:** ACTIVE  
**scope:** TEAM_00_TO_TEAM_170_AGENTS_OS_DOCS_MANDATE_v2.0.0 — ולידציה חוקתית סופית לפני העברה לאישור אדריכלית  
**trigger:** דוח השלמה נמסר; מימוש מלא לפי תוכנית 5 שלבים

---

## 1) הגדרת משילות — תפקיד Team 190

**מקור:** `documentation/docs-governance/01-FOUNDATIONS/07_TEAM_190_CONSTITUTION.md`, `TEAM_00_TO_TEAM_170_AGENTS_OS_DOCS_MANDATE_v2.0.0.md` §6

| Field | Value |
|-------|-------|
| Team ID | 190 |
| Role | Constitutional Architectural Validator |
| Responsibility | ולידציה חוקתית לחבילת תיעוד ומבנה Agents_OS |
| Authority | פסיקת PASS / BLOCK_FOR_FIX בהתאם לנוהל |

**תחום:** Team 190 הוא ה־validation authority לחבילת מימוש זו. סגירת המשימה (SOP-013 Seal) מותנית ב־PASS מ־Team 190 ולאחר מכן באישור אדריכלית (Team 00).

---

## 2) Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| task_id | AGENTS_OS_DOCS_AND_INFRA_MANDATE |
| gate_id | GOVERNANCE_PROGRAM |
| input_deliverable | `_COMMUNICATION/team_170/TEAM_170_AGENTS_OS_DOCS_MANDATE_COMPLETION_REPORT_v1.0.0.md` |
| validation_type | POST-IMPLEMENTATION |

---

## 3) הוראות הפעלה — מה על Team 190 לבצע

### 3.1 קריאת מסמכים חובה

לפני הפעלת הולידציה, יש לקרוא:

1. **דוח השלמה:** `_COMMUNICATION/team_170/TEAM_170_AGENTS_OS_DOCS_MANDATE_COMPLETION_REPORT_v1.0.0.md`
2. **מנדט מקור:** `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_170_AGENTS_OS_DOCS_MANDATE_v2.0.0.md` — סעיפים 1–6 (Acceptance Criteria)
3. **תוכנית:** `.cursor/plans/agents_os_docs_mandate_1c62d61d.plan.md` — מבנה השלבים

### 3.2 ביצוע בדיקות לפי Acceptance Criteria

יש לאמת את כל הסעיפים בטבלה להלן, בהתאם לפרוצדורת Team 190 המקובלת.

---

## 4) קריטריוני ולידציה (מקור: מנדט §6)

### Phase 1 (תיעוד)

| ID | קריטריון | אופן אימות |
|----|-----------|-------------|
| P1-01 | `documentation/docs-agents-os/` קיימת עם כל התת-תיקיות | `ls documentation/docs-agents-os/ 01-OVERVIEW/ 02-ARCHITECTURE/ 03-CLI-REFERENCE/ 04-PROCEDURES/ 05-TEMPLATES/` |
| P1-02 | `00_AGENTS_OS_MASTER_INDEX.md` מכיל את כל המסמכים מ־TEAM_170 gap analysis §2 | השוואת Full File Map ל־`TEAM_170_AGENTS_OS_DOCUMENTATION_STATE_AND_WORK_PLAN_OPTIONS_v1.0.0.md` §2 |
| P1-03 | `AGENTS_OS_OVERVIEW.md` — חבר צוות חדש מבין מהקובץ לבד | קריאה ובדיקה: §1–5 מלאים, 5 צעדי התחלה |
| P1-04 | `AGENTS_OS_ARCHITECTURE_OVERVIEW.md` — כל 5 הסעיפים עם נתונים נכונים | §1 Domain Isolation, §2 Gate Sequence, §3 Mandate Engine, §4 Multi-Domain, §5 Correction Cycle |
| P1-05 | `agents_os/README.md` — בלוק ניווט ל־docs-agents-os | `grep -A5 "## Documentation" agents_os/README.md` |
| P1-06 | `00_DOCUMENTATION_FOLDER_STRUCTURE_CANONICAL` עודכן | `grep docs-agents-os documentation/docs-governance/00_DOCUMENTATION_FOLDER_STRUCTURE_CANONICAL_v1.0.0.md` |

### Phase 2 (העברת UI)

| ID | קריטריון | אופן אימות |
|----|-----------|-------------|
| P2-01 | `agents_os/ui/` מכיל 3 קבצי HTML | `ls agents_os/ui/PIPELINE_*.html` — 3 קבצים |
| P2-02 | אין PIPELINE_*.html בשורש repo | `ls PIPELINE_*.html 2>/dev/null` — אין תוצאות |
| P2-03 | קישורי ניווט בין קבצים עובדים | `./agents_os/scripts/start_ui_server.sh` → פתיחת כל 3 הדפים בדפדפן |
| P2-04 | נתיבי JSON עובדים | Dashboard טוען pipeline_state.json בהצלחה |
| P2-05 | הפניות חיצוניות מעודכנות | `grep -r "PIPELINE_DASHBOARD\|PIPELINE_ROADMAP" --include="*.md" .` — נתיבים מעודכנים |

### Phase 3 (סקריפטים)

| ID | קריטריון | אופן אימות |
|----|-----------|-------------|
| P3-01 | `agents_os/scripts/` מכיל start/stop/init | `ls agents_os/scripts/*.sh` |
| P3-02 | כל הסקריפטים executable | `test -x agents_os/scripts/start_ui_server.sh` וכו' |
| P3-03 | `start_ui_server.sh` מדפיס 3 כתובות | הרצה ובדיקת פלט |
| P3-04 | `stop_ui_server.sh` עוצר את השרת | הרצה ובדיקה |
| P3-05 | `init_pipeline.sh` יוצר pipeline_state_*.json תקין | `./agents_os/scripts/init_pipeline.sh agents_os S002-P005-WP999` |
| P3-06 | `.vscode/tasks.json` — 4 tasks של Agents_OS | `grep "Agents_OS" .vscode/tasks.json` |
| P3-07 | `agents_os/scripts/README.md` קיים ומדויק | קריאת הקובץ |

### Phase 4 (CLI Reference)

| ID | קריטריון | אופן אימות |
|----|-----------|-------------|
| P4-01 | כל ה-subcommands מתועדים עם דוגמה | `PIPELINE_CLI_REFERENCE.md` — next, pass, fail, approve, status, gate, route, revise, store, domain, phase\<N\> |
| P4-02 | מפתח חדש יכול להשתמש ב-pipeline בלי עזרה | הערכה איכותית (או הערת non-blocking) |

---

## 5) פלט נדרש מ־Team 190

### 5.1 נתיב מסמך התוצאה

`_COMMUNICATION/team_190/TEAM_190_TO_TEAM_170_AGENTS_OS_DOCS_MANDATE_VALIDATION_RESULT_v1.0.0.md`

### 5.2 תוכן חובה במסמך התוצאה

| שדה | תוכן |
|-----|------|
| verdict | **PASS** או **BLOCK_FOR_FIX** |
| checks_verified | טבלה: ID | קריטריון | תוצאה | Evidence |
| remaining_issues | אם BLOCK_FOR_FIX — רשימת ממצאים חוסמים |
| non_blocking_notes | אופציונלי — הערות לשיפור עתידי |
| recommendation | CLOSE / BLOCK |
| handover | אם PASS — "העברה לאישור אדריכלית (Team 00)" |

### 5.3 הוראות לפלט

**אם BLOCK_FOR_FIX:**
- החזר רשימת ממצאים לפי הנוהל — כל ממצא עם: מזהה, תיאור, נתיב קובץ, דרישת תיקון
- Team 170 מבצע remediation ומגיש מחדש

**אם PASS:**
- אישור כי כל הקריטריונים אומתו (או רישום הערות non-blocking בלבד)
- **העברה לאישור אדריכלית (Team 00)** — Nimrod מאשר לפני Seal
- לאחר אישור אדריכלית — Team 170 משלים ב־SOP-013 Seal

---

## 6) Closure Path

```
Team 190 validation
       │
       ├── BLOCK_FOR_FIX → Team 170 remediation → הגשה מחדש ל־Team 190
       │
       └── PASS → העברה ל־Team 00 (אישור אדריכלית) → Seal (SOP-013)
```

---

## 7) סיכום הפעלה

**Team 190 — הוראה:**

1. קרא את דוח ההשלמה והמנדט.
2. בצע את כל הבדיקות בסעיף 4.
3. צור את מסמך התוצאה בנתיב §5.1.
4. **החזר שגיאות** בהתאם לנוהל — כל ממצא BLOCK עם מזהה, תיאור, נתיב — **או**
5. **אשר (PASS)** והעבר לבדיקת האדריכלית — ללא ממצאים חוסמים.

---

**log_entry | TEAM_170 | TO_TEAM_190 | AGENTS_OS_DOCS_VALIDATION_PROMPT | ISSUED | 2026-03-14**

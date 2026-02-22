# Domain Refactor — Execution Playbook v1.0.0

**id:** TEAM_170_DOMAIN_REFACTOR_EXECUTION_PLAYBOOK_v1.0.0  
**from:** Team 170  
**re:** TEAM_100_TO_TEAM_170_DOMAIN_REFACTOR_DIRECTIVE_v1.0.0 + **TEAM_190_TO_TEAM_170_DOMAIN_REFACTOR_DIRECTIVE_EXPANDED_v1.1.0**  
**date:** 2026-02-21  
**project_domain:** AGENTS_OS  
**purpose:** סדר עבודה ממוקד; יישור מלא ל־E1–E7 ו־7 תוצרי חובה per Team 190 expanded directive.

---

## 1) מקור הדרישה והסקופ

| פריט | מקור |
|------|------|
| **דרישה מקורית** | Team 100 (Development Architecture Lead) — TEAM_100_TO_TEAM_170_DOMAIN_REFACTOR_DIRECTIVE_v1.0.0 |
| **קישור למסמך** | `_COMMUNICATION/team_100/TEAM_100_TO_TEAM_170_DOMAIN_REFACTOR_DIRECTIVE_v1.0.0.md` |
| **סקופ יישום** | TEAM_170_DOMAIN_REFACTOR_SCOPING_v1.0.0 — צמצום: legacy/ארכיון לא עורכים; עדכון מלא רק ל־in-scope (תוכניות פעילות, קנון, שלבים לא סגורים). |

---

## 2) סדר עבודה ממוקד (ללא כפילות)

### שלב A — הכנה (פעם אחת)

| # | פעולה | תוצר |
|---|--------|------|
| A1 | יצירת מבנה `agents_os/` + 7 תת־תיקיות | ✅ בוצע |
| A2 | יצירת `_COMMUNICATION/99-ARCHIVE/` + README | ✅ בוצע |
| A3 | רשימת קבצי in-scope קבועה: קבצי S001-P001-WP001 (מרשימת WORK_PACKAGE_DEFINITION + MASTER_TASK_LIST), קנון (SSM, Gate protocol, Bible, TT2, Gateway, Master List, רג'יסטרים, תבניות), קבצי GATE נוכחי | קובץ DOMAIN_REFACTOR_IN_SCOPE_LIST_v1.0.0.md |

### שלב B — סריקה וסיווג (E2 + E3)

| # | פעולה | תוצר חובה (per E2/E3) |
|---|--------|------------------------|
| B1 | סריקה מלאה: _COMMUNICATION, documentation, api, ui, tests, scripts, inbox — Agent_OS, Agents_OS, governance runtime | **DOMAIN_REFACTOR_SCAN_RESULTS_v1.0.0.md** (path-level) |
| B2 | סיווג כל ארטיפקט: TIKTRACK \| AGENTS_OS \| SHARED; action (MOVE/RETAIN/REFERENCE_UPDATE); target_path; provenance_id | **DOMAIN_REFACTOR_CLASSIFICATION_MATRIX_v1.0.0.md** (columns: artifact_path, assigned_domain, classification_rationale, action, target_path, provenance_id) |
| B3 | החלטה באצווה: legacy/ארכיון vs in-scope (per scoping) | רשימת פעולות |

### שלב C — ביצוע (E4, E5, E6)

| # | פעולה | תוצר חובה (per E4/E5/E6) |
|---|--------|---------------------------|
| C1 | ארכיון: העברת קבצים ל־99-ARCHIVE; תיעוד | אין מחיקה בלי ארכיון |
| C2 | Legacy: שורת project_domain — legacy (אם לא ארכיון) | מינימלי |
| C3 | In-scope: הוספת `project_domain: TIKTRACK \| AGENTS_OS \| SHARED` + תיקון נתיבים | **DOMAIN_REFACTOR_PROJECT_DOMAIN_HEADER_COVERAGE_v1.0.0.md** (totals, missing, invalid, exceptions) |
| C4 | איחוד inbox: _ARCHITECTURAL_INBOX → _COMMUNICATION/_ARCHITECT_INBOX; העברת תוכן פיזי; עדכון refs | **DOMAIN_REFACTOR_LEGACY_INBOX_CONSOLIDATION_LOG_v1.0.0.md** |
| C5 | MOVE כל AGENTS_OS ל־agents_os/; provenance לכל העברה | **DOMAIN_REFACTOR_MOVE_LOG_v1.0.0.md** (from_path, to_path, moved_at, moved_by, provenance_note) |

### שלב D — דוח והגשה (E7 + חבילה)

| # | פעולה | תוצר |
|---|--------|------|
| D1 | **DOMAIN_REFACTOR_COMPLETION_REPORT_v1.0.0.md** (E7): Executive status; Scope; Scan totals; Classification totals; Move totals + unresolved; Header coverage; Legacy inbox evidence; Constraints compliance; Open exceptions + owners. כולל סעיף "Root and structure verification" (E1). | דוח סופי |
| D2 | הגשת חבילה ל־190: 7 קבצים (Scan Results, Classification Matrix, Move Log, Header Coverage, Legacy Inbox Log, Completion Report, Validation Request מעודכן) | TEAM_170_TO_TEAM_190_DOMAIN_REFACTOR_VALIDATION_REQUEST_v1.0.0.md — status: completion-ready |

---

## 3) כללי דיוק

- **סריקה אחת** — תוצאות נשמרות במטריצה; לא לסרוק מחדש בכל שלב.
- **החלטות באצווה** — סיווג IN_SCOPE vs LEGACY/ARCHIVE פעם אחת; ביצוע לפי הרשימות.
- **עדכון רק in-scope** — לא לערוך קבצי legacy/ארכיון מעבר לשורת legacy או העברה.
- **Provenance** — כל העברה: MOVED_FROM או רשומה ב־REFACTOR_LOG/דוח.

---

## 4) קישורים

- **דרישת Team 100:** `_COMMUNICATION/team_100/TEAM_100_TO_TEAM_170_DOMAIN_REFACTOR_DIRECTIVE_v1.0.0.md`
- **הוראה מורחבת Team 190 (E1–E7):** `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_170_DOMAIN_REFACTOR_DIRECTIVE_EXPANDED_v1.1.0.md`
- **קליטת מורחבת:** `_COMMUNICATION/team_170/TEAM_170_ACK_TEAM_190_DIRECTIVE_EXPANDED_v1.1.0.md`
- **סקופינג:** `_COMMUNICATION/team_170/TEAM_170_DOMAIN_REFACTOR_SCOPING_v1.0.0.md`
- **חבילת הגשה (7 קבצים):** Scan Results, Classification Matrix, Move Log, Header Coverage, Legacy Inbox Log, Completion Report, Validation Request — כולם תחת `_COMMUNICATION/team_170/`

---

**log_entry | TEAM_170 | DOMAIN_REFACTOR_PLAYBOOK | v1.0.0 | 2026-02-21**

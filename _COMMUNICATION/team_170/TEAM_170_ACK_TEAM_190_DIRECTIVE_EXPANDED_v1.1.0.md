# Team 170 — קליטת הוראה מורחבת (Domain Refactor) v1.1.0

**id:** TEAM_170_ACK_TEAM_190_DIRECTIVE_EXPANDED_v1.1.0  
**from:** Team 170 (Librarian & Structural Custodian)  
**to:** Team 190, Team 100  
**re:** TEAM_190_TO_TEAM_170_DOMAIN_REFACTOR_DIRECTIVE_EXPANDED_v1.1.0  
**date:** 2026-02-21  
**status:** ACKNOWLEDGED — EXECUTION_ALIGNED_TO_E1_E7  
**project_domain:** AGENTS_OS

---

## 1) מקור

**מסמך:** `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_170_DOMAIN_REFACTOR_DIRECTIVE_EXPANDED_v1.1.0.md`  
**בסיס:** `_COMMUNICATION/team_100/TEAM_100_TO_TEAM_170_DOMAIN_REFACTOR_DIRECTIVE_v1.0.0.md`

מאשרים קבלה. הביצוע ייעשה לפי E1–E7 עם קריטריוני קבלה מדידים; אין סטיית פרשנות.

---

## 2) מיפוי E1–E7 לתוצרים חובה

| ID | דרישה | תוצר חובה |
|----|--------|------------|
| **E1** | Root `agents_os/` (lowercase) + 7 תת־תיקיות; איחוד עם `Agents_OS/` אם קיים | Evidence ב־Completion Report: "Root and structure verification" |
| **E2** | סריקה מלאה: Agent_OS, Agents_OS, governance runtime — _COMMUNICATION, documentation, api, ui, tests, scripts, inbox | `DOMAIN_REFACTOR_SCAN_RESULTS_v1.0.0.md` |
| **E3** | סיווג לכל ארטיפקט: TIKTRACK \| AGENTS_OS \| SHARED + action + target_path + provenance_id | `DOMAIN_REFACTOR_CLASSIFICATION_MATRIX_v1.0.0.md` (columns: artifact_path, assigned_domain, classification_rationale, action, target_path, provenance_id) |
| **E4** | MOVE פיזי של כל AGENTS_OS תחת `agents_os/`; provenance לכל העברה | `DOMAIN_REFACTOR_MOVE_LOG_v1.0.0.md` (from_path, to_path, moved_at, moved_by, provenance_note) |
| **E5** | Header `project_domain: TIKTRACK \| AGENTS_OS \| SHARED` בכל markdown in-scope | `DOMAIN_REFACTOR_PROJECT_DOMAIN_HEADER_COVERAGE_v1.0.0.md` (totals, missing, invalid, exceptions) |
| **E6** | קונסולידציה: _ARCHITECTURAL_INBOX → _COMMUNICATION/_ARCHITECT_INBOX; אין refs פעילים ל־legacy | `DOMAIN_REFACTOR_LEGACY_INBOX_CONSOLIDATION_LOG_v1.0.0.md` |
| **E7** | דוח השלמה סופי | `DOMAIN_REFACTOR_COMPLETION_REPORT_v1.0.0.md` (סעיפים 1–9 per directive) |

---

## 3) חבילת הגשה ל־Team 190 (חובה)

כל הקבצים תחת `_COMMUNICATION/team_170/`:

1. `DOMAIN_REFACTOR_SCAN_RESULTS_v1.0.0.md`  
2. `DOMAIN_REFACTOR_CLASSIFICATION_MATRIX_v1.0.0.md`  
3. `DOMAIN_REFACTOR_MOVE_LOG_v1.0.0.md`  
4. `DOMAIN_REFACTOR_PROJECT_DOMAIN_HEADER_COVERAGE_v1.0.0.md`  
5. `DOMAIN_REFACTOR_LEGACY_INBOX_CONSOLIDATION_LOG_v1.0.0.md`  
6. `DOMAIN_REFACTOR_COMPLETION_REPORT_v1.0.0.md`  
7. `TEAM_170_TO_TEAM_190_DOMAIN_REFACTOR_VALIDATION_REQUEST_v1.0.0.md` (מעודכן ל־completion-ready)

---

## 4) אילוצים (קשיח)

- אין מחיקות בלי מיקום ארכיון מפורש.  
- אין כפילות אחרי MOVE.  
- לכל ארטיפקט שהועבר — provenance trail.  
- אין לוגיקת governance מחוץ ל־domain root בלי סיווג SHARED מפורש.

---

## 5) כלל ביניים

עד ש־Team 190 ייתן PASS: לא להצהיר על סיום domain refactor; לשמור סטטוס execution-in-progress.

---

**log_entry | TEAM_170 | ACK_TEAM_190_DIRECTIVE_EXPANDED_v1.1.0 | EXECUTION_ALIGNED | 2026-02-21**

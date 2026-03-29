# טבלת קבצים מרכזיים — מערכת התעוד (מעודכן)

**project_domain:** TIKTRACK (משותף)  
**id:** 00_MASTER_DOCUMENTATION_TABLE_v1.0.0  
**owner:** Team 10 (The Gateway)  
**date:** 2026-02-22  
**תיאור:** טבלה אחת של כל הקבצים המרכזיים והחשובים — נהלים, תפקידי צוותים, מצב עדכני, משימות. לכל קובץ: שם, מה מגדיר, נתיב מדויק, גרסה.

---

## 1. כניסה ומבנה

| שם קובץ | מה מגדיר | נתיב מדויק | גרסה |
|---------|----------|-------------|------|
| TikTrack Master Documentation Index | נקודת כניסה ראשית; מבנה קנוני Model B; איפה לקרוא Stage/Program/WP/Task, WSM, רשימות | `00_MASTER_INDEX.md` (שורש הפרויקט) | — |
| מבנה תיקיות התעוד — קנון מחייב | עקרונות הפרדת דומיינים; מיקום SSM/WSM/משותף vs Agents_OS; מיפוי תיקיות | `documentation/docs-governance/00_DOCUMENTATION_FOLDER_STRUCTURE_CANONICAL_v1.0.0.md` | v1.0.0 |
| GOVERNANCE_PROCEDURES_INDEX | נקודת כניסה לכל נהלי/מסמכי הממשל תחת שורש governance | `documentation/docs-governance/00-INDEX/GOVERNANCE_PROCEDURES_INDEX.md` | 2026-02-23 |
| GOVERNANCE_PROCEDURES_SOURCE_MAP | מיפוי מלא מקור→קנון לנהלים ומסמכי ממשל | `documentation/docs-governance/00-INDEX/GOVERNANCE_PROCEDURES_SOURCE_MAP.md` | 2026-02-23 |
| 00_DOCUMENTATION_STANDARDS_INDEX | תקני תעוד ממשל (ארכיון) | `documentation/docs-governance/99-archive/legacy_hold_stage3/00-FOUNDATIONS/00_DOCUMENTATION_STANDARDS_INDEX.md` | ארכיון |
| ADR_TEMPLATE_CANONICAL | תבנית ADR (ארכיון) | `documentation/docs-governance/99-archive/legacy_hold_stage3/00-FOUNDATIONS/ADR_TEMPLATE_CANONICAL.md` | ארכיון |

---

## 2. מצב נוכחי (Operational State)

| שם קובץ | מה מגדיר | נתיב מדויק | גרסה |
|---------|----------|-------------|------|
| PHOENIX_MASTER_WSM | Work State — היררכיה, חוקי שערים, **בלוק CURRENT_OPERATIONAL_STATE** (מקור יחיד לסטטוס שער פעיל, current gate, last_gate_event) | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` | v1.0.0 (מבנה v2.3.0) |
| PHOENIX_MASTER_SSM | System State — סמכויות, היררכיה קנונית, מספור, חוקי קידום ולידציה; **אין** סטטוס שוטף (רק ב־WSM) | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_SSM_v1.0.0.md` | v1.0.0 (מבנה v2.3.0) |
| PHOENIX_PORTFOLIO_ROADMAP | מפת דרכים אחת (קטלוג שלבים, נרטיב, Level-2, חלוקת עמודים) | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md` | v1.0.0 |
| PORTFOLIO_INDEX | כניסה לשכבת Portfolio קנונית (Roadmap/Program/WP — ללא Task) | `documentation/docs-governance/00-INDEX/PORTFOLIO_INDEX.md` | 2026-02-23 |
| PHOENIX_PROGRAM_REGISTRY | רג'יסטר תכניות (חד־דומיין); current_gate_mirror מ־WSM | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md` | v1.0.0 |
| PHOENIX_WORK_PACKAGE_REGISTRY | רג'יסטר חבילות עבודה; current_gate, is_active, NO_ACTIVE_WORK_PACKAGE | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md` | v1.0.0 |
| PORTFOLIO_WSM_SYNC_RULES | חוזה סנכרון: עדכון WSM → עדכון mirror ברג'יסטרים | `documentation/docs-governance/01-FOUNDATIONS/PORTFOLIO_WSM_SYNC_RULES_v1.0.0.md` | v1.0.0 |

---

## 3. משימות ורמות (Task Governance)

| שם קובץ | מה מגדיר | נתיב מדויק | גרסה |
|---------|----------|-------------|------|
| TEAM_10_MASTER_TASK_LIST | רשימת משימות מרכזית (רמה 2); סטטוס OPEN/CLOSED; תאריכי סגירה; **לא** סטטוס שער שוטף | `_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST.md` | — |
| TEAM_10_MASTER_TASK_LIST_PROTOCOL | נוהל ניהול רשימות; מי מעדכן WSM ומתי; חובת סנכרון רשימות בכל הרמות; טרמינולוגיה Stage/Program/WP/Task | `_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST_PROTOCOL.md` | — |
| TEAM_10_LEVEL2_LISTS_REGISTRY | רג'יסטרי רשימות רמה 2; קישור ל־Master List, Carryover, ארכיון | `_COMMUNICATION/team_10/TEAM_10_LEVEL2_LISTS_REGISTRY.md` | — |
| TEAM_10_LEVEL2_COMPLETION_CARRYOVER_LIST | רשימת השלמות/המשך — פריטים פתוחים שחולצו ממסמכים ארכיוניים | `_COMMUNICATION/team_10/TEAM_10_LEVEL2_COMPLETION_CARRYOVER_LIST.md` | — |

---

## 4. נהלים ופרוטוקולים (שערים, היררכיה, קידום)

| שם קובץ | מה מגדיר | נתיב מדויק | גרסה |
|---------|----------|-------------|------|
| 04_GATE_MODEL_PROTOCOL | נוהל שערים קנוני — GATE_0..GATE_8, סמכויות, היררכיה, מספור S-P-WP-T, identity header; §4.1 תפקיד Team 170 ב־GATE_1 | `documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md` | v2.3.0 |
| GATE_0_GATE_1_CANONICAL_DESIGN_GATES_LOCK | נעילת Gate 0/1; תפקיד 170 ב־GATE_1 ו־LLD400; הפניה לנוהל פנימי 170 | `documentation/docs-governance/01-FOUNDATIONS/GATE_0_GATE_1_CANONICAL_DESIGN_GATES_LOCK.md` | — |
| 05_RETRY_PROTOCOL | פרוטוקול ניסיון חוזר וחסימה — BLOCK_REPORT, החזרה לאדריכלות | `documentation/docs-governance/03-PROTOCOLS/05_RETRY_PROTOCOL.md` | — |
| ARCHITECT_KNOWLEDGE_PROMOTION_PROTOCOL | נוהל קידום ידע — Team 70 מבצע; Team 170 לא מבצע קידום | `documentation/docs-governance/03-PROTOCOLS/ARCHITECT_KNOWLEDGE_PROMOTION_PROTOCOL.md` | — |
| ARCHITECT_GOVERNANCE_PROCEDURES_V2 | נהלי ממשל כלליים (ארכיטקט) | `documentation/docs-governance/04-PROCEDURES/ARCHITECT_GOVERNANCE_PROCEDURES_V2.md` | V2 |
| KNOWN_BUGS_REMEDIATION_GOVERNANCE_PROCEDURE | נוהל קנוני מרכזי ל־known bugs: intake, routing, batched/immediate, closure | `documentation/docs-governance/04-PROCEDURES/KNOWN_BUGS_REMEDIATION_GOVERNANCE_PROCEDURE_v1.0.0.md` | v1.0.0 |
| KNOWN_BUGS_REGISTER | רג'יסטר קנוני יחיד לבאגים מאומתים | `documentation/docs-governance/01-FOUNDATIONS/KNOWN_BUGS_REGISTER_v1.0.0.md` | v1.0.0 |
| TEAM_10_GATE_ACTIONS_RUNBOOK | פעולות Team 10 לכל שער (GATE_3..GATE_8; G3.5 ולידציית תוכנית בתוך GATE_3) — מקור יחיד לפרט תפעולי | `documentation/docs-governance/04-PROCEDURES/TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0.md` | v1.0.0 |
| **AGENTS_OS_V2_OPERATING_PROCEDURES** | **נוהל פעיל יחיד** לתזרימת V2 — Pipeline CLI, הוראות לכל צוות, Context injection, MCP; כל האיגנטים משתמשים בזה | `documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md` | v1.0.0 |
| FAST_TRACK_EXECUTION_PROTOCOL | מסלול מקוצר (AGENTS_OS ברירת מחדל; TIKTRACK אופציונלי): FAST_0..FAST_4, בלעדיות מסלול, track_mode, SLA 48h, ורפרנס מחייב ל־GATE_3; §11 handoff, §12–13 domain precision | `documentation/docs-governance/04-PROCEDURES/FAST_TRACK_EXECUTION_PROTOCOL_v1.2.0.md` | v1.2.0 (active); v1.0.0 superseded historical |
| TEAM_DEVELOPMENT_ROLE_MAPPING | מיפוי קנוני + Team 110/111 (IDE architects) + Principal/pipeline §3; v1.0.0 superseded | `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.1.md` | v1.0.1 (active); v1.0.0 superseded |
| PRINCIPAL_AND_TEAM_00_MODEL | D-01…D-14 + Pipeline Fidelity Suite (PFS) — תוספת קנונית | `documentation/docs-governance/01-FOUNDATIONS/PRINCIPAL_AND_TEAM_00_MODEL_v1.0.0.md` | v1.0.0 |
| TEAM_TAXONOMY | טקסונומיית צוותים (x0/x1, professions); v1.0.0 superseded | `documentation/docs-governance/01-FOUNDATIONS/TEAM_TAXONOMY_v1.0.1.md` | v1.0.1 (active) |
| TEAM_190_CANONICAL_MESSAGE_FORMAT_LOCK | נעילת פורמט הודעות קנוני — from/to/cc, identity header, log_entry (מסמכים כקבצים) | `_COMMUNICATION/team_190/TEAM_190_TO_ALL_TEAMS_CANONICAL_MESSAGE_FORMAT_LOCK_v1.0.0.md` | v1.0.0 |
| PHOENIX_CANONICAL_TEAM_MESSAGE_GUIDE | **פרונט יחיד** — מתי מסמך (קובץ) ומתי פרומט להעתקה (בלוק); מפנה ל־190 lock ול־G36 prompts | `_COMMUNICATION/PHOENIX_CANONICAL_TEAM_MESSAGE_GUIDE_v1.0.0.md` | v1.0.0 |

---

## 5. תפקידי צוותים ויסודות חוקתיים

| שם קובץ | מה מגדיר | נתיב מדויק | גרסה |
|---------|----------|-------------|------|
| 03_IRON_RULES_AND_GOVERNANCE_CONSTITUTION | כללי ברזל וחוקת ממשל — פיניקס | `documentation/docs-governance/01-FOUNDATIONS/03_IRON_RULES_AND_GOVERNANCE_CONSTITUTION.md` | — |
| 07_TEAM_190_CONSTITUTION | חוקת Team 190 — ולידטור חוקתי; סמכויות | `documentation/docs-governance/01-FOUNDATIONS/07_TEAM_190_CONSTITUTION.md` | — |
| 03_ARTIFACT_TAXONOMY_REGISTRY | טקסונומיית ארטיפקטים — סוגי תוצרים מותרים (STATE_SNAPSHOT, EXEC_SUMMARY וכו') | `documentation/docs-governance/01-FOUNDATIONS/03_ARTIFACT_TAXONOMY_REGISTRY.md` | v1.1 |
| 00_INDEX_CANONICAL | אינדקס קנוני ל־Dev OS Target Model (תוכן 01-FOUNDATIONS) | `documentation/docs-governance/01-FOUNDATIONS/00_INDEX_CANONICAL.md` | v1.3.1 |

---

## 6. סגירת משימות (SOP-013) והנחיות חותם

| שם קובץ | מה מגדיר | נתיב מדויק | גרסה |
|---------|----------|-------------|------|
| ARCHITECT_DIRECTIVE_GOVERNANCE_STRENGTHENING | SOP-013 — סגירת משימה תקפה **רק** עם הודעת Seal; לא דוח בלבד | `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_GOVERNANCE_STRENGTHENING.md` | — |

---

## 7. תבניות ותקני דיווח

| שם קובץ | מה מגדיר | נתיב מדויק | גרסה |
|---------|----------|-------------|------|
| ARCHITECT_DECISION_TEMPLATE | תבנית החלטת אדריכל (כתיבה) | `documentation/docs-governance/06-TEMPLATES/ARCHITECT_DECISION_TEMPLATE.md` | — |
| ARCHITECT_DECISION_TEMPLATE_STANDARD | תבנית החלטה סטנדרטית | `documentation/docs-governance/06-TEMPLATES/ARCHITECT_DECISION_TEMPLATE_STANDARD.md` | — |
| ARCHITECT_VERDICT_PAGE_TEMPLATE_AND_FACTORY | תבנית ומפעל לעמודי Verdict | `documentation/docs-governance/06-TEMPLATES/ARCHITECT_VERDICT_PAGE_TEMPLATE_AND_FACTORY.md` | — |
| 08_EXEC_SUMMARY_STANDARD | תקן סיכום ביצוע | `documentation/docs-governance/08-WORKING_VALIDATION_RECORDS/08_EXEC_SUMMARY_STANDARD.md` | — |
| 09_TECHNICAL_REPORT_STANDARD | תקן דוח טכני | `documentation/docs-governance/08-WORKING_VALIDATION_RECORDS/09_TECHNICAL_REPORT_STANDARD.md` | — |

---

## 8. מדיניות והנחיות (נבחר)

| שם קובץ | מה מגדיר | נתיב מדויק | גרסה |
|---------|----------|-------------|------|
| ARCHITECT_POLICY_HYBRID_SCRIPTS | מדיניות סקריפטים היברידיים | `documentation/docs-governance/02-POLICIES/ARCHITECT_POLICY_HYBRID_SCRIPTS.md` | — |
| POL-015_TT2_PAGE_TEMPLATE_CONTRACT | חוזה תבנית עמוד קנוני (מבנה shell, סדר טעינה, אכיפה בסקריפטים) | `documentation/docs-governance/02-POLICIES/POL-015_TT2_PAGE_TEMPLATE_CONTRACT_v1.0.0.md` | v1.0.0 |
| ARCHITECT_DIRECTIVE_GOVERNANCE_STRENGTHENING | הנחיית חיזוק ממשל (SOP-013, Seal) | `documentation/docs-governance/07-DIRECTIVES_AND_DECISIONS/ARCHITECT_DIRECTIVE_GOVERNANCE_STRENGTHENING.md` | — |
| MISSION_DIRECTIVE_90_02_FINAL | מנדט משימה 90-02 | `documentation/docs-governance/07-DIRECTIVES_AND_DECISIONS/MISSION_DIRECTIVE_90_02_FINAL.md` | FINAL |
| TEAM_70_DIRECTIVE_NARRATIVE_PRODUCTION | הנחיית Team 70 — ייצור נרטיב | `documentation/docs-governance/07-DIRECTIVES_AND_DECISIONS/TEAM_70_DIRECTIVE_NARRATIVE_PRODUCTION.md` | — |

---

## 9. נהלים לפי צוות / תהליך (פעיל + ארכיון)

**הנחיה פעילה לשערים ותפקידי צוות:** `documentation/docs-governance/04-PROCEDURES/TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0.md`, `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.1.md`.

| שם קובץ | מה מגדיר | נתיב מדויק | גרסה |
|---------|----------|-------------|------|
| PHOENIX_MASTER_BIBLE | תנ"ך פיניקס (ארכיון) | `documentation/docs-governance/99-archive/legacy_hold_stage3/09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md` | ארכיון |
| CURSOR_INTERNAL_PLAYBOOK | פלייבוק פנימי (ארכיון) | `documentation/docs-governance/99-archive/legacy_hold_stage3/09-GOVERNANCE/standards/CURSOR_INTERNAL_PLAYBOOK.md` | ארכיון |
| TEAM_30_FRONTEND_STANDARDS_QA_PROCEDURE | נהל סטנדרטים ו־QA פרונט (ארכיון) | `documentation/docs-governance/99-archive/legacy_hold_stage3/02-PROCEDURES/TEAM_30_FRONTEND_STANDARDS_QA_PROCEDURE.md` | ארכיון |
| TEAM_50_QA_WORKFLOW_PROTOCOL | פרוטוקול workflow QA (ארכיון) | `documentation/docs-governance/99-archive/legacy_hold_stage3/09-GOVERNANCE/standards/TEAM_50_QA_WORKFLOW_PROTOCOL.md` | ארכיון |
| TEAM_50_QA_TEST_INDEX | אינדקס בדיקות QA (ארכיון) | `documentation/docs-governance/99-archive/legacy_hold_stage3/09-GOVERNANCE/standards/TEAM_50_QA_TEST_INDEX.md` | ארכיון |
| TEAM_170_INTERNAL_WORK_PROCEDURE | נוהל עבודה פנימי צוות 170 — GATE_1, LLD400 | `_COMMUNICATION/team_170/TEAM_170_INTERNAL_WORK_PROCEDURE.md` | — |
| TT2_KNOWLEDGE_PROMOTION_PROTOCOL | נוהל קידום ידע (ארכיון) | `documentation/docs-governance/99-archive/legacy_hold_stage3/02-PROCEDURES/TT2_KNOWLEDGE_PROMOTION_PROTOCOL.md` | ארכיון |

---

## 10. דומיין Agents_OS (מרכזיים בלבד)

| שם קובץ | מה מגדיר | נתיב מדויק | גרסה |
|---------|----------|-------------|------|
| README | מבוא למערכת Agents_OS | `agents_os/README.md` | — |
| AGENTS_OS_FOUNDATION | Foundation קצר למערכת האיגנטים | `agents_os/AGENTS_OS_FOUNDATION_v1.0.0.md` | v1.0.0 |
| ARCHITECTURAL_CONCEPT (Concept Package) | גבולות Phase 1, 10↔90, בידוד דומיין | `agents_os/docs-governance/AGENTS_OS_PHASE_1_CONCEPT_PACKAGE_v1.0.0/ARCHITECTURAL_CONCEPT.md` | v1.0.0 |
| DOMAIN_ISOLATION_MODEL | מודל בידוד דומיין — agents_os/ בלבד | `agents_os/docs-governance/AGENTS_OS_PHASE_1_CONCEPT_PACKAGE_v1.0.0/DOMAIN_ISOLATION_MODEL.md` | v1.0.0 |
| MB3A_POC_AGENT_OS_SPEC_PACKAGE | חבילת SPEC POC — MB3A, identity binding | `agents_os/docs-governance/MB3A_POC_AGENT_OS_SPEC_PACKAGE_v1.4.0.md` | v1.4.0 |
| AGENTS_OS_PHASE_1_LLD400 | אפיון Program LLD400 — Phase 1 (תוצר Team 170) | `_COMMUNICATION/team_170/AGENTS_OS_PHASE_1_LLD400_v1.0.0.md` | v1.0.0 |

---

## 11. גרסאות Gate Model (היסטוריה)

| שם קובץ | מה מגדיר | נתיב מדויק | גרסה |
|---------|----------|-------------|------|
| 04_GATE_MODEL_PROTOCOL | נוהל שערים (גרסה בסיסית) | `documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL.md` | — |
| 04_GATE_MODEL_PROTOCOL_v2.0.0 | נוהל שערים v2.0 | `documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.0.0.md` | v2.0.0 |
| 04_GATE_MODEL_PROTOCOL_v2.2.0 | נוהל שערים v2.2 | `documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.2.0.md` | v2.2.0 |

---

**הערה:** מסמכי 07-DIRECTIVES_AND_DECISIONS (כל ה־ARCHITECT_* mandates) מפורטים ב־GOVERNANCE_PROCEDURES_INDEX; כאן הובאו נציגים. למיפוי מלא — GOVERNANCE_PROCEDURES_SOURCE_MAP.

**log_entry | TEAM_170 | 00_MASTER_DOCUMENTATION_TABLE | DELIVERED | 2026-02-22**
**log_entry | TEAM_190 | 00_MASTER_DOCUMENTATION_TABLE | FAST_TRACK_PROTOCOL_REFERENCE_ADDED | 2026-02-26**
**log_entry | TEAM_170 | 00_MASTER_DOCUMENTATION_TABLE | KNOWN_BUGS_PROCEDURE_AND_REGISTER_LINKED | 2026-03-03**
**log_entry | TEAM_190 | 00_MASTER_DOCUMENTATION_TABLE | POL_015_CANONICAL_POLICY_ENTRY_ADDED | 2026-03-06**

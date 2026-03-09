# TEAM_61_TO_TEAM_70_V2_GOVERNANCE_DOCUMENTATION_MANDATE_v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)
**id:** TEAM_61_TO_TEAM_70_V2_GOVERNANCE_DOCS_v1.0.0
**from:** Team 61 (Cloud Agent / DevOps Automation)
**to:** Team 70 (Librarian / Product Intelligence)
**cc:** Team 10 (Gateway), Team 190 (Constitutional Validator), Team 00 (Chief Architect)
**date:** 2026-03-09
**status:** ACTION_REQUIRED
**gate_id:** N/A
**work_package_id:** N/A

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | N/A |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | N/A |
| phase_owner | Team 61 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

## 1) Purpose

Agents_OS V2 אושר ומומזג ל-main (Team 190 PASS + Team 50 E2E PASS). נדרש עכשיו **ארכיטוב נהלי עבודה חדשים** שישלבו את V2 בתהליכי הפיתוח ויעדכנו את כל הצוותים.

שלושה תוצרים נדרשים:
1. **תיעוד נהלי עבודה חדשים** עם V2 Pipeline
2. **עדכון מסמכי משילות קיימים** שמושפעים מ-V2
3. **הנחיות משילות לכל הצוותים** — כיצד לעבוד עם V2

**לאחר השלמת התיעוד — ולידציה ע"י Team 190.**

## 2) Context / Inputs

### מה V2 משנה בתהליך העבודה

**לפני V2 (היום):**
- Team 10 (Gateway) = צ'אט ב-Cursor Composer שמנוהל ידנית ע"י Nimrod
- Nimrod מעתיק context בין ~12 agent sessions
- אין state tracking אוטומטי
- אין prompt generation אוטומטי
- context drift בשיחות ארוכות

**אחרי V2:**
- Team 10 = **V2 Orchestrator** (deterministic Python CLI) + Cursor Composer לפעולות LLM
- Pipeline CLI מנהל state, מייצר prompts, מוולדט outputs
- כל prompt כולל 4 שכבות context (identity + governance + state + task)
- MCP browser test scenarios מוגדרים ל-18 entities
- Evidence validation אוטומטי

### V2 Pipeline Flow

```
python3 -m agents_os_v2.orchestrator.pipeline --spec "feature description"
│
├── GATE_0:  Team 190 (Codex) validates scope
├── GATE_1:  Team 170 (Gemini) produces LLD400 → Team 190 validates  
├── GATE_2:  Team 100 (Claude Code) approves intent
├── G3_PLAN: Cursor Composer builds work plan
├── G3_5:    Team 90 (Codex) validates work plan
├── G3_6:    Orchestrator generates per-team mandates
├── CURSOR:  Cursor Composer sessions (Teams 20/30) implement + MCP test
├── GATE_4:  Team 10 coordinates, Team 50 (Cursor+MCP) executes QA
├── GATE_5:  Team 90 (Codex) dev validation
├── GATE_6:  Team 90 executes, Team 100 (Claude Code) approves reality
├── GATE_7:  Team 90 executes, Nimrod (Team 00) reviews UX
└── GATE_8:  Team 90 + Team 70 documentation closure
```

### Gate Ownership (per Protocol v2.3.0 — verified by Team 190)

| Gate | Owner | Engine | Notes |
|------|-------|--------|-------|
| GATE_0 | Team 190 | Codex | Unchanged |
| GATE_1 | Team 190 | Codex | Unchanged |
| GATE_2 | Team 100 | Claude Code | Unchanged — Team 100 approval authority |
| GATE_3 | Team 10 | **V2 Orchestrator + Cursor** | Changed: Orchestrator replaces manual Team 10 chat |
| GATE_4 | Team 10 | Cursor + MCP | Unchanged — Team 50 executes QA |
| GATE_5 | Team 90 | Codex | Unchanged |
| GATE_6 | Team 90 | Codex | Unchanged — Team 100 approval authority |
| GATE_7 | Team 90 | Human | Unchanged — Nimrod authority |
| GATE_8 | Team 90 | Codex | Unchanged |

### Team 61 — הגדרה (אושרה ע"י Team 00 + Team 190)

| Field | Value |
|---|---|
| Team ID | 61 |
| Name | Cloud Agent / DevOps Automation |
| Platform | Cursor Cloud Agent |
| Role | CI/CD, quality scanning, Agents_OS V2 infrastructure, unit tests |
| Scope | `agents_os_v2/`, `.github/workflows/`, quality tooling, `tests/unit/` |
| Reports to | Team 10 (tasks), Team 00 (strategy) |
| Does not | Modify production code without mandate, approve gates, replace Team 90/50 |

### קבצי מקור ב-main

| Category | Path |
|----------|------|
| V2 Orchestrator | `agents_os_v2/orchestrator/pipeline.py` |
| V2 Config | `agents_os_v2/config.py` |
| Team identities | `agents_os_v2/context/identity/team_*.md` (12 files) |
| Governance rules | `agents_os_v2/context/governance/gate_rules.md` |
| Coding conventions | `agents_os_v2/context/conventions/` |
| MCP test scenarios | `agents_os_v2/mcp/test_scenarios.py` (18 scenarios) |
| Evidence validator | `agents_os_v2/mcp/evidence_validator.py` |
| Validators | `agents_os_v2/validators/` (7 modules) |
| CI/CD pipeline | `.github/workflows/ci.yml` |
| V2 Master Plan | `_COMMUNICATION/team_00/AGENTS_OS_V2_MASTER_PLAN_LOCKED_2026-03-03.md` |
| Quality scan | `_COMMUNICATION/team_00/CLOUD_AGENT_QUALITY_SCAN_REPORT_2026-03-03.md` |

## 3) Required actions

### A. תיעוד נהלי עבודה חדשים

צור מסמך: **"Agents_OS V2 Operating Procedures"** שכולל:

1. **Pipeline Usage Guide** — איך להשתמש ב-V2 Pipeline CLI (--spec, --status, --next, --generate-prompt, --advance)
2. **Per-team instructions** — מה משתנה לכל צוות:
   - Teams 20/30/40/60: מקבלים mandates מ-V2 (לא מ-Team 10 chat)
   - Teams 90/190: ממשיכים כרגיל ב-Codex, prompts מגיעים מ-V2
   - Team 50: QA כולל MCP browser test scenarios מ-V2
   - Team 100: architectural decisions ב-Claude Code, prompts מ-V2
   - Team 70: GATE_8 documentation closure unchanged
   - Team 61: maintains V2, CI/CD, quality scans
3. **Context injection** — הסבר: כל prompt מ-V2 כולל 4 שכבות (identity, governance, state, task). הצוותים לא צריכים לבנות context בעצמם.
4. **MCP integration** — איך MCP browser tests משתלבים ב-GATE_4 ובפיתוח

### B. עדכון מסמכים קיימים

| מסמך | מה לעדכן |
|------|---------|
| `TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md` | הוספת Team 61 |
| `.cursorrules` | הוספת Team 61 ל-Squad IDs |
| `TEAM_10_GATEWAY_ROLE_AND_PROCESS.md` | הוספת V2 Orchestrator כאופציה ל-Team 10 operations |
| `00_MASTER_INDEX.md` | הוספת `_COMMUNICATION/team_61/` ו-`agents_os_v2/` |

### C. הוראות משילות לכל הצוותים

צור הודעה קנונית **לכל הצוותים** (per canonical message format) שמודיעה על:
1. V2 מאושר ופעיל
2. Team 61 חדש — תפקיד וגבולות
3. מה משתנה per team
4. קישור לנהלים המעודכנים

## 4) Deliverables and paths

1. `documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md` — נהלי עבודה חדשים
2. Updated: `TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md` — with Team 61
3. Updated: `.cursorrules` — with Team 61
4. Updated: `00_MASTER_INDEX.md` — if needed
5. `_COMMUNICATION/team_70/TEAM_70_TO_ALL_TEAMS_V2_GOVERNANCE_NOTICE.md` — הודעה לצוותים
6. `_COMMUNICATION/team_70/TEAM_70_V2_GOVERNANCE_DOCUMENTATION_COMPLETION.md` — completion report

**לאחר השלמה → העבר ל-Team 190 לולידציה.**

## 5) Validation criteria (PASS/FAIL)

1. V2 Operating Procedures document exists and covers: pipeline usage, per-team instructions, context injection, MCP integration
2. TEAM_DEVELOPMENT_ROLE_MAPPING includes Team 61 with complete definition
3. .cursorrules includes Team 61 in squad list
4. All-teams governance notice sent in canonical format
5. No conflicts with existing governance documents
6. Team 190 validates and confirms PASS

## 6) Response required

- Completion report with artifact paths
- Governance notice ready for distribution
- Ready for Team 190 validation

log_entry | TEAM_61 | V2_GOVERNANCE_DOCUMENTATION_MANDATE | ACTION_REQUIRED | 2026-03-09

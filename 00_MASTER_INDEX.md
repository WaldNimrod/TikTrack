# TikTrack Master Documentation Index — Entry Point

**id:** `D15_MASTER_INDEX`  
**owner:** Team 10 (The Gateway)  
**status:** Entry point — canonical structure post Phoenix Cutover  
**last_updated:** 2026-03-28
**deprecated_alias_notice:** Legacy prefix `documentation/docs-governance/PHOENIX_CANONICAL/` is deprecated for active authority routing; use `documentation/docs-governance/01-FOUNDATIONS/` canonical paths.

### חזון ועיקרון הפעלה: 3 מצבי העבודה (3 Modes of Operation)
**תובנת יסוד מחייבת:** תיעוד המשילות (Governance) שלנו מהווה ציר מרכזי ונקודת אמת (SSOT) יחידה לכל המערכת, בכל שלושת מצבי העבודה:
1. **Chat Mode (ישיר):** עבודה ישירה מול איגנטים/צוותים בעלי קונטקסט ותפקיד ברור בצ'אט (כמו בסביבת Cursor IDE).
2. **Semi-Auto Mode (חצי-אוטומטי):** ניהול ותפעול דרך ה-AOS Dashboard וממשקי ה-UI של הפייפליין.
3. **Auto Mode (אוטומטי מלא):** הרצה אוטומטית לחלוטין של הפייפליין והמערכת מול מנועי ה-API.
**החוקה והנהלים חלים באופן זהה והרמוני על כל המצבים.** איגנט לא יכול לחרוג מנוהל או לדלג על שער רק בגלל שהוא עובד במצב "צ'אט".

### Active agent context (all agents — single source of truth)

**כל האיגנטים (Cursor, Cloud Agent, וכל רץ אחר) מחויבים להשתמש רק במסמכים הבאים.** אין שימוש פעיל בנתיבי נוהל legacy.

| Purpose | Path |
|--------|------|
| Squad ID + mandatory files | `.cursorrules` (repo root) |
| Role mapping (20/30/40/50/51/60/61/70/90/100/110/111/170/190/191) | `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.1.md` |
| Principal / Team 00 + PFS | `documentation/docs-governance/01-FOUNDATIONS/PRINCIPAL_AND_TEAM_00_MODEL_v1.0.0.md` |
| Team taxonomy (x0/x1, professions) | `documentation/docs-governance/01-FOUNDATIONS/TEAM_TAXONOMY_v1.0.1.md` |
| **Active workflow & orchestration** | `documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md` |
| WSM + Gate Model | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`, `04_GATE_MODEL_PROTOCOL_v2.3.0.md` |

**לא פעיל (הועבר לארכיון):** `documentation/docs-governance/09-GOVERNANCE/standards/` (כולל PHOENIX_MASTER_BIBLE, CURSOR_INTERNAL_PLAYBOOK) — לא קיים בנתיב פעיל; הוחלף במסמכים למעלה וב־V2 Operating Procedures.

---

## Domain entry points (פיצול לפי דומיין)

| דומיין | נקודת כניסה | תוכן |
|--------|-------------|------|
| **TIKTRACK** | [documentation/docs-system/](documentation/docs-system/) | ארכיטקטורה, שרת, עיצוב, מוצר — ראה [00_INDEX (docs-system)](documentation/docs-system/00_INDEX.md) (כולל §3: D33 / S003-P004-WP001). |
| **AGENTS_OS** | [agents_os/documentation/00_INDEX.md](agents_os/documentation/00_INDEX.md) | ספריית תיעוד Agents_OS (מסלול v2 / UI): 01-FOUNDATIONS, 02-SPECS, 03-TEMPLATES (קישור ל־06-TEMPLATES). |
| **AGENTS_OS — v3 (BUILD)** | [documentation/docs-agents-os/00_AGENTS_OS_MASTER_INDEX.md](documentation/docs-agents-os/00_AGENTS_OS_MASTER_INDEX.md) | תיעוד קנוני **v3** (Directive 3B): קבצי `AGENTS_OS_V3_*` תחת `documentation/docs-agents-os/` (Overview, Architecture, API, Runbook, Checklist); ענף פיתוח `aos-v3`. |
| **משותף (משילות)** | [documentation/docs-governance/00-INDEX/](documentation/docs-governance/00-INDEX/) | WSM, SSM, נהלים, חוזים, תבניות (כולל LLD400, LOD200 ב־06-TEMPLATES). |

**דוחות וארטיפקטים (נתיב קנוני יחיד):** `documentation/reports/05-REPORTS`, `documentation/reports/08-REPORTS` בלבד. אסור ליצור או להשתמש ב־`documentation/05-REPORTS` או `05-REPORTS` בשורש ה־repo.

---

## Canonical Structure — Model B (Approved)

**Topology decision:** Model B — canonical layers under `documentation/` (per Architect/Team 10 approval, 2026-02-17).

| Location | Contents |
|----------|----------|
| `documentation/docs-system/` | 01-ARCHITECTURE, 02-SERVER, 07-DESIGN, 08-PRODUCT |
| `documentation/docs-agents-os/` | תיעוד טכני **Agents_OS** (v2 + **v3**): אינדקס `00_AGENTS_OS_MASTER_INDEX.md`; קבצי **v3** עם קידומת `AGENTS_OS_V3_` (01-OVERVIEW … 05-TEMPLATES). |
| `documentation/docs-governance/` | 00-INDEX, 01-FOUNDATIONS (SSM/WSM/Gate Model), 02-POLICIES, 04-PROCEDURES, 05-CONTRACTS, 06-TEMPLATES, 07-DIRECTIVES_AND_DECISIONS, 08-WORKING_VALIDATION_RECORDS, AGENTS_OS_GOVERNANCE, 99-archive. **מבנה תיקיות מחייב:** `documentation/docs-governance/00_DOCUMENTATION_FOLDER_STRUCTURE_CANONICAL_v1.0.0.md` |
| `documentation/reports/` | 05-REPORTS, 08-REPORTS *(נתיב קבוע לארטיפקטים ודוחות)* |
| `archive/` | documentation, code |
| `agents_os_v2/` | V2 Orchestrator (pipeline, config, context/identity, context/governance, mcp/test_scenarios, validators); canonical per Team 61 mandate 2026-03-09 |
| `_COMMUNICATION/` | _Architects_Decisions, _ARCHITECT_INBOX, 90_Architects_comunication, team_* (כולל team_10, team_61, team_70, team_90, team_100, team_170, team_190, team_191) |

**Architect decisions (חוקי יסוד):** `_COMMUNICATION/_Architects_Decisions/`

### Architect Channels (Canonical)

| Path | Purpose | Authority |
|---|---|---|
| `_COMMUNICATION/_Architects_Decisions/` | Locked architect decisions | SSOT architect layer |
| `_COMMUNICATION/_ARCHITECT_INBOX/` | Submissions to architect | Submission channel only |
| `_COMMUNICATION/90_Architects_comunication/` | Operational communication with architect | Communication only (non-SSOT) |

**Legacy snapshots (historical):**
- `archive/documentation_legacy/snapshots/2026-02-17_0000/` → [00_LEGACY_INDEX_SNAPSHOT_2026-02-17.md](archive/documentation_legacy/snapshots/2026-02-17_0000/00-MANAGEMENT/00_LEGACY_INDEX_SNAPSHOT_2026-02-17.md)
- `archive/documentation_legacy/snapshots/2026-02-18_0200/` → `ARCHIVE_MANIFEST_LEVEL2_ALIGNMENT.md`

## Stage / Program / Work Package / Task — Where to read (כל האיגנטים)

**חד־משמעי:** היררכיה ומספור לפי 04_GATE_MODEL_PROTOCOL_v2.3.0 (Stage → Program → Work Package → Task; S{NNN}-P{NNN}-WP{NNN}-T{NNN}).

| מה צריך | איפה (נתיב מלא) | הערה |
|---------|-------------------|------|
| **מצב נוכחי (operational state)** — active Stage, current gate, active Program/Work Package, last_gate_event | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` — בלוק **CURRENT_OPERATIONAL_STATE** בלבד | מקור יחיד; מעודכן על ידי Gate Owner בכל סגירת שער |
| **מצב מסלול (NORMAL/FAST) + HOLD reason** | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` — fields `track_mode`, `suspended_track_state`, `hold_reason` | `gate_id` נשאר קנוני; תצוגת מסלול: `GATE_X [NORMAL/FAST]` |
| **כללי היררכיה ומספור** | `documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md`; SSM: `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_SSM_v1.0.0.md` | אין סטטוס שוטף ב־SSM; רק ב־WSM |
| **רשימת משימות (Tasks) — סטטוס OPEN/CLOSED, תאריכי סגירה** | `_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST.md` | רמה 2; מתעדכן על ידי Team 10; סטטוס שער שוטף לא כאן — ב־WSM |
| **מפת דרכים (Stages)** | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md` | מפת דרכים אחת (קטלוג, נרטיב, Level-2, חלוקת עמודים) |
| **Portfolio קנוני (Stage/Program/WP)** | `documentation/docs-governance/00-INDEX/PORTFOLIO_INDEX.md` | קטלוג קנוני; runtime רק ב־WSM |
| **Known Bugs Register (canonical)** | `documentation/docs-governance/01-FOUNDATIONS/KNOWN_BUGS_REGISTER_v1.0.0.md` | רג'יסטר קנוני יחיד לבאגים מאומתים (BLOCKING/באטצ'ד) |
| **Known Bugs Procedure (central)** | `documentation/docs-governance/04-PROCEDURES/KNOWN_BUGS_REMEDIATION_GOVERNANCE_PROCEDURE_v1.0.0.md` | נוהל קנוני: intake/routing/closure ל־known bugs |
| **נוהל ניהול רשימות + מי מעדכן WSM ומתי + חובה סנכרון רשימות** | `_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST_PROTOCOL.md` | §1.2.2: Gate Owner מעדכן WSM; Team 10 מסנכרן רשימות בכל הרמות |
| **נוהל מסלול מקוצר (AGENTS_OS ברירת מחדל; TIKTRACK אופציונלי)** | `documentation/docs-governance/04-PROCEDURES/FAST_TRACK_EXECUTION_PROTOCOL_v1.2.0.md` | FAST_0..FAST_4; handoff חובה בפרומט גנרי מפורט (§11); §12–13 domain/validation precision |

**כלל:** שינוי סטטוס Program/Work Package (כולל עדכון WSM) מחייב עדכון רשימות רמה 2 (והתאם רמה 1/3) — ראה נוהל.

---

## Task Governance Anchors (3 Levels)

| Level | Canonical source |
|---|---|
| Level 1 — Roadmap | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md` |
| Level 2 — Task lists registry | `_COMMUNICATION/team_10/TEAM_10_LEVEL2_LISTS_REGISTRY.md` |
| Level 2 — Master list | `_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST.md` |
| Level 2 — Carryover list | `_COMMUNICATION/team_10/TEAM_10_LEVEL2_COMPLETION_CARRYOVER_LIST.md` |
| Level 3 — Execution plans/reports | `_COMMUNICATION/team_20|30|31|40|50|60|61|70|90|100|170|190/` |

**Fixed Level-2 filenames (mandatory across all stages):**
- `TEAM_10_MASTER_TASK_LIST.md`
- `TEAM_10_LEVEL2_COMPLETION_CARRYOVER_LIST.md`
- `TEAM_10_LEVEL2_LISTS_REGISTRY.md`

**Deprecated Level-2 source (archived):** `_COMMUNICATION/99-ARCHIVE/2026-02-18/team_10/TEAM_10_OPEN_TASKS_MASTER.md`

### SOP-013 (Closure/Seal policy) — canonical only

| Item | Value |
|------|--------|
| **Canonical location** | `_COMMUNICATION/_Architects_Decisions/` |
| **Canonical file name** | `ARCHITECT_DIRECTIVE_GOVERNANCE_STRENGTHENING.md` |
| **Full path** | `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_GOVERNANCE_STRENGTHENING.md` |
| **Rule** | Task closure valid only with Seal Message (SOP-013); no report-only acceptance. Old path `documentation/07-POLICIES/TT2_GOVERNANCE_V2_102_SOP_013_CLOSURE_GATE.md` is **archived context only**. |

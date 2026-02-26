# TikTrack Master Documentation Index — Entry Point

**id:** `D15_MASTER_INDEX`  
**owner:** Team 10 (The Gateway)  
**status:** Entry point — canonical structure post Phoenix Cutover  
**last_updated:** 2026-02-26
**deprecated_alias_notice:** Legacy prefix `documentation/docs-governance/PHOENIX_CANONICAL/` is deprecated for active authority routing; use `documentation/docs-governance/01-FOUNDATIONS/` canonical paths.

---

## Canonical Structure — Model B (Approved)

**Topology decision:** Model B — canonical layers under `documentation/` (per Architect/Team 10 approval, 2026-02-17).

| Location | Contents |
|----------|----------|
| `documentation/docs-system/` | 01-ARCHITECTURE, 02-SERVER, 07-DESIGN, 08-PRODUCT |
| `documentation/docs-governance/` | 00-INDEX, 01-FOUNDATIONS (SSM/WSM/Gate Model), 02-POLICIES, 04-PROCEDURES, 05-CONTRACTS, 06-TEMPLATES, 07-DIRECTIVES_AND_DECISIONS, 08-WORKING_VALIDATION_RECORDS, AGENTS_OS_GOVERNANCE, 99-archive. **מבנה תיקיות מחייב:** `documentation/docs-governance/00_DOCUMENTATION_FOLDER_STRUCTURE_CANONICAL_v1.0.0.md` |
| `documentation/reports/` | 05-REPORTS, 08-REPORTS |
| `archive/` | documentation, code |
| `_COMMUNICATION/` | _Architects_Decisions, _ARCHITECT_INBOX, 90_Architects_comunication, team-* (כולל team_10, team_70, team_90, team_100, team_170, team_190) |

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
| **כללי היררכיה ומספור** | `documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md`; SSM: `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_SSM_v1.0.0.md` | אין סטטוס שוטף ב־SSM; רק ב־WSM |
| **רשימת משימות (Tasks) — סטטוס OPEN/CLOSED, תאריכי סגירה** | `_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST.md` | רמה 2; מתעדכן על ידי Team 10; סטטוס שער שוטף לא כאן — ב־WSM |
| **מפת דרכים (Stages)** | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md` | מפת דרכים אחת (קטלוג, נרטיב, Level-2, חלוקת עמודים) |
| **Portfolio קנוני (Stage/Program/WP)** | `documentation/docs-governance/00-INDEX/PORTFOLIO_INDEX.md` | קטלוג קנוני; runtime רק ב־WSM |
| **נוהל ניהול רשימות + מי מעדכן WSM ומתי + חובה סנכרון רשימות** | `_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST_PROTOCOL.md` | §1.2.2: Gate Owner מעדכן WSM; Team 10 מסנכרן רשימות בכל הרמות |

**כלל:** שינוי סטטוס Program/Work Package (כולל עדכון WSM) מחייב עדכון רשימות רמה 2 (והתאם רמה 1/3) — ראה נוהל.

---

## Task Governance Anchors (3 Levels)

| Level | Canonical source |
|---|---|
| Level 1 — Roadmap | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md` |
| Level 2 — Task lists registry | `_COMMUNICATION/team_10/TEAM_10_LEVEL2_LISTS_REGISTRY.md` |
| Level 2 — Master list | `_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST.md` |
| Level 2 — Carryover list | `_COMMUNICATION/team_10/TEAM_10_LEVEL2_COMPLETION_CARRYOVER_LIST.md` |
| Level 3 — Execution plans/reports | `_COMMUNICATION/team_20|30|31|40|50|60|70|90|100|170|190/` |

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

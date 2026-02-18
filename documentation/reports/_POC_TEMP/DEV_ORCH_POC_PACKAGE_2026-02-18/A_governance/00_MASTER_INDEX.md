# TikTrack Master Documentation Index — Entry Point

**id:** `D15_MASTER_INDEX`  
**owner:** Team 10 (The Gateway)  
**status:** Entry point — canonical structure post Phoenix Cutover  
**last_updated:** 2026-02-18

---

## Canonical Structure — Model B (Approved)

**Topology decision:** Model B — canonical layers under `documentation/` (per Architect/Team 10 approval, 2026-02-17).

| Location | Contents |
|----------|----------|
| `documentation/docs-system/` | 01-ARCHITECTURE, 02-SERVER, 07-DESIGN, 08-PRODUCT |
| `documentation/docs-governance/` | 00-FOUNDATIONS, 01-POLICIES, 02-PROCEDURES, 06-CONTRACTS, 09-GOVERNANCE |
| `documentation/reports/` | 05-REPORTS, 08-REPORTS |
| `archive/` | documentation, code |
| `_COMMUNICATION/` | _Architects_Decisions, _ARCHITECT_INBOX, 90_Architects_comunication, team-* (כולל team_70, team_100) |

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

## Task Governance Anchors (3 Levels)

| Level | Canonical source |
|---|---|
| Level 1 — Roadmap | `_COMMUNICATION/_Architects_Decisions/PHOENIX_UNIFIED_MODULAR_ROADMAP_V2_1.md` |
| Level 2 — Task lists registry | `_COMMUNICATION/team_10/TEAM_10_LEVEL2_LISTS_REGISTRY.md` |
| Level 2 — Master list | `_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST.md` |
| Level 2 — Carryover list | `_COMMUNICATION/team_10/TEAM_10_LEVEL2_COMPLETION_CARRYOVER_LIST.md` |
| Level 3 — Execution plans/reports | `_COMMUNICATION/team_20|30|31|40|50|51|60|70|90|100/` |

**Fixed Level-2 filenames (mandatory across all stages):**
- `TEAM_10_MASTER_TASK_LIST.md`
- `TEAM_10_LEVEL2_COMPLETION_CARRYOVER_LIST.md`
- `TEAM_10_LEVEL2_LISTS_REGISTRY.md`

**Deprecated Level-2 source (archived):** `_COMMUNICATION/99-ARCHIVE/2026-02-18/team_10/TEAM_10_OPEN_TASKS_MASTER.md`

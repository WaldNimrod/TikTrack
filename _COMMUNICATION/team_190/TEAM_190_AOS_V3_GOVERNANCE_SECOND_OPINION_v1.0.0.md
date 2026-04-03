---
id: TEAM_190_AOS_V3_GOVERNANCE_SECOND_OPINION_v1.0.0
historical_record: true
from: Team 190
to: Team 100, Team 00
date: 2026-03-25
status: SUBMITTED
part: A---

# Team 190 — Part A Governance Structure Second Opinion

Gate Decision  
STATUS: CONFIRM_WITH_ADDITIONS  
REASON: Team 00 correctly identified the core governance-structure problem, but several material gaps and one factual overstatement were found.

---

## Confirmed Findings

1. **Problem-1 validated (shared vs domain-specific bleed):** `documentation/docs-governance/04-PROCEDURES/` currently mixes domain-specific files (`AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md`, `TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0.md`) inside shared governance.
2. **Problem-2 validated (TikTrack conventions under AOS code tree):** `agents_os_v2/context/conventions/backend.md` starts with "TikTrack Phoenix" and describes TikTrack backend stack under an AOS path.
3. **Problem-3 validated (multi-representation drift):** team definitions are split across `TEAMS_ROSTER_v1.0.0.json`, `agents_os_v2/context/identity/team_*.md`, and hardcoded UI catalog in `agents_os/ui/js/pipeline-teams.js`.
4. **SSOT note mismatch validated:** `_meta.note` in `TEAMS_ROSTER_v1.0.0.json` declares roster SSOT and "UI reads from this file directly", while `pipeline-teams.js` still sets `uiSource: "hardcoded"` and maintains local `TEAMS` / `TEAM_GROUPS`.

---

## Additional Findings

| Finding | Severity | Description |
|---|---|---|
| AF-01 | HIGH | **Canonical-path collapse risk:** `documentation/docs-governance/AGENTS_OS_GOVERNANCE/` is practically empty (no files found), but many artifacts still declare it as canonical target path. This is now a reference-integrity issue, not only a folder-placement issue. |
| AF-02 | HIGH | **Migration target ambiguity:** proposed destinations (`documentation/docs-system/04-PROCEDURES/`, `documentation/docs-system/05-CONVENTIONS/`) are not present today, creating undefined landing zones for moved files. |
| AF-03 | HIGH | **Team catalog divergence is measurable now:** Roster=16 teams, UI hardcoded catalog=19 teams, Identity files=15 teams. Drift is active, not theoretical. |
| AF-04 | MEDIUM | **Roster coverage gap:** UI includes `team_11`, `team_101`, `team_102` but these are absent in `TEAMS_ROSTER_v1.0.0.json`; meanwhile roster includes teams (e.g. `team_31`, `team_191`) with no corresponding identity markdown files. |
| AF-05 | MEDIUM | **Auto-gen chain is underspecified:** proposal references `seed.py` generation path, but no concrete generation script was found under `agents_os_v2/scripts/` for `TEAMS_ROSTER -> team_XX.md`. |
| AF-06 | MEDIUM | **Shared governance entry points are path-hardcoded broadly:** `00_MASTER_INDEX.md`, `AGENTS.md`, skills, and many communication artifacts hardcode current procedure paths, increasing blast radius of structural moves. |
| AF-07 | LOW | **_COMMUNICATION domain-boundary signal is weak:** combined use of per-team folders, per-domain folders (`_COMMUNICATION/agents_os`, `_COMMUNICATION/tiktrack`), and archive namespaces increases cross-domain traceability friction. |

---

## Disputed Points

| Point | Team 00 Claim | My Assessment | Rationale |
|---|---|---|---|
| DP-01 | "`docs-governance/AGENTS_OS_GOVERNANCE` contains AOS-specific governance in shared location" | **PARTIAL_DISPUTE** | The structural concern is valid, but current repository evidence shows the folder is nearly empty (only `02-TEMPLATES/` dir, no files). Current risk shifted to stale canonical references. |
| DP-02 | "`TEAM_10_GATE_ACTIONS_RUNBOOK` is TikTrack-only in shared folder" | **PARTIAL_DISPUTE** | File header explicitly declares `project_domain: SHARED (TIKTRACK + AGENTS_OS)`. Problem is not pure TikTrack ownership, but mixed shared/legacy/domain semantics in one operational runbook. |

---

## Migration Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Hardcoded path break across docs/skills/indexes | HIGH | HIGH | Provide alias map + path shim period + automated link-validation gate before path cutover. |
| Broken superseded pointers in `_COMMUNICATION/_Architects_Decisions` | HIGH | HIGH | Bulk rewrite canonical-location headers using deterministic migration table and checksum report. |
| SSOT drift persists after move (roster/UI/identity not converged) | HIGH | HIGH | Enforce schema-based parity checks across all three sources as a release gate. |
| Loss of LLM-critical narrative in naive auto-gen identity files | MEDIUM | HIGH | Use hybrid generation model: structured roster fields + narrative overlays/templates with validation rules. |
| Missing destination branches for planned moved files | MEDIUM | MEDIUM | Predefine destination tree contracts (folder contract + allowed artifact classes) before migration. |
| Domain bleed in `_COMMUNICATION` during transition | MEDIUM | MEDIUM | Add domain-tagged metadata contract for communication artifacts and enforce in filename/header lint. |

---

## SSOT Convergence Assessment

`TEAMS_ROSTER -> seed.py -> team_XX.md` is viable **only** under explicit constraints:

1. **Data model parity contract:** every field required by runtime prompt identity must either exist in roster schema or be generated from deterministic template rules.
2. **Narrative preservation rule:** mode-aware role text, hard rules, and canonical-source lines currently present in `team_XX.md` cannot be dropped by JSON-only generation.
3. **UI source-of-truth enforcement:** `pipeline-teams.js` must stop acting as authoritative team catalog (it can remain a renderer/enricher).
4. **Completeness gates:** convergence requires automated checks for `(roster IDs == UI IDs == identity IDs)` with explicit exceptions registry.

Current state indicates **non-converged SSOT** (measured drift), so auto-generation is realistic but currently under-specified.

---

## Recommendations

1. Reframe the main risk from "folder placement only" to "canonical-reference integrity + source convergence" and treat both as first-class governance constraints.
2. Define a typed Team Definition Contract that separates: `structured authority fields`, `runtime narrative fields`, `UI presentation fields`, and `generated/derived fields`.
3. Adopt migration with explicit compatibility window (path aliasing + machine-checked reference matrix) rather than direct cutover.
4. Require measurable convergence criteria before declaring SSOT completion (IDs parity, schema parity, and identity-content parity).
5. Treat `_COMMUNICATION` domain labeling strategy as part of governance architecture, not as a documentation housekeeping item.

---

**log_entry | TEAM_190 | AOS_V3_GOVERNANCE_SECOND_OPINION | PART_A | CONFIRM_WITH_ADDITIONS | 2026-03-25**

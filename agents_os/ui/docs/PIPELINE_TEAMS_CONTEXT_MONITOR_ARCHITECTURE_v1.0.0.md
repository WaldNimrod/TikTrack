# PIPELINE_TEAMS Context Monitor Architecture v1.0.0

**document_id:** PIPELINE_TEAMS_CONTEXT_MONITOR_ARCHITECTURE_v1.0.0  
**owner:** Team 61 (implementation) + Team 190 (gap analysis inputs) + Team 00 (product direction)  
**date:** 2026-03-20  
**status:** ACTIVE_DRAFT  
**scope:** `agents_os/ui/PIPELINE_TEAMS.html` + `agents_os/ui/js/pipeline-teams.js` + `agents_os/ui/css/pipeline-teams.css`

---

## 1. Objective

Upgrade the Teams dashboard page so Team 00 and system users can:
1. Understand context architecture (4 layers) clearly.
2. Monitor cross-source consistency and detect gaps fast.
3. Drill down to full source content without leaving the page.
4. Prepare for the next phase: dynamic Team Management (editable parameters + process defaults by domain/variant).

---

## 2. UX Structure (Current Implementation)

The page now has three functional blocks:

| Block | Purpose |
|---|---|
| Team Profile + Prompt Generator | Existing capabilities: role view + RAG/hard prompt copy |
| Context Structure Monitor | KPI cards + layer map + cross-source matrix + gap tracker |
| Drilldown (Full Content) | Source/team selector showing full raw content (JSON/MD/PY) |

All monitor sections are implemented as canonical accordion containers (`<details>`), to avoid overload and preserve progressive disclosure.

---

## 3. Data Sources Used by Context Monitor

| Source | Path | Used for |
|---|---|---|
| Team roster JSON | `documentation/docs-governance/01-FOUNDATIONS/TEAMS_ROSTER_v1.0.0.json` | Canonical team schema + metadata |
| Role mapping | `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md` | Governance role baseline |
| AOS operating procedures | `documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md` | 4-layer context definition |
| Injection runtime | `agents_os_v2/context/injection.py` | Actual context builder implementation |
| Runtime config | `agents_os_v2/config.py` | Engine map + domain defaults |
| Engine overrides | `_COMMUNICATION/agents_os/team_engine_config.json` | Runtime override layer |
| Runner onboarding docs | `AGENTS.md` + `.cursorrules` | Onboarding/team bootstrap constraints |
| Identity docs | `agents_os_v2/context/identity/team_*.md` | Team-level identity payloads |

---

## 4. Cross-Source Matrix Logic

For each team ID in the union set (roster + UI + config + override):
1. `inRoster`
2. `inUI`
3. `hasIdentity`
4. `inConfigMap`
5. `inOverride`
6. `inCursorrules`
7. `rosterEngine` vs `ui/overrideEngine`

Derived gaps are auto-generated with severity tags:
- `HIGH`: structural SSOT violations and missing identity for active UI teams
- `MEDIUM`: engine contradictions and partial runtime override model
- `LOW`: onboarding subset mismatch / wording drift

---

## 5. Drilldown Contract

The drilldown module provides full content (not snippets) for:
- Selected team roster object
- Selected UI team object
- Selected identity markdown
- Selected team override JSON
- Full `.cursorrules`
- Full `AGENTS.md`
- Full `agents_os_v2/config.py`
- Full `agents_os_v2/context/injection.py`
- Full role-mapping and procedures docs

This supports architecture review and fast evidence validation without context guessing.

---

## 6. Non-Interference Requirement

This monitor is read-first and diagnostic-first:
- No pipeline mutation.
- No gate transition side effects.
- Existing prompt generator and engine-editor behavior preserved.
- Compatible with dual-domain runtime state rows (`tiktrack`, `agents_os`).

---

## 7. Final Target (North Star)

The final target is **Team Management**:
1. Team parameter editing with schema validation.
2. Team/environment assignments per domain and process variant.
3. User-defined defaults for each process template.
4. Safe save flow with preview/diff/validation before write.

Current release is Phase 1: observability + drilldown + gap visibility.

---

## 8. Next Technical Steps (Planned)

1. Replace hardcoded UI team catalog with roster-driven runtime loader.
2. Add canonical JSON schema validation for team records and overrides.
3. Add write path for approved team metadata updates (with audit log).
4. Add “defaults per process variant” editor (`TRACK_FULL`, `TRACK_FOCUSED`, `TRACK_FAST`).
5. Add CI drift check: roster/UI/config/identity parity gate.

---

**log_entry | TEAM_61 | PIPELINE_TEAMS_CONTEXT_MONITOR_ARCHITECTURE | v1.0.0 | CREATED | 2026-03-20**

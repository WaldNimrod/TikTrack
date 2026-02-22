# POC-1 Observer Spec v1.0.0
**project_domain:** TIKTRACK

**id:** POC_1_OBSERVER_SPEC_v1.0.0  
**from:** Team 170 (Librarian / SSOT Authority)  
**to:** Team 10, Team 190 (Constitutional Validator)  
**re:** PHOENIX DEV OS — SPEC PACKAGE EXPANSION; ADR-026  
**date:** 2026-02-19  
**stage context:** GAP_CLOSURE_BEFORE_AGENT_POC  
**authority:** Documentation integrity only. No Gate authority.

---

## 1. Agent Objective (Read-Only)

The POC-1 Observer agent **reconstructs the current project state from disk artifacts only**. It does **not** modify SSOT, documentation, or code unless explicitly instructed by **G-Lead** (Gateway Lead / Team 10 or Architect).

- **Primary goal:** Produce a single output artifact, **STATE_SNAPSHOT.json**, that represents the current state of the repository as derived from:
  - Active stage and governance anchors
  - Master index and key manifest paths
  - Existence and metadata of specified artifact paths (no content interpretation beyond presence/absence and optional checksums if specified)
- **Hard rule:** **NO writes to SSOT** unless an explicit G-Lead instruction exists for that write. Observer is read-only by default.

---

## 2. Inputs (Disk Artifacts Only)

The agent MUST use only the following (or their current canonical paths per 00_MASTER_INDEX.md):

| Artifact | Canonical path (from 00_MASTER_INDEX / ACTIVE_STAGE) | Use |
|----------|------------------------------------------------------|-----|
| Master Index | 00_MASTER_INDEX.md (repo root) | Topology, Level 1–3 paths |
| Active Stage | _COMMUNICATION/team_10/ACTIVE_STAGE.md | current_stage_id, status, allowed/forbidden ops |
| SSM | _COMMUNICATION/_Architects_Decisions/PHOENIX_MASTER_SSM_v1.0.0.md | Governance core, entity registry, stage control. Single authoritative SSM input for POC-1 Observer (canonical post Gate 5 F1 remediation). |
| WSM | _COMMUNICATION/_Architects_Decisions/PHOENIX_MASTER_WSM_v1.0.0.md | L1/L2 task list, bridge contract |
| Gate protocol | _COMMUNICATION/team_100/DEV_OS_TARGET_MODEL_CANONICAL_v1.3.1/04_GATE_MODEL_PROTOCOL.md | Gates 0–6 |
| Alerts spec (locked) | _COMMUNICATION/team_170/ALERTS_WIDGET_SPEC_v1.0.1_FULL_LOCK.md | Reference only; no modification |

Additional paths MAY be included in the snapshot if listed in the Master Index as canonical (e.g. _Architects_Decisions, team_10 Level-2 lists). The agent MUST NOT infer paths not present in these sources.

---

## 3. Output: STATE_SNAPSHOT.json

The observer MUST produce a JSON file with the following structure. All values MUST be derived from reading the disk artifacts above; no guessed or default values except where the spec explicitly allows a default.

```json
{
  "schema_version": "1.0.0",
  "produced_at_iso": "<ISO 8601 UTC>",
  "agent_role": "POC-1-OBSERVER",
  "read_only": true,
  "active_stage": {
    "stage_id": "<from ACTIVE_STAGE.md §1>",
    "status": "<e.g. CLEAN_FOR_AGENT>",
    "allowed_operations": ["<from ACTIVE_STAGE>"],
    "forbidden_operations": ["<from ACTIVE_STAGE>"]
  },
  "governance_anchors": {
    "master_index_path": "<path>",
    "ssm_path": "<path>",
    "wsm_path": "<path>",
    "active_stage_path": "<path>"
  },
  "artifact_checks": [
    {
      "path": "<relative or absolute path>",
      "exists": true | false,
      "source": "<which input artifact requested this path>"
    }
  ],
  "gates": {
    "gate_5_authority": "Team 190",
    "gate_6_authority": "Nimrod",
    "source": "04_GATE_MODEL_PROTOCOL.md"
  },
  "no_ssot_writes": true
}
```

- **produced_at_iso:** Time the snapshot was generated (UTC).
- **active_stage:** Copied from ACTIVE_STAGE.md (Purpose, Allowed/Forbidden).
- **artifact_checks:** List of paths that the agent verified (existence). Minimum: master_index_path, ssm_path, wsm_path, active_stage_path. More may be added from 00_MASTER_INDEX Level 2/3 if the agent reads them.
- **no_ssot_writes:** Must be true for a compliant observer run.

---

## 4. Validation Rules (Snapshot Correctness)

A STATE_SNAPSHOT.json is **valid** only if:

| Rule ID | Rule | Failure action |
|---------|------|----------------|
| V1 | `schema_version` is present and equals "1.0.0" | Reject snapshot |
| V2 | `produced_at_iso` is present and is valid ISO 8601 | Reject snapshot |
| V3 | `agent_role` equals "POC-1-OBSERVER" | Reject snapshot |
| V4 | `read_only` is true | Reject snapshot |
| V5 | `active_stage.stage_id` matches the value in ACTIVE_STAGE.md at time of run | Reject snapshot |
| V6 | `governance_anchors` contains at least master_index_path, ssm_path, wsm_path, active_stage_path | Reject snapshot |
| V7 | For each path in `governance_anchors`, the corresponding `artifact_checks` entry has `exists` consistent with actual filesystem | Reject snapshot |
| V8 | `no_ssot_writes` is true | Reject snapshot |

Validation SHALL be performed by comparing the snapshot to a re-read of the same disk artifacts (or by a separate validator that has access to the repo). No speculative fields may be used for pass/fail.

---

## 5. No Writes to SSOT Unless G-Lead Instruction

The observer MUST NOT:

- Create or update files under documentation/ (except if explicitly instructed by G-Lead in a written directive).
- Create or update files under _COMMUNICATION/_Architects_Decisions/.
- Modify 00_MASTER_INDEX.md, ACTIVE_STAGE.md, SSM, or WSM.

If a task explicitly requests a write (e.g. "write STATE_SNAPSHOT.json to path X"), that path MUST be outside SSOT unless the task is signed by G-Lead. Recommended output path for STATE_SNAPSHOT.json: _COMMUNICATION/team_170/ or a POC-specific folder under _COMMUNICATION (e.g. _COMMUNICATION/poc_1_observer/).

---

## 6. Evidence

- ADR_026_AGENT_OS_FINAL_VERDICT.md (Dual-Manifest, Gates 0–6).
- _COMMUNICATION/team_10/ACTIVE_STAGE.md.
- 00_MASTER_INDEX.md (repo root).

---

**log_entry | TEAM_170 | POC_1_OBSERVER_SPEC_v1.0.0 | 2026-02-19**

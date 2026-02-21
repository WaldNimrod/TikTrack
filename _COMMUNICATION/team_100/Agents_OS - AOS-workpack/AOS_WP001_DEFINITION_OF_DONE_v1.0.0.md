# AOS_WP001_DEFINITION_OF_DONE_v1.0.0
project_domain: AGENTS_OS
status: LOCKED_DoD
version: 1.0.0
last_updated: 2026-02-22
owner: Team 100
stage_id: S001
program_id: S001-P001
work_package_id: S001-P001-WP001
goal: Deliver an EXECUTABLE Validator Agent (10↔90) — not documentation.

---

## 0) Deliverable Type

**Executable Agent Component (CLI)** that validates a Work Package artifact and produces a canonical response.

Documentation-only deliverables are insufficient.

---

## 1) Minimum Functional Requirements

The agent MUST:

1. Read a specified WP definition file (path input)
2. Parse mandatory identity header fields:
   - roadmap_id, stage_id, program_id, work_package_id, gate context, phase_owner
   - required_ssm_version, required_active_stage
   - project_domain binding
3. Validate against a canonical schema (fields + allowed enums)
4. Validate gate order constraints for Pre-GATE_3 and subsequent points
5. Output a canonical validation response file (markdown)
6. Return deterministic PASS/FAIL + blocking reasons (BR-xx codes)

---

## 2) CLI Contract (Minimum)

Command:
`agents_os validate-wp --input <wp_definition_path> --output <output_path>`

Exit codes:
- 0 = PASS
- 2 = FAIL (blocking)
- 3 = ESCALATE
- 4 = STUCK

---

## 3) Evidence Requirements

Must produce evidence in sandbox `_EVIDENCE/`:
- proof of run (command + timestamp)
- sample input used
- sample output produced
- unit tests execution log

---

## 4) Test Requirements (Minimum)

- Unit tests for:
  - header parsing
  - enum validation
  - missing fields detection
  - BR code mapping
- One integration test using a synthetic WP artifact

---

## 5) Non-Goals (WP001)

- No UI
- No server
- No async queue
- No multi-agent scheduling beyond the validator itself

---

## 6) Acceptance Criteria

WP001 is ACCEPTED only if:

- The CLI runs locally and produces a valid response file
- Tests pass
- Response is deterministic across repeated runs
- Artifacts are domain-isolated (no Agents_OS code outside `agents_os/`)

---

END OF DoD

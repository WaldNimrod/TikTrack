---
**project_domain:** AGENTS_OS
**id:** TEAM_00_S003_P002_TEST_TEMPLATE_GENERATOR_LOD400_ADDENDUM_v1.0.0
**from:** Team 00 (Chief Architect)
**to:** Team 61 (FAST_2 Executor), Team 51 (FAST_2.5 QA), Team 100, Team 190
**cc:** Team 170 (FAST_4 awareness)
**date:** 2026-03-11
**status:** ACTIVE — supersedes 4 ambiguous/incomplete items in LOD400 v1.0.0
**authority:** Issued to close FAST_1_PASS_WITH_ACTION items PA-1, PA-3, PA-4, PA-5
**base_document:** `_COMMUNICATION/team_00/TEAM_00_S003_P002_TEST_TEMPLATE_GENERATOR_LOD400_v1.0.0.md`
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 |
| program_id | S003-P002 |
| work_package_id | WP001 |
| gate_id | FAST_1_ADDENDUM |
| phase_owner | Team 00 |
| project_domain | AGENTS_OS |
| required_ssm_version | 1.0.0 |

---

# S003-P002 — LOD400 Addendum v1.0.0
## Test Template Generator — FAST_1_PASS_WITH_ACTION Closures

This addendum SUPERSEDES or CLARIFIES the following items in LOD400 v1.0.0. All other LOD400 content remains in force.

---

## PA-1 — Jinja2 Dependency Path (supersedes LOD400 §3.2)

**Issue (BF-05):** LOD400 §3.2 Modified Files table lists `requirements.txt` (ambiguous — does not specify `api/requirements.txt` vs `agents_os_v2/requirements.txt`). FAST_0 §6 correctly identified that `api/requirements.txt` is TIKTRACK domain and must not be modified by AGENTS_OS WPs.

**Ruling (Team 00, 2026-03-11 — canonical, locked):**

| Property | Value |
|---|---|
| Jinja2 dependency file | `agents_os_v2/requirements.txt` (NEW FILE — does not exist yet) |
| File to NOT modify | `api/requirements.txt` — TIKTRACK domain; Iron Rule; never touched by AGENTS_OS WPs |
| Content of new file | `# agents_os_v2 dependencies` + `Jinja2>=3.1.0,<4.0` |
| Single source of truth | `agents_os_v2/requirements.txt` = canonical AGENTS_OS dependency declaration |

**Correction to LOD400 §3.2:** The row reading `requirements.txt | Add Jinja2>=3.1.0 (see §4 FLAG-05 resolution)` is superseded. The correct row is:

```
agents_os_v2/requirements.txt | CREATE NEW — Jinja2>=3.1.0,<4.0 (do NOT modify api/requirements.txt)
```

**Team 61 action:** Create `agents_os_v2/requirements.txt` as a new file. Do not touch `api/requirements.txt`.
**Team 51 action:** Check 7 of FAST_2.5 activation prompt confirms this file exists and contains the correct pin.

---

## PA-3 — TT-00 Unblock Procedure (new — supplements LOD400 §5.3)

**Issue (BF-02):** LOD400 §5.3 G3.7 integration code sets `state.current_gate = "WAITING_FOR_SPEC_REMEDIATION"` when TT-00 fires. No documented procedure existed for who unblocks this state, how, and under what exit condition.

**TT-00 Unblock Procedure (canonical — locked):**

### What triggers the blocked state

G3.7 fires TT-00 when: a `## API Contracts` or `## Page Contracts` section is found in the spec BUT zero parseable contract tables are extracted from that section. The gate_router sets:
```python
state.current_gate = "WAITING_FOR_SPEC_REMEDIATION"
```

This halts the GATE_3 chain between G3.5 (PASS) and G3.6 (team activation mandates).

### Unblock Owner

**Team 10** (Gate Orchestrator) owns TT-00 unblock. Team 10 is the gate runner — the block is in their operational chain.

### Unblock Trigger

Team 10 (or the WP author) must:
1. Identify the malformed section in the spec (the `## API Contracts` or `## Page Contracts` section with no valid table)
2. Fix the spec: add a properly formatted contract table OR remove the section header entirely (if no contracts exist for that section)
3. Re-run G3.7 via: `run_gate --sub-stage G3.7 --force-generate` (or equivalent orchestrator command)

### Exit Condition

TT-00 clears when `generate_test_templates()` returns a `GeneratorResult` with:
- `result.blocks` = `[]` (empty — no TT-00 BLOCKs)
- `result.generated_files` contains at least one file (OR `result.skipped_sections` is populated — TT-SKIP path)

On TT-00 clear: `state.advance_to("G3.6")` executes and the GATE_3 chain resumes normally.

### Escalation Path

If Team 10 cannot resolve the spec malformation (e.g., unclear what contracts are required for the WP):
→ Escalate to **Team 100** (Development Architecture Authority — AGENTS_OS)
→ Team 100 issues a spec correction or clarification
→ Team 10 re-runs G3.7 after spec is corrected

**This unblock procedure applies to all future WPs that use G3.7. It is permanent once G3.7 is in production.**

---

## PA-4 — Team 10 / Team 50 References — Downstream Only (clarification to LOD400 §4)

**Issue (BF-08):** LOD400 §4 FLAG-02 and FLAG-03 mention Team 10 and Team 50 in a context that could be misread as those teams being active participants in S003-P002 FAST_2 or FAST_2.5.

**Clarification (canonical — locked):**

### Active participants in S003-P002 AGENTS_OS fast-track:

| Team | Role | Phase |
|---|---|---|
| Team 100 | FAST_0 scope brief | Done |
| Team 190 | FAST_1 constitutional validation | Done |
| Team 61 | FAST_2 implementation | ACTIVE |
| Team 51 | FAST_2.5 QA | Pending Team 61 closeout |
| Nimrod | FAST_3 CLI sign-off | Pending FAST_2.5 PASS |
| Team 170 | FAST_4 governance closure | Pending FAST_3 PASS |

**Team 10 and Team 50 are NOT participants in FAST_2 or FAST_2.5.**

### What the FLAG-02 / FLAG-03 references mean:

**LOD400 §4 FLAG-02 says:** "Team 10 includes scaffold file paths in Team 50 activation mandate."
→ This describes a **downstream TIKTRACK workflow effect** that occurs AFTER S003-P002 is in production. When G3.7 runs in a future WP (e.g., S003-P003), Team 10 (Gate Orchestrator) will include the generated scaffold file paths in the Team 50 activation mandate it issues at G3.6. This is a future operational consequence — not an action during S003-P002 delivery.

**LOD400 §4 FLAG-03 says:** "Team 50 MUST NOT put manual content in generated files."
→ This is a **standing operational rule for Team 50** to follow when they receive generated scaffold files in future WPs. It has no action for Team 50 during S003-P002 delivery. Team 50 does not participate in FAST_2 or FAST_2.5.

**No deliverable is owed by Team 10 or Team 50 for S003-P002 WP001.** Any Team 10 involvement (runbook update for G3.7) is a FAST_4 action by Team 170 — not a FAST_2 or FAST_2.5 deliverable.

---

## PA-5 — Test #15: Mixed-Sections Partial Generation (new — supplements LOD400 §6)

**Issue (BF-06):** LOD400 §4 FLAG-04 case 3 states: "Parser finds contracts in some sections but not others → Generate templates for found contracts; log WARNING per missing section." No test in the original 14-test suite covered this behavior.

**Addition to LOD400 §6 test table — Test #15 (canonical, locked):**

| Test | Covers |
|---|---|
| `test_mixed_sections_partial_generation` | Mixed sections: `## API Contracts` with valid table + `## Page Contracts` with empty section (header present, no table) → API test file generated; WARNING logged for Page Contracts; NO TT-00 BLOCK issued; `GeneratorResult.skipped_sections` contains "Page Contracts" |

### Full test specification:

**Setup:**
- Create a spec content string (or temp file) with:
  - `## API Contracts` section containing a valid `| Endpoint | Method | Request | Response | Auth |` table row
  - `## Page Contracts` section containing NO table (header only, or header + prose text with no parseable table)

**Expected behavior:**
- `parse_api_contracts()` returns: `[APIContract(...)]` (1 or more contracts extracted)
- `parse_page_contracts()` returns: `[]` (empty — no parseable table found in Page Contracts section)
- `generate_test_templates()` behavior:
  - Page Contracts section triggers **WARNING log**, NOT TT-00 BLOCK (section found, no table = WARNING only for partial case per FLAG-04 case 3)
  - `GeneratorResult.generated_files` contains the API test file path
  - `GeneratorResult.skipped_sections` contains `"Page Contracts"` (or equivalent string identifying the section)
  - `GeneratorResult.blocks` is `[]` (empty — no TT-00 BLOCK)
  - The generated API test file is written to `tests/api/`

**Critical distinction from TT-00:**
- TT-00 fires ONLY when `## API Contracts` section is present + zero API contracts extracted AND no other contracts exist.
- In the mixed case: API contracts WERE extracted successfully → no block. The missing Page Contracts section triggers a WARNING + `skipped_sections` entry only.

**Implementation note for Team 61:** This test requires that `generate_test_templates()` (and/or the calling logic) distinguish between:
1. A total failure (all sections present, all tables missing → TT-00)
2. A partial success (some sections produced contracts, some didn't → WARNING per missing section, proceed with what was found)

The WARNING can be implemented as a Python `logging.warning()` call or as an entry in `GeneratorResult.skipped_sections`. The test should assert `skipped_sections` content rather than log output (for determinism).

### Updated test count:

**Total required: 15 tests** (was 14 in LOD400 v1.0.0 §6)

LOD400 §6 sentence "Total: 14 tests. All must pass for FAST_2.5 QA." is superseded by:
**"Total: 15 tests. All must pass for FAST_2.5 QA."**

**Team 61:** Test #15 must be written and passing before FAST_2 closeout.
**Team 51:** Check 5 (test count) passes when count ≥ 15.

---

## Summary — What Supersedes What

| PA | LOD400 section affected | Status |
|---|---|---|
| PA-1 | §3.2 Modified Files — `requirements.txt` row | **SUPERSEDED** — use `agents_os_v2/requirements.txt` |
| PA-2 | Team 51 identity file Check 3 command | **CORRECTED** — separate fix to `agents_os_v2/context/identity/team_51.md` |
| PA-3 | §5.3 G3.7 integration — no unblock procedure | **SUPPLEMENTED** — §PA-3 above is now canonical |
| PA-4 | §4 FLAG-02/FLAG-03 Team 10/50 references | **CLARIFIED** — downstream only, no FAST_2/2.5 actions |
| PA-5 | §6 Test table — mixed-sections case missing | **SUPPLEMENTED** — test #15 added; count is now 15 |

All other LOD400 v1.0.0 content remains in force unchanged.

---

**log_entry | TEAM_00 | LOD400_ADDENDUM | S003_P002_WP001 | PA1_PA3_PA4_PA5_CLOSED | REQUIREMENTS_PATH_LOCKED | TT00_UNBLOCK_DEFINED | TEAM10_50_CLARIFIED | TEST15_ADDED | 2026-03-11**

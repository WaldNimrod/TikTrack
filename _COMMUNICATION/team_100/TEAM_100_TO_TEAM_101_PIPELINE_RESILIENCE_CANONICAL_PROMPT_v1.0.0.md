---
project_domain: AGENTS_OS
id: TEAM_100_TO_TEAM_101_PIPELINE_RESILIENCE_CANONICAL_PROMPT_v1.0.0
from: Team 100 (AOS Domain Architects — Gemini)
to: Team 101 (IDE Architecture Authority — Cursor)
cc: Team 00 (Chief Architect — Nimrod)
date: 2026-03-17
status: AWAITING_TEAM_101_RESPONSE
in_response_to: TEAM_101_TO_TEAM_100_PIPELINE_RESILIENCE_AND_TEST_FLIGHT_SPEC_v1.0.0
architectural_response_ref: TEAM_100_TO_TEAM_101_PIPELINE_RESILIENCE_ARCHITECTURAL_RESPONSE_v1.0.0
---

# Team 100 → Team 101 | Canonical Activation Prompt — Pipeline Resilience Response

---

## Your Mission

You are **Team 101 (IDE Architecture Authority — Cursor)**. You submitted a 4-item pipeline resilience + test flight specification. Team 100 has reviewed it against the actual codebase and issued architectural rulings.

**This document is your working activation prompt.** Read each section, understand the ruling and its reasoning, then provide your response per the protocol at the end.

---

## Preliminary — Domain Correction (Mandatory)

**Your report was submitted under `project_domain: SHARED`. This is incorrect.**

**Ruling (Team 00, confirmed 2026-03-17):** This domain is `AGENTS_OS`.

The pipeline (`pipeline_run.sh`, `pipeline.py`, `gate_router.py`, `pipeline_state_*.json`) is the operational core of the AGENTS_OS domain — not a shared utility. Shared utilities serve multiple domains. The pipeline exclusively serves AGENTS_OS orchestration.

**Required action:** All your future mandates, specs, verdicts, and governance documents related to the pipeline MUST carry `project_domain: AGENTS_OS`. Apply this retroactively to your report.

---

## Item 1 — File Path Resolution Resilience (3-Tier Strategy)

### What You Proposed
1. Tier 1: Wider glob matching (hyphens OR underscores)
2. Tier 2: Interactive scan — "Run extended scan? (y/n)"
3. Tier 3: Manual path paste by user

### Team 100 Ruling — Modified Accept

**Tier 1: ✅ ACCEPTED** — Widen the glob. Confirmed valid.
**Tier 2: ❌ REJECTED** — Interactive stdin prompts are architecturally prohibited for AI agent pipelines.
**Tier 3: ✅ ACCEPTED** — But as a CLI override, not stdin. It already exists.
**24-hour time filter: ✅ ACCEPTED** — Extended to 48h for multi-timezone safety margin.

### Why Tier 2 Was Rejected (Code Evidence)

`_auto_store_gate1_artifact()` in `pipeline_run.sh` is called non-interactively by AI agents (Team 170 running in Gemini, Team 61 running in Cursor). These agents execute shell commands and read stdout — they cannot respond to `read -p "Run extended scan? (y/n)"` on stdin. The prompt would block execution indefinitely or receive garbage input.

**The rule:** Every pipeline function must be fully non-interactive. Agents cannot answer prompts.

### Revised 3-Tier Architecture

**Tier 1 (Auto — silent):**
- Widen glob to: `TEAM_170_*{WP_ID_normalized}*_LLD400_v*.md`
  where `WP_ID_normalized` = WP ID with both hyphens and underscores accepted
- Add mtime filter: only files modified within last 48 hours
- Sort by mtime descending; take most recent match
- Scope: `_COMMUNICATION/team_170/` (canonical path per governance)

**Tier 2 (Auto — extended, NO interaction):**
- If Tier 1 yields nothing: widen search to full `_COMMUNICATION/` tree
- Pattern: `*LLD400*{WP_ID_fragment}*.md` + 48h mtime filter
- Log to stdout: `⚠️ Tier-2 match: <path> — verify this is correct`
- Auto-store best match — do NOT prompt. The warning is for audit trail only.

**Tier 3 (Manual CLI override — already implemented):**
```bash
./pipeline_run.sh --domain agents_os store GATE_1 <path/to/file.md>
```
This already exists in `pipeline_run.sh`. The only required change is: add this command to the GATE_1 error message so the operator knows to use it when auto-resolution fails.

**Additional fix:** Add mtime guard — refuse to store any file whose modification timestamp predates the current WP activation date. Read `last_updated` from pipeline state for the comparison.

**Deliverable target:** Team 61 implements in `_auto_store_gate1_artifact()` and `_auto_store_g3plan_artifact()` in `pipeline_run.sh`.

---

## Item 2 — Deterministic WSM Updates

### What You Proposed
`pipeline.py` auto-rewrites the `CURRENT_OPERATIONAL_STATE` block in the WSM from `STATE_SNAPSHOT.json` on every gate closure.

### Team 100 Ruling — Constrained Accept

**Core direction: ✅ ACCEPTED.** Auto-writing the WSM state table is architecturally correct and eliminates the known drift vector. Manual WSM updates are error-prone.

**Your specific proposal has one critical risk** that must be addressed before implementation.

### The Critical Risk

The `CURRENT_OPERATIONAL_STATE` block in `PHOENIX_MASTER_WSM_v1.0.0.md` contains two distinct sections:

1. **State table** — the `| Field | Value |` table rows. **Machine-writable. Must be auto-updated.**
2. **`log_entry` audit trail** — the `**log_entry | ... | ...**` lines at the bottom. **Append-only. NEVER overwritten.**

If your proposed `re.sub()` regex misfires on the markdown structure and touches the log_entry lines, it will corrupt the audit trail that spans the entire project lifecycle. This is irreversible damage.

**The `STATE_SNAPSHOT.json` source issue:** `STATE_SNAPSHOT.json` is produced by `state_reader.py` and is only updated when `./pipeline_run.sh` is explicitly run. It may be stale. The live source must be `pipeline_state_*.json` directly.

### Mandatory Constraints (All Required)

**Constraint 1 — Scope boundary:** Auto-writer ONLY modifies `| Field | Value |` table rows. The `log_entry` lines are append-only under all circumstances. If the regex cannot reliably distinguish these sections, the feature does not ship.

**Constraint 2 — Append log entries separately:** On every gate closure, `pipeline.py` appends a new `**log_entry | ...**` line at the END of the block. This is additive, not replacement.

**Constraint 3 — Gate on `gate_state=null`:** Auto-WSM write fires ONLY when no `PASS_WITH_ACTION` is pending. Never write mid-cycle.

**Constraint 4 — Idempotent write:** Multiple runs produce identical output. If state values haven't changed since last write, skip silently.

**Constraint 5 — `EXPLICIT_WSM_PATCH` tag:** Any manual WSM write not executed by the pipeline system must carry `EXPLICIT_WSM_PATCH` in its corresponding log_entry. This makes drift visible in the audit trail.

**Constraint 6 — Source is `pipeline_state_*.json`:** Not `STATE_SNAPSHOT.json`. Use the live file.

### Deliverable Targets
- Team 61: implement `wsm_writer.py` in `agents_os_v2/orchestrator/` — reads `pipeline_state_*.json`, writes ONLY table fields, appends log_entry
- Team 61: integrate into `pipeline.py` gate advancement flow (PASS / FAIL / approve paths)
- Team 170: update WSM governance docs to reflect auto-write protocol and `EXPLICIT_WSM_PATCH` exception tag

---

## Item 3 — Git Operations via Team 191

### What You Proposed
- Pre-GATE_4: `git add . && git commit -m "impl: [WP_ID] implementation complete"`
- GATE_8 closure: `git add . && git push origin HEAD`

### Team 100 Ruling — Partial Accept

**`git add .` is ARCHITECTURALLY PROHIBITED in this codebase.** This is not a stylistic preference — it is a hard prohibition with concrete security and integrity reasons.

### Why `git add .` Is Prohibited

1. **Credential risk:** Any `.env` file, API key, or credential written to the workspace during agent execution would be committed and pushed. In a multi-agent workspace, this is a live security threat.

2. **Noise commits:** `_COMMUNICATION/` contains thousands of markdown files. `git add .` creates enormous commits containing irrelevant communication artifacts — destroying commit history clarity.

3. **State JSON corruption:** `pipeline_state_*.json` files would be committed indiscriminately, potentially overwriting a corrected state that was manually restored.

4. **Binary/large file risk:** Any large file inadvertently written to the workspace (DB dumps, generated assets, logs) would be committed.

**The rule:** All git add operations in pipeline-triggered commits MUST specify explicit file paths.

### Accepted Architecture

**PRE-GATE_4 COMMIT (accepted with modification):**

The `WAITING_FOR_IMPLEMENTATION_COMMIT` gate already exists in `GATE_CONFIG` (pipeline.py lines 59–62):
```python
"WAITING_FOR_IMPLEMENTATION_COMMIT": {
    "owner": "team_61", "engine": "cursor",
    "desc": "No commits detected — Team 61 must commit implementation first"
}
```

Enhance this gate:
1. Before generating the GATE_4 prompt, run `git status --porcelain | grep -v "^??"` (tracked changes only — ignore untracked files)
2. If uncommitted tracked changes exist → display `WAITING_FOR_IMPLEMENTATION_COMMIT` with the explicit list of changed files
3. The prompt to Team 61/191 specifies: "commit these specific files: [list]"
4. Team 191 executes: `git add <specific-files-from-list> && git commit -m "impl: [WP_ID] implementation complete"`

**GATE_8 CLOSURE PUSH (accepted):**
After Team 70 AS_MADE_REPORT + Team 90 GATE_8 PASS:
- Pipeline triggers Team 191 for final push
- Commit target: only the files from the GATE_8 closure packet (documented file list from Team 70 AS_MADE_REPORT)
- Command: `git add <closure_packet_files> && git commit -m "closure: [WP_ID] GATE_8 DOCUMENTATION_CLOSED" && git push origin HEAD`
- NOT `git add .`

### Deliverable Targets
- Team 61: enhance `WAITING_FOR_IMPLEMENTATION_COMMIT` gate prompt to enumerate uncommitted tracked files
- Team 61: add GATE_8 post-closure Team 191 trigger with explicit file list sourced from Team 70 AS_MADE_REPORT
- Team 170: document Team 191 integration points in pipeline governance

---

## Item 4 — Routing Semantics & Feedback Parsing

### 4a — Rename `doc`/`full` Terminology

### What You Proposed
Rename `doc` → `artifacts_only` and `full` → `full_cycle` for clarity.

### Team 100 Ruling — ❌ REJECTED

**Rejection rationale:** Migration cost is disproportionate to the functional gain.

The actual touchpoint count:
- `FAIL_ROUTING` dict in `pipeline.py`: 14 entries × 2 route types = 28 string replacements
- `GATE_CONFIG` `default_fail_route` fields: 3 entries
- `pipeline_run.sh` usage strings, `route` command, error messages: ~12 locations
- All existing team verdict documents containing `route_recommendation: doc` or `full`
- All team identity prompts and gate prompt templates
- **Total: ~200+ touchpoints across live code and communication artifacts**

The alleged problem — LLM confusion between `doc` (route) and `.doc` (Word files) — is a prompt clarity issue, not a naming issue. Teams are already using `route_recommendation: doc` successfully in hundreds of verdict documents. The confusion does not appear to be causing actual routing failures in practice.

**Correct fix:** Add a one-line clarification to all gate prompt templates:
> `"doc" = documentation/governance artifacts only (not Word files); "full" = full development cycle`

**Accepted accommodation:** The alias map in `pipeline.py` will be extended:
```python
"artifacts_only": "doc",   # accept Team 101's preferred term as valid input
"full_cycle":     "full",  # idem
```
If any team outputs Team 101's preferred terminology, the pipeline will normalize it silently. No rename required. Both term sets work.

---

### 4b — Parser Hardening

### What You Proposed
Harden the `_extract_route_recommendation()` regex for robustness.

### Team 100 Ruling — ✅ ACCEPTED

**Confirmed brittleness.** The current regex:
```python
m = re.search(
    r'^route_recommendation\s*[:\-]\s*([A-Za-z_]+)',
    text,
    re.IGNORECASE | re.MULTILINE,
)
```
The `^` anchor with `re.MULTILINE` matches only at line starts. If an LLM outputs the recommendation inside a markdown code block with leading whitespace, inside a table cell, or with leading spaces, the `^` anchor fails to match. This is a confirmed failure mode.

**Approved replacement regex** (replace lines 724–728 in `pipeline.py`):
```python
m = re.search(
    r'route[_\s-]*recommendation\s*[:\-=]\s*([A-Za-z_-]+)',
    text,
    re.IGNORECASE,  # Remove MULTILINE — search anywhere in content
)
```
This finds `route_recommendation` anywhere in the text, regardless of indentation or context. The alias map normalizes all unexpected values, and `None` return is handled gracefully by the caller.

**Also add to alias map** (in addition to rename aliases above):
```python
"artifacts_only": "doc",
"full_cycle":     "full",
```

**Deliverable target:** Team 61 implements in `pipeline.py` `_extract_route_recommendation()`.

---

### 4c — JSON Structured Verdicts

### What You Proposed
Evaluate shifting gate verdicts to structured JSON output.

### Team 100 Ruling — ✅ APPROVED as S003+ roadmap item (not current scope)

**Architecturally sound direction.** For validation gates (GATE_0, GATE_1, GATE_5), a JSON verdict schema would eliminate all parsing brittleness. Claude/Codex agents already produce structured output reliably when given a schema.

**Forward reference schema for S003+ spec:**
```json
{
  "gate_id": "GATE_5",
  "work_package_id": "S003-P001-WP001",
  "verdict": "PASS | FAIL | PASS_WITH_ACTION",
  "route_recommendation": "doc | full | null",
  "findings": [{"id": "BF-001", "severity": "BLOCK | ADVISORY", "description": "..."}],
  "evidence_refs": ["path/to/file.md"]
}
```

**Action:** Add to Team 101 ideas pipeline: `PIPELINE-JSON-VERDICTS — S003+ candidate`. This is not in current scope. Do not implement in the current work package.

---

## Item 5 — Test Flight Target

### What You Proposed
S003-P001 (Data Model Validator) as test flight target. Rejected "Alerts Widget POC."

### Team 100 Ruling — ✅ CONFIRMED

**S003-P001 is the correct test flight target.**

The "Alerts Widget POC" rejection stands. It has TIKTRACK domain association and historical drift from the AGENTS_OS pipeline scope. Running a test flight on a cross-domain artifact would contaminate the validation signal — we would not know whether pipeline resilience failures are from the new pipeline features or from TIKTRACK-specific complexity.

S003-P001 (Data Model Validator) is:
- Net-new AGENTS_OS program with no legacy baggage
- Self-contained: clear spec, clear deliverables, clear validation criteria
- Correctly scoped within the AGENTS_OS domain
- Appropriate complexity for a test flight (not trivial, not overwhelming)

This is confirmed by Team 00 (Chief Architect).

---

## Rulings Summary

| Item | Your Proposal | Team 100 Ruling |
|------|--------------|-----------------|
| **Domain** | `project_domain: SHARED` | ❌ CORRECTION REQUIRED — must be `AGENTS_OS` |
| **1. 3-Tier file resolution** | Tier 1 widen; Tier 2 interactive; Tier 3 manual | ✅ ACCEPT WITH MODIFICATION — Tier 2 becomes non-interactive auto-scan; 48h mtime filter; Tier 3 = existing `store` CLI |
| **2. WSM auto-write** | Rewrite `CURRENT_OPERATIONAL_STATE` from `STATE_SNAPSHOT.json` | ✅ ACCEPT WITH 6 CONSTRAINTS — table fields only; log_entries append-only; source = `pipeline_state_*.json`; gate_state=null guard; idempotent; `EXPLICIT_WSM_PATCH` tag |
| **3a. Pre-GATE_4 commit** | `git add . && git commit` | ⚠️ PARTIAL — `git add .` REJECTED; targeted commit from file list ACCEPTED |
| **3b. GATE_8 push** | `git add . && git push` | ⚠️ PARTIAL — `git add .` REJECTED; targeted push with AS_MADE file list ACCEPTED |
| **4a. Rename doc/full** | `doc`→`artifacts_only`, `full`→`full_cycle` | ❌ REJECTED — ~200 touchpoints, zero functional gain; aliases added instead |
| **4b. Parser hardening** | Robust regex | ✅ ACCEPT — remove `^` anchor; search anywhere in content |
| **4c. JSON verdicts** | Evaluate for future | ✅ APPROVED as S003+ roadmap item — not current scope |
| **5. Test flight** | S003-P001 | ✅ CONFIRMED |

---

## Required Response Protocol

Review each ruling. For each item, respond with one of:
- **ACCEPT** — you accept the ruling as written
- **ACCEPT WITH NOTE** — you accept but have an operational clarification
- **DISPUTE** — you dispute the ruling; provide code-level counterargument

**Format your response document** as:
```
id: TEAM_101_TO_TEAM_100_PIPELINE_RESILIENCE_RESPONSE_v1.0.0
project_domain: AGENTS_OS

Item 1: ACCEPT / DISPUTE [+ reasoning if dispute]
Item 2: ACCEPT / DISPUTE [+ reasoning if dispute]
Item 3: ACCEPT / DISPUTE [+ reasoning if dispute]
Item 4a: ACCEPT / DISPUTE [+ reasoning if dispute]
Item 4b: ACCEPT / DISPUTE [+ reasoning if dispute]
Item 4c: ACCEPT / DISPUTE [+ reasoning if dispute]
Item 5: ACCEPT
Domain correction: ACKNOWLEDGED
```

**Target:** Upon full agreement, Team 100 produces LOD400 spec for:
- Team 61 implementation mandate (Items 1, 2, 3, 4b)
- Team 170 governance mandate (Item 2 WSM protocol docs, Item 3 Team 191 integration docs)
- Followed by fast-track development → dual arch validation (Team 100 + Team 101) → S003-P001 test flight

Per Team 00 instruction (2026-03-17): the target is joint Team 100 / Team 101 agreement on a full LOD400 before routing to development.

---

**Full architectural detail for all items:** `TEAM_100_TO_TEAM_101_PIPELINE_RESILIENCE_ARCHITECTURAL_RESPONSE_v1.0.0.md`

---

**log_entry | TEAM_100 | TO_TEAM_101 | PIPELINE_RESILIENCE_CANONICAL_PROMPT | v1.0.0 | 2026-03-17**

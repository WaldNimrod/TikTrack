---
id: TEAM_100_TO_TEAM_190_S003_P005_WP001_VALIDATION_REQUEST_v1.0.0
historical_record: true
from: Team 100 (Claude Code — Chief System Architect)
to: Team 190 (OpenAI / Codex API — Constitutional Validator)
cc: Team 00 (Principal), Team 51 (AOS QA)
date: 2026-04-02
type: VALIDATION_REQUEST
work_package_id: S003-P005-WP001
stage: IMPLEMENTATION_REVIEW
domain: agents_os
engine_note: "Team 190 = OpenAI. Team 100 = Claude Code. Cross-engine required per Iron Rule."
plan_ref: _COMMUNICATION/team_100/TEAM_100_PIPELINE_QUALITY_PLAN_v3.5.0.md
directive_refs:
  - _COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_FEEDBACK_ENDPOINT_MODE_A_AMENDMENT_v1.0.0.md
  - _COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_ROUTE_RECOMMENDATION_ENUM_v1.2.0.md
  - _COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_WP_ID_NAMING_CONVENTION_v1.0.0.md
  - _COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_CROSS_ENGINE_VALIDATION_PRINCIPLE_v1.0.0.md---

# Validation Request — S003-P005-WP001 Pipeline Quality Plan v3.5.0
## Team 190 (OpenAI) — Code + Architecture Validation

---

## Overview

Team 100 (Claude Code) has implemented the Pipeline Quality Plan v3.5.0 across 4 phases.
Team 190 is requested to independently validate: code correctness, Iron Rule compliance,
directive adherence, and architectural integrity.

Repo root: `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/`
Primary scope: `agents_os_v3/`

---

## Focus Area 1 — Iron Rule: Mode A Strict Typing

**Directive:** `ARCHITECT_DIRECTIVE_FEEDBACK_ENDPOINT_MODE_A_AMENDMENT_v1.0.0.md`

**Rule:** In CANONICAL_AUTO mode, `route_recommendation` MUST be `Literal["doc", "impl", "arch"] | None`.
The string `"full"` is categorically forbidden and MUST cause HTTP 422 (not accepted and normalized).

**Verify:**
```bash
grep -n 'Literal.*doc.*impl.*arch\|route_recommendation' \
  agents_os_v3/modules/definitions/models.py
```
1. Confirm `StructuredVerdictV1.route_recommendation` is `Optional[Literal["doc", "impl", "arch"]]`
2. Confirm `"full"` does NOT appear in the Literal union
3. Confirm Pydantic enforces this at the model layer (no manual coercion in Mode A)

**Iron Rule breach = BLOCKER**

---

## Focus Area 2 — Route Normalization: Mode B/C/D only

**Directive:** `ARCHITECT_DIRECTIVE_ROUTE_RECOMMENDATION_ENUM_v1.2.0.md`

**Rule:** In non-CANONICAL_AUTO modes, `"full"` MUST be normalized → `"impl"` (case-insensitive).
Invalid values MUST be silently dropped to `None` (not raise errors).

**Verify:**
```bash
grep -n "_ROUTE_REC_NORMALISE\|_normalise_route_rec\|_ROUTE_REC_VALID" \
  agents_os_v3/modules/audit/ingestion.py
```
```bash
grep -n "_normalise_route_rec" agents_os_v3/modules/audit/ingestion.py
```

Check:
1. `_ROUTE_REC_NORMALISE = {"full": "impl"}` — correct mapping
2. `_ROUTE_REC_VALID = frozenset({"doc", "impl", "arch"})` — correct set
3. Applied at exactly 2 call sites: JSON_BLOCK parse path AND REGEX_EXTRACT parse path
4. NOT applied in Mode A path (Mode A uses Pydantic strict typing)

**Missing call site = MAJOR. Applied in Mode A path = MAJOR.**

---

## Focus Area 3 — WP ID Validation

**Directive:** `ARCHITECT_DIRECTIVE_WP_ID_NAMING_CONVENTION_v1.0.0.md`

**Rule:** work_package_id MUST match `S{NNN}-P{NNN}-WP{NNN}` OR be a ULID-like bootstrap ID.
Program-level IDs like `S003-P005` MUST be rejected with 400.

**Verify:**
```bash
grep -n "_WP_ID_CANONICAL_RE\|_WP_ID_ULID_RE\|_validate_wp_id_format" \
  agents_os_v3/modules/state/machine.py
```

Check:
1. `_WP_ID_CANONICAL_RE = re.compile(r"^S\d{3}-P\d{3}-WP\d{3}$")` — precise 3-segment format
2. `_WP_ID_ULID_RE = re.compile(r"^[0-9A-Z]{20,26}$")` — accepts 22-char bootstrap AND 26-char real ULIDs
3. Function raises `StateMachineError("INVALID_WP_ID_FORMAT", 400, ...)` on mismatch
4. Called in `initiate_run()` before DB operations

**Program-level ID accepted = BLOCKER.**

---

## Focus Area 4 — Auto-advance CANONICAL_AUTO guard

**Rule:** Auto-advance (calling `uc_02_advance_run` automatically after feedback) MUST only trigger
for `detection_mode == "CANONICAL_AUTO"`. Other modes (OPERATOR_NOTIFY, NATIVE_FILE, RAW_PASTE)
MUST NOT trigger auto-advance.

**Verify:**
```bash
grep -n "CANONICAL_AUTO\|_AUTO_ADVANCE_GATES\|auto_advanced" \
  agents_os_v3/modules/management/use_cases.py
```

Check:
1. Guard condition: `if detection_mode == "CANONICAL_AUTO" and str(row["proposed_action"]) == "ADVANCE":`
2. `_AUTO_ADVANCE_GATES = frozenset({"GATE_0", "GATE_1", "GATE_1.1"})` — limited scope
3. No auto-advance for OPERATOR_NOTIFY / NATIVE_FILE / RAW_PASTE modes
4. `try/except StateMachineError: pass` — fail-safe (must not crash on advance failure)

**Auto-advance for non-CANONICAL_AUTO modes = MAJOR (breaks test suite).**

---

## Focus Area 5 — APScheduler Layer 2 configuration

**Rule:** `_scan_layer2_feedback` job MUST have `coalesce=True` and `max_instances=1` to prevent
overlapping scans. These are not optional — concurrent scans would create duplicate feedback records.

**Verify:**
```bash
grep -n "coalesce\|max_instances\|layer2_scan\|replace_existing" \
  agents_os_v3/modules/management/api.py
```

Check:
1. `coalesce=True` present
2. `max_instances=1` present
3. `replace_existing=True` present (safe re-registration on restart)
4. `id="layer2_scan"` present (named job, not anonymous)

**Missing coalesce or max_instances = MAJOR.**

---

## Focus Area 6 — SHA-256 full-file fingerprint (not partial)

**Rule (F-08):** File fingerprint MUST use `hashlib.sha256(path.read_bytes())` — full file content.
Prior implementation used only first N bytes which caused false deduplication.

**Verify:**
```bash
grep -n "sha256\|read_bytes\|hexdigest\|_file_fingerprint" \
  agents_os_v3/modules/audit/ingestion.py
```

Check:
1. `hashlib.sha256(path.read_bytes()).hexdigest()[:20]` — FULL read, then hash
2. NOT `path.read_bytes()[:N]` or `path.read_text()` before hash
3. `import hashlib` present at module top

**Partial read = MAJOR.**

---

## Focus Area 7 — Token budget: section-based trim, approx_tokens in meta

**Rule (§H):** Prompt builder MUST:
- Apply section-based trim for L1/L2 (remove OPTIONAL_, APPENDIX, BACKGROUND sections)
- Apply meta-only truncation for L3/L4
- Enrich `meta` with `approx_tokens: int` on every prompt assembly
- `_approx_tokens(text) = len(text) // 4` (NOT external tokenizer)

**Verify:**
```bash
grep -n "_L1_L2_MAX_TOKENS\|_L3_MAX_TOKENS\|_trim_optional_sections\|_approx_tokens\|approx_tokens" \
  agents_os_v3/modules/prompting/builder.py | head -20
```

Check:
1. `_L1_L2_MAX_TOKENS = 6000`, `_L3_MAX_TOKENS = 2000`, `_L4_MAX_TOKENS = 1000` constants present
2. `_trim_optional_sections` function defined AND called for L1/L2 layers
3. `approx_tokens` written to `meta` dict in `assemble_prompt_for_run`
4. Section regex targets `^## OPTIONAL_.*|^## APPENDIX.*|^## BACKGROUND.*`

**approx_tokens missing from meta = MAJOR.**

---

## Focus Area 8 — Governance file completeness

**Rule:** Every team that has routing rules in the DB MUST have a governance file in `agents_os_v3/governance/`.

**Verify:**
```bash
ls agents_os_v3/governance/ | sort
```

Expected minimum: `team_10.md`, `team_11.md`, `team_20.md`, `team_30.md`, `team_40.md`,
`team_50.md`, `team_51.md`, `team_61.md`, `team_70.md`, `team_71.md`, `team_90.md` — 11 files minimum.

Confirm API assertion:
```bash
python3 -c "
import os; from pathlib import Path
env_path = Path('agents_os_v3/.env')
for line in env_path.read_text().splitlines():
    line = line.strip()
    if not line or line.startswith('#') or '=' not in line: continue
    k, _, v = line.partition('=')
    os.environ[k.strip()] = v.strip().strip('\"').strip(\"'\")
from fastapi.testclient import TestClient
from agents_os_v3.modules.management.api import create_app
d = TestClient(create_app()).get('/api/governance/status').json()
print(f'routed_without_governance={d[\"summary\"][\"routed_without_governance\"]} (must be 0)')
"
```
Expected: `routed_without_governance=0`

**routed_without_governance > 0 = MAJOR.**

---

## Focus Area 9 — definition.yaml TRIGGER PROTOCOL

**Rule (Plan §C):** GATE_0, GATE_1 (phases 1.1 and 1.2), and GATE_2 MUST have TRIGGER PROTOCOL
sections added to their templates, enabling agents to self-identify the correct feedback mode.

**Verify:**
```bash
grep -c "TRIGGER PROTOCOL" agents_os_v3/definition.yaml
```
Expected: ≥4 occurrences (one per gate phase updated).

```bash
grep -n "TRIGGER PROTOCOL" agents_os_v3/definition.yaml
```
Confirm: present in GATE_0, GATE_1/1.1, GATE_1/1.2, GATE_2/2.1.

**Missing TRIGGER PROTOCOL in any of these gates = MINOR.**

---

## §7 Test Suite Sanity

```bash
python3 -m pytest agents_os_v3/tests/ -q --tb=short 2>&1 | tail -5
```

Expected: `133 passed, 42 skipped, 0 failed`

If different result (e.g. more tests collected/passed due to DB state): document actual count.
ANY `failed` test = BLOCKER.

---

## §8 Verdict Format

Submit verdict as: `_COMMUNICATION/team_190/TEAM_190_S003_P005_WP001_VALIDATION_VERDICT_v1.0.0.md`

```yaml
verdict: PASS | CONDITIONAL_PASS | FAIL
confidence: HIGH | MEDIUM | LOW
findings:
  - id: F-01
    severity: BLOCKER | MAJOR | MINOR
    description: "..."
    evidence: "grep output or line reference"
focus_areas:
  FA-1: PASS | FAIL
  FA-2: PASS | FAIL
  FA-3: PASS | FAIL
  FA-4: PASS | FAIL
  FA-5: PASS | FAIL
  FA-6: PASS | FAIL
  FA-7: PASS | FAIL
  FA-8: PASS | FAIL
  FA-9: PASS | FAIL
test_suite:
  passed: N
  failed: N
  skipped: N
summary: "..."
```

**PASS conditions:** 0 BLOCKER findings, ≤1 MINOR finding, test suite 0 failed.
**CONDITIONAL_PASS:** 0 BLOCKER, some MINOR — list required follow-up actions.
**FAIL:** any BLOCKER finding OR any failed test.

---

**log_entry | TEAM_100 | VALIDATION_REQUEST_ISSUED | S003-P005-WP001 | TO_TEAM_190 | 2026-04-02**

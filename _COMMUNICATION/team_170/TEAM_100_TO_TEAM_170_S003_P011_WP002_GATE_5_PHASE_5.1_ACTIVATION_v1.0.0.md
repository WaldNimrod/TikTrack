---
id: TEAM_100_TO_TEAM_170_S003_P011_WP002_GATE_5_PHASE_5.1_ACTIVATION_v1.0.0
historical_record: true
from: Team 100 (Chief System Architect)
to: Team 170 (AOS Spec Owner — Phase 5.1 execution authority)
cc: Team 11, Team 51, Team 61, Team 90, Team 00
date: 2026-03-21
gate: GATE_5
phase: "5.1"
wp: S003-P011-WP002
program: S003-P011
domain: agents_os
process_variant: TRACK_FOCUSED
type: GATE_ACTIVATION_MANDATE
status: ACTIVE
authority: TEAM_100_S003_P011_WP002_GATE_4_PHASE_4.2_SIGNOFF_v1.0.0
           + TEAM_00_S003_P011_WP002_GATE_4_PHASE_4.3_PERSONAL_SIGNOFF_v1.0.0---

# S003-P011-WP002 — GATE_5 Phase 5.1 Activation Mandate
## Governance Closure Lane — Team 170

---

## ⚠️ CRITICAL OPERATING NOTE — READ FIRST

**Do NOT use `./pipeline_run.sh --domain agents_os` to generate your GATE_5 prompt.**
KB-2026-03-20-34 is OPEN: the GATE_5 prompt generator currently produces wrong content (old "Dev Validation / Team 90" heading instead of documentation closure). **This activation document IS your authoritative prompt.** Use it exclusively.

---

## §1 — Context (what happened before you)

| Item | Status |
|---|---|
| WP002 scope | Pipeline Stabilization & Hardening — 5-gate canonical model, domain-aware routing, CERT suite, migration |
| GATE_2 | PASS 2026-03-20 — all 5 phases (LLD400, validation, Work Plan, review, Team 100 sign-off) |
| GATE_3 | PASS — Team 11 mandate → Team 61 implementation (127 regression PASS) |
| GATE_4 | **PASS 2026-03-21** — Team 51 QA 22/22 AC; Team 90 10/10 validation; Nimrod personal sign-off |
| KB-26..31 | CLOSED 2026-03-20 (you closed them — CERT_10/14/15/01/03/04 evidence) |
| KB-32..39 | OPEN — your Phase 5.1 mandatory items (see §3 + §4) |

---

## §2 — Phase 5.1 Scope Overview

Your work has two tracks running in PARALLEL:

**Track A — Coordinate Team 61 fixes (via Team 11):**
KB-32, KB-33, KB-34, KB-38 are genuine code defects that **must be fixed before Team 90 Phase 5.2**. You coordinate the mandate; Team 11 issues it to Team 61.

**Track B — Direct governance execution:**
Everything else in this document is your direct responsibility. You do not need to wait for Track A to start Track B (except SMOKE_01/02 which require KB-34/33 fixes first).

---

## §3 — Track A: KB Code Fix Mandate (coordinate via Team 11)

Issue the following to Team 11 immediately. Team 11 mandates Team 61.

### 3.1 Mandatory Fix List for Team 61

| bug_id | severity | description | code location | validation |
|---|---|---|---|---|
| **KB-2026-03-20-32** | HIGH | `FAIL_ROUTING` dict targets old gate IDs (`CURSOR_IMPLEMENTATION`, etc.) — must be rewritten to `GATE_1..GATE_5` keys | `agents_os_v2/orchestrator/pipeline.py` — FAIL_ROUTING dict | Team 51 CERT rerun: add CERT_16 or extend CERT_15 to cover fail routing targets |
| **KB-2026-03-20-33** | HIGH | `PipelineState.load()` does not call `_auto_migrate()` — TikTrack WP stranded at `G3_6_MANDATES` old gate ID | `agents_os_v2/orchestrator/state.py` — `load()` method | Team 51 CERT rerun: CERT_13/14 must still pass; add test: TikTrack domain load auto-migrates on real state file |
| **KB-2026-03-20-34** | HIGH | GATE_5 prompt generator heading shows "Dev Validation / Team 90" (old content). Must produce documentation closure content for Team 170/70 per domain | `agents_os_v2/orchestrator/pipeline.py` — `generate_gate5_prompt()` | Team 51 CERT rerun: CERT_08 (AOS GATE_5 → team_170) and CERT_09 (TikTrack GATE_5 → team_70) must pass with correct content |
| **KB-2026-03-20-38** | MEDIUM | D-03 deliverable gap — `DRY_RUN_01..15` test suite missing. End-to-end pipeline routing scenarios not covered. | `agents_os_v2/tests/` — missing dry-run test file | New test file covering domain×variant×gate routing matrix; Team 51 runs and confirms |

### 3.2 Team 61 Deliverable Format

Team 61 must produce:
```
_COMMUNICATION/team_61/TEAM_61_S003_P011_WP002_GATE_5_KB_FIXES_v1.0.0.md
```
Containing: code changes, new/updated test names, pytest output (all 19+ tests PASS including new ones).

### 3.3 Team 51 Re-verification

After Team 61 delivers, Team 51 runs:
```bash
python3 -m pytest agents_os_v2/tests/test_certification.py -q
python3 -m pytest agents_os_v2/tests/ -q -k "not OpenAI and not Gemini"
```
Expected: all CERT pass + new dry-run tests pass + regression clean. Team 51 produces brief confirmation artifact.

---

## §4 — Track B: Direct Governance Execution

Execute these items directly. You are the owner.

### 4.1 KB-35..39 Verification (each: verify closed or flag open)

For each entry below, check whether Team 61's WP002 implementation already resolved it. Method: read the relevant code, check if a CERT test covers it, then either CLOSE with evidence or flag as still-OPEN.

| bug_id | description | check | expected resolution |
|---|---|---|---|
| **KB-2026-03-20-35** | `GATE_MANDATE_FILES` maps key `"G3_6_MANDATES"` (old) — Dashboard mandate panel fails at GATE_3/3.1 | Read `pipeline.py` GATE_MANDATE_FILES dict + `pipeline-dashboard.js` mandate panel key lookup. Check if WP002 updated the key to `"GATE_3"`. | If key updated → CLOSE with code line evidence. If still `G3_6_MANDATES` → flag as OPEN + mandate Team 61 fix. |
| **KB-2026-03-20-36** | `pass` command has no gate identifier — silent wrong-gate advance risk | Read `pipeline_run.sh` pass subcommand. Does it accept `GATE_N` param and abort on mismatch? (Per IDEA-050) | If implemented → CLOSE. If missing → OPEN; add to Team 61 mandate from §3 (add to KB-32/33/34/38 batch). |
| **KB-2026-03-20-37** | `flags.waiting_human_approval` checks old gate IDs `("WAITING_GATE2_APPROVAL","GATE_7")` instead of `gate_state=="HUMAN_PENDING"` | Read `pipeline.py` `_write_state_view()` ~line 247. Does it check `gate_state=="HUMAN_PENDING"`? | If fixed → CLOSE. If still old IDs → OPEN; add to Team 61 mandate. |
| **KB-2026-03-20-39** | `GATE_ALIASES` is identity map (useless) — should map old IDs → canonical GATE_N | Read `pipeline.py` GATE_ALIASES dict ~lines 44–50. Do old IDs map to canonical IDs per GATE_SEQUENCE_CANON §8? | If properly mapped → CLOSE. If identity map → OPEN; add to Team 61 mandate. |

Update KNOWN_BUGS_REGISTER for each: status → CLOSED (with evidence code line + CERT witness) or flag as OPEN.

### 4.2 AC-WP2-16..22 Deep Verification

These were PARTIAL in QA v1.0.1. Execute each:

| AC | description | your action |
|---|---|---|
| **AC-WP2-16** | Registry parity — WSM + program/work-package registries aligned | Check `PHOENIX_PROGRAM_REGISTRY_v1.0.0.md` S003-P011 row matches current state (WP002 at GATE_5). Update if stale. |
| **AC-WP2-17** | `04_GATE_MODEL_PROTOCOL_v2.3.0` deprecated in favor of `GATE_SEQUENCE_CANON_v1.0.0` — deprecated doc must carry ARCHIVED header | Read `documentation/docs-governance/04-GATE_MODEL_PROTOCOL_v2.3.0.md` (or equivalent path). If no ARCHIVED header → add it. |
| **AC-WP2-18** | Procedure docs reference `GATE_SEQUENCE_CANON` as canonical | Check `AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md` and any gate procedure docs. Update references to legacy gate names → canonical 5-gate model. |
| **AC-WP2-19** | SMOKE_01 — AOS / TRACK_FOCUSED full E2E | **BLOCKED until KB-34 fixed.** After Team 61 fixes GATE_5 prompt (§3), run: `./pipeline_run.sh --domain agents_os` at GATE_5/5.1. Capture state file + prompt output. Confirm routing = team_170. |
| **AC-WP2-20** | SMOKE_02 — TikTrack / TRACK_FULL | **BLOCKED until KB-33 fixed.** After Team 61 fixes auto-migration (§3), run: `./pipeline_run.sh --domain tiktrack status`. Confirm auto-migration triggers + current_gate = GATE_3, team_10 routing. |
| **AC-WP2-21** | SSOT audit — one canonical source per governance concept | Audit: for each major governance concept (gate sequence, team roster, process variants, KB register), confirm exactly one SSOT document exists. List any duplicates or missing canonical declarations. |
| **AC-WP2-22** | ARCHIVED headers — all superseded documents carry canonical ARCHIVED header | Scan `documentation/` and `_COMMUNICATION/` for superseded docs (older versions where v+1 exists). Each must begin with: `> **[ARCHIVED — superseded by X_v1.N.md]**` |

### 4.3 Identity Files

Create identity/activation files for each missing team. These are minimal YAML headers in `_COMMUNICATION/team_XXX/TEAM_XXX_IDENTITY_v1.0.0.md`:

| team | engine | role |
|---|---|---|
| team_11 | Cursor Composer | AOS Gateway / Execution Lead — TRACK_FOCUSED orchestration, mandate issuance to Team 61, gate progression |
| team_101 | OpenAI / Codex | AOS Domain Architect — LOD200/LLD400 spec authorship for AOS programs |
| team_102 | OpenAI / Codex | TikTrack Domain Architect — LOD200/LLD400 spec authorship for TikTrack programs (registered, not yet active) |
| team_191 | GitHub / Backup | GitHub operations, CI/CD, repository management, branch protection |

Format per existing identity files in the repository.

### 4.4 D-07 / D-08 — Archived Document Promotion

| deliverable | action |
|---|---|
| D-07 | Identify all WP001 documents (LOD200 v1.0.0, LLD400 v1.0.0, old team communications) that have been superseded by WP002 equivalents. Add ARCHIVED header or SUPERSEDES note to each superseded WP001 document. |
| D-08 | Confirm that `ARCHITECT_DIRECTIVE_GATE_SEQUENCE_CANON_v1.0.0.md` is the single canonical reference for gate model. Any older gate protocol documents that predate it must be archived. |

---

## §5 — Phase 5.1 Completion Package

When all Track B items are done AND Track A confirmation received, produce:

```
_COMMUNICATION/team_170/TEAM_170_S003_P011_WP002_GATE_5_PHASE_5.1_CLOSURE_v1.0.0.md
```

Contents (mandatory sections):
- `§1` — KB-35..39 disposition table (CLOSED/OPEN with evidence)
- `§2` — KB-32/33/34/38 fix confirmation (reference Team 51 artifact)
- `§3` — AC-WP2-16..22 results (PASS/FAIL/BLOCKED each, with evidence)
- `§4` — Identity files created (list paths)
- `§5` — D-07/D-08 archived docs (list what was archived)
- `§6` — SMOKE_01/02 results (after KB-33/34 fixed)
- `§7` — Phase 5.1 self-declaration: COMPLETE / BLOCKED_PENDING_TEAM_61

Then hand off to Team 90 for **Phase 5.2** (final validation).

---

## §6 — Phase 5.2 (Team 90) Gate Conditions

Team 90 Phase 5.2 may ONLY begin when:
1. KB-32, KB-33, KB-34, KB-38 all confirmed CLOSED by Team 51 rerun
2. SMOKE_01 (AOS E2E) PASS
3. SMOKE_02 (TikTrack E2E, including auto-migration evidence) PASS
4. AC-WP2-16..22 all PASS or explicitly accepted as carry-forward with justification
5. Team 170 Phase 5.1 closure package submitted

If any Phase 5.2 pre-condition is blocked, document the blocker explicitly. Do not advance to Phase 5.2 without all conditions met.

---

## §7 — Reference Documents (read before starting)

| document | why |
|---|---|
| `_COMMUNICATION/team_00/TEAM_100_S003_P011_WP002_PIPELINE_STABILIZATION_LOD200_v1.0.1.md` | Full scope + Iron Rules + AC-WP2 original definitions |
| `_COMMUNICATION/team_101/TEAM_101_S003_P011_WP002_GATE_2_LLD400_v1.0.1.md` | §17.5 CERT matrix, §7 fail/pass contract |
| `_COMMUNICATION/team_00/TEAM_100_S003_P011_WP002_GATE_4_PHASE_4.2_SIGNOFF_v1.0.0.md` | KB-32..39 architectural dispositions |
| `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_DECISIONS_WP2_02_03_04_v1.0.0.md` | Scope boundaries (no role_catalog in WP002) |
| `documentation/docs-governance/01-FOUNDATIONS/KNOWN_BUGS_REGISTER_v1.0.0.md` | KB status — update here for all closures |
| `_COMMUNICATION/team_51/TEAM_11_TO_TEAM_51_S003_P011_WP002_FULL_QA_REQUEST_v1.0.0.md` | §4 AC-WP2 definitions + §3 SMOKE procedures |

---

**log_entry | TEAM_100 | S003_P011_WP002 | GATE_5_PHASE_5.1_ACTIVATION | TEAM_170_MANDATED | 2026-03-21**

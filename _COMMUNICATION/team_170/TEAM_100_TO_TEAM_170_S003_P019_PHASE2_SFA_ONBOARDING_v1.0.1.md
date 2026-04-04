---
deprecated: true
superseded_by: TEAM_100_TO_TEAM_170_S003_P019_PHASE2_SFA_ONBOARDING_v1.0.3.md
deprecation_note: "v1.0.2 fixes Phoenix QA roster drift — use Team 51 (AOS QA), not TikTrack Team 50, for handoffs."
id: TEAM_100_TO_TEAM_170_S003_P019_PHASE2_SFA_ONBOARDING_v1.0.1
from: Team 100 (Architecture)
to: Team 170 (Documentation)
cc: Team 00 (Principal)
date: 2026-04-04
supersedes: TEAM_100_TO_TEAM_170_S003_P019_PHASE2_SFA_ONBOARDING_v1.0.0.md
type: BUILD_ACTIVATION
program_id: S003-P019
phase: Phase 2 — SFA Team Onboarding
domain: AGENTS_OS
pre_condition: S003-P019 Phase 1 L-GATE_V PASS ✓ (Team 190 revalidation — 2026-04-04, all 10 ACs PASS)
pilot_wp: SFA-P001-WP001
pilot_wp_gate_entry: L-GATE_B (continuing from L-GATE_S — spec at projects/sfa/SFA_P001_WP001_LOD200_SPEC.md)
lgate_v_validator: sfa_team_50 (OpenAI — canonical per team_assignments.yaml + LOD200 spec PAC-04)
status: ACTIVE — Phase 1 closed; Phase 2 authorized
change_log:
  v1.0.1: "CORRECTION — §12/§1/cc: validator = sfa_team_50 (not Team 190). Team 190 Phase 2
           mandate retired. PAC alignment note added. Status updated from PENDING to ACTIVE."
---

# Activation — S003-P019 Phase 2: SFA Team Onboarding
## Team 170 | Pilot WP L-GATE_B + L-GATE_V | SmallFarmsAgents repo

---

## §1 — Identity and Context

**You are Team 170 (Documentation), executing S003-P019 Phase 2.**

**Pre-condition confirmed:** Phase 1 L-GATE_V PASS (Team 190, 2026-04-04, AC-01..AC-10 all PASS, commit `c116602`).
Pilot WP `SFA-P001-WP001` is at `L-GATE_S` (spec approved in agents-os Phase 1).
**Phase 2 is now ACTIVE.**

**Phase 2 objective:**
Execute the pilot WP `SFA-P001-WP001` through L-GATE_B. This means writing `LEAN_KIT_INTEGRATION.md`
and all team activation prompts in the SmallFarmsAgents repository, so every SFA team has their
Lean context and can begin executing immediately.

**L-GATE_V validator for Phase 2:** `sfa_team_50` (OpenAI).
SFA Team 50 is the canonical `CONSTITUTIONAL_VALIDATOR` declared in `team_assignments.yaml`
and LOD200 spec PAC-04. The AOS-side Team 190 Phase 2 validation mandate is retired — it
was based on a draft before the Phase 1 artifacts locked the canonical validator.

**Result of Phase 2:**
`SFA-P001-WP001` advances to L-GATE_V. After sfa_team_50 PASS + Nimrod (ARCH_APPROVER) ratifies:
- SFA-P001-WP001 status = COMPLETE
- S003-P019 fully complete (Phase 1 + Phase 2)
- All SFA teams are Lean-ready

---

## §2 — Mandatory Reads (complete before creating any file)

1. **Pilot WP spec — your authority document:**
   ```
   /Users/nimrod/Documents/agents-os/projects/sfa/SFA_P001_WP001_LOD200_SPEC.md
   ```
   Sections that govern Phase 2: §1 (objective), §2 (deliverables), §3 (section requirements), §4 (ACs).

2. **SFA team assignments (your role map):**
   ```
   /Users/nimrod/Documents/agents-os/projects/sfa/team_assignments.yaml
   ```

3. **SFA roadmap (current WP state):**
   ```
   /Users/nimrod/Documents/agents-os/projects/sfa/roadmap.yaml
   ```
   Confirm: `SFA-P001-WP001.current_lean_gate: L-GATE_S` (your entry point = L-GATE_B).

4. **SmallFarmsAgents ROADMAP.md (fresh context — active milestone M10):**
   ```
   /Users/nimrod/Documents/SmallFarmsAgents/_COMMUNICATION/ROADMAP.md
   ```

5. **SmallFarmsAgents _COMMUNICATION/ structure (read before writing):**
   ```bash
   ls /Users/nimrod/Documents/SmallFarmsAgents/_COMMUNICATION/
   ls /Users/nimrod/Documents/SmallFarmsAgents/_COMMUNICATION/TEAM_100/
   ls /Users/nimrod/Documents/SmallFarmsAgents/_COMMUNICATION/TEAM_10/
   ls /Users/nimrod/Documents/SmallFarmsAgents/_COMMUNICATION/TEAM_20/
   ls /Users/nimrod/Documents/SmallFarmsAgents/_COMMUNICATION/TEAM_50/
   ```

---

## §3 — Phase 2 Deliverables (5 files — all in SmallFarmsAgents repo)

| # | File | Path in SmallFarmsAgents | Description |
|---|------|--------------------------|-------------|
| PD1 | `LEAN_KIT_INTEGRATION.md` | `_COMMUNICATION/` | Master Lean integration guide for all SFA teams |
| PD2 | `LEAN_KIT_ACTIVATION_TEAM100.md` | `_COMMUNICATION/TEAM_100/` | SFA Team 100 (Architecture) — SPEC_AUTHOR role |
| PD3 | `LEAN_KIT_ACTIVATION_TEAM10.md` | `_COMMUNICATION/TEAM_10/` | SFA Team 10 (Feature Dev) — ORCHESTRATOR role |
| PD4 | `LEAN_KIT_ACTIVATION_TEAM20.md` | `_COMMUNICATION/TEAM_20/` | SFA Team 20 (Infrastructure) — IMPLEMENTATION_TEAM role |
| PD5 | `LEAN_KIT_ACTIVATION_TEAM50.md` | `_COMMUNICATION/TEAM_50/` | SFA Team 50 (QA) — CONSTITUTIONAL_VALIDATOR role |

All 5 files are committed to SmallFarmsAgents repo. Nothing goes into agents-os (except the roadmap.yaml gate update).

---

## §4 — PD1: `LEAN_KIT_INTEGRATION.md`

Minimum ≥600 words. Must contain all 7 sections (per LOD200 spec §3):

1. **What is the Lean Kit** — 2–3 paragraphs, non-technical; L0 profile; methodology overlay
2. **Why SmallFarmsAgents at M10** — M9 closure as inflection point; overlay rationale; no disruption
3. **Team role map** — table: SFA Team → Lean Role → Responsibility (5 rows, matches team_assignments.yaml)
4. **Lean Gate Model for SFA** — Track B visual: L-GATE_E → L-GATE_C → L-GATE_S → L-GATE_B → L-GATE_V; gate meanings
5. **Pilot WP: SFA-P001-WP001** — this document is the pilot output; who did what; what it proves
6. **Where to find Lean Kit docs** — agents-os repo paths: `projects/sfa/`, `lean-kit/examples/`, etc.
7. **Iron Rule** — different engine rule; Team 10/20 (Cursor) build → Team 50 (OpenAI) validates; non-waivable

---

## §5 — PD2: `LEAN_KIT_ACTIVATION_TEAM100.md` (SFA Team 100 — SPEC_AUTHOR)

Required structure: YAML frontmatter (`role`, `sfa_team`, `engine`) + sections:
- **Identity** — who you are in Lean Kit: SFA Team 100, SPEC_AUTHOR
- **Your authority** — unchanged architectural decision-making; Lean adds gate tracking only
- **Mandatory first reads** (this session): LEAN_KIT_INTEGRATION.md, ROADMAP.md, agents-os/projects/sfa/roadmap.yaml
- **Gate responsibilities** — what SPEC_AUTHOR does at each gate (L-GATE_C concept, L-GATE_S spec)
- **First Lean action** — SFA-P001-WP001 at L-GATE_V; confirm LEAN_KIT_INTEGRATION.md matches spec; for NEXT WP: write LOD200 when M10 phase completes
- **References** — paths to agents-os SFA files

---

## §6 — PD3: `LEAN_KIT_ACTIVATION_TEAM10.md` (SFA Team 10 — ORCHESTRATOR)

Required structure: YAML frontmatter + sections:
- **Identity** — SFA Team 10, ORCHESTRATOR
- **Your unchanged work** — feature collectors, parsers, admin UI; Lean adds gate tracking only
- **Mandatory first reads** — LEAN_KIT_INTEGRATION.md, roadmap.yaml
- **Gate responsibilities** table: L-GATE_E confirm eligibility; L-GATE_S confirm scope before build; L-GATE_B implement + self-QA; L-GATE_V route to Team 50
- **First Lean action** — SFA-P001-WP001 completing L-GATE_V (Team 50 validating); when result returns, record in roadmap.yaml
- **References**

---

## §7 — PD4: `LEAN_KIT_ACTIVATION_TEAM20.md` (SFA Team 20 — IMPLEMENTATION_TEAM)

Required structure: YAML frontmatter + sections:
- **Identity** — SFA Team 20, IMPLEMENTATION_TEAM
- **Your unchanged work** — DB, migrations, Alembic, Docker; Lean adds gate tracking only
- **Mandatory first reads** — LEAN_KIT_INTEGRATION.md, roadmap.yaml (check for pending infra WPs)
- **Gate responsibilities** — primarily L-GATE_B: execute spec → implement → self-QA → record PASS
- **First Lean action** — no active infra WP currently; monitor roadmap.yaml for new assignments
- **Cross-engine rule** reminder — your builds validated by Team 50 (OpenAI)
- **References**

---

## §8 — PD5: `LEAN_KIT_ACTIVATION_TEAM50.md` (SFA Team 50 — CONSTITUTIONAL_VALIDATOR)

This document is also Team 50's activation prompt for **validating Phase 2** (see §11).
It must be complete enough that Nimrod can open an OpenAI session, paste PD5, and have
Team 50 immediately understand their role and validation task.

Required structure: YAML frontmatter (`role: CONSTITUTIONAL_VALIDATOR`, `engine: openai`, `iron_rule: ENFORCER`) + sections:

- **Identity** — SFA Team 50, CONSTITUTIONAL_VALIDATOR; most critical Lean role; enforces Iron Rule
- **Iron Rule** — different engine mandatory; Cursor (Teams 10/20) builds → OpenAI (Team 50) validates; never skip; call FAIL if spec not met
- **Your existing QA work** — Phase B QA, G-gate sign-off unchanged; Lean L-GATE_V is additive
- **Mandatory first reads** — LEAN_KIT_INTEGRATION.md, agents-os/projects/sfa/roadmap.yaml, agents-os/projects/sfa/team_assignments.yaml
- **Validation process** — 7-step process: receive request → read spec_ref → test each AC → classify findings → issue report → record gate_history
- **First validation: SFA-P001-WP001** — validate this Phase 2 package (PD1–PD5) against PAC-01..PAC-06 (from LOD200 spec) + PAC-07..PAC-10 (operational checks)
- **Result format** — file to: `SmallFarmsAgents/_COMMUNICATION/TEAM_50/reports/LGATE_V_SFA_P001_WP001_RESULT_v1.0.0.md`; required header fields; verdict options: PASS / PASS_WITH_FINDINGS / FAIL
- **ARCH_APPROVER note** — after PASS, Nimrod reviews Team 50's report as ARCH_APPROVER and ratifies L-GATE_V

**PD5 validation mandate content (embed in PD5 §"First validation" section):**

PAC-01..PAC-06 are from the authoritative LOD200 spec (`agents-os/projects/sfa/SFA_P001_WP001_LOD200_SPEC.md §4`).
PAC-07..PAC-10 are operational extensions from the build mandate.

| AC | Criterion |
|----|-----------|
| PAC-01 | `LEAN_KIT_INTEGRATION.md` exists, ≥600 words, all 7 sections present (What is Lean Kit / Why SFA at M10 / Team Role Map / Lean Gate Model / Pilot WP / Where to Find Docs / Iron Rule) |
| PAC-02 | All 4 team activation docs exist in correct `_COMMUNICATION/TEAM_{100,10,20,50}/` paths |
| PAC-03 | Each activation doc has YAML frontmatter with `role`, `sfa_team`, `engine`; ≥150 words; begins with identity + first action |
| PAC-04 | sfa_team_50 (you) can validate this package — i.e., PD5 gives you enough context to act as CONSTITUTIONAL_VALIDATOR immediately |
| PAC-05 | No application code modified — only `_COMMUNICATION/` files added (verify `git diff --name-only HEAD~1` in SmallFarmsAgents) |
| PAC-06 | All 5 files committed to SmallFarmsAgents `main` (not agents-os) |
| PAC-07 | `agents-os/projects/sfa/roadmap.yaml` `SFA-P001-WP001.current_lean_gate` updated to `L-GATE_V` |
| PAC-08 | `LEAN_KIT_INTEGRATION.md` references `agents-os/projects/sfa/` paths correctly (§6 "Where to find docs") |
| PAC-09 | PD5 specifies exactly where to file validation result (`SmallFarmsAgents/_COMMUNICATION/TEAM_50/reports/LGATE_V_SFA_P001_WP001_RESULT_v1.0.0.md`) |
| PAC-10 | Both repos pushed to remote: SmallFarmsAgents origin/main + agents-os origin/main |

---

## §9 — Execution Steps (in order)

1. Complete all mandatory reads (§2)
2. Create PD1 `LEAN_KIT_INTEGRATION.md` — write all 7 sections (≥600 words)
3. Create PD2 `LEAN_KIT_ACTIVATION_TEAM100.md`
4. Create PD3 `LEAN_KIT_ACTIVATION_TEAM10.md`
5. Create PD4 `LEAN_KIT_ACTIVATION_TEAM20.md`
6. Create PD5 `LEAN_KIT_ACTIVATION_TEAM50.md` — **must include PAC-01..PAC-10 table** so Team 50 can validate without external documents
7. Self-QA PAC-01..PAC-10 (you are the builder — self-QA only, not final)
8. Commit all 5 files to SmallFarmsAgents repo
9. Update `agents-os/projects/sfa/roadmap.yaml`:
   - `SFA-P001-WP001.current_lean_gate` → `L-GATE_V`
   - `SFA-P001-WP001.status` → `IN_PROGRESS` (remains)
   - Add `gate_history` entry: `gate: L-GATE_B`, `result: PASS`, `date: <today>`, `notes: "Phase 2 onboarding docs built (5 files in SmallFarmsAgents). Self-QA PAC-01..PAC-10 PASS."`
10. Commit agents-os roadmap update
11. Push both repos to remote
12. File completion report (§10)

---

## §10 — Completion Report

File as:
```
/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/_COMMUNICATION/_ARCHITECT_INBOX/TEAM_170_TO_TEAM_100_S003_P019_PHASE2_COMPLETION_REPORT_v1.0.0.md
```

Required header:
```yaml
from: Team 170
to: Team 100
cc: Team 00
date: <today>
program_id: S003-P019
phase: Phase 2 (SFA team onboarding — pilot WP L-GATE_B)
pacs_pass: [PAC-01..PAC-10 results]
pacs_fail: []
sfa_repo_commit: <sha>
agents_os_commit: <sha>
overall_verdict: PASS / PASS_WITH_FINDINGS / FAIL
```

Self-QA before filing:
- [ ] PAC-01..PAC-10 all tested
- [ ] 5 files present in SmallFarmsAgents `_COMMUNICATION/` correct subfolders
- [ ] PAC-05: `git diff --name-only HEAD~1` — only `_COMMUNICATION/` paths
- [ ] PAC-07: `grep "current_lean_gate" agents-os/projects/sfa/roadmap.yaml` → `L-GATE_V`
- [ ] PAC-10: both remotes pushed

---

## §11 — L-GATE_V: SFA Team 50 Activation (Nimrod's action after completion report)

After Team 170 files the completion report:

1. Nimrod opens a new **OpenAI** session
2. Pastes content of `SmallFarmsAgents/_COMMUNICATION/TEAM_50/LEAN_KIT_ACTIVATION_TEAM50.md` as the activation prompt
3. SFA Team 50 validates PAC-01..PAC-10 and files result to:
   ```
   SmallFarmsAgents/_COMMUNICATION/TEAM_50/reports/LGATE_V_SFA_P001_WP001_RESULT_v1.0.0.md
   ```
4. Nimrod reviews Team 50's report as **ARCH_APPROVER** and ratifies L-GATE_V
5. Nimrod updates `agents-os/projects/sfa/roadmap.yaml` — adds `gate: L-GATE_V, result: PASS` entry + `status: COMPLETE` on `SFA-P001-WP001`
6. Commit + push to agents-os

---

## §12 — Note on Retired Mandate

`TEAM_100_TO_TEAM_190_S003_P019_PHASE2_SFA_VALIDATION_v1.0.0.md` is **retired**.
It was written before Phase 1 artifacts locked `sfa_team_50` as the canonical L-GATE_V validator.
Team 190 AOS-side oversight of Phase 2 is NOT required. Iron Rule is satisfied by:
Team 170 (Cursor) builds → sfa_team_50 (OpenAI) validates.

---

## §13 — Final State After Phase 2 + L-GATE_V PASS

| Item | State |
|------|-------|
| S003-P019 | COMPLETE (Phase 1 + Phase 2) |
| `agents-os/projects/smallfarmsagents.yaml` | Locked on origin/main |
| `SFA-P001-WP001` | COMPLETE — L-GATE_V PASS |
| SFA Teams 100/10/20/50 | Lean-ready (activation docs in SmallFarmsAgents/_COMMUNICATION/) |
| Next: SFA team activation | Nimrod pastes each team's activation doc into their session |
| Next: AOS roadmap | S004-P009 (Lean Kit Generator) informed of S003-P019 COMPLETE |
| EyalAmit | Remains deferred per LOD200 §10 trigger conditions |

---

**log_entry | TEAM_100 | S003_P019_PHASE2_BUILD_ACTIVATION_v1.0.1 | TEAM_170 | PILOT_WP_LGATE_B | VALIDATOR_CORRECTED_SFA_TEAM_50 | 2026-04-04**

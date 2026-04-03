---
id: ARCHITECT_DIRECTIVE_DIRECT_MANDATE_PROTOCOL_v1.0.0
historical_record: true
authority: Team 00 (Nimrod) + Team 100 (Claude Code)
classification: IRON_RULE
status: ACTIVE
date: 2026-03-23
supersedes: —---

# ARCHITECT DIRECTIVE — Direct Mandate Protocol (DMP)
## Governing adhoc architectural instructions outside the pipeline

---

## §1 — Problem Statement

The Phoenix pipeline (WSM + gate model) governs planned work packages. However,
operational reality requires issuing architectural instructions that:
- Are urgent or narrow in scope (< one work package)
- Target a single team for a bounded task
- Must not disrupt active pipeline runs or create fake WPs
- Must still be traceable and closeable

Without a defined protocol, such instructions cause:
- SSOT drift (teams don't know if they should update WSM)
- Scope confusion (teams over-deliver or under-deliver)
- No canonical return path (work is done but no closure)
- Interference risk with active WPs

---

## §2 — The Direct Mandate Protocol (DMP)

A **Direct Mandate** is an architectural instruction issued by Team 00 or Team 100
**outside the pipeline gate model**. It has its own lifecycle, governed by this directive.

### §2.1 — When DMP applies (use criteria)

Use DMP when ALL of the following are true:
1. The work is **bounded** (one team, one output, defined scope)
2. The work **does not require** implementation → QA → gate review cycle
3. The work is **time-sensitive** or **unrelated** to any active WP's scope
4. The work is a **fix**, **documentation**, **audit**, or **governance** action

DMP is **NOT** for:
- Feature implementation (use pipeline TRACK_FOCUSED or TRACK_FAST)
- Multi-team coordination with sequential dependencies (use pipeline)
- Any work that changes production TikTrack code (always requires pipeline)

### §2.2 — Authority

Direct Mandates may be issued by:
- **Team 00 (Nimrod)** — unrestricted
- **Team 100** — only when explicitly authorized by Team 00 in the same session,
  or when operating under the Canary Monitor role
- No other team may issue Direct Mandates

---

## §3 — Mandatory Fields (every Direct Mandate document)

Every Direct Mandate MUST contain the following fields in its header:

```yaml
---
id: TEAM_100_TO_TEAM_{N}_{SUBJECT}_{VERSION}
from: Team 100 (or Team 00)
to: Team {N}
authority: Direct Mandate — authorized by Team 00 (Nimrod). [session date].
classification: DIRECT_MANDATE
pipeline_impact: NONE | READ_ONLY | BRIDGE_TO_PIPELINE
conflict_check: [active WP IDs checked; none conflicting / WP-XXX excluded from scope]
scope_boundary: |
  IN_SCOPE: [explicit list]
  OUT_OF_SCOPE: [explicit list — at minimum: "production TikTrack code" if applicable]
return_path: Team {N} → Team 100 → [Team 00 / CLOSED]
wsm_update_required: NO | YES (only if bridge_to_pipeline=YES)
---
```

**`pipeline_impact` values:**
| Value | Meaning |
|---|---|
| `NONE` | Directive has zero effect on pipeline state or WSM |
| `READ_ONLY` | Team reads pipeline/WSM data but does not modify |
| `BRIDGE_TO_PIPELINE` | Output MAY become a WP; Team 100 decides at closure |

**`conflict_check` is mandatory.** Before issuing, Team 100 runs:
```bash
./pipeline_run.sh --domain tiktrack status
./pipeline_run.sh --domain agents_os status
```
and confirms no active WP overlaps with the directive scope.

---

## §4 — Lifecycle (4 states)

```
DRAFT → ACTIVE → PENDING_REVIEW → CLOSED
```

| State | Description | Owner |
|---|---|---|
| `DRAFT` | Mandate written, not yet sent to team | Team 100 |
| `ACTIVE` | Mandate delivered to team; team executing | Target team |
| `PENDING_REVIEW` | Team returned deliverables to Team 100 | Team 100 |
| `CLOSED` | Team 100 issued final decision; registered | Team 100 |

Lifecycle advance is tracked in the **DMP Registry** (§6).

---

## §5 — Team Instructions (what every recipient team MUST know)

Every Direct Mandate document MUST include this block verbatim near the top:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  DIRECT MANDATE — not a pipeline work package
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ This is a bounded, standalone instruction.
  ⛔ Do NOT update WSM or pipeline_state files.
  ⛔ Do NOT run ./pipeline_run.sh.
  ⛔ Do NOT expand scope beyond what is listed below.
  ✅ Save your output to the canonical path in §N.
  ✅ Return to Team 100 with a COMPLETION_REPORT.
     Format: _COMMUNICATION/team_{N}/TEAM_{N}_DM_{SUBJECT}_COMPLETION_v1.0.0.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

This block eliminates scope confusion and WSM interference.

---

## §6 — DMP Registry

**File:** `_COMMUNICATION/_Architects_Decisions/DIRECT_MANDATE_REGISTRY_v1.0.0.md`

This registry is the single source of truth for all Direct Mandates.

**Format:**

```markdown
| DM-ID | Date | Issuer | Team | Subject | Status | Closed |
|-------|------|--------|------|---------|--------|--------|
| DM-001 | 2026-03-23 | Team 100 | Team 101 | Canary Fix Sprint | CLOSED | ✅ 2026-03-23 |
| DM-002 | 2026-03-23 | Team 100 | Team 170 | AOS Pipeline Docs | CLOSED | ✅ 2026-03-23 |
| DM-003 | 2026-03-23 | Team 100 | Team 101 | Canary Simulation | ACTIVE | — |
```

**Rules:**
- Team 100 adds a row when issuing a mandate (status: ACTIVE)
- Team 100 updates status when deliverables received (PENDING_REVIEW)
- Team 100 closes when final decision issued (CLOSED + date)
- Registry is NOT a WSM substitute — it is an operational log only

---

## §7 — Bridge Decision (BRIDGE_TO_PIPELINE)

When a Direct Mandate produces output that should become part of the canonical
codebase or system documentation permanently, Team 100 must make an explicit
**bridge decision** at closure:

| Decision | Action |
|---|---|
| **ABSORB** | Output is accepted as-is into the canonical codebase/docs; no WP needed |
| **FORMALIZE** | Output requires a proper pipeline WP to integrate (Team 00 activates) |
| **DISCARD** | Output was operational/temporary; not promoted |

The bridge decision is recorded in the closure row of the DMP Registry.

**Canary Fix Sprint (DM-001, DM-002): ABSORB** — code fixes and documentation
integrated directly; no further pipeline WP required.

---

## §8 — Relationship to WSM and Pipeline

```
WSM / Pipeline ←──────────────────────────────────────────→ DMP
    ↑                                                           ↑
Planned work packages                              Bounded adhoc work
Gate model (GATE_0–GATE_5)                    No gate model — lifecycle §4
SSOT-tracked                                  Registry-tracked (not WSM)
Team 10/11 gateway                            Team 100 issues directly
Multi-team sequential                         Single team, single output
    ↓                                                           ↓
         Bridge Decision (§7) connects them when needed
```

**Iron Rule:** A Direct Mandate NEVER updates `pipeline_state_{domain}.json` or
`PHOENIX_MASTER_WSM` STAGE_PARALLEL_TRACKS unless explicitly instructed by
`wsm_update_required: YES` AND Team 100 confirms in writing.

---

## §9 — DMP vs TRACK_FAST comparison

For completeness, when to use DMP vs. creating a minimal WP:

| Criterion | DMP | TRACK_FAST (pipeline) |
|---|---|---|
| Scope | ≤ 1 team, 1 output | 1+ teams, code change |
| SSOT update | NO | YES (required) |
| Dashboard visibility | NO | YES |
| Time to activate | Immediate | GATE_0 registration required |
| Typical use | Docs, fixes, audits, governance | Feature, infra, schema |
| Audit trail | DMP Registry | Pipeline history + WSM |

---

## §10 — Retroactive Registration (canary run directives)

The following Direct Mandates issued during S003-P013 canary run are hereby
registered retroactively under this protocol:

| DM-ID | Date | Team | Subject | Bridge | Status |
|-------|------|------|---------|--------|--------|
| DM-001 | 2026-03-23 | Team 101 | Canary Fix Sprint (FIX-101-01 to 07) | ABSORB | CLOSED |
| DM-002 | 2026-03-23 | Team 170 | AOS Pipeline Documentation (4 docs) | ABSORB | CLOSED |
| DM-003 | 2026-03-23 | Team 101 | Canary Simulation Mandate (Round 2 prep) | FORMALIZE (pending) | ACTIVE |

---

**log_entry | TEAM_100 | ARCHITECT_DIRECTIVE | DIRECT_MANDATE_PROTOCOL_v1.0.0 | IRON_RULE | AUTHORIZED_BY_TEAM_00 | 2026-03-23**

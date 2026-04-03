---
id: ARCHITECT_DIRECTIVE_SINGLE_SOURCE_OF_TRUTH_v1.0.0
historical_record: true
from: Team 00 (System Designer — Nimrod) + Team 100 (Chief System Architect)
date: 2026-03-20
status: LOCKED — Iron Rule
authority: Team 00 constitutional authority
trigger: WP002 governance conflict discovery (GATE_SEQUENCE_CANON vs 04_GATE_MODEL_PROTOCOL)---

# Architectural Directive — Single Source of Truth (SSOT)
## Every Governance Artifact Has Exactly ONE Canonical Source

---

## §1 — The Iron Rule

**Iron Rule — Single Source of Truth:**
> For every governance concept, rule, protocol, or data definition in this system, there must exist EXACTLY ONE canonical source document. All other documents that previously defined or described the same concept MUST be explicitly deprecated and archived. No active document may contain definitions that contradict or duplicate a canonical source.

**Violation pattern (example that triggered this directive):**
- `ARCHITECT_DIRECTIVE_GATE_SEQUENCE_CANON_v1.0.0` — NEW canonical gate model (GATE_1..GATE_5)
- `documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md` — OLD gate model (0..8 gates) — **still active, not archived**
- Result: teams can execute from either source, producing contradictory outputs

---

## §2 — SSOT Requirements

### 2.1 — When a New Document Supersedes an Old One

Every new canonical document MUST include in its YAML header:
```yaml
supersedes: <exact path or ID of deprecated document>
```

The deprecated document MUST have a deprecation notice added at the TOP of its file:
```markdown
> ⚠️ DEPRECATED — Superseded by `{new_document_id}` as of {date}.
> This document is ARCHIVED — retained for historical reference only.
> Do NOT use for active work. Source of truth: `{canonical_path}`
```

### 2.2 — Archive Protocol

"Archived" means:
1. Deprecation header added to the file (do NOT delete — retained for history)
2. Document status in YAML header changed to `ARCHIVED`
3. Document removed from active reading lists (WSM, Priority Maps, team constitutions)
4. Any team that previously cited this document must update their citation to the new canonical source

### 2.3 — Standing Process for All Future Documents

Every future architectural decision or procedure document that replaces a prior one MUST:
1. Include `supersedes:` field in YAML header
2. The author (Team 170 or document owner) adds deprecation header to old document as part of the same work package
3. Team 190 validation includes: "verify all superseded documents have deprecation headers"

---

## §3 — SSOT Audit Mandate

**Effective immediately (WP002 D-12):** Teams 170 + 190 must perform a full SSOT audit of all governance documentation.

### Audit scope:

| Location | What to scan |
|---|---|
| `documentation/docs-governance/01-FOUNDATIONS/` | All governance, protocol, and procedure documents |
| `documentation/docs-governance/04-PROCEDURES/` | All procedure and operating documents |
| `_COMMUNICATION/_Architects_Decisions/` | All ADRs — check for redundant/overlapping scope |
| `_COMMUNICATION/team_*/` — team constitutions | Check all team constitutions cite only canonical sources |
| `_COMMUNICATION/team_00/TEAM_00_CONSTITUTION_v1.0.0.md` | Spot-check iron rules for consistency |

### What to look for:

| Conflict type | Example |
|---|---|
| **Superseded but not archived** | Old gate model doc still active after GATE_SEQUENCE_CANON |
| **Contradicting values** | Team roster in 2 documents with different team counts |
| **Duplicate iron rules** | Same rule defined in CLAUDE.md, Constitution, and ADR differently |
| **Stale references** | Documents citing old file paths, old team IDs, old gate IDs |
| **Missing supersedes field** | New ADR that replaced something but never marked the old one |

### Known conflicts to resolve (confirmed at time of this directive):

| # | Old Document | Canonical Source | Action Required |
|---|---|---|---|
| 1 | `04_GATE_MODEL_PROTOCOL_v2.3.0.md` | `ARCHITECT_DIRECTIVE_GATE_SEQUENCE_CANON_v1.0.0` | Add `ARCHIVED` header to old doc — **WP002 D-11** |
| 2 | `04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md` (gate refs) | `ARCHITECT_DIRECTIVE_GATE_SEQUENCE_CANON_v1.0.0` | Update gate references in procedures — **WP002 D-11** |

Additional conflicts may be discovered during the audit — all must be resolved.

### Audit deliverable:

Team 170 produces `TEAM_170_SSOT_AUDIT_REPORT_v1.0.0.md` in `_COMMUNICATION/team_170/`:

```
For each conflict found:
  - document_a: {path}
  - document_b: {path}
  - conflict_type: SUPERSEDED_NOT_ARCHIVED | CONTRADICTION | DUPLICATE | STALE_REFERENCE
  - canonical_source: {path of the correct/newer document}
  - resolution: {what action was taken or recommended}
  - status: RESOLVED | PENDING_TEAM_00_DECISION
```

Team 190 validates the audit report and the resolutions.

---

## §4 — Governance Source Hierarchy (Confirmed)

For gate model and pipeline execution, the source hierarchy is now:

```
1. ARCHITECT_DIRECTIVE_GATE_SEQUENCE_CANON_v1.0.0   ← PRIMARY (Iron Rule)
2. team constitutions (SSOT for team-specific behavior)
3. AGENTS_OS_V2_OPERATING_PROCEDURES (operational, must reference GATE_SEQUENCE_CANON)
4. 04_GATE_MODEL_PROTOCOL_v2.3.0 → ARCHIVED (no longer operative)
```

For team roster:
```
1. ARCHITECT_DIRECTIVE_TEAM_ROSTER_v2.0.0   ← PRIMARY (Iron Rule)
2. agents_os_v2/config.py TEAM_ENGINE_MAP   ← operational mirror (must stay in sync)
3. Any prior roster document → ARCHIVED
```

---

## §5 — Enforcement

- Team 190 (Constitutional Validator): **at every gate, verify that no superseded document is being cited as active in any team output**
- Team 170 (Spec Author / Governance): **responsible for archive operations on all docs-governance documents**
- Team 100 (Chief System Architect): **responsible for `supersedes:` field in every new ADR**

Failure to maintain SSOT is a **BLOCK_FOR_FIX** finding at any gate where it is discovered.

---

**log_entry | TEAM_00 | IRON_RULE | SINGLE_SOURCE_OF_TRUTH | LOCKED | 2026-03-20**
**log_entry | TEAM_100 | ARCHITECT_DIRECTIVE_SSOT | ISSUED | WP002_D12_TRIGGERED | 2026-03-20**

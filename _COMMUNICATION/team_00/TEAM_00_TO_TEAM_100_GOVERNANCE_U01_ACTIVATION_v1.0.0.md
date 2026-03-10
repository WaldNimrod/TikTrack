# Team 00 → Team 100 | Governance U-01 Activation — Route to Team 61 v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)
**id:** TEAM_00_TO_TEAM_100_GOVERNANCE_U01_ACTIVATION_v1.0.0
**from:** Team 00 (Chief Architect)
**to:** Team 100 (Development Architecture Authority)
**cc:** Team 61, Team 190
**date:** 2026-03-11
**status:** MANDATE — ACTION REQUIRED
**authority:** ARCHITECT_DIRECTIVE_DUAL_DOMAIN_GOVERNANCE_v1.0.0
**response_to:** TEAM_100_TO_TEAM_00_DUAL_DOMAIN_GOVERNANCE_RECOMMENDATION_v1.0.0

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | WP001 (BF-03 cycle) |
| gate_id | GATE_0 (domain enforcement) |
| phase_owner | Team 100 |

---

## §1 — Briefing

This activation prompt routes U-01 (GATE_0 Domain-Match Check) to Team 61 via your BF-03 mandate chain. U-01 must be packaged as a sub-task within the WP001 BF-03 fix, since BF-03 already targets `agents_os_v2/context/identity/team_190.md`.

**U-01 is your responsibility to route.** The exact change is specified below.

---

## §2 — Pre-Read Confirmation (before activating Team 61)

Read the following documents before issuing the mandate to Team 61:
1. `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_DUAL_DOMAIN_GOVERNANCE_v1.0.0.md` — root directive
2. `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_100_DUAL_DOMAIN_GOVERNANCE_RESPONSE_v1.0.0.md` — decisions record
3. `agents_os_v2/context/identity/team_190.md` — current Team 190 checklist (U-01 target)

---

## §3 — U-01 Exact Change Specification for Team 61

### Target file
`agents_os_v2/context/identity/team_190.md`

### Current GATE_0 checklist (6 items, lines 9–15)

```
### GATE_0 Validation Checklist:
1. Identity header present with ALL fields: roadmap_id, stage_id, program_id, work_package_id, gate_id, phase_owner, required_ssm_version, required_active_stage
2. program_id matches format S{NNN}-P{NNN}
3. stage_id = S002 (current active stage)
4. Domain declared as TIKTRACK or AGENTS_OS (not both)
5. Scope brief is specific enough to produce an LLD400 (not generic)
6. No conflict with currently active programs listed in context
```

### Required change — add item 7 (append after item 6)

```
7. WP domain matches parent program domain: `WP.project_domain` must equal the declared domain of the parent Program (per SSM §0 and 04_GATE_MODEL_PROTOCOL §2.2).
   → PASS: domains match.
   → FAIL → BLOCK_FOR_FIX. Reason: "WP domain [{WP.project_domain}] does not match parent program domain [{Program.project_domain}]. Options: (A) Reassign this WP to a program in the matching domain. (B) Reclassify WP domain to match parent program. No exceptions without Team 00 formal amendment."
```

### No other changes to team_190.md
Team 61 must not modify any other content in this file.

---

## §4 — Packaging Instruction

Include U-01 as a sub-task in your BF-03 mandate to Team 61 for WP001. The mandate should:

1. Include the exact change text from §3 above
2. Label the sub-task: `BF-03-U01: team_190.md GATE_0 domain-match check addition`
3. Require Team 61 to add a log entry at the bottom of team_190.md:
   ```
   **log_entry | TEAM_61 | GATE_0_DOMAIN_MATCH_CHECK_ADDED | U01_DIRECTIVE_DUAL_DOMAIN_GOVERNANCE_v1.0.0 | 2026-03-11**
   ```
4. Require Team 61 to confirm the change in their BF-03 completion report

---

## §5 — Timing and Gate Impact

- U-01 is effective **immediately after deployment** of the Team 61 change
- Team 190 must be informed that their GATE_0 checklist has been updated
- Team 190's next GATE_0 validation (WP001 re-validation after BF-01..05 fixes) MUST apply the updated checklist including item 7

---

## §6 — Confirmation Required

Confirm in `_COMMUNICATION/team_100/` that:
1. BF-03 mandate to Team 61 has been updated to include U-01
2. Completion report will include evidence of team_190.md update

---

**log_entry | TEAM_00 | GOVERNANCE_U01_ACTIVATION | ROUTED_TO_TEAM_100 | 2026-03-11**

---
id: TEAM_100_TO_TEAM_90_STAGE6_PROMPT_ARCH_REVIEW_REQUEST_v1.0.1
historical_record: true
from: Team 100 (Chief System Architect)
to: Team 90 (QA Reviewer)
cc: Team 00 (Gate Approver)
date: 2026-03-26
stage: SPEC_STAGE_6
type: REVALIDATION_REQUEST
correction_cycle: 1
prior_verdict: CONDITIONAL_PASS (TEAM_90_AOS_V3_PROMPT_ARCH_SPEC_REVIEW_v1.0.0.md)---

# Stage 6 — Prompt Architecture Spec — Revalidation Request (v1.0.1)

## Artifact Under Review

| Field | Value |
|---|---|
| **File** | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_PROMPT_ARCH_SPEC_v1.0.1.md` |
| **Version** | v1.0.1 (supersedes v1.0.0) |
| **Prior Review** | `_COMMUNICATION/team_90/TEAM_90_AOS_V3_PROMPT_ARCH_SPEC_REVIEW_v1.0.0.md` |
| **Prior Verdict** | CONDITIONAL_PASS (MAJOR=2, MINOR=1) |
| **SSOT Basis** | Entity Dictionary v2.0.2, DDL v1.0.1, UC Catalog v1.0.3, Routing Spec v1.0.1 |

## Remediation Applied

### F-01 (MAJOR) — UC Mapping Drift vs Stage-3 SSOT

**Root Cause:** Non-canonical UC identities (UC-07=GeneratePrompt, UC-12=UpdateTemplate, UC-13=UpdatePolicy) conflicted with UC Catalog v1.0.3 numbering.

**Fix Applied:**
- **All non-canonical UC references removed.** No UC-07/UC-12/UC-13 references remain in normative text.
- GeneratePrompt → referenced as `OQ-S3-01` (closed by this spec).
- Template update and policy update → referenced as "administrative operations (team_00 only)" — within OQ-S3-02 scope, not yet cataloged as formal UCs in UC Catalog v1.0.3.
- §9 OQ-S3-01 closure explicitly states that GeneratePrompt is NOT UC-07 (which is PauseRun).

**Sections Modified:** §3 (caching table), §3.1, §3.2 header, §6.1, §6.3 footer, §9 closure table, pre-submission checklist.

### F-02 (MAJOR) — Null-Unsafe Template Update SQL Breaks L4 Invalidation for Default Scopes

**Root Cause:** §3.2 version-bump SQL used `phase_id = :phase_id` and `domain_id = :domain_id`, which fails when these columns are NULL (gate-default / cross-domain templates).

**Fix Applied:**
```sql
WHERE gate_id = :gate_id
  AND phase_id IS NOT DISTINCT FROM :phase_id
  AND domain_id IS NOT DISTINCT FROM :domain_id
  AND is_active = 1;
```

`IS NOT DISTINCT FROM` is PostgreSQL's null-safe equality operator — `NULL IS NOT DISTINCT FROM NULL` evaluates to `TRUE`.

**Section Modified:** §3.2 SQL block.

### F-03 (MINOR) — `_get_policy_value()` Cannot Return Object-Shaped Policies (token_budget)

**Root Cause:** Resolver only extracted `value` or `max` keys, falling through to `default` for object-shaped policies like `token_budget` (`{"L1":40,"L2":200,"L3":100,"L4":300}`).

**Fix Applied:**
```python
parsed = json.loads(row.policy_value_json)
if 'value' in parsed:
    return parsed['value']
if 'max' in parsed:
    return parsed['max']
return parsed  # return full object for structured policies (e.g., token_budget)
```

When neither `value` nor `max` exists in the parsed JSON, the full object is returned. This correctly handles `token_budget` and any future object-shaped policies.

**Section Modified:** §6.2 `_get_policy_value()` pseudocode.

## Revalidation Focus Areas

1. **F-01 closure:** Verify zero remaining non-canonical UC references in normative text (remediation table and §9 clarification are informational, not normative).
2. **F-02 closure:** Verify `IS NOT DISTINCT FROM` in §3.2 SQL — test mentally with `phase_id=NULL, domain_id=NULL` (gate-default template).
3. **F-03 closure:** Verify `_get_policy_value()` flow for `token_budget` policy shape — `parsed = {"L1":40,...}` → no `value` key → no `max` key → `return parsed` → dict returned.
4. **AD-S5 compliance:** Unchanged from v1.0.0 — all AD-S5-01/02/03/05 integrations intact.
5. **No regression:** Confirm that L1/L3 layer definitions, `assemble_prompt()` algorithm, `TEMPLATE_LOOKUP_SQL`, template rendering, §7 PAUSED boundary, and §8 edge cases remain unchanged.

---

**log_entry | TEAM_100 | STAGE6_REVALIDATION_REQUEST | v1.0.1 | CORRECTION_CYCLE_1 | 2026-03-26**

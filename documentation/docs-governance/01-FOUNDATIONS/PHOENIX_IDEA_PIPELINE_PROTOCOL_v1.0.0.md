# PHOENIX_IDEA_PIPELINE_PROTOCOL_v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** PHOENIX_IDEA_PIPELINE_PROTOCOL  
**version:** 1.0.0  
**owner:** Team 170 (Documentation); fate authority: Team 00 + Nimrod  
**date:** 2026-02-19  
**authority:** TEAM_00_TO_TEAM_170_IDEA_PIPELINE_VALIDATION_MANDATE_v1.0.0

---

## 2A — Overview

- **Purpose:** Capture all ideas, bugs, and requests before GATE_0 entry. Over-capture preferred; this is a filter, not a gate.
- **Who may submit:** ALL teams + Nimrod (no restrictions).
- **Canonical log:** `_COMMUNICATION/PHOENIX_IDEA_LOG.json`

---

## 2B — Fate Taxonomy (canonical)

| Fate | Meaning | Result |
|------|---------|--------|
| `new_wp` | Own work package warranted | S-P-WP assigned → PLANNED in registry |
| `append` | Add to existing WP scope | Reference WP + section |
| `immediate` | Executed < 1 session | Mandate/patch direct + reference |
| `cancel` | Not pursuing | Reason logged — prevents recurrence |

---

## 2C — Submission Process (any team)

```bash
./idea_submit.sh \
  --title "Short descriptive title" \
  --domain agents_os|tiktrack|shared \
  --urgency critical|high|medium|low \
  --team team_XX \
  --reference "_COMMUNICATION/path/to/context_file.md"  # optional but recommended
```

**Rule:** Submit within the same session where the idea arises. Never carry ideas mentally across sessions.

---

## 2D — Urgency Guide

| Level | When to use |
|-------|-------------|
| `critical` | Blocking active gate execution — respond today |
| `high` | Needs fate decision this sprint / current stage |
| `medium` | Can wait until within current stage |
| `low` | Backlog — S+ or whenever |

**Rule:** Teams submit their urgency assessment. Team 00 may override at review.

---

## 2E — Architectural Team Review Process

1. **Session startup:** `./idea_scan.sh --summary` — 4th mandatory read (CLAUDE.md)
2. If CRITICAL: address before all other work
3. If HIGH: flag for discussion this session
4. **End of session:** harvest new ideas → submit with `./idea_submit.sh`
5. **Fate decisions:** made by Team 00 + Nimrod jointly
6. **Fate recording:** Team 00 updates `PHOENIX_IDEA_LOG.json` via direct JSON edit (Phase 1) or mandate to Team 170

---

## 2F — Session End Harvest Checklist (Team 00)

Before closing every session, Team 00 MUST verify:

- [ ] All topics discussed that are not in an existing WP → submitted to IDEA_LOG
- [ ] All open IDEA items that received a fate decision → updated in log
- [ ] No item left floating (every idea has a state)

---

## 2G — Dashboard

Ideas visible at: `agents_os/ui/PIPELINE_ROADMAP.html` → Ideas Pipeline section

- Filter by domain / urgency / status
- Reference file opens in file viewer modal (existing functionality)
- Data source: `_COMMUNICATION/PHOENIX_IDEA_LOG.json` (direct JSON read, no backend)

---

## 2H — Phase 2 (Planned)

Phase 2 items are in IDEA_LOG as IDEA-007 (fate: new_wp → S002-P005 WP004 candidate).

**Scope:** `idea_groom.sh`, fate decision UI in dashboard, dedup detection, registry auto-integration.

**Trigger:** S002-P005-WP002 GATE_8 PASS.

---

**log_entry | TEAM_170 | PHOENIX_IDEA_PIPELINE_PROTOCOL | v1.0.0_AUTHORED | 2026-02-19**

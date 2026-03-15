# TEAM_00_TO_TEAM_170_IDEA_PIPELINE_VALIDATION_MANDATE_v1.0.0.md
date: 2026-03-15

**From:** Team 00 — Chief Architect
**To:** Team 170 — Documentation & Governance
**Date:** 2026-03-15
**Priority:** HIGH
**Type:** VALIDATION + DOCUMENTATION + REGISTRY UPDATE

---

## CONTEXT

Team 00 has directly implemented Phase 1 of the Phoenix Idea Pipeline system in this session.
Nimrod approved direct implementation (CLAUDE.md exception #3).

**What was implemented this session (directly by Team 00):**

| Artifact | Path | Status |
|---|---|---|
| Canonical idea log | `_COMMUNICATION/PHOENIX_IDEA_LOG.json` | ✅ CREATED — 14 seeded ideas |
| Submit script | `idea_submit.sh` (repo root) | ✅ CREATED — executable |
| Scan script | `idea_scan.sh` (repo root) | ✅ CREATED — executable |
| Session startup hook | `CLAUDE.md` — 4th mandatory read added | ✅ UPDATED |
| Dashboard integration | `agents_os/ui/PIPELINE_ROADMAP.html` — Ideas Pipeline section | ✅ UPDATED |

**Your mandate:** Validate + document the above. Issue NO implementation corrections unless a critical defect is found (route to Team 61 via standard process).

---

## DELIVERABLE 1 — VALIDATION (DOC-1)

Validate all 5 artifacts above. For each:
- Confirm file exists and is accessible
- Confirm schema is correct (JSON valid, scripts executable)
- Confirm CLAUDE.md update is correctly placed and syntactically sound
- Confirm PIPELINE_ROADMAP.html integrates without breaking existing functionality

**Acceptance criteria:**
- [ ] All 5 artifacts verified present and correct
- [ ] No critical defects found (or Team 61 mandate issued if found)
- [ ] `./idea_scan.sh --summary` executes without errors
- [ ] `./idea_scan.sh` produces formatted output for all 14 seeded ideas

**Output:** Short validation report in your team folder: `TEAM_170_IDEA_PIPELINE_VALIDATION_REPORT_v1.0.0.md`

---

## DELIVERABLE 2 — PROCESS DOCUMENTATION (DOC-2)

Author the canonical process document for the Idea Pipeline.
File: `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_IDEA_PIPELINE_PROTOCOL_v1.0.0.md`

**Must include:**

### 2A — Overview
- Purpose: capture all ideas/bugs/requests before GATE_0 entry
- Principle: over-capture preferred; this is a filter, not a gate
- Who may submit: ALL teams + Nimrod (no restrictions)

### 2B — Fate Taxonomy (canonical)
| Fate | Meaning | Result |
|---|---|---|
| `new_wp` | Own work package warranted | S-P-WP assigned → PLANNED in registry |
| `append` | Add to existing WP scope | Reference WP + section |
| `immediate` | Executed < 1 session | Mandate/patch direct + reference |
| `cancel` | Not pursuing | Reason logged — prevents recurrence |

### 2C — Submission Process (any team)
```bash
./idea_submit.sh \
  --title "Short descriptive title" \
  --domain agents_os|tiktrack|shared \
  --urgency critical|high|medium|low \
  --team team_XX \
  --reference "_COMMUNICATION/path/to/context_file.md"  # optional but recommended
```
**Rule:** Submit within the same session where the idea arises. Never carry ideas mentally across sessions.

### 2D — Urgency Guide
| Level | When to use |
|---|---|
| `critical` | Blocking active gate execution — respond today |
| `high` | Needs fate decision this sprint / current stage |
| `medium` | Can wait until within current stage |
| `low` | Backlog — S+ or whenever |

**Rule:** Teams submit their urgency assessment. Team 00 may override at review.

### 2E — Architectural Team Review Process
1. Session startup: `./idea_scan.sh --summary` — 4th mandatory read (CLAUDE.md)
2. If CRITICAL: address before all other work
3. If HIGH: flag for discussion this session
4. End of session: harvest new ideas → submit with `./idea_submit.sh`
5. Fate decisions: made by Team 00 + Nimrod jointly
6. Fate recording: Team 00 updates `PHOENIX_IDEA_LOG.json` via direct JSON edit (Phase 1) or mandate to Team 170

### 2F — Session End Harvest Checklist (Team 00)
Before closing every session, Team 00 MUST verify:
- [ ] All topics discussed that are not in an existing WP → submitted to IDEA_LOG
- [ ] All open IDEA items that received a fate decision → updated in log
- [ ] No item left floating (every idea has a state)

### 2G — Dashboard
Ideas visible at: `agents_os/ui/PIPELINE_ROADMAP.html` → Ideas Pipeline section
- Filter by domain / urgency / status
- Reference file opens in file viewer modal (existing functionality)
- Data source: `_COMMUNICATION/PHOENIX_IDEA_LOG.json` (direct JSON read, no backend)

### 2H — Phase 2 (Planned)
Phase 2 items are in IDEA_LOG as IDEA-007 (fate: new_wp → S002-P005 WP003 candidate).
Scope: `idea_groom.sh`, fate decision UI in dashboard, dedup detection, registry auto-integration.
Trigger: S002-P005-WP002 GATE_8 PASS.

---

## DELIVERABLE 3 — PROGRAM REGISTRY UPDATE (DOC-3)

Update `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`:

**Add to the S002-P005 Backlog and Governance section:**

```markdown
### S002-P005-WP003 candidate (revised)
- **PIPELINE_TEAMS.html Update** — `TEAM_00_TO_TEAM_30_AOS_TEAMS_PAGE_UPDATE_MANDATE_v1.0.0.md`

### S002-P005-WP004 candidate
- **Idea Pipeline Phase 2** — grooming automation, UI fate-decision interface, dedup detection,
  registry auto-integration. Trigger: WP002 GATE_8 PASS. LOD200 required before GATE_0.
  Design authority: `_COMMUNICATION/PHOENIX_IDEA_LOG.json` (IDEA-007).
```

---

## DELIVERABLE 4 — CONSTITUTION UPDATE (DOC-4)

Update `_COMMUNICATION/team_00/TEAM_00_CONSTITUTION_v1.0.0.md`:

Add to the relevant section (Session Startup or Standing Procedures):

```markdown
## Idea Pipeline — Standing Procedure (adopted 2026-03-15)
- 4th mandatory startup read: ./idea_scan.sh --summary
- Session end: harvest all floating ideas → idea_submit.sh
- Fate decisions: Team 00 + Nimrod jointly; Team 170 records in log if requested
- Iron Rule: NO idea may float across sessions without a log entry
- Canonical log: _COMMUNICATION/PHOENIX_IDEA_LOG.json
```

---

## SCOPE BOUNDARY

You are NOT asked to:
- Modify `PHOENIX_IDEA_LOG.json` (seeded ideas are canonical from Team 00)
- Modify the scripts `idea_submit.sh` / `idea_scan.sh` (Team 61 validates if corrections needed)
- Modify `PIPELINE_ROADMAP.html` (Team 61 scope)
- Issue mandates to other teams (Team 00 handles routing)

---

## SUBMISSION

When all 4 deliverables are complete, submit to:
`_COMMUNICATION/_ARCHITECT_INBOX/TEAM_170_IDEA_PIPELINE_PHASE1_COMPLETE_v1.0.0.md`

With checklist:
- [ ] DOC-1: Validation report written
- [ ] DOC-2: Process protocol authored
- [ ] DOC-3: Program registry updated
- [ ] DOC-4: Constitution updated

---

**log_entry | TEAM_00 | IDEA_PIPELINE_VALIDATION_MANDATE | TO_TEAM_170 | 2026-03-15**

# Team Workflow Method (Generic)

Purpose: define a clear, repeatable multi-team workflow that stays project-agnostic.
Scope: applies to all projects; project-specific references live in daily files.

---

## 1) Source of Truth and Artifacts

**Master task list (fixed file, Team 0 owned)**

- `documentation/02-ARCHITECTURE/FRONTEND/team_workflow_main_tasks_list.md`

**Daily files (date-stamped, English + underscores)**

- Team updates: `documentation/05-REPORTS/team_updates_YYYY_MM_DD.md`
- Team instructions: `documentation/05-REPORTS/team_instructions_YYYY_MM_DD.md`
- Professional report: `documentation/05-REPORTS/professional_report_YYYY_MM_DD.md`

**Archived plans**

- Historical references only (read-only).

**Rule:** teams must work only from the **master task list**.  
Archived plans are references only and must not be used for active work.

---

## 2) Roles and Responsibilities (Authoritative)

**Team 0 (Orchestrator / Final QA)**

- Owns sequencing, gates, and final sign-off.
- Maintains the master task list and daily instruction file.
- Confirms acceptance criteria and evidence before declaring green.

**Team A (Architecture / Integration Lead)**

- Unified testing architecture + runner wiring.
- Relevancy rules, results model, executed counts.
- Test data sanity for backend validation.

**Team B (UX/UI + Dynamic Gap Closure)**

- UI correctness, responsive layout, table accuracy.
- Logger-only error display verification.
- Dynamic support for gaps when workload is light.

**Team C (Backend Services / APIs)**

- API endpoints, backend services, business logic.
- Schema/model/validation alignment, seed/migrations (Team 0 approval).

**Team D (QA / Validation)**

- Runs test suites after fixes are merged/loaded.
- Logs pass/fail with endpoint + payload evidence.

**Team E (Documentation / As-Made Alignment)**

- Updates docs to reflect current code.
- Updates indexes and mappings.
- Writes troubleshooting for known failure modes.

**Team F (Init/Loading Monitoring)**

- Verifies init/loading stability and monitoring accuracy.
- Flags load-order and missing globals.

---

## 3) Role Coverage Matrix (System Areas)

- Frontend UI: Team B (primary), Team A + Team D (secondary)
- Frontend JS: Team A (primary), Team B + Team D (secondary)
- Backend API: Team C (primary), Team A + Team D (secondary)
- DB schema/migrations: Team C (primary), Team 0 (approval)
- Test execution: Team D (primary), Team A + Team 0 (secondary)
- Documentation: Team E (primary), Team 0 (secondary)
- Ops/scripts: Team 0 (primary), Team C + Team D (secondary)

---

## 4) Standard Workflow (Phases + Gates)

### Phase 0: Kickoff

- Align scope, acceptance criteria, dependencies, artifacts.
- Team 0 publishes the plan and per-team tasks.

### Phase 1: Parallel Execution

- Teams A/B/C/E execute in parallel.
- Team D runs only after fixes are merged/loaded.

### Phase 2: Integration + Fix Loop

- Team 0 consolidates results.
- Failures return to the owning team with reproduction data.

### Phase 3: Final QA + Sign-Off

- Team 0 confirms 100% pass.
- Documentation verified as-made and indexed.
- Run the Post-Green Checklist after each task reaches green.

**Stop Gates (no work proceeds without green)**

- Gate A: blocking errors cleared
- Gate B: data integrity stable
- Gate C: service/API stability
- Gate D: feature completion validated
- Gate E: legacy + docs clean
- Gate F: full suite pass

**Parallel rule:** do not run Team D QA in parallel with in-flight fixes.

---

## 5) Task Definition Standard (Junior-Friendly)

Each task must include:

- Goal (single clear outcome)
- Files (exact paths)
- Steps (numbered)
- Acceptance criteria (pass/fail)
- Verification (command/URL/UI action)
- Example output (expected shape)

---

## 6) Communication Rules (All Teams)

**Message format (mandatory)**

- Subject, Status, Done, Evidence, Blockers, Next
- All messages must be inside a **code block**
- One consolidated message per team per step

**Ordering + timing**

- Reports are processed by receipt order; last received is most current
- Each report includes:
  - exact timestamp (YYYY-MM-DD HH:MM), or
  - `log_entry | team_name | task_title | sequence_number | status_color`
- Report must state whether extra critical details exist in the professional report (yes/no)

**Team 0 message content**

- Link to master task list + daily files
- Clear testing directions (commands/URLs)
- Concrete examples (payloads/endpoints/errors)
- Full ordered task list
- Reminder to re-read the workflow method

**Preferred language**

- Hebrew for messages, English for commands/paths/filenames

---

## 7) Daily File Rules

- Team reports are daily files (English + underscores).
- Team instruction files are daily files (English + underscores).
- Professional report is daily (English + underscores).
- Master task list is fixed (not daily).

---

## 8) Team Constraints (Behavioral)

**Team A**

- Keep registry/orchestrator/results model in sync.
- UI wiring changes must include UI validation note.

**Team B**

- Do not remove test controls or status indicators.
- Validate desktop + mobile responsiveness.

**Team C**

- Use underscore route naming unless explicitly approved.
- Schema/migration changes require rollback note + Team 0 approval.

**Team D**

- Provide endpoint + payload + error text evidence.
- QA runs use authenticated session unless testing auth failures.

**Team E**

- Documentation must match current code (as-made).
- Update indexes and references after doc changes.

---

## 9) Post-Green Checklist (Mandatory)

After each task reaches green from all responsible teams:

1) GitHub backup of local code
2) Documentation review for the updated systems
3) Documentation gap analysis (missing/misplaced/duplicate) → Team E tasks

---

## 10) Additional Workflow Improvements (Approved)

**Pre-QA smoke checklist**

- Header/topbar visible
- No JS syntax errors
- Logger initialized
- Cache-busting versions match latest changes

**Evidence pack standard**

- Logger evidence
- Network evidence
- One results artifact (json/report)

**Environment snapshot**

- Branch/worktree reference
- Server instance reference
- Cache-busting version

**Release readiness checklist**

- Full QA pass
- GitHub backup completed
- Docs updated as-made
- Final sign-off recorded

---

## 11) Change Control and Dependencies

- No architecture or naming changes without Team 0 approval.
- Dependencies between teams must be explicit in the task list.
- Team D waits for confirmed fixes before QA.

---

## 12) Definition of Done (Cycle-Level)

- All gates green
- Full regression pass
- Documentation updated and indexed
- GitHub backup completed
***End Patch codeblock finishes with*** End Patch automatically.

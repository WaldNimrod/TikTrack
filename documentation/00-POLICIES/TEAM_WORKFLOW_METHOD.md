# Team Workflow Method (Generic)

**Purpose:** define the working method, roles, gates, and artifacts for multi-team execution across any project.

**Primary Context:** this method is project-agnostic and must remain generic.

**Source References (project-specific)**

- Current master plan document for the project
- Current status report for the project
- Professional report for the project (single source for step-by-step evidence)

---

## 1) Roles and Responsibilities (Authoritative)

**Team 0 (Orchestrator / Final QA)**

- Owns the end-to-end process: planning, sequencing, gates, and final sign-off.
- Maintains a single source of truth for status, gates, and dependencies.
- Reviews outputs from all teams, requests rework when acceptance criteria are not met.
- Ensures testing and documentation are completed before declaring "green".

**Team A (Architecture / Integration Lead)**

- Owns unified testing architecture and integration (Registry + Orchestrator + Results Model).
- Enforces relevancy rules per page and maintains accurate executed counts.
- Ensures test data meets backend validation constraints.
- Wires UI controls to runner logic and verifies error details are surfaced.

**Team B (UX/UI cleanup + Dynamic Gap Closure)**

- UI layout + results table correctness for CRUD dashboard.
- Ensures UI is responsive and does not hide critical controls or status.
- Verifies UI behavior against the results model.
- **Dynamic support**: fills gaps between teams (UI wiring, quick fixes) when workload is light.

**Team C (Backend Services / APIs)**

- Owns API endpoints, backend services, and business logic.
- Fixes 4xx/5xx/validation failures and aligns schema ↔ model ↔ tests.
- Owns data seeding and migrations (with Team 0 approval).
- Enforces underscore naming conventions across backend routes.

**Team D (QA / Validation)**

- Runs full test suites after Team A/C fixes.
- Logs pass/fail with endpoint + payload details.
- Confirms per-page counts and global summary match actual results.

**Team E (Documentation / As-Made Alignment)**

- Updates runbooks and system guides to match current code.
- Ensures changes are reflected in indexes and mappings.
- Adds troubleshooting steps for known failure modes.

---

## 1.2) Source-of-Truth Documents (Mandatory)

- **Current master work plan** (project-specific)
- **Status + blockers** (project-specific)
- **Historic work plan** (read-only reference, project-specific)

**Rule:** teams must work only from the **current master work plan**.  
If a team uses an outdated document, Team 0 must stop the work and redirect immediately.

---

## 1.1) Role Coverage Matrix (System Areas)

**Frontend UI (pages, layouts, CSS)**

- Primary: Team B
- Secondary: Team A (wiring/test controls), Team D (validation)

**Frontend JS (test runners, dashboard wiring)**

- Primary: Team A
- Secondary: Team B (UI effects), Team D (validation)

**Backend API routes / services**

- Primary: Team C
- Secondary: Team A (contract alignment), Team D (validation)

**Database schema / migrations / seed data**

- Primary: Team C
- Secondary: Team 0 (approval + gate enforcement)

**Test execution / reporting**

- Primary: Team D
- Secondary: Team A (orchestration), Team 0 (final QA)

**Documentation / runbooks / indexes**

- Primary: Team E
- Secondary: Team 0 (final sign-off)

**Ops scripts / env setup (if needed for tests)**

- Primary: Team 0
- Secondary: Team C (backend scripts), Team D (execution)

---

## 2) Standard Workflow (Phases + Gates)

### Phase 0: Kickoff and Scope

- Align scope, acceptance criteria, dependencies, and artifacts.
- Team 0 publishes the plan, gates, and per-team task lists.

### Phase 1: Parallel Execution

- Teams A/B/C/D/E execute their assigned work in parallel.
- Each team logs progress with clear acceptance checks.
- **Exception:** Team D (QA) runs only after fixes are merged/loaded; do not run QA in parallel with active fixes.

### Phase 2: Integration and Fix Loop

- Team 0 consolidates results and triggers rework as needed.
- Failures return to the owning team with specific reproduction data.

### Phase 3: Final QA and Sign-Off

- Team 0 runs the full suite and confirms 100% pass.
- Documentation is verified as-made and indexed.

---

## 3) Stop Gates (No Work Proceeds Without Green)

**Gate A — Blocking Errors Cleared**

- All blocking test or runtime errors removed.

**Gate B — Data Integrity Stable**

- Schema and migrations stable; teardown or rollback is safe.

**Gate C — Service/API Stability**

- Core service tests pass for the current scope.

**Gate D — Feature Completion Validated**

- User-facing features in scope are validated.

**Gate E — Legacy + Docs Clean**

- Legacy routes/files addressed; docs aligned to current code.

**Gate F — Full Suite**

- Full suite passes; final reports updated.

**Rule:** a gate is only green when Team 0 confirms evidence + acceptance criteria.
**Parallel rule:** allow parallel fixes only when tasks are independent; never run Team D in parallel with in-flight fixes.

---

## 4) Task Definition Standard (For Junior Teams)

Each task must include:

- **Goal:** a single clear outcome.
- **Files:** exact file paths.
- **Steps:** numbered, specific, minimal.
- **Acceptance Criteria:** measurable (pass/fail).
- **Verification:** command, URL, or UI action.
- **Example Output:** expected response shape or UI behavior.

**Example Task (Backend Route Fix)**

```
Goal: ensure GET /api/trade_plans/ returns 200 and list payload.
Files: Backend/routes/api.py, Backend/services/trade_plan_service.py
Steps:
1) Add route handler for /api/trade_plans/ with GET.
2) Call TradePlanService.get_all() and return JSON {status, data}.
Acceptance:
- curl returns 200.
- JSON contains {status: "success", data: [...]}
Verification:
- curl -s http://127.0.0.1:8080/api/trade_plans/ | jq '.status'
```

---

## 5) Team Constraints and Working Rules

**Global rules (all teams)**

- Do not change architecture standards or naming conventions without Team 0 approval.
- Keep scope minimal and aligned to the current cycle objectives.
- Record any deviation or blocker in the team log with evidence.

---

## 6) Reporting Timing and Logs (Long-Term Process Rule)

**Date rule**
- Team 0 provides the official date for reports (example: 31.12.25).
- Teams do not guess dates; they use the provided date.

**Time rule (when exact time is unavailable)**
Teams must include one of the following in every report:
1) **Duration** from receipt to completion (total elapsed time), or
2) **Completion log line** appended at the end of their report file:
   - format: `log_entry | team_name | task_title | sequence_number | status_color`

**Required additions for every report**
- State whether extra critical details were added to the professional daily report.
- Use logger evidence only (no console-only evidence).

**Team A**

- Keep registry/orchestrator/results model in sync.
- Any dashboard wiring change must include a UI validation note.
- Avoid backend or schema changes unless explicitly assigned by Team 0.

**Team B**

- Do not hide or remove test controls or status indicators.
- Validate responsive layout on desktop and mobile.
- Do not change test logic or backend contracts.
- If unassigned, take the highest-impact gap that blocks gates.

**Team C**

- Routes must follow underscore standard.
- New API routes must include documented list/get response shape.
- Schema or migration changes require a rollback note and Team 0 approval.

**Team D**

- Provide exact failure evidence (endpoint + payload + error text).
- Test runs must be repeatable with the same URL and environment.
- QA runs must be executed with an authenticated session (admin/admin123) unless explicitly testing auth failures.
- Do not change production code; report issues with evidence only.

**Team E**

- Documentation must match current code (as-made).
- Update indexes and references when adding or renaming docs.
- Do not change runtime behavior; documentation only.

---

## 6) Standardized Team Documentation (Work Logs)

Each team maintains a short log in the active work plan file:

- Format: checklist + brief evidence line per task.
- Include date and owner initials per update.

**Required per-task log line**

```
- [x] Task title (YYYY-MM-DD, initials) — Evidence: <url/command/output>
```

**Failure report format (Team D)**

```
Test: <test name>
Endpoint: <method + url>
Payload: <key fields only>
Error: <message>
Repro: <steps or command>
```

---

## 7) Required Feedback to Team 0

Each team must provide:

- Daily update: status, blockers, and next 1–2 actions.
- Completion proof: evidence line per task.
- Open risks: anything that may impact gates or other teams.
- Full step-by-step report appended to the **project professional report** **after every step** (not only at completion).
- Short summary only in the Team 0 message format below.

**Short summary to Team 0 (required format)**

```
Subject: <Cycle> | <Gate> | <Team>
Status: <GREEN/YELLOW/RED>
Done: <1-2 bullets>
Evidence: <1-2 bullets with endpoint/command/file>
Blockers: <none | short list>
Next: <1 short line>
```

**Preferred language:** Hebrew (concise). English allowed for commands/paths.

**Team messages (required content)**
Each message to a team must include:

- Link(s) to source-of-truth docs (master plan + current status)
- Clear testing directions (commands/URLs)
- Concrete examples (payloads/endpoints/errors)
- Full, ordered task list
**Do not add** the professional report to the project index.
**Format rule:** all Team 0 → team messages must be wrapped in a code block.
**Team response rule:** all team responses must be wrapped in a code block.

**Team refresh requirement**

- Each new action message must include a reminder to re-read the workflow method.
- Teams must confirm they refreshed the method before starting the step.

**Reporting order + timestamp (required)**

- Reports are processed **by receipt order**; the **last received report is the most current**.
- Every team report must include an **exact timestamp** (date + time).
- Every team report must explicitly state whether **additional critical details exist** in the professional report (yes/no).

**Daily report files (required)**

- Professional report must be **daily** (new file per day) with the date in the filename.
- Team-facing detailed info must also be **daily** (new file per day) with the date in the filename.
- The **daily team file** includes the **current task list** for execution.
- The **master work plan** remains a **single, fixed** file (not daily).
- The **master task list file** is:
  - documentation/02-ARCHITECTURE/FRONTEND/team_workflow_main_tasks_list.md

**Sequencing rule (critical)**

- Team 0 must send instructions **only when the step is ready**, and **only to the teams that should act now**.
- Teams execute immediately and **do not know** what other teams are doing.
- Never send parallel instructions that can conflict; respect gate dependencies and stop‑points.

**Source‑of‑Truth rule (critical)**

- Every process must define **one** source of truth (SOT) for dependencies, load order, or specs.
- SOT must be declared in the work plan and referenced in all team messages.
- No parallel SOTs. If a new SOT is chosen, explicitly supersede the previous one.

---

## 8) Team 0 ↔ Owner Workflow

**Team 0 responsibilities to owner (Product Owner/Founder)**

- Maintain the master task list in the master task list file, and copy the **current daily task list** into the daily team file.
- After each step, provide a concise message ready to forward to teams.
- Provide a structured update to the owner (product/vision) after each step.
- Provide a product-level report after every step that includes: status, risks, decisions made, and next actions.
- Keep gate status updated and visible.
- Decide which teams receive instructions at each step and assign ownership explicitly.
- Ensure QA (Team D) only runs after fixes are confirmed loaded; never in parallel with in-flight fixes.
- Provide positive feedback when teams succeed and supportive guidance when they struggle.

**Owner responsibilities**

- Confirm priorities and any scope changes.
- Approve gate progression when evidence is sufficient.
- Forward Team 0 messages to teams (Team 0 does not contact teams directly).

## 8.2) Team Managers (Additional Managers)

**Purpose:** enable multiple team managers to operate consistently under the same method.

**Manager responsibilities**

- Execute only the tasks assigned in the latest Team 0 message.
- Use the provided reporting format and link required evidence.
- Do not run tasks in parallel if a dependency is still open.
- Escalate ambiguities to Team 0 before proceeding.
- Provide step-by-step evidence to the project professional report after every step.

**Manager communication rules**

- Team 0 messages are forwarded by the Owner.
- If a manager receives no new action, they wait.
- Updates are included only in the next action message (no mid-step updates).

---

## 8.1) Message to Teams (Required Format)

Use this template for every step or handoff:

```
Subject: <Cycle> | <Gate> | <Team>
Context: <1 line summary of what changed>
Tasks:
1) <task goal + file>
2) <task goal + file>
Acceptance:
- <measurable pass/fail criteria>
Verification:
- <command or URL>
Notes:
- <dependencies or blockers>
```

---

## 9) Testing and Fix Loop

**Required Run Artifacts**

- Run timestamp and environment.
- Total tests executed and pass/fail/warn/skip counts.
- Per-page counts and summary message.
- Failures with endpoint + payload + error text.

**Flow**

1) Team D runs the suite and logs results.
2) Team 0 assigns fixes to owning team(s).
3) Owning team fixes and reports evidence.
4) Team D re-runs; Team 0 re-evaluates gate.

---

## 10) Documentation Expectations (As-Made)

**Principles**

- Docs must match current code, not legacy intent.
- Underscore standard is canonical for HTML and routes.
- Remove or explicitly archive legacy items.

**Required Updates**

- Runbooks (how to run the suite).
- System guides (routing, naming, core patterns).
- Index and page mapping alignment.

---

## 11) Status Reporting (Team 0 Format)

**Daily Update Template**

```
Cycle: <Project Cycle Name>
Gate Status: A=?, B=?, C=?, D=?, E=?, F=?
Team A: <progress + blockers>
Team B: <progress + blockers>
Team C: <progress + blockers>
Team D: <latest test run summary>
Team E: <docs updated + links>
Risks: <short list>
Next Actions: <1-3 bullets>
```

---

## 12) Change Control and Dependencies

- No downstream work starts before gate dependencies are green.
- Any exception requires explicit Team 0 approval.
- If a team needs context, Team 0 provides the minimal required files.

---

## 13) Definition of Done (Cycle-Level)

- Full test suite for the current scope passes 100%.
- All gates A–F are green with evidence.
- As-made docs updated and indexed.
- Final summary report stored in the project reports area.

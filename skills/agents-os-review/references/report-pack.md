# Agents OS Review Pack

Use this structure for every review run.

## Output Root

```text
_COMMUNICATION/team_<reviewer_team>/agents_os_review/<YYYY-MM-DD>_<slug>/
```

## Required Folders

- `evidence/`
- `logs/`
- `notes/`
- `screenshots/`

Use subfolders freely when the run is large, but keep the top-level structure stable.

## Required Documents

### `00_REVIEW_INDEX.md`

Use as the pack manifest.

Include:

- Review date
- Reviewer team
- Review slug and scope
- Primary domain under review and any supporting domains used as evidence
- Canon documents consulted
- Code surfaces inspected
- Tests and browser checks attempted
- List of report files in the pack

### `01_EXECUTIVE_SUMMARY.md`

Use for:

- Short system verdict
- Top risks
- Top strengths
- Review constraints
- One short note on domain discipline: what was reviewed as Agents OS primary evidence, and what was used only as supporting proving-ground evidence
- One-paragraph statement on whether Agents OS currently behaves like a viable one-human software house operating system

### `02_PIPELINE_AND_GATES_REVIEW.md`

Cover:

- Gate sequence and owner correctness
- Fail routes and rollback behavior
- State-file handling
- Prompt generation and storage
- WSM alignment and runtime truth

### `03_SERVER_GOVERNANCE_AND_DOCS_REVIEW.md`

Cover:

- Validators, scripts, evidence handling
- Canonical path discipline
- Governance artifacts and future-plan documents
- Documentation integrity and stale guidance

### `04_UI_SURFACES_REVIEW.md`

Cover:

- Dashboard
- Roadmap
- Teams page
- Registry docs vs actual behavior
- Browser-level findings and operator usability

### `05_DOC_CODE_GAP_ANALYSIS.md`

Use a table with at least these columns:

- Claim source
- Claimed behavior
- Code/runtime source
- Actual behavior
- Gap type
- Severity
- Recommended action

Include both canon-to-code gaps and UI-to-command gaps.

### `06_ARCHITECTURAL_AND_CONCEPTUAL_CONCLUSIONS.md`

Answer:

- What architectural shape the system actually has today
- Where the concept is coherent or incoherent
- Which coupling points create operational risk
- Whether the system is converging toward or away from the one-human operating model

### `07_CRITICAL_IMMEDIATE_ACTIONS.md`

List only actions that are urgent enough to start now.

For each action include:

- Priority
- Owner team
- Problem statement
- Why immediate
- Minimal completion condition

## Writing Rules

- Put findings before explanation.
- Order items by severity, then by blast radius.
- Use concrete file references and commands.
- Distinguish observed fact from inference.
- Mark missing validation explicitly instead of implying it happened.
- Treat scaffolds, placeholders, and future-plan text as potential defects when operators can mistake them for live capability.
- When TikTrack evidence is used, label it explicitly as supporting evidence and state which Agents OS claim it validates.

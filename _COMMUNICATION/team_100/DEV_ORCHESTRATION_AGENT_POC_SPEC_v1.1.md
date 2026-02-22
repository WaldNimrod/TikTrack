# DEV_ORCHESTRATION_AGENT_POC_SPEC.md
**project_domain:** TIKTRACK

Version: 1.1  
Date: 2026-02-18  
Owner: Team 100  
Status: READY_FOR_ARCHITECT_REVIEW

---

## 1) Objective
Implement a **Dev‑Orchestration Observer CLI** that reconstructs the **current Stage state** from repository artifacts, **without writing or modifying anything**.

This POC validates that orchestration‑state reconstruction is feasible using the *existing governance + artifact reality*.

---

## 2) Scope (POC)
**Mode:** Observer (Level 1)  
**Prepared for:** Advisor architecture (Level 2) after validation

**Out of scope (hard):**
- Writing artifacts / generating repo files
- Updating documentation or indexes
- Modifying repo structure
- Enforcing governance (no auto‑blocking)
- Making architectural decisions (can only report inconsistencies)

---

## 3) Stage Identification (Single Anchor)
**Canonical Stage anchor file (binding):**  
`_COMMUNICATION/team_10/ACTIVE_STAGE.md`

MUST treat this file as the **single source of Stage identity** (stage id/name, dates, current module, etc).

---

## 4) Authority Model (Critical — no drift)
### 4.1 Active SSOT authority (binding)
The **active SSOT authority** is the repository **Master Index**:

- `00_MASTER_INDEX.md`  ✅ *Active “source of truth” for structure, canonical paths, and what is in force now.*

### 4.2 Architectural principles (non‑SSOT, but binding as constraints once promoted)
Architect Decisions are **foundational principles/directives**:
- `_COMMUNICATION/_Architects_Decisions/`

Important: Architect Decisions are **NOT automatically “applied SSOT”**.  
They must go through the local governance process (Team 10 routing + Team 90 validation + Team 70 knowledge promotion) before they are reflected in SSOT docs / structure.

### 4.3 Operational evidence (read‑only)
Operational artifacts and evidence may be read from:
- `documentation/reports/`
- `_COMMUNICATION/team_*/` (team folders)

---

## 5) Artifact Discovery Scope
### 5.1 Include
- `_COMMUNICATION/team_10/` … `_COMMUNICATION/team_70/`
- `_COMMUNICATION/_ARCHITECT_INBOX/` (for “submitted/not yet decided” visibility only)
- `_COMMUNICATION/_Architects_Decisions/`
- `documentation/reports/`

### 5.2 Exclude (hard)
- `archive/` (including legacy snapshots)
- `legacy/`
- `_COMMUNICATION/90_Architects_comunication/` *(historical noise / non‑authority channel)*

---

## 6) Required Capabilities
### 6.1 Repo scanner
- Traverse only **included scopes**.
- Apply **exclusion filters** before any parsing.

### 6.2 Artifact classifier
Given a file path + minimal header/text heuristics, infer:
- artifact class (work plan / completion report / QA report / gate report / seal / architect decision / inbox submission / misc)
- owning team (10/20/30/40/50/60/70/90 if present)
- stage association (by explicit ids, ACTIVE_STAGE, or declared links)

### 6.3 Gate state reconstruction
Reconstruct gate status for the current stage:
- **Gate‑A:** QA (Team 50) evidence
- **Gate‑B:** External validation (Team 90) evidence
- **Gate‑KP / Seal:** Closure evidence (seal artifact)

### 6.4 Stage snapshot output (CLI)
Output a single “Stage Snapshot” (read‑only):
- Stage id + title (from ACTIVE_STAGE)
- Detected artifacts by class + path list
- Gate status summary (PASS/BLOCK/UNKNOWN with evidence pointers)
- “Drift flags” (see §7)

---

## 7) Drift & Contradiction Detection (Report only)
The agent MUST report (not fix) contradictions, such as:
- References to a **different Master Index** path than `00_MASTER_INDEX.md`
- Docs that claim Team 10 is the sole documentation writer (contradicts current governance where Team 70 is librarian)
- Missing canonical policy files referenced as mandatory (e.g., closure gate / seal policy path mismatch)
- Mixed path semantics (old numbered structures vs Model B structure)

Output as a **Drift Report** section in the snapshot.

---

## 8) Non‑Guessing Rule (Phoenix iron law)
If information is missing/ambiguous:
- MUST mark as **UNKNOWN**
- MUST list **what evidence would be required** (file + expected section)
- MUST NOT infer or invent.

---

## 9) Acceptance Criteria (POC)
POC is successful if:
1. Correctly resolves Stage identity from `ACTIVE_STAGE.md`
2. Produces a repeatable Stage Snapshot on the same repo state
3. Correctly detects Gate artifacts for at least one completed Stage (sample: MB3A Alerts)
4. Produces a Drift Report that matches Team‑90 reality map categories (authority drift / role drift / SOP reference drift)

---
id: TEAM_100_AOS_V3_PRE_BUILD_ARCHITECTURAL_REVIEW_v1.0.0
historical_record: true
from: Team 100 (Chief System Architect)
to: Team 00 (Principal — Nimrod)
cc: Team 11 (AOS Gateway), Team 111 (AOS Domain Architect)
date: 2026-03-27
type: PRE_BUILD_ARCHITECTURAL_REVIEW
domain: agents_os
mandate_source: Team 00 verbal mandate — "בקרה אחרונה לפני ביצוע"
status: SUBMITTED
documents_reviewed:
  - TEAM_00_TO_TEAM_11_AOS_V3_BUILD_WORK_PACKAGE_v1.0.0.md
  - TEAM_00_AOS_V3_BUILD_PROCESS_MAP_v1.0.0.md
  - TEAM_00_AOS_V3_BUILD_PREREQUISITES_ANALYSIS_v1.0.0.md
  - TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md
  - TEAM_100_AOS_V3_STATE_MACHINE_SPEC_v1.0.2.md
  - TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.3.md
  - TEAM_111_AOS_V3_DDL_SPEC_v1.0.1.md
  - TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.1.md
  - TEAM_100_AOS_V3_PROMPT_ARCH_SPEC_v1.0.2.md
  - TEAM_100_AOS_V3_EVENT_OBSERVABILITY_SPEC_v1.0.2.md
  - TEAM_100_AOS_V3_MODULE_MAP_INTEGRATION_SPEC_v1.0.1.md
  - TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.0.2.md (Stage 8A)
  - TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.1.0.md (Stage 8B)---

# AOS v3 — Pre-BUILD Architectural Review

## Executive Summary

Team 100 has completed a deep cross-reference review of the entire AOS v3 specification corpus (13 documents) against the Build Work Package and Build Process Map. This review identifies **4 CRITICAL**, **8 MAJOR**, and **5 MEDIUM** findings that must be resolved before or during BUILD entry.

**Bottom line:** The specification corpus itself (Stages 1–8B) is internally consistent and well-structured. The problems are concentrated in the **Build Work Package** and **Build Process Map**, which contain contradictions against the canonical specs they claim to implement. These are resolvable with a focused amendment pass — no spec rewrites are needed.

---

## §1 — Findings Summary

| # | Severity | Category | Finding | Resolution |
|---|----------|----------|---------|------------|
| F-01 | **CRITICAL** | API design | Feedback endpoint paths in WP contradict spec's single-endpoint design | Amend WP to match Stage 8B §10.1 |
| F-02 | **CRITICAL** | Directory structure | WP directory tree diverges from Module Map §1 in 6+ locations | Amend WP D.1 to mirror Module Map exactly |
| F-03 | **CRITICAL** | Infrastructure | API port conflict: WP says 8082, Process Map says 8090 | Decide and lock one port |
| F-04 | **CRITICAL** | API design | WP adds `/api/v1/` prefix; all specs use `/api/` | Remove `/v1/` from WP or amend all specs |
| F-05 | **MAJOR** | Document staleness | Process Map is stale — missing all Stage 8A/8B scope | Amend Process Map or issue supersession notice |
| F-06 | **MAJOR** | Gate definition | WP and Process Map define different content per gate number | Align gate AC between both documents |
| F-07 | **MAJOR** | Module naming | WP renames prompting module files vs spec | Amend WP to match Module Map §3.8–§3.10 |
| F-08 | **MAJOR** | Directory structure | WP D.1 omits `policy/`, `governance/`, `cli/` from tree | Add to WP D.1 |
| F-09 | **MAJOR** | Team assignment | `cli/pipeline_run.sh` not assigned to any team in WP D.2 | Assign to Team 21 or Team 61 |
| F-10 | **MAJOR** | Scope definition | WP says config.html "no functional change from mockup" — contradicts Module Map §6.3 | Amend WP Team 31 task 3 |
| F-11 | **MAJOR** | Module location | `ingestion.py` + `sse.py` placed under `api/services/audit/` in WP vs `modules/audit/` in spec | Amend WP to match Stage 8B §12.3 |
| F-12 | **MAJOR** | Undefined API | WP lists `GET /api/runs/{run_id}/feedback` (list) — not defined in any spec | Either define contract or remove from WP |
| F-13 | **MEDIUM** | DDL dependency | DDL v1.0.2 is Gate 0 prerequisite but not yet delivered | Sequence: Team 111 delivers before Gate 0 |
| F-14 | **MEDIUM** | Error codes | Off-by-one in error code count between WP and Stage 8B | Verify canonical count |
| F-15 | **MEDIUM** | UC numbering | WP references UC-01..UC-15; UC Catalog only has UC-01..UC-14 | Document UC-15 cross-reference to Stage 8B §12.4 |
| F-16 | **MEDIUM** | Process Map scope | Process Map §7.2 lists only 3 UI pages; should be 5 | Amend if Process Map is being updated |
| F-17 | **MEDIUM** | Field rename | `notes` → `summary` rename in Stage 8B §10.6 not consistently referenced | Ensure all team mandates use `summary` |

---

## §2 — CRITICAL Findings (BUILD Blockers)

### F-01 — Feedback Endpoint Path Contradiction

**Source conflict:**
- **Work Package D.3 (Gate 3 AC) + D.5** invents **4 separate endpoints**:
  - `POST /api/runs/{run_id}/feedback/notify` (Mode B trigger)
  - `POST /api/runs/{run_id}/feedback/file` (Mode C)
  - `POST /api/runs/{run_id}/feedback/paste` (Mode D)
  - `GET /api/runs/{run_id}/feedback` (list FeedbackRecords)

- **Stage 8B §10.1 (SSOT)** defines **1 endpoint** with a discriminator field:
  - `POST /api/runs/{run_id}/feedback` with `detection_mode` in body (`OPERATOR_NOTIFY | NATIVE_FILE | RAW_PASTE`)
  - Plus `POST /api/runs/{run_id}/feedback/clear` (§10.2) for clearing

**The SSOT is Stage 8B §10.1.** The Work Package invented endpoint paths that do not exist in any specification. Additionally, the WP lists `GET /api/runs/{run_id}/feedback` for listing FeedbackRecords, but no GET endpoint is defined in any spec — only POST (ingest) and POST /clear.

**Resolution:** Amend WP D.3 Gate 3 AC and D.5 to match Stage 8B §10.1–§10.2 exactly. If a GET listing endpoint is desired, it must first be formally specified (add a §10.x amendment to Stage 8B or issue a separate erratum).

---

### F-02 — Directory Structure Divergence (WP vs Module Map)

**The Work Package D.1 presents a directory tree that differs from Module Map v1.0.1 §1 in at least 6 locations:**

| Location | Work Package D.1 | Module Map §1 (SSOT) | Impact |
|----------|-------------------|----------------------|--------|
| Events module | `modules/events/` with `writer.py`, `reader.py` | `modules/audit/` with `ledger.py` | Wrong module name and file names |
| Use cases | `modules/use_cases/use_cases.py` | `modules/management/use_cases.py` | Wrong parent directory |
| API layer | `api/main.py` + `api/routes/*.py` | `modules/management/api.py` (single file) | Completely different structure |
| FIP + SSE | `api/services/audit/ingestion.py` + `sse.py` | `modules/audit/ingestion.py` + `sse.py` | Wrong location (api/ vs modules/) |
| Prompting files | `assembler.py`, `layer_resolver.py`, `models.py` | `builder.py`, `cache.py`, `templates.py` | Wrong file names |
| Missing modules | Omits `policy/`, `governance/`, `cli/` | Present in Module Map §1 | Missing entire modules |

**The SSOT is Module Map v1.0.1 §1.** The Work Package's directory tree appears to be based on an independent interpretation rather than copying from the spec.

**Resolution:** Replace WP D.1 directory tree with a verbatim copy of Module Map §1, extended with Stage 8B §12.3 additions (`modules/audit/ingestion.py`, `modules/audit/sse.py`). Adjust all downstream references in D.2 team assignments accordingly.

---

### F-03 — API Port Conflict

**Source conflict:**
- **Work Package D.2 (Team 61 task 5):** "environment: PostgreSQL connection, port 8082, `/api/v1/` prefix"
- **Process Map §12:** "AOS v3 API: http://localhost:8090"

Port 8082 is currently used by the TikTrack backend (per AGENTS.md). Port 8090 aligns with the existing `agents_os_v2` dashboard convention.

**Resolution:** Lock port **8090** for AOS v3 (consistent with Process Map and v2 precedent). Amend WP D.2 Team 61 task 5.

---

### F-04 — API URL Prefix Inconsistency

**Source conflict:**
- **Work Package D.2 (Team 61 task 5):** `/api/v1/` prefix
- **All specs (Module Map §3.13, §4; Stage 8A §4.12–§4.18; Stage 8B §10):** `/api/` prefix (no `/v1/`)
- **Use Case Catalog §UC-13/14:** GET /api/state, GET /api/history
- **Event Observability §4:** `/api/state`, `/api/history`

Every single endpoint in every spec uses `/api/` — not `/api/v1/`. The Work Package is the only document that adds a `/v1/` segment.

**Resolution:** Remove `/v1/` from WP. All endpoints use `/api/` prefix as per spec canon.

---

## §3 — MAJOR Findings (Must Resolve Before Gate Execution)

### F-05 — Process Map Is Stale Relative to Stage 8A/8B

The Process Map header declares `spec_basis: TEAM_100_AOS_V3_MODULE_MAP_INTEGRATION_SPEC_v1.0.1.md` — it does not reference Stage 8A or Stage 8B.

**Evidence of staleness:**

| Area | Process Map | Current Spec State |
|------|-------------|-------------------|
| UI pages | 3 pages (index, history, config) in §7.2 | 5 pages — Stage 8A adds `teams.html`, `portfolio.html` |
| Integration TCs | 14 TCs (TC-01..TC-14) in §11 | 26 TCs — Stage 8B adds TC-15..TC-26 |
| Feedback Ingestion | Not mentioned | Full FIP spec in Stage 8B (4 modes, 3 layers) |
| SSE streaming | Not mentioned | Full SSE spec in Stage 8B §6 |
| `ideas` / `work_packages` tables | Not mentioned | Defined in Stage 8A §4.15–§4.18 |
| UC-15 | Not mentioned | Defined in Stage 8B §12.4 |
| Teams engine edit | Not mentioned | Defined in Stage 8B §7 |

The Work Package correctly covers Stage 8A/8B scope, but the Process Map does not. Teams following the Process Map for gate ACs and test matrices will miss Stage 8B requirements.

**Resolution:** Either:
(a) Amend the Process Map to incorporate Stage 8A/8B scope, OR
(b) Issue a formal Process Map Addendum, OR
(c) Declare the Work Package as the superseding authority for gate ACs and team assignments, and reduce the Process Map to a build-order reference only.

---

### F-06 — Gate Content Differs Between WP and Process Map

The Work Package D.3 and Process Map §2–§8 define different scopes per gate number:

| Gate | Work Package D.3 | Process Map |
|------|-------------------|-------------|
| **Gate 0** | Infrastructure ready (FILE_INDEX, DB, seed, server) | Entry acknowledgement + team activation (no infra) |
| **Gate 1** | State Machine + Core Backend (definitions/ + state/) | Infrastructure + Foundation (DDL, definitions/ + audit/ + policy/) |
| **Gate 2** | Routing + Prompting + Events + UC-01..UC-15 | Core logic (state/ + routing/ + prompting/) |
| **Gate 3** | FIP + SSE + State API extensions (Stage 8B) | Full implementation + integration tests (management/ + UI) |
| **Gate 4** | Frontend production (5 pages) | E2E + UX sign-off |
| **Gate 5** | Full E2E + cleanup | WP closure + docs + archive |

The scoping and dependencies per gate are fundamentally different. A team reading one document will build in a different order than a team reading the other.

**Resolution:** Decide which gate definition is authoritative. Recommendation: adopt the Work Package's gate breakdown (more granular, includes Stage 8B), and amend the Process Map to match or deprecate its gate definitions.

---

### F-07 — WP Renames Prompting Module Files

| WP D.1 / D.2 | Module Map §3.8–§3.10 (SSOT) |
|---------------|-------------------------------|
| `assembler.py` | `builder.py` |
| `layer_resolver.py` | `cache.py` |
| `models.py` | `templates.py` |

The WP invents new file names for the prompting module. Team 21 following the WP will create files that don't match the spec's interface contracts.

**Resolution:** Amend WP D.1 and D.2 to use the Module Map canonical names: `builder.py`, `cache.py`, `templates.py`.

---

### F-08 — WP D.1 Omits Three Modules from Directory Tree

The WP directory tree is missing:
- `modules/policy/` (Stage 6, defined in Module Map §3.11)
- `modules/governance/` (Module Map §3.14–§3.15)
- `cli/pipeline_run.sh` (Module Map §1)

These are not optional — `policy/settings.py` is a Layer 1 module required by `prompting/builder.py`. `governance/` is needed for GATE_5 archive operations. `cli/pipeline_run.sh` is explicitly tested in Process Map §8 (GATE_4).

**Resolution:** Add all three to WP D.1 directory tree.

---

### F-09 — `cli/pipeline_run.sh` Not Assigned to Any Team

The Module Map §1 and Process Map §7 Phase 3A both list `cli/pipeline_run.sh` as a deliverable. The Process Map §8 (GATE_4) tests it in Nimrod's UX review. But the Work Package D.2 team assignments do not mention it — no team is tasked with building it.

**Resolution:** Assign `cli/pipeline_run.sh` to Team 21 (as part of management layer, per Process Map §7.1) or Team 61 (as DevOps tooling). Add it to the relevant Gate AC.

---

### F-10 — Config Page Scope Underspecified in WP

**WP D.2 (Team 31 task 3):** `config.html (Config) — minimal; no functional change from mockup`

**Module Map §6.3 + Process Map §7.2:** Config page requires:
- Routing rules table (wired to `GET/POST/PUT /api/routing-rules` — 3 admin endpoints)
- Templates list + edit (wired to `GET/PUT /api/templates/{id}` — 2 admin endpoints)
- Policy viewer (wired to `GET /api/policies` — 1 admin endpoint)
- Read-only for non-team_00 users

This is not "no functional change from mockup" — it requires wiring to 6 live API endpoints with authorization logic.

**Resolution:** Amend WP D.2 Team 31 task 3 to include config page API wiring scope. Add relevant AC to the appropriate Gate.

---

### F-11 — Module Location Mismatch for ingestion.py and sse.py

**WP D.1:** Places `ingestion.py` and `sse.py` under `api/services/audit/`
**Stage 8B §12.3 (SSOT):** Places them under `modules/audit/`

```
# Stage 8B §12.3:
modules/
└── audit/
    ├── ledger.py        # Stage 7 (existing)
    ├── ingestion.py     # Stage 8B (NEW)
    └── sse.py           # Stage 8B (NEW)
```

This matters because the Module Map's dependency graph has `modules/audit/` depending only on `definitions/`. Placing these files under `api/services/` would break the acyclic dependency model.

**Resolution:** Amend WP D.1 to match Stage 8B §12.3 — files go under `modules/audit/`.

---

### F-12 — Undefined `GET /api/runs/{run_id}/feedback` Endpoint

The WP D.3 Gate 3 AC and D.5 include:
- `GET /api/runs/{run_id}/feedback` → "list FeedbackRecords"

No such GET endpoint exists in Stage 8B. The spec only defines:
- `POST /api/runs/{run_id}/feedback` (§10.1 — ingest)
- `POST /api/runs/{run_id}/feedback/clear` (§10.2 — clear pending)

The pending feedback is surfaced via `GET /api/state` response (§10.7: `pending_feedback` field). There is no separate listing endpoint.

**Resolution:** Either:
(a) Remove `GET /api/runs/{run_id}/feedback` from WP, or
(b) If listing is needed, define the contract formally as a Stage 8B erratum before BUILD.

---

## §4 — MEDIUM Findings (Clarification / Tracking)

### F-13 — DDL v1.0.2 Not Yet Delivered

WP D.3 Gate 0 AC requires: "DB migrations run without errors (DDL v1.0.2)"

DDL v1.0.2 does not yet exist. DDL v1.0.1 is the current SSOT. The `pending_feedbacks`, `ideas` (amended), and `work_packages` tables are all DDL v1.0.2 scope (WP D.4).

Team 111 must deliver DDL v1.0.2 before Gate 0 can complete. The Prerequisites Analysis acknowledges this, but the sequencing should be made explicit: DDL v1.0.2 delivery is a hard Gate 0 entry blocker.

**Resolution:** Team 11 to issue DDL v1.0.2 mandate to Team 111 as first activation action. Gate 0 cannot PASS without DDL v1.0.2.

---

### F-14 — Error Code Count Discrepancy

| Source | Count | Detail |
|--------|-------|--------|
| Stage 7 §6 (Event Observability) | 39 | EC-01..EC-39 |
| WP D.6 | 42 pre-8B (EC-40..EC-42 = Stage 8A) | 39 + 3 = 42 |
| Stage 8B §11 | 41 pre-8B ("41 Stage 8A corrected") | 41 ≠ 42 |
| WP D.6 | 49 total (EC-43..EC-49 = 7 new) | 42 + 7 = 49 |
| Stage 8B §11 | 49 total (8 new) | 41 + 8 = 49 |

The WP counts 3 new codes from Stage 8A (total 42), but Stage 8B claims only 2 net new from Stage 8A (total 41 pre-8B). The final total is 49 in both, but the intermediate counts diverge.

**Resolution:** Perform a canonical error code audit — enumerate all 49 codes with their source stage. Publish as an appendix to the WP or as a DDL seed data reference.

---

### F-15 — UC-15 Cross-Reference Gap

WP D.2 (Team 21 task 6): "UC-01..UC-15 implemented (use_cases.py)"

The Use Case Catalog v1.0.3 defines UC-01..UC-14 only. UC-15 (`ingest_feedback`) is defined in Stage 8B §12.4 as an additive use case.

This is technically correct (Stage 8B is additive), but teams referencing the Use Case Catalog for UC-15 will not find it there.

**Resolution:** Either:
(a) Add a forward-reference note in WP: "UC-15 defined in Stage 8B §12.4 (not in UC Catalog v1.0.3)", or
(b) Include a UC-15 summary in the team activation prompt for Team 21.

---

### F-16 — Process Map Lists Only 3 UI Pages

Process Map §7.2 and §8 Phase 4B reference only 3 pages: `index.html`, `history.html`, `config.html`.

The canonical page list (Stage 8A §6.4–§6.5 + WP D.2) has 5 pages: `index.html`, `history.html`, `config.html`, `teams.html`, `portfolio.html`.

Consequence: Process Map GATE_3 AC (§7 Phase 3B) misses teams and portfolio pages. Process Map GATE_4 UX review (§8 Phase 4B) only reviews 3 of 5 pages.

**Resolution:** Covered by F-05 (Process Map staleness). If the Process Map is being amended per F-05 resolution, add all 5 pages.

---

### F-17 — `notes` → `summary` Field Rename Inconsistency

Stage 8B §10.6 renames the `notes` parameter to `summary` in `POST /api/runs/{run_id}/advance`.

The WP D.3 Gate 1 AC correctly references `summary`: "POST /api/runs/{run_id}/advance → 200 (includes `summary` field)".

However, the UC Catalog v1.0.3 (UC-02) still uses `notes` as the parameter name (it predates Stage 8B). Teams referencing the UC Catalog will use the old name.

**Resolution:** Team activation prompts for Teams 21 and 31 must explicitly note this rename: "UC-02 `notes` parameter → renamed to `summary` per Stage 8B §10.6".

---

## §5 — Positive Assessment (Spec Corpus Integrity)

The following cross-references were verified as consistent:

| Cross-Reference | Status |
|-----------------|--------|
| State Machine 5 states (SM §1) ↔ DDL `runs.status` CHECK ↔ Entity Dictionary ↔ Module Map constants.py | ✅ Consistent |
| 15 Event Types (Event Spec §1) ↔ DDL `events.event_type` CHECK ↔ Module Map constants.py | ✅ Consistent |
| 12 Transitions (SM §2) ↔ 14 Use Cases (UC Catalog) ↔ Module Map §2 UC Implementation Map | ✅ Consistent |
| 9 Guards (SM §3) ↔ UC preconditions ↔ machine.py error types | ✅ Consistent |
| 10 Actions (SM §4) ↔ UC main flows ↔ event emissions | ✅ Consistent |
| Routing 2-stage resolution (Routing §1) ↔ DDL routing_rules/assignments tables ↔ resolver.py contract | ✅ Consistent |
| 4-layer prompt architecture (Prompt §1) ↔ builder.py contract ↔ cache policy | ✅ Consistent |
| Audit ledger hash chain (Event §2) ↔ ledger.py contract ↔ DDL events table constraints | ✅ Consistent |
| AD-S7-01 atomic TX ↔ machine.py contract ↔ TC-09 test spec | ✅ Consistent |
| AD-S5-02 PAUSED routing guard ↔ resolver.py precondition ↔ UC-13 SQL CASE | ✅ Consistent |
| AD-S8-02 admin ops no events ↔ Module Map §4.11 ↔ TC-11 test spec | ✅ Consistent |
| AD-S8B-01 server-side FIP parsing ↔ ingestion.py contract ↔ IR-4 dashboard rule | ✅ Consistent |
| AD-S8B-09 server-computed next_action ↔ state response amendment ↔ IR-4 | ✅ Consistent |
| Entity Dictionary field types ↔ DDL column types ↔ Module Map dataclass types | ✅ Consistent |
| `feedback_ingested` SSE-only (not in 15 events table types) ↔ Stage 8B §6.2 clarification | ✅ Consistent |
| FeedbackRecord schema ↔ `pending_feedbacks` DDL (Stage 8B §13) ↔ UC-15 output | ✅ Consistent |

**Verdict:** The 8-stage specification corpus (Stages 1–8B) is internally sound. No contradictions found within the spec documents themselves. All Architectural Decisions are traceable and consistently applied.

---

## §6 — Recommendations

### 6.1 — Immediate Actions (Before GATE_0)

1. **Amend the Work Package D.1** — replace directory tree with Module Map §1 verbatim + Stage 8B §12.3 additions
2. **Amend WP D.2 Team 61 task 5** — port 8090, prefix `/api/` (no `/v1/`)
3. **Amend WP D.3 Gate 3 AC** — replace invented feedback endpoints with Stage 8B §10.1 single endpoint
4. **Amend WP D.5** — same feedback endpoint correction
5. **Amend WP D.2 Team 31 task 3** — config.html requires live API wiring
6. **Add `cli/pipeline_run.sh`** to WP D.2 team assignment (Team 21 or 61)
7. **Issue DDL v1.0.2 mandate** to Team 111 as first Gate 0 action
8. **Add UC-15 reference note** to WP or team activation prompts

### 6.2 — Process Map Decision

The Process Map and Work Package cannot both be authoritative for gate definitions — they contradict each other. Team 00 must decide:

| Option | Pros | Cons |
|--------|------|------|
| **A: Amend Process Map** | Both documents stay canonical | Effort to update; risk of new drift |
| **B: WP supersedes Process Map** | Single source of truth; no amendment needed | Process Map's build-order and module dependency sequence are valuable and should be preserved |
| **C: Process Map = build order only; WP = gate ACs** | Each document has a clear role | Requires explicit declaration |

**Recommendation:** Option C. Declare in WP Part B or Part A: "Gate Acceptance Criteria in this WP supersede Process Map §4–§8 gate definitions. Process Map §5–§6 module dependency build order and §10 visual remain authoritative for layer sequencing."

### 6.3 — Error Code Audit

Before Gate 0, produce a canonical list of all 49 error codes with: code name, HTTP status, source stage, and triggering condition. This prevents implementation-time confusion and serves as a testing reference for Team 51.

---

## §7 — Conclusion

The AOS v3 specification corpus is architecturally sound. The 8 spec stages (Entity Dictionary through Stage 8B) are internally consistent, and the 11 locked Architectural Decisions (AD-S5-01 through AD-S8B-11) are well-integrated across documents.

The findings in this review are concentrated in the **operational BUILD documents** (Work Package and Process Map), not in the specifications themselves. The required amendments are mechanical — no architectural rethinking is needed.

**Recommendation:** Resolve the 4 CRITICAL findings before issuing team activation prompts. The 8 MAJOR findings should be resolved before each team's relevant Gate. The 5 MEDIUM findings are informational and can be addressed via team activation prompt annotations.

The specification is ready for BUILD.

---

**log_entry | TEAM_100 | PRE_BUILD_ARCHITECTURAL_REVIEW | AOS_V3 | SUBMITTED | 2026-03-27**

# TEAM_190_TO_TEAM_00_RFM_190_03_ARCHITECTURAL_INTELLIGENCE_REVIEW_v1.0.0

**project_domain:** AGENTS_OS  
**from:** Team 190 (Constitutional Validation / Architectural Intelligence)  
**to:** Team 00 (Chief Architect / Mother)  
**cc:** Team 100, Team 170, Team 61, Nimrod  
**date:** 2026-03-14  
**status:** SUBMITTED  
**gate_id:** GOVERNANCE_PROGRAM  
**in_response_to:** RFM-190-03_REFINED + converted architect package under `_COMMUNICATION/_Architects_Decisions/Gimini 00 cloud/`

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 (runtime) + AGENTS_OS parallel track |
| program_id | S002-P002 (current runtime mirror), S004-P001 (next AGENTS_OS planned) |
| work_package_id | N/A (policy + platform hardening review) |
| task_id | RFM-190-03 |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 190 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

---

## 0) Source Intake Confirmation

### 0.1 Format readability
- `.gdoc` shortcuts were unreadable as content artifacts in-repo (metadata only).
- Converted `.md` artifacts are readable and were used as primary analysis input:
  1. `_COMMUNICATION/_Architects_Decisions/Gimini 00 cloud/פסיקה אדריכלית_ חיתום מציאות ממשק וסגירת חובות (v1.3.0).md`
  2. `_COMMUNICATION/_Architects_Decisions/Gimini 00 cloud/תוכנית אבולוציה אסטרטגית_ Agents_OS v2 Interface.md`
  3. `_COMMUNICATION/_Architects_Decisions/Gimini 00 cloud/תדריך עומק אסטרטגי לצוות 100_ הקשר ומשמעות ה-Agents_OS.md`

### 0.2 Validation basis (canonical)
- Gate and authority model: `documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md`
- Human gate contract: `documentation/docs-governance/05-CONTRACTS/GATE_7_HUMAN_UX_APPROVAL_CONTRACT_v1.1.0.md`
- Role/domain split: `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md`
- Runtime truth: `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`
- Program roadmap position: `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`
- Running implementation: `agents_os_v2/orchestrator/pipeline.py`, `agents_os_v2/orchestrator/state.py`, `agents_os_v2/observers/state_reader.py`, `PIPELINE_DASHBOARD.html`, `PIPELINE_ROADMAP.html`

---

## 1) Strategic Verdict (Top-Level)

| Item | Verdict | Rationale |
|---|---|---|
| ADR-028 (UI reality seal + hardening mandate) | **PASS_WITH_ACTIONS** | Direction is correct and aligned with AD-V2 findings; requires execution clarifications and enforcement placement fix (engine-level, not UI-only). |
| ARCH-STRAT-007 (A/B/C evolution options) | **CONDITIONAL_PASS** | Option A is mandatory and immediate. Option B viable but requires security/control-plane design packet. Option C should be deferred after A+B stabilizes. |
| ARCH-BRIEF-100 (context lock) | **PASS** | Fully aligned with constitutional goal of deterministic governance and evidence-first architecture. |

**Overall Team 190 ruling:** **GO (phased)** — Immediate hardening should start now, but with explicit constraints listed in sections 5–7 below.

---

## 2) Compatibility to Existing System and Roadmap

### 2.1 Strong alignment points
1. Architect focus on AD-V2-01/02/05 matches current observed defects in code and runtime artifacts:
   - `state_reader.py` still parses `current_stage_id` (not `active_stage_id`) at `agents_os_v2/observers/state_reader.py:66`.
   - WSM canonical field is `active_stage_id` at `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md:94`.
   - Operational-state extraction remains regex-fragile at `agents_os_v2/observers/state_reader.py:69-71`.
2. “Double reality” concern is real in current implementation:
   - UI runtime rendering reads `pipeline_state.json` (`PIPELINE_DASHBOARD.html:926`, `PIPELINE_ROADMAP.html:388`) and does not enforce WSM reconciliation.
3. Roadmap timing is compatible with immediate hardening:
   - S003 AGENTS_OS programs completed (`PHOENIX_PROGRAM_REGISTRY` lines 46-47).
   - Next AGENTS_OS lane is S004-P001 planned (`PHOENIX_PROGRAM_REGISTRY` line 52).

### 2.2 Misalignments / drift that must be corrected with the mandate
1. **Gate ownership drift inside UI files**:
   - Dashboard marks `GATE_7` owner as `team_00` (`PIPELINE_DASHBOARD.html:908`) while canonical owner is Team 90 (`04_GATE_MODEL_PROTOCOL_v2.3.0.md:109,122`).
   - Roadmap page same drift (`PIPELINE_ROADMAP.html:277`).
   - Runtime pipeline file is already aligned (`agents_os_v2/orchestrator/pipeline.py:60`).
2. **Procedure-to-code path drift**:
   - AGENTS_OS V2 procedure references `agents_os_v2/state.py` and `agents_os_output` (`AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md:70`), while actual implementation is `agents_os_v2/orchestrator/state.py` with `_COMMUNICATION/agents_os` output (`agents_os_v2/orchestrator/state.py:18`, `agents_os_v2/config.py:35-37`).
3. **Domain-state architecture partially implemented but UI still legacy-bound**:
   - State manager supports domain-specific files (`agents_os_v2/config.py:44-56`, `agents_os_v2/orchestrator/state.py:40-64`) but dashboard/roadmap still read only legacy `pipeline_state.json`.

---

## 3) Impact and Urgency Assessment

| Workstream | Impact | Urgency | Reason |
|---|---|---|---|
| WS-A: AD-V2-01/02 parser fixes | HIGH | **P0 (Immediate)** | Incorrect stage/operational parsing corrupts governance context and downstream prompts. |
| WS-B: WSM↔Runtime integrity surface in UI (red banner + detail) | HIGH | **P0 (Immediate)** | Removes silent desync and prevents blind approvals. |
| WS-C: Gate-6 PASS block on desync | HIGH | **P0/P1** | Must enforce in orchestrator path, otherwise UI-only warning is bypassable. |
| WS-D: Owner/path documentation drift cleanup | MEDIUM | **P1** | Governance drift risk (wrong owner shown to human). |
| WS-E: Command Bridge (UI as control plane) | HIGH | P2 (after hardening) | High value but introduces security and operational risk if rushed. |
| WS-F: Embedded Governance UI (diff center) | MEDIUM-HIGH | P3 | Valuable but broad scope; not required for immediate risk closure. |

---

## 4) Scope of Work (Realistic Execution Envelope)

### 4.1 Immediate package (Hardening) — recommended 2 waves

**Wave 1 (48h feasible):**
1. `state_reader.py`: switch stage parsing to `active_stage_id`; replace fragile operational parser with deterministic extraction.
2. Dashboard+Roadmap owner matrix correction for GATE_7 (Team 90 owner, Nimrod authority wording).
3. UI red banner for desync (read-only detect mode) with explicit diff fields.
4. Unit tests for parser and desync detector.

**Wave 2 (next 2-4 days):**
1. Engine guard: block `--approve GATE_6` when desync exists (or require explicit governed override token).
2. Canonical docs sync (procedures + references + evidence schema updates).
3. Add machine-readable desync payload file for audit trails.

### 4.2 Command Bridge (Option B) — estimated 1-2 weeks
- Requires backend command-execution boundary, auth, audit log, idempotency, rollback semantics.
- Must explicitly preserve GATE_7 human authority and no-click-pass rule.

### 4.3 Embedded Governance (Option C) — estimated 2+ weeks
- Requires structural diff framework, evidence provenance, UI policy model.
- Should start only after A/B baseline stabilization.

---

## 5) Dependencies and Required Infrastructure

1. **Canonical field contract for desync check** (must be locked):
   - `active_stage_id`, `active_program_id`, `active_work_package_id`, `current_gate`, `track_mode`, `hold_reason`.
2. **Single enforcement point**:
   - Gate-6 block must be enforced in orchestrator (`agents_os_v2/orchestrator/pipeline.py` approve path), not only in UI display.
3. **Authority-safe override mechanism**:
   - If emergency override is allowed, require explicit reason + signed artifact by Team 00/100; default must be deny.
4. **UI/runtime source alignment**:
   - Decide whether UI continues on legacy `pipeline_state.json` or migrates to domain-aware state selectors.
5. **QA lane assignment per domain split**:
   - AGENTS_OS hardening QA via Team 51 (child of Team 50), validation via Team 190/90.
6. **Doc synchronization lane**:
   - Team 170 for AGENTS_OS governance docs; Team 70 only for TIKTRACK/repository maintenance lane.

---

## 6) Additional Recommendations / Gaps in Current Architect Proposal

1. **Clarify “Desync” contract** (currently implicit):
   - ADR says “compare versions” but does not define exact fields or comparison policy.
2. **Relocate enforcement requirement**:
   - ADR line “engine must not pass Gate 6 if UI shows desync” is operationally fragile because engine can run without dashboard session.
   - Required correction: engine enforces; UI reports.
3. **Phase-2 item in ARCH-STRAT-007 appears already partially implemented**:
   - “Smart Copy Prompt” exists (`PIPELINE_DASHBOARD.html:842`, `PIPELINE_DASHBOARD.html:1187-1195`, `PIPELINE_DASHBOARD.html:2173`).
   - Replace Phase-2 milestone with “domain-aware state selector + desync diff panel + evidence export”.
4. **Governance drift remediation should be bundled with hardening**:
   - UI owner matrix and procedure path drift are active sources of operator confusion; low effort, high governance value.
5. **Roadmap placement recommendation**:
   - Register this as AGENTS_OS hardening under next AGENTS_OS lane (`S004-P001`) unless Team 00 decides it is a direct hotfix continuation of S002-P002 infrastructure.

---

## 7) Questions / Clarifications Required from Chief Architect (Team 00)

1. **Scope boundary:** Is the Gate-6 desync block mandatory for both domains or AGENTS_OS lane only in first rollout?
2. **Enforcement authority:** Confirm normative rule: enforcement in orchestrator path is mandatory, UI warning alone is insufficient.
3. **Override policy:** Is an emergency bypass allowed? If yes, what artifact/signature is required and who can issue it?
4. **Roadmap registration:** Should this initiative be opened as a new AGENTS_OS WP under S004-P001, or as immediate cross-program hardening patch?
5. **Control-plane intent (Option B):** Approve or defer command-bridge development in this cycle?
6. **WSM write semantics:** For Phase-3 vision (“UI writes to WSM”), confirm whether this changes gate-owner write authority rules or only adds a mediated UI wrapper over existing owner flow.

---

## 8) Proposed Immediate Execution Packet (if Team 00 confirms)

1. Team 100 issues LOD200 mini-package: `AOS_UI_HARDENING_AD_V2_01_02_05`.
2. Team 61 implements Wave 1 (parser + banner + owner drift fix).
3. Team 51 runs AGENTS_OS QA package.
4. Team 190 performs constitutional revalidation and drift audit.
5. Team 170 updates AGENTS_OS governance docs and index links.

---

**Decision Recommendation to Team 00:**
- **Approve immediate hardening now (A + enforced Gate-6 guard design).**
- **Approve Option B design phase only (no direct implementation) until clarifications in section 7 are answered.**
- **Defer Option C to post-hardening milestone.**

**log_entry | TEAM_190 | RFM_190_03 | ARCHITECTURAL_INTELLIGENCE_REVIEW_SUBMITTED | PASS_WITH_ACTIONS | 2026-03-14**

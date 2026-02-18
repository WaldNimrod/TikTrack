# Architect Decision Request — Gap Closure (GAP_CLOSURE_BEFORE_AGENT_POC)

**id:** ARCHITECT_DECISION_REQUEST_GAP_CLOSURE  
**from:** Team 10 (The Gateway)  
**to:** Architect (CC: Team 90, Team 70)  
**stage:** GAP_CLOSURE_BEFORE_AGENT_POC  
**date:** 2026-02-18

---

## 1. Decision Items (clear list)

1. **SOP-013 / Closure gate canonical source** — Single authoritative document and path for the closure rule (Task Seal, No Seal No Pay).
2. **Smart History Fill spec authority** — Whether `TEAM_20_TO_ARCHITECT_SMART_HISTORY_FILL_SPEC.md` is promoted to _Architects_Decisions or demoted to communication-only reference.
3. **Header architecture decision canonical** — Whether a canonical decision file exists under _Architects_Decisions for header unification, or procedure references must be updated.
4. **Documentation tree SSOT** — Which tree is canonical for active docs: `documentation/docs-system/`, `documentation/<numbered>/`, or `docs-governance/` (and migration timeline).
5. **Master index canonical path** — Single path for 00_MASTER_INDEX (e.g. documentation/00-MANAGEMENT vs root vs docs-governance).
6. **Carryover items requiring Architect decision** — CARRY-014 (pending logic alert triage), CARRY-015 (precision rule conflict "decision required"); confirm resolution path (formal ADR vs Team 10/20/60 closure).

---

## 2. Current State (per item)

| # | Item | Current state |
|---|------|----------------|
| 1 | SOP-013 | ARCHITECT_DIRECTIVE_GOVERNANCE_STRENGTHENING.md in _Architects_Decisions defines Seal/closure. Policy file TT2_GOVERNANCE_V2_102_SOP_013_CLOSURE_GATE.md was in documentation/07-POLICIES and is now archived. Multiple docs still reference the old path or "SOP-013" without a single canonical policy path. |
| 2 | Smart History Fill | TEAM_20_TO_ARCHITECT_SMART_HISTORY_FILL_SPEC.md lives in 90_Architects_comunication; 00_MASTER_INDEX and other docs cite it as "locked SSOT". It is not in _Architects_Decisions. |
| 3 | Header decision | Procedures reference TEAM_10_TO_ARCHITECT_HEADER_ARCHITECTURE_DECISION.md; no file of that name in _Architects_Decisions. ARCHITECT_HEADER_UNIFICATION_MANDATE exists in _Architects_Decisions (drift register). |
| 4 | Doc tree | documentation/docs-system (e.g. TT2_OFFICIAL_PAGE_TRACKER, TT2_SSOT_REGISTRY) and documentation/01-ARCHITECTURE, 00-MANAGEMENT, etc. coexist. docs-governance holds governance foundations and target model; migration "until" noted in GOVERNANCE_SOURCE_MATRIX. |
| 5 | Master index | 00_MASTER_INDEX.md at repo root; documentation/00-MANAGEMENT/00_MASTER_INDEX.md in some authority lists; docs-governance and _POC_ARTIFACT_SAMPLE also reference index paths. |
| 6 | CARRY-014 / CARRY-015 | CARRY-014: PENDING_LOGIC_ALERTS.md — undefined logic alert; owner Team 10 + 20. CARRY-015: CASH_FLOW_PARSER_SPEC precision rule conflict "decision required"; owner Team 10 + 20 + 60. No formal ADR yet. |

---

## 3. Impact Analysis

| # | Item | Impact if unresolved |
|---|------|----------------------|
| 1 | SOP-013 | Agent/POC and teams may reference wrong or missing policy; Seal compliance checks inconsistent; Team 90 drift report remains open. |
| 2 | Smart History Fill | Continued authority drift; docs point to comm folder as SSOT; risk of duplicate or conflicting spec. |
| 3 | Header decision | Procedure links broken or pointing to non-authority; Gate/validation may use wrong artifact. |
| 4 | Doc tree | Carryover and scripts reference docs-system vs numbered folders; migration and automation unclear; dual trees cause reference errors. |
| 5 | Master index | Multiple "master" indexes; Agent/automation and humans may use different entry point; broken links. |
| 6 | CARRY-014/015 | Items stay OPEN; Stage exit blocked; possible technical debt (logic alert, precision conflict) in implementation. |

---

## 4. Recommended Options (A / B / C)

### 4.1 SOP-013 canonical source

- **Option A:** Declare **only** `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_GOVERNANCE_STRENGTHENING.md` as the canonical closure rule. All references (docs, matrix, procedures) point here. No separate "SOP-013" policy file in active tree.
- **Option B:** Restore or recreate an active policy file (e.g. in docs-governance or documentation/07-POLICIES) named e.g. TT2_GOVERNANCE_SOP_013_CLOSURE_GATE.md that either contains the rule or forwards explicitly to the Architect Directive; then align all references to that path.
- **Option C:** Create docs-governance policy document as canonical (e.g. docs-governance/02-PROCEDURES/SOP_013_CLOSURE_GATE.md) and migrate all references; _Architects_Decisions keeps the directive as source of intent, governance holds the procedure.

**Recommendation:** A (single source = Architect Directive; minimal change).

---

### 4.2 Smart History Fill spec authority

- **Option A:** **Promote:** Copy or move content to _Architects_Decisions with a canonical name (e.g. SMART_HISTORY_FILL_SPEC.md or ADR-XXX); update all references; demote comm file to "submission that became decision".
- **Option B:** **Demote:** Remove "locked SSOT" from all references; treat TEAM_20_TO_ARCHITECT_SMART_HISTORY_FILL_SPEC as communication only; create a separate canonical spec in documentation/ or _Architects_Decisions if needed.
- **Option C:** **Hybrid:** Leave file in comm; add a short Architect Decision in _Architects_Decisions that states "Smart History Fill spec is canonical as in [path to comm file]" and make that ADR the only authority link.

**Recommendation:** A or C (clear single authority).

---

### 4.3 Header architecture decision canonical

- **Option A:** Add in _Architects_Decisions a document named ARCHITECT_HEADER_UNIFICATION_MANDATE.md (or same as procedure reference) and update procedures to point to _Architects_Decisions only.
- **Option B:** Rename or duplicate existing ARCHITECT_HEADER_UNIFICATION_MANDATE so procedure reference name matches; update procedure to exact filename.
- **Option C:** Document in 00_MASTER_INDEX or registry that "Header unification authority = ARCHITECT_HEADER_UNIFICATION_MANDATE in _Architects_Decisions" and replace any TEAM_10_TO_ARCHITECT_HEADER_ARCHITECTURE_DECISION references with that.

**Recommendation:** C or A (single canonical name and path).

---

### 4.4 Documentation tree SSOT

- **Option A:** **docs-system as SSOT** for Page Tracker, SSOT Registry, and active specs; numbered folders (01-ARCHITECTURE, etc.) deprecated or aliased to docs-system paths.
- **Option B:** **Numbered folders as SSOT** (documentation/01-ARCHITECTURE, 00-MANAGEMENT, …); docs-system is legacy; migrate Carryover and drift register references to numbered paths.
- **Option C:** **docs-governance for governance only;** documentation/ remains for product/architecture; clear split: governance in docs-governance, rest in documentation/ with one structure (either docs-system or numbered) declared canonical.

**Recommendation:** B or C (explicit single structure and timeline).

---

### 4.5 Master index canonical path

- **Option A:** **Root** `00_MASTER_INDEX.md` is the single entry point; all references (including documentation/ and docs-governance) point to root.
- **Option B:** **documentation/00-MANAGEMENT/00_MASTER_INDEX.md** is canonical; root copy is deprecated or redirect.
- **Option C:** **docs-governance** holds the master index (e.g. docs-governance/00-FOUNDATIONS/00_MASTER_INDEX.md); documentation and _COMMUNICATION reference it.

**Recommendation:** A or B (minimal change; B if documentation tree is primary).

---

### 4.6 CARRY-014 and CARRY-015 (decision path)

- **Option A:** **Formal ADR** for each: logic alert triage (CARRY-014), precision rule conflict (CARRY-015); Architect issues ADR; then close via normal Seal/gate.
- **Option B:** **Team 10 + owners close** with explicit decision log in Master Task List or Carryover list (e.g. "DECIDED: …"); no ADR unless Architect requires.
- **Option C:** **Defer to Batch 3 / Stage-1 hygiene:** Mark as "DECIDED to resolve in Batch 3" or "DECIDED: accept current SSOT; conflict note to be updated by Team 20/60 by date X"; Stage exit allowed with this decision.

**Recommendation:** C for speed with date-bound follow-up; A if Architect wants full ADR trail.

---

## 5. Next Steps

1. Architect (and Team 90 where applicable) review this request and chosen options.
2. Architect issues decisions (ADR or directive) per item.
3. Team 70 executes path/link updates; Team 10 updates Carryover and Master List status.
4. Team 90 validates and, when exit criteria met, issues **STATUS: CLEAN_FOR_AGENT**.

---

**log_entry | TEAM_10 | ARCHITECT_DECISION_REQUEST_GAP_CLOSURE | ISSUED | 2026-02-18**

# TT2_GOVERNANCE_AND_QUALITY_GATES

**id:** `TT2_GOVERNANCE_AND_QUALITY_GATES`  
**owner:** Team 10 + Team 90  
**status:** ACTIVE  
**last_updated:** 2026-02-14  

---

## 1) Governance Principles
- SSOT is the only source of truth
- No patches; deep fixes only (per architect decision reports)
- Evidence required for approval
- Folder integrity: each team writes only in its `_COMMUNICATION/team_x` territory
- Knowledge promotion: Team 10 is the only execution owner for promoting sandbox outputs into SSOT docs

## 2) Quality Gates
- **Gate A**: Automated QA (Team 50)
- **Gate B**: Independent verification (Team 90)
- **Gate C**: Visual approval (G‑Lead)

## 3) Current Gate Status (2026-02-13)
- **Gate B:** GREEN (Team 90 re‑verify on record).
- **Gate C (Visual):** Approved (G‑Lead sign‑off log).
- **Clean Table:** Declared after A/B/C completion.

## 4) Knowledge Promotion & Archiving
- Promote decisions from communication to documentation
- Archive under `99-ARCHIVE/YYYY-MM-DD`
- Sandbox communication is temporary; SSOT is authoritative

## 5) Versioning Policy (ADR‑016)
- SV‑prefixed composite versioning
- Major/Minor only by G‑Lead
- System version currently locked to `1.0.0` as operational baseline

## 6) Evidence & Audit Requirements
- Logs, artifacts, and signed QA reports
- No approval without evidence
- External-data validation must include replay/nightly evidence and no-network replay checks

## 7) References (SSOT)
- `documentation/05-PROCEDURES/TT2_QUALITY_ASSURANCE_GATE_PROTOCOL.md`
- `documentation/05-PROCEDURES/TT2_KNOWLEDGE_PROMOTION_PROTOCOL.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/TT2_VERSIONING_POLICY.md`
- `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_GOVERNANCE_STRENGTHENING.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/TT2_GOVERNANCE_AND_AI_COMMUNICATION_PROTOCOL.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/BATCH_2_5_COMPLETIONS_MANDATE.md`

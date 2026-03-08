# TEAM_10 → TEAM_90 | S002-P002 MCP-QA — Evidence Validation Protocol Activation (v1.0.0)

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** TEAM_10_TO_TEAM_90_S002_P002_MCP_EVIDENCE_VALIDATION_PROTOCOL_ACTIVATION_v1.0.0  
**from:** Team 10 (Gateway Orchestration)  
**to:** Team 90 (External Validation Unit — GATE_5/GATE_6/GATE_7/GATE_8 owner)  
**cc:** Team 190, Team 50, Team 60, Team 61  
**date:** 2026-03-07  
**status:** MANDATE_ACTIVE  
**program_id:** S002-P002  
**gate_id:** GATE_3_PREPARATION  
**authority:** TEAM_190_TO_TEAM_10_S002_P002_MCP_QA_TRANSITION_ACTIVATION_PROMPT_v1.0.0.md §5  

---

## 0) הגשה תקינה — Entry Conditions (Handoff Status)

**כניסה ל־G3.7 מאושרת.** תנאי השער מולאו:

| Condition | Status | Reference |
|-----------|--------|-----------|
| G3.5 — תשתית readiness (Team 60) | PASS | TEAM_10_S002_P002_G3.5_CHECKPOINT_SIGNOFF_v1.0.0.md |
| G3.6 — Hybrid QA (Team 50) | PASS | TEAM_10_S002_P002_G3.6_CHECKPOINT_SIGNOFF_v1.0.0.md |

**מה נמסר ל־Team 90 במסגרת הגשה זו:**
- מסמך זה (מנדט G3.7).
- תוכנית ביצוע: `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_10_S002_P002_MCP_QA_TRANSITION_GATE3_EXECUTION_PLAN_v1.0.0.md`.
- Evidence Contract (§2 למטה) — חוזה ל־MATERIALIZATION_EVIDENCE.json.
- דוגמאות evidence חתום: `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_50_S002_P002_G3.6_MATERIALIZATION_EVIDENCE.json`; תשתית: `infrastructure/s002_p002_mcp_qa/` (generate_evidence.py, RUNTIME_IDENTITY.md, MCP_CHROME_SETUP.md).

---

## Mandatory Identity Header

| Field | Value |
|-------|------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| gate_id | GATE_3_PREPARATION |
| phase_owner | Team 10 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

---

## 1) Boundary (Locked)

- **GATE_7:** Team 90 is gate owner; human authority is Nimrod (Team 00); **MCP evidence is advisory only**.
- **GATE_8:** Lifecycle completion only on Team 90 closure PASS.
- No gate-owner drift.

---

## 2) Mandate — Verification Checkpoints for GATE_5/GATE_6 Materialization Evidence

Define and publish **verification checkpoints** that Team 90 will use to validate **materialization evidence** submitted for GATE_5 and GATE_6 in S002-P002 (MCP-QA Transition). Checkpoints must align with:

1. **Evidence Contract** — Every MATERIALIZATION_EVIDENCE.json must include:
   - provenance tag (`TARGET_RUNTIME` | `LOCAL_DEV_NON_AUTHORITATIVE` | `SIMULATION`)
   - signature block (Ed25519, key_id, signature_base64, signed_payload_sha256, signed_at_utc, signed_by_team)
   - gate context and traceable artifact path

2. **GATE_5 / GATE_6 scope** — What constitutes acceptable materialization evidence for opening or passing GATE_5 and GATE_6 in this program (e.g. hybrid parity results, signed evidence paths, gate context).

3. **Advisory nature of MCP evidence** — Per locked boundary, MCP evidence is advisory only; human authority (Nimrod) and Team 90 closure remain canonical for GATE_7 and GATE_8.

---

## 3) Deliverables and Response (תוצרים נדרשים)

- **Deliverable 1 — פרוטוקול / checklist:** מסמך שמגדיר את verification checkpoints ל־GATE_5/GATE_6 materialization evidence; מפורסם ומועבר ל־Team 10 (ולצוותי ביצוע לפי צורך).
  - **נתיב מומלץ:** `documentation/reports/05-REPORTS/artifacts_SESSION_01/S002_P002_G3.7_EVIDENCE_VALIDATION_PROTOCOL_v1.0.0.md` (או בתיקיית `_COMMUNICATION/team_90/` אם מתאים לארגון התקשורת).
- **Deliverable 2 — דוח השלמה ל־Team 10:** אישור שהפרוטוקול הוגדר והיכן מפורסם (artifact_path); תגובה פורמלית.
  - **שם מומלץ:** `TEAM_90_TO_TEAM_10_S002_P002_G3.7_EVIDENCE_VALIDATION_PROTOCOL_COMPLETION_v1.0.0.md`.
  - **מיקום מומלץ:** `_COMMUNICATION/team_90/` או `documentation/reports/05-REPORTS/artifacts_SESSION_01/`.
  - **תוכן מינימלי:** program_id S002-P002, gate_id GATE_3_PREPARATION (G3.7), artifact_path לפרוטוקול, status (COMPLETE), date.

**Exit criterion (מתוך תוכנית הביצוע):** Protocol defined and communicated to Team 10.

---

## 4) Sequencing

This mandate is **unlocked after G3.5 PASS** (automation and runtime readiness). **G3.5 and G3.6 are PASS**; Team 90 may define the protocol so that checkpoints are ready before GATE_5 submission (G3.7 step).

---

## 5) Reference (מקורות)

| נושא | נתיב |
|------|------|
| Execution plan (G3.7) | `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_10_S002_P002_MCP_QA_TRANSITION_GATE3_EXECUTION_PLAN_v1.0.0.md` |
| G3.5 sign-off | `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_10_S002_P002_G3.5_CHECKPOINT_SIGNOFF_v1.0.0.md` |
| G3.6 sign-off | `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_10_S002_P002_G3.6_CHECKPOINT_SIGNOFF_v1.0.0.md` |
| Evidence Contract (in plan) | §3 in execution plan above |
| דוגמת evidence חתום (G3.6) | `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_50_S002_P002_G3.6_MATERIALIZATION_EVIDENCE.json` |
| תשתית evidence + provenance | `infrastructure/s002_p002_mcp_qa/` (generate_evidence.py, RUNTIME_IDENTITY.md, KEY_CUSTODY.md) |

---

**log_entry | TEAM_10 | TO_TEAM_90 | S002_P002_MCP_EVIDENCE_VALIDATION_PROTOCOL_ACTIVATION | 2026-03-07**

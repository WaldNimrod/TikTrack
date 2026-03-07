# TEAM_10 | S002-P002 MCP-QA Transition — GATE_3 Execution Plan (v1.0.0)

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** TEAM_10_S002_P002_MCP_QA_TRANSITION_GATE3_EXECUTION_PLAN_v1.0.0  
**owner:** Team 10 (Gateway Orchestration)  
**date:** 2026-03-07  
**status:** LOCKED  
**program_id:** S002-P002  
**gate_id:** GATE_3_PREPARATION  
**authority:** TEAM_190_TO_TEAM_10_S002_P002_MCP_QA_TRANSITION_ACTIVATION_PROMPT_v1.0.0.md §5  

---

## Mandatory Identity Header

| Field | Value |
|-------|------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | N/A |
| gate_id | GATE_3_PREPARATION |
| phase_owner | Team 10 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

---

## 1) G3.1..G3.9 Orchestration Plan

| Step | Id | Description | Owner | Exit criterion |
|------|-----|-------------|--------|----------------|
| 1 | G3.1 | Intake open — WP Definition + Gate3 Plan published | Team 10 | This document + WORK_PACKAGE_DEFINITION published |
| 2 | G3.2 | First-cycle mandates issued to Teams 61, 60, 50, 90 | Team 10 | Four mandate artifacts published and communicated |
| 3 | G3.3 | Team 61 — ייעוץ/תיאום (remote repo); אין deliverable חובה בשלב ראשון | Team 61 | אופציונלי: המלצות/מסמכים; לא חוסם G3.5 |
| 4 | G3.4 | Team 60 — תשתית MCP ל־Chrome + runtime + Ed25519 + signing service | Team 60 | Completion report to Team 10 with evidence_path |
| 5 | **G3.5** | **Checkpoint: תשתית readiness (Team 60)** | **Team 10** | **Mandatory:** Team 60 completion confirmed (תשתית MCP+Chrome, runtime, signing); evidence verifiable on disk. No G3.6 until G3.5 PASS. Team 61 לא חוסם בשלב ראשון. |
| 6 | **G3.6** | **Team 50 — hybrid QA activation (MCP + Selenium parity runs)** | **Team 50** | **PASS** — TEAM_10_S002_P002_G3.6_CHECKPOINT_SIGNOFF_v1.0.0.md |
| 7 | **G3.7** | **Team 90 — evidence validation protocol activation (GATE_5/GATE_6 checkpoints)** | **Team 90** | **PASS** — TEAM_10_S002_P002_G3.7_CHECKPOINT_SIGNOFF_v1.0.0.md |
| 8 | G3.8 | Pre-GATE_4 consolidation — all first-cycle deliverables verified | Team 10 | All evidence paths valid; WSM updated as needed |
| 9 | G3.9 | GATE_3 close → GATE_4 open (per gate model) | Team 10 | Gate handoff package to self (GATE_4 owner); QA phase starts |

---

## 2) Mandatory G3.5 Checkpoint Definition

**G3.5** is a **hard gate** between automation/runtime setup and QA/validation activation.

**Entry conditions (phase one — all required):**
- Team 60 has delivered: (1) תשתית MCP ל־Chrome (בנוסף ל־Selenium) כך ש־50/90/190 יכולים להשתמש ב־MCP לבדיקות ועבודה מול Chrome; (2) runtime hardening; (3) Ed25519 key custody; (4) signing service setup — and reported completion with evidence_path.
- Evidence (if any) from Team 60 complies with Evidence Contract: provenance tag, signature block, gate context, artifact path.
- Team 61: no mandatory deliverable in phase one; optional advisory input does not block G3.5.

**Exit criterion:** Team 10 signs off G3.5 PASS and records in execution tracking. Only then may Team 10 unlock G3.6 (Team 50) and G3.7 (Team 90).

**Failure:** If G3.5 is not passed, Team 10 does not advance to G3.6/G3.7; remediation with Team 60 as needed.

---

## 3) Evidence Contract (reminder)

Every MATERIALIZATION_EVIDENCE.json in this program must include:
1. **provenance tag:** `TARGET_RUNTIME` | `LOCAL_DEV_NON_AUTHORITATIVE` | `SIMULATION`
2. **signature block:** `Ed25519`, `key_id`, `signature_base64`, `signed_payload_sha256`, `signed_at_utc`, `signed_by_team`
3. **gate context** and **traceable artifact path**

---

## 4) מנדט צוות 10 — השלמת שער 3 עד אישור ולידציה בשער 4

**תפקיד Team 10 (Gateway):** לבצע באופן מסודר ומלא את כל שלבי שער 3 (GATE_3_PREPARATION) עד **אישור ולידציה בשער 4 (GATE_4) על ידי Team 90** — לקידום חבילת MCP (S002-P002).

**הצעדים הנותרים (אחרי G3.7 PASS):**

| שלב | תיאור | בעלים |
|-----|--------|--------|
| **G3.8** | Pre-GATE_4 consolidation — אימות כל תוצרי המחזור הראשון (evidence paths תקפים; WSM לפי צורך) | Team 10 |
| **G3.9** | GATE_3 close → GATE_4 open (חבילת מעבר ל־GATE_4; מודל השער) | Team 10 |
| **GATE_4** | ולידציה — אישור Team 90 לקידום חבילת MCP | Team 90 |

Team 10 ממשיך ב־G3.8 ואז G3.9; לאחר פתיחת GATE_4 — הגשת חבילה ל־Team 90 לאישור ולידציה.

**סטטוס ומה נותר:** `TEAM_10_S002_P002_GATE3_STATUS_AND_REMAINING_v1.0.0.md` — צ'קליסט G3.8, G3.9 ועדכון סטטוס עם כל התקדמות.

---

**log_entry | TEAM_10 | S002_P002_MCP_QA_GATE3_EXECUTION_PLAN | v1.0.0 | 2026-03-07**

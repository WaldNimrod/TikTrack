# TEAM_60 | S002-P002 MCP-QA — Role Refresh & Mandate Intake (v1.0.0)

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** TEAM_60_S002_P002_MCP_QA_ROLE_AND_MANDATE_INTAKE_v1.0.0  
**from:** Team 60 (Runtime / Platform & Signing-Key Custody)  
**to:** Team 10 (Gateway Orchestration)  
**cc:** Team 190, Team 50, Team 61, Team 90  
**date:** 2026-03-07  
**status:** ACKNOWLEDGED  
**program_id:** S002-P002  
**gate_id:** GATE_3_PREPARATION  
**in_response_to:** TEAM_10_TO_TEAM_60_S002_P002_MCP_QA_RUNTIME_AND_SIGNING_ACTIVATION_v1.0.0.md  

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

## 1) תחום אחריות Team 60 (נעול)

- **Runtime / Platform:** תשתית ריצה מוגדרת להרצות MCP-QA (MCP + Selenium); תיעוד זהות runtime ומגבלות (TARGET_RUNTIME vs LOCAL_DEV_NON_AUTHORITATIVE) לצורכי Evidence Contract. **תשתית ב־repo הזה — צוות 60;** Team 61 עובד על repo מרוחק וישמש יועץ/מתאם.
- **Signing-Key Custody:** מפתחות Ed25519 לחתימת MATERIALIZATION_EVIDENCE.json תחת שליטה ותיעוד; גישה ושימוש מתועדים וניתנים למעקב.
- **Signing service:** שירות חתימה שמייצר את ה־signature block הנדרש בחוזה Evidence.

**לא באחריות Team 60 (ללא דרift):**
- בעלות על תוכן אוטומציה ברפו (שייכת ל־Team 61).
- בעלות על שערים (Gate ownership נשארת קנונית לפי GATE_MODEL).

*מקור נעילה:* TEAM_190_TO_TEAM_10_S002_P002_MCP_QA_TRANSITION_ACTIVATION_PROMPT_v1.0.0.md §4.

---

## 2) מטרת שלב ראשון + מנדט — ארבעה deliverables

**מטרה:** תשתית שתאפשר ל־**צוותים 50, 90, 190** להשתמש ב־**MCP** לבדיקות ועבודה מול **Chrome** — **במקום ובנוסף ל־Selenium** הקיים. תשתית ב־repo הזה — צוות 60.

| # | Deliverable | תוצר נדרש | Exit |
|---|-------------|-----------|------|
| **1** | **תשתית MCP ל־Chrome (בנוסף ל־Selenium)** | Runtime, tooling, integration שמאפשרים הרצת בדיקות ועבודה עם Chrome via MCP — בנוסף ל־Selenium. **Deliverable ראשי לשלב ראשון.** | evidence_path בדוח השלמה |
| 2 | **Runtime hardening** | תיעוד סביבת ריצה מוגדרת; זהות runtime ומגבלות (provenance) ל־Evidence Contract. | evidence_path בדוח השלמה |
| 3 | **Ed25519 key custody** | הקמה/אישור משמורת מפתחות; תיעוד גישה ושימוש, מעקב. | evidence_path בדוח השלמה |
| 4 | **Signing service setup** | שירות שמייצר signature block: Ed25519, key_id, signature_base64, signed_payload_sha256, signed_at_utc, signed_by_team. | operational + evidence_path |

---

## 3) Evidence Contract (התחייבות)

כל MATERIALIZATION_EVIDENCE.json בתוכנית זו יכלול:
- **provenance tag:** TARGET_RUNTIME | LOCAL_DEV_NON_AUTHORITATIVE | SIMULATION
- **signature block:** Ed25519, key_id, signature_base64, signed_payload_sha256, signed_at_utc, signed_by_team
- **gate context** ו־**traceable artifact path**

Team 60 אחראי ל־**signing capability** ו־**key custody**; Team 61 משלב קריאה לשירות מתוך repo/CI.

---

## 4) תגובה ומסלול דוח השלמה

- **תגובה:** מסמך זה = קבלת מנדט ואישור גבול אחריות.
- **דוח השלמה:** יימסר ל־Team 10 עם evidence_path לכל ארבעת ה־deliverables, בפורמט §2 (id, status, owner, artifact_path, verification_report, verification_type, verified_by, closed_date).
- **נתיב מתוכנן לדוח השלמה:**  
  `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_10_S002_P002_MCP_QA_RUNTIME_AND_SIGNING_COMPLETION_v1.0.0.md`  
  (או `documentation/reports/05-REPORTS/artifacts_SESSION_01/` אם Team 10 ימליץ.)

G3.5 checkpoint (אוטומציה ו־runtime readiness) תלוי באישור Team 10 על השלמת Team 61 **ו**־Team 60.

---

**log_entry | TEAM_60 | S002_P002_MCP_QA_ROLE_AND_MANDATE_INTAKE | TO_TEAM_10 | 2026-03-07**

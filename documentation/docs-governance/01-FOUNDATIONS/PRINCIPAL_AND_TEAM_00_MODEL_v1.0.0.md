# Principal and Team 00 Model — Governance addendum

**id:** PRINCIPAL_AND_TEAM_00_MODEL_v1.0.0  
**owner:** Team 170 (canonical governance)  
**authority_basis:** `_COMMUNICATION/team_100/TEAM_101_TO_TEAM_100_AOS_V3_CONSOLIDATED_FEEDBACK_FOR_CHIEF_ARCHITECT_v1.1.0.md` §2 (D-01…D-14)  
**date:** 2026-03-26  
**status:** CANONICAL  

---

## 1. Purpose

This addendum locks **human / Principal / Team 00** semantics for agent-loaded governance so that v3 program work, roster IDs, and pipeline behavior use **one** implementation story. Full prose and ER hooks remain in the hub and Team 101 working references listed below.

---

## 2. Decision summary (D-01 … D-14)

| ID | Statement (normative) |
|----|------------------------|
| **D-01** | Exactly **one human operator**; all other “teams” are agents (IDE / automation). |
| **D-02** | **Team 00** = Principal / System Designer — human decision point for WHAT/WHY and **HITL** per the **gate model** (HITL enumeration detail deferred). |
| **D-03** | **`team_00`** in DB / `teams` = representation of the human for FKs (e.g. `assigned_by`); semantically the **operator**, not another agent squad. |
| **D-04** | **No personal names** in SSOT; use `human`, `Principal`, `Team 00`, `team_00`, `operator`, stable role strings. |
| **D-05** | Chat tone / friendly address ≠ canon. |
| **D-06** | Principal **does not routinely author repository files**; mandated squads produce artifacts under assigned paths. |
| **D-07** | Principal **does not run routine test suites** except a **designated human gate** or **explicit request**. |
| **D-08** | Agent outputs: clear language + **VERDICT / BLOCKER / OPEN_QUESTION** when needed. |
| **D-09** | Agents accept all instruction types (approve, reprioritize, clarify, mandate change, stop/continue). |
| **D-10** | **Principal** — top authority on product intent, Iron Rules, human-gate outcomes. |
| **D-11** | **Team 100** — Chief Architect / Chief R&D; program-level architecture and synthesis **within** Principal’s frame. |
| **D-12** | **Teams 190 / 170** — constitutional + governance canon; **do not** replace Principal on product intent. |
| **D-13** | **Team 10** — **not** the routine owner of pipeline state transitions; see **Team 10 / pipeline** note in `TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.1.md` §3 and hub §12. |
| **D-14** | **Team 110** (AOS Domain Architect IDE; formerly informal **Team 101**) — **no blind execution**; must raise risks and alternatives for AOS domain quality. |

---

## 2.1) team_00 בבסיס הנתונים AOS v3 (D-03, נעול 2026-03-26)

**ישות DB:** שורה בטבלת `teams` עם `id='team_00'` קיימת ב-AOS v3 DB.  
**מטרה:** FK integrity בלבד —

- `Assignment.assigned_by` → team_00 (כשה-Principal יוצר Assignment)
- `Event.actor_id` (כאשר `actor_type='human'`) → team_00

**חשוב:** זה ייצוג DB של human operator — לא agent, לא team בפייפליין.  
**Iron Rule:** אין לנתב pipeline tasks ל-`team_00` ב-`routing_rules`.

---

## 3. Pipeline Fidelity Suite (PFS) — canonical name

**Pipeline Fidelity Suite (PFS)** — automated or scripted exercises that drive **pipeline state** and **dashboard UI** through representative paths, assert **contracts** (API, JSON shape, gates), and emit **evidence artifacts**, **without** instantiating additional roster squads. Distinct from **Team 51** product QA of `agents_os_v2` code unless a single CI job explicitly combines them.  
(Source: hub §13; Chief Architect selected **PFS** as the short canonical term.)

---

## 4. Expanded references (non-SSOT detail)

- Hub (merge desk): `_COMMUNICATION/team_100/TEAM_101_TO_TEAM_100_AOS_V3_CONSOLIDATED_FEEDBACK_FOR_CHIEF_ARCHITECT_v1.1.0.md`  
- Principal / communication model (working prose): `_COMMUNICATION/team_101/TEAM_101_PRINCIPAL_TEAM_00_AND_COMMUNICATION_MODEL_v1.0.0.md`  
- Entity Dictionary (ER): `_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.0.md`  

---

**log_entry | TEAM_170 | PRINCIPAL_AND_TEAM_00_MODEL | v1.0.0_CANONICAL | 2026-03-26**  
**log_entry | TEAM_170 | PRINCIPAL_AND_TEAM_00_MODEL | D03_DB_SECTION_EXPANDED | 2026-03-25**

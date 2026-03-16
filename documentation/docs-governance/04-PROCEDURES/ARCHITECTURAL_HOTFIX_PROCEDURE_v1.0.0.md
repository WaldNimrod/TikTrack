**date:** 2026-03-16

---
# Architectural Hotfix & Maker-Checker Protocol
**id:** `ARCHITECTURAL_HOTFIX_PROCEDURE_v1.0.0`
**domain:** SHARED
**owner:** Team 00 (Chief Architect) / Team 100 & 101 (Architecture Authority)

## 1. Purpose
To maximize token efficiency and agility without sacrificing governance. This procedure defines how Architectural Teams (Team 100, Team 101) can issue direct code corrections (Hotfixes) while strictly adhering to the **Maker-Checker Principle (עקרון צמדי צוותים)**.

## 2. Applicability
This procedure applies to ALL architectural agents, regardless of operating mode (Chat Mode, Semi-Auto Dashboard, or Fully Auto API).

## 3. The Procedure
1. **Direct Edit Permitted:** During validation (e.g., GATE_6) or upon direct request from Team 00, an architectural team MAY provide a direct code diff (Hotfix) to resolve logical or architectural flaws.
2. **Role Shift (The Maker-Checker Rule):** The moment an architectural team provides executable code or a diff, they temporarily assume the role of the **Maker** for those specific lines of code.
3. **Loss of Immediate Validation Authority:** A Maker CANNOT be the Checker of their own work. The architectural team is strictly prohibited from immediately issuing a `PASS` or `ARCHITECTURAL_APPROVAL` for the hotfix they just generated.
4. **Mandatory Routing (Regression):** 
   - The pipeline MUST be routed back to the execution validation cycle.
   - Code must pass **GATE_4 (Team 50/51 QA)** and/or **GATE_5 (Team 90)**.
   - Only after a clean, independent QA pass can the architectural team resume their role as the **Checker** and issue the final GATE_6 approval.

## 4. Zero-Trust Compliance
An architect writing code is indistinguishable from a developer writing code. The system does not trust the origin of the code, only the validation seal of the Checker team.
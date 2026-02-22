# SSM Diff Summary: v1.0.0 → v1.1.0
**project_domain:** TIKTRACK

**mandate:** TEAM_100_SSM_LOCK_AND_STRUCTURE_ALIGNMENT  
**from:** Team 170 (Knowledge Librarian)  
**to:** Architect (SPEC_APPROVAL_REQUEST)  
**date:** 2026-02-20  

---

## 1. Lock Team 100 Role Definition

| Location | v1.0.0 | v1.1.0 |
|----------|--------|--------|
| §1.1 Governance Authority | Team 100 = "Development Architecture Authority"; "Owner of development process architecture; Defines gate model, lifecycle contracts, orchestration rules; may approve structural/process gates within its domain; operates under strategic alignment with Team 00." | Team 100 = **Development Architecture Lead**. אחראי לפיתוח סביבת העבודה, מבנה התהליכים, אורקסטרציה וניהול ארגוני. מוסמך לאשר שערים בתחומי המשילות והתהליך בלבד. כפוף אסטרטגית לאדריכלית הראשית (Team 00). |

---

## 2. Hierarchy Canonicalization (Taxonomy Lock)

| Location | v1.0.0 | v1.1.0 |
|----------|--------|--------|
| §0 | Hierarchy: Roadmap → Stage → Program → WP → Task. Numbering S{NNN}-P{NNN}-WP{NNN}-T{NNN}. Gate binding only at WP. | **Explicit Taxonomy Lock:** Roadmap (יחידה אחת בלבד); Stage (ממוספר); Program (Stage-prefixed); Work Package (Stage+Program prefix); Task (WP-prefixed). **Gate flow applies to every Work Package.** Same numbering and binding rule. |

---

## 3. Gate Model Update

| Location | v1.0.0 | v1.1.0 |
|----------|--------|--------|
| Gate signer semantics | Gate 2 (KNOWLEDGE_PROMOTION), Gate 6 (ARCHITECTURAL_VALIDATION), Gate 7 (HUMAN_UX_APPROVAL), Gate 8 (DOCUMENTATION_CLOSURE). | **Canonical Gate Model 0–8** (per 04_GATE_MODEL_PROTOCOL_v2.2.0). **Explicit separation:** Architectural Approval (SPEC) = GATE_1; Architectural Approval (EXECUTION) = GATE_6. **GATE_8 (DOCUMENTATION_CLOSURE — AS_MADE_LOCK):** documentation closure, AS_MADE, archive; Owner Team 190, Executor Team 70; lifecycle not complete until GATE_8 PASS. |

---

## 4. Knowledge Promotion Authority Correction

| Location | v1.0.0 | v1.1.0 |
|----------|--------|--------|
| promotion_authority (frontmatter) | Team 70 (Librarian) — promotion execution ONLY; Team 170 — SSOT integrity only (no promotion execution). | Unchanged; **added explicit:** knowledge_promotion_executor: Team 70 ONLY; knowledge_promotion_validator: Team 190 ONLY. |
| §1 body | Gate 2: Owner Team 190, Executor Team 70 ONLY; Team 170 does not retain promotion execution. | **New §1.2 Knowledge Promotion Authority (LOCKED):** Executor Team 70 ONLY; Validator Team 190; **Not Team 170.** All SSM references to promotion execution point to Team 70; validation to Team 190. |

---

## 5. Version and structural revision

- **version:** 1.0.0 → 1.1.0  
- **structural_revision:** v2.2.0 → v2.3.0  
- **§7 CHANGE LOG:** New row for v1.1.0 SSM_LOCK_AND_STRUCTURE_ALIGNMENT.

---

**log_entry | TEAM_170 | SSM_DIFF_SUMMARY | v1.0.0_to_v1.1.0 | 2026-02-20**

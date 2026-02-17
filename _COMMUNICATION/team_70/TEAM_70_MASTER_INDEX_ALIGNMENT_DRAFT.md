# Team 70 | MASTER_INDEX Alignment Draft

**id:** TEAM_70_MASTER_INDEX_ALIGNMENT_DRAFT  
**owner:** Team 70 (Knowledge Librarian)  
**to:** Team 90 (Validation), Team 10 (Gateway)  
**date:** 2026-02-17  
**context:** TEAM_90_TO_TEAM_70_MODEL_B_LOCKED_CORRECTION_DIRECTIVE  
**status:** Model B aligned

---

## 1) Authority Chain (Pre- and Post-Cutover)

**Single canonical master index path (existing file):**

| Role | Path | Status |
|------|------|--------|
| Global navigation index | `00_MASTER_INDEX.md` (repo root) | **EXISTS** — current active entry point |
| Architect decisions (חוקי יסוד) | `_COMMUNICATION/_Architects_Decisions/` | EXISTS |

**Pre-cutover:** `00_MASTER_INDEX.md` at repo root is the canonical entry point.  
**Model B (approved):** Canonical paths under `documentation/`: `documentation/docs-system/`, `documentation/docs-governance/`, `documentation/reports/`. 00_MASTER_INDEX.md at root.

---

## 2) Canonical Structure — Model B Only

| Location | Contents |
|----------|----------|
| `documentation/docs-system/` | 01-ARCHITECTURE, 02-SERVER, 07-DESIGN, 08-PRODUCT |
| `documentation/docs-governance/` | 00-FOUNDATIONS, 01-POLICIES, 02-PROCEDURES, 06-CONTRACTS, 09-GOVERNANCE |
| `documentation/reports/` | 05-REPORTS, 08-REPORTS |
| `archive/documentation_legacy/snapshots/2026-02-17_0000/` | Full legacy snapshot |
| `_COMMUNICATION/_ARCHITECT_INBOX/` | 90_ARCHITECTS_DOCUMENTATION |

**Legacy index (historical):** `archive/documentation_legacy/snapshots/2026-02-17_0000/00-MANAGEMENT/00_LEGACY_INDEX_SNAPSHOT_2026-02-17.md`  
**Architect decisions (חוקי יסוד):** `_COMMUNICATION/_Architects_Decisions/`

---

## 3) Authority Alignment

- Canonical paths under `documentation/` per Model B.
- Authority references: only `_COMMUNICATION/_Architects_Decisions/` as binding; no `90_Architects_comunication` as SSOT.

---

## 4) Locked References (Model B)

| Reference | Target |
|-----------|--------|
| PHOENIX_MASTER_BIBLE | `documentation/docs-governance/09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md` |
| CURSOR_INTERNAL_PLAYBOOK | `documentation/docs-governance/09-GOVERNANCE/standards/CURSOR_INTERNAL_PLAYBOOK.md` |
| Architect decisions index | `_COMMUNICATION/_Architects_Decisions/` |

---

**log_entry | TEAM_70 | MASTER_INDEX_ALIGNMENT_DRAFT_SUBMITTED | 2026-02-17**

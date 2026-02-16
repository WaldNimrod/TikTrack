# Team 70 | MASTER_INDEX Alignment Draft

**id:** TEAM_70_MASTER_INDEX_ALIGNMENT_DRAFT  
**owner:** Team 70 (Knowledge Librarian)  
**to:** Team 90 (Validation), Team 10 (Gateway)  
**date:** 2026-02-17  
**context:** TEAM_90_TO_TEAM_70_DOCUMENTATION_MIGRATION_CORRECTION_DIRECTIVE  
**status:** DRAFT — No publication until Cutover Gate approval

---

## 1) Authority Chain (Post-Cutover)

| Role | Path |
|------|------|
| Global navigation index | `00_MASTER_INDEX.md` (root) or `docs-governance/00-FOUNDATIONS/00_MASTER_INDEX.md` |
| Architect decisions (חוקי יסוד) | `_COMMUNICATION/_Architects_Decisions/00_MASTER_INDEX.md` |

---

## 2) Proposed Root Entry Point (00_MASTER_INDEX.md)

```markdown
# TikTrack Master Documentation Index — Entry Point

**id:** D15_MASTER_INDEX  
**owner:** Team 10 (The Gateway)  
**status:** Entry point — canonical structure post Phoenix Cutover  
**last_updated:** [CUTOVER_DATE]

---

## Canonical Structure (Phoenix Cutover)

| Location | Contents |
|----------|----------|
| `docs-system/` | 01-ARCHITECTURE, 02-SERVER, 07-DESIGN, 08-PRODUCT |
| `docs-governance/` | 00-FOUNDATIONS, 01-POLICIES, 02-PROCEDURES, 06-CONTRACTS, 09-GOVERNANCE |
| `reports/` | 05-REPORTS, 08-REPORTS |
| `archive/documentation_legacy/` | Full legacy snapshot (00-MANAGEMENT, 02-DEVELOPMENT, 07-POLICIES, 99-ARCHIVE, etc.) |
| `_COMMUNICATION/_ARCHITECT_INBOX/` | 90_ARCHITECTS_DOCUMENTATION (Architect submission channel) |

**Full legacy index:** `archive/documentation_legacy/00-MANAGEMENT/00_MASTER_INDEX.md`  
**Architect decisions (חוקי יסוד):** `_COMMUNICATION/_Architects_Decisions/00_MASTER_INDEX.md`
```

---

## 3) Authority Alignment

- All internal links in migrated docs that pointed to `documentation/` paths shall be updated to `docs-system/`, `docs-governance/`, or `reports/` per Completeness Matrix.
- Authority references: only `_COMMUNICATION/_Architects_Decisions/` as binding; no `90_Architects_comunication` as SSOT.
- Legacy index in archive remains as historical reference; active navigation uses root 00_MASTER_INDEX.md and canonical paths.

---

## 4) Locked References (Post-Cutover)

| Reference | Target |
|-----------|--------|
| PHOENIX_MASTER_BIBLE | `docs-governance/09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md` |
| CURSOR_INTERNAL_PLAYBOOK | `docs-governance/09-GOVERNANCE/standards/CURSOR_INTERNAL_PLAYBOOK.md` |
| Architect decisions index | `_COMMUNICATION/_Architects_Decisions/00_MASTER_INDEX.md` |

---

## 5) Deprecation Note

`documentation/` is deprecated post-cutover. All active navigation uses the canonical structure above.

---

**log_entry | TEAM_70 | MASTER_INDEX_ALIGNMENT_DRAFT_SUBMITTED | 2026-02-17**

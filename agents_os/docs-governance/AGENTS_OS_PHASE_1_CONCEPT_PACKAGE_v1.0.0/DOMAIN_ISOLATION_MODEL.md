# DOMAIN_ISOLATION_MODEL.md
project_domain: AGENTS_OS

## 1. Repository Location

All Agents_OS artifacts must reside under:

TikTrackAppV2-phoenix/agents_os/

No runtime logic may exist outside this directory.

## 2. Communication Layer

_COMMUNICATION remains shared infrastructure.
No domain ownership is transferred.

## 3. Documentation Separation

System documentation:
documentation/docs-system/

Governance documentation:
documentation/docs-governance/

Agents_OS documentation must reside under:
agents_os/documentation/

## 4. Domain Enforcement Rule

No Agents_OS runtime logic allowed in:
- TikTrack runtime directories
- System documentation directories
- Governance canonical files

Violation of this rule is structural failure.

## 5. State (SSM / WSM) — Shared; No Per-Domain State Files

**SSM and WSM are shared** across TikTrack and Agents_OS. There are **no separate** state files (SSM/WSM) for the Agents_OS domain.

- **Canonical location (single source):** `documentation/docs-governance/PHOENIX_CANONICAL/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`, `PHOENIX_MASTER_SSM_v1.0.0.md`.
- **Isolation:** Isolation applies to **domain-specific content** (Agents_OS under `agents_os/`); the **shared layer** (operational state, hierarchy, gates, procedures) lives in `documentation/docs-governance/PHOENIX_CANONICAL/` and is used by both domains.
- **Procedure reference:** `documentation/docs-governance/00_DOCUMENTATION_FOLDER_STRUCTURE_CANONICAL_v1.0.0.md` §1.1.
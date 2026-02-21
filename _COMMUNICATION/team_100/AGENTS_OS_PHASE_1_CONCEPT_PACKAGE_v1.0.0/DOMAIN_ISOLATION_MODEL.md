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
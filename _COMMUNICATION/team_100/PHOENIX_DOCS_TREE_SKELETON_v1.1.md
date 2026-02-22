# Phoenix Documentation Tree — Skeleton (Model B)
**project_domain:** TIKTRACK

> This is the **canonical skeleton** (not the full tree).  
> It defines **allowed top-level layers** and the **required sub-structure up to depth 3**.  
> **Binding authority:** `00_MASTER_INDEX.md`

---

## Root

```text
/
  documentation/
    docs-system/
    docs-governance/
    reports/
  _COMMUNICATION/
    _Architects_Decisions/
    _ARCHITECT_INBOX/
    team_10/
    team_20/
    team_30/
    team_40/
    team_50/
    team_60/
    team_70/
  archive/
    documentation_legacy/
    code_legacy/
```

### Root rules
- MUST keep **minimal root** (no extra top-level folders unless approved via Architect Decision + promoted to SSOT).
- MUST preserve separation:
  - `documentation/` = curated system + governance + reports
  - `_COMMUNICATION/` = operational comms artifacts (per team + architect channels)
  - `archive/` = historical snapshots / legacy code

---

## documentation/docs-system (System Documentation Only)

```text
documentation/docs-system/
  01-ARCHITECTURE/
    system/
    domain/
    technical-decisions/
  02-SERVER/
    api/
    services/
    business-logic/
    background-jobs/
  03-CLIENT/
    ui/
    components/
    state/
    routing/
  04-DATA/
    schema/
    migrations/
    market-data/
    snapshots/
  05-INTEGRATIONS/
    ibkr/
    yahoo/
    external-services/
  06-INFRA/
    deployment/
    environments/
    monitoring/
  07-DESIGN/
    ui-system/
    icons/
    branding/
  08-PRODUCT/
    roadmap/
    features/
    requirements/
  09-MARKETING/
    positioning/
    messaging/
    presentations/
```

**Rules**
- MUST contain only **system documentation** (no governance, no comms, no raw execution reports).
- MUST preserve the **Server/Client/Data/Integrations/Infra** separation.
- MAY add deeper subfolders under the defined areas.

---

## documentation/docs-governance (Governance + Procedures + Contracts)

```text
documentation/docs-governance/
  00-FOUNDATIONS/
    templates/
    standards/
  01-POLICIES/
    authority/
    naming/
    sealing/
  02-PROCEDURES/
    gates/
    knowledge-promotion/
    stage-process/
  06-CONTRACTS/
    team-contracts/
    interface-contracts/
  09-GOVERNANCE/
    matrices/
    drift-register/
    audits/
    team-playbooks/
```

**Rules**
- MUST contain governance and process docs only.
- Team Playbooks (internal team procedures) live under:
  `documentation/docs-governance/09-GOVERNANCE/team-playbooks/`

---

## documentation/reports (Execution + QA + Validation Outputs)

```text
documentation/reports/
  05-REPORTS/
    stage-closures/
    qa/
    validation/
  08-REPORTS/
    screenshots/
    logs/
    exports/
```

**Rules**
- MUST contain generated/produced outputs and evidence artifacts.
- MUST be easy to clean/rotate by stage (archive at stage closure).

---

## _COMMUNICATION (Operational Comms Layer)

```text
_COMMUNICATION/
  _Architects_Decisions/
    ADR-*.md
    POLICY-*.md
  _ARCHITECT_INBOX/
    submissions/
  team_10/
  team_20/
  team_30/
  team_40/
  team_50/
  team_60/
  team_70/
```

**Rules**
- MUST preserve the separation between:
  - **Architect inbox** (incoming submissions)
  - **Architect decisions** (locked decisions)
- Team folders are operational artifacts only (work plans, mandates, completion reports, gate requests).

---

## archive (Historical Only)

```text
archive/
  documentation_legacy/
    snapshots/
  code_legacy/
    snapshots/
```

**Rules**
- MUST NOT be used by active teams as authority.
- MUST be excluded from automation ingestion by default.

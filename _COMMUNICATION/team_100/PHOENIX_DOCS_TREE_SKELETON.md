# Phoenix Documentation Tree — Skeleton (SSOT)

> This is the **canonical skeleton** (not the full tree).  
> It defines **allowed top-level layers** and the **required sub-structure up to depth 3**.

---

## Root

```text
/
  docs-system/
  docs-governance/
  reports/
  logs/
  archive/
  _COMMUNICATION/
```

---

## docs-system (System Documentation Only)

```text
docs-system/
  00-OVERVIEW/
    <system-overview-docs>.md
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
- MUST contain only **system documentation** (no governance, no comms, no reports).
- MUST preserve the **Server/Client/Data/Integrations/Infra** separation.
- MAY add deeper subfolders, but **must not change** this depth-3 skeleton without an ADR.

---

## docs-governance (Governance Only)

```text
docs-governance/
  00-FOUNDATIONS/
    ADR_TEMPLATE_CANONICAL.md
    00_DOCUMENTATION_STANDARDS_INDEX.md
  01-POLICIES/
  02-PROCEDURES/
  03-WORKFLOW/
  04-QA/
  05-ROLE_DEFINITIONS/
  06-CONTRACTS/
  07-VERSIONING/
  08-STANDARDS/
  09-TEAM_PLAYBOOKS/
    team-10/
    team-20/
    team-30/
    team-40/
    team-50/
    team-60/
    team-70/
    team-90/
    team-100/
```

**Rules**
- MUST contain only **governance / decision-authority documents**.
- Team playbooks live under **09-TEAM_PLAYBOOKS/** (not in _COMMUNICATION).

---

## reports (Reports Only)

```text
reports/
  qa/
  development/
  architecture/
  performance/
```

**Rules**
- Reports are **ephemeral** and are cleaned/archived per stage.
- MUST NOT store architect decisions here.

---

## logs (Logs Only)

```text
logs/
  <runtime-or-process-logs>/
```

---

## archive (All Legacy Archives)

```text
archive/
  documentation_legacy/
  reports_legacy/
  code/
    tiktrack-v1/
    phoenix-legacy/
```

**Rules**
- Archive is **read-only** after placement.
- Archive can be extended, but must stay under archive/.

---

## _COMMUNICATION (Operational Communication Only)

```text
_COMMUNICATION/
  _Architects_Decisions/
  _ARCHITECT_INBOX/
  team-10/
  team-20/
  team-30/
  team-40/
  team-50/
  team-60/
  team-70/
  team-90/
  team-100/
```

**Rules**
- MUST contain only **communication artifacts**.
- **Decisions** go to `_Architects_Decisions/`.
- **Submissions to the Architect** go to `_ARCHITECT_INBOX/`.
- Team communication folders are cleaned/archived per stage.

---

## Change Control

Any structural change to this skeleton requires:
- an ADR (decision_type: DIRECTIVE or POLICY)
- Team 90 validation gate
- Team 10 publication/index sync

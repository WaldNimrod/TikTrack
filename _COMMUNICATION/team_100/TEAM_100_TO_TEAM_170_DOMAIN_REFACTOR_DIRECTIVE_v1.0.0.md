# TEAM_100_TO_TEAM_170_DOMAIN_REFACTOR_DIRECTIVE_v1.0.0

from: Team 100 (Development Architecture Lead)\
to: Team 170 (Librarian & Structural Custodian)\
project_domain: AGENTS_OS\
status: MANDATORY_ACTION\
version: 1.0.0

------------------------------------------------------------------------

## Objective

Perform full structural domain isolation between:

-   TIKTRACK
-   AGENTS_OS
-   SHARED

This is a structural refactor, not a documentation update.

------------------------------------------------------------------------

## Mandatory Actions

1.  Create physical root folder:

    /agents_os/

2.  Create required structure:

    agents_os/ documentation/ docs-system/ docs-governance/ runtime/
    validators/ orchestrator/ tests/

3.  Scan entire repository for artifacts referencing:

    -   Agent_OS
    -   Agents_OS
    -   Governance runtime logic

4.  Classify each artifact as:

    -   TIKTRACK
    -   AGENTS_OS
    -   SHARED

5.  Physically MOVE (not copy) AGENTS_OS artifacts under /agents_os/.

6.  Add mandatory header to ALL markdown documents:

    project_domain: TIKTRACK \| AGENTS_OS \| SHARED

7.  Consolidate legacy `_ARCHITECTURAL_INBOX` into canonical path:
    \_COMMUNICATION/\_ARCHITECT_INBOX/

8.  Produce final structural mapping report:
    DOMAIN_REFACTOR_COMPLETION_REPORT_v1.0.0.md

------------------------------------------------------------------------

## Constraints

-   No deletions without explicit archive placement.
-   No duplication allowed.
-   Every moved artifact must preserve provenance trail.
-   No governance logic may remain outside its domain root.

------------------------------------------------------------------------

## Deliverable

A validated structural report submitted to Team 190 for verification.

------------------------------------------------------------------------

END OF DIRECTIVE

---
project_domain: AGENTS_OS
id: TEAM_100_TO_TEAM_10_AOUI_F02_CSS_INDEX_MANDATE_DIRECTIVE_v1.0.0
from: Team 100 (Agents_OS Architectural Authority)
to: Team 10 (Implementation Coordinator)
cc: Team 170, Team 61, Team 00
date: 2026-03-14
status: DIRECTIVE_ISSUED
finding_id: AOUI-F02
in_response_to:
  - _COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_AGENTS_OS_UI_OPTIMIZATION_REMEDIATION_HANDOFF_v1.0.0.md
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| task_id | AGENTS_OS_UI_OPTIMIZATION |
| finding_id | AOUI-F02 |
| severity | LOW |

---

## Directive to Team 10

**Team 10** is directed to issue a mandate to **Team 170** to update `CSS_CLASSES_INDEX.md` after Team 61 completes and merges the Agents_OS UI optimization implementation.

---

## Background

Team 190 finding AOUI-F02 (LOW / ACTION_REQUIRED) identified that CSS class documentation alignment remains pending in the post-merge consolidation lane. Per Team 190's route recommendation: "Team 10 must issue mandate to Team 170 to update CSS_CLASSES_INDEX after merge."

This directive formalizes that instruction.

---

## Mandate Specification for Team 170

**Trigger:** Team 61's UI optimization implementation is merged — i.e., all CSS files in `agents_os/ui/css/` and all JS files in `agents_os/ui/js/` are finalized and merged into the main branch.

**Action required from Team 170:**

1. **Add all new Agents_OS CSS classes** from the following files to `documentation/docs-system/07-DESIGN/CSS_CLASSES_INDEX.md`:
   - `agents_os/ui/css/pipeline-shared.css`
   - `agents_os/ui/css/pipeline-dashboard.css`
   - `agents_os/ui/css/pipeline-roadmap.css`
   - `agents_os/ui/css/pipeline-teams.css`

2. **For each class:** document: class name, description, usage context (which HTML file / which component).

3. **Mark migrated inline classes:** If any classes from the old inline CSS were already referenced in `CSS_CLASSES_INDEX.md`, update their source path to point to the new external CSS files.

4. **Do not document JS files** — this mandate covers CSS classes only.

---

## Scope Boundaries

| In scope | Out of scope |
|---|---|
| New classes in `pipeline-*.css` files | JS function documentation (separate task) |
| Updated source paths for migrated classes | Dashboard/Roadmap/Teams HTML structure changes |
| Agents_OS section in CSS_CLASSES_INDEX | TikTrack CSS classes |

---

## Priority and Timing

| Field | Value |
|---|---|
| Priority | LOW |
| Timing | Post-merge — does NOT block Team 61 implementation |
| Deadline | Within 1 session after Team 61 merge is confirmed complete |
| Blocking? | No — this is consolidation-lane governance only |

---

**log_entry | TEAM_100 | AOUI_F02_CSS_INDEX_MANDATE_DIRECTIVE | ISSUED_TO_TEAM_10 | 2026-03-14**

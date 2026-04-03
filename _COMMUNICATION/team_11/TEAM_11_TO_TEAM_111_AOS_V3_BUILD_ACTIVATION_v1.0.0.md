---
id: TEAM_11_TO_TEAM_111_AOS_V3_BUILD_ACTIVATION_v1.0.0
historical_record: true
from: Team 11 (AOS Gateway / Execution Lead)
to: Team 111 (AOS Domain Architect — DDL / DB schema)
cc: Team 100 (Chief Architect), Team 61 (AOS DevOps), Team 21 (AOS Backend)
date: 2026-03-27
type: BUILD_ACTIVATION — DDL v1.0.2 mandate (GATE_0 hard blocker)
domain: agents_os
branch: aos-v3
authority: TEAM_00_TO_TEAM_11_AOS_V3_BUILD_WORK_PACKAGE_v1.0.3.md---

# TEAM 11 → TEAM 111 | AOS v3 BUILD | DDL v1.0.2 mandate

## Layer 1 — Identity

| Field | Value |
|------|--------|
| Team ID | `team_111` |
| Role | AOS Domain Architect — authoritative DDL and schema evolution for AOS v3 |
| Domain | **agents_os only** — do not modify TikTrack |
| Engine | Cursor Composer (per roster) |
| Gateway | Team 11 issues this mandate; Team 61 applies migrations at GATE_0 after your delivery |

**You do not:** implement FastAPI routes, `use_cases.py`, or UI (Teams 21 / 31 / 61).

---

## Layer 2 — Iron Rules (subset)

| ID | Rule |
|----|------|
| **IR-2** | `agents_os_v2/` is **frozen** — read-only reference. |
| **IR-3** | Any new artifact paths under `agents_os_v3/` used for DDL scripts must be registered in `FILE_INDEX.json` before commit (typically coordinated with Team 61). |
| **IR-5** | Money: NUMERIC(20,8); market_cap: NUMERIC(24,4) where applicable. |

Escalation: spec/schema ambiguity → **Team 100**.

---

## Layer 3 — Context

**SSOT (read before authoring DDL v1.0.2):**

- `_COMMUNICATION/team_111/TEAM_111_AOS_V3_DDL_SPEC_v1.0.1.md` (base + DDL-ERRATA-01)
- `_COMMUNICATION/team_100/TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.1.1.md` §13 — `pending_feedbacks` / FeedbackRecord shape
- WP v1.0.3 Part D.5 (this mandate itemizes the delta below)

**DB naming (mandatory):** `work_packages.id` = primary key (TEXT). **No column named `wp_id` in DB.** API field `wp_id` is application-layer alias only (WP D.5).

---

## Layer 4 — Task: DDL v1.0.2 scope (five items)

Deliver **DDL v1.0.2** as migration-ready artifacts (SQL or equivalent) plus a short change note (what changed vs v1.0.1) so Team 61 can apply at GATE_0.

| # | Item | Description |
|---|------|-------------|
| 1 | **DDL-ERRATA-01** | Cumulative errata per DDL Spec v1.0.1 errata sections |
| 2 | **`ideas` amendments** | Add: `domain_id` (TEXT FK), `idea_type` (TEXT), `decision_notes` (TEXT NULL) |
| 3 | **`work_packages` (NEW)** | PK `id TEXT NOT NULL`; columns: `label`, `domain_id` (FK), `status` with CHECK, `linked_run_id` (FK → `runs.id`), `created_at`, `updated_at` |
| 4 | **`pending_feedbacks` (NEW)** | Full FeedbackRecord store per Stage 8B spec v1.1.1 §13 |
| 5 | **`teams.engine`** | `ALTER` teams: `ADD COLUMN engine VARCHAR(50) NOT NULL DEFAULT 'cursor'` |

**Acceptance (Team 11 / GATE_0):**

- Migrations apply cleanly on target PostgreSQL (empty → v1.0.2).
- Artifacts referenced or handed off to Team 61 with explicit apply order.
- No drift from WP D.5 naming rule for `work_packages` / `wp_id`.

**Handoff:** Notify Team 11 when DDL v1.0.2 is ready; Team 11 unblocks Team 61 GATE_0 activation execution.

---

**log_entry | TEAM_11 | AOS_V3_BUILD | TEAM_111_DDL_v1.0.2_MANDATE | ISSUED | 2026-03-27**

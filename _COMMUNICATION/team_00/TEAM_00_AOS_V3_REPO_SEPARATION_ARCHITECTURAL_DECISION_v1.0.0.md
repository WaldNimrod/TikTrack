---
**project_domain:** AGENTS_OS
**id:** TEAM_00_AOS_V3_REPO_SEPARATION_ARCHITECTURAL_DECISION_v1.0.0
date: 2026-04-02
historical_record: true
**from:** Team 00 (Nimrod — System Designer)
**to:** Team 11, Team 191
**date:** 2026-03-29
**status:** DECISION_ISSUED
**context:** AOS v3 test flight S003-P005 — architectural decision on AOS/TikTrack repository separation---

# AOS v3 — Repository Separation: Architectural Decision

## 1. Context

AOS v3 (`agents_os_v3/`) and TikTrack (`api/`, `ui/`) share a single git repository at `git@github.com:WaldNimrod/TikTrack.git`.

| Current State | Detail |
|---|---|
| Remote | `git@github.com:WaldNimrod/TikTrack.git` (single) |
| CI | `aos-v3-tests.yml` fully independent from TikTrack CI |
| DB | `AOS_V3_DATABASE_URL` separate from `DATABASE_URL` |
| Code | `agents_os_v3/` isolated from `api/` + `ui/` |
| Shared | `scripts/`, `documentation/`, `_COMMUNICATION/`, `.pre-commit-config.yaml` |

**Long-term goal (Nimrod):** AOS should become a fully independent, reusable framework deployable as a standalone instance for multiple projects (TikTrack, ProjectB, etc.).

---

## 2. Decision

### Immediate (before merge to main)

**→ Option A: Status Quo + GitHub Branch Protection**

No repository restructuring. Add GitHub branch protection rules after the test flight completes and before merging `aos-v3` to `main`:
- `main`: block direct changes to `agents_os_v3/**` (require PR + review)
- `aos-v3`: soft boundary — block changes to `api/`, `ui/` (enforced via pre-commit process-functional-separation guard)
- All merges to `main` via PR only

**Actions (Team 191, post-test-flight):**
1. Create PR: `aos-v3` → `main`
2. Enable branch protection on `main`: require PR + 1 review approval
3. Document in `TEAM_00_TO_TEAM_191_AOS_V3_GIT_GOVERNANCE_CANONICAL_v1.1.0.md` §4

This takes zero migration effort and does not disturb the active test flight.

---

### S004 (post-v2 release)

**→ Option B: Subtree Push to Separate AOS Repo**

After S003 completes and v2 of TikTrack is released, create a separate GitHub repository `WaldNimrod/agents-os` and push `agents_os_v3/` subtree there.

```bash
git remote add agents-os-remote git@github.com:WaldNimrod/agents-os.git
git subtree push --prefix=agents_os_v3 agents-os-remote main
```

AOS CI, versioning, and releases become independent. TikTrack continues with the existing monorepo but AOS has its own public face.

**Scope for S004-P00X WP:**
- Git subtree setup + push
- CI decoupling (`aos-v3-tests.yml` → AOS repo, removed from TikTrack)
- Documentation migration (`documentation/docs-agents-os/` subtree)
- Canary simulation scripts separation

**Registered in pipeline:** Idea `01KMXVD3QCB1JD5Y9WWJ0DHYRT` (AOS domain, TECH_DEBT, HIGH priority, status: NEW)

---

### S005+ (future)

**→ Option C: Full Extraction as Python Package**

Full extraction of `agents_os_v3/` to `WaldNimrod/agents-os` with `pyproject.toml`, published on PyPI or installable via git:

```
pip install agents-os
# or
git submodule add https://github.com/WaldNimrod/agents-os
```

Architecture:
```
WaldNimrod/agents-os          ← framework (independent)
WaldNimrod/TikTrack           ← uses agents-os as dependency
WaldNimrod/ProjectB-instance  ← uses agents-os as dependency
```

Prerequisite: AOS v3 API must be stable (no breaking changes expected) before extraction. Requires dedicated Work Package in S004+.

---

## 3. Recommendation Summary

| Stage | Action | Timing |
|---|---|---|
| **Now** | Option A — GitHub branch protection | Post test-flight, pre-merge to main |
| **S004** | Option B — Subtree push to `WaldNimrod/agents-os` | Post v2 release |
| **S005+** | Option C — Full package extraction | After API stability confirmed |

---

## 4. Future WP Registration

**WP registered as pipeline idea:**
- idea_id: `01KMXVD3QCB1JD5Y9WWJ0DHYRT`
- title: `S004: AOS Extraction to Standalone Repository`
- domain: `agents_os` (`01JK8AOSV3DOMAIN00000001`)
- type: `TECH_DEBT` | priority: `HIGH` | status: `NEW`

When S003 closes and S004 planning begins, this idea should be converted to a formal Work Package via the pipeline `uc_03_start_run` flow with program assignment.

---

**log_entry | TEAM_00 | REPO_SEPARATION_DECISION | ISSUED | 2026-03-29**

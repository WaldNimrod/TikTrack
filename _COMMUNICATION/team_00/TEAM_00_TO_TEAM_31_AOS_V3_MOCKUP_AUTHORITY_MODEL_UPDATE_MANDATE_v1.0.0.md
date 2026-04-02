---
id: TEAM_00_TO_TEAM_31_AOS_V3_MOCKUP_AUTHORITY_MODEL_UPDATE_MANDATE_v1.0.0
historical_record: true
from: Team 00 (Principal — Nimrod)
to: Team 31 (AOS Frontend / Mockup)
cc: Team 11 (AOS Gateway), Team 100 (Chief Architect)
date: 2026-03-28
type: MOCKUP_UPDATE_MANDATE — surgical changes only; zero regression
spec_basis: TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.0.3.md (AM-01)
authority: ARCHITECT_DIRECTIVE_AUTHORITY_MODEL_v1.0.0.md
prior_mockup: TEAM_31_AOS_V3_UI_MOCKUPS_EVIDENCE_v2.0.0.md---

# Team 00 → Team 31 | Mockup Update Mandate — Authority Model v1.0.0

## Summary

Two changes to the Teams page mockup, driven by UI Spec Amendment v1.0.3 AM-01.
All other mockup content — including every action button and user option — is unchanged.

**Iron Rule (Team 00):** כל האופציות למשתמש נשמרות. אין הסרה של כפתורים, פעולות, או יכולות. השינוי הוא הסרת שדה אחד ופקד אחד בלבד.

---

## Context

UI Spec v1.0.3 §4.13 (AM-01) removed `is_current_actor` from the GET /api/teams response.

**Rationale (Team 00):** עמוד Teams = ניהול צוותות סטטי. מצב pipeline מוצג בעמודים אחרים. הצגת מצב ריצה בעמוד Teams = overhead מיותר שמסבך ללא תועלת.

The field and all UI elements that depend on it must be removed from the mockup.

---

## Change 1 — Remove "Current actor only" filter checkbox

**File:** `agents_os_v3/ui/teams.html`

**Location:** Lines 64–67

**Remove entirely:**
```html
<label class="aosv3-team-checkbox-label">
  <input type="checkbox" id="aosv3-team-filter-current" />
  Current actor only
</label>
```

**Result:** The filter toolbar retains the Group dropdown (All / AOS+cross / TikTrack lane / Cross-domain only). Only the `is_current_actor` checkbox is removed.

---

## Change 2 — Remove `is_current_actor` from app.js (7 locations)

**File:** `agents_os_v3/ui/app.js`

### 2a — MOCK_TEAMS data (lines 843–854)
Remove `is_current_actor: false` (or `true`) from every team object.

**Before (example):**
```js
{ team_id: "team_61", ..., has_active_assignment: true, is_current_actor: true },
```
**After:**
```js
{ team_id: "team_61", ..., has_active_assignment: true },
```
Apply to all 12 team entries in `MOCK_TEAMS.teams`.

---

### 2b — curOnly variable declaration (line 2452)
**Remove:**
```js
var curOnly = document.getElementById("aosv3-team-filter-current");
```

---

### 2c — Assignment status text in context panel (lines 2389–2392)
**Remove** the ternary line entirely:
```js
lines.push(
  team.is_current_actor
    ? "Assignment: You are the CURRENT ACTOR"
    : "Assignment: Not the current actor for this mock run."
);
```
The `recentEventsForActor` call on the line immediately after is unaffected.

---

### 2d — filterTeam() guard (line 2476)
**Remove:**
```js
if (curOnly && curOnly.checked && !t.is_current_actor) return false;
```
The remaining filter conditions (group, domain_scope) are unchanged.

---

### 2e — Detail panel `is_current_actor` row (lines 2609–2613)
**Remove** the `<dt>`/`<dd>` pair:
```js
"<dt>is_current_actor</dt><dd>" +
(team.is_current_actor
  ? '<span class="aosv3-status-badge aosv3-status--in_progress">yes</span>'
  : '<span class="aosv3-status-badge aosv3-status--idle">no</span>') +
"</dd>" +
```
The `has_active_assignment` row immediately above it remains.

---

### 2f — Star badge in roster row (lines 2745–2747)
**Remove** the star declaration and its usage in `btn.innerHTML`:
```js
var star = t.is_current_actor
  ? '<span class="aosv3-team-row-star" title="current actor">★</span>'
  : "";
```
And remove `+ star +` (or `star +`) from the `btn.innerHTML` concatenation below it.
The `dot` variable (has_active_assignment indicator) is unchanged — keep the green dot.

---

### 2g — curOnly event listener (line 2779)
**Remove:**
```js
if (curOnly) curOnly.addEventListener("change", renderRoster);
```

---

## What does NOT change

| Item | Status |
|------|--------|
| All action buttons (Start Run, Advance, Fail, Approve, Pause, Resume, Override, Edit Engine, etc.) | ✅ Unchanged |
| `has_active_assignment` field and green dot indicator | ✅ Unchanged |
| Group filter dropdown (All / AOS+cross / TikTrack lane / Cross-domain) | ✅ Unchanged |
| Organization tree (sidebar) | ✅ Unchanged |
| Context panel (Layer 1 card, assignments, recent events) | ✅ Unchanged except 2c, 2e |
| All other pages (runs, history, portfolio, config) | ✅ Unchanged |
| Error messages / authorization UI | ✅ No mockup changes needed (INSUFFICIENT_AUTHORITY is backend; no new UI strings) |

---

## Acceptance Criteria

| # | Check | Expected |
|---|-------|----------|
| AC-01 | "Current actor only" checkbox | Not present anywhere in teams.html or rendered Teams page |
| AC-02 | Team detail panel | No `is_current_actor` row in the `<dl>` block |
| AC-03 | Team roster rows | No star (★) badge on any team row |
| AC-04 | MOCK_TEAMS | No `is_current_actor` key in any team object |
| AC-05 | Group filter | Dropdown still present with all 4 options |
| AC-06 | `has_active_assignment` dot | Green dot still present where applicable |
| AC-07 | No console errors | No `curOnly` or `is_current_actor` references remain in JS |
| AC-08 | All action buttons | Every action button and user option present as before |

---

## Handoff

Deliver updated mockup evidence to `_COMMUNICATION/team_31/` as `TEAM_31_AOS_V3_UI_MOCKUPS_EVIDENCE_v2.1.0.md` (or equivalent patch note).
Notify Team 11 when complete.

---

**log_entry | TEAM_00 | MOCKUP_UPDATE_MANDATE | TEAM_31 | AUTHORITY_MODEL_AM01 | 2026-03-28**

---
**project_domain:** TIKTRACK
**id:** ARCHITECT_GATE7_REMEDIATION_FRAME_S002_P003_WP002_v1.0.0
**from:** Team 00 (Chief Architect)
**to:** Team 90 (External Validation Unit — conversion to execution package)
**cc:** Team 10 (Execution, for awareness), Team 100 (awareness)
**date:** 2026-03-04
**status:** APPROVED — EXECUTION AUTHORIZED
**gate_id:** POST_G7_REJECTION_PREP
**work_package_id:** S002-P003-WP002
**in_response_to:** TEAM_90_PRE_REMEDIATION_ALIGNMENT_SUBMISSION_S002_P003_WP002_v1.2.0
---

# ARCHITECT DECISION — GATE_7 REMEDIATION FRAME APPROVAL
## S002-P003-WP002 | D22 + D33 + D34 + D35

---

## §1 SUBMISSION ASSESSMENT

Team 90's v1.2.0 unified pre-remediation alignment submission is **structurally sound**.

| Assessment dimension | Verdict |
|---|---|
| GATE_7 rejection correctly normalized | ✅ PASS |
| Route classification (CODE_CHANGE_REQUIRED + PRE_REMEDIATION_ALIGNMENT) | ✅ PASS |
| Direct Team 10 execution correctly blocked pending framing | ✅ PASS |
| Impact map (domains A–F) correctly identifies all major structural gaps | ✅ PASS |
| 12 locked decisions carried forward correctly | ✅ PASS |
| 5 open architect completion items correctly isolated | ✅ PASS |
| Four-stream execution structure is logical and non-redundant | ✅ PASS |
| Deferred carryover (global top-filter) correctly classified as non-blocking | ✅ PASS |

**Codebase review findings (2026-03-04):** Before issuing this decision, Team 00 performed a direct read of the alerts schema, notes schema, and UI implementation. Several of the 5 open items are already partially implemented in code. The locked specs below supersede or extend the existing implementation where needed.

---

## §2 ARCHITECTURAL FINDINGS FROM CODEBASE REVIEW

The following is the factual state of the implementation, as read from source on 2026-03-04:

### 2.1 Alerts — Current Schema (alerts.py)

| Field | Current state |
|---|---|
| `target_type` | String(50): ticker \| trade \| trade_plan \| account \| **general** |
| `target_id` | UUID optional |
| `ticker_id` | UUID FK (denormalized; set when target_type=ticker) |
| `alert_type` | ENUM: PRICE \| VOLUME \| TECHNICAL \| NEWS \| CUSTOM |
| `condition_field` | String(50): already constrained to 7 fields (see §3A) |
| `condition_operator` | String(20): already constrained to 7 operators (see §3A) |
| `condition_value` | NUMERIC(20,8) |
| `is_active` | Boolean (true/false) |
| `is_triggered` | Boolean |
| `trigger_status` | String(20): untriggered \| triggered_unread \| triggered_read |
| `expires_at` | TIMESTAMPTZ optional |
| `metadata_` | JSONB optional |

**Missing fields (requires migration):** `target_datetime` TIMESTAMPTZ NULL

### 2.2 Notes — Current Schema (notes.py)

| Field | Current state |
|---|---|
| `parent_type` | String(50): trade \| trade_plan \| ticker \| account (no "general" — already correct) |
| `parent_id` | UUID optional |
| `content` | Text (rich HTML) |
| `tags` | ARRAY String optional |
| `metadata_` | JSONB optional |
| NoteAttachment | Separate table — exists, correct |

**Missing fields (requires migration):** `parent_datetime` TIMESTAMPTZ NULL

### 2.3 Condition Builder — Current UI (alertsForm.js)

The 3-field condition builder (field dropdown + operator dropdown + numeric input) **already exists** in the codebase. The 7 condition fields and 7 operators are defined and wired. The GATE_7 finding was about:
- Missing validation (can submit with partial condition)
- Missing formatted display in table and detail modal
- Incomplete Hebrew labeling of operators in display contexts

**Finding: the structural model is correct. Only validation + display logic requires completion.**

### 2.4 Details Modal — Current Patterns

Both alerts and notes use the `.phoenix-form` + `.form-group` modal pattern — **this is the canonical blueprint, already in use.** The GATE_7 issue was incomplete field coverage in the modal (missing fields, missing linked-entity display).

---

## §3 LOCKED SPECS — THE 5 OPEN ARCHITECT COMPLETION ITEMS

### §3A — D34 Condition Builder (Item A)

**Status: FULLY LOCKED**

#### Condition field set (MVP — WP002 scope)

| value | Hebrew label | Metric family |
|---|---|---|
| `price` | מחיר (אחרון) | Price |
| `open_price` | מחיר פתיחה | Price |
| `high_price` | מחיר גבוה | Price |
| `low_price` | מחיר נמוך | Price |
| `close_price` | מחיר סגירה | Price |
| `volume` | נפח מסחר | Volume |
| `market_cap` | שווי שוק | Market |

**Scope note:** Indicator-family fields (ATR, MA, CCI) are S004-P007 scope. Not in WP002.

#### Operator set (complete — no changes)

| value | Hebrew display label |
|---|---|
| `>` | גדול מ |
| `>=` | גדול מ או שווה |
| `<` | קטן מ |
| `<=` | קטן מ או שווה |
| `=` | שווה ל |
| `crosses_above` | חצה מעל |
| `crosses_below` | חצה מתחת |

#### Validation rule (IRON RULE)

All three condition fields (field + operator + value) must be either **all set** or **all empty**. Partial condition (e.g., field set but no value) is a validation error. Backend and frontend must both enforce this.

#### Condition display (table + detail modal)

- When condition is set: display as formatted string: `{field_label} {operator_label} {value}`
  - Example: "מחיר חצה מעל 150.00"
  - Example: "נפח מסחר גדול מ 1,000,000"
- When condition is empty: display "ללא תנאי"
- No truncation — display full string (condition strings are short)

#### Multiple conditions per alert

Deferred to S004+. One condition per alert is the WP002 scope. The existing single-condition schema is correct.

#### UI interaction pattern

Existing 3-field builder in `alertsForm.js` is the canonical pattern. No redesign needed. Required improvements:
1. Hebrew operator labels in the SELECT options (not just symbol characters)
2. Validation: disable Save if partial (gray out or inline error)
3. Condition field group must have a tooltip: "הגדרת תנאי — כל שלושת השדות חובה או אף אחד"

---

### §3B — Datetime Linkage Contract for D34 / D35 (Item B)

**Status: FULLY LOCKED**

#### Principle

Both alerts and notes may link to either:
1. **A specific entity** (ticker, trade, trade_plan, account) — entity linkage
2. **A specific date + time** — temporal linkage

Neither is mandatory. A note or alert with no linkage is valid.

#### Standalone datetime (without entity linkage)

**ALLOWED.** A note or alert may reference only a datetime (e.g., "market open on 2026-03-04 09:30 EST") without any entity linkage. This is a valid business use case.

#### Schema changes required

**Alerts:**
```sql
ALTER TABLE user_data.alerts
ADD COLUMN target_datetime TIMESTAMPTZ NULL;
```
Constraint: if `target_type = 'datetime'` then `target_datetime` IS NOT NULL. If `target_type` ∈ {ticker, trade, trade_plan, account} then `target_id` IS NOT NULL.

**Notes:**
```sql
ALTER TABLE user_data.notes
ADD COLUMN parent_datetime TIMESTAMPTZ NULL;
```
Constraint: if `parent_type = 'datetime'` then `parent_datetime` IS NOT NULL. If `parent_type` ∈ {ticker, trade, trade_plan, account} then `parent_id` IS NOT NULL.

**Validation rule:** target_type/parent_type and the corresponding ID/datetime field must be consistent. Mixed state (datetime type + entity_id set) is an error.

#### Target type values — updated

**Alerts `target_type`:** ticker | trade | trade_plan | account | datetime | NULL
**"general" is REMOVED** (see §4 additional finding).

**Notes `parent_type`:** ticker | trade | trade_plan | account | datetime | NULL
(Notes already had no "general" — this is correct and confirmed.)

#### Timezone handling

- Storage: always UTC in DB (`TIMESTAMPTZ`)
- Display: convert to user's timezone preference (from cached D39 preferences)
- Display format: `DD/MM/YYYY HH:MM (TZ)` — example: "04/03/2026 09:30 (EST)"
- Input: user enters in their preferred timezone; frontend converts to UTC before API submission

---

### §3C — Alert Lifecycle Expansion (Item C)

**Status: LOCKED — baseline sufficient for WP002, minimal targeted addition**

#### Baseline (confirmed sufficient for WP002)

| State | Description | Implementation |
|---|---|---|
| **active** | Monitoring, not triggered | is_active=true, trigger_status=untriggered |
| **triggered_unread** | Condition met, not yet seen | trigger_status=triggered_unread |
| **triggered_read** | Seen, can be rearmed | trigger_status=triggered_read |
| **rearmed** | Re-armed after trigger — monitoring again | trigger_status=**rearmed** (new) |
| **cancelled** | Permanently disabled | is_active=false |

#### Required change: add `rearmed` to trigger_status

`trigger_status` currently: `untriggered | triggered_unread | triggered_read`

Add: `rearmed`

**Rearmed lifecycle:**
- User clicks "חמש" (rearm) on a triggered_read alert
- System: PATCH trigger_status = `rearmed` (NOT back to `untriggered`)
- The `rearmed` state means: "was triggered, user acknowledged, now monitoring again"
- Next time condition fires: goes to `triggered_unread` again

**Why distinguish rearmed from untriggered:** Analytics and audit benefit. Rearmed alerts have a history; untriggered is the fresh state.

#### No new status ENUM needed

`is_active = false` is sufficient to represent "cancelled/inactive" in WP002. A formal `status` column ENUM expansion (with cancelled as a distinct database enum value, per the 4-state Iron Rule) is **S004 scope**. For WP002:
- Display "מבוטל" in UI when `is_active = false`
- Display "פעיל" when `is_active = true` and `trigger_status = untriggered`
- Display "פעיל (חמוש מחדש)" when `is_active = true` and `trigger_status = rearmed`

#### No expansion beyond this in WP002

Advanced states (e.g., `expired`, `snoozed`) are deferred to S004+.

---

### §3D — Details Modal Blueprint (Item D)

**Status: FULLY LOCKED**

#### Canonical blueprint source

The existing `.phoenix-form` + `.form-group` pattern **IS** the canonical blueprint. Already implemented in both alerts and notes. No new design system needed.

**Reference implementation (use as-is):**
- Alerts: `alertsTableInit.js` `handleViewAlert()` function — `.phoenix-form` wrapper
- Notes: `notesTableInit.js` `handleViewNote()` function — `.phoenix-form` wrapper

#### Required completeness — Alert details modal

The existing implementation is **incomplete**. Required fields in the alert details modal:

| Field | Requirement |
|---|---|
| כותרת | Title (required) |
| סוג התראה | alert_type badge (PRICE/VOLUME/TECHNICAL/NEWS/CUSTOM) |
| מקושר ל | Entity icon + entity name (ticker symbol, trade title, etc.) + clickable link to entity page; OR formatted datetime if target_type=datetime |
| תנאי | Formatted condition string ("מחיר חצה מעל 150.00") or "ללא תנאי" |
| עדיפות | priority badge (LOW=אפור / MEDIUM=כחול / HIGH=כתום / CRITICAL=אדום) |
| סטטוס | is_active badge ("פעיל" / "מבוטל") |
| מצב הפעלה | trigger_status Hebrew badge |
| הופעל ב | triggered_at formatted (only if triggered) |
| תפוגה | expires_at formatted (only if set) |
| נוצר / עודכן | created_at + updated_at |
| כפתור חמש | Rearm button — shown ONLY when trigger_status = triggered_read |

#### Required completeness — Note details modal

| Field | Requirement |
|---|---|
| כותרת | Title if present; omit row if empty |
| מקושר ל | Entity icon + entity name + clickable link; OR formatted datetime; OR "ללא קישור" |
| תגיות | Tags as badges (only if tags array is non-empty) |
| נוצר / עודכן | created_at + updated_at |
| תוכן | Full rendered rich text HTML in scrollable container (max-height: 300px) |
| קבצים מצורפים | List each attachment: [file type icon] filename (click to download). If empty: "אין קבצים מצורפים" |

#### Linked entity display — IRON RULE

In both table view and details modal, linked entity must display as:
```
[type-icon] [entity-name]
```
where `entity-name` is the actual name/symbol of the referenced record — NOT the raw `target_type` string.

- `target_type=ticker` → show ticker_symbol (e.g., "📈 AAPL")
- `target_type=trade` → show trade title or ID (e.g., "📋 Trade #47")
- `target_type=datetime` → show formatted datetime (e.g., "📅 04/03/2026 09:30")
- target_type is NULL → show "—"

Backend must return resolved entity names in list + detail API responses (eager load or annotation).

---

### §3E — Refresh Token Technical Behavior (Item E)

**Status: FULLY LOCKED — Option A, strict UX logout**

#### Canonical rule

Once the 24-hour access token expires, the user is treated as **immediately logged out**. No silent refresh is permitted after expiry detection.

#### Implementation spec

| Moment | Required behavior |
|---|---|
| **App boot** | Decode JWT from localStorage. Compare `exp` claim to `Date.now() / 1000`. If expired → clear auth state → redirect to `/login`. Preserve only `usernameOrEmail` in localStorage. |
| **Proactive refresh window** | If `exp - now <= 300 seconds` (5 minutes) AND token not yet expired → trigger silent refresh. This is the ONLY window where refresh is permitted. |
| **401 from backend** | Clear auth state immediately. Redirect to `/login`. No refresh attempt. |
| **403 from backend** | Handle as access denied (not session expiry). Do NOT clear auth. |
| **After redirect to login** | Populate `usernameOrEmail` field from localStorage (remember-me). Password field empty. |

#### What is NOT permitted

- Showing user as "logged in" in the nav/UI while holding an expired token
- Attempting token refresh after detecting local expiry
- Storing any field other than `usernameOrEmail` as persisted identity

#### Implementation location (guidance for Team 10)

- App boot check: in the main auth initialization module (likely `auth.js` or `main.js` app init flow)
- 401 handler: in the axios/fetch interceptor
- Proactive refresh: in the auth service, scheduled against the token `exp` claim

---

## §4 ADDITIONAL ARCHITECTURAL FINDINGS (from codebase review)

These are not in Team 90's 5 open items but are required corrections:

### §4.1 Remove "general" from alert target_type — MANDATORY

Current `target_type` in alerts accepts `general` as a valid value. This is **removed** per locked decision #4.

**Implementation:**
- Backend: remove `general` from validation/allowlist in `alerts.py` model and router schema
- No DB migration required (String(50) column — just remove from application validation)
- Data migration: if any existing alerts have `target_type = 'general'`, SET `target_type = NULL` and `target_id = NULL`
  ```sql
  UPDATE user_data.alerts SET target_type = NULL, target_id = NULL WHERE target_type = 'general';
  ```
- Frontend: remove "כללי" option from the target_type dropdown

### §4.2 Linked entity identifier — read-only in edit mode

When editing an existing alert or note, the `target_type` / `parent_type` field must be **read-only** (display as a badge or locked SELECT). The linked entity was established at creation and cannot be changed on edit.

**Exception:** allowed to clear the linkage entirely (set both fields to NULL). But changing from ticker→trade is NOT permitted in edit mode.

### §4.3 Alert edit — linked object update bug

Finding 9 from GATE_7: "Alert edit does not persist linked-object updates." This is consistent with finding §4.2 — if target_type is read-only in edit, this behavior is implicitly resolved. Confirm that the edit PATCH endpoint correctly persists all editable fields (title, message, condition, priority, is_active, expires_at) and ignores target_type/target_id changes.

### §4.4 Alert internal filter — must be functional

Finding 8 from GATE_7: "Alert internal filter not functioning." The filter (all alerts / active / triggered) must be wired to the API with the correct query parameters. Verify: `GET /api/v1/alerts/?is_active=true` and `GET /api/v1/alerts/?trigger_status=triggered_unread` work and the UI filter buttons pass these params.

### §4.5 D33 canonical ticker-link flow

D33 (`/me/tickers`) must use:
1. **Lookup:** Search for existing system ticker by symbol. If found → link (POST `/me/tickers` with existing ticker_id).
2. **Create-via-canonical:** If no system ticker exists → create via the D22 canonical flow (same backend create-ticker endpoint), then link.

There must be **one** backend create-system-ticker path. D33 is not permitted to have its own parallel create flow.

### §4.6 Attachment proof standard

- At least one full round-trip must be verifiable: create note → upload file → verify file persisted → load note → verify attachment visible → remove attachment → verify removal persisted
- File size limit: 1MB per file, 3 files per note (already implemented in `notesForm.js` — confirm backend enforces same limits)

---

## §5 EXECUTION STREAMS — CONFIRMED WITH ADDITIONS

The four streams proposed by Team 90 are confirmed. Team 00 adds precision:

### Stream 1 — Canonical data-flow alignment
1. Unify system ticker creation (one path, D22 canonical endpoint)
2. Convert D33 `/me/tickers` to lookup + link, with create-via-canonical fallback
3. Data migration: existing alerts with `target_type='general'` → set to NULL
4. Add `target_datetime` TIMESTAMPTZ NULL to alerts table
5. Add `parent_datetime` TIMESTAMPTZ NULL to notes table
6. Add 'rearmed' to `trigger_status` accepted values

### Stream 2 — Semantic model completion
1. Enforce condition builder validation (all-three-or-none)
2. Condition display formatted string (table + detail modal)
3. Linked entity display (icon + name in table rows + details modal — not just type string)
4. Alert lifecycle: add 'rearmed', confirm is_active=false = "cancelled" display
5. D35 inherits D34 linkage rules: parent_type cannot be changed on edit; 'datetime' type added

### Stream 3 — UX/system consistency
1. Add-button standard: icon + Hebrew label on all pages (D22, D33, D34, D35)
2. Action-menu tooltips: every action icon/button must have a `title` attribute or tooltip
3. Copy normalization: ביטול / אשר / שמור / מחק / ערוך consistent across all entity forms
4. Alert details modal: complete to §3D required fields
5. Note details modal: complete to §3D required fields
6. linked entity display: icon + name in both table rows and details modals
7. target_type/parent_type: read-only in edit mode; can only be cleared (set to NULL), not changed

### Stream 4 — Auth/session behavior alignment
1. App boot: JWT expiry check → redirect + clear state (preserve usernameOrEmail)
2. 401 handler: immediate redirect, no refresh
3. Proactive refresh: only in 5-minute window before expiry
4. UI: no "logged in" state visible when holding expired token

---

## §6 SCOPE INCLUSIONS / EXCLUSIONS

### In scope — WP002 remediation

| Item | Status |
|---|---|
| D22 ticker creation canonicalization | IN SCOPE |
| D33 lookup+link flow | IN SCOPE |
| Remove "general" from alert target_type | IN SCOPE |
| Add datetime linkage (target_datetime / parent_datetime) | IN SCOPE |
| Condition builder validation + display | IN SCOPE |
| Add 'rearmed' trigger_status value | IN SCOPE |
| Linked entity display (icon + name) | IN SCOPE |
| Details modal completeness (all required fields) | IN SCOPE |
| Add-button standardization | IN SCOPE |
| Action-menu tooltips | IN SCOPE |
| Copy normalization | IN SCOPE |
| D35 inherits D34 linkage rules | IN SCOPE |
| Attachment full round-trip proof | IN SCOPE |
| target_type read-only in edit mode | IN SCOPE |
| Alert filter wiring | IN SCOPE |
| Auth/session token expiry behavior | IN SCOPE |

### Out of scope — deferred

| Item | Deferred to |
|---|---|
| Global top-filter cross-page unification | Completion gaps track (post-S003) |
| Multiple conditions per alert | S004+ |
| Alert notification delivery (email/push) | Post-S003 |
| Formal `status` ENUM 4-state for alerts | S004 |
| Advanced alert states (expired, snoozed) | S004+ |
| Indicator-family condition fields (ATR, MA, CCI) | S004-P007 |

---

## §7 DECISION

**APPROVED.**

The unified remediation frame submitted by Team 90 (v1.2.0) is approved with the locked specifications in §3 above.

Team 90 is authorized to convert this frame into **one structured execution package** for Team 10.

### Execution authorization conditions

1. The execution package must include all 4 streams
2. The execution package must reference this document as the authoritative spec
3. All locked specs in §3 must be preserved without modification in the execution package
4. Team 10 must not begin implementation until the execution package is formally issued
5. Re-entry cycle after implementation: GATE_4 → GATE_5 (Team 90) → GATE_6 → GATE_7

### Gate sequence after remediation

```
Current state: GATE_7 REJECTED
→ Team 90 issues execution package → Team 10 implements
→ GATE_4 (QA review) → GATE_5 (Team 90 validation)
→ GATE_6 (architectural reality check — Team 100)
→ GATE_7 re-entry (Nimrod browser walk-through — Option C)
→ GATE_7 PASS → GATE_8 → S003 activation
```

---

## §8 REQUIRED MIGRATIONS SUMMARY

| Migration | SQL |
|---|---|
| Add target_datetime to alerts | `ALTER TABLE user_data.alerts ADD COLUMN target_datetime TIMESTAMPTZ NULL;` |
| Add parent_datetime to notes | `ALTER TABLE user_data.notes ADD COLUMN parent_datetime TIMESTAMPTZ NULL;` |
| Clear existing general-linked alerts | `UPDATE user_data.alerts SET target_type = NULL, target_id = NULL WHERE target_type = 'general';` |

No DDL ENUM changes needed (all changed fields are String/VARCHAR types).

---

**log_entry | TEAM_00 | ARCHITECT_GATE7_REMEDIATION_FRAME_S002_P003_WP002 | APPROVED_v1_0_0 | 2026-03-04**

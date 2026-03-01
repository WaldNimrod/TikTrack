# ARCHITECT DIRECTIVE — GATE_7 Remediation Architecture
## S002-P003-WP002 | D22 · D33 · D34 · D35

**id:** `ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_v1.0.0`
**from:** Team 00 — Chief Architect
**to:** Team 10 (Implementation), Team 20 (Backend), Team 30 (Frontend), Team 60 (Infrastructure)
**cc:** Team 90 (QA), Team 100 (Program Authority)
**date:** 2026-03-01
**authority:** GATE_7 REJECT — CODE_CHANGE_REQUIRED (16 blocking findings)
**status:** 🔒 LOCKED — IMPLEMENTATION MANDATE
**gate:** Closes GATE_7 remediation loop for S002-P003-WP002

---

## 0. PURPOSE AND AUTHORITY

GATE_7 human review by Nimrod (Human Approver) found 16 blocking findings across D22, D33, D34, D35.
These are **design and understanding failures**, not simple bugs.

This directive provides the **complete architectural specification** for Team 10 to implement the remediation without guesses or assumptions. Every finding is mapped to exact files, exact patterns, exact decisions.

All decisions in this document were made after:
1. Full code analysis of all relevant UI and backend modules
2. Consultation with Nimrod on 5 architectural questions (Q1–Q5)
3. Cross-reference with SSOT documents: TT2_SYSTEM_STATUS_VALUES_SSOT, MARKET_DATA_PIPE_SPEC, MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC, MARKET_DATA_COVERAGE_MATRIX
4. Analysis of existing background job infrastructure (scripts pattern)
5. Analysis of existing notification architecture gaps

**Team 10 must implement this directive exactly as written. No deviations without ARCHITECT re-approval.**

---

## 1. LOCKED ARCHITECTURAL DECISIONS

The following decisions are locked from Nimrod consultation. They govern all implementation choices in this directive.

### 1.1 Status Architecture — Universal Rule

**Iron Rule:** ALL entity `status` fields use ONLY the 4 canonical values from `TT2_SYSTEM_STATUS_VALUES_SSOT`:

| Canonical Value | Hebrew (display) |
|---|---|
| `pending` | ממתין |
| `active` | פתוח |
| `inactive` | סגור |
| `cancelled` | מבוטל |

**Implementation path:** `ui/src/utils/statusValues.js` → `STATUS_VALUES` → via `statusAdapter.js` exclusively.
No hardcoded status strings anywhere.

### 1.2 Alert Lifecycle Model

Alerts use TWO separate fields:

**Field 1 — `status` (canonical 4-state, for entity record lifecycle):**
- `active` = alert is live and monitoring
- `inactive` = alert is paused by user
- `cancelled` = alert permanently removed (soft-delete, deleted_at is set)
- `pending` = alert created but awaiting activation (e.g., future-dated)

**Field 2 — `trigger_status` (alert-specific operational state, NEW COLUMN):**

| Value | Meaning | When set |
|---|---|---|
| `untriggered` | Condition not yet met | Default on creation; reset on re-arm |
| `triggered_unread` | Condition fired, user has not acknowledged | Alert evaluation job fires condition |
| `triggered_read` | Condition fired, user acknowledged | User opens/reads the notification |

**Re-arm logic:** After `triggered_read`, user may re-arm → `trigger_status = untriggered`, `status = active`.
**Expiry logic:** When `expires_at < now()` → evaluation job sets `status = cancelled`, `trigger_status` unchanged.
**DB migration required:** Add column `trigger_status VARCHAR(20) DEFAULT 'untriggered' NOT NULL` to `user_data.alerts`.

### 1.3 user_ticker Status and Notes Field

**Two new columns required on `user_data.user_tickers`:**

| Column | Type | Default | Notes |
|---|---|---|---|
| `status` | VARCHAR(20) | `'active'` | Canonical 4-state — `pending \| active \| inactive \| cancelled` |
| `notes` | TEXT | NULL | User's personal subtitle/memo for this ticker |

**Status cascade rules (enforced at service layer):**
- When `market_data.tickers.status → 'cancelled'`: all linked `user_tickers` → `status = 'cancelled'`, `deleted_at = now()`
- When `market_data.tickers.status → 'inactive'`: user_ticker stays `active` with warning badge in UI
- User CANNOT add a `user_ticker` for a system ticker with `status = 'cancelled'`
- User MAY add a `user_ticker` for `status = 'pending'` system ticker (warning badge shown)
- `user_ticker.status = 'active'` is IMPOSSIBLE if system ticker `status = 'cancelled'` — validated at DB and service layer

### 1.4 deleted_at Policy (Universal)

**Standard pattern (already present in all models):**
- `deleted_at` is a supplementary timestamp (`TIMESTAMP WITH TIME ZONE NULL`)
- `deleted_at IS NULL` = record is not deleted
- `deleted_at IS NOT NULL` = record is logically deleted
- When `status = 'cancelled'` is set AND it represents a deletion: `deleted_at = now()`
- When restoring a cancelled record to active: `status = 'active'`, `deleted_at = NULL`
- `deleted_at` never exists standalone to indicate permanent deletion — always paired with `status = 'cancelled'`

### 1.5 Note Linkage Model (parent_type)

**Valid `parent_type` values:**
`ticker | user_ticker | alert | trade | trade_plan | account | datetime`

**`general` is REMOVED.** Not a valid semantic entity.

**`datetime` type:**
- `parent_id` stores an ISO 8601 datetime string with timezone: e.g., `"2026-03-01T14:30:00+02:00"`
- Single `datetime` field only (no separate date/time)
- UI: datetime picker; stored as ISO string in `parent_id`

### 1.6 Alert Condition Builder Scope (MANDATORY in S002)

Alert evaluation without a working condition model is worthless. This MUST be implemented in the current scope.

**Supported condition_field values (Phase 2):**
`price | open_price | high_price | low_price | close_price | volume | market_cap`

**Supported condition_operator values:**
`> | < | >= | <= | = | crosses_above | crosses_below`

**condition_value:** NUMERIC(20,8) — Iron Rule precision

**`crosses_above` / `crosses_below` evaluation logic:**
Query the TWO most recent readings for the ticker (from `ticker_prices_intraday` for active, `ticker_prices` for inactive/pending) and compare:
- `crosses_above(field, value)`: `prev_value < value AND current_value >= value`
- `crosses_below(field, value)`: `prev_value > value AND current_value <= value`
No additional storage required — uses existing intraday/daily tables.

### 1.7 Alert Condition Evaluation — Background Job (Option B, MANDATORY)

New script: `scripts/check_alert_conditions.py`
Pattern: identical to `sync_ticker_prices_intraday.py` (asyncio + asyncpg + fcntl single-flight lock + cron-ready)

**Execution cadence:** Aligned with `INTRADAY_INTERVAL_MINUTES` (configured in system settings, same cron schedule as intraday refresh).

**System Management page (`system_management.html`):** Must be extended with a Background Jobs section showing run history, status, and manual trigger for all background jobs.

### 1.8 Notification System

**New table: `user_data.notifications`**
```sql
CREATE TABLE user_data.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,
    alert_id UUID REFERENCES user_data.alerts(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'alert_trigger',
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    read_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX ON user_data.notifications(user_id, is_read, created_at DESC);
```

**In-app surfaces:**
1. Widget (notification bell, count of `is_read = false`)
2. D34 alerts page — rows with `trigger_status = triggered_unread` get visual badge

**Email preview (NO SMTP in S002):**
- New API endpoint: `GET /api/v1/notifications/{notification_id}/email-preview`
- Returns: `{ subject, html_body, plain_text }` — rendered from Jinja2 template
- No actual email sent. UI displays the preview in a modal.

### 1.9 Roadmap Amendment (Stage 5)

The following item must be added to the canonical roadmap at Stage 5:
```
S005-SMTP-EMAIL-DELIVERY: שרת SMTP ותור שליחת אימייל
- Full email delivery pipeline
- SMTP server configuration (Admin)
- Email queue with retry
- Delivery tracking + bounce handling
- יעד: עם עלייה לאוויר
```

### 1.10 ticker_indicators Table — DEFERRED

`market_data.ticker_indicators` is deferred to the stage where Ticker Dashboard / Strategy Analysis is implemented. Not part of this remediation scope.

---

## 2. IMPLEMENTATION STREAMS

### STREAM 1 — Canonical Data Flow (Backend)
Addresses: Finding #1, parts of Finding #3, Finding #4 (user_ticker model)

### STREAM 2 — Semantic Model Lock (Data Model + Evaluation Engine)
Addresses: Finding #5 (linkage), Finding #6 (condition builder), Finding #7 (lifecycle), Finding #8 (filter bug), Finding #9 (edit persistence), Finding #10 (alert target_type), Finding #14 (notes general)

### STREAM 3 — UX/System Consistency (UI)
Addresses: Finding #2, #3, #4 (UI), #11 (D35 mirrors D34), #12 (CRUD), #13 (tooltips), #15 (attachments), #16 (read-only parent_id)

---

## 3. STREAM 1 — CANONICAL DATA FLOW

### 3.1 Backend: Single Canonical Ticker Creation Flow

**Problem:** `POST /tickers` (D22 admin) and `POST /me/tickers` (D33 user) are two divergent creation paths for the same system entity.

**Architecture decision: One canonical service function for ticker creation.**

**File to create:** `api/services/canonical_ticker_service.py`

**Function signature:**
```python
async def create_system_ticker(
    db: AsyncSession,
    symbol: str,
    ticker_type: str,
    exchange_id: Optional[UUID],
    company_name: Optional[str],
    metadata: Optional[dict] = None,
    skip_live_check: bool = False,  # dev bypass only, NOT default
) -> Ticker:
    """
    THE canonical path for creating a system ticker.
    1. Check symbol uniqueness in market_data.tickers
    2. Validate live market data (Yahoo → Alpha fallback)
       unless skip_live_check=True AND settings.debug=True
    3. Create ticker with status='pending'
    4. Return Ticker ORM object
    """
```

**File to modify:** `api/services/tickers_service.py`
- `create_ticker()` → delegates to `canonical_ticker_service.create_system_ticker()`
- Removes its own creation logic — it becomes a thin router to the canonical function
- The admin creation path (D22) now goes through live-data validation like user creation
- `SKIP_LIVE_DATA_CHECK=True` behavior: documented as dev-only bypass, validated against `settings.debug`; in production mode this flag has NO effect

**File to modify:** `api/services/user_tickers_service.py`
- `add_ticker()` function: if ticker not found in system → call `canonical_ticker_service.create_system_ticker()`, then link
- Remove the internal `_create_ticker_record()` logic that bypasses canonical flow
- Preserve `_live_data_check()` only as the implementation used by canonical_ticker_service

**Expected behavior after fix:**
| Action | Flow |
|---|---|
| Admin creates ticker via D22 | `POST /tickers` → `tickers_service` → `canonical_ticker_service.create_system_ticker()` → live validation → create |
| User adds ticker via D33 (already exists) | `POST /me/tickers` → lookup → found → create `user_tickers` link only |
| User adds ticker via D33 (new ticker) | `POST /me/tickers` → lookup → not found → `canonical_ticker_service.create_system_ticker()` → create + link |

### 3.2 Backend: user_ticker Model Extension

**File to modify:** `api/models/user_tickers.py`

Add two columns:
```python
status: Mapped[str] = mapped_column(
    String(20),
    nullable=False,
    default="active",
    server_default="'active'"
)
notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
```

**File to modify:** `api/schemas/user_tickers.py` (create if not exists, or locate existing)
- `UserTickerCreate`: add optional `notes: Optional[str] = None`
- `UserTickerUpdate`: add `notes: Optional[str]`, `status: Optional[str]`
- `UserTickerResponse`: add `status`, `notes`, `ticker_symbol`, `ticker_company_name`

### 3.3 Backend: Status Cascade (system_ticker → user_tickers)

**File to modify:** `api/services/tickers_service.py`

Add `cascade_status_to_user_tickers()` called when a system ticker's status changes to `cancelled`:
```python
async def _cascade_ticker_cancel(db: AsyncSession, ticker_id: UUID):
    """
    When system ticker is cancelled:
    - Set all linked user_tickers status='cancelled', deleted_at=now()
    """
    stmt = (
        update(UserTicker)
        .where(UserTicker.ticker_id == ticker_id, UserTicker.deleted_at.is_(None))
        .values(status='cancelled', deleted_at=func.now())
    )
    await db.execute(stmt)
```

This must be called in any endpoint that cancels or hard-deletes a system ticker.

### 3.4 Backend: user_tickers Router

**File to create/locate:** `api/routers/user_tickers.py` (currently at `api/routers/me_tickers.py`)

Verify and add:
- `GET /api/v1/me/tickers` — list user's tickers with status filter support
- `POST /api/v1/me/tickers` — canonical creation/link flow
- `PATCH /api/v1/me/tickers/{id}` — update `status` and/or `notes`
- `DELETE /api/v1/me/tickers/{id}` — soft delete (status=cancelled, deleted_at=now())

**Query filter:** all endpoints default to `status != 'cancelled'` and `deleted_at IS NULL`

### 3.5 DB Migration Requirements (Stream 1)

```sql
-- M-STREAM1-001: Add status + notes to user_tickers
ALTER TABLE user_data.user_tickers
  ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active',
  ADD COLUMN notes TEXT;

-- M-STREAM1-002: Add trigger_status to alerts
ALTER TABLE user_data.alerts
  ADD COLUMN trigger_status VARCHAR(20) NOT NULL DEFAULT 'untriggered';

-- M-STREAM1-003: Create notifications table
CREATE TABLE user_data.notifications ( ... ); -- see §1.8

-- M-STREAM1-004: Add ticker_id FK constraint to user_tickers (if not present)
-- Verify constraint: user_ticker.status='active' requires ticker.status != 'cancelled'
-- Implement at service layer, NOT DB constraint (to allow cascade updates)
```

---

## 4. STREAM 2 — SEMANTIC MODEL LOCK

### 4.1 Alert Form: Complete Condition Builder UI

**File to modify:** `ui/src/views/data/alerts/alertsForm.js`

**Current state:** Form sends `{target_type, alert_type, title, message, is_active: true}` — NO conditions, NO target_id.

**Required HTML additions to `createAlertFormHTML()`:**

```html
<!-- TARGET RESOLUTION SECTION -->
<div class="form-group" id="alertTargetIdGroup" style="display:none">
  <label for="alertTargetId">ישות מקושרת</label>
  <select id="alertTargetId" name="target_id">
    <option value="">-- בחר ישות --</option>
  </select>
  <!-- Populated dynamically based on target_type selection -->
</div>

<!-- CONDITION BUILDER SECTION -->
<fieldset id="alertConditionBuilder" style="display:none">
  <legend>תנאי הפעלה</legend>
  <div class="condition-row">
    <select id="conditionField" name="condition_field">
      <option value="">בחר שדה</option>
      <option value="price">מחיר</option>
      <option value="close_price">מחיר סגירה</option>
      <option value="open_price">מחיר פתיחה</option>
      <option value="high_price">שיא יומי</option>
      <option value="low_price">שפל יומי</option>
      <option value="volume">נפח מסחר</option>
      <option value="market_cap">שווי שוק</option>
    </select>
    <select id="conditionOperator" name="condition_operator">
      <option value="">בחר אופרטור</option>
      <option value=">">גדול מ ( > )</option>
      <option value="<">קטן מ ( < )</option>
      <option value=">=">גדול שווה ( >= )</option>
      <option value="<=">קטן שווה ( <= )</option>
      <option value="=">שווה בדיוק ( = )</option>
      <option value="crosses_above">חוצה כלפי מעלה</option>
      <option value="crosses_below">חוצה כלפי מטה</option>
    </select>
    <input type="number" id="conditionValue" name="condition_value"
           step="0.00000001" placeholder="ערך סף" />
  </div>
</fieldset>
```

**Visibility logic:**
- `alertTargetIdGroup`: shown when `target_type !== ''` and `target_type !== 'datetime'`
- `alertConditionBuilder`: shown when `alert_type` ∈ `{PRICE, VOLUME, TECHNICAL}`
- When `target_type = 'ticker'` selected: populate `alertTargetId` select from `GET /api/v1/me/tickers?status=active` → show `symbol (company_name)`
- When `target_type = 'datetime'`: show datetime picker in place of select

**Create payload (must include ALL fields):**
```javascript
const payload = {
  target_type: form.target_type.value,
  target_id: form.target_id.value || null,
  ticker_id: derivedTickerId || null,  // derived from target_id when target_type='ticker'
  alert_type: form.alert_type.value,
  priority: form.priority?.value || 'MEDIUM',
  condition_field: form.condition_field.value || null,
  condition_operator: form.condition_operator.value || null,
  condition_value: form.condition_value.value ? parseFloat(form.condition_value.value) : null,
  title: form.title.value,
  message: form.message.value,
  status: 'active',
  expires_at: form.expires_at.value || null,
};
```

**Edit payload (PATCH — must also include ALL fields):**
```javascript
const patchPayload = {
  target_type: form.target_type.value,
  target_id: form.target_id.value || null,
  ticker_id: derivedTickerId || null,
  condition_field: form.condition_field.value || null,
  condition_operator: form.condition_operator.value || null,
  condition_value: form.condition_value.value ? parseFloat(form.condition_value.value) : null,
  title: form.title.value,
  message: form.message.value,
  status: form.status.value,
  expires_at: form.expires_at.value || null,
};
```

**File to modify:** `api/services/alerts_service.py`
- Remove `'general'` from `VALID_TARGET_TYPES`
- Add `'user_ticker'` and `'datetime'` to `VALID_TARGET_TYPES`
- `update_alert()`: add `target_type`, `target_id`, `ticker_id`, `priority`, `status` to updateable fields

### 4.2 Alert Filter Bug Fix

**File to modify:** `ui/src/views/data/alerts/alertsTableInit.js`

**Root cause:** `bindFilters()` stores `targetType: undefined` for 'all', but `refreshAlertsTable()` checks `=== 'all'` which never matches.

**Fix — standardize on the literal string `'all'`:**

```javascript
// In bindFilters():
// BEFORE: filters.targetType = type === 'all' ? undefined : type;
// AFTER:
filters.targetType = type; // always store the literal value, 'all' stays 'all'

// In refreshAlertsTable():
// BEFORE: filters.targetType === 'all' ? undefined : filters.targetType
// AFTER:
const typeParam = (filters.targetType && filters.targetType !== 'all')
  ? filters.targetType
  : null;
```

**File to verify (already correct, but confirm):** `ui/src/views/data/alerts/alertsDataLoader.js` line 44 — `if (filters.targetType && filters.targetType !== 'all')` — this pattern is now consistent.

### 4.3 Alert Lifecycle: Backend Schema + Model Update

**File to modify:** `api/models/alerts.py`

Replace boolean fields with proper status + trigger_status model:
```python
# Add:
status: Mapped[str] = mapped_column(
    String(20), nullable=False, default="active", server_default="'active'"
)
trigger_status: Mapped[str] = mapped_column(
    String(20), nullable=False, default="untriggered", server_default="'untriggered'"
)
# Keep (for backward compat during migration):
is_active: Mapped[bool] = ...   # Derived: is_active = (status == 'active')
is_triggered: Mapped[bool] = ... # Derived: is_triggered = (trigger_status != 'untriggered')
```

After migration, `is_active` and `is_triggered` should be computed properties or deprecated. For Phase 2, keep both — update them consistently.

**File to modify:** `api/schemas/alerts.py`
- `AlertCreate`: add `status: str = 'active'`, `expires_at: Optional[datetime] = None`, `priority: str = 'MEDIUM'`, `target_id: Optional[UUID] = None`, `ticker_id: Optional[UUID] = None`
- `AlertUpdate`: add `status`, `trigger_status`, `target_type`, `target_id`, `ticker_id`, `priority`, `expires_at`
- `AlertResponse`: add `status`, `trigger_status`

### 4.4 Alert Condition Evaluation Engine

**New file:** `scripts/check_alert_conditions.py`

Pattern: identical structure to `scripts/sync_ticker_prices_intraday.py`

**Algorithm:**
```python
async def evaluate_all_alerts(db_conn):
    """
    1. Load all alerts where status='active' AND deleted_at IS NULL
       AND (expires_at IS NULL OR expires_at > now())
    2. For each alert with condition_field IS NOT NULL:
       a. Get current market value from ticker_prices_intraday (active ticker)
          OR ticker_prices ORDER BY price_timestamp DESC LIMIT 1 (inactive)
       b. For crosses operators: also get previous reading (LIMIT 2, compare [0] vs [1])
       c. Evaluate: compare current_value vs alert.condition_value using alert.condition_operator
       d. If condition met:
          - UPDATE alert SET trigger_status='triggered_unread', triggered_at=now()
          - INSERT INTO user_data.notifications (user_id, alert_id, type, title, message)
          - Log: alert_id, ticker_symbol, condition_field, operator, value, current_value
    3. Check expiry:
       - UPDATE alerts SET status='cancelled', deleted_at=now()
         WHERE status='active' AND expires_at < now()
    4. Write run log: run_time, alerts_checked, alerts_triggered, alerts_expired, errors
"""
```

**Cron configuration:**
Same schedule as intraday refresh: `*/INTRADAY_INTERVAL_MINUTES * * * 1-5` (UTC, weekdays)
Runs AFTER intraday price refresh (ensure ordering in cron).

**New API endpoint (for System Management UI):**
`GET /api/v1/admin/background-jobs/history` → returns last N runs per job
`POST /api/v1/admin/background-jobs/{job_name}/trigger` → manual run trigger (admin only)

### 4.5 Note Linkage Model Fix

**File to modify:** `ui/src/views/data/notes/notesForm.js`

**Remove `general` from PARENT_TYPES:**
```javascript
// BEFORE:
const PARENT_TYPES = [
  { value: 'general', label: 'כללי' },
  { value: 'ticker', label: 'טיקר' },
  ...
];
// AFTER:
const PARENT_TYPES = [
  { value: 'ticker', label: 'טיקר' },
  { value: 'user_ticker', label: 'טיקר שלי' },
  { value: 'alert', label: 'התראה' },
  { value: 'trade', label: 'עסקה' },
  { value: 'trade_plan', label: 'תכנון עסקה' },
  { value: 'account', label: 'חשבון מסחר' },
  { value: 'datetime', label: 'תאריך ושעה' },
];
```

**Add parent_id resolution section to `createFormHTML()`:**
```html
<div class="form-group" id="noteParentIdGroup" style="display:none">
  <!-- For types with entity selectors: -->
  <label for="noteParentSelect">ישות מקושרת</label>
  <select id="noteParentSelect">
    <option value="">-- בחר --</option>
  </select>
  <!-- For datetime type: -->
  <input type="datetime-local" id="noteParentDatetime" style="display:none" />
  <!-- Hidden actual value field: -->
  <input type="hidden" id="noteParentId" name="parent_id" />
</div>
```

**Visibility + population logic:**
- `parent_type = 'ticker'`: populate select from `GET /api/v1/me/tickers?status=active`
- `parent_type = 'user_ticker'`: same
- `parent_type = 'alert'`: populate from `GET /api/v1/alerts`
- `parent_type = 'datetime'`: show datetime input, store ISO string in hidden `noteParentId`

**Edit mode — parent fields READ-ONLY:**
In edit mode (`mode === 'edit'`), `parent_type` and `parent_id` display as:
```html
<div class="form-group readonly-field">
  <label>סוג ישות מקושרת</label>
  <span id="noteParentTypeDisplay">{display_label}</span>
</div>
<div class="form-group readonly-field">
  <label>ישות מקושרת</label>
  <span id="noteParentIdDisplay">{entity_display_name}</span>
</div>
```
No editable inputs for these fields in edit mode.

**Edit PUT payload:**
```javascript
const putPayload = {
  title: form.title.value,
  content: form.content.value,
  category: form.category.value,
  is_pinned: form.is_pinned.checked,
  tags: parsedTags,
  // parent_type and parent_id are NOT updated in edit mode
};
```

**File to modify:** `api/schemas/notes.py`
- Remove `'general'` from valid `parent_type` values
- Add `'user_ticker'`, `'datetime'` to valid values
- `NoteCreate`: ensure `parent_type` and `parent_id` are both nullable but validated as a pair
- `NoteUpdate`: does NOT include `parent_type` / `parent_id` (non-editable after creation)

---

## 5. STREAM 3 — UX/SYSTEM CONSISTENCY

### 5.1 Add Buttons — All Affected Pages

**Iron Rule:** Every primary "create new entity" button must have:
- Text label in the form `הוספת [ישות]` (nominal form, NOT imperative)
- An icon (optional, supplementary to text)
- `aria-label` matching the text

**Affected files and required changes:**

| File | Current | Required |
|---|---|---|
| `ui/src/views/management/userTicker/user_tickers.content.html` | `<button class="js-add-ticker">` with SVG only | Add text span: `<span>הוספת טיקר</span>` |
| Verify `alerts.content.html` | "הוספת התראה" text ✅ | Confirm — no change |
| Verify `notes.content.html` | Check for text label | Must have "הוספת הערה" |
| Verify `tickers.content.html` (D22) | Check for text label | Must have "הוספת טיקר" |

### 5.2 Cancel Button Text — All Modals

**Iron Rule:** Cancel button in ALL modals must read `'ביטול'` (NOT `'לבטל'`).

**Affected files:**
- `ui/src/views/data/alerts/alertsForm.js` line 85: `cancelButtonText: 'לבטל'` → `'ביטול'`
- `ui/src/views/data/notes/notesForm.js`: check `cancelButtonText` — same fix
- `ui/src/views/management/userTicker/userTickerAddForm.js`: check `cancelButtonText`
- Any other modal using `cancelButtonText: 'לבטל'` across the entire `ui/src/views/` tree — fix all

### 5.3 Tooltips on All Action Buttons

**Iron Rule:** Every icon-only button in ANY row-action menu must have:
- `title="[action description in Hebrew]"` attribute
- `aria-label="[action description in Hebrew]"` attribute

**Affected files:**

**`ui/src/views/data/alerts/alertsTableInit.js` — `renderAlertRow()`:**
```javascript
// View button:
<button class="js-action-view" title="צפייה בפרטי ההתראה" aria-label="צפייה בפרטי ההתראה">...</button>
// Edit button:
<button class="js-action-edit" title="עריכת ההתראה" aria-label="עריכת ההתראה">...</button>
// Toggle status button:
<button class="js-action-toggle" title="החלפת סטטוס פעיל/סגור" aria-label="החלפת סטטוס">...</button>
// Delete button:
<button class="js-action-delete" title="מחיקת ההתראה" aria-label="מחיקת ההתראה">...</button>
```

**Toggle button icon fix:** The toggle button currently uses an envelope/email SVG icon — wrong icon. Replace with a toggle/switch SVG or use a power-button icon. Must visually communicate "toggle active state".

**`ui/src/views/management/userTicker/userTickerTableInit.js` — `renderRow()`:**
```javascript
// View button: title="צפייה בפרטי הטיקר"
// Edit button: title="עריכת פרטי הטיקר"   ← must be ADDED (currently missing edit action)
// Delete button: title="הסרת הטיקר מהרשימה"
```

**Apply same tooltip standard to ALL entity pages:** D22 tickers, D34 alerts, D35 notes, D33 user_tickers — scan ALL `renderRow()` / `renderAlertRow()` functions.

### 5.4 D33: Replace browser alert() with Details Modal

**File to modify:** `ui/src/views/management/userTicker/userTickerTableInit.js`

**Current `handleView()` (line ~308-312):** uses `alert(msg)` — PROHIBITED.

**Required:** Open a `createModal()` with full entity details.

```javascript
handleView(item) {
  const content = `
    <div class="entity-details">
      <div class="detail-row"><span class="detail-label">סימול</span><span class="detail-value">${item.ticker_symbol}</span></div>
      <div class="detail-row"><span class="detail-label">שם חברה</span><span class="detail-value">${item.ticker_company_name || '—'}</span></div>
      <div class="detail-row"><span class="detail-label">סטטוס</span><span class="detail-value">${toHebrewStatus(item.status)}</span></div>
      <div class="detail-row"><span class="detail-label">הערה אישית</span><span class="detail-value">${item.notes || '—'}</span></div>
      <div class="detail-row"><span class="detail-label">נוסף בתאריך</span><span class="detail-value">${formatDate(item.created_at)}</span></div>
    </div>
  `;
  createModal({
    title: `פרטי טיקר — ${item.ticker_symbol}`,
    content,
    entity: 'user-ticker',
    showSaveButton: false,
    cancelButtonText: 'סגירה',
  });
}
```

Also replace `handleRemove()` which uses `confirm()` with a `createModal()` confirmation pattern matching the trading-account flow.

### 5.5 D33: Add Edit Action

**Current state:** `userTickerTableInit.js` has only `js-action-view` and `js-action-delete`. No `js-action-edit`.

**Required:** Add edit action that opens a form modal to edit `status` and `notes`.

**Edit modal fields:**
- `status` — select (active/inactive/cancelled) via `getStatusOptions()` from `statusAdapter.js`
- `notes` — textarea (user's personal subtitle for this ticker)
- Read-only display: ticker symbol, company name

**API call:** `PATCH /api/v1/me/tickers/{id}` with `{ status, notes }`

### 5.6 D33: Add Ticker — Lookup Feedback in Modal

**File to modify:** `ui/src/views/management/userTicker/userTickerAddForm.js`

**Current state:** Symbol input exists, but there's no inline feedback telling the user whether the symbol already exists in the system.

**Required UX flow:**

```
User types symbol → [debounce 500ms] → GET /api/v1/tickers?symbol=XXX
                                                    ↓
                           found                          not found
                   ┌─────────────────┐           ┌──────────────────────────┐
                   │ ✓ טיקר קיים     │           │ ✗ טיקר חדש               │
                   │ "יקושר לרשימה" │           │ "יוצר טיקר חדש ויקושר"  │
                   │ [company name]  │           │ [requires validation]    │
                   └─────────────────┘           └──────────────────────────┘
```

**Modal state indicator element:**
```html
<div id="tickerLookupStatus" class="lookup-status" style="display:none">
  <!-- Populated dynamically: class="status-found" or "status-new" or "status-pending" -->
</div>
```

**For `status='pending'` system tickers:** Show: `⚠ טיקר ממתין לאישור — נתונים עשויים להיות חלקיים`

### 5.7 Modal Design Alignment

**Reference baseline:** Trading account modal (`ui/src/views/financial/tradingAccounts/`)

**All modals in D22/D33/D34/D35 must follow this baseline:**
- Entity color theming: CSS class `entity-[type]` on modal container
- Button hierarchy: primary action (right), cancel (left)
- Field spacing: consistent `form-group` wrapper with `label` + `input`/`select`
- No raw `confirm()` or `alert()` — always use `createModal()`

**File references for modal baseline:**
- Modal factory: `ui/src/components/modals/PhoenixModal.js` (or wherever `createModal` is defined)
- Trading account form: `ui/src/views/financial/tradingAccounts/tradingAccountsForm.js`

### 5.8 D35: Note Attachments — Proven End-to-End

**Finding #15:** No actual file was attached during review — attachment behavior unproven.

**Required action:**
1. Create QA test fixture: seed one note with at least one real file attachment in test DB
2. E2E test must verify: upload attachment → save note → reload → attachment is displayed → delete attachment → verify removal
3. API test must verify: `POST /notes/{id}/attachments` → actual file stored → `GET /notes/{id}` returns attachment metadata

This is a TEST REQUIREMENT, not purely a code fix. Team 50 (QA) must use a real binary file in the test, not mock.

### 5.9 System Management: Background Jobs Section

**File to modify:** `ui/src/views/management/systemManagement/system_management.html`

Add a new `<tt-section>` after the market data settings section:

```html
<tt-section data-section="background-jobs">
  <div class="index-section__header">
    <h1>משימות רקע</h1>
  </div>
  <div class="index-section__body">
    <div id="backgroundJobsPanel">
      <!-- Table: job_name | last_run | duration_ms | records_processed | status | errors -->
      <!-- Manual trigger buttons per job -->
    </div>
  </div>
</tt-section>
```

**New API router:** `api/routers/background_jobs.py`
- `GET /api/v1/admin/background-jobs` — list jobs + last run status (admin only)
- `GET /api/v1/admin/background-jobs/{job_name}/history?limit=20` — run history
- `POST /api/v1/admin/background-jobs/{job_name}/trigger` — manual trigger

**Job run log table:**
```sql
CREATE TABLE admin_data.job_run_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name VARCHAR(100) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'running',  -- running|success|error
    records_processed INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    error_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX ON admin_data.job_run_log(job_name, started_at DESC);
```

Each background script must INSERT a row on start and UPDATE on completion.

---

## 6. COMPLETE FINDING → IMPLEMENTATION MAP

| Finding # | Description | Stream | Files | Status |
|---|---|---|---|---|
| 1 | Invalid ticker creation split | S1 | `canonical_ticker_service.py` (NEW), `tickers_service.py`, `user_tickers_service.py` | SPEC COMPLETE |
| 2 | Add button + modal inconsistency | S3 | `user_tickers.content.html`, `alertsForm.js`, `notesForm.js`, ALL modal forms | SPEC COMPLETE |
| 3 | D33 action model incomplete | S3 | `userTickerTableInit.js`, `userTickerAddForm.js` | SPEC COMPLETE |
| 4 | D33 missing notes + status + cancel wording | S1+S3 | `user_tickers.py` (model), `userTickerAddForm.js`, `userTickerTableInit.js`, ALL modal cancelButton | SPEC COMPLETE |
| 5 | Alert + note linkage model incomplete | S2 | `alertsForm.js`, `notesForm.js` | SPEC COMPLETE |
| 6 | Alert condition builder missing | S2 | `alertsForm.js`, `alerts_service.py` | SPEC COMPLETE |
| 7 | Alert lifecycle too shallow | S2 | `alerts.py` (model), `alerts.py` (schema), `alerts_service.py` | SPEC COMPLETE |
| 8 | Filter "all" bug | S2 | `alertsTableInit.js` | SPEC COMPLETE |
| 9 | Alert edit persistence failure | S2 | `alertsForm.js`, `alerts_service.py` | SPEC COMPLETE |
| 10 | 'general' in alert target_types | S2 | `alertsForm.js`, `alerts_service.py` | SPEC COMPLETE |
| 11 | D35 must mirror D34 structural fixes | S2+S3 | `notesForm.js`, `notes.py` (schema), `notesTableInit.js` | SPEC COMPLETE |
| 12 | CRUD coverage incomplete | S2+S3 | All CREATE/EDIT forms — verify all fields persist | SPEC COMPLETE |
| 13 | Tooltips missing on all action buttons | S3 | ALL `renderRow()` functions across all entity pages | SPEC COMPLETE |
| 14 | 'general' not valid for notes | S2 | `notesForm.js`, `notes.py` (schema) | SPEC COMPLETE |
| 15 | Attachments unproven | S3 | QA test fixture + E2E test | SPEC COMPLETE |
| 16 | Note parent_id editable in edit | S2 | `notesForm.js` | SPEC COMPLETE |

---

## 7. NEW INFRASTRUCTURE COMPONENTS SUMMARY

| Component | Type | Location | Status |
|---|---|---|---|
| `canonical_ticker_service.py` | Backend service | `api/services/` | NEW — create |
| `check_alert_conditions.py` | Background script | `scripts/` | NEW — create |
| `user_data.notifications` table | DB | migration | NEW — create |
| `admin_data.job_run_log` table | DB | migration | NEW — create |
| `background_jobs.py` router | Backend router | `api/routers/` | NEW — create |
| Email preview endpoint | Backend router | extend `api/routers/alerts.py` | NEW — add |
| Background Jobs UI section | Frontend | `system_management.html` | NEW — add |
| `user_tickers.status` + `notes` columns | DB | migration | MIGRATE |
| `alerts.trigger_status` column | DB | migration | MIGRATE |
| Notification bell widget | Frontend | `ui/src/components/` | NEW — create |

---

## 8. DB MIGRATIONS — ORDERED EXECUTION

Must be run in this order:

```
M-001  user_data.user_tickers — ADD status, notes
M-002  user_data.alerts — ADD trigger_status
M-003  user_data.notifications — CREATE TABLE
M-004  admin_data — CREATE SCHEMA IF NOT EXISTS
M-005  admin_data.job_run_log — CREATE TABLE
M-006  market_data.tickers — Verify status column exists (already in model)
M-007  Data migration: SET alerts.is_active=false → status='inactive'; is_triggered=true → trigger_status='triggered_unread'
```

---

## 9. ROADMAP AMENDMENT

The following item must be added to the canonical roadmap at Stage 5:

```
ID: S005-SMTP-EMAIL-DELIVERY
Title: שרת SMTP ותור שליחת אימייל
Scope:
  - Production SMTP server configuration (Admin settings)
  - Email queue with retry and dead-letter
  - Delivery tracking and bounce handling
  - Unsubscribe flow
Prerequisites: System online deployment
Estimated stage: S005
```

Team 90 must route this addition through the standard roadmap amendment process.

---

## 10. ACCEPTANCE CRITERIA (GATE_7 RE-ENTRY)

For the remediation to re-enter GATE_7 human review, ALL of the following must be true:

### D22 Tickers
- [ ] Create ticker via D22 admin form → enforces live market data validation
- [ ] Cancel/delete system ticker → all linked user_tickers cascade to cancelled

### D33 My Tickers
- [ ] Add button has text label "הוספת טיקר"
- [ ] Symbol lookup in add modal shows inline feedback (exists → "יקושר"; new → "יוצר טיקר חדש")
- [ ] Add flow creates ticker via canonical service (single path)
- [ ] Ticker with `status='pending'` shows warning badge in the list
- [ ] System ticker `status='cancelled'` → user_ticker auto-cascades
- [ ] Action menu has: view + edit + delete (no browser alert() anywhere)
- [ ] View action opens full details modal (not browser alert)
- [ ] Edit action allows updating status + notes
- [ ] `notes` field visible in detail/edit modal
- [ ] Cancel button in all D33 modals reads 'ביטול'
- [ ] All action buttons have title + aria-label tooltips

### D34 Alerts
- [ ] Alert creation form has: target_type + target_id selector + condition_field + condition_operator + condition_value
- [ ] When target_type='ticker': selector populates with user's active tickers
- [ ] Condition builder shows for PRICE/VOLUME/TECHNICAL alert types
- [ ] 'general' is NOT in the target_type options
- [ ] Create alert → all fields persist including condition and target_id
- [ ] Edit alert → all fields (including target and condition) persist via PATCH
- [ ] Filter buttons work: "כל ההתראות" reliably shows all records
- [ ] Alert rows show `trigger_status` visual badge (triggered_unread / triggered_read)
- [ ] Toggle button uses correct icon (power/toggle, not envelope)
- [ ] All action buttons have title tooltips
- [ ] Cancel button reads 'ביטול'

### D35 Notes
- [ ] 'general' is NOT in the parent_type options
- [ ] parent_type dropdown has all valid types including 'datetime'
- [ ] parent_id resolves to a specific entity (select or datetime picker)
- [ ] In edit mode: parent_type and parent_id are READ-ONLY (display only)
- [ ] Edit note → parent not reassignable, other fields (title, content, category, tags) persist
- [ ] At least one note with a real file attachment exists in test DB
- [ ] Attachment add → save → reload → attachment shown = E2E proven
- [ ] Attachment delete → reload → attachment gone = E2E proven
- [ ] All action buttons have title tooltips
- [ ] Cancel button reads 'ביטול'

### Alert Evaluation Engine
- [ ] `check_alert_conditions.py` script exists and runs without error on local env
- [ ] Alert with price condition + active ticker → triggers when condition met
- [ ] crosses_above: evaluated correctly using two most recent readings
- [ ] Triggered alert → `trigger_status = 'triggered_unread'`
- [ ] Notification record created in `user_data.notifications`
- [ ] Expired alert → `status = 'cancelled'`
- [ ] `GET /api/v1/admin/background-jobs` returns job run history

### System Management
- [ ] Background Jobs section visible in system_management.html
- [ ] Job run history displayed for all background jobs
- [ ] Manual trigger available per job

### Universal
- [ ] No browser `alert()` or `confirm()` anywhere in D22/D33/D34/D35 pages
- [ ] All add buttons have text labels in nominal Hebrew form
- [ ] All cancel buttons across all modals read 'ביטול'

---

## 11. EXECUTION ORDER RECOMMENDATION

**Phase A (foundations — must complete first):**
1. DB migrations M-001 through M-007
2. `canonical_ticker_service.py` — unifies creation flow
3. `user_tickers` model, schema, router updates

**Phase B (semantic model):**
4. Alert model + schema update (trigger_status, status, all fields)
5. Alert condition builder UI
6. Note linkage model fix
7. Filter bug fix

**Phase C (evaluation engine + notifications):**
8. `notifications` table + service
9. `check_alert_conditions.py` script
10. Background jobs log table + router
11. Email preview endpoint

**Phase D (UX consistency):**
12. All tooltip additions
13. All button wording fixes
14. D33 details modal (replace alert())
15. D33 edit action
16. System Management background jobs section

**Phase E (testing):**
17. D35 attachment test fixture
18. Full E2E test suite re-run

---

**log_entry | TEAM_00 | ARCHITECT_DIRECTIVE | G7_REMEDIATION_S002_P003_WP002 | LOCKED | 2026-03-01**

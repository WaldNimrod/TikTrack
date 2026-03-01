# ARCHITECT DIRECTIVE — GATE_7 Remediation: Implementation Detail Supplement
## S002-P003-WP002 | LOD400 Gap Closure

**id:** `ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_SUPPLEMENT_v1.0.0`
**parent:** `ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_v1.0.0`
**from:** Team 00 — Chief Architect
**to:** Team 10 (Implementation)
**date:** 2026-03-01
**status:** 🔒 LOCKED — closes LOD400 gaps A–E from parent directive
**gate:** Pre-handoff supplement — required before Team 10 intake

---

## PURPOSE

The parent directive is architecturally complete and covers all 16 GATE_7 findings.
This supplement closes 5 implementation-detail gaps (A–E) that required additional code-pattern analysis before Team 10 could implement without assumptions.

**Read this document together with the parent directive. This supplement does NOT replace it.**

---

## GAP A — Entity Selector: Dynamic Loading Pattern Within PhoenixModal

### Context

The parent directive specifies that `alertTargetId` and `noteParentId` must resolve to a specific entity record. The exact integration pattern with `PhoenixModal` and the async fetch pattern was not yet specified.

### Existing Pattern Reference

The trading accounts form (`ui/src/views/financial/tradingAccounts/tradingAccountsForm.js`) shows the reference pattern:
1. Fetch reference data BEFORE calling `createModal()`
2. Embed the fetched data as pre-built `<option>` HTML inside the content string
3. Pass complete HTML to `createModal({ content: htmlString, ... })`

### Required Pattern for Alerts (D34) and Notes (D35)

Because the entity type depends on a user selection (`target_type` / `parent_type`), the selector is **dynamic after modal opens**. Use a post-render event listener pattern:

**Step 1 — Modal opens with empty target_id container:**
```javascript
// In openAlertsForm() — after createModal() returns, attach dynamic loader:
const targetTypeSelect = document.getElementById('alertTargetType');
const targetIdGroup = document.getElementById('alertTargetIdGroup');
const targetIdSelect = document.getElementById('alertTargetId');
const targetIdDatetime = document.getElementById('alertTargetDatetime'); // datetime-local input

targetTypeSelect.addEventListener('change', async function () {
  const type = this.value;
  // Hide all target inputs first
  targetIdGroup.style.display = 'none';
  if (targetIdDatetime) targetIdDatetime.style.display = 'none';

  if (!type) return;

  if (type === 'datetime') {
    // Show datetime picker instead of select
    if (targetIdDatetime) targetIdDatetime.style.display = 'block';
    targetIdDatetime.addEventListener('change', function () {
      document.getElementById('alertTargetIdHidden').value = this.value
        ? new Date(this.value).toISOString()
        : '';
    });
    return;
  }

  // Show entity select and load options
  targetIdGroup.style.display = 'block';
  targetIdSelect.innerHTML = '<option value="">טוען...</option>';

  const opts = await _loadEntityOptions(type);
  targetIdSelect.innerHTML =
    '<option value="">-- בחר ישות --</option>' +
    opts.map(o => `<option value="${o.value}">${o.label}</option>`).join('');

  // Pre-select in edit mode
  if (currentAlertData?.target_id) {
    targetIdSelect.value = currentAlertData.target_id;
  }
});
```

**Step 2 — `_loadEntityOptions(type)` shared utility:**

Create `ui/src/utils/entityOptionLoader.js` (shared between alerts and notes):

```javascript
/**
 * entityOptionLoader.js — loads entity options per type for entity selectors
 * Used by: alertsForm.js, notesForm.js
 */

const ENTITY_ENDPOINTS = {
  ticker:       '/api/v1/me/tickers?status=active&per_page=200',
  user_ticker:  '/api/v1/me/tickers?status=active&per_page=200',
  alert:        '/api/v1/alerts?per_page=200',
  account:      '/api/v1/trading-accounts?per_page=200',
  trade:        '/api/v1/trades?per_page=200',
  trade_plan:   '/api/v1/trade-plans?per_page=200',
};

const ENTITY_LABEL_FN = {
  ticker:      (t) => `${t.ticker_symbol}${t.ticker_company_name ? ' — ' + t.ticker_company_name : ''}`,
  user_ticker: (t) => `${t.ticker_symbol}${t.ticker_company_name ? ' — ' + t.ticker_company_name : ''}`,
  alert:       (a) => a.title || `התראה ${a.id.slice(0, 8)}`,
  account:     (a) => a.account_name || a.display_name,
  trade:       (t) => `${t.ticker_symbol} — ${t.trade_date || ''}`,
  trade_plan:  (p) => p.title || p.ticker_symbol || `תכנון ${p.id.slice(0, 8)}`,
};

export async function loadEntityOptions(type) {
  const endpoint = ENTITY_ENDPOINTS[type];
  if (!endpoint) return [];

  try {
    const token = window.PhoenixAuth?.getToken?.()
      || localStorage.getItem('auth_token')
      || localStorage.getItem('token');

    const res = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return [];

    const json = await res.json();
    const items = json.data || json.items || json || [];
    const labelFn = ENTITY_LABEL_FN[type] || (x => x.id);

    return items.map(item => ({ value: item.id, label: labelFn(item) }));
  } catch (e) {
    return [];
  }
}
```

**Auth token key:** Verify the exact localStorage key used by the app (check `ui/src/utils/auth.js` or equivalent) — use the same key name consistently.

**Step 3 — Ticker_id derivation:**

When `target_type = 'ticker'` or `'user_ticker'`, after entity selection:
- `target_id` = the selected user_ticker `id` (UUID)
- `ticker_id` = the `ticker_id` field from the user_ticker record (returned by `GET /api/v1/me/tickers`)
- Store `ticker_id` as a `data-ticker-id` attribute on each option:
```javascript
return items.map(item => ({
  value: item.id,
  tickerId: item.ticker_id,  // store for later extraction
  label: labelFn(item)
}));
// In option HTML:
`<option value="${o.value}" data-ticker-id="${o.tickerId || ''}">${o.label}</option>`
```
On save, extract: `const tickerId = targetIdSelect.selectedOptions[0]?.dataset?.tickerId || null`

---

## GAP B — Alert Trigger Read / Re-arm UX

### trigger_status Transitions

| From | To | Trigger | How |
|---|---|---|---|
| `untriggered` | `triggered_unread` | Evaluation engine fires condition | Automatic via `check_alert_conditions.py` |
| `triggered_unread` | `triggered_read` | User opens alert details | Implicit: `handleView()` calls PATCH |
| `triggered_read` | `untriggered` (re-arm) | User clicks "הפעל מחדש" button | Explicit button in details modal |
| `active` | `inactive` | User clicks toggle in row | Existing toggle action (unchanged) |

### Implicit Read — In handleView()

**File: `ui/src/views/data/alerts/alertsTableInit.js`**

After opening the details modal, if the item's `trigger_status` is `triggered_unread`:
```javascript
async handleView(item) {
  // Open details modal (full details, not form)
  const content = buildAlertDetailsHTML(item);
  createModal({
    title: `פרטי התראה — ${item.title}`,
    content,
    entity: 'alert',
    showSaveButton: false,
    cancelButtonText: 'סגירה',
  });

  // Mark as read if unread triggered
  if (item.trigger_status === 'triggered_unread') {
    try {
      const token = ...; // get auth token
      await fetch(`/api/v1/alerts/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ trigger_status: 'triggered_read' })
      });
      // Update row badge in table without full refresh
      const row = document.querySelector(`[data-alert-id="${item.id}"]`);
      if (row) row.classList.remove('trigger-unread');
    } catch(e) { /* non-critical — don't block UX */ }
  }
}
```

### Re-arm Button — In Alert Details Modal

`buildAlertDetailsHTML(item)` must include re-arm button when applicable:
```javascript
function buildAlertDetailsHTML(item) {
  const canRearm = item.trigger_status === 'triggered_read' || item.trigger_status === 'triggered_unread';
  const rearmBtn = canRearm
    ? `<button class="btn btn-secondary js-rearm-alert" data-alert-id="${item.id}">הפעל מחדש</button>`
    : '';

  return `
    <div class="entity-details">
      <div class="detail-row"><span class="detail-label">כותרת</span><span>${item.title}</span></div>
      <div class="detail-row"><span class="detail-label">סטטוס</span><span class="status-badge status-${item.status}">${toHebrewStatus(item.status)}</span></div>
      <div class="detail-row"><span class="detail-label">מצב הפעלה</span><span>${formatTriggerStatus(item.trigger_status)}</span></div>
      <div class="detail-row"><span class="detail-label">תנאי</span><span>${item.condition_summary || '—'}</span></div>
      <div class="detail-row"><span class="detail-label">הופעל ב</span><span>${item.triggered_at ? formatDate(item.triggered_at) : '—'}</span></div>
      <div class="detail-row"><span class="detail-label">תפוגה</span><span>${item.expires_at ? formatDate(item.expires_at) : 'ללא תפוגה'}</span></div>
      ${rearmBtn}
    </div>
  `;
}
```

**Re-arm event handler** (attach after modal renders):
```javascript
document.querySelector('.js-rearm-alert')?.addEventListener('click', async function () {
  const alertId = this.dataset.alertId;
  await fetch(`/api/v1/alerts/${alertId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ trigger_status: 'untriggered', status: 'active' })
  });
  closeModal();
  refreshAlertsTable(); // reload table
});
```

**Hebrew trigger_status labels:**
```javascript
function formatTriggerStatus(ts) {
  const labels = {
    untriggered:      'ממתין להפעלה',
    triggered_unread: 'הופעל — לא נקרא',
    triggered_read:   'הופעל — נקרא',
  };
  return labels[ts] || ts;
}
```

### Visual Treatment in Alert Table Row

**File: `ui/src/views/data/alerts/alertsTableInit.js` — `renderAlertRow()`**

Add CSS class based on `trigger_status`:
```javascript
const rowClass = item.trigger_status === 'triggered_unread'
  ? 'alert-row trigger-unread'
  : item.trigger_status === 'triggered_read'
  ? 'alert-row trigger-read'
  : 'alert-row';
```

**Required CSS additions (`phoenix-components.css` or alerts-specific CSS):**
```css
.alert-row.trigger-unread {
  border-right: 3px solid var(--color-warning, #f59e0b);
  background-color: var(--color-warning-bg, rgba(245,158,11,0.05));
}
.trigger-status-badge {
  display: inline-block;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 4px;
}
.trigger-status-badge--unread { background: #fef3c7; color: #92400e; }
.trigger-status-badge--read   { background: #d1fae5; color: #065f46; }
```

---

## GAP C — Notification Bell Widget

### Location

**File: `ui/src/views/shared/unified-header.html`**

Insert into `filter-user-section` div, BEFORE the existing user profile `<a>` tag:

```html
<div class="filter-user-section" id="filterUserSection">

  <!-- ▼ ADD: Notification Bell -->
  <div class="notification-bell" id="notificationBell">
    <button class="notification-bell__btn" id="notificationBellBtn"
            title="התראות שהופעלו" aria-label="התראות שהופעלו">
      <!-- Bell icon (Lucide: bell) -->
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <span class="notification-bell__count" id="notificationCount"
            style="display:none" aria-label="מספר התראות שלא נקראו">0</span>
    </button>

    <div class="notification-bell__dropdown" id="notificationDropdown"
         role="dialog" aria-label="התראות אחרונות" style="display:none">
      <div class="notification-bell__header">
        <span class="notification-bell__title">התראות אחרונות</span>
        <button class="notification-bell__mark-all" id="markAllReadBtn"
                title="סמן הכל כנקרא">סמן הכל כנקרא</button>
      </div>
      <ul class="notification-bell__list" id="notificationList" role="list">
        <li class="notification-bell__empty">אין התראות חדשות</li>
      </ul>
      <div class="notification-bell__footer">
        <a href="/alerts.html" class="notification-bell__see-all">כל ההתראות ←</a>
      </div>
    </div>
  </div>
  <!-- ▲ END Notification Bell -->

  <!-- Existing user profile link remains here -->
  <a href="/login" class="user-profile-link ...">...</a>
</div>
```

### Implementation File

**New file: `ui/src/components/shared/notificationBell.js`**

```javascript
/**
 * notificationBell.js — Notification bell widget
 * Polls GET /api/v1/notifications?is_read=false&limit=5
 * Updates bell count badge + dropdown list
 */

const POLL_INTERVAL_MS = 60_000; // 60 seconds
let pollTimer = null;

export function initNotificationBell() {
  const btn = document.getElementById('notificationBellBtn');
  const dropdown = document.getElementById('notificationDropdown');
  const markAllBtn = document.getElementById('markAllReadBtn');

  if (!btn) return; // header not loaded yet

  // Toggle dropdown on click
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.style.display !== 'none';
    dropdown.style.display = isOpen ? 'none' : 'block';
    if (!isOpen) loadNotifications(); // refresh on open
  });

  // Close on outside click
  document.addEventListener('click', () => {
    dropdown.style.display = 'none';
  });
  dropdown.addEventListener('click', (e) => e.stopPropagation());

  // Mark all as read
  markAllBtn?.addEventListener('click', async () => {
    await markAllRead();
    updateBellCount(0);
    dropdown.style.display = 'none';
  });

  // Initial load + start polling
  loadNotifications();
  pollTimer = setInterval(loadNotifications, POLL_INTERVAL_MS);
}

async function loadNotifications() {
  try {
    const token = getAuthToken();
    const res = await fetch('/api/v1/notifications?is_read=false&limit=5', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return;
    const { count, items } = await res.json();

    updateBellCount(count || 0);
    renderNotificationList(items || []);
  } catch (e) { /* silent — bell is non-critical */ }
}

function updateBellCount(count) {
  const badge = document.getElementById('notificationCount');
  if (!badge) return;
  if (count > 0) {
    badge.textContent = count > 99 ? '99+' : String(count);
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
}

function renderNotificationList(items) {
  const list = document.getElementById('notificationList');
  if (!list) return;

  if (!items.length) {
    list.innerHTML = '<li class="notification-bell__empty">אין התראות חדשות</li>';
    return;
  }

  list.innerHTML = items.map(n => `
    <li class="notification-bell__item" data-notification-id="${n.id}" data-alert-id="${n.alert_id || ''}">
      <span class="notification-bell__item-title">${n.title}</span>
      <span class="notification-bell__item-time">${formatRelativeTime(n.created_at)}</span>
    </li>
  `).join('');

  // Click: navigate to alerts page
  list.querySelectorAll('.notification-bell__item').forEach(el => {
    el.addEventListener('click', async () => {
      const notifId = el.dataset.notificationId;
      await markRead(notifId);
      window.location.href = '/alerts.html';
    });
  });
}

async function markRead(notificationId) {
  const token = getAuthToken();
  await fetch(`/api/v1/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  }).catch(() => {});
}

async function markAllRead() {
  const token = getAuthToken();
  await fetch('/api/v1/notifications/read-all', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  }).catch(() => {});
}

function formatRelativeTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'עכשיו';
  if (mins < 60) return `לפני ${mins} דקות`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `לפני ${hrs} שעות`;
  return `לפני ${Math.floor(hrs / 24)} ימים`;
}

function getAuthToken() {
  return window.PhoenixAuth?.getToken?.()
    || localStorage.getItem('auth_token')
    || localStorage.getItem('token')
    || '';
}
```

**Load in `UnifiedAppInit.js`** (or equivalent header init):
```javascript
import { initNotificationBell } from '../shared/notificationBell.js';
// After header loads:
initNotificationBell();
```

### Required CSS — `phoenix-header.css`

```css
/* Notification Bell */
.notification-bell { position: relative; display: inline-flex; align-items: center; }

.notification-bell__btn {
  position: relative;
  background: none; border: none; cursor: pointer;
  padding: 4px; color: var(--header-icon-color, #374151);
  display: flex; align-items: center;
}
.notification-bell__btn:hover { color: var(--color-primary, #2563eb); }

.notification-bell__count {
  position: absolute; top: -2px; right: -4px;
  background: var(--color-danger, #dc2626); color: white;
  border-radius: 999px; font-size: 0.6rem; font-weight: 700;
  min-width: 16px; height: 16px; line-height: 16px;
  text-align: center; padding: 0 3px;
}

.notification-bell__dropdown {
  position: absolute; top: calc(100% + 8px); left: 0;
  background: white; border: 1px solid #e5e7eb;
  border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  min-width: 280px; max-width: 340px; z-index: 9999;
}

.notification-bell__header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 14px; border-bottom: 1px solid #e5e7eb;
}
.notification-bell__title { font-weight: 600; font-size: 0.85rem; }
.notification-bell__mark-all {
  background: none; border: none; cursor: pointer;
  font-size: 0.75rem; color: var(--color-primary, #2563eb);
}

.notification-bell__list { list-style: none; margin: 0; padding: 0; max-height: 240px; overflow-y: auto; }
.notification-bell__item {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 10px 14px; cursor: pointer; border-bottom: 1px solid #f3f4f6;
}
.notification-bell__item:hover { background: #f9fafb; }
.notification-bell__item-title { font-size: 0.82rem; font-weight: 500; }
.notification-bell__item-time { font-size: 0.72rem; color: #6b7280; white-space: nowrap; margin-right: 8px; }
.notification-bell__empty { padding: 16px; text-align: center; font-size: 0.82rem; color: #6b7280; }

.notification-bell__footer { padding: 8px 14px; border-top: 1px solid #e5e7eb; text-align: center; }
.notification-bell__see-all { font-size: 0.82rem; color: var(--color-primary, #2563eb); text-decoration: none; }
```

### Required Backend Endpoints (for notification bell)

**File: `api/routers/notifications.py`** (new)

```
GET  /api/v1/notifications              → list notifications (query: is_read, limit, offset)
PATCH /api/v1/notifications/{id}/read   → mark one notification as read
PATCH /api/v1/notifications/read-all   → mark all as read for current user
```

**Response schema for `GET /api/v1/notifications`:**
```json
{
  "count": 3,
  "items": [
    {
      "id": "uuid",
      "alert_id": "uuid",
      "type": "alert_trigger",
      "title": "מחיר AAPL חצה מעלה $185",
      "message": "price crosses_above 185.0",
      "is_read": false,
      "created_at": "2026-03-01T14:30:00Z"
    }
  ]
}
```

---

## GAP D — Re-arm UX

**Fully specified in Gap B above.** No additional content needed.

---

## GAP E — crosses_above / crosses_below: Edge Cases in Evaluation Engine

### Insufficient Data

**File: `scripts/check_alert_conditions.py`**

When evaluating `crosses_above` or `crosses_below`:

```python
async def _get_two_readings(conn, ticker_id: str, table: str, field: str):
    """
    Returns (current_value, prev_value) or (None, None) if insufficient data.
    table: 'ticker_prices_intraday' or 'ticker_prices'
    """
    rows = await conn.fetch(
        f"""
        SELECT {field}
        FROM market_data.{table}
        WHERE ticker_id = $1
          AND {field} IS NOT NULL
          AND is_stale = false
        ORDER BY price_timestamp DESC
        LIMIT 2
        """,
        ticker_id
    )
    if len(rows) < 2:
        return None, None  # insufficient data — cannot evaluate cross
    return float(rows[0][field]), float(rows[1][field])


def _evaluate_condition(current_val, prev_val, operator, threshold):
    """
    Returns True if condition is met.
    For crosses: requires both current_val and prev_val.
    """
    if current_val is None:
        return False

    if operator == '>':  return current_val > threshold
    if operator == '<':  return current_val < threshold
    if operator == '>=': return current_val >= threshold
    if operator == '<=': return current_val <= threshold
    if operator == '=':  return abs(current_val - threshold) < 1e-8

    if operator in ('crosses_above', 'crosses_below'):
        if prev_val is None:
            return False  # SKIP: insufficient data for cross evaluation
        if operator == 'crosses_above':
            return prev_val < threshold <= current_val
        if operator == 'crosses_below':
            return prev_val > threshold >= current_val

    return False
```

**Logging for skipped alerts:**
```python
if prev_val is None and operator in ('crosses_above', 'crosses_below'):
    skip_log.append({
        'alert_id': str(alert['id']),
        'reason': 'insufficient_data_for_cross',
        'ticker_id': str(alert['ticker_id'])
    })
    continue
```

### Table Selection Logic

```python
def _get_price_table(system_ticker_status: str) -> str:
    """
    active  → ticker_prices_intraday (most recent reading)
    pending → ticker_prices (EOD — may have limited history)
    inactive → ticker_prices (EOD only)
    cancelled → DO NOT evaluate — skip alert
    """
    if system_ticker_status == 'active':
        return 'ticker_prices_intraday'
    elif system_ticker_status == 'cancelled':
        return None  # skip
    else:
        return 'ticker_prices'
```

### Job Run Log Integration

At the end of each run:
```python
await conn.execute(
    """
    UPDATE admin_data.job_run_log
    SET completed_at = now(),
        status = $1,
        records_processed = $2,
        records_updated = $3,
        error_count = $4,
        error_details = $5::jsonb
    WHERE id = $6
    """,
    'success' if error_count == 0 else 'partial_error',
    alerts_checked,
    alerts_triggered,
    error_count,
    json.dumps({'skipped': skip_log, 'errors': error_log}),
    run_id
)
```

---

## ADDITIONAL IMPLEMENTATION NOTES

### Auth Token Standard

All fetch calls in frontend must use a consistent auth token retrieval. Verify the project's canonical token storage key from `ui/src/utils/auth.js` or equivalent before implementing Gap A and Gap C. Do NOT assume — read the existing auth utilities first.

### PhoenixModal cancelButtonText Default Fix

The current `PhoenixModal.js` default for `cancelButtonText` is `'לבטל'` (line 19). Per the Iron Rule, ALL new calls must explicitly pass `cancelButtonText: 'ביטול'`. The PhoenixModal default itself should also be updated to `'ביטול'` as part of the UX consistency sweep.

### `entityOptionLoader.js` — API Endpoint Verification

Before implementing, verify that the following endpoints exist and return list data:
- `GET /api/v1/me/tickers` — ✅ confirmed (me_tickers.py router)
- `GET /api/v1/alerts` — ✅ confirmed (alerts.py router)
- `GET /api/v1/trading-accounts` — ✅ confirmed (trading_accounts.py router)
- `GET /api/v1/trades` — verify existence
- `GET /api/v1/trade-plans` — verify existence

For any endpoint that does not yet exist, the entity type should show a "not yet available" disabled option rather than failing silently.

---

**log_entry | TEAM_00 | ARCHITECT_DIRECTIVE_SUPPLEMENT | G7_REMEDIATION_LOD400_GAP_CLOSURE | LOCKED | 2026-03-01**

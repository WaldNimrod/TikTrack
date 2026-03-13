# Team 20 | S001-P002-WP001 Alerts Summary Widget — API Verification

**project_domain:** TIKTRACK  
**id:** TEAM_20_S001_P002_WP001_ALERTS_WIDGET_API_VERIFICATION  
**from:** Team 20 (Backend)  
**ref:** S001-P002 WP001 Alerts Summary Widget on D15.I home dashboard  
**date:** 2026-03-12  
**status:** VERIFIED — No backend changes required  

---

## 1) Mandate Summary

- **Widget:** Alerts Summary — read-only, on D15.I home dashboard
- **Uses:** Existing GET /api/v1/alerts/ endpoint
- **Per-alert:** ticker symbol · condition label · triggered_at (relative time)
- **Features:** Triggered-unread count badge, list of N=5 most recent, fully hidden when 0
- **Constraints:** No new backend, no schema changes

---

## 2) Endpoints Verified

### 2.1 GET /api/v1/alerts/summary

| Item | Value |
|------|-------|
| **Path** | `/api/v1/alerts/summary` |
| **Auth** | Bearer token (required) |
| **Method** | GET |
| **Params** | None |

**Response shape:**
```json
{
  "total_alerts": 0,
  "active_alerts": 0,
  "new_alerts": 0,
  "triggered_alerts": 0
}
```

| Field | Type | Description |
|-------|------|-------------|
| total_alerts | int | Total alerts (all) |
| active_alerts | int | is_active=true |
| new_alerts | int | Created in last 10 days |
| triggered_alerts | int | is_triggered=true (all triggered) |

**Note:** Summary does NOT include `triggered_unread` count. Use list endpoint (below) with `trigger_status=triggered_unread` and read `total` for badge count.

---

### 2.2 GET /api/v1/alerts (List — primary for widget)

| Item | Value |
|------|-------|
| **Path** | `/api/v1/alerts` |
| **Auth** | Bearer token (required) |
| **Method** | GET |

**Query params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| target_type | str | null | account\|trade\|trade_plan\|ticker\|datetime |
| ticker_id | str | null | Filter by ticker (ULID) |
| is_active | bool | null | Filter by active status |
| **trigger_status** | str | null | **untriggered\|triggered_unread\|triggered_read\|rearmed** |
| page | int | 1 | Page number |
| **per_page** | int | 25 | **Use 5 for widget list** |
| **sort** | str | created_at | **Use triggered_at for widget** |
| **order** | str | desc | asc\|desc |

**Widget-recommended call:**
```
GET /api/v1/alerts?trigger_status=triggered_unread&per_page=5&page=1&sort=triggered_at&order=desc
```

**Response shape:**
```json
{
  "data": [
    {
      "id": "01HXXX...",
      "target_type": "ticker",
      "ticker_id": "01HYYY...",
      "ticker_symbol": "AAPL",
      "target_display_name": null,
      "condition_field": "price",
      "condition_operator": ">=",
      "condition_value": 150.0,
      "condition_summary": "price >= 150",
      "trigger_status": "triggered_unread",
      "triggered_at": "2026-03-12T14:30:00Z",
      "title": "Price alert",
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "total": 3
}
```

**Per-alert fields for widget:**

| Field | Type | Widget use |
|-------|------|------------|
| ticker_symbol | str | Ticker symbol (or target_display_name for non-ticker) |
| condition_summary | str | Condition label (e.g. "price >= 150") |
| triggered_at | datetime | Relative time (e.g. "5 min ago") |
| id | str | Click → D34 (alert detail) |
| total | int | Badge count (triggered-unread) |

---

## 3) Verification Result

| Requirement | Status | Notes |
|-------------|--------|-------|
| GET /api/v1/alerts exists | ✅ | Router: api/routers/alerts.py |
| trigger_status filter | ✅ | triggered_unread supported |
| per_page (N=5) | ✅ | per_page=5 supported |
| sort by triggered_at | ✅ | sort=triggered_at supported |
| ticker_symbol in response | ✅ | From join or display_map |
| condition label | ✅ | condition_summary field |
| triggered_at in response | ✅ | ISO datetime |
| Badge count | ✅ | Use response.total from list call |
| No schema changes | ✅ | All from existing schema |
| No new backend | ✅ | No code changes |

---

## 4) Frontend Integration Guide

**Single-call approach (recommended):**
```javascript
// One call provides both badge count and list
const res = await fetch(
  '/api/v1/alerts?trigger_status=triggered_unread&per_page=5&page=1&sort=triggered_at&order=desc',
  { headers: { Authorization: `Bearer ${token}` } }
);
const { data, total } = await res.json();

// total = badge count (triggered-unread)
// data = up to 5 most recent; each has ticker_symbol, condition_summary, triggered_at
// When total === 0: hide widget (fully hidden when 0)
```

**Per-row display:**
- Symbol: `row.ticker_symbol ?? row.target_display_name ?? '—'`
- Condition: `row.condition_summary ?? row.title`
- Time: `row.triggered_at` → format as relative (e.g. "5 min ago")

**Navigation:**
- Click item → D34 (e.g. `/alerts.html?id={row.id}` or similar)
- Click badge → D34 filtered unread (e.g. `?trigger_status=triggered_unread`)

---

## 5) File References

| Purpose | Path |
|---------|------|
| Router | api/routers/alerts.py |
| Service | api/services/alerts_service.py |
| Schemas | api/schemas/alerts.py |
| Model | api/models/alerts.py |

---

**log_entry | TEAM_20 | S001_P002_WP001_ALERTS_API_VERIFICATION | VERIFIED | 2026-03-12**

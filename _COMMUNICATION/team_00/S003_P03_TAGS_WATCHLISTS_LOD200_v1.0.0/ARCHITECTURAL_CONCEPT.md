---
id: S003_P03_TAGS_WATCHLISTS_LOD200_ARCHITECTURAL_CONCEPT
from: Team 00 (Chief Architect — Nimrod)
program: S003-P03
gate: LOD200 — Architectural Concept
sv: 1.0.0
effective_date: 2026-02-27
project_domain: TIKTRACK
---

# ARCHITECTURAL CONCEPT — LOD200
## S003-P03: Tags + Watchlists (D38 + D26)

---

## Mandatory Identity Header

| Field | Value |
|-------|--------|
| roadmap_id | TIKTRACK_ROADMAP_LOCKED (sv 1.0.0, 2026-02-26) |
| stage_id | S003 |
| program_id | S003-P03 |
| work_package_id | WP001 (D38) / WP002 (D26) / WP003 (FAV) |
| gate_id | PRE-GATE_0 — LOD200 |
| phase_owner | Team 00 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S003 |
| project_domain | TIKTRACK |

---

## §1 — Overview & Architectural Context

### חבילה זו מכילה שני בניות חדשות מלאות:

| עמוד | שם | תפריט | Route | Pattern |
|------|----|-------|-------|---------|
| D38 | ניהול תגיות | הגדרות | `/tag_management.html` | User-scoped CRUD registry |
| D26 | רשימות צפייה | מעקב | `/watch_lists.html` | User-scoped Master-Detail |

### מה גילינו מהקוד הקיים (2026-02-27):

**ממצא קריטי — D38:**
מודל Notes כבר מכיל `tags: ARRAY(String)` (PostgreSQL). ה-notes.html מציין *"תגיות — בתהליך פיתוח"*. ה-summary כבר מחשב `notes_with_tags`.

**משמעות:** D38 הוא **Tag Registry** — לא מיגרציה של נתונים קיימים. Notes ממשיכות לשמור תגיות כ-ARRAY(String). ה-Registry מספק ספריית תגיות מנוהלת שתשמש autocomplete עתידי ב-D35/D28 edit forms. **אין שינוי FK בS003.**

**ממצא קריטי — D26:**
D33 (user_tickers) הוא תנאי קדם לD26 **מסיבת UX**, לא מסיבת מודל נתונים. watch_list_items.ticker_id מצביע על `market_data.tickers` (הקטלוג המלא). ה-Add Ticker modal מציג "מהרשימה שלי" (D33 quick-add tab) כשיפור UX — זו הסיבה שD33 חייב להיות sealed ראשון.

**Shell status:** HTML entry points לשניהם קיימים (+ routes.json + UAI config stubs). אין backend ואין frontend logic. בניה מלאה נדרשת.

---

## §2 — WP001: D38 Tag Management

### §2.1 מטרה
דף הגדרות שמאפשר למשתמש לנהל ספריית תגיות אישית. צור, ערוך, מחק, ופעל/הפסק תגיות. בסיס לautocomplete עתידי בעת הוספת תגיות להערות ולעסקאות.

### §2.2 מודל נתונים

```sql
-- Schema: user_data
CREATE TABLE user_data.user_tags (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    color       VARCHAR(7) NOT NULL DEFAULT '#3B82F6',  -- HEX
    description TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_by  UUID NOT NULL REFERENCES user_data.users(id),
    updated_by  UUID NOT NULL REFERENCES user_data.users(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ,
    CONSTRAINT uq_user_tags_name_per_user
        UNIQUE (user_id, name) WHERE deleted_at IS NULL
);

CREATE INDEX idx_user_tags_user_id ON user_data.user_tags(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_user_tags_name ON user_data.user_tags(user_id, name) WHERE deleted_at IS NULL;
```

**Iron Rules Applied:**
- Soft delete via `deleted_at` (standard TikTrack pattern)
- `NUMERIC(20,8)` not required (no financial values in D38)
- `maskedLog` mandatory in all JS + Python files

### §2.3 Backend

#### Files to Create
| File | Path |
|------|------|
| Model | `api/models/user_tags.py` |
| Schemas | `api/schemas/user_tags.py` |
| Router | `api/routers/me_tags.py` |
| Main (modify) | `api/main.py` — add `app.include_router(me_tags.router)` |

#### API Contract

```
GET  /api/v1/me/tags
  Query: is_active (bool, optional), sort (name|created_at, default: name), order (asc|desc, default: asc)
       page (int, default: 1), per_page (int, default: 25)
  Auth: get_current_user (user-scoped — NOT admin)
  Response: TagListResponse { data: TagResponse[], total: int }
  Errors: 401

GET  /api/v1/me/tags/summary
  Auth: get_current_user
  Response: TagSummary { total: int, active: int, inactive: int }
  Errors: 401

POST /api/v1/me/tags
  Body: TagCreate { name: str (max 100), color: str (HEX #RRGGBB), description: str|null }
  Auth: get_current_user
  Response: TagResponse 201
  Errors: 401, 409 (duplicate name), 422 (invalid color format)

GET  /api/v1/me/tags/{tag_id}
  Auth: get_current_user (must own tag)
  Response: TagResponse
  Errors: 401, 403, 404

PUT  /api/v1/me/tags/{tag_id}
  Body: TagUpdate { name?, color?, description?, is_active? } (exclude_unset=True)
  Auth: get_current_user (must own tag)
  Response: TagResponse
  Errors: 401, 403, 404, 409 (duplicate name on rename), 422

DELETE /api/v1/me/tags/{tag_id}
  Auth: get_current_user (must own tag)
  Response: 204 No Content (soft delete: deleted_at = NOW())
  Errors: 401, 403, 404
```

#### Pydantic Schemas

```python
class TagCreate(BaseModel):
    name: str = Field(..., max_length=100)
    color: str = Field(default='#3B82F6', pattern=r'^#[0-9A-Fa-f]{6}$')
    description: Optional[str] = None

class TagUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$')
    description: Optional[str] = None
    is_active: Optional[bool] = None

class TagResponse(BaseModel):
    id: UUID
    name: str
    color: str
    description: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime

class TagSummary(BaseModel):
    total: int
    active: int
    inactive: int

class TagListResponse(BaseModel):
    data: list[TagResponse]
    total: int
```

### §2.4 Frontend Architecture

#### Files to Create
| File | Path | Pattern Reference |
|------|------|------------------|
| Table Init | `ui/src/views/settings/tagManagement/tagManagementTableInit.js` | D34 alertsTableInit.js |
| Form | `ui/src/views/settings/tagManagement/tagManagementForm.js` | D35 notesForm.js |
| Data Loader | `ui/src/views/settings/tagManagement/tagManagementDataLoader.js` | D34 alertsDataLoader.js |
| Content HTML | `ui/src/views/settings/tagManagement/tag_management.content.html` | D34 alerts content |

#### Files to Modify
| File | Change |
|------|--------|
| `ui/src/views/settings/tagManagement/tagManagementPageConfig.js` | Add components array, page metadata |

#### UI Layout

```
┌─────────────────────────────────────────────────────┐
│  SUMMARY BAR: סה"כ: N | פעילות: N | לא פעילות: N  │
├─────────────────────────────────────────────────────┤
│  [+ הוסף תגית]                    [🔍 חיפוש...]   │
├──────┬────────────────┬──────────────┬──────┬───────┤
│ צבע  │ שם תגית       │ תיאור        │ סטטוס│ פעולות│
├──────┼────────────────┼──────────────┼──────┼───────┤
│  ●   │ Dividend       │ מניות דיבי...│פעיל  │ ⋮    │
│  ●   │ Growth         │              │פעיל  │ ⋮    │
│  ●   │ High Risk      │ עסקאות בסיכ│לא פעיל│ ⋮    │
└──────┴────────────────┴──────────────┴──────┴───────┘
│ Pagination: מציג 1-3 מתוך 3 | [10][25][50]        │
└─────────────────────────────────────────────────────┘
```

#### Table Columns
| Column | Sort Key | Notes |
|--------|----------|-------|
| צבע | — | Colored circle (HEX → CSS `background-color`) |
| שם תגית | `name` | Clickable → edit modal |
| תיאור | — | Truncated at 60 chars |
| סטטוס | `is_active` | "פעיל" / "לא פעיל" badge |
| נוצר | `created_at` | Date formatted |
| פעולות | — | Three-dot menu: ✏️ ערוך / 🗑️ מחק |

#### Create/Edit Modal Fields
```
שם תגית *: [__________________] (max 100)
צבע:       [████] #3B82F6 (HTML color input type="color")
תיאור:     [__________________] (optional textarea)
סטטוס:     [● פעיל ○ לא פעיל] (edit mode only)
```

#### JavaScript Architecture
```javascript
// tagManagementTableInit.js
import { maskedLog } from '../../../utils/maskedLog.js';
import sharedServices from '../../../components/core/sharedServices.js';
import { createModal } from '../../../components/shared/PhoenixModal.js';
import { TagManagementDataLoader } from './tagManagementDataLoader.js';

// Main flow:
// 1. sharedServices.init() → authenticate
// 2. TagManagementDataLoader.loadAll() → GET /me/tags + /me/tags/summary
// 3. renderSummary(summary) → update summary bar
// 4. renderTable(tags) → populate table
// 5. PhoenixTableSortManager → column sorting
// 6. Pagination → 25/page default
// 7. handleAdd() → TagManagementForm.show({mode: 'create'})
// 8. handleEdit(tag) → TagManagementForm.show({mode: 'edit', data: tag})
// 9. handleDelete(id) → confirm → DELETE /me/tags/{id} → reload
```

### §2.5 Test Infrastructure

#### API Test Script
`scripts/run-tag_management-d38-qa-api.sh`

Test cases (minimum 12):
```
T01: GET /me/tags — authenticated → 200
T02: GET /me/tags — unauthenticated → 401
T03: POST /me/tags — valid → 201, returns tag
T04: POST /me/tags — duplicate name → 409
T05: POST /me/tags — invalid color format → 422
T06: GET /me/tags/summary — counts correct after T03
T07: PUT /me/tags/{id} — rename → 200, updated
T08: PUT /me/tags/{id} — deactivate (is_active=false) → 200
T09: PUT /me/tags/{id} — wrong user → 403
T10: GET /me/tags/{id} — correct user → 200
T11: GET /me/tags/{id} — wrong user → 403
T12: DELETE /me/tags/{id} — soft delete → 204
T13: GET /me/tags/{id} after delete → 404
T14: GET /me/tags/summary after delete → counts updated
```

#### E2E Test
`tests/tag_management-d38-e2e.test.js` — Selenium

Mandatory test cases:
1. Page loads, LEGO structure correct (tt-container, tt-section)
2. Summary bar shows correct counts
3. Create tag → appears in table
4. Edit tag (name + color + description) → changes persist
5. Deactivate tag → badge changes to "לא פעיל"
6. Delete tag → removed from table; summary updates
7. XSS: `<script>alert(1)</script>` as tag name → escaped in DOM
8. Duplicate name → error message visible

### §2.6 D38 DONE Definition

```
✅ GET/POST/PUT/DELETE /me/tags — functional (all HTTP status codes correct)
✅ GET /me/tags/summary — correct counts (including after mutations)
✅ Color stored as valid HEX; displayed as colored swatch in table
✅ Unique name per user enforced; 409 returned on duplicate
✅ Soft delete works; deleted tags excluded from GET /me/tags
✅ Pagination: 25/page default, sortable by name/created_at
✅ E2E: Full CRUD cycle PASS (create → read → edit → deactivate → delete)
✅ XSS: tag name rendered as text, not HTML
✅ API script: 14+ tests, 100% PASS, JSON summary output, env vars only
✅ SOP-013 Seal issued by Team 90
```

---

## §3 — WP002: D26 Watchlists

### §3.1 מטרה
דף מעקב שמאפשר למשתמש לארגן טיקרים לרשימות צפייה מנוהלות. כל רשימה מכילה טיקרים עם הערות אישיות. ה-Add Ticker modal מציג "מהרשימה שלי" (D33) כ-quick-add tab ו-"כל הקטלוג" לחיפוש מורחב.

**פאטרן חדש:** D26 הוא עמוד **Master-Detail** ראשון ב-TikTrack. פאנל שמאל = רשימת watchlists; פאנל ימין = תוכן הרשימה הנבחרת.

### §3.2 מודל נתונים

```sql
-- Schema: user_data

CREATE TABLE user_data.watch_lists (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    color       VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_by  UUID NOT NULL REFERENCES user_data.users(id),
    updated_by  UUID NOT NULL REFERENCES user_data.users(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ,
    CONSTRAINT uq_watch_list_name_per_user
        UNIQUE (user_id, name) WHERE deleted_at IS NULL
);

CREATE TABLE user_data.watch_list_items (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    watch_list_id UUID NOT NULL REFERENCES user_data.watch_lists(id) ON DELETE CASCADE,
    ticker_id     UUID NOT NULL REFERENCES market_data.tickers(id),  -- Full catalog
    note          TEXT,
    sort_order    INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at    TIMESTAMPTZ,
    CONSTRAINT uq_watch_list_ticker
        UNIQUE (watch_list_id, ticker_id) WHERE deleted_at IS NULL
);

-- NOTE: D33 dependency = UX only (quick-add from user's tracked tickers)
--       ticker_id references market_data.tickers (any ticker in catalog)

CREATE INDEX idx_watch_lists_user_id ON user_data.watch_lists(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_watch_list_items_list_id ON user_data.watch_list_items(watch_list_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_watch_list_items_ticker_id ON user_data.watch_list_items(ticker_id);
```

**Iron Rules Applied:**
- Soft delete on both tables
- Cascade: deleting watch_list soft-deletes all its items
- `NUMERIC(20,8)` not required (D26 displays prices from market_data; no calculations)
- `maskedLog` mandatory

### §3.3 Backend

#### Files to Create
| File | Path |
|------|------|
| Models | `api/models/watch_lists.py` |
| Schemas | `api/schemas/watch_lists.py` |
| Router | `api/routers/me_watch_lists.py` |
| Main (modify) | `api/main.py` — add `app.include_router(me_watch_lists.router)` |

#### API Contract

```
GET  /api/v1/me/watch-lists
  Query: is_active (bool, optional), sort (name|created_at, default: name), order (asc|desc)
  Auth: get_current_user
  Response: WatchListListResponse { data: WatchListSummary[], total: int }
  WatchListSummary: { id, name, description, color, is_active, item_count, created_at }
  Errors: 401

POST /api/v1/me/watch-lists
  Body: WatchListCreate { name: str (max 200), description: str|null, color: str }
  Auth: get_current_user
  Response: WatchListResponse 201
  Errors: 401, 409 (duplicate name), 422

GET  /api/v1/me/watch-lists/{wl_id}
  Auth: get_current_user (must own watchlist)
  Response: WatchListResponse { id, name, description, color, is_active, created_at, updated_at }
  Errors: 401, 403, 404

PUT  /api/v1/me/watch-lists/{wl_id}
  Body: WatchListUpdate { name?, description?, color?, is_active? } (exclude_unset=True)
  Auth: get_current_user (must own watchlist)
  Response: WatchListResponse
  Errors: 401, 403, 404, 409 (duplicate name), 422

DELETE /api/v1/me/watch-lists/{wl_id}
  Auth: get_current_user (must own watchlist)
  Response: 204 (soft deletes watchlist + cascades items)
  Errors: 401, 403, 404

GET  /api/v1/me/watch-lists/{wl_id}/items
  Query: sort (symbol|company_name|created_at, default: created_at), order (asc|desc)
  Auth: get_current_user (must own watchlist)
  Response: WatchListItemListResponse { data: WatchListItemResponse[], total: int }
  WatchListItemResponse includes: JOIN market_data.tickers (symbol, company_name,
    current_price, daily_change_pct, ticker_type)
  Errors: 401, 403, 404

POST /api/v1/me/watch-lists/{wl_id}/items
  Body: WatchListItemCreate { ticker_id: UUID, note: str|null, sort_order: int|null }
  Auth: get_current_user (must own watchlist)
  Response: WatchListItemResponse 201
  Errors: 401, 403, 404 (watchlist not found), 404 (ticker not found in market_data),
          409 (ticker already in watchlist), 422

DELETE /api/v1/me/watch-lists/{wl_id}/items/{item_id}
  Auth: get_current_user (must own watchlist)
  Response: 204 (soft delete)
  Errors: 401, 403, 404

PUT  /api/v1/me/watch-lists/{wl_id}/items/{item_id}
  Body: WatchListItemUpdate { note?, sort_order? } (exclude_unset=True)
  Auth: get_current_user (must own watchlist)
  Response: WatchListItemResponse
  Errors: 401, 403, 404, 422
```

#### Pydantic Schemas

```python
class WatchListCreate(BaseModel):
    name: str = Field(..., max_length=200)
    description: Optional[str] = None
    color: str = Field(default='#3B82F6', pattern=r'^#[0-9A-Fa-f]{6}$')

class WatchListUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$')
    is_active: Optional[bool] = None

class WatchListSummary(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    color: str
    is_active: bool
    item_count: int  # computed from watch_list_items count
    created_at: datetime

class WatchListItemCreate(BaseModel):
    ticker_id: UUID
    note: Optional[str] = None
    sort_order: Optional[int] = 0

class WatchListItemUpdate(BaseModel):
    note: Optional[str] = None
    sort_order: Optional[int] = None

class WatchListItemResponse(BaseModel):
    id: UUID
    ticker_id: UUID
    symbol: str          # from market_data.tickers JOIN
    company_name: str
    current_price: Optional[Decimal]
    daily_change_pct: Optional[Decimal]
    ticker_type: str
    note: Optional[str]
    sort_order: int
    created_at: datetime
```

### §3.4 Frontend Architecture

#### Files to Create
| File | Path |
|------|------|
| Main Init | `ui/src/views/tracking/watchLists/watchListsInit.js` |
| Left Panel | `ui/src/views/tracking/watchLists/watchListsPanelInit.js` |
| Right Panel | `ui/src/views/tracking/watchLists/watchListsDetailInit.js` |
| WL Form | `ui/src/views/tracking/watchLists/watchListsForm.js` |
| Item Form | `ui/src/views/tracking/watchLists/watchListsItemForm.js` |
| Data Loader | `ui/src/views/tracking/watchLists/watchListsDataLoader.js` |
| Content HTML | `ui/src/views/tracking/watchLists/watch_lists.content.html` |

#### Files to Modify
| File | Change |
|------|--------|
| `ui/src/views/tracking/watchLists/watchListsPageConfig.js` | Add components array |

#### UI Layout — Master-Detail

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER: רשימות צפייה | N רשימות                               │
├────────────────────┬────────────────────────────────────────────┤
│  LEFT PANEL        │  RIGHT PANEL                               │
│  [+ צור רשימה]    │  [שם הרשימה הנבחרת]  [✏️] [🗑️]          │
│  ─────────────    │  תיאור: ...                                │
│  ● טכנולוגיה 5  │  [+ הוסף טיקר]                             │
│  ● מסחר יומי  8  ├────┬──────────┬────────┬────────┬──────────┤
│  ● ETFs      12  │סמל │שם חברה   │מחיר    │שינוי%  │פעולות   │
│                  ├────┼──────────┼────────┼────────┼──────────┤
│  (empty state:   │AAPL│Apple Inc │$182.50 │+1.2%   │ ⋮       │
│   "אין רשימות   │MSFT│Microsoft │$415.20 │-0.3%   │ ⋮       │
│   צור רשימה     │TSLA│Tesla     │$198.00 │+3.1%   │ ⋮       │
│   ראשונה")      └────┴──────────┴────────┴────────┴──────────┘
│                  │ Pagination: מציג 1-3 מתוך 3               │
└────────────────────┴────────────────────────────────────────────┘
```

#### Left Panel — Watchlist Cards
```
┌──────────────────────┐
│ ● טכנולוגיה         │ ← colored dot
│ 5 טיקרים            │
│ תיאור קצר...        │
└──────────────────────┘
```
Click → loads items in right panel (selected card highlighted)

#### Add Ticker Modal — Two Tabs

```
┌─────────────────────────────────────┐
│ הוסף טיקר לרשימה                    │
├────────────────────┬────────────────┤
│ ⭐ מהרשימה שלי    │ 🔍 כל הקטלוג  │ ← two tabs
├────────────────────┴────────────────┤
│ Tab 1: D33 tickers (pre-loaded)     │
│  □ AAPL — Apple Inc                 │
│  □ MSFT — Microsoft                 │
│  (sorted by symbol)                 │
├─────────────────────────────────────┤
│ Tab 2: Search all market_data       │
│  [🔍 חפש סמל או שם...]             │
│  Results appear below               │
├─────────────────────────────────────┤
│ הערה (אופציונלי): [____________]   │
│           [ביטול] [הוסף לרשימה]    │
└─────────────────────────────────────┘
```

**D33 Quick-Add Tab:** GET /me/tickers (D33 list) — loads user's tracked tickers. Tickers already in this watchlist shown as disabled/checked.

**Catalog Search Tab:** On input (≥2 chars) → GET /tickers?search=QUERY (admin endpoint for ticker lookup). Shows symbol + company_name results.

#### JavaScript Architecture
```javascript
// watchListsInit.js — main orchestrator
// 1. sharedServices.init() → authenticate
// 2. WatchListsPanelInit.init() → load left panel (GET /me/watch-lists)
// 3. WatchListsDetailInit.init() → setup right panel (empty state initially)
// 4. Binding: panel card click → WatchListsDetailInit.loadWatchList(id)

// watchListsPanelInit.js — left panel
// - Renders watchlist cards
// - Handles: [+ צור רשימה] → WatchListsForm.show({mode: 'create'})
// - Handles: card click → emit 'watchlist-selected' event

// watchListsDetailInit.js — right panel
// - Handles 'watchlist-selected' event → GET /me/watch-lists/{id}/items
// - Renders items table (symbol, company_name, price, change%, note)
// - Handles: [✏️] → WatchListsForm.show({mode: 'edit', data: wl})
// - Handles: [🗑️] → confirm → DELETE /me/watch-lists/{id}
// - Handles: [+ הוסף טיקר] → WatchListsItemForm.show({watchListId})
// - Handles: item ⋮ menu → Edit note / Remove
```

### §3.5 Empty State Handling

**No watchlists (left panel):**
```
אין רשימות צפייה עדיין
לחץ "+ צור רשימה" כדי להתחיל
[+ צור את הרשימה הראשונה שלך]
```

**Watchlist selected but no items (right panel):**
```
רשימה זו עדיין ריקה
הוסף טיקרים מהקטלוג או מרשימת הטיקרים שלך
[+ הוסף טיקר ראשון]
```

### §3.6 Test Infrastructure

#### API Test Script
`scripts/run-watch_lists-d26-qa-api.sh`

Test cases (minimum 15):
```
T01: GET /me/watch-lists — authenticated → 200
T02: GET /me/watch-lists — unauthenticated → 401
T03: POST /me/watch-lists — create → 201
T04: POST /me/watch-lists — duplicate name → 409
T05: GET /me/watch-lists/{id} — owner → 200
T06: GET /me/watch-lists/{id} — wrong user → 403
T07: PUT /me/watch-lists/{id} — rename → 200
T08: DELETE /me/watch-lists/{id} — → 204; items cascaded
T09: POST /me/watch-lists/{id}/items — add ticker → 201
T10: POST /me/watch-lists/{id}/items — same ticker again → 409
T11: POST /me/watch-lists/{id}/items — invalid ticker_id → 404
T12: GET /me/watch-lists/{id}/items — returns ticker data via JOIN
T13: PUT /me/watch-lists/{id}/items/{item_id} — update note → 200
T14: DELETE /me/watch-lists/{id}/items/{item_id} — → 204
T15: GET /me/watch-lists/{id}/items after item delete — excluded from list
T16: Cascade: delete watchlist → all items gone (GET /items → 404 for watchlist)
```

#### E2E Test
`tests/watch_lists-d26-e2e.test.js` — Selenium

Mandatory test cases:
1. Page loads, master-detail layout renders (left + right panels)
2. Empty state message visible when no watchlists
3. Create watchlist → appears in left panel
4. Select watchlist → right panel loads items (empty state initially)
5. Add ticker (via "מהרשימה שלי" tab) → appears in items table
6. Add ticker (via catalog search) → appears in items table
7. Duplicate ticker in same watchlist → error message visible
8. Edit watchlist (rename + recolor) → changes reflect in panel card
9. Edit item note → note visible in table
10. Remove item from watchlist → removed from table
11. Delete watchlist → removed from left panel; right panel shows empty state

### §3.7 D26 DONE Definition

```
✅ Full CRUD on watchlists (create/read/update/delete) — all HTTP codes correct
✅ Add/remove tickers (from market_data catalog) — item management works
✅ "מהרשימה שלי" tab shows D33 tickers in Add Ticker modal
✅ Catalog search tab allows adding any ticker from market_data
✅ Ticker data (symbol/name/price/change%) loads via JOIN in items list
✅ Soft delete cascade: deleting watchlist removes all items
✅ Unique ticker per watchlist enforced (409 on duplicate)
✅ Master-detail UI: selecting watchlist card loads items in right panel
✅ Empty states handled (no watchlists / no items)
✅ E2E: Create → Add 3 tickers (mix D33+catalog) → Edit note → Remove → Delete — PASS
✅ API script: 16+ tests, 100% PASS, JSON summary, env vars only
✅ XSS: item note and watchlist name rendered as text
✅ SOP-013 Seal issued by Team 90
```

---

## §4 — WP003: FAV Validation (D38 + D26)

Per **ARCHITECT_DIRECTIVE_FAV_PROTOCOL.md** — mandatory before GATE_5.

### FAV Components Required (per page):

| Component | D38 | D26 |
|-----------|-----|-----|
| Full CRUD E2E | ✅ (per §2.5 + §3.6) | ✅ (per §3.6) |
| Business logic tests | Unique name / 409 / HEX validation | Cascade delete / duplicate ticker / cross-user 403 |
| Error contract tests | 401, 403, 404, 409, 422 | 401, 403, 404, 409, 422 |
| Regression tests | All Gate-A scripts re-run | All Gate-A scripts re-run |
| XSS validation | Tag name + description | Watchlist name + item note |

### LOD400 Quality Gate (3 criteria):
1. **Traceability:** Requirements table D38/D26 → spec sections (populated by Team 50)
2. **Standards checklist:** maskedLog ✓ / LEGO structure ✓ / status model ✓ / SOP-013 ✓
3. **Team 00 quality sign-off** (required before GATE_5)

### CATS — NOT REQUIRED
- D38: no financial values
- D26: displays market_data prices (read-only, no computation)
- *(If price alerts per watchlist are added in future stages → CATS applies then)*

---

## §5 — Architecture Decisions Log (LOCKED)

| # | Decision | Rationale |
|---|----------|-----------|
| A1 | D38 = Tag Registry, NOT FK migration | Notes ARRAY(String) stays in S003; autocomplete integration deferred to D35 edit |
| A2 | D26 watch_list_items.ticker_id → market_data.tickers | Full catalog; D33 is UX only (quick-add tab) — Nimrod confirmed 2026-02-27 |
| A3 | D26 = Master-Detail layout (new pattern) | Natural UX for list-of-lists; left panel + right panel |
| A4 | color stored as VARCHAR(7) HEX | Consistent with Phoenix design system; simple validation regex |
| A5 | Soft delete on both D38 + D26 tables | Standard TikTrack pattern; enables future undo/restore |
| A6 | CATS not required for D38/D26 | No financial calculations; purely metadata + display |
| A7 | D38 access: get_current_user (not admin) | Tag management is user-facing (Settings menu, not Admin menu) |
| A8 | D26 access: get_current_user (not admin) | Watchlists are user-facing (Tracking menu) |

---

## §6 — What NOT to Change

- **DO NOT** migrate notes.tags ARRAY(String) to FK in S003 (that's a future D35 update)
- **DO NOT** add shared tag junction tables in S003 (trades, alerts, user_tickers tagging — future stages)
- **DO NOT** add smart/filter-based watchlists (rule-based lists — future stage)
- **DO NOT** add watchlist price alerts (future D34 integration)
- **DO NOT** build D39 (Preferences) or D40 (System Management) — separate WP
- **DO NOT** touch D22 admin page in this package

---

**log_entry | TEAM_00 | S003_P03_TAGS_WATCHLISTS_LOD200 | ARCHITECTURAL_CONCEPT_ISSUED | 2026-02-27**

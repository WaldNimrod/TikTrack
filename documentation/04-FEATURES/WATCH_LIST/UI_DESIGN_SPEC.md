# מפרט עיצוב ממשק משתמש: Watch List
## UI Design Specification: Watch List System

**תאריך:** 28 בינואר 2025  
**גרסה:** 1.0.0  
**מטרה:** מפרט מלא של ממשק המשתמש למערכת Watch List

---

## מבנה עמוד ראשי

**קובץ:** `trading-ui/watch-lists.html`

### Layout Structure

```
┌─────────────────────────────────────────┐
│         Unified Header                  │
├─────────────────────────────────────────┤
│  Top Section                            │
│  ┌───────────────────────────────────┐  │
│  │ Title + "רשימה חדשה" Button      │  │
│  │ Summary Stats Cards               │  │
│  └───────────────────────────────────┘  │
├─────────────────────────────────────────┤
│  Watch Lists Section                    │
│  ┌───────────────────────────────────┐  │
│  │ [List Card] [List Card] [List...] │  │
│  │  Grid of Watch List Cards         │  │
│  └───────────────────────────────────┘  │
├─────────────────────────────────────────┤
│  Active List View Section               │
│  ┌───────────────────────────────────┐  │
│  │ View Mode Toggle                  │  │
│  │ Table/Cards/Compact               │  │
│  │ [Ticker Table/Grid]               │  │
│  └───────────────────────────────────┘  │
├─────────────────────────────────────────┤
│  Flagged Tickers Section (Optional)     │
│  ┌───────────────────────────────────┐  │
│  │ Filter by Flag Color              │  │
│  │ [Flagged Tickers Table]           │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## Section 1: Top Section

### HTML Structure

```html
<div class="top-section" id="watch-lists-top" data-section="top">
  <div class="section-header">
    <div class="table-title">
      <img src="/trading-ui/images/icons/tabler/eye.svg" 
           class="icon section-icon" 
           alt="Watch Lists">
      <span>רשימות צפייה</span>
    </div>
    <div class="table-actions">
      <button type="button"
              data-button-type="ADD"
              data-variant="primary"
              data-icon="➕"
              data-text="רשימה חדשה"
              data-onclick="window.WatchListsPage?.openAddListModal()">
      </button>
      <button type="button"
              data-button-type="REFRESH"
              data-icon="🔄"
              data-text="רענן"
              data-onclick="window.WatchListsPage?.refreshAll()">
      </button>
      <button type="button"
              data-button-type="TOGGLE"
              data-variant="small"
              data-onclick="toggleSection('watch-lists-top')"
              data-text="הצג/הסתר">
      </button>
    </div>
  </div>
  <div class="section-body">
    <!-- Summary Stats -->
    <div class="row g-3" id="watchListsSummary">
      <div class="col-md-3 col-sm-6">
        <div class="info-card info-card-primary">
          <div class="info-card-label">סה״כ רשימות</div>
          <div class="info-card-value" id="totalWatchLists">-</div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6">
        <div class="info-card info-card-secondary">
          <div class="info-card-label">טיקרים כולל</div>
          <div class="info-card-value" id="totalTickers">-</div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6">
        <div class="info-card info-card-success">
          <div class="info-card-label">דגלים פעילים</div>
          <div class="info-card-value" id="activeFlags">-</div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6">
        <div class="info-card info-card-warning">
          <div class="info-card-label">טיקרים חיצוניים</div>
          <div class="info-card-value" id="externalTickers">-</div>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## Section 2: Watch Lists Grid

### HTML Structure

```html
<section class="content-section" id="watch-lists-section" data-section="watch-lists">
  <div class="section-header">
    <div class="table-title">
      <img src="/trading-ui/images/icons/tabler/list.svg" 
           class="icon section-icon" 
           alt="Lists">
      <span>רשימות צפייה</span>
    </div>
    <div class="table-actions">
      <button type="button"
              data-button-type="TOGGLE"
              data-variant="small"
              data-onclick="toggleSection('watch-lists-section')"
              data-text="הצג/הסתר">
      </button>
    </div>
  </div>
  <div class="section-body">
    <div class="row g-3" id="watchListsGrid">
      <!-- Watch List Cards will be rendered here -->
    </div>
  </div>
</section>
```

### Watch List Card Structure

```html
<div class="col-md-4 col-sm-6" 
     data-watch-list-id="{id}"
     draggable="true">
  <div class="watch-list-card">
    <div class="watch-list-card-header" style="background-color: {color_hex}20;">
      <div class="watch-list-card-icon">
        <img src="/trading-ui/images/icons/tabler/{icon}.svg" 
             class="icon" 
             alt="{icon}">
      </div>
      <div class="watch-list-card-actions">
        <button type="button"
                data-button-type="EDIT"
                data-variant="small"
                data-onclick="window.WatchListsPage?.editList({id})">
        </button>
        <button type="button"
                data-button-type="DELETE"
                data-variant="small"
                data-onclick="window.WatchListsPage?.deleteList({id})">
        </button>
      </div>
    </div>
    <div class="watch-list-card-body">
      <h5 class="watch-list-card-title">{name}</h5>
      <div class="watch-list-card-stats">
        <span class="stat-item">
          <img src="/trading-ui/images/icons/tabler/chart-line.svg" 
               class="icon stat-icon" 
               alt="items">
          {item_count} טיקרים
        </span>
      </div>
    </div>
    <div class="watch-list-card-footer">
      <button type="button"
              class="btn btn-sm btn-primary w-100"
              data-onclick="window.WatchListsPage?.selectList({id})">
        פתח רשימה
      </button>
    </div>
  </div>
</div>
```

---

## Section 3: Active List View

### HTML Structure

```html
<section class="content-section" id="active-list-section" data-section="active-list">
  <div class="section-header">
    <div class="table-title">
      <img src="/trading-ui/images/icons/tabler/table.svg" 
           class="icon section-icon" 
           alt="Active List">
      <span id="activeListTitle">בחר רשימה</span>
    </div>
    <div class="table-actions">
      <!-- View Mode Toggle -->
      <div class="btn-group" role="group">
        <button type="button"
                class="btn btn-sm btn-outline-primary active"
                data-view-mode="table"
                data-onclick="window.WatchListsPage?.setViewMode('table')">
          <img src="/trading-ui/images/icons/tabler/table.svg" class="icon" alt="table">
        </button>
        <button type="button"
                class="btn btn-sm btn-outline-primary"
                data-view-mode="cards"
                data-onclick="window.WatchListsPage?.setViewMode('cards')">
          <img src="/trading-ui/images/icons/tabler/cards.svg" class="icon" alt="cards">
        </button>
        <button type="button"
                class="btn btn-sm btn-outline-primary"
                data-view-mode="compact"
                data-onclick="window.WatchListsPage?.setViewMode('compact')">
          <img src="/trading-ui/images/icons/tabler/list.svg" class="icon" alt="compact">
        </button>
      </div>
      <button type="button"
              data-button-type="ADD"
              data-icon="➕"
              data-text="הוסף טיקר"
              data-onclick="window.WatchListsPage?.addTicker()">
      </button>
      <button type="button"
              data-button-type="TOGGLE"
              data-variant="small"
              data-onclick="toggleSection('active-list-section')"
              data-text="הצג/הסתר">
      </button>
    </div>
  </div>
  <div class="section-body">
    <!-- Table View -->
    <div id="tableView" class="view-container" style="display: none;">
      <table class="table table-striped align-middle" 
             id="watchListItemsTable" 
             data-table-type="watch_list_items">
        <thead class="table-light">
          <tr>
            <th class="drag-handle-column"></th>
            <th class="sortable-header">Symbol</th>
            <th class="sortable-header">Name</th>
            <th class="sortable-header">Price</th>
            <th class="sortable-header">Change</th>
            <th class="sortable-header">Change %</th>
            <th>Flag</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="watchListItemsTableBody">
          <!-- Rows will be rendered here -->
        </tbody>
      </table>
    </div>
    
    <!-- Cards View -->
    <div id="cardsView" class="view-container" style="display: none;">
      <div class="row g-3" id="watchListItemsCards">
        <!-- Cards will be rendered here -->
      </div>
    </div>
    
    <!-- Compact View -->
    <div id="compactView" class="view-container" style="display: none;">
      <div class="list-group" id="watchListItemsCompact">
        <!-- Compact list will be rendered here -->
      </div>
    </div>
  </div>
</section>
```

### Table Row Structure

```html
<tr data-item-id="{id}" draggable="true">
  <td class="drag-handle-column">
    <span class="drag-handle">≡</span>
  </td>
  <td>
    <strong>{symbol}</strong>
    {#if external}
      <span class="badge bg-secondary">חיצוני</span>
    {/if}
  </td>
  <td>{name}</td>
  <td>
    {#if external_data}
      {FieldRendererService.renderAmount(price)}
    {else}
      <span class="text-muted">-</span>
    {/if}
  </td>
  <td>
    {#if external_data}
      {FieldRendererService.renderAmount(change_amount)}
    {else}
      <span class="text-muted">-</span>
    {/if}
  </td>
  <td>
    {#if external_data}
      {FieldRendererService.renderPercentage(change_percent)}
    {else}
      <span class="text-muted">-</span>
    {/if}
  </td>
  <td>
    <button type="button"
            class="btn btn-sm btn-flag"
            data-flag-color="{flag_color}"
            data-onclick="window.WatchListsPage?.showFlagPalette({id})">
      {#if flag_color}
        <img src="/trading-ui/images/icons/tabler/flag-filled.svg" 
             class="icon" 
             style="color: {flag_color}" 
             alt="flag">
      {else}
        <img src="/trading-ui/images/icons/tabler/flag.svg" 
             class="icon" 
             alt="flag">
      {/if}
    </button>
  </td>
  <td>
    <div class="btn-group" role="group">
      <button type="button"
              data-button-type="EDIT"
              data-variant="small"
              data-onclick="window.WatchListsPage?.editItem({id})">
      </button>
      <button type="button"
              data-button-type="DELETE"
              data-variant="small"
              data-onclick="window.WatchListsPage?.removeItem({id})">
      </button>
    </div>
  </td>
</tr>
```

---

## Section 4: Flagged Tickers (Optional)

### HTML Structure

```html
<section class="content-section" id="flagged-tickers-section" data-section="flagged">
  <div class="section-header">
    <div class="table-title">
      <img src="/trading-ui/images/icons/tabler/flag.svg" 
           class="icon section-icon" 
           alt="Flagged">
      <span>טיקרים מסומנים</span>
    </div>
    <div class="table-actions">
      <!-- Flag Color Filter -->
      <div class="btn-group" role="group">
        {#each flagColors}
          <button type="button"
                  class="btn btn-sm btn-outline-primary"
                  style="border-color: {color}; color: {color};"
                  data-flag-color="{color}"
                  data-onclick="window.WatchListsPage?.filterByFlag('{color}')">
            <img src="/trading-ui/images/icons/tabler/flag-filled.svg" 
                 class="icon" 
                 style="color: {color}" 
                 alt="{name}">
          </button>
        {/each}
      </div>
      <button type="button"
              data-button-type="TOGGLE"
              data-variant="small"
              data-onclick="toggleSection('flagged-tickers-section')"
              data-text="הצג/הסתר">
      </button>
    </div>
  </div>
  <div class="section-body">
    <table class="table table-striped" 
           id="flaggedTickersTable" 
           data-table-type="flagged_tickers">
      <!-- Similar to watch list items table -->
    </table>
  </div>
</section>
```

---

## Modals

### 1. Add/Edit Watch List Modal

```html
<div class="modal fade" id="watchListModal" tabindex="-1">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="watchListModalTitle">רשימה חדשה</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <form id="watchListForm">
          <div class="mb-3">
            <label for="watchListName" class="form-label">שם הרשימה *</label>
            <input type="text" 
                   class="form-control" 
                   id="watchListName" 
                   required 
                   maxlength="100">
          </div>
          <div class="mb-3">
            <label for="watchListIcon" class="form-label">איקון</label>
            <select class="form-select" id="watchListIcon">
              <!-- Populated from IconSystem -->
            </select>
          </div>
          <div class="mb-3">
            <label for="watchListColor" class="form-label">צבע</label>
            <input type="color" 
                   class="form-control form-control-color" 
                   id="watchListColor" 
                   value="#26baac">
          </div>
          <div class="mb-3">
            <label for="watchListViewMode" class="form-label">תצוגה ברירת מחדל</label>
            <select class="form-select" id="watchListViewMode">
              <option value="table">טבלה</option>
              <option value="cards">כרטיסים</option>
              <option value="compact">קומפקטי</option>
            </select>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>
        <button type="button" 
                class="btn btn-primary" 
                data-onclick="window.WatchListsPage?.saveWatchList()">
          שמור
        </button>
      </div>
    </div>
  </div>
</div>
```

### 2. Add Ticker Modal

```html
<div class="modal fade" id="addTickerModal" tabindex="-1">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">הוסף טיקר לרשימה</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <form id="addTickerForm">
          <div class="mb-3">
            <label for="tickerSearch" class="form-label">חיפוש טיקר</label>
            <input type="text" 
                   class="form-control" 
                   id="tickerSearch" 
                   placeholder="הקלד symbol או שם...">
            <div id="tickerSearchResults" class="mt-2">
              <!-- Search results will appear here -->
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">או טיקר חיצוני</label>
            <div class="row g-2">
              <div class="col-md-6">
                <input type="text" 
                       class="form-control" 
                       id="externalSymbol" 
                       placeholder="Symbol">
              </div>
              <div class="col-md-6">
                <input type="text" 
                       class="form-control" 
                       id="externalName" 
                       placeholder="שם (אופציונלי)">
              </div>
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>
        <button type="button" 
                class="btn btn-primary" 
                data-onclick="window.WatchListsPage?.addTickerToList()">
          הוסף
        </button>
      </div>
    </div>
  </div>
</div>
```

### 3. Flag Palette (Quick Action)

```html
<div class="flag-palette-popup" id="flagPalette" style="display: none;">
  <div class="flag-palette-header">בחר צבע דגל</div>
  <div class="flag-palette-colors">
    {#each flagColors}
      <button type="button"
              class="flag-color-btn"
              style="background-color: {color};"
              data-color="{color}"
              data-onclick="window.WatchListsPage?.setFlag({itemId}, '{color}')">
      </button>
    {/each}
  </div>
  <div class="flag-palette-footer">
    <button type="button"
            class="btn btn-sm btn-secondary"
            data-onclick="window.WatchListsPage?.removeFlag({itemId})">
      הסר דגל
    </button>
  </div>
</div>
```

---

## CSS Classes

### Watch List Card
- `.watch-list-card` - Card container
- `.watch-list-card-header` - Header with icon and actions
- `.watch-list-card-body` - Body with name and stats
- `.watch-list-card-footer` - Footer with action button

### Drag & Drop
- `.drag-handle` - Drag handle icon (≡)
- `.drag-handle-column` - Column containing drag handle
- `.dragging` - Applied during drag operation
- `.drag-over` - Applied on drop target

### Flags
- `.btn-flag` - Flag button
- `.flag-palette-popup` - Flag color picker popup
- `.flag-color-btn` - Individual color button in palette

---

## Responsive Design

### Mobile (< 768px)
- Cards grid: 1 column
- Table: Horizontal scroll
- View mode toggle: Icon only (no text)

### Tablet (768px - 1024px)
- Cards grid: 2 columns
- Table: Full width

### Desktop (> 1024px)
- Cards grid: 3 columns
- Table: Full width with all columns

---

## Accessibility

### ARIA Labels
- כל כפתור: `aria-label` בעברית
- כל טבלה: `aria-label` עם תיאור
- Drag handles: `aria-label="סדר מחדש"`

### Keyboard Navigation
- Tab navigation בין כל האלמנטים
- Enter/Space לפעולות
- Arrow keys לניווט בטבלה
- Escape לסגירת modals

---

**סיכום:** הממשק תומך בכל הדרישות עם תמיכה מלאה ב-RTL, Responsive Design, ו-Accessibility.












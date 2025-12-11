# סטנדרטיזציה מוקאפים: Watch List

## Mockup Standardization: Watch List System

**תאריך:** 28 בינואר 2025  
**גרסה:** 1.0.0

---

## עקרונות סטנדרטיזציה

המוקאפים נוצרו לפי הדפוסים הסטנדרטיים של המערכת כפי שמוגדרים במוקאפים הקיימים (`tag-management.html`, `portfolio-state-page.html`).

---

## תבנית עמוד סטנדרטית

### Structure

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <!-- Meta tags -->
    <!-- Bootstrap CSS -->
    <!-- ITCSS layers 1-9 -->
</head>
<body>
    <div class="container-fluid page-container">
        <header>
            <div id="unified-header"></div>
        </header>
        <main>
            <div class="background-wrapper">
                <div class="page-body">
                    <div class="main-content">
                        <!-- Sections -->
                    </div>
                </div>
            </div>
        </main>
    </div>
</body>
</html>
```

---

## Section Structure

### Top Section

```html
<div class="top-section" id="watch-lists-top" data-section="top">
    <div class="section-header">
        <div class="table-title">
            <img src="..." class="icon section-icon">
            <span>Title</span>
        </div>
        <div class="table-actions">
            <!-- Buttons -->
        </div>
    </div>
    <div class="section-body">
        <!-- Content -->
    </div>
</div>
```

### Content Section

```html
<section class="content-section" id="section-id" data-section="section-name">
    <div class="section-header">
        <!-- Same as top section -->
    </div>
    <div class="section-body">
        <!-- Content -->
    </div>
</section>
```

---

## Button Standards

### Button Attributes

- `data-button-type`: ADD, EDIT, DELETE, REFRESH, TOGGLE
- `data-variant`: primary, secondary, small, outline
- `data-icon`: Emoji או דרך IconSystem
- `data-text`: טקסט הכפתור
- `data-onclick`: פונקציה לקריאה

### Examples

```html
<!-- Add Button -->
<button type="button"
        data-button-type="ADD"
        data-variant="primary"
        data-icon="➕"
        data-text="רשימה חדשה"
        data-onclick="window.WatchListsPage?.openAddListModal()">
</button>

<!-- Toggle Button -->
<button type="button"
        data-button-type="TOGGLE"
        data-variant="small"
        data-onclick="toggleSection('section-id')"
        data-text="הצג/הסתר">
</button>
```

---

## Icon Standards

### Format

```html
<img src="/trading-ui/images/icons/tabler/{icon-name}.svg" 
     width="16" height="16" 
     alt="{description}" 
     class="icon {additional-classes}">
```

### Icon Names Used

- `eye` - Watch Lists main
- `chart-line` - Tech stocks
- `flame` - Energy
- `coins` - Crypto
- `list` - Lists
- `table` - Table view
- `cards` - Cards view
- `flag` / `flag-filled` - Flags
- `search` - Search

---

## Table Standards

### Structure

```html
<table class="table table-striped align-middle" 
       id="tableId" 
       data-table-type="table_type">
    <thead class="table-light">
        <tr>
            <th class="sortable-header">Column</th>
        </tr>
    </thead>
    <tbody>
        <!-- Rows -->
    </tbody>
</table>
```

### Drag Handle Column

```html
<th class="drag-handle-column" style="width: 40px;"></th>
<td class="drag-handle-column">
    <span class="drag-handle">≡</span>
</td>
```

---

## Card Standards

### Watch List Card

- Bootstrap card structure
- Header with icon and actions
- Body with title and stats
- Footer with action button

### Watch List Item Card

- Compact card design
- Symbol, Name, Price, Change
- Flag icon
- Hover effects

---

## Modal Standards

### Structure

```html
<div class="modal fade" id="modalId" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Title</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <!-- Form/Content -->
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>
                <button type="button" class="btn btn-primary" data-onclick="...">שמור</button>
            </div>
        </div>
    </div>
</div>
```

---

## Info Summary Cards

### Structure

```html
<div class="info-card info-card-primary">
    <div class="info-card-label">Label</div>
    <div class="info-card-value" id="valueId">-</div>
</div>
```

### Variants

- `info-card-primary`
- `info-card-secondary`
- `info-card-success`
- `info-card-warning`

---

## RTL Support

### Layout

- כל ה-HTML עם `dir="rtl"`
- Sections מימין לשמאל
- Buttons align right
- Tables RTL-ready

### Icons

- מיקום איקונים מותאם ל-RTL
- Flags מימין לשורה

---

## Responsive Design

### Breakpoints

- **Mobile** (< 768px): 1 column cards, horizontal scroll tables
- **Tablet** (768px - 1024px): 2 column cards
- **Desktop** (> 1024px): 3 column cards

### Classes Used

- `col-md-4 col-sm-6` - Cards grid
- `table-responsive` - Table wrapper
- `d-flex`, `gap-*` - Flexbox layouts

---

## Color Standards

### Flag Colors

8 צבעים מתוך entity colors:

1. #26baac - Trade
2. #0056b3 - Trade Plan
3. #28a745 - Account
4. #20c997 - Cash Flow
5. #dc3545 - Ticker
6. #fc5a06 - Alert
7. #6f42c1 - Note
8. #17a2b8 - Execution

### Usage

- Flag icons: `style="color: {flag_color}"`
- Card headers: `style="background-color: {color}20"` (20% opacity)

---

**סיכום:** המוקאפים עוקבים אחר כל הסטנדרטים של המערכת ומוכנים לאינטגרציה מלאה.


























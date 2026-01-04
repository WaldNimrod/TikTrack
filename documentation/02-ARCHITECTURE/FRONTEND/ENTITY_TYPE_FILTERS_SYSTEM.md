# Entity Type Filters System - TikTrack

## סקירה כללית

**Entity Type Filters System** היא מערכת מרכזית ליצירת כפתורי פילטר לפי סוגי ישויות בטבלאות המערכת. המערכת מאפשרת סינון דינמי של נתונים לפי סוג הישות (alerts, notifications, etc.) עם ממשק אחיד.

## ארכיטקטורה

### רכיבי הליבה

#### 1. Entity Type Filter Builder

- **קובץ:** `trading-ui/scripts/services/entity-type-filter-builder.js`
- **תפקיד:** בניית כפתורי פילטר דינמיים לפי סוגי ישויות
- **פלט:** HTML buttons עם event handlers

#### 2. Filter State Manager

- **קובץ:** `trading-ui/scripts/services/filter-state-manager.js`
- **תפקיד:** ניהול מצב הפילטרים הפעילים
- **אחסון:** localStorage עם persistence

#### 3. Table Filter Integration

- **קובץ:** `trading-ui/scripts/services/table-filter-integration.js`
- **תפקיד:** אינטגרציה עם UnifiedTableSystem
- **פונקציות:** apply/remove filters מהטבלה

### מבנה נתונים

```javascript
// Entity type configuration
const entityTypes = {
  alerts: {
    label: 'התראות',
    icon: 'bell',
    color: 'warning',
    count: 15
  },
  notifications: {
    label: 'הודעות',
    icon: 'envelope',
    color: 'info',
    count: 8
  },
  trades: {
    label: 'עסקאות',
    icon: 'chart-line',
    color: 'success',
    count: 25
  }
};
```

## API Reference

### EntityTypeFilterBuilder

#### `buildFilterButtons(entityTypes, container)`

```javascript
// Build filter buttons for container
const buttons = EntityTypeFilterBuilder.buildFilterButtons({
  alerts: { label: 'התראות', count: 5 },
  notifications: { label: 'הודעות', count: 3 }
}, containerElement);

// Returns: Array of button elements with click handlers
```

#### `createFilterButton(entityType, config)`

```javascript
// Create single filter button
const button = EntityTypeFilterBuilder.createFilterButton('alerts', {
  label: 'התראות',
  icon: 'bell',
  color: 'warning',
  count: 15,
  active: true
});

// Returns: Button element with styling and events
```

### Filter State Manager

#### `setActiveFilter(entityType)`

```javascript
// Set active filter
FilterStateManager.setActiveFilter('alerts');

// Updates UI and persists to localStorage
```

#### `getActiveFilters()`

```javascript
// Get currently active filters
const active = FilterStateManager.getActiveFilters();

// Returns: Array of active entity types
```

#### `clearFilters()`

```javascript
// Clear all active filters
FilterStateManager.clearFilters();

// Resets to show all entities
```

## אינטגרציה עם טבלאות

### Unified Table System Integration

```javascript
// Table with entity type filters
const table = new UnifiedTableSystem({
  entityTypes: ['alerts', 'notifications', 'trades'],
  filters: {
    entityType: FilterStateManager.getActiveFilters()
  },
  onFilterChange: (entityType) => {
    FilterStateManager.setActiveFilter(entityType);
  }
});
```

### Filter Application

```javascript
// Apply entity type filter to data
function applyEntityTypeFilter(data, activeTypes) {
  if (!activeTypes || activeTypes.length === 0) {
    return data; // Show all
  }

  return data.filter(item => activeTypes.includes(item.entityType));
}
```

### Real-time Updates

```javascript
// Update filter counts in real-time
function updateFilterCounts(newData) {
  const counts = {};
  newData.forEach(item => {
    counts[item.entityType] = (counts[item.entityType] || 0) + 1;
  });

  EntityTypeFilterBuilder.updateButtonCounts(counts);
}
```

## סגנונות ו-UI

### Button Styling

```css
.entity-filter-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: white;
  transition: all 0.2s ease;
}

.entity-filter-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.entity-filter-btn:hover {
  background: #f8f9fa;
  border-color: #ccc;
}

.entity-filter-count {
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.8em;
  margin-left: 8px;
}
```

### RTL Support

```css
/* RTL adjustments */
[dir="rtl"] .entity-filter-btn {
  margin-left: 8px;
  margin-right: 0;
}

[dir="rtl"] .entity-filter-count {
  margin-left: 0;
  margin-right: 8px;
}
```

## דוגמאות שימוש

### Alerts Table with Filters

```javascript
// Initialize alerts table with entity type filters
const alertsTable = new UnifiedTableSystem('alertsTable', {
  entityTypes: ['price_alerts', 'volume_alerts', 'custom_alerts'],
  columns: ['type', 'message', 'created_at', 'status'],
  filters: {
    entityType: ['price_alerts'], // Default filter
    status: ['active']
  }
});

// Add filter buttons
const filterContainer = document.getElementById('alertsFilters');
EntityTypeFilterBuilder.buildFilterButtons({
  price_alerts: { label: 'התראות מחיר', count: 12 },
  volume_alerts: { label: 'התראות נפח', count: 5 },
  custom_alerts: { label: 'התראות מותאמות', count: 3 }
}, filterContainer);
```

### Notifications Center

```javascript
// Notifications with multiple entity types
const notificationsTable = new UnifiedTableSystem('notificationsTable', {
  entityTypes: ['system', 'trade', 'alert', 'user'],
  filters: {
    read: false, // Only unread
    entityType: FilterStateManager.getActiveFilters()
  }
});
```

## ניטור וביצועים

### Filter Performance Metrics

- **Render Time:** < 50ms for filter buttons
- **Filter Application:** < 100ms for 1000+ rows
- **State Persistence:** localStorage with debouncing
- **Memory Usage:** Minimal overhead

### Usage Analytics

```javascript
// Track filter usage
FilterStateManager.on('filterChanged', (entityType) => {
  Logger.info('Entity type filter changed', {
    entityType,
    timestamp: new Date().toISOString(),
    userId: currentUser?.id
  });
});
```

## תרחישי שימוש

### 1. Alerts Management

- **Entity Types:** price_alerts, volume_alerts, custom_alerts
- **Use Case:** Filter alerts by type for focused management
- **UI Pattern:** Toggle buttons above alerts table

### 2. Notifications Center

- **Entity Types:** system, trade, alert, user
- **Use Case:** Organize notifications by source/category
- **UI Pattern:** Sidebar filter panel

### 3. Audit Logs

- **Entity Types:** login, trade, settings, error
- **Use Case:** Filter audit events by type
- **UI Pattern:** Filter bar with counts

### 4. Activity Feed

- **Entity Types:** trades, executions, alerts, notes
- **Use Case:** Filter activity timeline by content type
- **UI Pattern:** Timeline with type-based filtering

## תחזוקה

### הוספת סוג ישות חדש

1. הוסף ל-entityTypes configuration
2. עדכן FilterStateManager אם נדרש
3. הוסף styling ב-CSS
4. עדכן בדיקות

### עדכון עיצוב

1. שנה CSS classes
2. עדכן EntityTypeFilterBuilder
3. בדוק RTL support
4. עדכן accessibility

### בדיקות

- ✅ Filter button creation
- ✅ State persistence
- ✅ Table integration
- ✅ Performance with large datasets
- ✅ Accessibility compliance

---

**גרסה:** 1.0.0
**תאריך:** 1 בינואר 2026
**סטטוס:** ✅ פעיל ומתועד

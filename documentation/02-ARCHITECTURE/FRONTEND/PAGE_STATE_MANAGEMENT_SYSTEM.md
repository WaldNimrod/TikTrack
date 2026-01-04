# Page State Management System

## Overview

שמירת מצב עמוד, שחזור פילטרים וסקשנים, איפוס מצב.

## File

- `trading-ui/scripts/page-utils.js`
- `trading-ui/scripts/page-state-manager.js`

## Features

### State Persistence

- שמירת פילטרים פעילים
- שמירת מיון ומיון
- שמירת scroll position
- שמירת expanded/collapsed sections

### State Restoration

- שחזור מצב בעת טעינת עמוד
- שחזור מצב אחרי refresh
- שחזור מצב אחרי navigation

### State Reset

- איפוס לברירות מחדל
- איפוס לפי context
- איפוס selective

## API

```javascript
// שמירת מצב עמוד
PageState.save('trades-page', {
  filters: activeFilters,
  sort: currentSort,
  scrollTop: window.scrollY
});

// שחזור מצב עמוד
const state = await PageState.restore('trades-page');
if (state) {
  applyFilters(state.filters);
  applySort(state.sort);
  window.scrollTo(0, state.scrollTop);
}

// איפוס מצב
PageState.reset('trades-page');
```

## Storage Strategy

- **Session Storage** - זמני, נעלם בסגירת tab
- **Local Storage** - קבוע, שורד refresh
- **URL Parameters** - shareable states

## Status

✅ **ACTIVE** - Essential for user experience

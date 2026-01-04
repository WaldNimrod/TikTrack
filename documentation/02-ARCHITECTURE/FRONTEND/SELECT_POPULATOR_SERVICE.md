# Select Populator Service

## Overview

מילוי Selectים מבוססי API כולל caching, fallback ושמירת העדפות.

## File

- `trading-ui/scripts/services/select-populator-service.js`

## Features

### Dynamic Population

- טעינת אפשרויות מ-API
- תמיכה ב-pagination
- חיפוש וסינון
- Lazy loading

### Caching Strategy

- Cache של תוצאות
- TTL configuration
- Memory + localStorage
- Cache invalidation

### Fallback Support

- Offline mode
- Default options
- Error recovery
- Graceful degradation

## API

```javascript
// מילוי select פשוט
await SelectPopulator.populate('#ticker-select', {
  endpoint: '/api/tickers',
  valueField: 'id',
  textField: 'name'
});

// מילוי עם caching
await SelectPopulator.populateWithCache('#account-select', {
  endpoint: '/api/accounts',
  cacheKey: 'user_accounts',
  ttl: 300000 // 5 minutes
});

// מילוי עם חיפוש
await SelectPopulator.populateSearchable('#symbol-select', {
  endpoint: '/api/symbols/search',
  searchParam: 'q',
  minChars: 2
});
```

## Select Types

### Regular Select

```html
<select id="account-select">
  <!-- populated by service -->
</select>
```

### Searchable Select

```html
<select id="ticker-select" data-searchable="true">
  <!-- populated with search -->
</select>
```

### Multi-Select

```html
<select id="tags-select" multiple>
  <!-- populated with multiple selection -->
</select>
```

## Configuration Options

- **endpoint**: API endpoint URL
- **valueField**: Field for option value
- **textField**: Field for option text
- **cache**: Enable/disable caching
- **fallback**: Default options for offline
- **transform**: Data transformation function

## Status

✅ **ACTIVE** - Used across all forms with dynamic selects

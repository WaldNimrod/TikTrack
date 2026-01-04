# Table Sorting System

## Overview

המרת DateEnvelope/ISO/מספרים לערכי מיון יציבים עבור UnifiedTableSystem.

## File

- `trading-ui/scripts/services/table-sort-value-adapter.js`

## Features

### Data Type Conversion

- **Date/Time**: ISO strings, DateEnvelope objects
- **Numbers**: Strings to numbers, currency parsing
- **Text**: Case-insensitive, locale-aware
- **Custom**: Business logic sorting

### Sort Stability

- Consistent ordering
- Null/undefined handling
- Performance optimized
- Memory efficient

## API

```javascript
// המרת ערך למיון
const sortValue = TableSortAdapter.adapt(value, dataType);

// סוגי נתונים נתמכים
const dateSort = TableSortAdapter.adapt('2023-12-01', 'date');
const numberSort = TableSortAdapter.adapt('$1,234.56', 'currency');
const textSort = TableSortAdapter.adapt('Hello World', 'text');

// מיון מערך
const sortedData = data.sort((a, b) => {
  const aValue = TableSortAdapter.adapt(a.price, 'currency');
  const bValue = TableSortAdapter.adapt(b.price, 'currency');
  return aValue - bValue;
});
```

## Data Types

### Date Types

- `iso-date`: "2023-12-01"
- `iso-datetime`: "2023-12-01T10:30:00Z"
- `date-envelope`: { start: "2023-12-01", end: "2023-12-02" }

### Number Types

- `number`: 123.45
- `currency`: "$1,234.56", "€999.99"
- `percentage`: "15.5%"

### Text Types

- `text`: Regular string
- `text-ignore-case`: Case-insensitive
- `text-locale`: Locale-aware sorting

## Performance

### Optimization Techniques

- Lazy evaluation
- Memoization
- Batch processing
- Memory pooling

### Benchmarks

- 1000 rows: < 50ms
- 10000 rows: < 200ms
- Memory usage: < 10MB for large datasets

## Status

✅ **ACTIVE** - Essential for all table sorting operations

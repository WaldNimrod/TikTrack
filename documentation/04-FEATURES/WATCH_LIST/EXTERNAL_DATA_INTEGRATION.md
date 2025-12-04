# אינטגרציה נתונים חיצוניים: Watch List
## External Data Integration: Watch List System

**תאריך:** 28 בינואר 2025  
**גרסה:** 1.0.0

---

## סקירה כללית

מערכת Watch List תומכת בטיקרים חיצוניים (שאינם במערכת) ומשיכת נתוני מחיר עבורם דרך External Data Service.

---

## אסטרטגיה

### 1. משיכה מרוכזת
- **Backend Level**: כל הטיקרים החיצוניים נאספים פעם אחת
- **Batch Processing**: עיבוד לפי batches
- **Cache Shared**: מטמון משותף לכל המשתמשים

### 2. תדירות נמוכה
- לפי הגדרות External Data Service
- Default: 5-15 דקות
- Configurable per provider

### 3. Caching Strategy
- **Backend Cache**: משותף לכל המשתמשים
- **Frontend Cache**: דרך ExternalDataService
- **TTL**: לפי provider settings

---

## Implementation

### Backend: Watch List Items with External Data

```python
# Backend/routes/api/watch_lists.py

@watch_lists_bp.route('/:id/items', methods=['GET'])
def get_watch_list_items(list_id):
    items = WatchListService.get_items(db, list_id)
    
    if request.args.get('include_external_data') == 'true':
        external_symbols = [item.external_symbol for item in items if item.external_symbol]
        
        # Batch fetch external data
        external_data_map = {}
        for symbol in external_symbols:
            quote = yahoo_adapter.get_quote(symbol)
            if quote:
                external_data_map[symbol] = {
                    'price': quote.price,
                    'change_percent': quote.change_percent,
                    'change_amount': quote.change_amount,
                    'volume': quote.volume
                }
        
        # Enrich items with external data
        for item in items:
            if item.external_symbol and item.external_symbol in external_data_map:
                item.external_data = external_data_map[item.external_symbol]
    
    return jsonify({'status': 'success', 'data': [item.to_dict() for item in items]})
```

---

### Frontend: Loading External Data

```javascript
// watch-lists-ui-service.js

async function loadExternalDataForItems(items) {
    const externalItems = items.filter(item => item.external_symbol);
    
    if (externalItems.length === 0) {
        return items;
    }
    
    // Batch load with caching
    const promises = externalItems.map(item =>
        window.ExternalDataService.getQuote(item.external_symbol, {
            forceRefresh: false // Use cache
        }).then(quote => ({
            itemId: item.id,
            data: quote
        })).catch(error => {
            window.Logger?.warn('Failed to load external data', {
                symbol: item.external_symbol,
                error: error.message
            });
            return { itemId: item.id, data: null };
        })
    );
    
    const results = await Promise.allSettled(promises);
    
    // Map results back to items
    const dataMap = new Map();
    results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
            dataMap.set(result.value.itemId, result.value.data);
        }
    });
    
    return items.map(item => ({
        ...item,
        external_data: dataMap.get(item.id) || null
    }));
}
```

---

## Cache Management

### Backend Cache
- **Key Format**: `external_quote:{symbol}`
- **TTL**: לפי provider (Yahoo Finance: 5-15 דקות)
- **Shared**: כל המשתמשים משתמשים באותו cache

### Frontend Cache
- **Service**: ExternalDataService
- **Strategy**: Memory → Backend API
- **TTL**: 60 שניות (configurable)

---

## Error Handling

### No Data Available
```javascript
// Display in UI
if (!item.external_data) {
    return '<span class="text-muted">נתונים לא זמינים</span>';
}
```

### API Failure
```javascript
// Log and continue
window.Logger?.warn('External data fetch failed', {
    symbol: item.external_symbol,
    error: error.message
});
// Item remains without external_data
```

---

## Performance Optimization

### Lazy Loading
- External data נטען רק כש-`includeExternalData=true`
- Default: false (חוסך requests)

### Batch Requests
- כל הטיקרים החיצוניים ברשימה ב-request אחד
- Backend מטפל ב-batching

### Debouncing
- Refresh external data: debounce 5 דקות
- Prevent excessive API calls

---

## User Experience

### Loading State
```html
<td>
    <span class="spinner-border spinner-border-sm" role="status">
        <span class="visually-hidden">טוען...</span>
    </span>
</td>
```

### No Data State
```html
<td>
    <span class="text-muted">נתונים לא זמינים</span>
</td>
```

### Stale Data Indicator
```html
<td>
    $150.25
    <small class="text-muted">(לפני 10 דקות)</small>
</td>
```

---

**סיכום:** אינטגרציה מלאה עם External Data Service עם caching מרוכז וביצועים מיטביים.








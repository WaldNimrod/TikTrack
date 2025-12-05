# תוכנית אינטגרציה: Watch List + Alerts
## Integration Plan: Watch List + Alerts System

**תאריך:** 28 בינואר 2025  
**גרסה:** 1.0.0  
**סטטוס:** תכנון עתידי (Phase 2)

---

## מטרה

אינטגרציה בין מערכת Watch List למערכת Alerts הקיימת, המאפשרת יצירת התראות על שינויי מחיר לטיקרים ב-Watch Lists.

---

## Use Cases

### 1. Price Alert
- התראה כש-m price עובר threshold
- Above/Below price
- Percentage change

### 2. Breakout/Breakdown Alert
- התראה על breakout/breakdown מ-support/resistance
- Volume spike alert

### 3. Quick Alert Creation
- לחיצה על כפתור "Create Alert" ב-item row
- Pre-fill alert form עם ticker info

---

## Integration Points

### 1. Button in Watch List Item
```html
<button type="button"
        data-button-type="SECONDARY"
        data-icon="🔔"
        data-text="התראה"
        data-onclick="window.WatchListsPage?.createAlertFromItem(itemId)">
</button>
```

### 2. Alert Form Pre-fill
```javascript
function createAlertFromItem(itemId) {
    const item = getWatchListItem(itemId);
    const tickerId = item.ticker_id || null;
    const symbol = item.ticker?.symbol || item.external_symbol;
    
    window.AlertModal?.openModal('add', {
        ticker_id: tickerId,
        ticker_symbol: symbol,
        // Pre-fill conditions based on current price
    });
}
```

### 3. Link Back from Alert
- Alert details → Link to Watch List
- "View in Watch List" button

---

## Technical Implementation

### Database
- No schema changes needed
- Alerts כבר תומכים ב-ticker_id

### API
- No new endpoints needed
- Use existing `/api/alerts` endpoints

### Frontend
- Integration ב-watch-lists-ui-service.js
- Button rendering ב-item rows
- Modal pre-fill logic

---

## User Flow

1. User ב-Watch List
2. Clicks "Create Alert" על טיקר
3. Alert modal נפתח עם:
   - Ticker pre-filled
   - Suggested conditions (based on current price)
4. User completes alert creation
5. Alert נוצר ומקושר לטיקר
6. Link back to Watch List מ-Alert details

---

**סטטוס:** תכנון עתידי - לא בשלב ראשון של המימוש.











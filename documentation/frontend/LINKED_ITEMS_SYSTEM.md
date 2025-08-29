# מערכת פריטים מקושרים - TikTrack (מעודכן)

## 📋 סקירה כללית

מערכת הפריטים המקושרים (Linked Items System) היא מערכת גנרית לבדיקה והצגת אזהרות על פריטים מקושרים לפני ביצוע פעולות מסוכנות כמו מחיקה או ביטול. המערכת עברה שדרוג משמעותי וכיום היא גנרית ועובדת עם כל סוגי האובייקטים במערכת.

## 🎯 מטרה

המערכת נועדה למנוע מחיקה או ביטול של פריטים שיש להם קשרים עם פריטים אחרים במערכת, ולספק למשתמש מידע מלא על ההשלכות של הפעולה.

## 🔗 סוגי פריטים מקושרים

### חשבונות (Accounts)
- **טריידים** (Trades) - טריידים מקושרים לחשבון
- **תזרימי מזומנים** (Cash Flows) - תזרימי מזומנים מקושרים לחשבון
- **הערות** (Notes) - הערות מקושרות לחשבון

### טיקרים (Tickers)
- **טריידים** (Trades) - טריידים מקושרים לטיקר
- **תוכניות טרייד** (Trade Plans) - תוכניות טרייד מקושרות לטיקר
- **התראות** (Alerts) - התראות מקושרות לטיקר
- **הערות** (Notes) - הערות מקושרות לטיקר

### טריידים (Trades)
- **ביצועים** (Executions) - ביצועים מקושרים לטרייד
- **הערות** (Notes) - הערות מקושרות לטרייד
- **התראות** (Alerts) - התראות מקושרות לטרייד

### התראות (Alerts)
- **הערות** (Notes) - הערות מקושרות להתראה

### הערות (Notes)
- **הערות תגובה** (Reply Notes) - הערות תגובה מקושרות

## 🛠️ פונקציות המערכת המעודכנות

### 1. פונקציה גנרית לבדיקת פריטים מקושרים

```python
# Backend/services/ticker_service.py
@staticmethod
def check_linked_items_generic(db: Session, entity_type: str, entity_id: int) -> Dict[str, Any]:
    """
    Generic function to check linked items for any entity type
    
    Args:
        db: Database session
        entity_type: Type of entity ('ticker', 'trade', 'account', 'alert', etc.)
        entity_id: ID of the entity
        
    Returns:
        Dictionary with linked items categorized by type
    """
```

**דוגמה לשימוש:**
```python
# בדיקת פריטים מקושרים לטיקר
linked_items = TickerService.check_linked_items_generic(db, 'ticker', ticker_id)

# בדיקת פריטים מקושרים לטרייד
linked_items = TickerService.check_linked_items_generic(db, 'trade', trade_id)

# בדיקת פריטים מקושרים לחשבון
linked_items = TickerService.check_linked_items_generic(db, 'account', account_id)
```

### 2. API Endpoints חדשים

#### בדיקת פריטים מקושרים כללית
```http
GET /api/v1/linked-items/{entity_type}/{entity_id}
```

**דוגמה:**
```http
GET /api/v1/linked-items/ticker/1
GET /api/v1/linked-items/trade/5
GET /api/v1/linked-items/account/3
```

**תגובה:**
```json
{
  "entity_type": "ticker",
  "entity_id": 1,
  "child_entities": [
    {
      "id": 1,
      "type": "trade",
      "title": "טרייד",
      "description": "טרייד buy - stock",
      "created_at": "2025-08-29T10:30:00",
      "status": "open"
    }
  ],
  "parent_entities": [],
  "total_child_count": 1,
  "total_parent_count": 0
}
```

#### בדיקת בטיחות מחיקה
```http
GET /api/v1/linked-items/{entity_type}/{entity_id}/check-deletion
```

**דוגמה:**
```http
GET /api/v1/linked-items/ticker/1/check-deletion
```

**תגובה:**
```json
{
  "entity_type": "ticker",
  "entity_id": 1,
  "can_delete": false,
  "blocking_reason": "Has open trades",
  "blocking_items": {
    "open_trades": [
      {
        "id": 1,
        "type": "trade",
        "title": "טרייד",
        "description": "טרייד buy - stock",
        "created_at": "2025-08-29T10:30:00",
        "status": "open"
      }
    ],
    "open_trade_plans": [],
    "active_alerts": [],
    "notes": [],
    "executions": [],
    "cash_flows": []
  },
  "total_child_count": 1,
  "total_blocking_count": 1
}
```

### 3. Frontend - קריאה לפונקציות

#### בדיקת פריטים מקושרים לטיקר
```javascript
// בדיקת פריטים מקושרים באמצעות API החדש
async function performCancelTickerWithLinkedItemsCheck(id) {
    try {
        const linkedItemsResponse = await fetch(`/api/v1/linked-items/ticker/${id}/check-deletion`);
        if (linkedItemsResponse.ok) {
            const linkedItems = await linkedItemsResponse.json();
            
            if (!linkedItems.can_delete) {
                // הצגת חלון מקושרים שחוסם ביטול
                if (window.showLinkedItemsBlockingModal) {
                    const blockingData = {
                        linkedItems: [],
                        tickerSymbol: ticker.symbol,
                        tickerName: ticker.name
                    };
                    
                    // הוספת פריטים חוסמים
                    if (linkedItems.blocking_items) {
                        // הוספת טריידים פתוחים
                        if (linkedItems.blocking_items.open_trades && linkedItems.blocking_items.open_trades.length > 0) {
                            linkedItems.blocking_items.open_trades.forEach(trade => {
                                const createdDate = new Date(trade.created_at).toLocaleDateString('he-IL');
                                blockingData.linkedItems.push({
                                    type: 'trade',
                                    id: trade.id,
                                    name: trade.title || `טרייד ${trade.id}`,
                                    status: trade.status,
                                    createdDate: createdDate,
                                    details: trade.description || `טרייד ${trade.id}, נוצר: ${createdDate}`
                                });
                            });
                        }
                        
                        // הוספת תכנונים פתוחים
                        if (linkedItems.blocking_items.open_trade_plans && linkedItems.blocking_items.open_trade_plans.length > 0) {
                            linkedItems.blocking_items.open_trade_plans.forEach(plan => {
                                const createdDate = new Date(plan.created_at).toLocaleDateString('he-IL');
                                blockingData.linkedItems.push({
                                    type: 'trade_plan',
                                    id: plan.id,
                                    name: plan.title || `תכנון ${plan.id}`,
                                    status: plan.status,
                                    createdDate: createdDate,
                                    details: plan.description || `תכנון ${plan.id}, נוצר: ${createdDate}`
                                });
                            });
                        }
                        
                        // הוספת התראות פעילות
                        if (linkedItems.blocking_items.active_alerts && linkedItems.blocking_items.active_alerts.length > 0) {
                            linkedItems.blocking_items.active_alerts.forEach(alert => {
                                const createdDate = new Date(alert.created_at).toLocaleDateString('he-IL');
                                blockingData.linkedItems.push({
                                    type: 'alert',
                                    id: alert.id,
                                    name: alert.title || `התראה ${alert.id}`,
                                    status: alert.status,
                                    createdDate: createdDate,
                                    details: alert.description || `התראה ${alert.id}, נוצר: ${createdDate}`
                                });
                            });
                        }
                        
                        // הוספת הערות
                        if (linkedItems.blocking_items.notes && linkedItems.blocking_items.notes.length > 0) {
                            linkedItems.blocking_items.notes.forEach(note => {
                                const createdDate = new Date(note.created_at).toLocaleDateString('he-IL');
                                blockingData.linkedItems.push({
                                    type: 'note',
                                    id: note.id,
                                    name: note.title || `הערה ${note.id}`,
                                    status: note.status,
                                    createdDate: createdDate,
                                    details: note.description || `הערה ${note.id}, נוצר: ${createdDate}`
                                });
                            });
                        }
                    }
                    
                    window.showLinkedItemsBlockingModal(
                        blockingData,
                        'ticker',
                        id,
                        'cancel'
                    );
                }
                return;
            }
            
            console.log('✅ אין פריטים חוסמים - ממשיך לביטול');
        }
    } catch (error) {
        console.warn('⚠️ לא ניתן לבדוק פריטים מקושרים:', error);
    }
}
```

#### בדיקת פריטים מקושרים לכל סוג אובייקט
```javascript
// פונקציה גנרית לבדיקת פריטים מקושרים
async function checkLinkedItemsForEntity(entityType, entityId) {
    try {
        const response = await fetch(`/api/v1/linked-items/${entityType}/${entityId}/check-deletion`);
        if (response.ok) {
            const result = await response.json();
            return result;
        }
    } catch (error) {
        console.error('Error checking linked items:', error);
        return null;
    }
}

// דוגמאות שימוש
const tickerLinkedItems = await checkLinkedItemsForEntity('ticker', 1);
const tradeLinkedItems = await checkLinkedItemsForEntity('trade', 5);
const accountLinkedItems = await checkLinkedItemsForEntity('account', 3);
```

### 4. פונקציות UI גלובליות

#### הצגת חלון חסימה
```javascript
// הצגת חלון מקושרים שחוסם פעולה
window.showLinkedItemsBlockingModal(
    blockingData,    // Object עם linkedItems array
    'ticker',        // סוג האובייקט
    entityId,        // מזהה האובייקט
    'cancel'         // סוג הפעולה ('cancel', 'delete')
);
```

#### מבנה נתונים של blockingData
```javascript
const blockingData = {
    linkedItems: [
        {
            type: 'trade',           // סוג הפריט
            id: 1,                   // מזהה הפריט
            name: 'טרייד 1',         // שם הפריט
            status: 'open',          // סטטוס הפריט
            createdDate: '29/08/2025', // תאריך יצירה
            details: 'פרטים נוספים'   // פרטים נוספים
        }
    ],
    tickerSymbol: 'AAPL',           // סמל הטיקר (לטיקרים)
    tickerName: 'Apple Inc.'        // שם הטיקר (לטיקרים)
};
```

## 🔧 שיפורים במערכת

### 1. גנריות
- **תמיכה בכל סוגי האובייקטים**: `ticker`, `trade`, `account`, `alert`, `note`, `execution`, `cash_flow`
- **API אחיד**: אותו endpoint לכל סוגי האובייקטים
- **לוגיקה משותפת**: אותה פונקציה לבדיקת פריטים מקושרים

### 2. ביצועים
- **שימוש במערכת `linked_items` הקיימת**: במקום לוגיקה נפרדת
- **אופטימיזציה של שאילתות**: שאילתות SQL מאופטמות
- **קאשינג**: תוצאות נשמרות לזמן קצר

### 3. מידע מפורט
- **סיווג פריטים**: פריטים ממוינים לפי סוג
- **פרטים מלאים**: כל המידע הרלוונטי על כל פריט
- **סיבות חסימה**: הסבר ברור למה לא ניתן למחוק/לבטל

### 4. UI משופר
- **חלון חסימה**: הצגת כל הפריטים המקושרים
- **מידע מפורט**: פרטים על כל פריט מקושר
- **הודעות ברורות**: הסבר מדויק על הבעיה

## 📝 דוגמאות שימוש

### בדיקת בטיחות מחיקת טיקר
```javascript
// בדיקה אם ניתן למחוק טיקר
const safetyCheck = await fetch('/api/v1/linked-items/ticker/1/check-deletion');
const result = await safetyCheck.json();

if (!result.can_delete) {
    console.log('לא ניתן למחוק - סיבה:', result.blocking_reason);
    console.log('פריטים חוסמים:', result.blocking_items);
}
```

### בדיקת פריטים מקושרים לטרייד
```javascript
// בדיקת פריטים מקושרים לטרייד
const linkedItems = await fetch('/api/v1/linked-items/trade/5');
const result = await linkedItems.json();

console.log('פריטים מקושרים:', result.child_entities);
console.log('פריטים הורים:', result.parent_entities);
```

### הצגת חלון חסימה
```javascript
// הצגת חלון חסימה עם פריטים מקושרים
const blockingData = {
    linkedItems: [
        {
            type: 'trade',
            id: 1,
            name: 'טרייד AAPL',
            status: 'open',
            createdDate: '29/08/2025',
            details: 'טרייד buy על AAPL, חשבון: חשבון ראשי'
        }
    ],
    tickerSymbol: 'AAPL',
    tickerName: 'Apple Inc.'
};

window.showLinkedItemsBlockingModal(blockingData, 'ticker', 1, 'cancel');
```

## 🚀 יתרונות המערכת המעודכנת

1. **גנריות מלאה**: עובדת עם כל סוגי האובייקטים
2. **ביצועים משופרים**: שימוש במערכת מאופטמת
3. **מידע מפורט**: הצגת כל הפריטים המקושרים
4. **אחידות**: אותה לוגיקה לכל האובייקטים
5. **תחזוקה קלה**: שינויים במרכז אחד
6. **UI משופר**: חלון חסימה מפורט וברור

## 📚 קבצים רלוונטיים

- **Backend**: `Backend/routes/api/linked_items.py`
- **Services**: `Backend/services/ticker_service.py` (פונקציה `check_linked_items_generic`)
- **Frontend**: `trading-ui/scripts/ui-utils.js` (פונקציות UI)
- **API Endpoints**: 
  - `GET /api/v1/linked-items/{entity_type}/{entity_id}`
  - `GET /api/v1/linked-items/{entity_type}/{entity_id}/check-deletion`


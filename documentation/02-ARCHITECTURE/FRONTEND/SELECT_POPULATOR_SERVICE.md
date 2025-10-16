# Select Populator Service - TikTrack
## מערכת מרכזית למילוי select boxes ואובייקטים מקושרים

**תאריך עדכון:** 16 בינואר 2025  
**גרסה:** 2.0  
**סטטוס:** ✅ פעיל - הורחב עם פונקציות לטיפול באובייקטים מקושרים  
**קובץ:** `trading-ui/scripts/services/select-populator-service.js`

### 📋 Overview

השירות מרכזי למילוי select boxes מ-API ולטיפול באובייקטים מקושרים. המערכת מחליפה קוד חוזר ב-16 מקומות במערכת ומאפשרת טיפול אחיד באובייקטים מקושרים כמו התראות והערות.

### 🎯 **Key Features**

- **מילוי select boxes** - טיקרים, חשבונות, מטבעות ותכונות טרייד
- **ברירות מחדל** - מהעדפות משתמש או ערכים ספציפיים
- **סינון ומיון** - אוטומטי לפי סוג השיוך וסטטוס
- **אובייקטים מקושרים** - טיפול ב-3 אלמנטים: סוג שיוך, טיקר, אובייקט לקישור
- **תמיכה מלאה** - בעברית עם מיון א-ב

---

## 🏗️ **Architecture**

### **Class Structure**

```javascript
class SelectPopulatorService {
    // פונקציות עזר מקומיות
    static _getPreferenceFromMemory(preferenceName, aliases = [])
    static _populateSelect(select, data, config)
    
    // פונקציות מילוי select boxes
    static async populateTickersSelect(selectId, options = {})
    static async populateAccountsSelect(selectId, options = {})
    static async populateCurrenciesSelect(selectId, options = {})
    static async populateTradePlansSelect(selectId, options = {})
    static async populateGenericSelect(selectId, endpoint, config)
}
```

### **פונקציות גלובליות לטיפול באובייקטים מקושרים**

```javascript
// פונקציות לטיפול באובייקטים מקושרים
function getFilteredTickers(relationType)
function populateRelatedObjects(relationTypeId, selectedTicker, selectElementId)
function handleRelationTypeChange(selectElement, config)
function handleTickerChange(tickerSelect, config)
```

---

## 📊 **Core Functions**

### **1. מילוי Select Boxes**

#### **`populateTickersSelect(selectId, options)`**
מילוי select box של טיקרים מ-API

**Parameters:**
- `selectId` (string) - ID של ה-select element
- `options` (Object) - אופציות:
  - `includeEmpty` (boolean, default: true) - האם לכלול אופציה ריקה
  - `defaultValue` (number) - ערך ברירת מחדל לפי ID
  - `filterFn` (Function) - פונקציית סינון מותאמת

**Example:**
```javascript
await SelectPopulatorService.populateTickersSelect('tickerSelect', { 
  includeEmpty: true, 
  defaultValue: 5,
  filterFn: (ticker) => ticker.active === true
});
```

#### **`populateAccountsSelect(selectId, options)`**
מילוי select box של חשבונות מסחר

**Parameters:**
- `selectId` (string) - ID של ה-select element
- `options` (Object) - אופציות:
  - `defaultFromPreferences` (boolean) - ברירת מחדל מהעדפות
  - `includeEmpty` (boolean, default: true)

**Example:**
```javascript
await SelectPopulatorService.populateAccountsSelect('accountSelect', { 
  defaultFromPreferences: true 
});
```

#### **`populateCurrenciesSelect(selectId, options)`**
מילוי select box של מטבעות

#### **`populateTradePlansSelect(selectId, options)`**
מילוי select box של תכניות טרייד

#### **`populateGenericSelect(selectId, endpoint, config)`**
מילוי כללי מ-endpoint מותאם

---

## 🔗 **Related Objects Handler Functions**

### **2. סינון וטיפול באובייקטים מקושרים**

#### **`getFilteredTickers(relationType)`**
מסנן טיקרים לפי סוג השיוך

**Parameters:**
- `relationType` (number) - סוג השיוך:
  - `1` = חשבון
  - `2` = טרייד
  - `3` = תכנון טרייד
  - `4` = טיקר

**Returns:** `Array` - מערך טיקרים מסוננים

**Logic:**
- **טרייד (2)**: רק טיקרים שיש להם טריידים פתוחים או סגורים
- **תוכנית (3)**: רק טיקרים שיש להם תכנונים פתוחים או סגורים
- **טיקר (4)**: כל הטיקרים
- **מיון**: א-ב לפי סימבול

#### **`populateRelatedObjects(relationTypeId, selectedTicker, selectElementId)`**
ממלא רשימת אובייקטים לפי סוג השיוך עם סינון ומיון

**Parameters:**
- `relationTypeId` (number) - מזהה סוג השיוך (1-4)
- `selectedTicker` (string, optional) - טיקר נבחר לסינון
- `selectElementId` (string) - ID של אלמנט הבחירה

**Logic by Relation Type:**
- **חשבון (1)**: חשבונות פתוחים בלבד, מיון א-ב לפי שם
- **טרייד (2)**: טריידים פתוחים/סגורים, סינון לפי טיקר, מיון א-ב
- **תוכנית (3)**: תכנונים פתוחים/סגורים, סינון לפי טיקר, מיון א-ב
- **טיקר (4)**: "לא רלוונטי עבור טיקר"

#### **`handleRelationTypeChange(selectElement, config)`**
מטפל בשינוי סוג השיוך ומפעיל/משבית שדות בהתאם

**Parameters:**
- `selectElement` (HTMLSelectElement) - אלמנט הבחירה שנבחר
- `config` (Object) - קונפיגורציה:
  - `tickerSelectId` (string) - ID של select הטיקר
  - `relatedSelectId` (string) - ID של select האובייקט הקשור

**Logic:**
1. **סוג שיוך** - תמיד פעיל
2. **טיקר** - פעיל רק עבור טיקר(4)/תוכנית(3)/טרייד(2)
3. **אובייקט לקישור** - פעיל עבור חשבון(1)/תוכנית(3)/טרייד(2)

#### **`handleTickerChange(tickerSelect, config)`**
מטפל בבחירת טיקר ומפעיל callback בהתאם

**Parameters:**
- `tickerSelect` (HTMLSelectElement) - אלמנט בחירת הטיקר
- `config` (Object) - קונפיגורציה:
  - `relationTypeId` (string) - ID של select סוג השיוך
  - `onTickerChangeCallback` (Function) - פונקציה callback

---

## 🎨 **Usage Examples**

### **Basic Select Population**
```javascript
// מילוי טיקרים עם ברירת מחדל
await SelectPopulatorService.populateTickersSelect('tickerSelect', {
  defaultValue: 123,
  includeEmpty: true
});

// מילוי חשבונות מהעדפות
await SelectPopulatorService.populateAccountsSelect('accountSelect', {
  defaultFromPreferences: true
});
```

### **Related Objects Handling**
```javascript
// הגדרת קונפיגורציה למודל התראות
const config = {
  tickerSelectId: 'alertTicker',
  relatedSelectId: 'alertRelationId'
};

// טיפול בשינוי סוג שיוך
function onRelationTypeChange(selectElement) {
  handleRelationTypeChange(selectElement, config);
}

// טיפול בשינוי טיקר
function onTickerChange(tickerSelect) {
  const config = {
    relationTypeId: 'alertRelationType',
    onTickerChangeCallback: function(relationType, selectedTicker) {
      if (relationType === 2 || relationType === 3) {
        populateRelatedObjects(relationType, selectedTicker, 'alertRelationId');
      }
    }
  };
  handleTickerChange(tickerSelect, config);
}
```

---

## 🏷️ **HTML Integration**

### **Modal Structure for Related Objects**
```html
<!-- 3 אלמנטים לשיוך -->
<div class="row">
    <!-- 1. סוג שיוך - תמיד פעיל -->
    <div class="col-md-4">
        <div class="mb-3">
            <label for="alertRelationType" class="form-label entity-label">סוג שיוך:</label>
            <select class="form-select" id="alertRelationType" required 
                    onchange="onRelationTypeChange(this)">
                <option value="">בחר סוג התראה</option>
                <option value="1">חשבון</option>
                <option value="2">טרייד</option>
                <option value="3">תוכנית טרייד</option>
                <option value="4">טיקר</option>
            </select>
        </div>
    </div>
    
    <!-- 2. טיקר - פעיל לפי סוג -->
    <div class="col-md-4">
        <div class="mb-3">
            <label for="alertTicker" class="form-label entity-label">טיקר:</label>
            <select class="form-select" id="alertTicker" required 
                    onchange="onTickerChange(this)" disabled>
                <option value="">בחר טיקר</option>
            </select>
        </div>
    </div>
    
    <!-- 3. אלמנט לקישור - פעיל לפי סוג -->
    <div class="col-md-4">
        <div class="mb-3">
            <label for="alertRelationId" class="form-label entity-label">אלמנט לקישור:</label>
            <select class="form-select" id="alertRelationId" required 
                    onchange="onRelatedObjectChange(this)" disabled>
                <option value="">בחר קודם סוג התראה</option>
            </select>
        </div>
    </div>
</div>
```

---

## 🔧 **Global Exports**

### **Window Object Exports**
```javascript
// שירות ראשי
window.SelectPopulatorService = SelectPopulatorService;

// קיצורי דרך
window.populateTickersSelect = (selectId, options) => 
    SelectPopulatorService.populateTickersSelect(selectId, options);
window.populateAccountsSelect = (selectId, options) => 
    SelectPopulatorService.populateAccountsSelect(selectId, options);

// פונקציות לטיפול באובייקטים מקושרים
window.getFilteredTickers = getFilteredTickers;
window.populateRelatedObjects = populateRelatedObjects;
window.handleRelationTypeChange = handleRelationTypeChange;
window.handleTickerChange = handleTickerChange;
```

---

## 🎯 **Integration with Unified Loading System**

### **Loading Order**
השירות נטען בשלב 4 (Services) של מערכת הטעינה המאוחדת:

```html
<!-- Stage 4: Services -->
<script src="scripts/services/select-populator-service.js?v=..."></script>
```

### **Dependencies**
- `window.tickersData` - נתוני טיקרים
- `window.accountsData` - נתוני חשבונות
- `window.tradesData` - נתוני טריידים
- `window.tradePlansData` - נתוני תכנונים
- `window.PreferencesSystem` - מערכת העדפות

### **Used By**
- עמודי התראות (`alerts.html`)
- עמודי הערות (`notes.html`)
- כל עמוד עם select boxes (16 מקומות במערכת)

---

## 📈 **Performance & Caching**

### **Data Caching**
- השירות משתמש בנתונים הקיימים ב-`window` objects
- טעינת נתונים חדשים רק כשנדרש
- cache אוטומטי של API responses

### **Memory Optimization**
- פונקציות סטטיות ללא state פנימי
- שימוש בחיפוש יעיל עם `Set` objects
- מיון lazy של נתונים גדולים

---

## 🔍 **Error Handling**

### **Common Issues & Solutions**

#### **Select Element Not Found**
```javascript
const select = document.getElementById(selectId);
if (!select) {
    console.warn(`⚠️ Select ${selectId} לא נמצא`);
    return;
}
```

#### **API Response Issues**
```javascript
try {
    const response = await fetch('/api/tickers/');
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    // ... process data
} catch (error) {
    console.error('❌ שגיאה בטעינת טיקרים:', error);
}
```

#### **Missing Global Data**
```javascript
const allTickers = window.tickersData || [];
const accountsData = (window.accountsData || []).filter(account => 
    account.status === 'open'
);
```

---

## 🚀 **Future Enhancements**

### **Planned Features**
- תמיכה בסינון מתקדם לפי תאריכים
- cache management מתקדם עם TTL
- תמיכה במקלדות עם נווט ב-select boxes
- unit tests מקיפים

### **Performance Improvements**
- lazy loading של select options
- virtual scrolling לרשימות ארוכות
- debounce לשינויים מהירים

---

## 📋 **Change Log**

### **Version 2.0 (January 16, 2025)**
- ✅ הוספת פונקציות לטיפול באובייקטים מקושרים
- ✅ שילוב עם מערכת הטעינה המאוחדת
- ✅ תמיכה ב-3 אלמנטי ממשק (סוג שיוך, טיקר, אובייקט)
- ✅ סינון ומיון אוטומטי לפי סוג וסטטוס

### **Version 1.0 (January 2025)**
- ✅ מערכת בסיסית למילוי select boxes
- ✅ תמיכה בטיקרים, חשבונות, מטבעות ותכניות
- ✅ אינטגרציה עם מערכת העדפות
- ✅ error handling וקונסול לוגים

---

**תאריך עדכון אחרון:** 16 בינואר 2025  
**מחבר:** TikTrack Development Team  
**סטטוס:** ✅ פעיל ונתמך


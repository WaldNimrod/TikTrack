# 📊 TikTrack Phoenix Tables React Framework
**project_domain:** TIKTRACK

**id:** `TT2_TABLES_REACT_FRAMEWORK`  
**owner:** Team 30 (Frontend Execution)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None (New document)  
**last_updated:** 2026-02-05  
**version:** v1.0

---

## 📢 Executive Summary

מערכת טבלאות React מקיפה לניהול נתונים, פילטרים, ומיון. כולל PhoenixTable Component, PhoenixFilterContext, Hooks, ו-Transformation Layer.

---

## 🏗️ Architecture Overview

### **Components:**
- **PhoenixTable** - Component עיקרי לטבלאות
- **PhoenixFilterContext** - Context API לפילטרים גלובליים
- **Hooks** - `usePhoenixTableData`, `usePhoenixTableFilter`, `usePhoenixTableSort`
- **Transformation Layer** - המרת נתונים מ-Backend (snake_case) ל-Frontend (camelCase)

---

## 📦 Core Components

### **PhoenixFilterContext**

**מיקום:** `ui/src/cubes/shared/contexts/PhoenixFilterContext.jsx`

**תיאור:** Context API לניהול פילטרים גלובליים לכל הטבלאות במערכת.

**Features:**
- ניהול מצב פילטרים גלובליים (status, investmentType, tradingAccount, dateRange, search)
- אינטגרציה עם PhoenixBridge (HTML Shell ↔ React Content)
- Listener לאירועי Bridge (`phoenix-filter-change`)
- Sync דו-כיווני בין React Context ל-Bridge

**Usage:**
```jsx
import { usePhoenixFilter } from './contexts/PhoenixFilterContext';

const { filters, setFilter, clearFilters } = usePhoenixFilter();

// עדכון פילטר
setFilter('status', 'active');

// איפוס פילטרים
clearFilters();
```

**Bridge Integration:**
```javascript
// Listen to Bridge events for filter updates from HTML Shell
window.addEventListener('phoenix-filter-change', handleBridgeFilterChange);

// Sync filters to Bridge when they change (from React side)
window.PhoenixBridge.setFilter(key, value);
window.PhoenixBridge.clearFilters();
```

---

## 🎣 React Hooks

### **usePhoenixTableData**

**מיקום:** `ui/src/cubes/shared/hooks/usePhoenixTableData.js`

**תיאור:** Hook לטעינת נתוני טבלה מ-Backend API עם Transformation Layer, Loading states, ו-Error handling.

**Features:**
- טעינת נתונים מ-Backend API
- Transformation Layer אוטומטי (snake_case → camelCase)
- Loading states (loading, error)
- Refetch function לטעינה מחדש

**Usage:**
```javascript
import { usePhoenixTableData } from '../hooks/usePhoenixTableData';
import { tradingAccountsService } from '../../../services/tradingAccountsService';

const { data, loading, error, refetch } = usePhoenixTableData(
  () => tradingAccountsService.list(),
  [filters, sortState]
);

// הנתונים כבר מומרים ל-camelCase
console.log(data); // [{ displayNames: 'חשבון 1', availableAmounts: 1000 }, ...]
```

**Transformation:**
- **Backend:** `display_names`, `available_amounts` (snake_case)
- **Frontend:** `displayNames`, `availableAmounts` (camelCase)
- **Financial Fields:** המרה כפויה למספרים (balance, price, amount, etc.)

---

### **usePhoenixTableFilter**

**מיקום:** `ui/src/cubes/shared/hooks/usePhoenixTableFilter.js`

**תיאור:** Hook לניהול פילטרים מקומיים של טבלה עם שילוב פילטרים גלובליים.

**Features:**
- פילטרים מקומיים של הטבלה
- שילוב עם פילטרים גלובליים (מ-PhoenixFilterContext)
- Audit Trail (ב-debug mode)
- Combined filters (גלובלי + מקומי)

**Usage:**
```javascript
import { usePhoenixTableFilter } from '../hooks/usePhoenixTableFilter';

const { filters, setLocalFilter, clearFilters, combinedFilters } = usePhoenixTableFilter();

// עדכון פילטר מקומי
setLocalFilter('dateFrom', '2026-01-01');

// קבלת פילטרים משולבים (גלובלי + מקומי)
console.log(combinedFilters);
// { global: { search: 'חשבון' }, local: { dateFrom: '2026-01-01' } }
```

---

### **usePhoenixTableSort**

**מיקום:** `ui/src/cubes/shared/hooks/usePhoenixTableSort.js`

**תיאור:** Hook לניהול מיון של טבלה.

**Features:**
- מיון לפי עמוד (column)
- כיוון מיון (ascending/descending)
- מיון מרובה עמודים (multi-column sorting)

**Usage:**
```javascript
import { usePhoenixTableSort } from '../hooks/usePhoenixTableSort';

const { sortState, setSort, clearSort } = usePhoenixTableSort();

// הגדרת מיון
setSort('displayNames', 'asc');

// קבלת מצב מיון
console.log(sortState); // { column: 'displayNames', direction: 'asc' }
```

---

## 🔄 Transformation Layer

### **transformers.js**

**מיקום:** `ui/src/cubes/shared/utils/transformers.js`

**תיאור:** Transformation Layer להמרת נתונים מ-Backend (snake_case) ל-Frontend (camelCase).

**Version:** v1.2 (Hardened for Financials)

**Features:**
- המרת snake_case → camelCase
- המרה כפויה למספרים לשדות כספיים
- ערכי ברירת מחדל לשדות כספיים (0 במקום null)
- תמיכה באובייקטים מקוננים

**Financial Fields (Forced Number Conversion):**
- `balance`, `price`, `amount`, `total`, `value`, `quantity`, `cost`, `fee`, `commission`, `profit`, `loss`, `equity`, `margin`

**Functions:**
- `apiToReact(data)` - המרת נתוני API ל-React state
- `reactToApi(data)` - המרת נתוני React ל-API format

**Usage:**
```javascript
import { apiToReact, reactToApi } from '../utils/transformers';

// Backend → Frontend
const frontendData = apiToReact(backendResponse);
// { display_names: 'חשבון' } → { displayNames: 'חשבון' }

// Frontend → Backend
const backendData = reactToApi(frontendData);
// { displayNames: 'חשבון' } → { display_names: 'חשבון' }
```

---

## 🎨 Table Component Structure

### **PhoenixTable Component**

**Structure:**
```jsx
<PhoenixTable
  data={data}
  columns={columns}
  filters={combinedFilters}
  sortState={sortState}
  onFilterChange={setLocalFilter}
  onSortChange={setSort}
  loading={loading}
  error={error}
/>
```

**Props:**
- `data` - נתוני הטבלה (array)
- `columns` - הגדרת עמודות (array of column definitions)
- `filters` - פילטרים משולבים (גלובלי + מקומי)
- `sortState` - מצב מיון נוכחי
- `loading` - מצב טעינה
- `error` - שגיאה (אם קיימת)

---

## 🔗 Integration with Bridge

### **HTML Shell ↔ React Content**

**Flow:**
1. **HTML Shell → React:** Bridge dispatches `phoenix-filter-change` event → React Context listens and updates
2. **React → HTML Shell:** React Context calls `window.PhoenixBridge.setFilter()` → Bridge updates its state and UI
3. **Bidirectional Sync:** Both sides stay in sync through Bridge events

**Event Name:** `phoenix-filter-change` (not `phoenix-bridge-filter-update`)

---

## 📋 Best Practices

### **1. Data Loading:**
- תמיד להשתמש ב-`usePhoenixTableData` לטעינת נתונים
- הנתונים כבר מומרים אוטומטית (Transformation Layer)
- אין צורך בהמרה ידנית

### **2. Filtering:**
- פילטרים גלובליים דרך `PhoenixFilterContext`
- פילטרים מקומיים דרך `usePhoenixTableFilter`
- שילוב אוטומטי דרך `combinedFilters`

### **3. Sorting:**
- שימוש ב-`usePhoenixTableSort` לניהול מיון
- מיון מרובה עמודים נתמך

### **4. Error Handling:**
- `usePhoenixTableData` מטפל בשגיאות אוטומטית
- שגיאות מוצגות ב-UI דרך `error` state

---

## 📎 Related Documents

- **Master Blueprint:** `documentation/01-ARCHITECTURE/TT2_MASTER_BLUEPRINT.md`
- **Transformation Layer:** `ui/src/cubes/shared/utils/transformers.js`
- **Filter Context:** `ui/src/cubes/shared/contexts/PhoenixFilterContext.jsx`
- **Hooks:** `ui/src/cubes/shared/hooks/usePhoenixTableData.js`, `usePhoenixTableFilter.js`, `usePhoenixTableSort.js`

---

**Team 30 (Frontend Execution)**  
**תאריך:** 2026-02-05  
**סטטוס:** 🔒 **SSOT - ACTIVE**

**log_entry | [Team 30] | TABLES_REACT_FRAMEWORK | CREATED | BLUE | 2026-02-05**

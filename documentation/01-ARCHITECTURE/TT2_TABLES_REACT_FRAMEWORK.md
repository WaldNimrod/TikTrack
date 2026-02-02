# 📊 מערכת טבלאות React - מסגרת Phoenix (As Made)

**תאריך:** 2026-02-01  
**גרסה:** 1.0.0  
**סטטוס:** ✅ **מיושם בקוד**  
**מבוסס על:** החלטות אדריכליות `ARCHITECT_DIRECTIVE_TABLES_REACT.md` ו-`ARCHITECT_DIRECTIVE_TABLES_V2_FINAL.md`

---

## 📋 תקציר מנהלים

מסמך זה מתאר את מערכת הטבלאות React כפי שהיא מיושמת בפועל בקוד. המערכת מבוססת על React Framework מלא עם אינטגרציה ל-LEGO System, Transformation Layer, ו-Audit Trail.

**קהל יעד:**
- מפתחי Frontend (Team 30)
- מפתחים עתידיים
- Team 40 (UI Assets & Design)
- Team 50 (QA & Fidelity)

---

## 🏗️ ארכיטקטורה כללית

### מבנה הקבצים

```
ui/src/
├── cubes/
│   └── shared/
│       ├── components/
│       │   └── tables/
│       │       └── PhoenixTable.jsx          # Component ראשי לטבלאות
│       ├── contexts/
│       │   └── PhoenixFilterContext.jsx     # Context API לפילטרים גלובליים
│       ├── hooks/
│       │   ├── usePhoenixTableSort.js        # Hook לניהול סידור
│       │   └── usePhoenixTableFilter.js      # Hook לניהול פילטרים מקומיים
│       └── utils/
│           └── transformers.js               # Transformation Layer (snake_case ↔ camelCase)
└── styles/
    └── phoenix-tables.css                    # ⚠️ קיים בסטייג'ינג, נדרש להעברה
```

---

## 🧩 Components

### PhoenixTable.jsx

**מיקום:** `ui/src/cubes/shared/components/tables/PhoenixTable.jsx`

**תיאור:** Component בסיסי לטבלאות עם תמיכה בסידור, סינון, ו-Accessibility.

#### Props

```typescript
interface PhoenixTableProps {
  data?: Array<any>;                    // נתוני הטבלה (camelCase)
  columns?: Array<Column>;              // הגדרת עמודות
  onSort?: Function;                    // Callback לסידור (אופציונלי)
  onFilter?: Function;                   // Callback לסינון (אופציונלי)
  loading?: boolean;                    // מצב טעינה
  error?: string | null;                 // הודעת שגיאה (אופציונלי)
  title?: string | null;                // כותרת הטבלה (אופציונלי)
  sectionName?: string;                 // שם הסקשן (לשימוש ב-data-section)
}
```

#### Column Definition

```typescript
interface Column {
  key: string;                          // מפתח השדה (camelCase)
  label: string;                       // תווית העמודה
  sortable?: boolean;                   // האם ניתן למיין לפי עמודה זו
  type?: 'string' | 'numeric' | 'date' | 'boolean' | 'currency';
  render?: Function;                    // פונקציית רינדור מותאמת אישית (אופציונלי)
}
```

#### דוגמת שימוש

```jsx
import PhoenixTable from '@/cubes/shared/components/tables/PhoenixTable';

<PhoenixTable
  data={accounts}
  columns={[
    { key: 'displayNames', label: 'שם חשבון', sortable: true, type: 'string' },
    { key: 'availableAmounts', label: 'יתרה', sortable: true, type: 'numeric' },
    { key: 'currencyCodes', label: 'מטבע', sortable: false, type: 'string' }
  ]}
  loading={false}
  title="ניהול חשבונות מסחר"
  sectionName="accounts-table"
/>
```

#### תכונות מיושמות

- ✅ **סידור:** תמיכה ב-Multi-sort (Primary + Secondary עם Shift)
- ✅ **סינון:** אינטגרציה עם `PhoenixFilterContext` ו-`usePhoenixTableFilter`
- ✅ **Accessibility:** ARIA attributes מלאים (`role`, `aria-sort`, `aria-label`)
- ✅ **JS Standards:** `js-` prefixed classes לכל אלמנט אינטראקטיבי
- ✅ **LEGO System:** שימוש ב-`tt-section` ו-`tt-section-row`
- ✅ **Audit Trail:** לוג כל פעולת סידור/סינון (רק ב-`?debug`)
- ✅ **Fidelity:** תמיכה ב-`tabular-nums` לשדות מספריים

#### Classes CSS בשימוש

- `.phoenix-table` - טבלה בסיסית
- `.phoenix-table__head` - כותרת טבלה
- `.phoenix-table__header` - תא כותרת
- `.phoenix-table__body` - גוף טבלה
- `.phoenix-table__row` - שורה
- `.phoenix-table__cell` - תא
- `.phoenix-table__cell--numeric` - תא מספרי
- `.phoenix-table__cell--currency` - תא מטבע
- `.phoenix-table__cell--date` - תא תאריך
- `.phoenix-table__cell--status` - תא סטטוס
- `.phoenix-table__sort-indicator` - אינדיקטור סידור
- `.phoenix-table__sort-icon` - אייקון סידור
- `.js-table` - selector ל-JavaScript
- `.js-table-sort-trigger` - selector לסידור
- `.js-sort-indicator` - selector לאינדיקטור סידור
- `.js-sort-icon` - selector לאייקון סידור
- `.js-table-error` - selector לשגיאה
- `.js-table-loading` - selector לטעינה

---

## 🎣 Hooks

### usePhoenixTableSort

**מיקום:** `ui/src/cubes/shared/hooks/usePhoenixTableSort.js`

**תיאור:** Hook לניהול מצב סידור טבלאות עם תמיכה ב-Multi-sort (Primary + Secondary).

#### API

```javascript
const { sortState, handleSort, clearSort, getSortState } = usePhoenixTableSort();
```

#### Sort State Structure

```javascript
{
  primary: { key: string | null, direction: 'ASC' | 'DESC' | 'NONE' },
  secondary: { key: string | null, direction: 'ASC' | 'DESC' | 'NONE' }
}
```

#### דוגמת שימוש

```javascript
const { sortState, handleSort } = usePhoenixTableSort();

// לחיצה ראשונה: ASC
handleSort('displayNames');
// sortState.primary = { key: 'displayNames', direction: 'ASC' }

// לחיצה שניה: DESC
handleSort('displayNames');
// sortState.primary = { key: 'displayNames', direction: 'DESC' }

// לחיצה שלישית: NONE (איפוס)
handleSort('displayNames');
// sortState.primary = { key: null, direction: null }

// Multi-sort (Shift + click): רמת סידור שניה
handleSort('brokerNames', true);
// sortState.secondary = { key: 'brokerNames', direction: 'ASC' }
```

#### תכונות מיושמות

- ✅ **מחזור סידור:** ASC → DESC → NONE
- ✅ **Multi-sort:** תמיכה ב-Primary + Secondary (Shift + click)
- ✅ **Audit Trail:** לוג כל שינוי סידור (רק ב-`?debug`)
- ✅ **איפוס אוטומטי:** איפוס רמת סידור שניה כשמשנים את הראשונה

---

### usePhoenixTableFilter

**מיקום:** `ui/src/cubes/shared/hooks/usePhoenixTableFilter.js`

**תיאור:** Hook לניהול פילטרים מקומיים של טבלה עם אינטגרציה לפילטרים גלובליים.

#### API

```javascript
const { filters, applyFilters, setLocalFilter, clearFilters, combinedFilters } = usePhoenixTableFilter();
```

#### Filter State Structure

```javascript
{
  global: {
    status: string | null,
    investmentType: string | null,
    tradingAccount: string | null,
    dateRange: { from: string | null, to: string | null },
    search: string
  },
  local: {
    // פילטרים מקומיים של הטבלה
  }
}
```

#### דוגמת שימוש

```javascript
const { filters, setLocalFilter, clearFilters, combinedFilters } = usePhoenixTableFilter();

// עדכון פילטר מקומי
setLocalFilter('dateFrom', '2026-01-01');

// קבלת פילטרים משולבים (גלובלי + מקומי)
console.log(combinedFilters);
// { ...globalFilters, ...localFilters }
```

#### תכונות מיושמות

- ✅ **אינטגרציה עם Context:** שימוש ב-`usePhoenixFilter()` לקבלת פילטרים גלובליים
- ✅ **פילטרים מקומיים:** תמיכה בפילטרים מקומיים של כל טבלה
- ✅ **שילוב אוטומטי:** `combinedFilters` מחושב אוטומטית (useMemo)
- ✅ **Audit Trail:** לוג כל שינוי פילטר (רק ב-`?debug`)

---

## 🔄 Context API

### PhoenixFilterContext

**מיקום:** `ui/src/cubes/shared/contexts/PhoenixFilterContext.jsx`

**תיאור:** Context API לניהול מצב פילטרים גלובליים לכל הטבלאות במערכת.

#### Provider Setup

```jsx
import { PhoenixFilterProvider } from '@/cubes/shared/contexts/PhoenixFilterContext';

<PhoenixFilterProvider>
  <App />
</PhoenixFilterProvider>
```

#### Hook: usePhoenixFilter

```javascript
import { usePhoenixFilter } from '@/cubes/shared/contexts/PhoenixFilterContext';

const { filters, setFilter, clearFilters, getFilters } = usePhoenixFilter();
```

#### Filter State Structure

```javascript
{
  status: string | null,                    // סטטוס (פתוח/סגור/מבוטל)
  investmentType: string | null,            // סוג השקעה
  tradingAccount: string | null,            // חשבון מסחר
  dateRange: {                              // טווח תאריכים
    from: string | null,
    to: string | null
  },
  search: string                            // חיפוש טקסט חופשי
}
```

#### דוגמת שימוש

```javascript
const { filters, setFilter, clearFilters } = usePhoenixFilter();

// עדכון פילטר
setFilter('status', 'active');
setFilter('dateRange', { from: '2026-01-01', to: '2026-01-31' });
setFilter('search', 'חשבון מסחר');

// קריאת פילטר
console.log(filters.status); // 'active'

// איפוס פילטרים
clearFilters();
```

#### תכונות מיושמות

- ✅ **Context API:** שימוש ב-React Context API לניהול מצב גלובלי
- ✅ **Audit Trail:** לוג כל שינוי פילטר (רק ב-`?debug`)
- ✅ **Error Handling:** זריקת שגיאה אם נעשה שימוש מחוץ ל-Provider

---

## 🔀 Transformation Layer

**מיקום:** `ui/src/cubes/shared/utils/transformers.js`

**תיאור:** הפרדה בין ה-Backend (snake_case) לבין ה-Frontend (camelCase).

### API

#### apiToReact

```javascript
import { apiToReact } from '@/cubes/shared/utils/transformers';

// המרה מנתוני API לנתוני State של React
const apiData = { user_id: "123", is_email_verified: true };
const reactData = apiToReact(apiData);
// Returns: { userId: "123", isEmailVerified: true }
```

#### reactToApi

```javascript
import { reactToApi } from '@/cubes/shared/utils/transformers';

// המרה מנתוני UI לפורמט Payload עבור ה-API
const reactData = { email: "user@example.com", rememberMe: true };
const apiPayload = reactToApi(reactData);
// Returns: { email: "user@example.com", remember_me: true }
```

#### reactToApiPasswordChange

```javascript
import { reactToApiPasswordChange } from '@/cubes/shared/utils/transformers';

// המרה מנתוני טופס שינוי סיסמה (React camelCase) לפורמט API (snake_case)
const reactData = { currentPassword: "old123", newPassword: "new456" };
const apiPayload = reactToApiPasswordChange(reactData);
// Returns: { old_password: "old123", new_password: "new456" }
```

### תכונות מיושמות

- ✅ **תמיכה ב-Arrays:** המרה רקורסיבית של מערכים
- ✅ **תמיכה ב-Objects:** המרה רקורסיבית של אובייקטים
- ✅ **תמיכה ב-Primitives:** שמירה על ערכים פרימיטיביים ללא שינוי

---

## 🎨 CSS Styling

### קובץ CSS

**מיקום נוכחי:** `_COMMUNICATION/team_01/team_01_staging/phoenix-tables.css`  
**מיקום נדרש:** `ui/src/styles/phoenix-tables.css` ⚠️ **נדרש להעברה**

**תיאור:** קובץ CSS מאוחד לכל מערכת הטבלאות. משתמש ב-BEM naming convention עם prefix `phoenix-table-*`.

### ITCSS Layer

הקובץ שייך ל-**Components Layer** (לפי ITCSS hierarchy) ויש לטעון אותו **אחרי** `phoenix-components.css`.

### Classes עיקריות

#### Base Classes

- `.phoenix-table-wrapper` - Wrapper לטבלה (טיפול ב-overflow ו-scroll)
- `.phoenix-table` - טבלה בסיסית
- `.phoenix-table__head` - כותרת טבלה
- `.phoenix-table__header` - תא כותרת
- `.phoenix-table__body` - גוף טבלה
- `.phoenix-table__row` - שורה
- `.phoenix-table__cell` - תא

#### Modifier Classes

- `.phoenix-table__cell--numeric` - תא מספרי (`tabular-nums`, monospace font)
- `.phoenix-table__cell--currency` - תא מטבע
- `.phoenix-table__cell--date` - תא תאריך
- `.phoenix-table__cell--status` - תא סטטוס
- `.phoenix-table__cell--actions` - תא פעולות

#### Status Badges

- `.phoenix-table__status-badge` - Badge בסיסי
- `.phoenix-table__status-badge--active` - Badge פעיל
- `.phoenix-table__status-badge--inactive` - Badge לא פעיל
- `.phoenix-table__status-badge--verified` - Badge מאומת
- `.phoenix-table__status-badge--pending` - Badge ממתין
- `.phoenix-table__status-badge--long` - Badge Long
- `.phoenix-table__status-badge--short` - Badge Short

#### Sort Indicators

- `.phoenix-table__sort-indicator` - Container לאינדיקטור סידור
- `.phoenix-table__sort-icon` - אייקון סידור
- `.phoenix-table__sort-icon[data-sort-state="asc"]` - מצב סידור עולה
- `.phoenix-table__sort-icon[data-sort-state="desc"]` - מצב סידור יורד
- `.phoenix-table__sort-icon[data-sort-state="none"]` - מצב ללא סידור

### Fidelity Requirements

- ✅ **`tabular-nums`:** מיושם ב-`.phoenix-table__cell--numeric`
- ✅ **`clamp()`:** מיושם ב-spacing ו-sizing (דרך CSS Variables)
- ✅ **RTL Support:** תמיכה מלאה ב-RTL דרך logical properties

### Fluid Design (Responsive)

**עדכון:** 🛡️ **ARCHITECT DECISION 2026-02-02** - Fluid Design Mandate

#### **טבלאות לא "נשברות" למובייל:**
- ✅ טבלאות עטופות ב-`.phoenix-table-wrapper` עם `overflow-x: auto`
- ✅ רוחב מינימלי לטבלה (`min-width: 800px`) במקום שבירת מבנה
- ✅ Horizontal Scroll פנימי במקום media queries

#### **Sticky Columns:**
- ⚠️ **נדרש ליישום:** שימוש ב-Sticky Columns לשמירה על קונטקסט בטבלאות רחבות

**קישור למסמך מלא:** `documentation/04-DESIGN_UX_UI/TT2_RESPONSIVE_FLUID_DESIGN.md`

---

## 🔍 JS Standards Protocol

### js- Prefixed Selectors

כל אלמנט אינטראקטיבי משתמש ב-`js-` prefixed classes לצורך ולידציית G-Bridge ובדיקות Selenium:

- `.js-table` - טבלה
- `.js-table-sort-trigger` - טריגר סידור
- `.js-sort-indicator` - אינדיקטור סידור
- `.js-sort-icon` - אייקון סידור
- `.js-table-error` - הודעת שגיאה
- `.js-table-loading` - מצב טעינה

---

## 📝 Audit Trail

כל פעולת סידור או סינון מתועדת ב-`PhoenixAudit` (רק ב-`?debug`):

```javascript
// דוגמה ללוג סידור
audit.log('Tables', 'Sort header clicked', {
  columnKey: 'displayNames',
  isSecondary: false,
  sortState: { primary: { key: 'displayNames', direction: 'ASC' }, ... }
});

// דוגמה ללוג פילטר
audit.log('Filters', 'Filter changed: status', {
  key: 'status',
  value: 'active',
  previousValue: null,
  allFilters: { ... }
});
```

---

## 🔗 אינטגרציה עם LEGO System

הטבלאות משתמשות ב-LEGO System Components:

```jsx
<tt-section data-section={sectionName} data-title={title || undefined}>
  <div className="index-section__body">
    <tt-section-row>
      <div className="phoenix-table-wrapper">
        <table className="phoenix-table js-table">
          {/* טבלה */}
        </table>
      </div>
    </tt-section-row>
  </div>
</tt-section>
```

---

## 📚 דוגמאות שימוש מלאות

### דוגמה 1: טבלה בסיסית עם סידור

```jsx
import PhoenixTable from '@/cubes/shared/components/tables/PhoenixTable';

const AccountsTable = ({ accounts }) => {
  return (
    <PhoenixTable
      data={accounts}
      columns={[
        { key: 'displayNames', label: 'שם חשבון', sortable: true, type: 'string' },
        { key: 'availableAmounts', label: 'יתרה', sortable: true, type: 'numeric' },
        { key: 'currencyCodes', label: 'מטבע', sortable: false, type: 'string' }
      ]}
      loading={false}
      title="ניהול חשבונות מסחר"
    />
  );
};
```

### דוגמה 2: טבלה עם פילטרים גלובליים

```jsx
import { PhoenixFilterProvider, usePhoenixFilter } from '@/cubes/shared/contexts/PhoenixFilterContext';
import PhoenixTable from '@/cubes/shared/components/tables/PhoenixTable';

const AccountsPage = () => {
  return (
    <PhoenixFilterProvider>
      <AccountsTable />
    </PhoenixFilterProvider>
  );
};

const AccountsTable = () => {
  const { filters } = usePhoenixFilter();
  
  // נתונים מסוננים לפי filters
  const filteredAccounts = useMemo(() => {
    // לוגיקת סינון...
  }, [filters]);
  
  return (
    <PhoenixTable
      data={filteredAccounts}
      columns={[...]}
    />
  );
};
```

### דוגמה 3: טבלה עם Transformation Layer

```jsx
import { apiToReact } from '@/cubes/shared/utils/transformers';
import PhoenixTable from '@/cubes/shared/components/tables/PhoenixTable';

const AccountsTable = () => {
  const [accounts, setAccounts] = useState([]);
  
  useEffect(() => {
    fetch('/api/v1/accounts')
      .then(res => res.json())
      .then(data => {
        // המרה מ-snake_case ל-camelCase
        const reactData = apiToReact(data);
        setAccounts(reactData);
      });
  }, []);
  
  return (
    <PhoenixTable
      data={accounts}
      columns={[...]}
    />
  );
};
```

---

## ⚠️ הערות חשובות

### מיקום קובץ CSS

קובץ `phoenix-tables.css` קיים כרגע בסטייג'ינג (`_COMMUNICATION/team_01/team_01_staging/phoenix-tables.css`) ונדרש להעביר אותו ל-`ui/src/styles/phoenix-tables.css` ולהבטיח שהוא נטען נכון ב-Components.

### סינון

לוגיקת הסינון ב-`PhoenixTable.jsx` מסומנת כ-TODO (שורה 161-163) וצפויה להיות מיושמת בשלב 4 עם הטבלה הראשונה.

---

## 📖 קישורים רלוונטיים

- [החלטה אדריכלית - טבלאות React](../_COMMUNICATION/90_Architects_comunication/ARCHITECT_DIRECTIVE_TABLES_REACT.md)
- [החלטה אדריכלית - טבלאות V2 Final](../_COMMUNICATION/90_Architects_comunication/ARCHITECT_DIRECTIVE_TABLES_V2_FINAL.md)
- [JS Standards Protocol](../../10-POLICIES/TT2_JS_STANDARDS_PROTOCOL.md)
- [CSS Classes Index](../../04-DESIGN_UX_UI/CSS_CLASSES_INDEX.md)

---

**log_entry | [Team 10] | TABLES_REACT_FRAMEWORK | DOCUMENTATION_CREATED | BLUE | 2026-02-01**

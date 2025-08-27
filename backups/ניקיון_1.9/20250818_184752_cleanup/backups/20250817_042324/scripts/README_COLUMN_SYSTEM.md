# מערכת העמודות - תיעוד מעודכן

## סקירה כללית

מערכת העמודות מאפשרת הגדרה דינמית של עמודות בטבלאות השונות במערכת. המערכת תומכת בהגדרת עמודות בעברית ובאנגלית, עם תמיכה במיון וסינון.

## מבנה עמודות לחשבונות

### עמודות בסיסיות
```javascript
const accountColumns = [
    'id',           // מזהה (ID)
    'name',         // שם (Name)
    'currency',     // מטבע (Currency)
    'status',       // סטטוס (Status)
    'cash_balance', // יתרת מזומן (Cash Balance)
    'total_value',  // שווי כולל (Total Value)
    'total_pl',     // רווח/הפסד כולל (Total P/L)
    'notes'         // הערות (Notes)
];
```

### סטטוסים עקביים
המערכת משתמשת בסטטוסים עקביים בעברית:
- `פתוח` - חשבון פעיל
- `סגור` - חשבון לא פעיל
- `מבוטל` - חשבון מבוטל

### המרות סטטוס
```javascript
// אנגלית לעברית
'active' → 'פתוח'
'inactive' → 'סגור'
'cancelled' → 'מבוטל'

// עברית לאנגלית
'פתוח' → 'פתוח'
'סגור' → 'סגור'
'מבוטל' → 'מבוטל'
```

## פונקציות עזר

### המרת שמות עמודות
```javascript
function getColumnDisplayName(columnName) {
    const columnNames = {
        'id': 'מזהה (ID)',
        'name': 'שם (Name)',
        'currency': 'מטבע (Currency)',
        'status': 'סטטוס (Status)',
        'cash_balance': 'יתרת מזומן (Cash Balance)',
        'total_value': 'שווי כולל (Total Value)',
        'total_pl': 'רווח/הפסד כולל (Total P/L)',
        'notes': 'הערות (Notes)'
    };
    
    return columnNames[columnName] || `${columnName} (${columnName})`;
}
```

### עיצוב ערכים
```javascript
// עיצוב מזהה
if (key === 'id') {
    td.className = 'id-cell';
    td.textContent = `#${value}`;
}

// עיצוב מספרים
else if (typeof value === 'number') {
    td.className = 'number-cell';
    if (value.toString().includes('.')) {
        td.textContent = value.toFixed(2);
    } else {
        td.textContent = value.toLocaleString();
    }
}

// עיצוב סטטוס
else if (key === 'status') {
    let statusText = value;
    let statusColor = 'var(--apple-text-primary)';
    
    switch (value) {
        case 'פתוח':
            statusText = 'פתוח';
            statusColor = 'var(--apple-blue)';
            break;
        case 'סגור':
            statusText = 'סגור';
            statusColor = 'var(--apple-green)';
            break;
        case 'מבוטל':
            statusText = 'מבוטל';
            statusColor = 'var(--apple-red)';
            break;
    }
    
    td.textContent = statusText;
    td.style.color = statusColor;
    td.style.fontWeight = '500';
}
```

## שימוש במערכת

### יצירת טבלת חשבונות
```javascript
function createAccountsTable(accounts) {
    const columns = ['id', 'name', 'currency', 'status', 'cash_balance', 'total_value', 'total_pl', 'notes'];
    
    // יצירת כותרות
    columns.forEach(column => {
        const displayName = getColumnDisplayName(column);
        // יצירת כותרת עם חלק באנגלית לא בבולד
        if (displayName.includes('(') && displayName.includes(')')) {
            const hebrewPart = displayName.split('(')[0].trim();
            const englishPart = displayName.split('(')[1].replace(')', '').trim();
            
            th.innerHTML = `${hebrewPart} <span style="font-weight: normal; color: #666;">(${englishPart})</span>`;
        } else {
            th.textContent = displayName;
        }
    });
    
    // יצירת שורות נתונים
    accounts.forEach(account => {
        columns.forEach(key => {
            const value = account[key];
            // עיצוב הערך לפי סוג הנתון
            formatCellValue(td, key, value);
        });
    });
}
```

### עיצוב ערכי תאים
```javascript
function formatCellValue(td, key, value) {
    if (value === null || value === undefined) {
        td.textContent = '-';
        td.style.color = 'var(--apple-text-secondary)';
        td.style.fontStyle = 'italic';
    } else if (typeof value === 'number') {
        formatNumberValue(td, key, value);
    } else if (key === 'status') {
        formatStatusValue(td, value);
    } else {
        td.textContent = value;
    }
}
```

## תכונות מתקדמות

### מיון עמודות
```javascript
th.addEventListener('click', () => {
    sortTable('accounts', column);
});
```

### סינון נתונים
```javascript
function filterAccountsTable() {
    const searchTerm = document.getElementById('accountsSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#accountsTable tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}
```

### עיצוב מותאם
```css
.id-cell {
    font-family: 'SF Mono', monospace;
    color: var(--apple-blue);
}

.number-cell {
    text-align: right;
    font-family: 'SF Mono', monospace;
}

.status-cell {
    font-weight: 500;
    text-align: center;
}
```

## הרחבות עתידיות

### עמודות דינמיות
- הוספת עמודות חדשות ללא שינוי קוד
- הגדרת עמודות מותאמות אישית
- תמיכה בעמודות מחושבות

### עיצוב מתקדם
- תמיכה בצבעים מותאמים אישית
- עיצוב מותאם לסוג נתון
- תמיכה באייקונים וסמלים

### ביצועים
- טעינה הדרגתית של נתונים
- מיון וסינון בצד השרת
- קאשינג של נתונים

## דוגמאות שימוש

### טבלת חשבונות בסיסית
```html
<table class="data-table">
    <thead>
        <tr>
            <th>מזהה (ID)</th>
            <th>שם (Name)</th>
            <th>מטבע (Currency)</th>
            <th>סטטוס (Status)</th>
            <th>יתרת מזומן (Cash Balance)</th>
            <th>שווי כולל (Total Value)</th>
            <th>רווח/הפסד כולל (Total P/L)</th>
            <th>הערות (Notes)</th>
        </tr>
    </thead>
    <tbody>
        <!-- נתונים יוכנסו כאן -->
    </tbody>
</table>
```

### טבלה עם פעולות
```html
<table class="data-table">
    <thead>
        <tr>
            <!-- עמודות נתונים -->
            <th>פעולות</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <!-- נתונים -->
            <td>
                <button onclick="editAccount(1)">ערוך</button>
                <button onclick="deleteAccount(1, 'חשבון בדיקה')">מחק</button>
            </td>
        </tr>
    </tbody>
</table>
```

## תחזוקה

### הוספת עמודה חדשה
1. הוסף את שם העמודה למערך העמודות
2. הוסף את שם התצוגה ל-`getColumnDisplayName`
3. הוסף לוגיקת עיצוב אם נדרש
4. בדוק שהעמודה מוצגת נכון

### שינוי עיצוב עמודה
1. עדכן את פונקציית העיצוב הרלוונטית
2. בדוק שהשינוי מוחל על כל התאים
3. בדוק תאימות עם דפדפנים שונים

### אופטימיזציה
1. בדוק ביצועים עם כמות גדולה של נתונים
2. שקול טעינה הדרגתית
3. בדוק שימוש בזיכרון

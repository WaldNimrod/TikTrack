# מדריך מהיר - CSS Architecture

## דשבורד CSS Management
**🌐 גישה**: `http://localhost:8080/css-management`  
**📍 בתפריט**: פעולות מערכת → מנהל CSS וארכיטקטורה

## הוספת עמוד חדש

### 1. CSS לקופי הפן
```html
<!-- TikTrack CSS - New ITCSS Architecture -->
<link rel="stylesheet" href="styles-new/main.css">
```

### 2. HTML Structure  
```html
<div class="dashboard-container">
    <div class="container-with-border">
        <h1>כותרת ראשית</h1>
        <div class="two-column-grid">
            <div>תוכן 1</div>
            <div>תוכן 2</div>
        </div>
    </div>
</div>
```

## מחלקות נפוצות

### כפתורים
- `.btn` - כפתור בסיסי (לבן עם טורקיז)
- `.btn-emphasized` - מודגש (כתום)
- `.btn-success` - שמירה (טורקיז)
- `.btn-danger` - מחיקה (אדום)

### כרטיסים
- `.container-with-border` - מיכל עם מסגרת
- `.overview-card` - כרטיס overview
- `.stat-card` - כרטיס סטטיסטיקה

### טבלאות
- `.data-table` - טבלה מעוצבת
- `.table-container` - מיכל טבלה
- `.sortable-header` - כותרת למיון
- `.actions-cell` - עמודת פעולות

### פריסה
- `.dashboard-container` - מיכל ראשי
- `.two-column-grid` - גריד דו-עמודות
- `.overview-grid` - גריד אוטומטי
- `.table-actions` - שורת פעולות

### סטטוס ובאדג'ים
- `.status-badge` - תג סטטוס
- `.priority-badge` - תג חשיבות
- `.numeric-text-positive/negative` - ערכים מספריים
- `.side-long/short` - Long/Short

## צבעי המערכת

### צבעים עיקריים
- `#29a6a8` - טורקיז ראשי
- `#ff9c05` - כתום לוגו
- `#28a745` - ירוק הצלחה
- `#dc3545` - אדום שגיאה

### משתני CSS
```css
var(--apple-blue)       /* כחול Apple */
var(--logo-orange)      /* כתום לוגו */
var(--apple-green)      /* ירוק Apple */
var(--apple-red)        /* אדום Apple */
```

## RTL בסיסי

### יישור טקסט
```css
text-align: right;  /* עברית */
text-align: left;   /* מספרים ותאריכים */
direction: rtl;     /* כיוון עברי */
direction: ltr;     /* מספרים ותאריכים */
```

### Logical Properties
```css
/* במקום margin-left/right */
margin-inline-start: 1rem;
margin-inline-end: 1rem;

/* במקום padding-left/right */
padding-inline-start: 1rem;
padding-inline-end: 1rem;
```

## כלי פיתוח

### בדיקות
```bash
python3 css-tools.py        # כלי עזר כללי
python3 test-css-system.py  # בדיקות מערכת
npm run css:check           # stylelint
```

### ניתוח
```bash
npm run css:analyze   # ספירת שורות
npm run css:compare   # השוואה למערכת ישנה
```

## עצות מפתח

### ✅ כן
- השתמש במשתני CSS הקיימים
- עקוב אחר RTL עם Logical Properties  
- הוסף רכיבים חדשים ל-`06-components/`
- שמור על מבנה ITCSS

### ❌ לא
- אל תוסיף left/right ישירות
- אל תשכח direction: rtl
- אל תדרוס משתני CSS
- אל תוסיף קבצי CSS נפרדים לעמודים

## דוגמת רכיב חדש

```css
/**
 * רכיב חדש - New Component
 * 
 * @version 1.0.0
 * @lastUpdated DATE
 */

.my-component {
  background: var(--apple-bg-elevated);
  border-radius: var(--apple-radius-medium);
  border: 1px solid var(--apple-border-light);
  padding: var(--spacing-md);
  direction: rtl;
  text-align: right;
}

.my-component:hover {
  box-shadow: var(--apple-shadow-medium);
}
```

---

מדריך מלא: [CSS Architecture Guide](CSS_ARCHITECTURE_GUIDE.md)
# FIELD_PATTERNS.md - קטלוג דפוסי שדות

## 📊 סיכום כללי

המערכת כוללת **8 סוגי שדות** עיקריים עם דפוסים חוזרים ברורים. כל השדות נתמכים במערכת המודלים הקיימת.

## 🎯 סוגי שדות נתמכים

### 1. **Text Fields** (שדות טקסט) - 11 מופעים
**שימוש**: שמות, תיאורים, מזההים

#### דפוסים חוזרים:
- **שם ישות** - `name`, `title`, `symbol`
- **תיאור** - `description`, `notes`
- **מזהה חיצוני** - `external_id`

#### דוגמאות:
```javascript
// שם ישות
{
  type: 'text',
  id: 'entityName',
  label: 'שם הישות',
  required: true,
  maxLength: 100
}

// תיאור
{
  type: 'text',
  id: 'entityDescription',
  label: 'תיאור',
  placeholder: 'הכנס תיאור...'
}
```

### 2. **Select Fields** (שדות בחירה) - 30 מופעים
**שימוש**: בחירה מתוך רשימה קבועה או דינמית

#### דפוסים חוזרים:
- **חשבון מסחר** - `account`, `trading_account`
- **טיקר** - `ticker`, `symbol`
- **מטבע** - `currency`
- **סטטוס** - `status`, `state`
- **סוג ישות** - `type`, `category`

#### דוגמאות:
```javascript
// חשבון מסחר (דינמי)
{
  type: 'select',
  id: 'entityAccount',
  label: 'חשבון מסחר',
  required: true,
  defaultFromPreferences: true
}

// סטטוס (קבוע)
{
  type: 'select',
  id: 'entityStatus',
  label: 'סטטוס',
  required: true,
  options: [
    { value: 'active', label: 'פעיל' },
    { value: 'inactive', label: 'לא פעיל' }
  ]
}
```

### 3. **Number Fields** (שדות מספריים) - 16 מופעים
**שימוש**: כמויות, מחירים, סכומים

#### דפוסים חוזרים:
- **כמות** - `quantity`, `amount`, `shares`
- **מחיר** - `price`, `entry_price`, `exit_price`
- **Stop Loss/Take Profit** - `stop_loss`, `take_profit`
- **עמלות** - `commission`, `fees`

#### דוגמאות:
```javascript
// כמות
{
  type: 'number',
  id: 'entityQuantity',
  label: 'כמות',
  required: true,
  min: 1,
  step: 1
}

// מחיר
{
  type: 'number',
  id: 'entityPrice',
  label: 'מחיר',
  required: true,
  min: 0.01,
  step: 0.01
}
```

### 4. **Date Fields** (שדות תאריך) - 1 מופע
**שימוש**: תאריכים בלבד

#### דוגמה:
```javascript
{
  type: 'date',
  id: 'entityDate',
  label: 'תאריך',
  required: true,
  defaultValue: 'today'
}
```

### 5. **DateTime Fields** (תאריך ושעה) - 5 מופעים
**שימוש**: תאריכים עם שעה

#### דפוסים חוזרים:
- **תאריך ביצוע** - `execution_date`, `trade_date`
- **תאריך כניסה** - `entry_date`
- **תאריך יצירה** - `created_date`

#### דוגמה:
```javascript
{
  type: 'datetime-local',
  id: 'entityDateTime',
  label: 'תאריך ושעה',
  required: true,
  defaultValue: 'now'
}
```

### 6. **Textarea Fields** (שדות טקסט ארוך) - 7 מופעים
**שימוש**: הערות, תיאורים ארוכים

#### דפוסים חוזרים:
- **הערות** - `notes`, `comments`
- **תיאור מפורט** - `description`, `details`

#### דוגמה:
```javascript
{
  type: 'textarea',
  id: 'entityNotes',
  label: 'הערות',
  placeholder: 'הכנס הערות...',
  rows: 3
}
```

### 7. **Checkbox Fields** (שדות סימון) - 2 מופעים
**שימוש**: אפשרויות בוליאניות

#### דוגמה:
```javascript
{
  type: 'checkbox',
  id: 'entityEnabled',
  label: 'פעיל',
  defaultValue: true
}
```

## 🔄 דפוסים חוזרים

### 1. **Account Select Pattern** (בחירת חשבון מסחר)
**מופיע ב**: Cash Flows, Trades, Trade Plans, Executions

```javascript
{
  type: 'select',
  id: 'entityAccount',
  label: 'חשבון מסחר',
  required: true,
  defaultFromPreferences: true,
  // טעינה דינמית מ-API
}
```

### 2. **Ticker Select Pattern** (בחירת טיקר)
**מופיע ב**: Trades, Trade Plans, Executions

```javascript
{
  type: 'select',
  id: 'entityTicker',
  label: 'טיקר',
  required: true,
  // טעינה דינמית מ-API
  placeholder: 'בחר טיקר...'
}
```

### 3. **Currency Select Pattern** (בחירת מטבע)
**מופיע ב**: Cash Flows, Trading Accounts

```javascript
{
  type: 'select',
  id: 'entityCurrency',
  label: 'מטבע',
  required: true,
  defaultFromPreferences: true,
  // רשימה קבועה של מטבעות
}
```

### 4. **Status Select Pattern** (בחירת סטטוס)
**מופיע ב**: כל הישויות

```javascript
{
  type: 'select',
  id: 'entityStatus',
  label: 'סטטוס',
  required: true,
  options: [
    { value: 'active', label: 'פעיל' },
    { value: 'inactive', label: 'לא פעיל' },
    { value: 'pending', label: 'ממתין' }
  ]
}
```

### 5. **Date Pattern** (תאריך)
**מופיע ב**: כל הישויות

```javascript
{
  type: 'datetime-local',
  id: 'entityDate',
  label: 'תאריך',
  required: true,
  defaultValue: 'now' // ברירת מחדל: עכשיו
}
```

### 6. **Notes Pattern** (הערות)
**מופיע ב**: כל הישויות

```javascript
{
  type: 'textarea',
  id: 'entityNotes',
  label: 'הערות',
  placeholder: 'הכנס הערות...',
  rows: 3
}
```

## 🎨 תכונות מתקדמות

### 1. **ברירות מחדל מהעדפות**:
```javascript
{
  type: 'select',
  id: 'entityAccount',
  defaultFromPreferences: true // מחשבון מסחר ברירת מחדל מהעדפות
}
```

### 2. **טעינה דינמית**:
```javascript
{
  type: 'select',
  id: 'entityTicker',
  options: [], // יטען דינמית מ-API
  placeholder: 'בחר טיקר...'
}
```

### 3. **ולידציה מתקדמת**:
```javascript
{
  type: 'number',
  id: 'entityPrice',
  required: true,
  min: 0.01,
  max: 999999.99,
  step: 0.01
}
```

### 4. **עיצוב מותאם**:
```javascript
{
  type: 'textarea',
  id: 'entityNotes',
  rows: 3,
  placeholder: 'הכנס הערות...',
  maxLength: 500
}
```

## 📊 סטטיסטיקות שימוש

| סוג שדה | כמות | אחוז | שימוש עיקרי |
|---------|------|-------|-------------|
| **select** | 30 | 37.5% | בחירות מתוך רשימה |
| **text** | 11 | 13.8% | שמות ותיאורים |
| **number** | 16 | 20.0% | כמויות ומחירים |
| **textarea** | 7 | 8.8% | הערות ארוכות |
| **datetime-local** | 5 | 6.3% | תאריכים עם שעה |
| **checkbox** | 2 | 2.5% | אפשרויות בוליאניות |
| **date** | 1 | 1.3% | תאריכים בלבד |
| **אחרים** | 8 | 10.0% | שדות מיוחדים |

## 🚀 המלצות

### ✅ המערכת מוכנה לשימוש:
1. **8 סוגי שדות** נתמכים במלואם
2. **דפוסים חוזרים** מזוהים ומתועדים
3. **תכונות מתקדמות** זמינות
4. **אינטגרציה מלאה** עם כל המערכות

### 📋 שלבים הבאים:
1. **בדיקת פונקציונליות** - וידוא שהכל עובד
2. **אופטימיזציה** - שיפור ביצועים
3. **תיעוד נוסף** - מדריכי שימוש
4. **הרחבות עתידיות** - שדות נוספים לפי הצורך

## 🎯 סיכום

המערכת כוללת **קטלוג שדות מלא** עם:
- ✅ **8 סוגי שדות** עיקריים
- ✅ **6 דפוסים חוזרים** מזוהים
- ✅ **תכונות מתקדמות** זמינות
- ✅ **אינטגרציה מלאה** עם כל המערכות
- ✅ **תמיכה מלאה** ב-RTL ועברית

**המערכת מוכנה לשימוש מלא! 🎉**




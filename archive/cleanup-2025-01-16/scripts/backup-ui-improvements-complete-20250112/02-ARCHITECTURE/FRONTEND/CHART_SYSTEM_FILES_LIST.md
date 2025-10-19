# רשימת קבצים - מערכת גראפים TikTrack

## 📁 קבצים חדשים שייווצרו

### קבצי JavaScript

#### ליבת המערכת (מפושט)
```
trading-ui/scripts/charts/
├── chart-system.js              # מערכת גראפים מרכזית (כל הפונקציות)
├── chart-loader.js              # טעינת Chart.js דינמית
├── chart-theme.js               # עיצוב וצבעים (אינטגרציה עם מערכת הצבעים)
└── adapters/
    ├── performance-adapter.js   # מתאם נתוני ביצועים
    └── linter-adapter.js        # מתאם נתוני Linter
```

> **📝 הערה**: מבנה מפושט לשלב ראשון. ראה [ארכיטקטורה מפושטת](CHART_SYSTEM_SIMPLIFIED_ARCHITECTURE.md) לפרטים מלאים על הרחבה עתידית.

### קבצי HTML

#### עמוד ניהול
```
trading-ui/
├── chart-management.html            # עמוד ניהול גרפים
└── chart-management.js              # JavaScript לעמוד ניהול
```

### קבצי CSS

#### עיצוב גרפים
```
trading-ui/styles-new/
├── charts/
│   ├── _chart-system.css            # עיצוב מערכת גרפים
│   ├── _chart-management.css        # עיצוב עמוד ניהול
│   └── _chart-themes.css            # עיצוב נושאים
```

### קבצי תיעוד

#### תיעוד טכני
```
documentation/frontend/
├── CHART_SYSTEM_OVERVIEW.md         # סקירה כללית
├── CHART_SYSTEM_DESIGN.md           # עיצוב מערכת
├── CHART_SYSTEM_TECHNICAL_SPEC.md   # מפרט טכני
├── CHART_SYSTEM_IMPLEMENTATION_PLAN.md # תוכנית יישום
└── CHART_SYSTEM_FILES_LIST.md       # רשימת קבצים (זה)
```

#### תיעוד משתמש (עתידי)
```
├── CHART_SYSTEM_USER_GUIDE.md       # מדריך משתמש
├── CHART_SYSTEM_DEVELOPER_GUIDE.md  # מדריך מפתח
└── CHART_SYSTEM_TROUBLESHOOTING.md  # מדריך פתרון בעיות
```

## 📝 קבצים שיעודכנו

### קבצי HTML קיימים
```
trading-ui/
├── index.html                       # עדכון לטעינת מערכת חדשה
├── linter-realtime-monitor.html     # עדכון לטעינת מערכת חדשה
└── cache-test.html                  # עדכון לטעינת מערכת חדשה
```

### קבצי JavaScript קיימים
```
trading-ui/scripts/
├── index.js                         # הסרת פונקציות כפולות
├── linter-realtime-monitor.js       # הסרת פונקציות כפולות
└── chart-renderer.js                # הסרת פונקציות כפולות
```

### קבצי תפריט
```
trading-ui/scripts/
├── header-system.js                 # הוספת עמוד ניהול לתפריט
└── menu.js                          # הוספת עמוד ניהול לתפריט
```

## 🗑️ קבצים שיימחקו

### קבצי JavaScript כפולים
```
trading-ui/scripts/
├── chart-loader.js                  # יוחלף בגרסה חדשה
├── js-map-init.js                   # יוחלף במערכת מרכזית
├── trade-plans-init.js              # יוחלף במערכת מרכזית
├── executions-init.js               # יוחלף במערכת מרכזית
├── tickers-init.js                  # יוחלף במערכת מרכזית
├── notes-init.js                    # יוחלף במערכת מרכזית
└── cash-flows-init.js               # יוחלף במערכת מרכזית
```

### קבצי CSS כפולים
```
trading-ui/styles-new/
├── header-styles.css                # הסרת סגנונות גרפים
└── _info-summary.css                # הסרת סגנונות גרפים
```

## 📊 סטטיסטיקות

### קבצים חדשים (שלב ראשון)
- **JavaScript**: 5 קבצים
- **HTML**: 1 קובץ
- **CSS**: 1 קובץ
- **תיעוד**: 5 קבצים
- **סה"כ**: 12 קבצים חדשים

### קבצים שיעודכנו
- **HTML**: 3 קבצים
- **JavaScript**: 5 קבצים
- **סה"כ**: 8 קבצים

### קבצים שיימחקו
- **JavaScript**: 7 קבצים
- **CSS**: 2 קבצים
- **סה"כ**: 9 קבצים

### סיכום (שלב ראשון)
- **קבצים חדשים**: +12
- **קבצים מעודכנים**: 8
- **קבצים נמחקים**: -9
- **שינוי נטו**: +11 קבצים

## 📋 רשימת משימות לפי קבצים

### שלב 1: תשתית בסיסית
- [ ] `chart-system.js` - מערכת מרכזית
- [ ] `chart-loader.js` - טעינה דינמית
- [ ] `chart-registry.js` - רישום גרפים
- [ ] `chart-theme.js` - עיצוב וצבעים
- [ ] `default-theme.js` - נושא ברירת מחדל

### שלב 2: גרפים קיימים
- [ ] `performance-adapter.js` - מתאם ביצועים
- [ ] `linter-adapter.js` - מתאם Linter
- [ ] `base-adapter.js` - מחלקת בסיס
- [ ] עדכון `index.html`
- [ ] עדכון `linter-realtime-monitor.html`

### שלב 3: עמוד ניהול
- [ ] `chart-management.html` - עמוד ניהול
- [ ] `chart-management.js` - JavaScript ניהול
- [ ] `chart-management.css` - עיצוב ניהול
- [ ] עדכון `header-system.js`
- [ ] עדכון `menu.js`

### שלב 4: תכונות עתידיות
- [ ] `chart-export.js` - ייצוא (עתידי)
- [ ] `export-formats.js` - פורמטי ייצוא
- [ ] `future-adapters.js` - מתאמים עתידיים
- [ ] `future-themes.js` - נושאים עתידיים
- [ ] תיעוד משתמש

## 🔧 הגדרות פיתוח

### סביבת פיתוח
- **IDE**: VS Code עם הרחבות JavaScript
- **בדיקות**: Jest, Cypress
- **בדיקות ביצועים**: Lighthouse
- **בדיקות נגישות**: axe-core

### כלי ניהול
- **גרסאות**: Git
- **ניהול משימות**: GitHub Issues
- **תקשורת**: Slack
- **תיעוד**: GitHub Wiki

## 📞 תמיכה וקשר

### צוות פיתוח
- **מנהל פרויקט**: Nimrod
- **מפתח ראשי**: [להגדיר]
- **מעצב UI/UX**: [להגדיר]
- **בודק איכות**: [להגדיר]

### ערוצי תקשורת
- **GitHub Issues**: דיווח באגים
- **Slack**: תקשורת יומית
- **Email**: תקשורת רשמית
- **Wiki**: תיעוד שיתופי

---

**גרסה**: 1.0.0  
**תאריך עדכון**: 2025-01-20  
**מחבר**: TikTrack Development Team  
**סטטוס**: בתכנון

# תבנית מבנה עמוד - Page Structure Template

> 📋 **מסמך זה מגדיר את המבנה הסטנדרטי לכל עמוד במערכת TikTrack**

## טעינת CSS - ITCSS Architecture

### סדר טעינת CSS נכון (חובה!)

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>שם העמוד - TikTrack</title>

    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">

    <!-- Bootstrap CSS - חייב להיות קודם -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

    <!-- TikTrack ITCSS Architecture - Complete Implementation -->
    <!-- CSS Files - אחרי Bootstrap כדי לדרוס אותו -->
    <!-- 🔄 CURRENT IMPLEMENTATION: Individual <link> tags for all layers -->
    
    <!-- 01-settings - Variables and Settings -->
    <link rel="stylesheet" href="styles-new/01-settings/_variables.css?v=1.0.0">
    <link rel="stylesheet" href="styles-new/01-settings/_colors-dynamic.css?v=1.0.0">
    <link rel="stylesheet" href="styles-new/01-settings/_colors-semantic.css?v=1.0.0">
    <link rel="stylesheet" href="styles-new/01-settings/_spacing.css?v=1.0.0">
    <link rel="stylesheet" href="styles-new/01-settings/_typography.css?v=1.0.0">
    <link rel="stylesheet" href="styles-new/01-settings/_rtl-logical.css?v=1.0.0">
    
    <!-- 02-tools - Functions and Mixins -->
    <link rel="stylesheet" href="styles-new/02-tools/_mixins.css?v=1.0.0">
    <link rel="stylesheet" href="styles-new/02-tools/_functions.css?v=1.0.0">
    <link rel="stylesheet" href="styles-new/02-tools/_utilities.css?v=1.0.0">
    
    <!-- 03-generic - Reset and Normalization -->
    <link rel="stylesheet" href="styles-new/03-generic/_reset.css?v=1.0.0">
    <link rel="stylesheet" href="styles-new/03-generic/_base.css?v=1.0.0">
    
    <!-- 04-elements - Basic HTML Elements -->
    <link rel="stylesheet" href="styles-new/04-elements/_headings.css?v=1.0.0">
    <link rel="stylesheet" href="styles-new/04-elements/_links.css?v=1.0.0">
    <link rel="stylesheet" href="styles-new/04-elements/_forms-base.css?v=1.0.0">
    <link rel="stylesheet" href="styles-new/04-elements/_buttons-base.css?v=1.0.0">
    
    <!-- 05-objects - Layout Structures -->
    <link rel="stylesheet" href="styles-new/05-objects/_layout.css?v=1.0.0">
    <link rel="stylesheet" href="styles-new/05-objects/_grid.css?v=1.0.0">
    
    <!-- 06-components - UI Components -->
    <link rel="stylesheet" href="styles-new/06-components/_buttons-advanced.css?v=1.0.0">
    <link rel="stylesheet" href="styles-new/06-components/_tables.css?v=1.0.0">
    <link rel="stylesheet" href="styles-new/06-components/_cards.css?v=1.0.0">
    <link rel="stylesheet" href="styles-new/06-components/_modals.css?v=1.0.0">
    <link rel="stylesheet" href="styles-new/06-components/_notifications.css?v=1.0.0">
    <link rel="stylesheet" href="styles-new/06-components/_navigation.css?v=1.0.0">
    <link rel="stylesheet" href="styles-new/06-components/_forms-advanced.css?v=1.0.0">
    <link rel="stylesheet" href="styles-new/06-components/_badges-status.css?v=1.0.0">
    <link rel="stylesheet" href="styles-new/06-components/_entity-colors.css?v=1.0.0">
    <link rel="stylesheet" href="styles-new/06-components/_page-headers.css?v=1.0.0">
    <link rel="stylesheet" href="styles-new/06-components/_info-summary.css?v=1.0.0">
    <link rel="stylesheet" href="styles-new/06-components/_constraints.css?v=1.0.0">
    <link rel="stylesheet" href="styles-new/06-components/_system-management.css?v=1.0.0">
    <link rel="stylesheet" href="styles-new/06-components/_chart-management.css?v=1.0.0">
    
    <!-- 07-pages - Page-specific Styles (OPTIONAL - Add only if needed) -->
    <!-- <link rel="stylesheet" href="styles-new/07-pages/_[page-name].css?v=1.0.0"> -->
    
    <!-- 08-themes - Themes -->
    <link rel="stylesheet" href="styles-new/08-themes/_light.css?v=1.0.0">
    
    <!-- 09-utilities - Utility Classes -->
    <link rel="stylesheet" href="styles-new/09-utilities/_utilities.css?v=1.0.0">
    <link rel="stylesheet" href="styles-new/09-utilities/_display.css?v=1.0.0">
    <link rel="stylesheet" href="styles-new/09-utilities/_responsive.css?v=1.0.0">
    <link rel="stylesheet" href="styles-new/09-utilities/_spacing.css?v=1.0.0">
    <link rel="stylesheet" href="styles-new/09-utilities/_text.css?v=1.0.0">

    <!-- Header Styles - נפרד מ-ITCSS -->
    <link rel="stylesheet" href="styles-new/header-styles.css?v=20250115_level3_fix">

    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">

    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
```

## מבנה עמוד סטנדרטי

### ⚠️ הערות חשובות:
1. **התבנית הנוכחית מבוססת על ניתוח של 15 עמודים פעילים במערכת**
2. **המערכת משתמשת בקבצי CSS נפרדים** - לא ב-main.css מאוחד
3. **סדר הטעינה חיוני** - Bootstrap לפני כל קבצי ITCSS
4. **מבנה HTML גמיש** - `background-wrapper` ו-`page-body` מותרים אם נדרשים
5. **מחלקות נוספות מותרות** - כל עוד הן תואמות לארכיטקטורת ITCSS
6. **שכבה 07-pages אופציונלית** - הוסף רק אם נדרש קובץ ספציפי לעמוד

### מבנה HTML בסיסי

```html
<div class="main-content">
    <!-- UI Content Section Top Start-->
    <div class="top-section">
        <div class="section-header">
            <!-- UI section main top header comes here --> 
        </div>
        <div class="section-body">
            <!-- UI Top section body comes here --> 
        </div>
    </div>
    <!-- UI Content Section Top End -->  

    <!-- UI Content Section 1 Start-->
    <div class="content-section">
        <div class="section-header">
            <!-- UI section title comes here --> 
        </div>
        <div class="section-body">
            <!-- UI section body comes here --> 
        </div>
    </div>
    <!-- UI Content Section 1 End -->   

    <!-- UI Content Section 2 Start-->
    <div class="content-section">
        <div class="section-header">
            <!-- UI section title comes here --> 
        </div>
        <div class="section-body">
            <!-- UI section body comes here --> 
        </div>
    </div>
    <!-- UI Content Section 2 End--> 

    <!-- UI Content Section 3 Start-->
    <div class="content-section">
        <div class="section-header">
            <!-- UI section title comes here --> 
        </div>
        <div class="section-body">
            <!-- UI section body comes here --> 
        </div>
    </div>
    <!-- UI Content Section 3 End--> 
</div>
```

## הסבר המבנה

### 1. Container ראשי
- **`main-content`**: מכיל את כל התוכן של העמוד
- **רוחב מקסימלי**: 1400px
- **ריווח פנימי**: 10px מהצדדים

### 2. Top Section (סקשן עליון)
- **`top-section`**: סקשן מיוחד עם סגנון מעט שונה
- **`section-header`**: כותרת הסקשן העליון
- **`section-body`**: תוכן הסקשן העליון
- **יורש מ**: `content-section` + הוספות ספציפיות

### 3. Content Sections (סקשנים רגילים)
- **`content-section`**: סקשן רגיל לתוכן
- **`section-header`**: כותרת הסקשן (למשל "ביצועים", "סטטיסטיקות")
- **`section-body`**: תוכן הסקשן (כרטיסים, טבלאות, טפסים)

## כללי שימוש

### יצירת עמוד חדש
1. העתק את המבנה הבסיסי
2. הוסף תוכן ל-`section-header` ו-`section-body`
3. השתמש ב-`top-section` למידע כללי על העמוד
4. השתמש ב-`content-section` לתוכן ספציפי

### הוספת סקשן חדש
1. העתק את המבנה של `content-section`
2. עדכן את המספר בסוף ההערות
3. הוסף תוכן מתאים

### שינוי כותרת סקשן
- עדכן את התוכן ב-`section-header`
- השתמש בכותרת מתאימה (H1, H2, H3)

### הוספת תוכן לסקשן
- הוסף את התוכן ב-`section-body`
- השתמש בכרטיסים, טבלאות, או אלמנטים אחרים

## דוגמאות שימוש

### עמוד ביצועים
```html
<div class="top-section">
    <div class="section-header">
        <h1>📊 ביצועים - דוח חודשי</h1>
    </div>
    <div class="section-body">
        <h2>תוכן סקשן עליון</h2>
    </div>
</div>

<div class="content-section">
    <div class="section-header">
        <h2>📈 סטטיסטיקות מסחר</h2>
    </div>
    <div class="section-body">
        <!-- כרטיסי ביצועים -->
    </div>
</div>
```

### עמוד התראות
```html
<div class="top-section">
    <div class="section-header">
        <h1>🔔 התראות מערכת</h1>
    </div>
    <div class="section-body">
        <h2>תוכן סקשן עליון</h2>
    </div>
</div>

<div class="content-section">
    <div class="section-header">
        <h2>⚠️ התראות פעילות</h2>
    </div>
    <div class="section-body">
        <!-- רשימת התראות -->
    </div>
</div>
```

## CSS Classes

### Classes עיקריים
- **`.main-content`**: Container ראשי
- **`.top-section`**: סקשן עליון מיוחד
- **`.content-section`**: סקשן תוכן רגיל
- **`.section-header`**: כותרת סקשן
- **`.section-body`**: תוכן סקשן

### Classes משניים
- **`.row`**: שורה (Bootstrap)
- **`.col-md-*`**: עמודות (Bootstrap)
- **`.card`**: כרטיס
- **`.card-header`**: כותרת כרטיס
- **`.card-body`**: תוכן כרטיס

## תחזוקה ועדכונים

### עדכון מבנה
1. עדכן את התבנית כאן
2. עדכן את כל העמודים הקיימים
3. בדוק שהכל עובד כראוי

### הוספת תכונות חדשות
1. הוסף CSS classes חדשים
2. עדכן את התבנית
3. עדכן את הדוקומנטציה

---

## 📊 ניתוח מפורט של המערכת הנוכחית (ינואר 2025)

### 🔍 ממצאי הניתוח:

#### **1. עמודים עם מבנה מלא (33 קבצי CSS):**
- `alerts.html`, `cash_flows.html`, `db_display.html`, `db_extradata.html`
- `executions.html`, `notes.html`, `research.html`, `tickers.html`, `trading_accounts.html`

#### **2. עמודים עם מבנה חלקי:**
- `constraints.html` (25 קבצים) - חסרים: 02-tools, 07-pages, 08-themes, 09-utilities
- `designs.html` (24 קבצים) - חסרים: 02-tools, 07-pages, 08-themes, 09-utilities
- `index.html` (30 קבצים) - חסרים: 07-pages
- `preferences.html` (36 קבצים) - כולל 07-trumps
- `trade_plans.html` (28 קבצים) - חסרים: 07-pages, 09-utilities
- `trades.html` (28 קבצים) - חסרים: 07-pages, 09-utilities

#### **3. סדר הקבצים המדויק:**
```
01-settings: _variables, _colors-dynamic, _colors-semantic, _spacing, _typography, _rtl-logical
02-tools: _mixins, _functions, _utilities
03-generic: _reset, _base
04-elements: _headings, _links, _forms-base, _buttons-base
05-objects: _layout, _grid
06-components: _buttons-advanced, _tables, _cards, _modals, _notifications, _navigation, _forms-advanced, _badges-status, _entity-colors, _page-headers, _info-summary, _constraints, _system-management, _chart-management
07-pages: _[page-name] (אופציונלי)
08-themes: _light
09-utilities: _utilities, _display, _responsive, _spacing, _text
```

#### **4. קבצים נוספים:**
- `header-styles.css` - נפרד מ-ITCSS
- Bootstrap Icons
- Font Awesome

### 🎯 המלצות:

1. **השתמש בתבנית המלאה** - 33 קבצי CSS לכל עמוד חדש
2. **הוסף 07-pages רק אם נדרש** - קובץ ספציפי לעמוד
3. **שמור על הסדר המדויק** - זה קריטי לתפקוד המערכת
4. **השתמש ב-header-styles.css** - נפרד מ-ITCSS

---

**📝 הערה**: מסמך זה מתעדכן עם כל שינוי במבנה העמודים במערכת. ניתוח אחרון: ינואר 2025.

# תבנית מבנה עמוד - Page Structure Template

> 📋 **מסמך זה מגדיר את המבנה הסטנדרטי לכל עמוד במערכת TikTrack**

**🔄 עדכון אחרון**: 6 בינואר 2025 - מערכת כללית חדשה עם 8 מודולים מאוחדים וטעינה דינמית

## טעינת CSS - ITCSS Architecture

### סדר טעינת CSS נכון (חובה!)

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>שם העמוד - TikTrack</title>

    <!-- Google Fonts - Heebo (הפונט החדש של המערכת) -->
    <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">

    <!-- Bootstrap CSS - חייב להיות קודם -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
    
    <!-- ITCSS Architecture - Complete Implementation -->
    
    <!-- 01-settings - Variables and Settings -->
    <link rel="stylesheet" href="styles-new/01-settings/_variables.css?v=20251006">
    <link rel="stylesheet" href="styles-new/01-settings/_colors-dynamic.css?v=20251006">
    <link rel="stylesheet" href="styles-new/01-settings/_colors-semantic.css?v=20251006">
    <link rel="stylesheet" href="styles-new/01-settings/_spacing.css?v=20251006">
    <link rel="stylesheet" href="styles-new/01-settings/_typography.css?v=20251006">
    <link rel="stylesheet" href="styles-new/01-settings/_rtl-logical.css?v=20251006">
    
    <!-- 02-tools - Functions and Mixins -->
    <link rel="stylesheet" href="styles-new/02-tools/_mixins.css?v=20251006">
    <link rel="stylesheet" href="styles-new/02-tools/_functions.css?v=20251006">
    <link rel="stylesheet" href="styles-new/02-tools/_utilities.css?v=20251006">
    <link rel="stylesheet" href="styles-new/02-tools/_rtl-helpers.css?v=20251006">
    
    <!-- 03-generic - Reset and Normalization -->
    <link rel="stylesheet" href="styles-new/03-generic/_reset.css?v=20251006">
    <link rel="stylesheet" href="styles-new/03-generic/_base.css?v=20251006">
    
    <!-- 04-elements - Basic HTML Elements -->
    <link rel="stylesheet" href="styles-new/04-elements/_headings.css?v=20251006">
    <link rel="stylesheet" href="styles-new/04-elements/_links.css?v=20251006">
    <link rel="stylesheet" href="styles-new/04-elements/_forms-base.css?v=20251006">
    <link rel="stylesheet" href="styles-new/04-elements/_buttons-base.css?v=20251006">
    
    <!-- 05-objects - Layout Structures -->
    <link rel="stylesheet" href="styles-new/05-objects/_layout.css?v=20251006">
    <link rel="stylesheet" href="styles-new/05-objects/_grid.css?v=20251006">
    
    <!-- 06-components - UI Components -->
    <link rel="stylesheet" href="styles-new/06-components/_buttons-advanced.css?v=20251006">
    <link rel="stylesheet" href="styles-new/06-components/_tables.css?v=20251006">
    <link rel="stylesheet" href="styles-new/06-components/_cards.css?v=20251006">
    <link rel="stylesheet" href="styles-new/06-components/_modals.css?v=20251006">
    <link rel="stylesheet" href="styles-new/06-components/_notifications.css?v=20251006">
    <link rel="stylesheet" href="styles-new/06-components/_navigation.css?v=20251006">
    <link rel="stylesheet" href="styles-new/06-components/_forms-advanced.css?v=20251006">
    <link rel="stylesheet" href="styles-new/06-components/_badges-status.css?v=20251006">
    <link rel="stylesheet" href="styles-new/06-components/_entity-colors.css?v=20251006">
    
    <!-- 07-trumps - Page-specific Styles -->
    <!-- הוסף כאן קובץ CSS ספציפי לעמוד (למשל: _alerts.css, _trades.css) -->
    
    <!-- 08-themes - Themes -->
    <link rel="stylesheet" href="styles-new/08-themes/_light.css?v=20251006">
    
    <!-- 09-utilities - Utility Classes -->
    <link rel="stylesheet" href="styles-new/09-utilities/_utilities.css?v=20251006">

    <!-- External Libraries -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
```

## טעינת JavaScript - מערכת כללית חדשה

### סדר טעינת JavaScript נכון (חובה!)

```html
<body>
    <!-- 🔒 LOCKED TEMPLATE ZONE 1 - Header & Navigation (DO NOT MODIFY) -->
    <div id="unified-header"></div>
    
    <!-- 🔒 LOCKED TEMPLATE ZONE 2 - Main Content Container (DO NOT MODIFY) -->
    <div class="main-content">
        <!-- תוכן העמוד כאן -->
    </div>

    <!-- Bootstrap JavaScript -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

    <!-- מערכת כללית חדשה - 8 מודולים מאוחדים -->
    
    <!-- Stage 1: Core Systems (חובה) -->
    <script src="scripts/modules/core-systems.js?v=20251006"></script>
    
    <!-- Stage 2: Dynamic Loader Configuration -->
    <script src="scripts/modules/dynamic-loader-config.js?v=20251006"></script>
    
    <!-- Stage 3: Page Initialization Configurations -->
    <script src="scripts/page-initialization-configs.js?v=20251006"></script>
    
    <!-- Stage 4: Global Systems -->
    <script src="scripts/global-favicon.js?v=20251006"></script>
    <script src="scripts/translation-utils.js?v=20251006"></script>
    <script src="scripts/header-system.js?v=v6.0.0"></script>
    <script src="scripts/date-utils.js?v=20251006"></script>
    <script src="scripts/button-icons.js?v=20251006"></script>
    <script src="scripts/page-utils.js?v=20251006"></script>
    <script src="scripts/preferences.js?v=20251006"></script>
    <script src="scripts/notification-category-detector.js?v=20251006"></script>
    <script src="scripts/global-notification-collector.js?v=20251006"></script>
    <script src="scripts/system-management.js?v=20251006"></script>
    <script src="scripts/entity-details-modal.js?v=20251006"></script>
    <script src="scripts/warning-system.js?v=20251006"></script>
    
    <!-- Stage 5: Page-specific Script -->
    <script src="scripts/[PAGE_NAME].js?v=20251006"></script>
</body>
```

### הסבר על המערכת החדשה

#### **8 מודולים מאוחדים:**
1. **`modules/core-systems.js`** - מערכות ליבה (אתחול, התראות, מודולים)
2. **`modules/ui-basic.js`** - ממשק משתמש בסיסי
3. **`modules/data-basic.js`** - נתונים וטבלאות בסיסיות
4. **`modules/ui-advanced.js`** - ממשק משתמש מתקדם
5. **`modules/data-advanced.js`** - נתונים מתקדמים
6. **`modules/business-module.js`** - לוגיקה עסקית
7. **`modules/communication-module.js`** - תקשורת ושגיאות
8. **`modules/cache-module.js`** - מערכת מטמון מאוחדת

#### **יתרונות המערכת החדשה:**
- **90% חיסכון בזיכרון** - טעינה מותנית של מודולים
- **70% שיפור בזמן טעינה** - טעינה מהירה יותר
- **תמיכה מלאה** - תאימות לאחור עם המערכת הישנה

## מבנה עמוד סטנדרטי

### מבנה HTML בסיסי

```html
<div class="main-content">
    <!-- UI Content Section Top Start-->
    <div class="top-section">
        <div class="section-header">
            <h1>🎯 שם העמוד</h1>
            <div class="header-actions">
                <button class="btn btn-sm btn-outline-secondary" onclick="copyDetailedLog()" title="העתק לוג מפורט">
                    <i class="fas fa-copy"></i> העתק לוג מפורט
                </button>
                <button class="filter-toggle-btn" onclick="toggleSection('top')" title="הצג/הסתר סקשן">
                    <span class="filter-icon">▲</span>
                </button>
            </div>
        </div>
        <div class="section-body">
            <!-- UI Top section body comes here --> 
        </div>
    </div>
    <!-- UI Content Section Top End -->  

    <!-- UI Content Section 1 Start-->
    <div class="content-section">
        <div class="section-header">
            <h2>📊 כותרת סקשן 1</h2>
            <div class="header-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="action1()" title="פעולה ראשונה">
                    <i class="fas fa-plus"></i> פעולה
                </button>
                <button class="filter-toggle-btn" onclick="toggleSection('section1')" title="הצג/הסתר סקשן">
                    <span class="section-toggle-icon">▼</span>
                </button>
            </div>
        </div>
        <div class="section-body">
            <!-- UI section body comes here --> 
        </div>
    </div>
    <!-- UI Content Section 1 End -->   

    <!-- UI Content Section 2 Start-->
    <div class="content-section">
        <div class="section-header">
            <h2>🔧 כותרת סקשן 2</h2>
            <div class="header-actions">
                <button class="btn btn-sm btn-outline-warning" onclick="action2()" title="פעולה שנייה">
                    <i class="fas fa-cog"></i> הגדרות
                </button>
                <button class="filter-toggle-btn" onclick="toggleSection('section2')" title="הצג/הסתר סקשן">
                    <span class="section-toggle-icon">▼</span>
                </button>
            </div>
        </div>
        <div class="section-body">
            <!-- UI section body comes here --> 
        </div>
    </div>
    <!-- UI Content Section 2 End--> 

    <!-- UI Content Section 3 Start-->
    <div class="content-section">
        <div class="section-header">
            <h2>📈 כותרת סקשן 3</h2>
            <div class="header-actions">
                <button class="btn btn-sm btn-outline-success" onclick="action3()" title="פעולה שלישית">
                    <i class="fas fa-download"></i> ייצוא
                </button>
                <button class="filter-toggle-btn" onclick="toggleSection('section3')" title="הצג/הסתר סקשן">
                    <span class="section-toggle-icon">▼</span>
                </button>
            </div>
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
1. **העתק את המבנה הבסיסי** - כולל CSS ו-JavaScript
2. **עדכן את הכותרת** - `<title>שם העמוד - TikTrack</title>`
3. **הוסף CSS ספציפי** - ב-`07-trumps` (למשל: `_alerts.css`, `_trades.css`)
4. **הוסף תוכן ל-`section-header` ו-`section-body`**
5. **השתמש ב-`top-section`** למידע כללי על העמוד
6. **השתמש ב-`content-section`** לתוכן ספציפי
7. **חובה**: הוסף `header-actions` לכל כותרת סקשן
8. **עדכן את הסקריפט** - `scripts/[PAGE_NAME].js`
9. **הוסף route** - ב-`Backend/routes/pages.py`
10. **הוסף לתפריט** - ב-`scripts/header-system.js`

### הוספת סקשן חדש
1. העתק את המבנה של `content-section`
2. עדכן את המספר בסוף ההערות
3. הוסף תוכן מתאים
4. **חובה**: הוסף `header-actions` עם כפתור פתיחה/סגירה

### שינוי כותרת סקשן
- עדכן את התוכן ב-`section-header`
- השתמש בכותרת מתאימה (H1, H2, H3)
- **חובה**: הוסף `header-actions` עם כפתורי פעולה רלוונטיים

### הוספת תוכן לסקשן
- הוסף את התוכן ב-`section-body`
- השתמש בכרטיסים, טבלאות, או אלמנטים אחרים

### הוספת כפתורי פעולה בכותרת
1. צור `div` עם מחלקה `header-actions`
2. הוסף כפתורי פעולה רלוונטיים (למשל: ייצוא, עריכה, מחיקה)
3. **חובה**: הוסף כפתור `filter-toggle-btn` אחרון ברצף
4. השתמש ב-`filter-icon` (▲) לסקשן עליון
5. השתמש ב-`section-toggle-icon` (▼) לסקשנים רגילים

## דוגמאות שימוש

### עמוד ביצועים
```html
<div class="top-section">
    <div class="section-header">
        <h1>📊 ביצועים - דוח חודשי</h1>
        <div class="header-actions">
            <button class="btn btn-sm btn-outline-secondary" onclick="copyDetailedLog()" title="העתק לוג מפורט">
                <i class="fas fa-copy"></i> העתק לוג מפורט
            </button>
            <button class="filter-toggle-btn" onclick="toggleSection('top')" title="הצג/הסתר סקשן">
                <span class="filter-icon">▲</span>
            </button>
        </div>
    </div>
    <div class="section-body">
        <h2>תוכן סקשן עליון</h2>
    </div>
</div>

<div class="content-section">
    <div class="section-header">
        <h2>📈 סטטיסטיקות מסחר</h2>
        <div class="header-actions">
            <button class="btn btn-sm btn-outline-primary" onclick="exportData()" title="ייצא נתונים">
                <i class="fas fa-download"></i> ייצוא
            </button>
            <button class="filter-toggle-btn" onclick="toggleSection('section1')" title="הצג/הסתר סקשן">
                <span class="section-toggle-icon">▼</span>
            </button>
        </div>
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
        <div class="header-actions">
            <button class="btn btn-sm btn-outline-secondary" onclick="copyDetailedLog()" title="העתק לוג מפורט">
                <i class="fas fa-copy"></i> העתק לוג מפורט
            </button>
            <button class="filter-toggle-btn" onclick="toggleSection('top')" title="הצג/הסתר סקשן">
                <span class="filter-icon">▲</span>
            </button>
        </div>
    </div>
    <div class="section-body">
        <h2>תוכן סקשן עליון</h2>
    </div>
</div>

<div class="content-section">
    <div class="section-header">
        <h2>⚠️ התראות פעילות</h2>
        <div class="header-actions">
            <button class="btn btn-sm btn-outline-warning" onclick="clearAllAlerts()" title="נקה כל ההתראות">
                <i class="fas fa-trash"></i> נקה הכל
            </button>
            <button class="filter-toggle-btn" onclick="toggleSection('section1')" title="הצג/הסתר סקשן">
                <span class="section-toggle-icon">▼</span>
            </button>
        </div>
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
- **`.header-actions`**: כפתורי פעולה בכותרת סקשן

### Classes לכפתורים בכותרת
- **`.header-actions`**: Container לכפתורי פעולה בכותרת
- **`.filter-toggle-btn`**: כפתור פתיחה/סגירה של סקשן
- **`.filter-icon`**: אייקון לכפתור פתיחה/סגירה (▲/▼)
- **`.section-toggle-icon`**: אייקון לכפתור סקשן רגיל

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

## מחלקת header-actions

### מיקום ב-CSS
המחלקה `header-actions` מוגדרת ב-`styles-new/05-objects/_layout.css`:

```css
/* Header Actions - כפתורי פעולה בכותרת */
.header-actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  margin-inline-start: auto; /* דוחף לסוף השורה - שמאל בעברית */
}
```

### עקרונות עיצוב
- **יישור**: הכפתורים מיושרים לסוף השורה (שמאל בעברית)
- **רווח**: רווח של 0.5rem בין הכפתורים
- **גמישות**: הכפתורים מסודרים בשורה עם `flex`
- **Responsive**: במובייל הכפתורים מסתדרים בעמודה

### דוגמאות לכפתורים
- **העתק לוג מפורט**: `btn-outline-secondary`
- **שמור הכל**: `btn-success`
- **איפוס**: `btn-warning`
- **ייצוא**: `btn-outline-primary`
- **פתיחה/סגירה**: `filter-toggle-btn`

### חובה לכל עמוד חדש
כל עמוד חדש חייב לכלול `header-actions` בכל כותרת סקשן עם:
1. כפתורי פעולה רלוונטיים לסקשן
2. כפתור `filter-toggle-btn` אחרון ברצף
3. שימוש ב-`filter-icon` (▲) לסקשן עליון
4. שימוש ב-`section-toggle-icon` (▼) לסקשנים רגילים

## מערכת כללית חדשה - מידע נוסף

### דוקומנטציה מפורטת
- **אפיון המערכת**: [new_general_systems_architecture_specification.md](../../new_general_systems_architecture_specification.md)
- **תוכנית יישום**: [new_general_systems_implementation_plan.md](../../new_general_systems_implementation_plan.md)
- **סיכום פרויקט**: [new_general_systems_project_summary.md](../../new_general_systems_project_summary.md)

### רשימת מערכות כלליות
- **רשימת מערכות**: [GENERAL_SYSTEMS_LIST.md](GENERAL_SYSTEMS_LIST.md)
- **ארכיטקטורת JavaScript**: [JAVASCRIPT_ARCHITECTURE.md](JAVASCRIPT_ARCHITECTURE.md)
- **מערכת אתחול מאוחדת**: [UNIFIED_INITIALIZATION_SYSTEM.md](UNIFIED_INITIALIZATION_SYSTEM.md)

### ביצועים ומדדים
- **לפני המערכת החדשה**: 66 קבצים נפרדים, 1.5MB, 3-5 שניות טעינה
- **אחרי המערכת החדשה**: 8 מודולים מאוחדים, 165KB, 1-2 שניות טעינה
- **חיסכון**: 90% בזיכרון, 70% בזמן טעינה

---

**📝 הערה**: מסמך זה מתעדכן עם כל שינוי במבנה העמודים במערכת.

**תאריך עדכון**: 6 בינואר 2025  
**גרסה**: 3.0.0  
**סטטוס**: ✅ מעודכן למערכת החדשה

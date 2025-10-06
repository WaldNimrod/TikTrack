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

    <!-- TikTrack ITCSS Main CSS - אחרי Bootstrap כדי לדרוס אותו -->
    <!-- CSS Architecture: ראו documentation/frontend/CSS_ARCHITECTURE_GUIDE.md -->
    <!-- CSS טעינה נפרדת - אין main.css -->

    <!-- Header Styles - נפרד מ-ITCSS -->
    <link rel="stylesheet" href="styles-new/header-styles.css?v=20250115_level3_fix">

    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">

    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
```

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
1. העתק את המבנה הבסיסי
2. הוסף תוכן ל-`section-header` ו-`section-body`
3. השתמש ב-`top-section` למידע כללי על העמוד
4. השתמש ב-`content-section` לתוכן ספציפי
5. **חובה**: הוסף `header-actions` לכל כותרת סקשן

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

---

**📝 הערה**: מסמך זה מתעדכן עם כל שינוי במבנה העמודים במערכת.

# תבנית מבנה עמוד - Page Structure Template

> 📋 **מסמך זה מגדיר את המבנה הסטנדרטי לכל עמוד במערכת TikTrack**

## מבנה עמוד סטנדרטי

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

**📝 הערה**: מסמך זה מתעדכן עם כל שינוי במבנה העמודים במערכת.

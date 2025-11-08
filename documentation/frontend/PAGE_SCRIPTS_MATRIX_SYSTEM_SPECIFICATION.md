# מערכת מטריצת סקריפטים ועמודים - מפרט מלא
## Page Scripts Matrix System - Complete Specification

> **גרסה 1.0** - מערכת ניהול קבצים ועמודים מתקדמת
> 
> **עדכון מרץ 2025:** המערכת הורחבה ממיפוי בסיסי למערכת ניהול קבצים מקיפה
> 
> **סטטוס נובמבר 2025:** העמוד הועבר לארכיון והמערכת אינה פעילה. המסמך נשמר למעקב היסטורי בלבד.

---

## 📋 תוכן עניינים

- [מבוא ומטרות](#מבוא-ומטרות)
- [ארכיטקטורת המערכת](#ארכיטקטורת-המערכת)
- [רכיבי המערכת](#רכיבי-המערכת)
- [ממשק המשתמש](#ממשק-המשתמש)
- [API Endpoints](#api-endpoints)
- [מערכת ניהול קבצים](#מערכת-ניהול-קבצים)
- [מדריך למפתח](#מדריך-למפתח)
- [דוגמאות שימוש](#דוגמאות-שימוש)

---

## 🎯 מבוא ומטרות

### מטרות המערכת
מערכת מטריצת סקריפטים ועמודים נועדה לספק כלי ניהול מקיף לכל היבטי הקבצים והעמודים במערכת TikTrack:

1. **מיפוי עמודים לקבצים** - הצגת הקשרים בין עמודים לקבצי JavaScript
2. **ניהול קבצי JavaScript** - ניטור וניהול של כל קבצי ה-JS במערכת
3. **ניתוח תלויות** - זיהוי תלויות בין קבצים שונים
4. **סטטיסטיקות מערכת** - נתונים על שימוש בקבצים ובעמודים
5. **ניהול אחסון נתונים** - ניהול אחסון מקומי ונתונים זמניים
6. **בדיקת ארכיטקטורה** - וידוא עמידה בכללי הקוד
7. **סטטוס אינטגרציה** - מעקב אחר חיבורים למערכות חיצוניות

---

## 🏗️ ארכיטקטורת המערכת

### מבנה הקבצים
```
trading-ui/
├── page-scripts-matrix.html          # עמוד ראשי
├── scripts/page-scripts-matrix.js    # לוגיקה ראשית (עתידי)
└── styles-new/07-trumps/
    └── page-scripts-matrix.css       # עיצוב ייחודי
```

### רכיבי המערכת
1. **מיפוי עמודים** - טבלת מטריצה של עמודים וקבצים
2. **מנהל קבצים** - ניהול וניטור קבצי JavaScript
3. **ניתוח תלויות** - זיהוי קשרים בין קבצים
4. **סטטיסטיקות** - נתונים על שימוש במערכת
5. **ניהול אחסון** - ניהול נתונים מקומיים
6. **בדיקת ארכיטקטורה** - וידוא כללי קוד
7. **סטטוס אינטגרציה** - מעקב חיבורים

---

## 🖥️ ממשק המשתמש

### מבנה העמוד
```
Top Section - פעולות מהירות
├── כפתור העתק לוג מפורט
├── כפתור רענון נתונים
├── כפתור גיבוי נתונים
├── כפתור ניקוי נתונים ישנים
└── כפתור הצג/הסתר כל הסקשנים

Content Sections:
├── Section 1: 🗺️ מיפוי עמודים לקבצים
├── Section 2: 📁 ניהול קבצי JavaScript
├── Section 3: 🔗 ניתוח תלויות בין קבצים
├── Section 4: 📊 סטטיסטיקות מערכת
├── Section 5: 💾 ניהול אחסון נתונים
├── Section 6: 🏗️ בדיקת ארכיטקטורה
└── Section 7: 🔗 סטטוס אינטגרציה
```

### פעולות מהירות
- **העתק לוג מפורט** - יצירת דוח מפורט של מצב המערכת
- **רענון נתונים** - עדכון כל הנתונים מהשרת
- **גיבוי נתונים** - שמירת נתונים מקומיים
- **ניקוי נתונים ישנים** - הסרת נתונים לא רלוונטיים
- **הצג/הסתר כל הסקשנים** - ניהול תצוגת הסקשנים

---

## 🔌 API Endpoints

### נתונים בסיסיים
- `GET /api/page-scripts-matrix/scan-results` - תוצאות סריקה
- `GET /api/page-scripts-matrix/pages` - רשימת עמודים
- `GET /api/page-scripts-matrix/scripts` - רשימת קבצים

### ניהול קבצים
- `POST /api/page-scripts-matrix/scan` - סריקה חדשה
- `GET /api/page-scripts-matrix/file-info/{filename}` - מידע על קובץ
- `POST /api/page-scripts-matrix/update-mapping` - עדכון מיפוי

### סטטיסטיקות
- `GET /api/page-scripts-matrix/stats` - סטטיסטיקות כלליות
- `GET /api/page-scripts-matrix/usage-stats` - נתוני שימוש
- `GET /api/page-scripts-matrix/dependency-graph` - גרף תלויות

---

## 📁 מערכת ניהול קבצים

### סוגי קבצים
1. **סקריפטים ראשיים** - קבצים ספציפיים לעמודים
2. **סקריפטים שירותיים** - פונקציות עזר כלליות
3. **סקריפטי שירות** - קבצי API ושירותים

### ניטור קבצים
- מעקב אחר שינויים בקבצים
- זיהוי קבצים חסרים או לא בשימוש
- ניתוח תלויות בין קבצים
- בדיקת תקינות קבצים

---

## 👨‍💻 מדריך למפתח

### הוספת סקשן חדש
```javascript
// הוספת סקשן חדש ל-HTML
<div class="content-section" id="section8">
    <div class="section-header">
        <h2>🔧 סקשן חדש</h2>
        <button class="filter-toggle-btn" onclick="toggleSection('section8')">
            <span class="section-toggle-icon">▼</span>
        </button>
    </div>
    <div class="section-body">
        <div id="newSectionContent">
            <!-- תוכן הסקשן -->
        </div>
    </div>
</div>
```

### הוספת API endpoint
```python
# ב-Backend/routes/api/page_scripts_matrix.py
@page_scripts_matrix_bp.route('/new-endpoint', methods=['GET'])
def new_endpoint():
    try:
        # לוגיקה של ה-endpoint
        return jsonify({
            'status': 'success',
            'data': result
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500
```

### הוספת פונקציה מהירה
```javascript
// ב-HTML של העמוד
function newQuickAction() {
    console.log('🚀 New quick action...');
    if (typeof showNotification === 'function') {
        showNotification('מבצע פעולה חדשה...', 'info');
    }
    // לוגיקה של הפעולה
}
```

---

## 📖 דוגמאות שימוש

### סריקת מערכת קבצים
```javascript
// הפעלת סריקה חדשה
function scanFilesystem() {
    console.log('🔍 Starting filesystem scan...');
    
    // הצגת הודעת טעינה
    if (typeof showNotification === 'function') {
        showNotification('מתחיל סריקה של מערכת הקבצים...', 'info');
    }
    
    // קריאה ל-API
    fetch('/api/page-scripts-matrix/scan', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showNotification('סריקה הושלמה!', 'success');
            // עדכון הטבלה
            updateMatrixTable(data.data);
        }
    })
    .catch(error => {
        console.error('❌ Scan error:', error);
        showNotification('שגיאה בסריקה', 'error');
    });
}
```

### עדכון סטטיסטיקות
```javascript
// עדכון סטטיסטיקות בזמן אמת
function updateStatistics() {
    fetch('/api/page-scripts-matrix/stats')
    .then(response => response.json())
    .then(stats => {
        document.getElementById('totalPages').textContent = stats.total_pages;
        document.getElementById('primaryScripts').textContent = stats.primary_scripts;
        document.getElementById('utilityScripts').textContent = stats.utility_scripts;
        document.getElementById('serviceScripts').textContent = stats.service_scripts;
    });
}
```

---

## 🔧 תחזוקה ופיתוח

### כללי קוד
1. **שמות פונקציות** - באנגלית עם הסבר ברור
2. **תגובות API** - מבנה אחיד עם status ו-data
3. **הודעות שגיאה** - בעברית למשתמש
4. **לוגים** - באנגלית למפתחים

### בדיקות
1. **בדיקות יחידה** - לכל פונקציה חדשה
2. **בדיקות אינטגרציה** - בין רכיבי המערכת
3. **בדיקות ביצועים** - לזמני טעינה ותגובה
4. **בדיקות תאימות** - עם דפדפנים שונים

---

## 📚 משאבים נוספים

- [מסמך משימות החלוקה](../JS_MAP_SPLIT_TASK_DOCUMENT.md)
- [מפרט מערכת JS-Map](../JS_MAP_SYSTEM_SPECIFICATION.md)
- [מדריך תבנית עמודים](../PAGE_STRUCTURE_TEMPLATE.md)
- [מדריך עדכון עמודים](../PAGE_UPDATE_GUIDE.md)

---

**עדכון אחרון:** מרץ 2025  
**גרסה:** 1.0  
**מפתח:** TikTrack Development Team

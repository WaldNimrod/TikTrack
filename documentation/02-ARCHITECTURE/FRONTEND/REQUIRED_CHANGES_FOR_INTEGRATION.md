# Required Changes for PageStateManager Integration
# שינויים נדרשים לאינטגרציה עם PageStateManager

**תאריך:** 27 ינואר 2025  
**מטרה:** תיעוד השינויים הנדרשים במערכות הקיימות לאינטגרציה מלאה עם PageStateManager

---

## 📋 סקירה כללית

כדי להשלים את האינטגרציה עם PageStateManager, יש לעדכן 3 מערכות עיקריות:

1. **header-system.js** - מערכת הפילטרים הראשית
2. **ui-utils.js** - מערכת ניהול סקשנים
3. **entity-details-renderer.js** - מערכת פילטרים פנימיים לפי סוג ישות

כל המערכות צריכות להשתמש ב-PageStateManager במקום localStorage ישיר.

---

## 🔧 1. שינויים ב-header-system.js

### מיקום נוכחי:
**קובץ:** `trading-ui/scripts/header-system.js`  
**שורות:** 1221-1236

### קוד נוכחי:
```javascript
saveFilters() {
    localStorage.setItem('headerFilters', JSON.stringify(this.currentFilters));
},

loadFilters() {
    const saved = localStorage.getItem('headerFilters');
    if (saved) {
        try {
            this.currentFilters = { ...this.currentFilters, ...JSON.parse(saved) };
            window.Logger.info('🔧 Loaded saved filters:', this.currentFilters, { page: "header-system" });
        } catch (e) {
            window.Logger.info('⚠️ Error loading saved filters:', e, { page: "header-system" });
        }
    }
},
```

### קוד מוצע (להחלפה):
```javascript
saveFilters() {
    // שמירה דרך PageStateManager
    if (window.PageStateManager && window.PageStateManager.initialized) {
        const pageName = window.getCurrentPageName ? window.getCurrentPageName() : 'default';
        window.PageStateManager.saveFilters(pageName, this.currentFilters).catch(err => {
            if (window.Logger) {
                window.Logger.error('Failed to save filters via PageStateManager', err, { page: "header-system" });
            }
        });
    } else {
        // Fallback רק אם PageStateManager לא זמין
        if (window.Logger) {
            window.Logger.warn('PageStateManager not available, using localStorage fallback', { page: "header-system" });
        }
        localStorage.setItem('headerFilters', JSON.stringify(this.currentFilters));
    }
},

async loadFilters() {
    // טעינה דרך PageStateManager
    if (window.PageStateManager && window.PageStateManager.initialized) {
        const pageName = window.getCurrentPageName ? window.getCurrentPageName() : 'default';
        const pageState = await window.PageStateManager.loadPageState(pageName);
        if (pageState && pageState.filters) {
            this.currentFilters = { ...this.currentFilters, ...pageState.filters };
            window.Logger.info('🔧 Loaded saved filters via PageStateManager:', this.currentFilters, { page: "header-system" });
            return;
        }
    }
    
    // Fallback ל-localStorage רק אם PageStateManager לא זמין או אין מצב שמור
    const saved = localStorage.getItem('headerFilters');
    if (saved) {
        try {
            this.currentFilters = { ...this.currentFilters, ...JSON.parse(saved) };
            window.Logger.info('🔧 Loaded saved filters from localStorage:', this.currentFilters, { page: "header-system" });
        } catch (e) {
            window.Logger.info('⚠️ Error loading saved filters:', e, { page: "header-system" });
        }
    }
},
```

### נקודות חשובות:
- הפונקציה `loadFilters` צריכה להיות `async`
- יש לוודא ש-PageStateManager מאותחל לפני השימוש
- Fallback ל-localStorage רק אם PageStateManager לא זמין

---

## 🔧 2. שינויים ב-ui-utils.js

### מיקום נוכחי:
**קובץ:** `trading-ui/scripts/modules/ui-basic.js` או `trading-ui/scripts/ui-utils.js`  
**פונקציות:** `toggleSection`, `restoreAllSectionStates`, `loadSectionStates`

### קוד נוכחי (דוגמה מ-toggleSection):
```javascript
const storageKey = `${pageName}_${sectionId}_SectionHidden`;
localStorage.setItem(storageKey, isHidden.toString());
```

### קוד מוצע (להחלפה):
```javascript
// שמירת מצב סקשן דרך PageStateManager
if (window.PageStateManager && window.PageStateManager.initialized) {
    const pageName = window.getCurrentPageName ? window.getCurrentPageName() : 'default';
    const currentState = await window.PageStateManager.loadPageState(pageName) || {};
    const sections = currentState.sections || {};
    sections[sectionId] = isHidden;
    
    window.PageStateManager.saveSections(pageName, sections).catch(err => {
        if (window.Logger) {
            window.Logger.error(`Failed to save section state for ${sectionId}`, err, { page: "ui-utils" });
        }
        // Fallback ל-localStorage
        localStorage.setItem(storageKey, isHidden.toString());
    });
} else {
    // Fallback ל-localStorage רק אם PageStateManager לא זמין
    localStorage.setItem(storageKey, isHidden.toString());
}
```

### פונקציות שצריכות עדכון:

#### 2.1 toggleSection
**שורה:** ~989  
**שינוי:** הוספת שמירה דרך PageStateManager

#### 2.2 restoreAllSectionStates
**שורה:** ~1022  
**שינוי:** טעינת מצב דרך PageStateManager

#### 2.3 loadSectionStates
**שורה:** ~1662  
**שינוי:** טעינת מצב דרך PageStateManager

### קוד מוצע ל-restoreAllSectionStates:
```javascript
window.restoreAllSectionStates = async function () {
    const pageName = window.getCurrentPageName ? window.getCurrentPageName() : 'default';
    
    // טעינת מצב דרך PageStateManager
    if (window.PageStateManager && window.PageStateManager.initialized) {
        const pageState = await window.PageStateManager.loadPageState(pageName);
        if (pageState && pageState.sections) {
            // שחזור מצב סקשנים
            Object.keys(pageState.sections).forEach(sectionId => {
                const isHidden = pageState.sections[sectionId];
                const section = document.getElementById(sectionId) || 
                               document.querySelector(`[data-section="${sectionId}"]`);
                if (section) {
                    const sectionBody = section.querySelector('.section-body, .section-content');
                    if (sectionBody) {
                        sectionBody.style.display = isHidden ? 'none' : 'block';
                        section.classList.toggle('collapsed', isHidden);
                    }
                }
            });
            return;
        }
    }
    
    // Fallback ל-localStorage
    // ... קוד קיים ...
};
```

---

## 🔧 3. שינויים ב-entity-details-renderer.js

### מיקום נוכחי:
**קובץ:** `trading-ui/scripts/entity-details-renderer.js`  
**פונקציות:** פילטרים פנימיים לפי סוג ישות

### שינויים נדרשים:

#### 3.1 שמירת מצב פילטר ישות
```javascript
// במקום localStorage ישיר
async function saveEntityFilterState(pageName, entityType, selectedValue) {
    if (window.PageStateManager && window.PageStateManager.initialized) {
        const currentState = await window.PageStateManager.loadPageState(pageName) || {};
        const entityFilters = currentState.entityFilters || {};
        entityFilters[entityType] = selectedValue;
        
        await window.PageStateManager.saveEntityFilters(pageName, entityFilters);
    } else {
        // Fallback ל-localStorage
        const key = `entityFilter_${pageName}_${entityType}`;
        localStorage.setItem(key, selectedValue);
    }
}
```

#### 3.2 טעינת מצב פילטר ישות
```javascript
// במקום localStorage ישיר
async function loadEntityFilterState(pageName, entityType) {
    if (window.PageStateManager && window.PageStateManager.initialized) {
        const pageState = await window.PageStateManager.loadPageState(pageName);
        if (pageState && pageState.entityFilters && pageState.entityFilters[entityType]) {
            return pageState.entityFilters[entityType];
        }
    }
    
    // Fallback ל-localStorage
    const key = `entityFilter_${pageName}_${entityType}`;
    return localStorage.getItem(key);
}
```

---

## 📝 4. עדכון אתחול עמודים

### הוספה לכל עמוד:

בסוף טעינת הנתונים של כל עמוד, להוסיף:

```javascript
// שחזור מצב מלא של העמוד
async function restorePageState() {
    const pageName = window.getCurrentPageName ? window.getCurrentPageName() : 'default';
    
    if (!window.PageStateManager) {
        return;
    }
    
    // אתחול PageStateManager אם לא מאותחל
    if (!window.PageStateManager.initialized) {
        await window.PageStateManager.initialize();
    }
    
    const pageState = await window.PageStateManager.loadPageState(pageName);
    if (!pageState) {
        return;
    }
    
    // שחזור פילטרים
    if (pageState.filters && window.filterSystem) {
        window.filterSystem.currentFilters = { ...window.filterSystem.currentFilters, ...pageState.filters };
        window.filterSystem.applyAllFilters();
    }
    
    // שחזור סידור
    if (pageState.sort && pageState.sort.columnIndex >= 0) {
        const tableType = pageName; // או שם הטבלה הספציפי
        if (window.UnifiedTableSystem && window.UnifiedTableSystem.registry.isRegistered(tableType)) {
            await window.UnifiedTableSystem.sorter.sort(tableType, pageState.sort.columnIndex);
        }
    }
    
    // שחזור סקשנים
    if (pageState.sections && typeof window.restoreAllSectionStates === 'function') {
        await window.restoreAllSectionStates();
    }
    
    // שחזור פילטרים פנימיים
    if (pageState.entityFilters) {
        Object.keys(pageState.entityFilters).forEach(entityType => {
            const selectedValue = pageState.entityFilters[entityType];
            // הפעלת פילטר לפי סוג ישות
            // ... קוד ספציפי לכל עמוד ...
        });
    }
}
```

### קריאה ל-restorePageState:

בכל עמוד, אחרי טעינת הנתונים:

```javascript
async function load[PageName]Data() {
    // ... טעינת נתונים ...
    
    // עדכון הטבלה
    update[PageName]Table(data);
    
    // Register table with UnifiedTableSystem
    if (typeof window.register[PageName]Tables === 'function') {
        window.register[PageName]Tables();
    }
    
    // שחזור מצב מלא של העמוד
    await restorePageState();
}
```

---

## 🔄 5. שמירת מצב אוטומטית

### הוספת event listeners לשמירה אוטומטית:

```javascript
// שמירת מצב בעת שינוי פילטרים
if (window.filterSystem) {
    const originalSaveFilters = window.filterSystem.saveFilters;
    window.filterSystem.saveFilters = function() {
        originalSaveFilters.call(this);
        
        // שמירה דרך PageStateManager
        if (window.PageStateManager && window.PageStateManager.initialized) {
            const pageName = window.getCurrentPageName ? window.getCurrentPageName() : 'default';
            window.PageStateManager.saveFilters(pageName, this.currentFilters);
        }
    };
}

// שמירת מצב בעת שינוי סידור (כולל שרשרת קריטריונים)
const chain = window.getDefaultSortChain('trades');
await window.saveSortState('trades', chain[0].columnIndex, chain[0].direction, { chain });
```

---

## ✅ 6. סדר ביצוע מומלץ

1. **עדכון header-system.js** - שמירה/טעינת פילטרים דרך PageStateManager
2. **עדכון ui-utils.js** - שמירה/טעינת מצב סקשנים דרך PageStateManager
3. **עדכון entity-details-renderer.js** - שמירה/טעינת פילטרים פנימיים דרך PageStateManager
4. **הוספת restorePageState** - לכל עמוד
5. **הוספת event listeners** - לשמירה אוטומטית
6. **בדיקות** - וידוא שכל המערכות עובדות יחד

---

## 📚 קבצים קשורים

- `trading-ui/scripts/page-state-manager.js` - מנהל מצב מרכזי
- `trading-ui/scripts/header-system.js` - מערכת פילטרים ראשית
- `trading-ui/scripts/ui-utils.js` - מערכת ניהול סקשנים
- `trading-ui/scripts/entity-details-renderer.js` - מערכת פילטרים פנימיים
- `trading-ui/scripts/unified-cache-manager.js` - מערכת מטמון מאוחדת

---

## ⚠️ הערות חשובות

1. **Fallback ל-localStorage** - כל השינויים צריכים לכלול fallback ל-localStorage אם PageStateManager לא זמין
2. **אסינכרוניות** - כל הפונקציות שטוענות/שומרות מצב צריכות להיות async
3. **אתחול** - יש לוודא ש-PageStateManager מאותחל לפני השימוש
4. **תאימות לאחור** - יש לשמור על תאימות עם הקוד הקיים

---

**מחבר:** TikTrack Development Team  
**תאריך:** 27 ינואר 2025


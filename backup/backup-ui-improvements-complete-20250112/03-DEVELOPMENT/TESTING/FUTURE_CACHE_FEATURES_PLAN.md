# תוכנית תכונות מטמון עתידיות - Future Cache Features Plan
# =====================================================================

**תאריך:** 11 אוקטובר 2025  
**שלב:** 2 - עתידי (לא מיושם כרגע)  
**סטטוס:** 📋 תכנון - ממתין ליישום  
**תלות:** דורש השלמת שלב 1 (רמות ניקוי בסיסיות)

---

## 🎯 **מטרות שלב 2**

### **בעיות שנותרו אחרי שלב 1:**
1. **ניקוי ידני** - המשתמש צריך לבחור רמה כל פעם
2. **אין אוטומציה** - צריך לזכור לנקות לפני CRUD
3. **Service Registration** - שירותים חדשים דורשים עדכון קוד
4. **ניקוי ממוקד** - לפעמים צריך רק קטגוריה אחת

### **פתרונות מוצעים:**
1. **CacheRegistry** - רישום אוטומטי של services
2. **clearCacheBeforeCRUD** - ניקוי אוטומטי לפני פעולות
3. **clearCacheByCategory** - ניקוי ממוקד לפי סוג
4. **Service-by-Service UI** - ניהול פרטני

---

## 🔧 **תכונה 1: CacheRegistry**

### **מטרה:**
רישום מרכזי של כל Service Caches למניעת hard-coded lists.

### **ארכיטקטורה:**
```javascript
// cache-module.js
window.CacheRegistry = {
    caches: new Map(),
    
    register(name, cacheObject, metadata = {}) {
        this.caches.set(name, {
            cache: cacheObject,
            type: metadata.type || 'map',
            ttl: metadata.ttl || null,
            critical: metadata.critical || false,
            category: metadata.category || 'general'
        });
        console.log(`📝 Cache registered: ${name}`);
    },
    
    unregister(name) {
        this.caches.delete(name);
    },
    
    async clearAll(options = {}) {
        const results = { cleared: 0, failed: 0 };
        for (const [name, { cache, type }] of this.caches) {
            try {
                if (type === 'map' && cache.clear) {
                    cache.clear();
                    results.cleared++;
                }
            } catch (error) {
                results.failed++;
            }
        }
        return results;
    },
    
    getStats() {
        const stats = {};
        for (const [name, { cache, type }] of this.caches) {
            stats[name] = {
                entries: type === 'map' ? cache.size : 'unknown',
                type: type
            };
        }
        return stats;
    },
    
    list() {
        return Array.from(this.caches.keys());
    }
};
```

### **שימוש:**
```javascript
// בכל service (entity-details-api.js):
class EntityDetailsAPI {
    constructor() {
        this.cache = new Map();
        
        // Auto-register
        if (window.CacheRegistry) {
            window.CacheRegistry.register('EntityDetailsAPI', this.cache, {
                type: 'map',
                ttl: 300000,
                category: 'data'
            });
        }
    }
}
```

### **יתרונות:**
- ✅ שירותים חדשים נרשמים אוטומטית
- ✅ אין צורך לעדכן clearServiceCaches()
- ✅ Dashboard אוטומטי של כל ה-caches
- ✅ סטטיסטיקות לכל service

### **UI ב-cache-test.html (מושבת):**
```html
<div class="future-feature disabled">
    <h5>📊 CacheRegistry Dashboard</h5>
    <p class="text-muted">
        <i class="fas fa-clock"></i> תכונה עתידית - שלב 2
    </p>
    <button class="btn btn-secondary" disabled>
        <i class="fas fa-list"></i> הצג Registered Caches
    </button>
    <a href="/documentation/03-DEVELOPMENT/TESTING/FUTURE_CACHE_FEATURES_PLAN.md" 
       class="btn btn-link btn-sm">
        📖 קרא על התכנית
    </a>
</div>
```

---

## 🔧 **תכונה 2: clearCacheBeforeCRUD**

### **מטרה:**
אוטומציה של ניקוי מטמון לפני פעולות CRUD.

### **ארכיטקטורה:**
```javascript
// cache-module.js
window.clearCacheBeforeCRUD = async function(entity, action, options = {}) {
    // מיפוי: action → level
    const actionLevelMap = {
        'add': 'light',      // רק memory + services
        'edit': 'medium',    // + UnifiedCacheManager
        'delete': 'full',    // + orphans
        'cancel': 'medium'   // כמו edit
    };
    
    const level = options.level || actionLevelMap[action] || 'medium';
    
    console.log(`🧹 Clearing cache before ${action} on ${entity} (level: ${level})`);
    
    return await clearAllCache({ 
        level,
        skipConfirmation: true,  // אוטומטי - ללא אישור
        verbose: false
    });
};
```

### **שימוש:**
```javascript
// alerts.js
async function saveNewAlert() {
    // ניקוי אוטומטי
    await window.clearCacheBeforeCRUD('alerts', 'add');
    
    // שמירת התראה...
}

async function updateAlert() {
    await window.clearCacheBeforeCRUD('alerts', 'edit');
    // עדכון התראה...
}

async function deleteAlert() {
    await window.clearCacheBeforeCRUD('alerts', 'delete');
    // מחיקת התראה...
}
```

### **יתרונות:**
- ✅ אוטומציה מלאה - המפתח לא צריך לזכור
- ✅ אופטימיזציה - add רק memory, delete מלא
- ✅ עקביות - כל CRUD עובד אותו דבר
- ✅ פחות קוד - קריאה אחת במקום הרבה

### **UI ב-cache-test.html (מושבת):**
```html
<div class="future-feature disabled">
    <h5>🤖 clearCacheBeforeCRUD - אוטומציה</h5>
    <p class="text-muted">
        <i class="fas fa-clock"></i> תכונה עתידית - שלב 2
    </p>
    <div class="action-demo">
        <span class="badge bg-success">add → light</span>
        <span class="badge bg-primary">edit → medium</span>
        <span class="badge bg-warning">delete → full</span>
    </div>
    <button class="btn btn-secondary" disabled>
        <i class="fas fa-robot"></i> בדוק אוטומציה
    </button>
</div>
```

---

## 🔧 **תכונה 3: clearCacheByCategory (משופר)**

### **מטרה:**
ניקוי ממוקד לפי קטגוריה, כולל orphan keys.

### **ארכיטקטורה:**
```javascript
// cache-module.js
window.clearCacheByCategory = async function(category, options = {}) {
    const categoryMappings = {
        'ui-state': {
            unified: ['ui-state', 'filter-state'],
            orphans: ['cashFlowsSectionState', 'executionsTopSectionCollapsed'],
            dynamic: [/^section-visibility-/, /^top-section-collapsed-/],
            services: []
        },
        'preferences': {
            unified: ['user-preferences', 'color-scheme'],
            orphans: ['colorScheme', 'customColorScheme', 'headerFilters', 'consoleSettings'],
            dynamic: [],
            services: []
        },
        'auth': {
            unified: [],
            orphans: ['authToken', 'currentUser'],
            dynamic: [],
            services: []
        },
        'services': {
            unified: [],
            orphans: [],
            dynamic: [],
            services: ['EntityDetailsAPI', 'ExternalDataService', 'YahooFinanceService', 
                      'TradesAdapter', 'LinterAdapter', 'PerformanceAdapter']
        },
        'data': {
            unified: ['trade-data', 'market-data', 'dashboard-data'],
            orphans: [],
            dynamic: [/^sortState_/],
            services: ['EntityDetailsAPI', 'ExternalDataService']
        }
    };
    
    // ניקוי לפי קטגוריה
    const mapping = categoryMappings[category];
    // נקה unified keys
    // נקה orphans
    // נקה dynamic
    // נקה services
};
```

### **יתרונות:**
- ✅ ממוקד - רק מה שצריך
- ✅ בטוח יותר - לא נוגע בכל השאר
- ✅ מהיר יותר - פחות לנקות
- ✅ כולל orphans - בניגוד לגרסה הנוכחית

### **UI ב-cache-test.html (מושבת):**
```html
<div class="future-feature disabled">
    <h5>📂 clearCacheByCategory - ניקוי ממוקד</h5>
    <p class="text-muted">
        <i class="fas fa-clock"></i> תכונה עתידית - שלב 2
    </p>
    <div class="btn-group" role="group">
        <button class="btn btn-outline-primary btn-sm" disabled>ui-state</button>
        <button class="btn btn-outline-info btn-sm" disabled>preferences</button>
        <button class="btn btn-outline-warning btn-sm" disabled>auth</button>
        <button class="btn btn-outline-success btn-sm" disabled>services</button>
        <button class="btn btn-outline-secondary btn-sm" disabled>data</button>
    </div>
</div>
```

---

## 🔧 **תכונה 4: Service-by-Service Management**

### **מטרה:**
ניקוי ידני של service בודד (לdebug ממוקד).

### **UI ב-cache-test.html (מושבת):**
```html
<div class="future-feature disabled">
    <h5>🎛️ Service-by-Service Management</h5>
    <p class="text-muted">
        <i class="fas fa-clock"></i> תכונה עתידית - שלב 2
    </p>
    <table class="table table-sm">
        <thead>
            <tr>
                <th>Service</th>
                <th>Entries</th>
                <th>TTL</th>
                <th>פעולות</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>EntityDetailsAPI</td>
                <td><span class="badge bg-info">--</span></td>
                <td>5 min</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" disabled>
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
            <!-- ... more services -->
        </tbody>
    </table>
</div>
```

---

## 📅 **Timeline משוער**

| תכונה | מורכבות | זמן פיתוח | עדיפות |
|-------|---------|-----------|---------|
| CacheRegistry | בינונית | 2-3 שעות | גבוהה |
| clearCacheBeforeCRUD | נמוכה | 1-2 שעות | גבוהה |
| clearCacheByCategory | בינונית | 2-3 שעות | בינונית |
| Service-by-Service | נמוכה | 1-2 שעות | נמוכה |

**סה"כ:** 6-10 שעות פיתוח

---

## ✅ **תנאים להפעלת שלב 2**

1. ✅ שלב 1 הושלם ונבדק
2. ✅ clearAllCache() עם 4 רמות פועל מושלם
3. ✅ כיסוי 100% אומת
4. ✅ צוות הפיתוח מכיר את המערכת
5. ⏳ צורך מוכח (האם באמת צריך אוטומציה?)

---

## 🎨 **ממשק בשלב 1 (מושבת)**

### **סקציה בcache-test.html:**
```html
<div class="content-section future-features-section">
    <div class="section-header">
        <h2>🔮 כלים עתידיים - שלב 2</h2>
        <div class="alert alert-info">
            <i class="fas fa-info-circle"></i>
            <strong>התכונות הבאות מתוכננות ליישום בשלב 2</strong>
            <br>
            לפרטים מלאים: 
            <a href="/documentation/03-DEVELOPMENT/TESTING/FUTURE_CACHE_FEATURES_PLAN.md" target="_blank">
                📖 תוכנית תכונות עתידיות
            </a>
        </div>
    </div>
    
    <div class="section-body">
        <!-- 4 כרטיסים מושבתים -->
        <div class="row">
            <div class="col-md-6">
                <div class="future-feature-card disabled">
                    <div class="feature-icon">📊</div>
                    <h5>CacheRegistry Dashboard</h5>
                    <p>רישום ו management מרכזי של כל ה-service caches</p>
                    <span class="badge bg-secondary">שלב 2</span>
                    <span class="badge bg-info">2-3 שעות</span>
                    <button class="btn btn-outline-secondary" disabled>
                        הצג Dashboard
                    </button>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="future-feature-card disabled">
                    <div class="feature-icon">🤖</div>
                    <h5>clearCacheBeforeCRUD - אוטומציה</h5>
                    <p>ניקוי אוטומטי לפני פעולות CRUD</p>
                    <span class="badge bg-secondary">שלב 2</span>
                    <span class="badge bg-info">1-2 שעות</span>
                    <button class="btn btn-outline-secondary" disabled>
                        בדוק אוטומציה
                    </button>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="future-feature-card disabled">
                    <div class="feature-icon">📂</div>
                    <h5>clearCacheByCategory משופר</h5>
                    <p>ניקוי ממוקד לפי קטגוריה כולל orphans</p>
                    <span class="badge bg-secondary">שלב 2</span>
                    <span class="badge bg-info">2-3 שעות</span>
                    <button class="btn btn-outline-secondary" disabled>
                        ניקוי לפי קטגוריה
                    </button>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="future-feature-card disabled">
                    <div class="feature-icon">🎛️</div>
                    <h5>Service-by-Service UI</h5>
                    <p>ניהול וניקוי פרטני לכל service</p>
                    <span class="badge bg-secondary">שלב 2</span>
                    <span class="badge bg-info">1-2 שעות</span>
                    <button class="btn btn-outline-secondary" disabled>
                        נהל Services
                    </button>
                </div>
            </div>
        </div>
        
        <!-- טבלת תכונות -->
        <table class="table table-striped mt-4">
            <thead>
                <tr>
                    <th>תכונה</th>
                    <th>מורכבות</th>
                    <th>זמן פיתוח</th>
                    <th>עדיפות</th>
                    <th>תלויות</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>CacheRegistry</td>
                    <td><span class="badge bg-warning">בינונית</span></td>
                    <td>2-3 שעות</td>
                    <td><span class="badge bg-danger">גבוהה</span></td>
                    <td>שלב 1 ✅</td>
                </tr>
                <tr>
                    <td>clearCacheBeforeCRUD</td>
                    <td><span class="badge bg-success">נמוכה</span></td>
                    <td>1-2 שעות</td>
                    <td><span class="badge bg-danger">גבוהה</span></td>
                    <td>שלב 1 ✅</td>
                </tr>
                <tr>
                    <td>clearCacheByCategory</td>
                    <td><span class="badge bg-warning">בינונית</span></td>
                    <td>2-3 שעות</td>
                    <td><span class="badge bg-warning">בינונית</span></td>
                    <td>CacheRegistry</td>
                </tr>
                <tr>
                    <td>Service-by-Service</td>
                    <td><span class="badge bg-success">נמוכה</span></td>
                    <td>1-2 שעות</td>
                    <td><span class="badge bg-success">נמוכה</span></td>
                    <td>CacheRegistry</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
```

---

## 🎯 **ROI - החזר השקעה**

### **שלב 1: רמות ניקוי (מיידי)**
- **זמן פיתוח:** 4-6 שעות
- **תועלת:** כיסוי 100%, מניעת באגים
- **ROI:** מיידי - חיסכון של שעות debug

### **שלב 2: תכונות מתקדמות (עתידי)**
- **זמן פיתוח:** 6-10 שעות
- **תועלת:** אוטומציה, פחות טעויות
- **ROI:** תוך חודש - חיסכון בזמן פיתוח

---

## 📋 **החלטה: מתי ליישם שלב 2?**

**תנאים:**
1. ✅ שלב 1 פועל 2+ שבועות ללא בעיות
2. ✅ הצוות מכיר את המערכת
3. ⏳ זוהו 3+ מקרים שבהם clearCacheBeforeCRUD היה עוזר
4. ⏳ נוספו 2+ services חדשים (צורך ב-CacheRegistry)

**אם לא:** שלב 1 מספק! אין צורך לעבור לשלב 2.

---

**סטטוס:** 📋 **תכנון - ממתין לאישור ליישום**  
**תלות:** ✅ **שלב 1 צריך להיות מושלם**  
**עדכון:** 11.10.2025


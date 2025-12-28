# אפיון מערכת רמות ניקוי מטמון - Cache Clearing Levels Specification

# ==============================================================================

**תאריך:** 11 אוקטובר 2025  
**גרסה:** 1.0  
**סטטוס:** ✅ מוכן ליישום - שלב 1 מיידי  
**מטרה:** כיסוי 100% מלא של כל אלמנטי המטמון במערכת

---

## 🎯 **מטרות המערכת**

### **בעיה:**

- רק 11% מהמטמון מנוקה כיום
- 7-9 Service Caches לא מכוסים
- 15-20 Orphan Keys לא מכוסים
- **תוצאה:** נתונים ישנים, באגים בפיתוח, בזבוז זמן

### **פתרון:**

מערכת רמות ניקוי מדורגות המכסה **100% מהמטמון**:

- 4 רמות עוצמה (light → medium → full → nuclear)
- כיסוי מלא של כל המקורות
- בטיחות מדורגת (light בטוח, nuclear מסוכן)
- חלונות אישור עם מידע מפורט

---

## 📊 **מלאי מלא של כל אלמנטי המטמון**

### **קטגוריה A: UnifiedCacheManager (4 שכבות)**

| שכבה | סוג | מיקום | תוכן טיפוסי | גודל משוער |
|------|-----|--------|-------------|------------|
| **Memory** | JavaScript Map | `UnifiedCacheManager.layers.memory.cache` | נתוני עמוד זמניים | 0-50 entries |
| **localStorage** | Browser Storage | localStorage keys: `tiktrack_*` | העדפות, מצבי UI | 10-20 entries |
| **IndexedDB** | Browser DB | UnifiedCacheDB → unified-cache store | היסטוריית התראות, logs | 10-30 entries |
| **Backend** | JavaScript Map | `UnifiedCacheManager.layers.backend.cache` | Mock local (לא server) | 0-5 entries |

**סה"כ:** 30-105 entries

---

### **קטגוריה B: Service Caches (7-9 מקורות)**

| Service | סוג | מיקום | תוכן | TTL | גודל משוער |
|---------|-----|--------|------|-----|------------|
| **EntityDetailsAPI** | Map | `window.EntityDetailsAPI.cache` | פרטי entities | 5 min | 5-20 entries |
| **ExternalDataService** | Map | `window.ExternalDataService.cache` | נתוני Yahoo | 1 min | 10-50 entries |
| **YahooFinanceService** | Map × 2 | `window.YahooFinanceService.cache`<br>`window.YahooFinanceService.loadingPromises` | מחירי מניות<br>Promises בטעינה | 5 min | 20-100 entries<br>0-10 promises |
| **TradesAdapter** | Map | `window.TradesAdapter.cache` | נתוני charts | 30 sec | 5-20 entries |
| **LinterAdapter** | Map | `window.LinterAdapter.cache` | תוצאות linter | 5 min | 3-10 entries |
| **PerformanceAdapter** | Map | `window.PerformanceAdapter.cache` | נתוני ביצועים | 5 min | 3-10 entries |
| **CSS Management** | Set × 2 | `mergedDuplicates`<br>`removedDuplicates` | CSS duplicates | אינסוף | 10-50 entries |

**סה"כ:** 56-270 entries

---

### **קטגוריה C: Orphan Keys (15-20 keys)**

#### **C.1 State Management (2 keys):**

```javascript
'cashFlowsSectionState'           // מצב סקציה (open/closed)
'executionsTopSectionCollapsed'   // מצב כיווץ
```

#### **C.2 User Preferences (4 keys):**

```javascript
'colorScheme'          // 'light', 'dark', 'custom'
'customColorScheme'    // JSON של צבעים מותאמים
'headerFilters'        // מצב פילטרים בheader
'consoleSettings'      // הגדרות console
```

#### **C.3 Authentication (2 keys - קריטי!):**

```javascript
'authToken'      // ⚠️ טוקן אימות
'currentUser'    // ⚠️ נתוני משתמש
```

#### **C.4 Testing/Debug (4 keys):**

```javascript
'crud_test_results'        // תוצאות בדיקות CRUD
'linterLogs'              // logs של linter
'css-duplicates-results'  // תוצאות סריקת CSS
'serverMonitorSettings'   // הגדרות monitor (ישן)
```

#### **C.5 Dynamic Keys (patterns):**

```javascript
/^sortState_/              // e.g. sortState_trades, sortState_alerts
/^section-visibility-/     // e.g. section-visibility-alerts-section1
/^top-section-collapsed-/  // e.g. top-section-collapsed-trades
```

**משוער:** 5-10 keys דינמיים

**סה"כ קטגוריה C:** 17-26 keys

---

## 🎚️ **הגדרת 4 רמות ניקוי**

### **רמה 1: Light 🟢 (קל)**

**מתי להשתמש:**

- מבחנים מהירים
- בדיקות ביצועים
- איפוס memory בלבד

**מה מנוקה:**

1. ✅ UnifiedCacheManager: Memory layer
2. ✅ Service Caches: כל 7-9 המקורות
3. ✅ CSS Management: mergedDuplicates + removedDuplicates

**מה לא מנוקה:**

- ❌ localStorage (tiktrack_* ישארו)
- ❌ IndexedDB (ישאר)
- ❌ Backend layer (ישאר)
- ❌ Orphan keys (ישארו)

**כיסוי:** ~25% מהמטמון  
**זמן צפוי:** <100ms  
**בטיחות:** 🟢 גבוהה מאוד - לא נוגע ב-persistent data  
**הפיך:** ✅ כן - נתונים ב-localStorage/IndexedDB נשארים

---

### **רמה 2: Medium 🔵 (בינוני)**

**מתי להשתמש:**

- פיתוח יומיומי
- איפוס לפני בדיקה
- **ברירת מחדל לכפתור בתפריט** 🧹

**מה מנוקה:**

1. ✅ כל Light (Memory + Services + CSS)
2. ✅ UnifiedCacheManager: localStorage layer (tiktrack_*)
3. ✅ UnifiedCacheManager: IndexedDB layer (unified-cache store)
4. ✅ UnifiedCacheManager: Backend layer

**מה לא מנוקה:**

- ❌ Orphan keys (ישארו)
- ❌ localStorage ללא prefix tiktrack_* (ישארו)
- ❌ IndexedDB database עצמו (רק store מנוקה)

**כיסוי:** ~60% מהמטמון  
**זמן צפוי:** 100-300ms  
**בטיחות:** 🔵 בינונית - מנקה persistent אבל לא orphans  
**הפיך:** ⚠️ חלקי - נתונים ב-UnifiedCacheManager אבדו

---

### **רמה 3: Full 🟠 (מלא)**

**מתי להשתמש:**

- לפני commits/push
- לפני releases
- פתרון באגים מסתוריים
- ניקוי מטמון מקיף

**מה מנוקה:**

1. ✅ כל Medium
2. ✅ כל 15-20 Orphan Keys (רשימה מפורשת)
3. ✅ Dynamic Keys (sortState_*, section-*, top-section-*)

**מה לא מנוקה:**

- ❌ localStorage ללא prefix/pattern (keys לא מזוהים)
- ❌ IndexedDB databases אחרים (אם קיימים)
- ❌ IndexedDB database עצמו (רק stores)

**כיסוי:** 🎯 **100% מהמטמון המוכר**  
**זמן צפוי:** 300-500ms  
**בטיחות:** 🟠 נמוכה - מנקה **הכל** כולל auth!  
**הפיך:** ❌ לא - כל הנתונים אבדו (כולל authToken!)

**⚠️ אזהרה:** מנקה authToken ו-currentUser - ידרוש login מחדש!

---

### **רמה 4: Nuclear ☢️ (גרעיני)**

**מתי להשתמש:**

- 🔴 **חירום בלבד!**
- reset מוחלט של המערכת
- פתרון בעיות חמורות
- לפני הדגמות/demos (מצב "נקי מכל")

**מה מנוקה:**

1. ✅ כל Full
2. ✅ **ALL** localStorage - כולל keys ללא prefix
3. ✅ **DELETE** entire UnifiedCacheDB database
4. ✅ sessionStorage (אם קיים)
5. ✅ כל cookies של tiktrack (אם יש)

**כיסוי:** ☢️ **150%** - גם מעבר למה שהמערכת יצרה!  
**זמן צפוי:** 500-1000ms  
**בטיחות:** 🔴 **אפס** - מוחק **הכל** ללא חנינה!  
**הפיך:** ❌❌❌ **בלתי הפיך לחלוטין**

**⚠️⚠️⚠️ אזהרות:**

- מוחק גם נתונים של אתרים אחרים ב-localhost!
- מוחק את כל ה-database (לא רק stores)!
- דורש refresh מלא של העמוד אחרי!
- ⚠️ **לא לשימוש שגרתי!**

---

## 📋 **מטריצת השוואה מפורטת**

| מקור נתונים | Light | Medium | Full | Nuclear | הערות |
|-------------|-------|--------|------|---------|--------|
| **UnifiedCacheManager** |
| → Memory Layer | ✅ | ✅ | ✅ | ✅ | Map.clear() |
| → localStorage Layer | ❌ | ✅ | ✅ | ✅ | רק tiktrack_* |
| → IndexedDB Layer | ❌ | ✅ | ✅ | ✅ | רק unified-cache store |
| → Backend Layer | ❌ | ✅ | ✅ | ✅ | Map.clear() |
| **Service Caches** |
| → EntityDetailsAPI | ✅ | ✅ | ✅ | ✅ | Map.clear() |
| → ExternalDataService | ✅ | ✅ | ✅ | ✅ | Map.clear() |
| → YahooFinanceService | ✅ | ✅ | ✅ | ✅ | 2 Maps |
| → Chart Adapters (×3) | ✅ | ✅ | ✅ | ✅ | Map.clear() |
| → CSS Management | ✅ | ✅ | ✅ | ✅ | 2 Sets |
| **Orphan Keys** |
| → State (2) | ❌ | ❌ | ✅ | ✅ | removeItem() |
| → Preferences (4) | ❌ | ❌ | ✅ | ✅ | removeItem() |
| → Auth (2) | ❌ | ❌ | ✅ | ✅ | ⚠️ קריטי |
| → Testing (4) | ❌ | ❌ | ✅ | ✅ | removeItem() |
| → Dynamic (5-10) | ❌ | ❌ | ✅ | ✅ | regex patterns |
| **Extra** |
| → All localStorage | ❌ | ❌ | ❌ | ✅ | localStorage.clear() |
| → Delete IndexedDB | ❌ | ❌ | ❌ | ✅ | deleteDatabase() |
| **כיסוי משוער** | **25%** | **60%** | **100%** | **150%** |
| **Items נוקים** | 60-280 | 90-385 | 107-411 | ALL |
| **זמן ביצוע** | <100ms | 100-300ms | 300-500ms | 500-1000ms |

---

## 🔍 **פירוט מדויק לכל רמה**

### **Light - ניקוי קל 🟢**

```javascript
await clearAllCache({ level: 'light' })
```

**שלבי הניקוי:**

**שלב 1: Memory Layer (UnifiedCacheManager)**

```javascript
await window.UnifiedCacheManager.layers.memory.clear();
// Result: Map.clear() → 0 entries
```

**שלב 2: Service Caches (7-9 services)**

```javascript
// EntityDetailsAPI
window.EntityDetailsAPI?.cache?.clear();  // Map.clear()

// ExternalDataService  
window.ExternalDataService?.cache?.clear();

// YahooFinanceService
window.YahooFinanceService?.cache?.clear();
window.YahooFinanceService?.loadingPromises?.clear();

// Chart Adapters
window.TradesAdapter?.cache?.clear();
window.LinterAdapter?.cache?.clear();
window.PerformanceAdapter?.cache?.clear();

// CSS Management
mergedDuplicates?.clear();  // Set.clear()
removedDuplicates?.clear();
```

**שלב 3: דוח**

```javascript
{
    level: 'light',
    cleared: {
        memory: 5 entries,
        services: {
            EntityDetailsAPI: 12 entries,
            ExternalDataService: 8 entries,
            YahooFinanceService: 25 entries (cache + promises),
            TradesAdapter: 3 entries,
            LinterAdapter: 2 entries,
            PerformanceAdapter: 2 entries,
            CSSManagement: 15 entries
        }
    },
    total: 72 entries,
    duration: 85ms
}
```

**תרחישי שימוש:**

- ✅ מבחן ביצועים מהיר
- ✅ איפוס memory לפני בדיקה
- ✅ ניקוי service caches שנתקעו
- ❌ לא מתאים: כשיש נתונים ישנים ב-localStorage

---

### **Medium - ניקוי בינוני 🔵**

```javascript
await clearAllCache({ level: 'medium' })
// או:
await clearAllCache()  // ברירת מחדל
```

**שלבי הניקוי:**

**שלב 1-2:** כל Light (Memory + Services)

**שלב 3: localStorage Layer (UnifiedCacheManager)**

```javascript
await window.UnifiedCacheManager.layers.localStorage.clear();
// מנקה רק: tiktrack_user-preferences, tiktrack_ui-state, etc.
// לא מנקה: colorScheme, authToken (orphans!)
```

**שלב 4: IndexedDB Layer (UnifiedCacheManager)**

```javascript
await window.UnifiedCacheManager.layers.indexedDB.clear();
// store.clear() - מנקה את unified-cache store
// לא מוחק את ה-database עצמו
```

**שלב 5: Backend Layer (UnifiedCacheManager)**

```javascript
await window.UnifiedCacheManager.layers.backend.clear();
// Map.clear() - mock local
```

**שלב 6: דוח**

```javascript
{
    level: 'medium',
    cleared: {
        light: 72 entries,           // מLight
        localStorage: 14 entries,     // tiktrack_*
        indexedDB: 12 entries,        // unified-cache store
        backend: 0 entries
    },
    notCleared: {
        orphanKeys: 17 keys,          // ⚠️ ישארו!
        nonPrefixLS: 'unknown'
    },
    total: 98 entries,
    duration: 245ms
}
```

**תרחישי שימוש:**

- ✅ **פיתוח יומיומי** (מומלץ!)
- ✅ איפוס לפני בדיקה
- ✅ כפתור 🧹 בתפריט הראשי
- ⚠️ זהירות: orphans יכולים להישאר ולגרום לבאגים

---

### **Full - ניקוי מלא 🟠**

```javascript
await clearAllCache({ level: 'full' })
```

**שלבי הניקוי:**

**שלב 1-5:** כל Medium (Memory + Services + UnifiedCM)

**שלב 6: Orphan Keys - State (2)**

```javascript
localStorage.removeItem('cashFlowsSectionState');
localStorage.removeItem('executionsTopSectionCollapsed');
```

**שלב 7: Orphan Keys - Preferences (4)**

```javascript
localStorage.removeItem('colorScheme');
localStorage.removeItem('customColorScheme');
localStorage.removeItem('headerFilters');
localStorage.removeItem('consoleSettings');
```

**שלב 8: Orphan Keys - Auth (2)**

```javascript
localStorage.removeItem('authToken');         // ⚠️
localStorage.removeItem('currentUser');       // ⚠️
```

**שלב 9: Orphan Keys - Testing (4)**

```javascript
localStorage.removeItem('crud_test_results');
localStorage.removeItem('linterLogs');
localStorage.removeItem('css-duplicates-results');
localStorage.removeItem('serverMonitorSettings');
```

**שלב 10: Dynamic Keys (5-10)**

```javascript
Object.keys(localStorage).forEach(key => {
    if (/^sortState_/.test(key)) localStorage.removeItem(key);
    if (/^section-visibility-/.test(key)) localStorage.removeItem(key);
    if (/^top-section-collapsed-/.test(key)) localStorage.removeItem(key);
});
```

**שלב 11: דוח**

```javascript
{
    level: 'full',
    cleared: {
        medium: 98 entries,
        orphans: {
            state: 2,
            preferences: 4,
            auth: 2,
            testing: 4,
            dynamic: 7
        }
    },
    total: 117 entries,
    duration: 412ms,
    coverage: '100%'
}
```

**תרחישי שימוש:**

- ✅ לפני commit/push
- ✅ לפני release
- ✅ פתרון באגים מסתוריים
- ✅ reset מלא של המערכת
- ⚠️ **דורש login מחדש** (authToken נמחק!)

---

### **Nuclear - ניקוי גרעיני ☢️**

```javascript
await clearAllCache({ level: 'nuclear' })
```

**⚠️⚠️⚠️ אזהרה קריטית: פעולה הרסנית!**

**שלבי הניקוי:**

**שלב 1-10:** כל Full

**שלב 11: ALL localStorage (no filter!)**

```javascript
localStorage.clear();  // ⚠️ מוחק הכל!
// כולל:
// - נתוני TikTrack
// - נתוני אתרים אחרים ב-localhost
// - הגדרות דפדפן
// - כל מה שנשמר ב-localStorage!
```

**שלב 12: DELETE IndexedDB Database**

```javascript
await indexedDB.deleteDatabase('UnifiedCacheDB');
// ⚠️ מוחק את כל ה-database!
// לא רק stores - הכל!
```

**שלב 13: Session Cleanup**

```javascript
sessionStorage.clear();  // אם משתמשים
```

**שלב 14: דוח**

```javascript
{
    level: 'nuclear',
    cleared: {
        full: 117 entries,
        allLocalStorage: 'ALL',
        indexedDBDeleted: true,
        sessionStorage: 'ALL'
    },
    total: 'EVERYTHING',
    duration: 823ms,
    coverage: '150%+',
    warnings: [
        'All localStorage cleared (including non-TikTrack)',
        'IndexedDB database deleted',
        'Session data cleared',
        'Page refresh required'
    ]
}
```

**תרחישי שימוש:**

- 🔴 **חירום בלבד!**
- reset מוחלט
- לפני הדגמות (מצב "כמו חדש")
- פתרון בעיות קשות שלא נפתרו ב-Full
- ⚠️ **לא לשימוש שגרתי!**

**⚠️ דורש לאחר מכן:**

- Page refresh (F5)
- Login מחדש
- הגדרת preferences מחדש
- בדיקה שהמערכת עובדת

---

## 🛡️ **Confirmation Modals**

### **Light - אישור ירוק 🟢**

```
┌─────────────────────────────────────────┐
│ 🟢 ניקוי קל (Light)                    │
├─────────────────────────────────────────┤
│ ינוקו:                                  │
│ • Memory Layer: 5 entries               │
│ • Service Caches: 67 entries            │
│ • CSS Management: 15 entries            │
│                                         │
│ לא ינוקו:                               │
│ • localStorage: 31 entries (ישארו)     │
│ • Orphan Keys: 17 keys (ישארו)         │
│                                         │
│ סה"כ: 87 items למחיקה                  │
│ כיסוי: 25%                              │
│ בטיחות: גבוהה ✅                        │
│                                         │
│ ⚠️ הפיך: כן - persistent data נשאר     │
│                                         │
│ [אישור]  [ביטול]                       │
└─────────────────────────────────────────┘
```

### **Medium - אישור כחול 🔵**

```
┌─────────────────────────────────────────┐
│ 🔵 ניקוי בינוני (Medium)               │
├─────────────────────────────────────────┤
│ ינוקו:                                  │
│ • כל Light: 87 entries                  │
│ • localStorage tiktrack_*: 14 entries   │
│ • IndexedDB store: 12 entries           │
│ • Backend layer: 0 entries              │
│                                         │
│ לא ינוקו:                               │
│ • Orphan Keys: 17 keys (ישארו)         │
│                                         │
│ סה"כ: 113 items למחיקה                 │
│ כיסוי: 60%                              │
│ בטיחות: בינונית ⚠️                     │
│                                         │
│ ⚠️ הפיך: חלקי - UnifiedCM data אבד     │
│                                         │
│ [אישור]  [ביטול]                       │
└─────────────────────────────────────────┘
```

### **Full - אישור כתום 🟠**

```
┌─────────────────────────────────────────┐
│ 🟠 ניקוי מלא (Full)                    │
├─────────────────────────────────────────┤
│ ⚠️ פעולה זו תמחק את כל המטמון!         │
│                                         │
│ ינוקו:                                  │
│ • כל Medium: 113 entries                │
│ • Orphan Keys: 17 keys                  │
│   - Auth: authToken, currentUser ⚠️    │
│   - Preferences: colorScheme, etc.      │
│   - Dynamic: sortState_*, etc.          │
│                                         │
│ סה"כ: 130 items למחיקה                 │
│ כיסוי: 100%                             │
│ בטיחות: נמוכה ⚠️                       │
│                                         │
│ ⚠️ לא הפיך! כל הנתונים יאבדו!          │
│ ⚠️ דורש login מחדש (auth נמחק)         │
│                                         │
│ [⚠️ אני מבין - מחק הכל]  [ביטול]      │
└─────────────────────────────────────────┘
```

### **Nuclear - אישור אדום ☢️**

```
┌─────────────────────────────────────────┐
│ ☢️ ניקוי גרעיני (NUCLEAR)              │
├─────────────────────────────────────────┤
│ ⚠️⚠️⚠️ אזהרה קריטית! ⚠️⚠️⚠️            │
│                                         │
│ פעולה זו תמחק את כל המטמון              │
│ כולל נתונים של אתרים אחרים!            │
│                                         │
│ ינוקו:                                  │
│ • כל Full: 130 entries                  │
│ • ALL localStorage (ללא סינון!)         │
│ • DELETE UnifiedCacheDB database        │
│ • sessionStorage (if exists)            │
│                                         │
│ השפעות:                                 │
│ • TikTrack: איבוד כל הנתונים           │
│ • אתרים אחרים: ייתכן איבוד נתונים      │
│ • דורש: refresh + login + setup        │
│                                         │
│ כיסוי: 150%+                            │
│ בטיחות: אפס ☢️                          │
│                                         │
│ ⚠️⚠️⚠️ בלתי הפיך לחלוטין! ⚠️⚠️⚠️       │
│                                         │
│ [☢️ כן, מחק הכל]  [ביטול]             │
└─────────────────────────────────────────┘
```

---

## 🎨 **עיצוב ממשק**

### **כרטיסי הרמות (cache-test.html + system_management.html)**

#### **Light Card - ירוק**

```html
<div class="level-card level-light">
    <div class="level-icon">🟢</div>
    <h4>Light - ניקוי קל</h4>
    <div class="level-coverage">
        <span class="badge bg-success">25% כיסוי</span>
    </div>
    <ul class="level-includes">
        <li>✅ Memory Layer</li>
        <li>✅ Service Caches (7-9)</li>
        <li>✅ CSS Management</li>
        <li>❌ localStorage</li>
        <li>❌ Orphan Keys</li>
    </ul>
    <div class="level-use-case">
        מבחנים מהירים, איפוס memory
    </div>
    <button class="btn btn-success" onclick="clearAllCache({ level: 'light' })">
        🟢 נקה - Light
    </button>
</div>
```

#### **Medium Card - כחול (ברירת מחדל)**

```html
<div class="level-card level-medium">
    <div class="level-icon">🔵</div>
    <h4>Medium - ניקוי בינוני</h4>
    <div class="level-coverage">
        <span class="badge bg-primary">60% כיסוי</span>
        <span class="badge bg-info">ברירת מחדל</span>
    </div>
    <ul class="level-includes">
        <li>✅ כל Light (87 items)</li>
        <li>✅ UnifiedCacheManager (4 שכבות)</li>
        <li>❌ Orphan Keys (ישארו)</li>
    </ul>
    <div class="level-use-case">
        פיתוח יומיומי, כפתור בתפריט
    </div>
    <p class="text-muted small">
        <i class="fas fa-info-circle"></i> 
        כפתור 🧹 בתפריט הראשי קורא לרמה זו
    </p>
    <button class="btn btn-primary" onclick="clearAllCache({ level: 'medium' })">
        🔵 נקה - Medium
    </button>
</div>
```

#### **Full Card - כתום**

```html
<div class="level-card level-full">
    <div class="level-icon">🟠</div>
    <h4>Full - ניקוי מלא</h4>
    <div class="level-coverage">
        <span class="badge bg-warning">100% כיסוי</span>
    </div>
    <ul class="level-includes">
        <li>✅ כל Medium (113 items)</li>
        <li>✅ Orphan Keys (17 keys)</li>
        <li>⚠️ כולל: authToken, currentUser</li>
    </ul>
    <div class="level-use-case">
        לפני commits, releases, reset מלא
    </div>
    <div class="alert alert-warning small">
        ⚠️ דורש login מחדש!
    </div>
    <button class="btn btn-warning" onclick="clearAllCache({ level: 'full' })">
        🟠 נקה - Full
    </button>
</div>
```

#### **Nuclear Card - אדום**

```html
<div class="level-card level-nuclear">
    <div class="level-icon">☢️</div>
    <h4>Nuclear - גרעיני</h4>
    <div class="level-coverage">
        <span class="badge bg-danger">150%+ כיסוי</span>
    </div>
    <ul class="level-includes">
        <li>✅ כל Full (130 items)</li>
        <li>☢️ ALL localStorage (ללא סינון!)</li>
        <li>☢️ DELETE IndexedDB database</li>
        <li>☢️ sessionStorage</li>
    </ul>
    <div class="level-use-case">
        חירום בלבד! reset מוחלט
    </div>
    <div class="alert alert-danger small">
        ⚠️⚠️⚠️ מוחק גם נתונים של אתרים אחרים!
    </div>
    <button class="btn btn-danger" onclick="clearAllCache({ level: 'nuclear' })">
        ☢️ נקה - Nuclear
    </button>
</div>
```

---

## 📐 **API Specification**

### **clearAllCache(options)**

```typescript
interface ClearCacheOptions {
    level?: 'light' | 'medium' | 'full' | 'nuclear';  // ברירת מחדל: 'medium'
    skipConfirmation?: boolean;                        // ברירת מחדל: false
    includeAuth?: boolean;                             // ברירת מחדל: true (בfull/nuclear)
    verbose?: boolean;                                 // ברירת מחדל: true
}

interface ClearCacheResult {
    success: boolean;
    level: string;
    duration: number;
    cleared: {
        [source: string]: number | string;
    };
    notCleared?: {
        [source: string]: number | string;
    };
    total: number | string;
    coverage: string;  // '25%', '60%', '100%', '150%+'
    warnings?: string[];
}

async function clearAllCache(
    options: ClearCacheOptions = {}
): Promise<ClearCacheResult>
```

### **דוגמאות שימוש:**

```javascript
// 1. ברירת מחדל - Medium
await clearAllCache();

// 2. Light - מבחן מהיר
await clearAllCache({ level: 'light' });

// 3. Full - ללא confirmation (סקריפט אוטומטי)
await clearAllCache({ 
    level: 'full', 
    skipConfirmation: true 
});

// 4. Full - אבל שמור auth
await clearAllCache({ 
    level: 'full',
    includeAuth: false  // authToken ו-currentUser לא יימחקו
});

// 5. Nuclear - verbose logging
await clearAllCache({ 
    level: 'nuclear',
    verbose: true  // לוגים מפורטים לכל פריט
});
```

---

## ✅ **Validation & Testing**

### **testClearingLevels() - בדיקה מקיפה**

```javascript
async function testClearingLevels() {
    const results = {
        light: { tested: false, passed: false },
        medium: { tested: false, passed: false },
        full: { tested: false, passed: false },
        nuclear: { tested: false, passed: false }
    };
    
    // Test Light
    const beforeLight = await captureFullSnapshot();
    await clearAllCache({ level: 'light', skipConfirmation: true });
    const afterLight = await captureFullSnapshot();
    
    results.light.tested = true;
    results.light.passed = 
        afterLight.memory === 0 &&
        afterLight.services === 0 &&
        afterLight.localStorage > 0 &&  // לא נוקה
        afterLight.orphans > 0;          // לא נוקה
    
    // Test Medium (אחרי refresh)
    // Test Full (אחרי refresh)
    // Test Nuclear (manual only - too destructive)
    
    return results;
}
```

### **Expected Results:**

| Test | Memory | Services | localStorage | Orphans | Pass? |
|------|--------|----------|--------------|---------|-------|
| Light | 0 | 0 | >0 | >0 | ✅ |
| Medium | 0 | 0 | 0 (tiktrack_*) | >0 | ✅ |
| Full | 0 | 0 | 0 | 0 | ✅ |
| Nuclear | 0 | 0 | 0 (ALL) | 0 | ⚠️ Manual |

---

## 🎯 **תרחישי שימוש מומלצים**

| תרחיש | רמה מומלצת | סיבה |
|-------|------------|------|
| מבחן מהיר | Light | לא נוגע ב-persistent |
| פיתוח יומיומי | Medium | ניקוי טוב, בטוח יחסית |
| לפני commit | Full | כיסוי 100%, ודא נקי |
| באג מסתורי | Full | reset מלא |
| לפני release | Full | ודא מצב נקי |
| לפני demo | Nuclear | מצב "כמו חדש" |
| תקלה חמורה | Nuclear | reset מוחלט |
| כפתור בתפריט | Medium | ברירת מחדל |

---

## 📝 **Implementation Checklist**

### **Phase 1: Core Implementation**

- [ ] ORPHAN_KEYS constant
- [ ] clearServiceCaches() helper
- [ ] clearOrphanKeys() helper
- [ ] clearAllCache() main function (4 levels)
- [ ] Before/After snapshot functions
- [ ] Detailed reporting

### **Phase 2: UI Components**

- [ ] showClearCacheConfirmation() modal
- [ ] cache-test.html: 4 level cards
- [ ] system_management.html: 4 level buttons
- [ ] Comparison table
- [ ] Future features section (disabled)

### **Phase 3: Testing**

- [ ] testClearingLevels() function
- [ ] Manual testing per level
- [ ] Verification of coverage
- [ ] Documentation update

---

**סטטוס:** 📋 **אפיון מלא - מוכן ליישום**  
**כיסוי:** 🎯 **100% בשלב מיידי**  
**עדכון:** 11.10.2025


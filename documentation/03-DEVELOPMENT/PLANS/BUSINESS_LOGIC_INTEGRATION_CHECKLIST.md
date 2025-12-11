# רשימת בדיקות אינטגרציה - Business Logic Layer

# Integration Checklist - Business Logic Layer

**תאריך יצירה:** 22 נובמבר 2025  
**גרסה:** 1.0.0  
**מטרה:** רשימת בדיקות מקיפה לאינטגרציה של Business Logic Layer עם מערכת האיתחול

---

## ✅ בדיקות לפני אינטגרציה

### 1. הבנת מערכת האיתחול

- [ ] קריאת `UNIFIED_INITIALIZATION_SYSTEM.md`
- [ ] קריאת `MONITORING_SYSTEM_V2.md`
- [ ] הבנת 5 שלבי איתחול
- [ ] הבנת Packages System (מוניטורינג, לא טעינה דינמית)
- [ ] הבנת Page Configs (מוניטורינג, לא טעינה דינמית)
- [ ] הבנת Custom Initializers (Stage 3)
- [ ] הבנת Preferences Loading Events
- [ ] הבנת Cache System (Stage 1)

---

## ✅ בדיקות אינטגרציה - Data Services

### לכל Data Service (trades-data.js, executions-data.js, וכו')

- [ ] **טעינה סטטית**: Service נטען סטטית ב-HTML
- [ ] **Package Manifest**: Service מוגדר נכון ב-`package-manifest.js`
- [ ] **Page Configs**: Service מוגדר נכון ב-`page-initialization-configs.js`
- [ ] **requiredGlobals**: Service מופיע ב-requiredGlobals של העמודים הרלוונטיים
- [ ] **זמינות ב-Stage 3**: Service זמין ב-Stage 3 (Page Systems)
- [ ] **Business Logic API Wrappers**: כל ה-wrappers מוגדרים נכון
- [ ] **Error Handling**: כל ה-wrappers כוללים error handling
- [ ] **Cache Integration**: כל ה-wrappers משתמשים במטמון נכון

---

## ✅ בדיקות אינטגרציה - Custom Initializers

### לכל Custom Initializer

- [ ] **בדיקת זמינות Data Services**:

  ```javascript
  if (!window.TradesData) {
    window.Logger?.warn?.('TradesData not available', { page: 'page-name' });
    return;
  }
  ```

- [ ] **בדיקת זמינות Cache System**:

  ```javascript
  if (!window.UnifiedCacheManager) {
    window.Logger?.warn?.('UnifiedCacheManager not available', { page: 'page-name' });
    return;
  }
  ```

- [ ] **בדיקת זמינות Preferences (אם נדרש)**:

  ```javascript
  // Wait for critical preferences
  await new Promise((resolve) => {
    if (window.__preferencesCriticalLoaded) {
      resolve();
      return;
    }
    const timeoutMs = window.API_ENV === 'production' ? 5000 : 3000;
    window.addEventListener('preferences:critical-loaded', resolve, { once: true });
    setTimeout(resolve, timeoutMs); // Fallback
  });
  ```

- [ ] **שימוש ב-Business Logic API**:

  ```javascript
  try {
    const result = await window.TradesData.calculateStopPrice(100, 10, 'Long');
    // Use result
  } catch (error) {
    window.Logger?.error?.('Error calculating stop price', { error: error?.message });
    // Fallback or show error
  }
  ```

---

## ✅ בדיקות אינטגרציה - 5 שלבי איתחול

### Stage 1: Core Systems

- [ ] **Cache System מתחיל**: UnifiedCacheManager.initialize() נקרא
- [ ] **Cache System זמין**: window.UnifiedCacheManager זמין
- [ ] **CacheTTLGuard זמין**: window.CacheTTLGuard זמין
- [ ] **CacheSyncManager זמין**: window.CacheSyncManager זמין

### Stage 2: UI Systems

- [ ] **requiredGlobals נבדקים**: כל ה-requiredGlobals זמינים
- [ ] **Data Services זמינים**: כל ה-Data Services נטענים סטטית

### Stage 3: Page Systems

- [ ] **Custom Initializers רצים**: כל ה-customInitializers רצים
- [ ] **Data Services זמינים**: כל ה-Data Services זמינים
- [ ] **Cache System זמין**: Cache System מוכן לשימוש
- [ ] **Preferences זמינים (אם נדרש)**: Preferences נטענו או timeout

### Stage 4: Validation Systems

- [ ] **Business Logic API זמין**: API זמין לולידציות
- [ ] **Error Handling**: כל הולידציות כוללות error handling

### Stage 5: Finalization

- [ ] **Business Logic API זמין**: API זמין לחישובים סופיים
- [ ] **Cache Invalidation**: כל ה-mutations מפעילים invalidation

---

## ✅ בדיקות אינטגרציה - Cache System

### UnifiedCacheManager

- [ ] **שימוש ב-4 שכבות**: Memory → localStorage → IndexedDB → Backend
- [ ] **בחירת שכבת מטמון נכונה**: המערכת בוחרת שכבת מטמון נכונה
- [ ] **Fallback בין שכבות**: Fallback עובד נכון

### CacheTTLGuard

- [ ] **שימוש ב-CacheTTLGuard**: כל ה-Business Logic API calls משתמשים ב-CacheTTLGuard
- [ ] **TTL נכון**: TTL נכון לכל סוג חישוב
- [ ] **Cache invalidation**: Cache invalidation עובד נכון אחרי mutations

### CacheSyncManager

- [ ] **Invalidation patterns**: כל ה-mutations מפעילים invalidation נכון
- [ ] **Dependencies**: Dependencies בין caches נכונים
- [ ] **Reload**: Reload עובד נכון אחרי invalidation

---

## ✅ בדיקות אינטגרציה - Preferences Loading Events

### אם Business Logic API תלוי בהעדפות

- [ ] **המתנה ל-event**: ממתינים ל-`preferences:critical-loaded`
- [ ] **בדיקת flag**: בודקים `window.__preferencesCriticalLoaded`
- [ ] **Timeout fallback**: Timeout fallback (3s dev, 5s prod)
- [ ] **Error handling**: Error handling אם העדפות לא נטענו

### אם Business Logic API לא תלוי בהעדפות

- [ ] **אין תלות**: אין תלות בהעדפות
- [ ] **עובד מיד**: עובד מיד ללא המתנה

---

## ✅ בדיקות אינטגרציה - Error Handling

### לכל Business Logic API call

- [ ] **Try-Catch**: כל ה-calls כוללים try-catch
- [ ] **Error Logging**: כל ה-errors נרשמים ב-Logger
- [ ] **Fallback**: Fallback mechanism זמין
- [ ] **User Feedback**: User feedback במקרה של error

---

## ✅ בדיקות אינטגרציה - Performance

### לכל Business Logic API call

- [ ] **Response Time**: Response time < 200ms
- [ ] **Cache Hit Rate**: Cache hit rate > 80%
- [ ] **No Blocking**: לא חוסם את האיתחול
- [ ] **Async**: כל ה-calls הם async

---

## 📋 סיכום

### לפני התחלת אינטגרציה

1. ✅ הבנת מערכת האיתחול
2. ✅ הבנת 5 שלבי איתחול
3. ✅ הבנת Packages System
4. ✅ הבנת Page Configs
5. ✅ הבנת Custom Initializers
6. ✅ הבנת Preferences Loading Events
7. ✅ הבנת Cache System

### במהלך אינטגרציה

1. ✅ בדיקת זמינות Data Services
2. ✅ בדיקת זמינות Cache System
3. ✅ בדיקת זמינות Preferences (אם נדרש)
4. ✅ שימוש נכון ב-Business Logic API
5. ✅ Error handling מקיף
6. ✅ Cache integration נכון

### אחרי אינטגרציה

1. ✅ בדיקת כל 5 שלבי איתחול
2. ✅ בדיקת Cache System
3. ✅ בדיקת Preferences Loading Events
4. ✅ בדיקת Performance
5. ✅ בדיקת Error Handling

---

**תאריך עדכון אחרון:** 22 נובמבר 2025  
**גרסה:** 1.0.0  
**סטטוס:** ✅ מוכן לשימוש


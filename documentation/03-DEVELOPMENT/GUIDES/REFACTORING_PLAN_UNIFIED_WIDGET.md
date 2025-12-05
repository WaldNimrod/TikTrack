# תוכנית ריפקטורינג - ווידג'ט פעולות ממתינות מאוחד ומערכת משותפת

## רקע

המשתמש דרש שהווידג'ט המאוחד **יהיה תצוגה נוספת של הממשק המרכזי בעמוד ביצועים**, ולא wrapper לווידג'טים הישנים. המשתמש גם דרש שהקוד בעמוד ביצועים והווידג'ט יצרו **קוד משותף** ליצירת אשכולות, מטמון, ופעולות.

## בעיות זוהו

1. **הווידג'ט הנוכחי משכפל לוגיקה** במקום להשתמש בקוד הקיים
2. **המודולים הישנים** (`PendingExecutionTradeCreation`, `PendingExecutionsHighlights`, `PendingTradePlanWidget`) **צריכים להימחק לגמרה**
3. **הקוד בעמוד ביצועים והקוד בווידג'ט צריכים לממש קוד משותף** ליצירת אשכולות, מטמון, ופעולות
4. **יש שכבת צד שרת ולוגיקה עסקית מוכנה** שצריך להשתמש בה
5. **הממשק בעמוד ביצועים (טבלה מפורטת) צריך להישמר** כמו שהוא

## מה קיים כיום

### בעמוד ביצועים (`executions.html`)

1. **Trade Creation Clusters Section** (`tradeCreationClustersSection`):
   - משתמש ב-`PendingExecutionTradeCreation.initializeExecutionsSection()`
   - מציג **cards עם טבלאות מפורטות** לכל אשכול
   - כולל checkboxes לבחירת ביצועים
   - כולל כפתורים לפתיחת מודל יצירת טרייד, רענון, ודחיית אשכול

2. **Suggestions Section** (`suggestions`):
   - משתמש ב-`loadTradeSuggestionsForAll()` מ-`executions.js`
   - מציג **טבלה מפורטת** עם כל ההמלצות
   - כולל כפתורים לקבלה/דחיה של הצעות

### API Endpoints קיימים

1. **Trade Creation Clusters**: `/api/executions/pending-assignment/trade-creation-clusters`
   - Service: `ExecutionClusteringService.get_execution_trade_creation_clusters()`
   - מחזיר רשימת אשכולות עם ביצועים, stats, וכו'

2. **Execution Highlights**: `/api/executions/pending-assignment/highlights`
   - Service: `ExecutionTradeMatchingService.get_pending_execution_highlights()`
   - מחזיר רשימת המלצות לשיוך ביצועים לטריידים

3. **Trade Plan Assignments**: `/api/trades/pending-plan/assignments`
   - Service: `TradePlanMatchingService.get_assignment_suggestions()`
   - מחזיר רשימת הצעות לשיוך טריידים לתוכניות

4. **Trade Plan Creations**: `/api/trades/pending-plan/creations`
   - Service: `TradePlanMatchingService.get_creation_suggestions()`
   - מחזיר רשימת הצעות ליצירת תוכניות מטריידים

## פתרון ארכיטקטוני

### שלב 1: יצירת Services משותפים

**מטרה**: הפרדת לוגיקת טעינת נתונים מהממשק.

#### 1.1. `execution-clustering-service.js`

**מיקום**: `trading-ui/scripts/services/execution-clustering-service.js`

**תפקיד**: שירות משותף לטעינת אשכולות יצירת טריידים.

**API**:

```javascript
window.ExecutionClusteringService = {
  /**
   * Fetch clusters from API
   * @param {Object} options - Options including limit, executions_limit
   * @returns {Promise<Array>} - Array of cluster objects
   */
  async fetchClusters(options = {}) {
    // Fetch from /api/executions/pending-assignment/trade-creation-clusters
  },

  /**
   * Get cached clusters
   * @returns {Array} - Cached clusters or empty array
   */
  getCachedClusters() {
    // Return cached data
  },

  /**
   * Cache clusters
   * @param {Array} clusters - Clusters to cache
   */
  cacheClusters(clusters) {
    // Cache with UnifiedCacheManager
  },

  /**
   * Get dismissed cluster IDs
   * @returns {Set<string>} - Set of dismissed cluster IDs
   */
  getDismissedClusters() {
    // Load from UnifiedCacheManager
  },

  /**
   * Dismiss a cluster
   * @param {string} clusterId - Cluster ID to dismiss
   */
  dismissCluster(clusterId) {
    // Save to UnifiedCacheManager
  }
};
```

#### 1.2. `execution-assignment-service.js`

**מיקום**: `trading-ui/scripts/services/execution-assignment-service.js`

**תפקיד**: שירות משותף לטעינת המלצות שיוך ביצועים.

**API**:

```javascript
window.ExecutionAssignmentService = {
  async fetchHighlights(options = {}) {
    // Fetch from /api/executions/pending-assignment/highlights
  },
  
  getCachedHighlights() {},
  cacheHighlights(highlights) {},
  getDismissedItems() {},
  dismissItem(executionId, tradeId) {}
};
```

#### 1.3. `trade-plan-assignment-service.js`

**מיקום**: `trading-ui/scripts/services/trade-plan-assignment-service.js`

**תפקיד**: שירות משותף לטעינת המלצות שיוך/יצירת תוכניות.

**API**:

```javascript
window.TradePlanAssignmentService = {
  async fetchAssignments(options = {}) {
    // Fetch from /api/trades/pending-plan/assignments
  },
  
  async fetchCreations(options = {}) {
    // Fetch from /api/trades/pending-plan/creations
  },
  
  getCachedAssignments() {},
  cacheAssignments(assignments) {},
  getCachedCreations() {},
  cacheCreations(creations) {},
  getDismissedItems() {},
  dismissItem(key) {}
};
```

#### 1.4. `pending-actions-cache-service.js`

**מיקום**: `trading-ui/scripts/services/pending-actions-cache-service.js`

**תפקיד**: שירות משותף למטמון של dismissed items.

**API**:

```javascript
window.PendingActionsCacheService = {
  /**
   * Get dismissed items for a cache key
   * @param {string} cacheKey - Cache key
   * @returns {Set} - Set of dismissed item keys
   */
  getDismissed(cacheKey) {},

  /**
   * Dismiss an item
   * @param {string} cacheKey - Cache key
   * @param {string} itemKey - Item key to dismiss
   */
  dismissItem(cacheKey, itemKey) {},

  /**
   * Clear dismissed items for a cache key
   * @param {string} cacheKey - Cache key
   */
  clearDismissed(cacheKey) {}
};
```

### שלב 2: ריפקטורינג עמוד ביצועים

**מטרה**: הסרת התלות במודולים הישנים, שימוש ב-services משותפים, שמירה על הממשק הקיים.

#### 2.1. עדכון `executions.js`

**קובץ**: `trading-ui/scripts/executions.js`

**שינויים**:

1. **הסרת התלות ב-`PendingExecutionTradeCreation`**:
   - הסרת קריאה ל-`PendingExecutionTradeCreation.initializeExecutionsSection()`
   - יצירת פונקציה חדשה `initializeTradeCreationClustersSection()` שמשתמשת ב-`ExecutionClusteringService`

2. **עדכון `loadTradeSuggestionsForAll()`**:
   - שימוש ב-`ExecutionAssignmentService` במקום קריאה ישירה ל-API
   - שמירה על הממשק הקיים (טבלה מפורטת)

3. **יצירת rendering functions משותפים**:
   - `renderClusterCard(cluster, selectedIds)` - מימוש מחדש של `buildExecutionsClusterCard`
   - `renderExecutionsTable(cluster, selectedIds)` - שימוש ב-`ClusterTable.renderExecutionsTable` אם קיים, או מימוש חדש
   - `renderSuggestionsTable(suggestionsData)` - עדכון `renderTradeSuggestionsSection`

#### 2.2. עדכון HTML structure

**קובץ**: `trading-ui/executions.html`

**שינויים**:

- אין שינויים ב-HTML - המבנה הקיים נשאר

### שלב 3: ריפקטורינג הווידג'ט המאוחד

**מטרה**: הווידג'ט יציג רשימה פשוטה (לא טבלה) של אותם נתונים.

#### 3.1. עדכון `unified-pending-actions-widget.js`

**קובץ**: `trading-ui/scripts/widgets/unified-pending-actions-widget.js`

**שינויים**:

1. **הסרת כל הלוגיקה של טעינת נתונים מה-API**:
   - הסרת `API_ENDPOINTS`
   - הסרת `state.data`, `state.errors`, `state.dismissed`
   - הסרת `fetchData()`, `loadCombinationData()` (נשתמש ב-services)

2. **שימוש ב-services משותפים**:
   - `ExecutionClusteringService.fetchClusters()` ל-createTrades
   - `ExecutionAssignmentService.fetchHighlights()` ל-assignTrades
   - `TradePlanAssignmentService.fetchAssignments()` ל-assignPlans
   - `TradePlanAssignmentService.fetchCreations()` ל-createPlans

3. **Rendering פשוט (רשימה)**:
   - `renderListItem()` - רשימה פשוטה עם כותרת
   - `setupOverlayHover()` - overlay עם פרטים נוספים על hover
   - אין טבלאות - רק רשימה עם overlay

4. **Actions משותפים**:
   - שימוש באותן פונקציות action כמו בעמוד ביצועים
   - למשל: `openTradeModalFromCluster()` יכול להיות משותף

#### 3.2. Overlay System

**מימוש**: overlay עם hover - כותרת ברשימה, פרטים ב-overlay.

**שימוש ב-`WidgetOverlayService`** שכבר נוצר:
- `WidgetOverlayService.positionOverlay(item, details)`
- `WidgetOverlayService.setupOverlayHover(item, detailsSelector, itemHoverClass, loggerPage)`

### שלב 4: מחיקת המודולים הישנים

**מטרה**: הסרת כל המודולים הישנים מהמערכת.

#### קבצים למחיקה:

1. `trading-ui/scripts/pending-execution-trade-creation.js` - מחיקה מלאה
2. `trading-ui/scripts/pending-executions-widget.js` - מחיקה מלאה
3. `trading-ui/scripts/pending-trade-plan-widget.js` - מחיקה מלאה

#### עדכונים נדרשים:

1. **`package-manifest.js`**:
   - הסרת כל הסקריפטים הישנים מה-manifest

2. **`page-initialization-configs.js`**:
   - הסרת כל האתחולים של המודולים הישנים (כבר נעשה)

3. **`index.html`**:
   - הסרת כל האלמנטים HTML של הווידג'טים הישנים (כבר נעשה)

### שלב 5: בדיקות

**מטרה**: וידוא שהכל עובד כמצופה.

#### 5.1. בדיקות ידניות

1. **עמוד ביצועים**:
   - [ ] Trade Creation Clusters Section טוען ומציג נתונים
   - [ ] Suggestions Section טוען ומציג נתונים
   - [ ] טבלאות מפורטות עובדות
   - [ ] כפתורי פעולות עובדים (יצירת טרייד, שיוך, דחייה)

2. **דף הבית (ווידג'ט)**:
   - [ ] כל 4 הקומבינציות טוענות נתונים
   - [ ] רשימה פשוטה מוצגת
   - [ ] Overlay עובד על hover
   - [ ] כפתורי פעולות עובדים

#### 5.2. בדיקות אוטומטיות (בדפדפן)

**קובץ**: `trading-ui/test-unified-widget-refactored.html`

**תוכן**:
- בדיקת טעינת services
- בדיקת טעינת נתונים מה-services
- בדיקת rendering של רשימות
- בדיקת overlay system
- בדיקת actions

## סדר ביצוע

### Phase 1: יצירת Services (3-4 שעות)

1. ✅ יצירת `execution-clustering-service.js`
2. ✅ יצירת `execution-assignment-service.js`
3. ✅ יצירת `trade-plan-assignment-service.js`
4. ✅ יצירת `pending-actions-cache-service.js`
5. ✅ הוספה ל-`package-manifest.js`
6. ✅ בדיקות בסיסיות של services

### Phase 2: ריפקטורינג עמוד ביצועים (4-5 שעות)

1. ✅ יצירת `initializeTradeCreationClustersSection()` חדשה
2. ✅ עדכון `loadTradeSuggestionsForAll()` להשתמש ב-service
3. ✅ יצירת rendering functions משותפים
4. ✅ הסרת התלות ב-`PendingExecutionTradeCreation`
5. ✅ בדיקות מלאות של עמוד ביצועים

### Phase 3: ריפקטורינג הווידג'ט (3-4 שעות)

1. ✅ הסרת לוגיקת טעינת נתונים מה-API
2. ✅ שימוש ב-services משותפים
3. ✅ מימוש rendering פשוט (רשימה)
4. ✅ מימוש overlay system
5. ✅ בדיקות מלאות של הווידג'ט

### Phase 4: מחיקת מודולים ישנים (1-2 שעות)

1. ✅ מחיקת 3 קבצי המודולים הישנים
2. ✅ עדכון `package-manifest.js`
3. ✅ בדיקת שהכל עדיין עובד

### Phase 5: בדיקות סופיות (2-3 שעות)

1. ✅ בדיקות ידניות מלאות
2. ✅ יצירת דף בדיקה אוטומטי
3. ✅ בדיקות אוטומטיות בדפדפן
4. ✅ תיקון באגים

## קבצים שייווצרו/יעודכנו

### קבצים חדשים:

1. `trading-ui/scripts/services/execution-clustering-service.js`
2. `trading-ui/scripts/services/execution-assignment-service.js`
3. `trading-ui/scripts/services/trade-plan-assignment-service.js`
4. `trading-ui/scripts/services/pending-actions-cache-service.js`
5. `trading-ui/test-unified-widget-refactored.html`

### קבצים שיעודכנו:

1. `trading-ui/scripts/executions.js` - ריפקטורינג מלא
2. `trading-ui/scripts/widgets/unified-pending-actions-widget.js` - ריפקטורינג מלא
3. `trading-ui/scripts/init-system/package-manifest.js` - הוספת services, הסרת מודולים ישנים

### קבצים שיימחקו:

1. `trading-ui/scripts/pending-execution-trade-creation.js`
2. `trading-ui/scripts/pending-executions-widget.js`
3. `trading-ui/scripts/pending-trade-plan-widget.js`

## הערות חשובות

1. **הממשק בעמוד ביצועים נשאר זהה** - רק הקוד משתנה
2. **הווידג'ט מציג רשימה פשוטה** - לא טבלה מפורטת
3. **קוד משותף** - services משותפים לשני המקומות
4. **שכבת שרת קיימת** - אין צורך לשנות שום דבר בצד השרת
5. **Cache משותף** - services משתמשים ב-`UnifiedCacheManager`

## קריטריוני הצלחה

- ✅ עמוד ביצועים עובד כמו קודם (ממשק זהה)
- ✅ הווידג'ט מציג נתונים (רשימה פשוטה)
- ✅ אין כפילות קוד - services משותפים
- ✅ המודולים הישנים נמחקו לגמרה
- ✅ כל הבדיקות עוברות







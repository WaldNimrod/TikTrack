# דוקומנטציה למבנה הסקריפטים - TikTrack
## JavaScript Scripts Architecture Documentation

### תאריך עדכון: 24 אוגוסט 2025
### גרסה: 3.0 - ארכיטקטורה מודולרית

---

## 📋 **תוכן עניינים**

1. [ארכיטקטורה כללית](#ארכיטקטורה-כללית)
2. [סדר טעינת קבצים](#סדר-טעינת-קבצים)
3. [קבצי ליבה (Core Files)](#קבצי-ליבה-core-files)
4. [קבצי שירות (Utility Files)](#קבצי-שירות-utility-files)
5. [קבצי עמודים (Page Files)](#קבצי-עמודים-page-files)
6. [קבצי מערכות (System Files)](#קבצי-מערכות-system-files)
7. [תלויות וקשרים](#תלויות-שרים)
8. [היסטוריית רפקטורינג](#היסטוריית-רפקטורינג)

---

## 🏗️ **ארכיטקטורה כללית**

### מבנה הפרויקט
```
trading-ui/scripts/
├── 🏛️ Core Files (קבצי ליבה)
│   ├── main.js                    # אתחול גלובלי ופונקציות יסוד
│   ├── header-system.js           # מערכת כותרת מאוחדת
│   └── console-cleanup.js         # ניקוי קונסול
│
├── 🛠️ Utility Files (קבצי שירות)
│   ├── ui-utils.js                # פונקציות UI משותפות
│   ├── data-utils.js              # פונקציות נתונים משותפות
│   ├── date-utils.js              # פונקציות תאריכים
│   ├── tables.js                  # מערכת טבלאות גלובלית
│   ├── page-utils.js              # פונקציות עמודים
│   ├── linked-items.js            # מערכת פריטים מקושרים
│   ├── translation-utils.js       # פונקציות תרגום
│   ├── table-mappings.js          # מיפוי עמודות טבלאות
│   └── simple-filter.js           # מערכת פילטרים פשוטה
│
├── 📄 Page Files (קבצי עמודים)
│   ├── accounts.js                # ניהול חשבונות
│   ├── alerts.js                  # ניהול התראות
│   ├── trades.js                  # ניהול טריידים
│   ├── trade_plans.js             # ניהול תכנוני טריידים
│   ├── tickers.js                 # ניהול טיקרים
│   ├── notes.js                   # ניהול הערות
│   ├── executions.js              # ניהול עסקאות
│   ├── cash_flows.js              # ניהול תזרימי מזומנים
│   ├── currencies.js              # ניהול מטבעות
│   ├── preferences.js             # ניהול העדפות
│   ├── research.js                # ניהול מחקר
│   ├── tests.js                   # בדיקות מערכת
│   ├── database.js                # ניהול מסד נתונים
│   ├── auth.js                    # אימות משתמשים
│   └── active-alerts-component.js # רכיב התראות פעילות
│
└── 🔧 System Files (קבצי מערכות)
    ├── filter-system.js           # מערכת פילטרים מתקדמת
    ├── constraint-manager.js      # מנהל אילוצים
    ├── condition-translator.js    # מתרגם תנאים
    └── db-extradata.js            # נתונים נוספים למסד נתונים
```

---

## 📥 **סדר טעינת קבצים**

### סדר טעינה סטנדרטי (בכל העמודים)
```html
<!-- 1. מערכת כותרת -->
<script src="scripts/header-system.js"></script>

<!-- 2. ניקוי קונסול -->
<script src="scripts/console-cleanup.js"></script>

<!-- 3. פילטרים בסיסיים -->
<script src="scripts/simple-filter.js"></script>

<!-- 4. פונקציות תרגום -->
<script src="scripts/translation-utils.js"></script>

<!-- 5. פונקציות נתונים -->
<script src="scripts/data-utils.js"></script>

<!-- 6. פונקציות UI -->
<script src="scripts/ui-utils.js"></script>

<!-- 7. מיפוי טבלאות -->
<script src="scripts/table-mappings.js"></script>

<!-- 8. פונקציות תאריכים -->
<script src="scripts/date-utils.js"></script>

<!-- 9. מערכת טבלאות -->
<script src="scripts/tables.js"></script>

<!-- 10. מערכת פריטים מקושרים -->
<script src="scripts/linked-items.js"></script>

<!-- 11. פונקציות עמודים -->
<script src="scripts/page-utils.js"></script>

<!-- 12. אתחול גלובלי -->
<script src="scripts/main.js"></script>

<!-- 13. קבצי עמוד ספציפיים -->
<script src="scripts/alerts.js"></script>
<script src="scripts/[page-specific].js"></script>
```

### הסבר הסדר
1. **header-system.js** - חייב להיטען ראשון (יוצר את הכותרת)
2. **console-cleanup.js** - מנקה את הקונסול מיד
3. **simple-filter.js** - מערכת פילטרים בסיסית
4. **translation-utils.js** - פונקציות תרגום נדרשות לכל העמודים
5. **data-utils.js** - פונקציות API ונתונים
6. **ui-utils.js** - פונקציות UI משותפות
7. **table-mappings.js** - מיפוי עמודות לטבלאות
8. **date-utils.js** - פונקציות תאריכים
9. **tables.js** - מערכת טבלאות גלובלית
10. **linked-items.js** - מערכת פריטים מקושרים
11. **page-utils.js** - פונקציות ניהול עמודים
12. **main.js** - אתחול גלובלי (חייב להיטען אחרי כל השירותים)
13. **קבצי עמוד** - פונקציונליות ספציפית לכל עמוד

---

## 🏛️ **קבצי ליבה (Core Files)**

### 1. **main.js** (732 שורות)
**תפקיד:** אתחול גלובלי ופונקציות יסוד
**תלויות:** כל קבצי השירות חייבים להיטען לפניו

#### אינדקס פונקציות:
- `initializeApplication()` - אתחול המערכת
- `checkDependencies()` - בדיקת תלויות
- `initializeCoreSystems()` - אתחול מערכות ליבה
- `initializeCurrentPage()` - אתחול עמוד נוכחי
- `isModuleAvailable(moduleName, functionName)` - בדיקת זמינות מודול
- `getSystemInfo()` - קבלת מידע מערכת
- `handleGlobalError(event)` - טיפול בשגיאות גלובליות
- `handleUnhandledRejection(event)` - טיפול בפרומיסים שנדחו
- `showSystemError(message)` - הצגת שגיאת מערכת
- `restoreAllSectionStates()` - שחזור מצב כל הסקשנים

#### היסטוריית רפקטורינג:
- **Phase 1-5:** איחוד פונקציות מקבצים שונים
- **Phase 6:** פיצול למודולים נפרדים (tables.js, date-utils.js, linked-items.js, page-utils.js)

### 2. **header-system.js** (3,152 שורות)
**תפקיד:** מערכת כותרת מאוחדת עם פילטרים
**תלויות:** translation-utils.js, simple-filter.js

#### אינדקס פונקציות:
- `toggleStatusFilter()` - הצגה/הסתרת פילטר סטטוס
- `toggleTypeFilter()` - הצגה/הסתרת פילטר טיפוס
- `toggleAccountFilter()` - הצגה/הסתרת פילטר חשבון
- `toggleDateRangeFilter()` - הצגה/הסתרת פילטר טווח תאריכים
- `closeStatusFilter()` - סגירת פילטר סטטוס
- `closeTypeFilter()` - סגירת פילטר טיפוס
- `closeAccountFilter()` - סגירת פילטר חשבון
- `closeDateRangeFilter()` - סגירת פילטר טווח תאריכים
- `closeOtherFilterMenus(currentMenuId)` - סגירת תפריטי פילטרים אחרים
- `setupFilterMenuAutoClose(menu)` - הגדרת סגירה אוטומטית של תפריטי פילטרים
- `clearFilterMenuTimers(menu)` - ניקוי טיימרים של תפריטי פילטרים
- `selectStatusOption(status)` - בחירת אפשרות סטטוס
- `selectTypeOption(type)` - בחירת אפשרות טיפוס
- `selectAccountOption(account)` - בחירת אפשרות חשבון
- `selectDateRangeOption(dateRange)` - בחירת אפשרות טווח תאריכים
- `applyStatusFilter()` - החלת פילטר סטטוס
- `applyTypeFilter()` - החלת פילטר טיפוס
- `applyAccountFilter()` - החלת פילטר חשבון
- `applyDateRangeFilter(dateRange)` - החלת פילטר טווח תאריכים
- `updateStatusFilterText()` - עדכון טקסט פילטר סטטוס
- `updateTypeFilterText()` - עדכון טקסט פילטר טיפוס
- `updateAccountFilterText()` - עדכון טקסט פילטר חשבון
- `resetAllFilters()` - איפוס כל הפילטרים
- `clearAllFilters()` - ניקוי כל הפילטרים

#### ארכיטקטורה:
- Web Component עם Shadow DOM
- תקשורת מבוססת אירועים
- מערכת פילטרים מודולרית

### 3. **console-cleanup.js** (183 שורות)
**תפקיד:** ניקוי קונסול וניהול שגיאות
**תלויות:** אין

#### אינדקס פונקציות:
- `clearConsole(showMessage = true)` - ניקוי קונסול
- `manualConsoleCleanup()` - ניקוי קונסול ידני

---

## 🛠️ **קבצי שירות (Utility Files)**

### 1. **ui-utils.js** (917 שורות)
**תפקיד:** פונקציות UI משותפות
**תלויות:** אין

#### אינדקס פונקציות:
- `getNotificationIcon(type)` - קבלת איקון לפי סוג הודעה
- `showModalNotification(type, title, message, modalId)` - התראות במודל
- `showSecondConfirmation(title, message, onConfirm)` - אישור שני
- `confirmSecondAction()` - אישור פעולה שנייה
- `showSecondConfirmationModal(title, message, onConfirm)` - מודל אישור שני
- `showErrorNotification(title, message)` - הצגת התראת שגיאה
- `showSuccessNotification(title, message)` - הצגת התראת הצלחה
- `showInfoNotification(title, message)` - הצגת התראת מידע
- `showWarningNotification(title, message)` - הצגת התראת אזהרה
- `createToastContainer()` - יצירת מיכל התראות
- `colorAmount(amount, displayText)` - צביעת סכומים
- `showNotification(message, type)` - הצגת התראה כללית
- `getBootstrapColor(type)` - קבלת צבע Bootstrap
- `showLinkedItemsWarningModal(data, itemType, itemId, onConfirm)` - מודל אזהרת פריטים מקושרים
- `createLinkedItemsWarningContent(data, itemType, itemId, onConfirm)` - תוכן אזהרת פריטים מקושרים
- `createLinkedItemsWarningList(linkedItems)` - רשימת אזהרת פריטים מקושרים
- `forceDeleteWithLinkedItems(itemType, itemId, onConfirm)` - מחיקה כפויה עם פריטים מקושרים
- `getItemTypeIcon(itemType)` - קבלת איקון סוג פריט
- `getItemTypeDisplayName(itemType)` - קבלת שם תצוגה של סוג פריט
- `createBasicItemInfo(item)` - יצירת מידע בסיסי של פריט
- `initializeUIUtils()` - אתחול פונקציות UI
- `showLinkedItemsBlockingModal(data, itemType, itemId, actionType)` - מודל חסימת פריטים מקושרים
- `createLinkedItemsBlockingContent(data, itemType, itemId, actionType)` - תוכן חסימת פריטים מקושרים
- `createLinkedItemsDetailedList(linkedItems)` - רשימה מפורטת של פריטים מקושרים
- `createDetailedItemInfo(item)` - יצירת מידע מפורט של פריט

### 2. **data-utils.js** (326 שורות)
**תפקיד:** פונקציות נתונים משותפות
**תלויות:** ui-utils.js

#### אינדקס פונקציות:
- `apiCall(endpoint, method, data)` - קריאה כללית ל-API
- `loadData(endpoint, dataKey, updateFunction, summaryFunction)` - טעינת נתונים כללית
- `saveData(endpoint, data, reloadFunction)` - שמירת נתונים כללית
- `deleteData(endpoint, reloadFunction)` - מחיקת נתונים
- `getUserPreference(key, defaultValue)` - קבלת העדפת משתמש
- `convertAmountToShares(amount, price, allowFractionalShares)` - המרת סכום למניות
- `convertSharesToAmount(shares, price)` - המרת מניות לסכום
- `calculateDefaultPrices(currentPrice, options)` - חישוב מחירים ברירת מחדל
- `validateRequired(value, fieldName)` - אימות שדה חובה
- `validateNumber(value, fieldName, min, max)` - אימות מספר
- `validateDate(value, fieldName)` - אימות תאריך

### 3. **date-utils.js** (456 שורות)
**תפקיד:** פונקציות תאריכים מרכזיות
**תלויות:** אין

#### אינדקס פונקציות:
- `formatDate(dateString)` - עיצוב תאריך סטנדרטי
- `formatDateTime(dateString)` - עיצוב תאריך ושעה
- `formatDateOnly(dateString)` - עיצוב תאריך בלבד
- `formatShortDate(dateString)` - עיצוב תאריך קצר
- `formatLongDate(dateString)` - עיצוב תאריך ארוך
- `formatTimeOnly(dateString)` - עיצוב שעה בלבד
- `toISOString(date)` - המרה למחרוזת ISO
- `toDate(date)` - המרה לאובייקט תאריך
- `isValidDate(dateString)` - אימות תאריך
- `isPastDate(date)` - בדיקה אם תאריך בעבר
- `isFutureDate(date)` - בדיקה אם תאריך בעתיד
- `daysDifference(startDate, endDate)` - חישוב ימים בין תאריכים
- `addDays(date, days)` - הוספת ימים לתאריך
- `addMonths(date, months)` - הוספת חודשים לתאריך
- `initializeDateUtils()` - אתחול פונקציות תאריכים

### 4. **tables.js** (359 שורות)
**תפקיד:** מערכת טבלאות גלובלית
**תלויות:** table-mappings.js, translation-utils.js, ui-utils.js

#### אינדקס פונקציות:
- `sortTableData(columnIndex, data, tableType, updateFunction)` - סידור טבלאות גלובלי
- `sortAnyTable(columnIndex, data, tableType, updateFunction)` - סידור כל טבלה
- `sortTable(columnIndex, data, tableType, updateFunction)` - סידור טבלה (compatibility)
- `isDateValue(value)` - בדיקה אם ערך הוא תאריך
- `saveSortState(tableType, columnIndex, direction)` - שמירת מצב סידור
- `getSortState(tableType)` - קבלת מצב סידור
- `restoreAnyTableSort(tableType, data, updateFunction)` - שחזור מצב סידור
- `updateSortIcons(tableType, activeColumnIndex, direction)` - עדכון איקוני סידור

### 5. **page-utils.js** (622 שורות)
**תפקיד:** פונקציות ניהול עמודים
**תלויות:** ui-utils.js, data-utils.js, tables.js, translation-utils.js

#### אינדקס פונקציות:
- `initializePageFilters(pageName)` - אתחול פילטרים לעמוד
- `setupSortableHeaders(pageName)` - הגדרת כותרות ניתנות לסידור
- `updateTableStats(pageName, data)` - עדכון סטטיסטיקות טבלה
- `debugSavedFilters(pageName)` - דיבוג פילטרים שמורים
- `restoreDesignsSectionState()` - שחזור מצב סקשן תכנונים
- `initializePage(pageName)` - אתחול עמוד
- `savePageState(pageName, state)` - שמירת מצב עמוד
- `loadPageState(pageName)` - טעינת מצב עמוד
- `clearPageState(pageName)` - ניקוי מצב עמוד
- `isPageAvailable(pageName)` - בדיקה אם עמוד זמין
- `getPageInfo(pageName)` - קבלת מידע על עמוד
- `navigateToPage(pageName, options)` - ניווט לעמוד
- `getCurrentPageName()` - קבלת שם העמוד הנוכחי
- `isCurrentPage(pageName)` - בדיקה אם זה העמוד הנוכחי
- `applySavedFilters(filters)` - החלת פילטרים שמורים
- `setupFilterEventHandlers(pageName)` - הגדרת event handlers לפילטרים
- `handleHeaderSort(pageName, columnIndex)` - טיפול בסידור כותרות
- `restoreSortState(pageName, sortState)` - שחזור מצב סידור
- `getCurrentTableData(pageName)` - קבלת נתוני טבלה נוכחיים
- `calculateTableStats(data, pageName)` - חישוב סטטיסטיקות טבלה
- `updateStatsDisplay(pageName, stats)` - עדכון תצוגת סטטיסטיקות
- `getCurrentPageState()` - קבלת מצב עמוד נוכחי
- `initializeTradesPage()` - אתחול עמוד טריידים
- `initializeAccountsPage()` - אתחול עמוד חשבונות
- `initializeAlertsPage()` - אתחול עמוד התראות

### 6. **linked-items.js** (949 שורות)
**תפקיד:** מערכת פריטים מקושרים
**תלויות:** ui-utils.js, data-utils.js, translation-utils.js

#### אינדקס פונקציות:
- `viewLinkedItems(itemId, itemType)` - צפייה בפריטים מקושרים
- `loadLinkedItemsData(itemId, itemType)` - טעינת נתוני פריטים מקושרים
- `showLinkedItemsModal(data, itemType, itemId)` - הצגת מודל פריטים מקושרים
- `createLinkedItemsModalContent(data, itemType, itemId)` - יצירת תוכן מודל פריטים מקושרים
- `createLinkedItemsList(items)` - יצירת רשימת פריטים מקושרים
- `getItemTypeIcon(type)` - קבלת איקון סוג פריט
- `getItemTypeDisplayName(type)` - קבלת שם תצוגה של סוג פריט
- `createBasicItemInfo(item)` - יצירת מידע בסיסי של פריט
- `createModal(id, title, content)` - יצירת מודל
- `createDetailedItemInfo(item)` - יצירת מידע מפורט של פריט
- `createTradeDetails(item)` - יצירת פרטי טרייד
- `createAccountDetails(item)` - יצירת פרטי חשבון
- `createTickerDetails(item)` - יצירת פרטי טיקר
- `createAlertDetails(item)` - יצירת פרטי התראה
- `createCashFlowDetails(item)` - יצירת פרטי תזרים מזומנים
- `createNoteDetails(item)` - יצירת פרטי הערה
- `createTradePlanDetails(item)` - יצירת פרטי תכנון טרייד
- `createExecutionDetails(item)` - יצירת פרטי עסקה
- `getMockLinkedData(itemType, itemId)` - קבלת נתוני mock לפריטים מקושרים
- `checkLinkedItems(itemId, itemType)` - בדיקת פריטים מקושרים
- `exportLinkedItemsData(itemType, itemId)` - ייצוא נתוני פריטים מקושרים
- `viewItemDetails(type, id)` - צפייה בפרטי פריט
- `editItem(type, id)` - עריכת פריט
- `deleteItem(type, id)` - מחיקת פריט
- `openItemPage(itemType, itemId)` - פתיחת עמוד פריט
- `viewLinkedItemsForTrade(tradeId)` - צפייה בפריטים מקושרים לטרייד
- `viewLinkedItemsForAccount(accountId)` - צפייה בפריטים מקושרים לחשבון
- `viewLinkedItemsForTicker(tickerId)` - צפייה בפריטים מקושרים לטיקר
- `viewLinkedItemsForAlert(alertId)` - צפייה בפריטים מקושרים להתראה
- `viewLinkedItemsForCashFlow(cashFlowId)` - צפייה בפריטים מקושרים לתזרים מזומנים
- `viewLinkedItemsForNote(noteId)` - צפייה בפריטים מקושרים להערה
- `viewLinkedItemsForTradePlan(tradePlanId)` - צפייה בפריטים מקושרים לתכנון טרייד
- `viewLinkedItemsForExecution(executionId)` - צפייה בפריטים מקושרים לעסקה

### 7. **translation-utils.js** (280 שורות)
**תפקיד:** פונקציות תרגום מרכזיות
**תלויות:** אין

#### אינדקס פונקציות:
- `translateAccountStatus(status)` - תרגום סטטוס חשבון
- `translateTickerStatus(status)` - תרגום סטטוס טיקר
- `translateNoteStatus(status)` - תרגום סטטוס הערה
- `translateAlertStatus(status)` - תרגום סטטוס התראה
- `translateTradePlanStatus(status)` - תרגום סטטוס תכנון טרייד
- `translateIsTriggered(isTriggered)` - תרגום האם הופעלה
- `translateTradeType(type)` - תרגום טיפוס טרייד
- `translateTradePlanType(type)` - תרגום טיפוס תכנון טרייד
- `translateCashFlowType(type)` - תרגום טיפוס תזרים מזומנים
- `translateCashFlowSource(source)` - תרגום מקור תזרים מזומנים
- `translateTestCategory(category)` - תרגום קטגוריית בדיקה
- `translateExecutionAction(action)` - תרגום פעולת עסקה

### 8. **table-mappings.js** (370 שורות)
**תפקיד:** מיפוי עמודות טבלאות
**תלויות:** translation-utils.js

#### אינדקס פונקציות:
- `getColumnValue(item, columnIndex, tableType)` - קבלת ערך עמודה
- `getTableMapping(tableType)` - קבלת מיפוי טבלה
- `isTableSupported(tableType)` - בדיקה אם טבלה נתמכת
- `initializeTableMappings()` - אתחול מיפויי טבלאות

### 9. **simple-filter.js** (629 שורות)
**תפקיד:** מערכת פילטרים פשוטה
**תלויות:** header-system.js, main.js, translation-utils.js

#### תכונות עיקריות:
- פילטרים לפי סטטוס, טיפוס, חשבון
- חיפוש טקסט חופשי
- שמירת מצב פילטרים
- עדכון דינמי של טקסטים

---

## 📄 **קבצי עמודים (Page Files)**

### 1. **accounts.js** (1,715 שורות)
**תפקיד:** ניהול חשבונות
**תלויות:** main.js, alerts.js

#### אינדקס פונקציות (חלקי - הפונקציות העיקריות):
- `loadAccountsData()` - טעינת נתוני חשבונות
- `updateAccountsTable(accounts)` - עדכון טבלת חשבונות
- `createAccountModal()` - יצירת מודל חשבון
- `saveAccount()` - שמירת חשבון
- `editAccount(accountId)` - עריכת חשבון
- `deleteAccount(accountId)` - מחיקת חשבון
- `validateAccountForm()` - אימות טופס חשבון
- `updateAccountSummaryStats()` - עדכון סטטיסטיקות חשבונות
- `sortTable(columnIndex)` - סידור טבלת חשבונות
- `restoreAccountsSectionState()` - שחזור מצב סקשן חשבונות

### 2. **alerts.js** (1,883 שורות)
**תפקיד:** ניהול התראות
**תלויות:** main.js, active-alerts-component.js, condition-translator.js

#### אינדקס פונקציות (חלקי - הפונקציות העיקריות):
- `filterAlertsLocally(alerts, selectedStatuses, selectedTypes, selectedDateRange, searchTerm)` - סינון מקומי של התראות
- `updateAlertsTable(alerts)` - עדכון טבלת התראות
- `updatePageSummaryStats()` - עדכון סטטיסטיקות עמוד
- `showAddAlertModal()` - הצגת מודל הוספת התראה
- `updateRadioButtons(accounts, trades, tradePlans, tickers)` - עדכון כפתורי רדיו
- `populateSelect(selectId, data, field, prefix)` - מילוי select
- `closeModal(modalId)` - סגירת מודל
- `onAlertTypeChange(selectElement)` - שינוי טיפוס התראה
- `checkAlertType(alertType, element)` - בדיקת טיפוס התראה
- `checkAlertVariable(selectElement)` - בדיקת משתנה התראה
- `checkAlertOperator(selectElement)` - בדיקת אופרטור התראה
- `buildAlertCondition(variable, operator, value)` - בניית תנאי התראה
- `parseAlertCondition(condition)` - ניתוח תנאי התראה
- `editAlert(alertId)` - עריכת התראה
- `getAlertState(status, isTriggered)` - קבלת מצב התראה
- `validateAlertStatusCombination(status, isTriggered)` - אימות שילוב סטטוס התראה
- `updateStatusAndTriggered()` - עדכון סטטוס והופעלה
- `sortTable(columnIndex)` - סידור טבלת התראות
- `getStatusClass(status)` - קבלת class סטטוס
- `getTypeClass(type)` - קבלת class טיפוס
- `getRelatedClass(relatedType)` - קבלת class קשור
- `restoreAlertsSectionState()` - שחזור מצב סקשן התראות
- `loadAlerts()` - טעינת התראות

### 3. **trades.js** (2,165 שורות)
**תפקיד:** ניהול טריידים
**תלויות:** main.js, alerts.js, active-alerts-component.js, accounts.js

#### אינדקס פונקציות (חלקי - הפונקציות העיקריות):
- `filterTradesData(selectedStatuses, selectedTypes, selectedAccounts, selectedDateRange, searchTerm)` - סינון נתוני טריידים
- `filterTradesLocally(trades, selectedStatuses, selectedTypes, selectedDateRange, searchTerm)` - סינון מקומי טריידים
- `updateTradesTable(trades)` - עדכון טבלת טריידים
- `viewTickerDetails(tickerId)` - צפייה בפרטי טיקר
- `viewAccountDetails(accountId)` - צפייה בפרטי חשבון
- `viewTradePlanDetails(tradePlanId)` - צפייה בפרטי תכנון טרייד
- `editTradeRecord(tradeId)` - עריכת רשומת טרייד
- `cancelTradeRecord(tradeId)` - ביטול רשומת טרייד
- `checkLinkedItemsBeforeCancel(tradeId)` - בדיקת פריטים מקושרים לפני ביטול
- `performTradeCancellation(tradeId)` - ביצוע ביטול טרייד
- `deleteTradeRecord(tradeId)` - מחיקת רשומת טרייד
- `checkLinkedItemsBeforeDelete(tradeId)` - בדיקת פריטים מקושרים לפני מחיקה
- `performTradeDeletion(tradeId)` - ביצוע מחיקת טרייד
- `addEditImportantNote()` - הוספת/עריכת הערה חשובה
- `addEditReminder()` - הוספת/עריכת תזכורת
- `addEditBuySell()` - הוספת/עריכת קנייה/מכירה
- `loadTradeExecutions(tradeId)` - טעינת עסקאות טרייד
- `updateExecutionsTable(executions)` - עדכון טבלת עסקאות
- `showAddTradeModal()` - הצגת מודל הוספת טרייד
- `validateTradeForm()` - אימות טופס טרייד
- `showTradeValidationError(errorId, message)` - הצגת שגיאת אימות טרייד
- `clearTradeValidationErrors()` - ניקוי שגיאות אימות טרייד
- `addImportantNote()` - הוספת הערה חשובה
- `addReminder()` - הוספת תזכורת
- `validateTradeStatusChange(newStatus, tradeData)` - אימות שינוי סטטוס טרייד
- `getCurrentPosition(tradeId)` - קבלת פוזיציה נוכחית
- `linkExistingExecution()` - קישור עסקה קיימת
- `unlinkExecution()` - ביטול קישור עסקה
- `sortTable(columnIndex)` - סידור טבלת טריידים
- `getTradesStatusForSort(status)` - קבלת סטטוס טרייד לסידור
- `updateTradesSortIcons(activeColumnIndex)` - עדכון איקוני סידור טריידים
- `loadTradesSortState()` - טעינת מצב סידור טריידים
- `setupSortEventListeners()` - הגדרת event listeners לסידור
- `setupDateValidation()` - הגדרת אימות תאריכים
- `validateDateFields()` - אימות שדות תאריך
- `showDateValidationError(message)` - הצגת שגיאת אימות תאריך
- `clearDateValidationMessages()` - ניקוי הודעות אימות תאריך

### 4. **trade_plans.js** (2,123 שורות)
**תפקיד:** ניהול תכנוני טריידים
**תלויות:** main.js, alerts.js, active-alerts-component.js

#### פונקציות עיקריות:
- `loadTradePlansData()` - טעינת נתוני תכנונים
- `updateTradePlansTable()` - עדכון טבלת תכנונים
- `createTradePlanModal()` - יצירת מודל תכנון
- `saveTradePlan()` - שמירת תכנון

### 5. **tickers.js** (1,474 שורות)
**תפקיד:** ניהול טיקרים
**תלויות:** main.js, alerts.js

#### פונקציות עיקריות:
- `loadTickersData()` - טעינת נתוני טיקרים
- `updateTickersTable()` - עדכון טבלת טיקרים
- `createTickerModal()` - יצירת מודל טיקר
- `saveTicker()` - שמירת טיקר

### 6. **notes.js** (1,121 שורות)
**תפקיד:** ניהול הערות
**תלויות:** main.js, alerts.js

#### פונקציות עיקריות:
- `loadNotesData()` - טעינת נתוני הערות
- `updateNotesTable()` - עדכון טבלת הערות
- `createNoteModal()` - יצירת מודל הערה
- `saveNote()` - שמירת הערה

### 7. **executions.js** (1,448 שורות)
**תפקיד:** ניהול עסקאות
**תלויות:** main.js, alerts.js, active-alerts-component.js

#### פונקציות עיקריות:
- `loadExecutionsData()` - טעינת נתוני עסקאות
- `updateExecutionsTable()` - עדכון טבלת עסקאות
- `createExecutionModal()` - יצירת מודל עסקה
- `saveExecution()` - שמירת עסקה

### 8. **cash_flows.js** (1,136 שורות)
**תפקיד:** ניהול תזרימי מזומנים
**תלויות:** main.js, alerts.js

#### פונקציות עיקריות:
- `loadCashFlowsData()` - טעינת נתוני תזרימי מזומנים
- `updateCashFlowsTable()` - עדכון טבלת תזרימי מזומנים
- `createCashFlowModal()` - יצירת מודל תזרים מזומנים
- `saveCashFlow()` - שמירת תזרים מזומנים

### 9. **currencies.js** (433 שורות)
**תפקיד:** ניהול מטבעות
**תלויות:** main.js

#### פונקציות עיקריות:
- `loadCurrenciesData()` - טעינת נתוני מטבעות
- `updateCurrenciesTable()` - עדכון טבלת מטבעות
- `createCurrencyModal()` - יצירת מודל מטבע
- `saveCurrency()` - שמירת מטבע

### 10. **preferences.js** (2,266 שורות)
**תפקיד:** ניהול העדפות
**תלויות:** main.js

#### פונקציות עיקריות:
- `loadPreferencesData()` - טעינת נתוני העדפות
- `updatePreferencesTable()` - עדכון טבלת העדפות
- `savePreference()` - שמירת העדפה
- `applyTheme()` - החלת עיצוב

### 11. **research.js** (476 שורות)
**תפקיד:** ניהול מחקר
**תלויות:** main.js

#### פונקציות עיקריות:
- `loadResearchData()` - טעינת נתוני מחקר
- `updateResearchTable()` - עדכון טבלת מחקר
- `createResearchModal()` - יצירת מודל מחקר
- `saveResearch()` - שמירת מחקר

### 12. **tests.js** (1,211 שורות)
**תפקיד:** בדיקות מערכת
**תלויות:** main.js

#### פונקציות עיקריות:
- `runTests()` - הרצת בדיקות
- `testDataLoading()` - בדיקת טעינת נתונים
- `testTableSorting()` - בדיקת סידור טבלאות
- `testFilters()` - בדיקת פילטרים

### 13. **database.js** (1,072 שורות)
**תפקיד:** ניהול מסד נתונים
**תלויות:** main.js

#### פונקציות עיקריות:
- `loadDatabaseData()` - טעינת נתוני מסד נתונים
- `updateDatabaseTable()` - עדכון טבלת מסד נתונים
- `backupDatabase()` - גיבוי מסד נתונים
- `restoreDatabase()` - שחזור מסד נתונים

### 14. **auth.js** (342 שורות)
**תפקיד:** אימות משתמשים
**תלויות:** main.js

#### פונקציות עיקריות:
- `login()` - התחברות
- `logout()` - התנתקות
- `checkAuth()` - בדיקת אימות
- `updateUserProfile()` - עדכון פרופיל משתמש

### 15. **active-alerts-component.js** (1,268 שורות)
**תפקיד:** רכיב התראות פעילות
**תלויות:** main.js, alerts.js

#### פונקציות עיקריות:
- `loadActiveAlerts()` - טעינת התראות פעילות
- `updateActiveAlertsDisplay()` - עדכון תצוגת התראות פעילות
- `handleAlertAction()` - טיפול בפעולת התראה
- `refreshActiveAlerts()` - רענון התראות פעילות

---

## 🔧 **קבצי מערכות (System Files)**

### 1. **filter-system.js** (573 שורות)
**תפקיד:** מערכת פילטרים מתקדמת
**תלויות:** main.js

#### אינדקס פונקציות:
- `initializeFilterSystem()` - אתחול מערכת פילטרים
- `applyFilters()` - החלת פילטרים
- `clearFilters()` - ניקוי פילטרים
- `saveFilterState()` - שמירת מצב פילטרים
- `loadFilterState()` - טעינת מצב פילטרים
- `updateFilterDisplay()` - עדכון תצוגת פילטרים
- `validateFilters()` - אימות פילטרים
- `resetFilters()` - איפוס פילטרים

### 2. **constraint-manager.js** (704 שורות)
**תפקיד:** מנהל אילוצים
**תלויות:** main.js

#### אינדקס פונקציות:
- `loadConstraints()` - טעינת אילוצים
- `applyConstraints()` - החלת אילוצים
- `validateConstraints()` - אימות אילוצים
- `saveConstraints()` - שמירת אילוצים
- `checkConstraintViolations()` - בדיקת הפרות אילוצים
- `updateConstraintDisplay()` - עדכון תצוגת אילוצים
- `resetConstraints()` - איפוס אילוצים
- `exportConstraints()` - ייצוא אילוצים

### 3. **condition-translator.js** (168 שורות)
**תפקיד:** מתרגם תנאים
**תלויות:** main.js

#### אינדקס פונקציות:
- `translateCondition(condition)` - תרגום תנאי
- `parseCondition(conditionString)` - ניתוח תנאי
- `formatCondition(condition)` - עיצוב תנאי
- `validateCondition(condition)` - אימות תנאי
- `buildConditionString(parts)` - בניית מחרוזת תנאי
- `extractConditionParts(condition)` - חילוץ חלקי תנאי

### 4. **db-extradata.js** (399 שורות)
**תפקיד:** נתונים נוספים למסד נתונים
**תלויות:** main.js

#### אינדקס פונקציות:
- `toggleAllSections()` - הצגה/הסתרת כל הסקשנים
- `toggleCurrenciesSection()` - הצגה/הסתרת סקשן מטבעות
- `toggleNoteRelationTypesSection()` - הצגה/הסתרת סקשן סוגי קשרי הערות
- `restoreSectionsState()` - שחזור מצב סקשנים
- `updateCurrenciesTable(currencies)` - עדכון טבלת מטבעות
- `updateCurrenciesCount(count)` - עדכון מספר מטבעות
- `showCurrenciesError()` - הצגת שגיאת מטבעות
- `updateNoteRelationTypesTable(noteRelationTypes)` - עדכון טבלת סוגי קשרי הערות
- `updateNoteRelationTypesCount(count)` - עדכון מספר סוגי קשרי הערות
- `showNoteRelationTypesError()` - הצגת שגיאת סוגי קשרי הערות
- `editCurrency(id)` - עריכת מטבע
- `deleteCurrency(id)` - מחיקת מטבע
- `editNoteRelationType(id)` - עריכת סוג קשר הערה
- `deleteNoteRelationType(id)` - מחיקת סוג קשר הערה
- `updateSummaryStats()` - עדכון סטטיסטיקות סיכום
- `updateLoadingText()` - עדכון טקסט טעינה

---

## 🔗 **תלויות וקשרים**

### תרשים תלויות
```
header-system.js
├── translation-utils.js
└── simple-filter.js

main.js
├── ui-utils.js
├── data-utils.js
├── date-utils.js
├── tables.js
├── page-utils.js
├── linked-items.js
└── translation-utils.js

tables.js
├── table-mappings.js
├── translation-utils.js
└── ui-utils.js

page-utils.js
├── ui-utils.js
├── data-utils.js
├── tables.js
└── translation-utils.js

linked-items.js
├── ui-utils.js
├── data-utils.js
└── translation-utils.js

[Page Files]
├── main.js
├── alerts.js
└── active-alerts-component.js (לחלק מהעמודים)
```

### כללי תלויות
1. **קבצי ליבה** - נטענים ראשונים
2. **קבצי שירות** - נטענים לפני קבצי עמודים
3. **קבצי עמודים** - נטענים אחרונים
4. **main.js** - חייב להיטען אחרי כל השירותים
5. **header-system.js** - חייב להיטען ראשון

---

## 📚 **היסטוריית רפקטורינג**

### Phase 1: איחוד פונקציות (אוגוסט 2025)
- העברת `showNotification`, `formatDate` ל-main.js
- העברת `createAccountModal` ל-accounts.js
- העברת `showModalNotification` ל-ui-utils.js

### Phase 2: ריכוז פונקציות תאריכים
- איחוד פונקציות עיצוב תאריכים ב-main.js
- הסרת כפילויות מ-cash_flows.js, tickers.js, currencies.js

### Phase 3: ניתוח פונקציות טבלאות
- זיהוי הבדלים בין גרסאות page-specific ו-database.js
- שמירה על גרסאות page-specific עם לוגיקה מורכבת

### Phase 4: איחוד loadAccountsData
- זיהוי 3 גרסאות של הפונקציה
- שמירה על הגרסה המתקדמת ביותר
- עדכון כל ההתייחסויות

### Phase 5: איחוד פונקציות מודל
- הסרת כפילויות מ-main.js ו-accounts.js
- שימוש בגרסאות מ-ui-utils.js

### Phase 6: פיצול main.js למודולים (24 אוגוסט 2025)
- **tables.js** - מערכת טבלאות גלובלית
- **date-utils.js** - פונקציות תאריכים מרכזיות
- **linked-items.js** - מערכת פריטים מקושרים
- **page-utils.js** - פונקציות ניהול עמודים

### תיקוני סידור (24 אוגוסט 2025)
- תיקון שגיאות infinite recursion בכל קבצי הטבלאות
- החלפת `window.sortTable` ב-`window.sortTableData`
- עדכון פרמטרים בפונקציות סידור

---

## 📊 **סטטיסטיקות**

### קבצים לפי קטגוריה
- **קבצי ליבה:** 3 קבצים
- **קבצי שירות:** 9 קבצים
- **קבצי עמודים:** 15 קבצים
- **קבצי מערכות:** 4 קבצים
- **סה"כ:** 31 קבצים

### שורות קוד
- **header-system.js:** 3,152 שורות (הקובץ הגדול ביותר)
- **preferences.js:** 2,266 שורות
- **trades.js:** 2,165 שורות
- **trade_plans.js:** 2,123 שורות
- **alerts.js:** 1,883 שורות
- **סה"כ:** כ-25,000+ שורות קוד

### פונקציות גלובליות
- **main.js:** 15 פונקציות
- **tables.js:** 8 פונקציות
- **ui-utils.js:** 12 פונקציות
- **data-utils.js:** 6 פונקציות
- **date-utils.js:** 10 פונקציות

---

## 🎯 **המלצות עתידיות**

### שיפורים מוצעים
1. **הפחתת גודל קבצים** - פיצול קבצים גדולים
2. **איחוד נוסף** - איחוד פונקציות דומות
3. **תיעוד API** - תיעוד מפורט של כל הפונקציות
4. **בדיקות אוטומטיות** - הוספת בדיקות לכל הפונקציות
5. **אופטימיזציה** - שיפור ביצועים

### תחזוקה
1. **עדכון דוקומנטציה** - עדכון קבוע של המסמך
2. **בדיקת כפילויות** - סריקה תקופתית לכפילויות
3. **ניקוי קוד** - הסרת קוד לא בשימוש
4. **עדכון תלויות** - מעקב אחרי תלויות

---

*מסמך זה עודכן אוטומטית על ידי מערכת הניתוח של TikTrack*
*תאריך עדכון אחרון: 24 אוגוסט 2025*



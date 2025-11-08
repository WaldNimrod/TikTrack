# Modal Inventory - TikTrack System
## רשימת מודלים מלאה במערכת

**תאריך יצירה**: 12 בינואר 2025  
**מטרה**: מיפוי מלא של כל המודלים הקיימים במערכת לצורך תכנון מערכת מודלים מרכזית

---

## 📊 סיכום כללי

**סה"כ מודלים**: 24 מודלים  
**עמודים עם מודלים**: 7 עמודי CRUD עיקריים  
**מודלים מיוחדים**: 4 מודלים מערכתיים  
**מודלים לפיתוח**: 13 מודלים נוספים

---

## 🎯 מודלי CRUD עיקריים (8 עמודים)

### 1. **cash_flows** (תזרימי מזומנים) - פשוט
**מודלים**:
- `addCashFlowModal` - הוספת תזרים מזומנים
- `editCashFlowModal` - עריכת תזרים מזומנים

**שדות**:
- `cashFlowType` (select) - סוג תזרים (הפקדה/משיכה)
- `cashFlowAmount` (number) - סכום
- `cashFlowCurrency` (select) - מטבע
- `cashFlowAccount` (select) - חשבון מסחר
- `cashFlowDate` (datetime-local) - תאריך
- `cashFlowDescription` (text) - תיאור
- `cashFlowSource` (text) - מקור
- `cashFlowExternalId` (text) - מזהה חיצוני

**מורכבות**: נמוכה - 8 שדות פשוטים

### 2. **notes** (הערות) - פשוט
**מודלים**:
- `addNoteModal` - הוספת הערה חדשה
- `editNoteModal` - עריכת הערה

**שדות**:
- `noteTitle` (text) - כותרת ההערה
- `noteContent` (textarea) - תוכן ההערה
- `noteStatus` (select) - סטטוס (פעיל/ארכיון/טיוטה)
- `notePriority` (select) - עדיפות (נמוכה/בינונית/גבוהה)

**מורכבות**: נמוכה - 4 שדות פשוטים

### 3. **trading_accounts** (חשבונות מסחר) - בינוני
**מודלים**:
- `addAccountModal` - הוספת חשבון מסחר
- `editAccountModal` - עריכת חשבון מסחר

**שדות**:
- `tradingAccountName` (text) - שם החשבון
- `tradingAccountCurrency` (select) - מטבע
- `tradingAccountStatus` (select) - סטטוס
- `tradingAccountCashBalance` (number) - יתרת מזומן
- `tradingAccountTotalValue` (number) - ערך כולל

**מורכבות**: בינונית - 5 שדות עם לוגיקה עסקית

### 4. **tickers** (טיקרים) - בינוני
**מודלים**:
- `addTickerModal` - הוספת טיקר חדש
- `editTickerModal` - עריכת טיקר

**שדות**:
- `tickerSymbol` (text) - סמל הטיקר
- `tickerName` (text) - שם החברה
- `tickerCurrency` (select) - מטבע
- `tickerSector` (select) - סקטור
- `tickerLogo` (file) - לוגו החברה
- `tickerStatus` (select) - סטטוס

**מורכבות**: בינונית - 6 שדות כולל העלאת קובץ

### 5. **executions** (ביצועים) - בינוני-מורכב
**מודלים**:
- `addExecutionModal` - הוספת עסקה חדשה
- `editExecutionModal` - עריכת עסקה

**שדות**:
- `executionTradeId` (select) - טרייד/תוכנית
- `executionType` (select) - סוג עסקה (קניה/מכירה)
- `executionQuantity` (number) - כמות
- `executionPrice` (number) - מחיר
- `executionDate` (datetime-local) - תאריך עסקה
- `executionAccount` (select) - חשבון מסחר
- `executionCommission` (number) - עמלה
- `executionTotal` (calculated) - סה"כ מחושב
- `executionSource` (text) - מקור
- `executionNotes` (textarea) - הערות
- `executionExternalId` (text) - מזהה חיצוני

**מורכבות**: בינונית-מורכב - 11 שדות עם חישובים

### 6. **alerts** (התראות) - מורכב
**מודלים**:
- `addAlertModal` - הוספת התראה
- `editAlertModal` - עריכת התראה

**שדות**:
- `alertMessage` (text) - הודעת התראה
- `alertSymbol` (select) - סמל הטיקר
- `alertCondition` (select) - תנאי התראה
- `alertValue` (number) - ערך התראה
- `alertStatus` (select) - סטטוס התראה
- `alertPriority` (select) - עדיפות
- `alertExpiryDate` (datetime-local) - תאריך תפוגה
- `alertIsActive` (checkbox) - פעיל/לא פעיל

**מורכבות**: מורכב - 8 שדות עם לוגיקה מתקדמת

### 7. **trade_plans** (תוכניות מסחר) - מורכב מאוד
**מודלים**:
- `addTradePlanModal` - הוספת תכנון חדש
- `editTradePlanModal` - עריכת תכנון

**שדות** (Tab 1 - פרטים בסיסיים):
- `ticker` (select) - טיקר
- `tickerInfo` (calculated) - מידע טיקר (מחיר, שינוי, ווליום)
- `account` (select) - חשבון מסחר
- `tradeType` (select) - סוג טרייד
- `side` (select) - צד (קניה/מכירה)
- `quantity` (number) - כמות
- `entryPrice` (number) - מחיר כניסה
- `stopLoss` (number) - הפסד מקסימלי
- `takeProfit` (number) - רווח יעד
- `riskAmount` (number) - סכום סיכון
- `riskPercentage` (number) - אחוז סיכון

**שדות** (Tab 2 - סיבות ותנאים):
- `reason` (textarea) - סיבה לכניסה
- `conditions` (textarea) - תנאי כניסה
- `marketAnalysis` (textarea) - ניתוח שוק
- `technicalIndicators` (textarea) - אינדיקטורים טכניים

**מורכבות**: מורכב מאוד - 16 שדות עם טאבים ולוגיקה מתקדמת

### 8. **trades** (מעקב טריידים) - מורכב מאוד
**מודלים**:
- `addTradeModal` - הוספת טרייד חדש
- `editTradeModal` - עריכת טרייד

**שדות**:
- `tradeAccountId` (select) - חשבון מסחר
- `tradeTickerId` (select) - טיקר
- `tradeTradePlanId` (select) - תוכנית טרייד
- `tradeStatus` (select) - סטטוס
- `tradeType` (select) - סוג טרייד
- `tradeSide` (select) - צד
- `tradeOpenedAt` (datetime-local) - תאריך פתיחה
- `tradeClosedAt` (datetime-local) - תאריך סגירה
- `tradeQuantity` (number) - כמות
- `tradeEntryPrice` (number) - מחיר כניסה
- `tradeStopLoss` (number) - הפסד מקסימלי
- `tradeTakeProfit` (number) - רווח יעד
- `tradeNotes` (textarea) - הערות

**מורכבות**: מורכב מאוד - 14 שדות עם לוגיקה עסקית מורכבת

---

## 🔧 מודלים מיוחדים ומערכתיים

### 1. **Entity Details Modal** (`entityDetailsModal`)
**מטרה**: הצגת פרטי ישות מפורטים
**מיקום**: `trading-ui/scripts/entity-details-modal.js`
**שימוש**: כל עמודי CRUD
**תכונות**: דינמי, תומך בכל סוגי הישויות

### 2. **Linked Items Modal** (`linkedItemsModal`)
**מטרה**: הצגת פריטים מקושרים לישות
**מיקום**: `trading-ui/scripts/linked-items.js`
**שימוש**: כל עמודי CRUD
**תכונות**: בדיקת תלויות לפני מחיקה/ביטול

### 3. **Warning/Confirmation Modals**
**מטרה**: אישור פעולות מסוכנות
**מיקום**: `trading-ui/scripts/warning-system.js`
**שימוש**: מחיקה, ביטול, פעולות הרסניות
**תכונות**: הודעות מותאמות אישית

### 4. **Import File Modal** (executions page)
**מטרה**: ייבוא נתונים מקובץ
**מיקום**: `trading-ui/scripts/import-user-data.js`
**שימוש**: עמוד executions
**תכונות**: העלאת קובץ, ולידציה, עיבוד נתונים

---

## 📋 דפוסי שדות נפוצים

### שדות בסיסיים:
1. **TextField** - שדות טקסט פשוטים
2. **NumberField** - שדות מספריים (עם min/max/step)
3. **SelectField** - רשימות בחירה
4. **DateField** - שדות תאריך (datetime-local)
5. **TextareaField** - טקסט ארוך
6. **CheckboxField** - תיבות סימון

### שדות מיוחדים:
1. **AccountSelectField** - בחירת חשבון מסחר (עם SelectPopulator)
2. **TickerSelectField** - בחירת טיקר (עם חיפוש)
3. **CurrencySelectField** - בחירת מטבע (עם העדפות)
4. **CalculatedField** - שדות מחושבים (read-only)
5. **FileUploadField** - העלאת קבצים (לוגו טיקר)

### דפוסי עיצוב:
1. **2 עמודות** - רוב המודלים (col-md-6)
2. **3 עמודות** - מודלים מורכבים (col-md-4)
3. **עמודה אחת** - שדות ארוכים (col-md-12)
4. **Tabs** - trade_plans (פרטים בסיסיים + תנאים)

---

## 🎨 דפוסי עיצוב כותרות

### סוגי כותרות:
1. **modal-header-colored** - ירוק (ברירת מחדל)
2. **modal-header-danger** - אדום (מחיקה)
3. **modal-header-success** - ירוק (תוכניות)
4. **modal-header-info** - כחול (טיקרים)
5. **modal-header-warning** - אדום (התראות)

### גדלי מודלים:
1. **modal-lg** - רוב המודלים (Add/Edit)
2. **modal-xl** - מודלים מורכבים (alerts, linked items)
3. **modal-dialog-centered** - מודלים קטנים (loading, confirm)

---

## 🔄 דפוסי פעולה

### כפתורי פעולה:
1. **data-button-type="CLOSE"** - כפתור סגירה (משמאל למעלה)
2. **data-button-type="CANCEL"** - ביטול (בפוטר)
3. **data-button-type="SAVE"** - שמירה (בפוטר)
4. **data-button-type="DELETE"** - מחיקה (בפוטר)

### זרימת פעולות:
1. **Add**: פתיחת מודל → מילוי → ולידציה → שמירה → רענון
2. **Edit**: פתיחת מודל → טעינת נתונים → עריכה → ולידציה → שמירה → רענון
3. **Delete**: בדיקת linked items → אישור → מחיקה → רענון
4. **View**: פתיחת EntityDetailsModal → הצגת מידע

---

## 📊 סטטיסטיקות

### כמות קוד:
- **HTML כפול**: ~2500 שורות (2 מודלים לכל עמוד)
- **JavaScript כפול**: ~1500 שורות (פונקציות modal נפרדות)
- **CSS כפול**: ~300 שורות (סגנונות דומים)

### מורכבות לפי עמוד:
- **פשוטים**: cash_flows, notes (2 עמודים)
- **בינוניים**: trading_accounts, tickers, executions (3 עמודים)
- **מורכבים**: alerts, trade_plans, trades (3 עמודים)

### פוטנציאל חיסכון:
- **HTML**: 90% פחות (מודל אחד במקום שניים)
- **JavaScript**: 70% פחות (פונקציה אחת במקום שתיים)
- **CSS**: 60% פחות (סגנונות מאוחדים)
- **תחזוקה**: 80% פחות (single source of truth)

---

## 🎯 המלצות לארכיטקטורה חדשה

### עקרונות עיצוב:
1. **חיסכון במקום** - כותרות וכפתורים לא גדולים מידי
2. **ריווח מינימלי** - spacing tight בין אלמנטים
3. **2-3 עמודות** - שדות מאורגנים (לא עמודה אחת)
4. **רוחב אחיד** - שדות טקסט בגודל אחיד
5. **עקביות מלאה** - עיצוב זהה בין מודלים
6. **רספונסיבי** - תמיכה מלאה במכשירים ניידים

### דרישות טכניות:
1. **ITCSS** - אפס inline styles או !important
2. **מערכת צבעים דינמית** - חיבור להעדפות משתמש
3. **מערכת כפתורים מרכזית** - data-button-type
4. **RTL מלא** - ימין = תחילה, כפתורים משמאל
5. **סגירה על רקע** - data-bs-backdrop="true"

---

**המסמך מוכן לשימוש בתכנון מערכת המודלים המרכזית החדשה.**

# אינדקס פונקציות – מערכת ייבוא נתונים

## סקירה כללית
אינדקס מלא של כל הפונקציות במערכת ייבוא הנתונים, מאורגן לפי קטגוריות.

**עדכון אחרון**: ינואר 2025

---

## Frontend – `trading-ui/scripts/import-user-data.js`

### ניהול מצב (State Management)

#### `createEmptyProblemState()`
- **תיאור**: יוצר אובייקט מצב ריק לבעיות
- **פלט**: `Object` עם Maps לכל סוג בעיה
- **שימוש**: אתחול מצב בעיות

#### `clearProblemTrackingState()`
- **תיאור**: מנקה את מצב מעקב הבעיות
- **פלט**: `void`
- **שימוש**: איפוס לפני ניתוח חדש

#### `resetImportModalState()`
- **תיאור**: מאפס את כל מצב המודול
- **פלט**: `void`
- **שימוש**: איפוס מלא של המודול

#### `clearStoredActiveSession()`
- **תיאור**: מנקה את הסשן הפעיל מ-localStorage
- **פלט**: `void`
- **שימוש**: ניקוי אחרי ייבוא מוצלח

#### `restoreActiveSessionFromStorage()`
- **תיאור**: משחזר סשן פעיל מ-localStorage
- **פלט**: `Promise<void>`
- **שימוש**: טעינת סשן קיים בפתיחת המודול

---

### ניהול מודול (Modal Management)

#### `getImportModalElement()`
- **תיאור**: מחזיר את אלמנט המודול הראשי
- **פלט**: `HTMLElement | null`
- **שימוש**: גישה למודול

#### `openImportUserDataModal()`
- **תיאור**: פותח את מודול הייבוא
- **פלט**: `Promise<void>`
- **שימוש**: פתיחת המודול

#### `closeImportUserDataModal()`
- **תיאור**: סוגר את מודול הייבוא
- **פלט**: `void`
- **שימוש**: סגירת המודול

#### `showAccountLinkingModal()`
- **תיאור**: פותח את מודול שיוך החשבון
- **פלט**: `Promise<void>`
- **שימוש**: הצגת מודול שיוך

#### `hideAccountLinkingModal(options)`
- **תיאור**: מסתיר את מודול שיוך החשבון
- **פרמטרים**: `options` – אופציות סגירה
- **פלט**: `void`
- **שימוש**: סגירת מודול שיוך

---

### ניהול חשבון (Account Management)

#### `getSelectedAccountDisplayName()`
- **תיאור**: מחזיר את שם החשבון הנבחר
- **פלט**: `string`
- **שימוש**: הצגת שם חשבון

#### `setLinkedAccountInfo(account)`
- **תיאור**: מגדיר את פרטי החשבון המקושר
- **פרמטרים**: `account` – אובייקט חשבון
- **פלט**: `void`
- **שימוש**: עדכון פרטי חשבון

#### `updateAccountDetectionSummary(statusOverride)`
- **תיאור**: מעדכן את סיכום זיהוי החשבון
- **פרמטרים**: `statusOverride` – סטטוס חלופי (אופציונלי)
- **פלט**: `void`
- **שימוש**: עדכון תצוגת זיהוי חשבון

#### `loadAccountsForLinking(targetSelect)`
- **תיאור**: טוען רשימת חשבונות לשיוך
- **פרמטרים**: `targetSelect` – אלמנט select
- **פלט**: `Promise<void>`
- **שימוש**: מילוי רשימת חשבונות

---

### ניהול קבצים (File Management)

#### `handleFileSelect(event)`
- **תיאור**: מטפל בבחירת קובץ
- **פרמטרים**: `event` – אירוע בחירת קובץ
- **פלט**: `Promise<void>`
- **שימוש**: טעינת קובץ

#### `runFilePrecheck(file, connectorValueOverride)`
- **תיאור**: מריץ בדיקת קובץ מקדימה
- **פרמטרים**: 
  - `file` – קובץ לבדיקה
  - `connectorValueOverride` – ספק חלופי (אופציונלי)
- **פלט**: `Promise<void>`
- **שימוש**: בדיקת תקינות קובץ

#### `triggerFilePrecheckIfReady(options)`
- **תיאור**: מפעיל precheck אם הקובץ מוכן
- **פרמטרים**: `options` – אופציות (אופציונלי)
- **פלט**: `Promise<void>`
- **שימוש**: בדיקה אוטומטית

#### `getFilePrecheckStatus()`
- **תיאור**: מחזיר את סטטוס ה-precheck
- **פלט**: `Object` עם `status` ו-`message`
- **שימוש**: בדיקת סטטוס

#### `setFilePrecheckStatus(status, message)`
- **תיאור**: מגדיר את סטטוס ה-precheck
- **פרמטרים**: 
  - `status` – סטטוס ('idle' | 'pending' | 'success' | 'error')
  - `message` – הודעה
- **פלט**: `void`
- **שימוש**: עדכון סטטוס

---

### ניתוח נתונים (Data Analysis)

#### `analyzeFile()`
- **תיאור**: מפעיל ניתוח קובץ
- **פלט**: `Promise<void>`
- **שימוש**: תחילת תהליך הייבוא

#### `displayAnalysisResults(data)`
- **תיאור**: מציג את תוצאות הניתוח
- **פרמטרים**: `data` – נתוני ניתוח
- **פלט**: `void`
- **שימוש**: הצגת תוצאות

#### `displayProblemResolutionDetailed(data)`
- **תיאור**: מציג פתרון בעיות מפורט
- **פרמטרים**: `data` – נתוני בעיות
- **פלט**: `void`
- **שימוש**: הצגת בעיות

---

### פתרון בעיות (Problem Resolution)

#### `displayWithinFileDuplicates(duplicates)`
- **תיאור**: מציג כפילויות בקובץ
- **פרמטרים**: `duplicates` – רשימת כפילויות
- **פלט**: `void`
- **שימוש**: הצגת כפילויות

#### `renderDuplicateRow(duplicate)`
- **תיאור**: מציג שורת כפילות בטבלה
- **פרמטרים**: `duplicate` – אובייקט כפילות
- **פלט**: `HTMLElement`
- **שימוש**: רנדור שורת כפילות

#### `deduplicateDuplicateRecords(records)`
- **תיאור**: מסיר כפילויות לוגיות מרשומות
- **פרמטרים**: `records` – רשימת רשומות
- **פלט**: `Array` – רשומות ללא כפילויות
- **שימוש**: ניקוי כפילויות

#### `acceptDuplicate(recordIndex, duplicateType)`
- **תיאור**: מאשר כפילות לייבוא
- **פרמטרים**: 
  - `recordIndex` – מזהה רשומה
  - `duplicateType` – סוג כפילות
- **פלט**: `Promise<void>`
- **שימוש**: אישור כפילות

#### `rejectDuplicate(recordIndex, duplicateType)`
- **תיאור**: דוחה כפילות
- **פרמטרים**: 
  - `recordIndex` – מזהה רשומה
  - `duplicateType` – סוג כפילות
- **פלט**: `Promise<void>`
- **שימוש**: דחיית כפילות

#### `getPreviewRecordIndex(recordOrWrapper)`
- **תיאור**: מחלץ `record_index` מרשומה
- **פרמטרים**: `recordOrWrapper` – רשומה או wrapper
- **פלט**: `number | null`
- **שימוש**: חילוץ מזהה

---

### תצוגה מקדימה (Preview)

#### `displayPreviewData(data)`
- **תיאור**: מציג נתוני תצוגה מקדימה
- **פרמטרים**: `data` – נתוני תצוגה
- **פלט**: `void`
- **שימוש**: הצגת תצוגה מקדימה

#### `refreshPreviewData()`
- **תיאור**: מרענן נתוני תצוגה מקדימה
- **פלט**: `Promise<void>`
- **שימוש**: עדכון תצוגה אחרי שינויים

---

### ייבוא (Import)

#### `performImport(generateReport)`
- **תיאור**: מבצע את הייבוא הסופי
- **פרמטרים**: `generateReport` – האם ליצור דוח (אופציונלי)
- **פלט**: `void`
- **שימוש**: ביצוע ייבוא

---

### שיוך חשבון (Account Linking)

#### `isAccountLinkingRequiredResponse(data)`
- **תיאור**: בודק אם נדרש שיוך חשבון
- **פרמטרים**: `data` – תגובת API
- **פלט**: `boolean`
- **שימוש**: בדיקת צורך בשיוך

#### `handleAccountLinkingBlockingResponse(data, contextLabel)`
- **תיאור**: מטפל בתגובת שיוך חשבון חוסמת
- **פרמטרים**: 
  - `data` – תגובת API
  - `contextLabel` – תווית הקשר (אופציונלי)
- **פלט**: `boolean` – האם נחסם
- **שימוש**: טיפול בחסימת שיוך

#### `handleAccountLinkRequired(response)`
- **תיאור**: מטפל בדרישת שיוך חשבון
- **פרמטרים**: `response` – תגובת API
- **פלט**: `Promise<void>`
- **שימוש**: טיפול בדרישה

#### `updateAccountLinkingModalContent(linkInfo)`
- **תיאור**: מעדכן את תוכן מודול השיוך
- **פרמטרים**: `linkInfo` – פרטי שיוך (אופציונלי)
- **פלט**: `void`
- **שימוש**: עדכון מודול

#### `submitAccountLinkSelection(forceOverride)`
- **תיאור**: שולח בחירת שיוך חשבון
- **פרמטרים**: `forceOverride` – האם לכפות (אופציונלי)
- **פלט**: `Promise<void>`
- **שימוש**: שמירת שיוך

#### `confirmAutoLinkedAccount()`
- **תיאור**: מאשר שיוך אוטומטי
- **פלט**: `Promise<void>`
- **שימוש**: אישור שיוך אוטומטי

#### `resumeImportFlowAfterLinking(taskType)`
- **תיאור**: ממשיך את תהליך הייבוא אחרי שיוך
- **פרמטרים**: `taskType` – סוג תהליך
- **פלט**: `Promise<void>`
- **שימוש**: המשך תהליך

---

### ניווט (Navigation)

#### `goToStep(step)`
- **תיאור**: עובר לשלב מסוים
- **פרמטרים**: `step` – מספר שלב
- **פלט**: `void`
- **שימוש**: ניווט בין שלבים

#### `updateImportProgressBar(step)`
- **תיאור**: מעדכן את פס ההתקדמות
- **פרמטרים**: `step` – מספר שלב
- **פלט**: `void`
- **שימוש**: עדכון התקדמות

---

### עזרים (Utilities)

#### `resolveCashflowTypeLabel(cashflowType)`
- **תיאור**: מחזיר תווית לסוג תזרים
- **פרמטרים**: `cashflowType` – סוג תזרים
- **פלט**: `string`
- **שימוש**: הצגת סוג תזרים

#### `getTradingAccountName(accountId)`
- **תיאור**: מחזיר שם חשבון מסחר
- **פרמטרים**: `accountId` – מזהה חשבון
- **פלט**: `Promise<string | null>`
- **שימוש**: קבלת שם חשבון

#### `showImportUserDataNotification(message, type)`
- **תיאור**: מציג הודעת ייבוא
- **פרמטרים**: 
  - `message` – הודעה
  - `type` – סוג ('success' | 'error' | 'info' | 'warning')
- **פלט**: `void`
- **שימוש**: הצגת הודעות

---

## Backend – `Backend/services/user_data_import/import_orchestrator.py`

### ImportOrchestrator Class

#### `__init__(db_session, user_id)`
- **תיאור**: מאתחל את ה-Orchestrator
- **פרמטרים**: 
  - `db_session` – סשן DB
  - `user_id` – מזהה משתמש
- **פלט**: `None`

#### `create_import_session(provider, file_name, task_type, account_id)`
- **תיאור**: יוצר סשן ייבוא חדש
- **פרמטרים**: 
  - `provider` – ספק ('IBKR', 'Demo')
  - `file_name` – שם קובץ
  - `task_type` – סוג תהליך
  - `account_id` – מזהה חשבון (אופציונלי)
- **פלט**: `ImportSession`
- **שימוש**: יצירת סשן חדש

#### `analyze_file(file_content, file_name, provider, task_type, user_id)`
- **תיאור**: מנתח קובץ ייבוא
- **פרמטרים**: 
  - `file_content` – תוכן קובץ
  - `file_name` – שם קובץ
  - `provider` – ספק
  - `task_type` – סוג תהליך
  - `user_id` – מזהה משתמש
- **פלט**: `Dict[str, Any]` – תוצאות ניתוח
- **שימוש**: ניתוח קובץ

#### `generate_preview(session_id, task_type)`
- **תיאור**: יוצר תצוגה מקדימה
- **פרמטרים**: 
  - `session_id` – מזהה סשן
  - `task_type` – סוג תהליך
- **פלט**: `Dict[str, Any]` – נתוני תצוגה
- **שימוש**: יצירת תצוגה מקדימה

#### `execute_import(session_id, task_type)`
- **תיאור**: מבצע את הייבוא
- **פרמטרים**: 
  - `session_id` – מזהה סשן
  - `task_type` – סוג תהליך
- **פלט**: `Dict[str, Any]` – תוצאות ייבוא
- **שימוש**: ביצוע ייבוא

#### `link_trading_account_to_file(session_id, trading_account_id, confirm_overwrite)`
- **תיאור**: משייך חשבון מסחר לקובץ
- **פרמטרים**: 
  - `session_id` – מזהה סשן
  - `trading_account_id` – מזהה חשבון מסחר
  - `confirm_overwrite` – האם לאשר דריסה (אופציונלי)
- **פלט**: `Dict[str, Any]` – תוצאות שיוך
- **שימוש**: שיוך חשבון

---

### SessionManager Class

#### `get_latest_active_session(statuses)`
- **תיאור**: מחזיר את הסשן הפעיל האחרון
- **פרמטרים**: `statuses` – רשימת סטטוסים (אופציונלי)
- **פלט**: `ImportSession | None`
- **שימוש**: מציאת סשן פעיל
- **הערה**: מסנן סשנים ישנים (יותר מ-24 שעות) וסשנים ללא `created_at`

#### `cleanup_old_sessions(days)`
- **תיאור**: מנקה סשנים ישנים
- **פרמטרים**: `days` – מספר ימים לשמירה
- **פלט**: `int` – מספר סשנים שנמחקו
- **שימוש**: ניקוי תקופתי

---

## API Endpoints – `Backend/routes/api/user_data_import.py`

### `POST /api/user-data-import/precheck`
- **תיאור**: בדיקת קובץ מקדימה
- **פרמטרים**: `file` – קובץ לבדיקה
- **פלט**: `JSON` – תוצאות בדיקה
- **שימוש**: בדיקת תקינות קובץ

### `POST /api/user-data-import/upload`
- **תיאור**: העלאת קובץ וניתוח
- **פרמטרים**: 
  - `file` – קובץ
  - `import_task` – סוג תהליך
- **פלט**: `JSON` – תוצאות ניתוח
- **שימוש**: תחילת תהליך ייבוא

### `GET /api/user-data-import/session/{id}/analyze`
- **תיאור**: ניתוח סשן קיים
- **פרמטרים**: `id` – מזהה סשן
- **פלט**: `JSON` – תוצאות ניתוח
- **שימוש**: ניתוח מחדש

### `GET /api/user-data-import/session/{id}/preview`
- **תיאור**: קבלת תצוגה מקדימה
- **פרמטרים**: `id` – מזהה סשן
- **פלט**: `JSON` – נתוני תצוגה
- **שימוש**: הצגת תצוגה מקדימה

### `POST /api/user-data-import/session/{id}/execute`
- **תיאור**: ביצוע ייבוא
- **פרמטרים**: `id` – מזהה סשן
- **פלט**: `JSON` – תוצאות ייבוא
- **שימוש**: ביצוע ייבוא סופי

### `POST /api/user-data-import/session/{id}/refresh-preview`
- **תיאור**: רענון תצוגה מקדימה
- **פרמטרים**: `id` – מזהה סשן
- **פלט**: `JSON` – נתוני תצוגה מעודכנים
- **שימוש**: עדכון תצוגה אחרי שינויים

### `POST /api/user-data-import/session/{id}/accept-duplicate`
- **תיאור**: אישור כפילות
- **פרמטרים**: 
  - `id` – מזהה סשן
  - `record_index` – מזהה רשומה
  - `duplicate_type` – סוג כפילות
- **פלט**: `JSON` – תוצאות
- **שימוש**: אישור כפילות

### `POST /api/user-data-import/session/{id}/reject-duplicate`
- **תיאור**: דחיית כפילות
- **פרמטרים**: 
  - `id` – מזהה סשן
  - `record_index` – מזהה רשומה
  - `duplicate_type` – סוג כפילות
- **פלט**: `JSON` – תוצאות
- **שימוש**: דחיית כפילות

### `POST /api/user-data-import/session/{id}/account-link/select`
- **תיאור**: בחירת שיוך חשבון
- **פרמטרים**: 
  - `id` – מזהה סשן
  - `trading_account_id` – מזהה חשבון מסחר
  - `confirm_overwrite` – האם לאשר דריסה (אופציונלי)
- **פלט**: `JSON` – תוצאות שיוך
- **שימוש**: שיוך חשבון ידני

### `POST /api/user-data-import/session/{id}/account-link/confirm`
- **תיאור**: אישור שיוך אוטומטי
- **פרמטרים**: `id` – מזהה סשן
- **פלט**: `JSON` – תוצאות אישור
- **שימוש**: אישור שיוך אוטומטי

### `GET /api/user-data-import/session/{id}/account-link/status`
- **תיאור**: קבלת סטטוס שיוך
- **פרמטרים**: `id` – מזהה סשן
- **פלט**: `JSON` – סטטוס שיוך
- **שימוש**: בדיקת סטטוס

---

## קישורים

- [מדריך מפתחים מלא](USER_DATA_IMPORT_DEVELOPER_GUIDE.md)
- [תיעוד ארכיטקטורה](user-data-import-system.md)
- [מדריך JSDoc](../../06-CODING_STANDARDS/jsdoc-guide.md)

---

**עדכון אחרון**: ינואר 2025


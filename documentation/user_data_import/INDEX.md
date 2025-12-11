# User Data Import - Documentation Index

## סקירה כללית

תיקייה זו מכילה את כל הדוקומנטציה הטכנית של תהליך ייבוא נתונים מקובצי IBKR.

## מסמכי הליבה

### 1. IMPORT_DATA_FLOW.md

**תיאור**: זרימת המידע המלאה בתהליך הייבוא, מהעלאת הקובץ ועד לשמירה בבסיס הנתונים.

**תוכן**:

- שלב 1: Upload & Session Creation
- שלב 2: File Analysis
- שלב 3: Preview Generation
- שלב 4: Import Execution
- State Management (Backend + Frontend)
- Validation Points

**קישור**: [IMPORT_DATA_FLOW.md](./IMPORT_DATA_FLOW.md)

### 2. RECORD_CLASSIFICATION.md

**תיאור**: לוגיקת זיהוי וסיווג רשומות תזרימי מזומנים מקובץ IBKR.

**תוכן**:

- כלל 1: עמודה שנייה חייבת להיות "Data"
- כלל 2: מיפוי ישיר משם סקציה ל-cashflow_type
- CASHFLOW_SECTION_NAMES mapping
- מקרים מיוחדים (Deposits, Interest, Transfers, Borrow Fee)
- סקציות שמוסרות (dividend_accrual, interest_accrual, syep_activity, syep_interest, cash_report)

**קישור**: [RECORD_CLASSIFICATION.md](./RECORD_CLASSIFICATION.md)

### 3. CURRENCY_EXCHANGE_IMPORT.md

**תיאור**: תהליך ייבוא רשומות המרות מטבע, תוך עקיבה אחר המבנה של יצירה ידנית.

**תוכן**:

- מבנה סטנדרטי (עקוב אחר CashFlowService.create_exchange)
- תהליך הייבוא (5 שלבים)
- חישוב נכון (to_amount, fee_amount)
- Atomic Operations
- Validation

**קישור**: [CURRENCY_EXCHANGE_IMPORT.md](./CURRENCY_EXCHANGE_IMPORT.md)

### 4. FILTERING_MECHANISM.md

**תיאור**: מנגנון הסינון לפי `selected_types` עם 3 נקודות סינון להבטחת דיוק 100%.

**תוכן**:

- נקודה 1: _build_preview_payload
- נקודה 2: execute_import
- נקודה 3: _execute_import_cashflows
- State Management (Backend + Frontend)
- דוגמאות וסקריפטי validation

**קישור**: [FILTERING_MECHANISM.md](./FILTERING_MECHANISM.md)

## קבצי קוד מרכזיים

### Backend

1. **`Backend/services/user_data_import/import_orchestrator.py`**
   - תהליך הייבוא המרכזי
   - Function Index: 55+ פונקציות
   - 3 נקודות סינון
   - Account linking
   - Duplicate handling

2. **`Backend/connectors/user_data_import/ibkr_connector.py`**
   - פרסור קובץ IBKR
   - `_identify_record_type()` - זיהוי סוג רשומה
   - `_parse_cashflow_sections()` - פרסור סקציות
   - `_build_forex_cashflows()` - יצירת רשומות Forex

3. **`Backend/services/user_data_import/import_validator.py`**
   - Validation לפני ייבוא
   - `validate_cashflow_record()` - Validation רשומה בודדת
   - `validate_exchange_pair()` - Validation זוג Exchange

4. **`Backend/services/cash_flow_service.py`**
   - `create_regular_cash_flow()` - יצירת רשומה רגילה
   - `create_exchange()` - יצירת זוג Exchange (atomic)

### Frontend

1. **`trading-ui/scripts/import-user-data.js`**
   - Import modal
   - State management (`selectedCashflowTypes`)
   - Account linking UI
   - Preview display

## Tests

### Unit Tests

1. **`Backend/tests/test_ibkr_connector_classification.py`**
   - בדיקת `_identify_record_type()`
   - סיווג נכון של כל סוגי הרשומות

2. **`Backend/tests/test_import_orchestrator_filtering.py`**
   - בדיקת 3 נקודות הסינון
   - וידוא `selected_types` נשמר נכון

3. **`Backend/tests/test_currency_exchange_import.py`**
   - בדיקת זיווג Forex
   - בדיקת יצירה אטומית

### Integration Tests

1. **`Backend/tests/test_import_end_to_end.py`**
   - תסריטים מלאים: Upload → Preview → Execute
   - בדיקת session resumption

## Validation Scripts

1. **`Backend/scripts/validate_import_session.py`**
   - בדיקת סשן ספציפי
   - השוואה בין preview ל-database

2. **`Backend/scripts/compare_import_vs_database.py`**
   - השוואה מפורטת בין preview ל-database
   - זיהוי אי-התאמות

3. **`Backend/scripts/test_filtering_logic.py`**
   - בדיקת לוגיקת סינון
   - וידוא `selected_types` נשמר

## עקרונות יסוד

### 1. עמודה שנייה חייבת להיות "Data"

רק שורות עם פורמט `{Section Name},Data,...` הן רשומות תקפות.

### 2. 3 נקודות סינון

- `_build_preview_payload`: סינון ראשוני
- `execute_import`: Double-check filtering
- `_execute_import_cashflows`: Final check

### 3. Atomic Operations

FROM + TO נוצרים יחד או לא נוצרים כלל (על ידי `CashFlowHelperService.create_exchange()`).

### 4. State Management

`selected_types` נשמר ב-`preview_data` לפני commit ונשלח מה-Frontend ב-API calls.

## קישורים חיצוניים

- [Main Documentation Index](../../INDEX.md)
- [General Systems List](../../frontend/GENERAL_SYSTEMS_LIST.md)
- [Pages List](../../PAGES_LIST.md)

## דוח מצב

### STATUS_REPORT.md

**תיאור**: דוח מצב מקיף על תהליכי הייבוא, כולל בעיות ידועות, תהליכי בדיקה, וכפתור המחיקה.

**תוכן**:

- בעיות ידועות (5 בעיות)
- תהליכי בדיקה (3 בדיקות)
- כפתור מחיקת רשומות מייבוא (פירוט מלא)
- קישורים לתיעוד
- המלצות לפעולה
- עדכונים אחרונים (כולל תגיות, פישוט, עדכון UI דינמי)

**קישור**: [STATUS_REPORT.md](./STATUS_REPORT.md)

## מדריך מפתח עתידי

### DEVELOPER_GUIDE.md

**תיאור**: מדריך מקיף למפתח העתידי - איך להרחיב ולתחזק את מערכת הייבוא ללא שבירת הארכיטקטורה.

**תוכן**:

- סקירה כללית וארכיטקטורה
- שלבי התהליך (4 שלבים)
- מערכות כלליות - חובה להשתמש
- תגיות אוטומטיות
- ניהול מודולים
- עדכון UI דינמי
- טיפול בבעיות נפוצות
- כללי פיתוח
- תהליך הוספת תכונה חדשה

**קישור**: [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)

## עדכונים אחרונים

- **2025-01-30**: יצירת מדריך מפתח עתידי מקיף (DEVELOPER_GUIDE.md)
- **2025-01-30**: עדכון מקיף של כל התיעוד עם שינויים אחרונים
- **2025-01-30**: פישוט פתיחת מודול - הסרת תהליכים מורכבים
- **2025-01-30**: עדכון UI דינמי - רשימת טיקרים מתעדכנת מיד
- **2025-01-30**: ניטור מפורט - ניטור מלא של כל תהליך השמירה והעדכון
- **2025-01-30**: הוספת תגיות אוטומטיות לרשומות ייבוא
- **2025-01-16**: יצירת דוח מצב מקיף (STATUS_REPORT.md)
- **2025-01-16**: יצירת מסמכי דוקומנטציה מלאים
- **2025-01-16**: הוספת Function Index ל-`import_orchestrator.py`
- **2025-01-16**: תיעוד 3 נקודות סינון
- **2025-01-16**: תיעוד תהליך ייבוא Forex


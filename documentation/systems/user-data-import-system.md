# מערכת ייבוא נתוני משתמש - תיעוד טכני

## סקירה כללית

מערכת ייבוא נתוני משתמש מאפשרת ייבוא ביצועים (executions) מקבצי CSV של ברוקרים שונים, עם דגש על IBKR בשלב ראשון. החל ממהדורת 2025-11 המערכת מורחבת לתזרים מזומנים (cashflows) ולתהליך בדיקת חשבון (account reconciliation) במסגרת ארכיטקטורת **Orchestrator + Task Plugins**. המערכת כוללת שכבות פריסה מלאות (Parsing → Normalization → Validation → Duplicate Detection → Preview → Execution), זיהוי כפילויות חכם, טיפול בבעיות לפי סוג תהליך, ואישור סופי עם תצוגה מקדימה.

## ארכיטקטורה

### מבנה קבצים

```
Backend/
├── models/
│   └── import_session.py              # מודל ImportSession
├── connectors/user_data_import/
│   ├── __init__.py
│   ├── base_connector.py              # מחלקת אב
│   ├── ibkr_connector.py              # קונקטור IBKR
│   └── demo_connector.py              # קונקטור דמה
├── services/user_data_import/
│   ├── __init__.py
│   ├── import_orchestrator.py         # תיאום התהליך
│   ├── normalization_service.py       # נורמליזציה
│   ├── validation_service.py          # וולידציה
│   └── duplicate_detection_service.py # זיהוי כפילויות
└── routes/api/
    └── user_data_import.py            # API endpoints

trading-ui/
├── pages/
│   └── import-user-data.html          # עמוד ייבוא
├── scripts/
│   └── import-user-data.js            # לוגיקה
└── styles/
    └── import-user-data.css           # עיצוב
```

### זרימת נתונים

```
File Upload → Data Type Selection → Task Dispatch →
Parsing → Normalization → Validation →
Duplicate / Integrity Checks → Problem Resolution →
Preview & Summary → User Confirmation →
Task-specific Execution → Database Storage & Reporting
```

### פריסת תהליכים (Task Plugins)

| שלב | Executions | Cashflows | Account Reconciliation |
| --- | --- | --- | --- |
| Parsing | קריאת מקטע TRADES | קריאת מקטעים: Cash Report, Interest, Deposits/Withdrawals, Dividends | קריאת Account Information, BaseCurrency, Entitlements |
| Normalization | `symbol`, `action`, `quantity`, `price`, `fee`, DateEnvelope | `cashflow_type`, `amount`, `currency`, `effective_date`, `source_account`, `target_account`, `asset_symbol` | `account_id`, `base_currency`, `margin_status`, `missing_documents`, `account_aliases` |
| Validation | צד העסקה, שדות חובה, סכומים חיוביים | סכומים ≠ 0, מטבע מזוהה, שיוך חשבון, סיווג תזרים | קיום חשבון במערכת, התאמת מטבע בסיס, וולידציה מול הרשאות קיימות |
| Duplicate Detection / Integrity | exact external_id, 5/5 match | התאמה לפי (`cashflow_type`, `amount`, `effective_date`, `currency`, `source_account`) | איתור חשבונות חסרים/חסומים, שינויים קריטיים במטבע |
| Summary Outputs | `analysis_results`, `duplicate_details`, `missing_tickers` | `cashflow_records`, `cashflow_summary`, `cashflow_duplicates`, `missing_accounts` | `account_validation_results`, `reconciliation_flags`, `missing_accounts` |
| Problem Resolution UI | Missing tickers, duplicates, existing records | Cashflow issues: חשבונות חסרים, כפילויות, מטבע לא תואם | Account reconciliation issues: בסיס מטבע, הרשאות חסרות, שמות חשבון |
| Execution | יצירת `Execution` | יצירת `CashFlow` / `CashFlowAdjustment` | עדכון טבלת `trading_accounts`, יצירת דוח סטיות (ללא שינוי נתונים אם יש שגיאות) |

### זרימת נתונים בין שלבים

המערכת משתמשת ב-**Unified Cache Manager** ובמסד הנתונים לשמירת נתונים בין השלבים:

1. **שלב 1-2**: העלאת קובץ ובחירת חשבון
   - יצירת `ImportSession` בבסיס הנתונים
   - שמירת `file_content` ו-`account_id` ב-session

2. **שלב 2.5**: מסך מעבר (Loading Overlay)
   - לאחר לחיצה על "המשך לניתוח" נפתח ממשק טעינה אחיד (`ProcessingOverlay`).
   - תכולה: כותרת "טוען ומעבד נתונים", Progress Bar אנימטיבי (Bootstrap), לוגים קצרים בזמן אמת (Client + Server), הודעת ביטול (Disabled).
   - הממשק ננעל עד קבלת תשובה מהשרת או הודעת שגיאה, ומאפשר שקיפות לגבי זמן העיבוד (לרבות Multi-Task).

3. **שלב 3**: ניתוח קובץ (Task-specific)
   - קריאה ל-`/api/user-data-import/upload`
   - פרמטר חובה חדש: `import_task` (`executions`/`cashflows`/`account_reconciliation`)
   - השרת מחזיר `session_id`, `analysis_results`, ושדות ייעודיים (לדוגמה `cashflow_summary`, `account_reconciliation_summary`)
   - הנתונים נשמרים ב-`ImportSession.summary_data` (JSON) + ב-Unified Cache Manager לפי סוג תהליך

4. **שלב 3**: פתרון בעיות (מפורט, משתנה לפי Task)
   - קריאה ל-`/api/user-data-import/session/{id}/preview` לקבלת נתוני הניתוח
   - הצגת בעיות בממשק אינטראקטיבי מפורט (ספציפי לסוג התהליך):
     - **טיקרים חסרים**: כרטיסים עם כפתור "הוסף טיקר"
     - **כפילויות בקובץ**: כרטיסים עם כפתורי "קבל"/"דחה"
     - **רשומות קיימות**: כרטיסים עם כפתורי "קבל"/"דחה"
     - **תזרימי מזומנים**: חשבונות חסרים, סוג תזרים לא ידוע, חוסר התאמת מטבע ⇒ כפתורי "שייך חשבון", "תקן מטבע"
     - **בדיקת חשבון**: בסיס מטבע לא תואם, חשבונות חסרי הרשאות, מסמכים חסרים ⇒ כפתורי "סמן כטופל", "פתח משימה"
   - כל כרטיס מציג פרטים מלאים: סמל, פעולה, כמות, מחיר, תאריך, עמלה
   - confidence scores לכפילויות עם אינדיקטור ויזואלי
   - ממשק להוספת טיקרים חדשים עם מודל Bootstrap
   - רענון אוטומטי של התצוגה לאחר פעולות המשתמש

5. **שלב 4**: תצוגה מקדימה
   - קריאה ל-`/api/user-data-import/session/{id}/preview`
   - השרת מחזיר `preview_data` עם טבלאות מותאמות לתהליך (Executions, Cashflows, Account Issues)

6. **שלב 5**: אישור סופי
   - הצגת סיכום סופי
   - קריאה ל-`/api/user-data-import/session/{id}/execute` לביצוע הייבוא

## מודלים

### ImportSession

טבלה חדשה למעקב אחר סשני ייבוא:

```python
class ImportSession(BaseModel):
    __tablename__ = "import_sessions"
    
    account_id = Column(Integer, ForeignKey('trading_accounts.id'))
    provider = Column(String(50))           # "IBKR", "Demo"
    file_name = Column(String(255))
    total_records = Column(Integer)
    imported_records = Column(Integer)
    skipped_records = Column(Integer)
    status = Column(String(20))             # "analyzing", "ready", "importing", "completed", "failed"
    summary_data = Column(JSON)             # נתוני ניתוח מפורטים
    created_at = Column(DateTime)
    completed_at = Column(DateTime)
```

### Execution (קיים)

שדות חדשים שנוספו:

- `ticker_id`: קישור ישיר לטיקר (עדכון 2025-10-27)
- `trading_account_id`: קישור ישיר לחשבון מסחר (עדכון 2025-10-27)
- `trade_id`: קישור לעסקה (עכשיו nullable)
- `source`: מקור הנתונים ("ibkr_import", "demo_import", "manual", "api")
- `external_id`: מזהה חיצוני ייחודי לכל רשומה מיובאת
- `realized_pl`: רווח/הפסד ממומש סה"כ אחרי עמלות (Integer, nullable) (עדכון 2025-01-29)
- `mtm_pl`: רווח/הפסד ממומש סה"כ Mark-to-Market (Integer, nullable) (עדכון 2025-01-29)

**התנהגות שדות Realized P/L ו-MTM P/L**:
- **Realized P/L**:
  - בקנייה (`buy`): תמיד `NULL` (מושבת ב-UI)
  - במכירה (`sell`): חובה למלא (NOT NULL constraint)
- **MTM P/L**: 
  - בקנייה ובמכירה: רשות (nullable)
- **תהליך הייבוא**: IBKR מספק את הנתונים בעמודות 'Realized P/L' ו-'MTM P/L' - המערכת שומרת אותם ישירות

## קונקטורים

### Base Connector

מחלקת אב לכל הקונקטורים:

```python
class BaseImportConnector(ABC):
    @abstractmethod
    def detect_format(self, file_content: str) -> bool
    
    @abstractmethod
    def parse_file(self, file_content: str) -> List[Dict[str, Any]]
    
    @abstractmethod
    def normalize_record(self, raw_record: Dict[str, Any]) -> Dict[str, Any]
    
    def generate_external_id(self, record: Dict[str, Any]) -> str
    def validate_record(self, record: Dict[str, Any]) -> List[str]
```

### IBKR Connector

מטפל בקבצי IBKR Activity Statement ומיישם כעת Multi-Section parsing לפי Task:

| Task | מקטעים נצרכים | פונקציות Parsing עיקריות | פלט ראשוני |
| ---- | -------------- | ------------------------- | ----------- |
| `executions` | `Trades,Header` + `Trades,Data` | `_parse_trades_section` | רשומות ביצועים |
| `cashflows` | `Cash Report`, `Deposits & Withdrawals`, `Interest`, `Dividends`, `Withholding Tax` | `_parse_cash_report`, `_parse_interest`, `_parse_dividends`, `_parse_withdrawals` | רשומות תזרים עם סוג תזרים |
| `account_reconciliation` | `Account Information`, `Account Configuration`, `Base Currency`, `Account Summary` | `_parse_account_configuration`, `_parse_base_currency` | נתוני חשבון ומטבע בסיס |

#### אובייקטי נורמליזציה

- **ExecutionRecord**: כפי שהוגדר בעבר.
- **CashflowRecord**:
  ```python
  {
      "cashflow_type": "deposit" | "withdrawal" | "dividend" | "interest" | "fee" | "tax",
      "amount": 1250.45,
      "currency": "USD",
      "effective_date": datetime,
      "source_account": "U1234567",
      "target_account": "Brokerage",
      "asset_symbol": "AAPL",              # במידת הצורך
      "memo": "Dividend 2024-10",
      "external_id": "2024-10-01_dividend_USD_1250.45"
  }
  ```
- **AccountReconciliationRecord**:
  ```python
  {
      "account_id": "U1234567",
      "base_currency": "USD",
      "margin_status": "Reg T Margin",
      "entitlements": ["Stocks", "Options"],
      "missing_documents": ["W8BEN"],
      "account_aliases": ["Main IBKR"],
      "external_id": "U1234567_2024-10-31"
  }
  ```

### Demo Connector

לבדיקות ופיתוח:

- **פורמט**: CSV פשוט עם עמודות: symbol, action, date, quantity, price, fee
- **external_id**: `"demo_{row_number}"`

### סטנדרט תאריכים (DateEnvelope)

- הקונקטורים מחזירים `datetime` מודע לאיזור זמן (UTC), וה-`ImportOrchestrator` ממיר אותם ל-**DateEnvelope** באמצעות `DateNormalizationService`.
- נקודות הקצה ב-`production/Backend/routes/api/user_data_import.py` מחשבות את איזור הזמן של המשתמש ומריצות `_project_storage_payload` לפני החזרת JSON.
- ה-UI (ב-`production/trading-ui/scripts/import-user-data.js`) משתמש בפונקציות `renderImportDate()` ו-`showImportUserDataNotification()` כדי להציג תאריכים בהתאם להעדפות המשתמש ולמנוע לולאות במערכת ההודעות.

### Orchestrator + Task Plugins (2025-11)

- `ImportOrchestrator` מתפקד כמנהל תהליכים אחיד: הוא מאתר את הקונקטור, מריץ ניתוח ומפעיל **Task** ייעודי לכל סוג נתונים.
- כל Task מממש ממשק קבוע (`load_raw() → normalize() → validate() → persist()`) ונרשם ב-`tasks_registry`.
- מצב תהליכים:
  | מפתח | סטטוס | תיאור קצר |
  |------|-------|------------|
  | `executions` | זמין | ייבוא ביצועי מסחר (התהליך הקיים – כולל DateEnvelope וזרימת Preview מלאה). |
  | `cashflows` | פלייסהולדר | ייבוא תזרימי מזומנים (הפקדות, משיכות, ריביות, דיבידנדים) – ממתין למימוש Task ייעודי. |
  | `account_reconciliation` | פלייסהולדר | אימות מפרטי החשבון והמטבע הבסיסי מול נתוני המערכת. |
  | `portfolio_positions` | פלייסהולדר | השוואת פוזיציות פתוחות/NAV מול נתוני פורטפוליו פנימיים. |
  | `taxes_and_fx` | פלייסהולדר | ניתוח ריביות, מיסים ותרגומי מטבע, כולל איתור פערים. |
- UI: בשלב 2 של המודל מוצגת כעת בחירת התהליך. רק תהליכים במצב "זמין" מאפשרים מעבר לשלב הבא; תהליכים עתידיים מציגים הודעת פלייסהולדר ומפנים למסמך אפיון.

## שירותים

### Normalization Service

המרת נתונים גולמיים לפורמט אחיד לפי Task:

| Task | שדות חובה | שדות אופציונליים | הערות |
| ---- | ---------- | ---------------- | ------ |
| Executions | `symbol`, `action`, `date`, `quantity`, `price`, `fee`, `external_id`, `source` | `realized_pl`, `mtm_pl`, `currency`, `asset_category` | בהתאם לסטנדרט הקיים |
| Cashflows | `cashflow_type`, `amount`, `currency`, `effective_date`, `source_account`, `external_id`, `source` | `target_account`, `asset_symbol`, `memo`, `tax_country` | סכום ≠ 0, DateEnvelope מלא |
| Account Reconciliation | `account_id`, `base_currency`, `external_id`, `source` | `margin_status`, `entitlements`, `missing_documents`, `account_aliases`, `risk_profile` | מזהה חיצוני ייחודי לפי חשבון + תאריך דיווח |

### Validation Service

וולידציה מותאמת תהליך:

- Executions: כמתועד.
- Cashflows:
  - סכום חיובי/שלילי בהתאם לסוג (הפקדה חיובית, משיכה שלילית).
  - מטבע קיים במערכת (`currency_service`).
  - חשבון מקור נמצא במערכת; עבור קבלת מידע חסר הוספת פריט ל-`missing_accounts`.
  - סיווג תזרים מוכר (`cashflow_type`).
  - תאריך אפקטיבי תקין (`DateEnvelope`).
- Account Reconciliation:
  - חשבון קיים במערכת.
  - מטבע בסיס תואם להגדרת החשבון (או מסומן כחריגה).
  - רשימת הרשאות (entitlements) אינה ריקה – אחרת flagged.
  - מסמכים חסרים מדווחים ב-`missing_documents`.

### Duplicate Detection Service

זיהוי כפילויות מותאם לכל תהליך:

- Executions: exact external_id + 5/5 match (לפי ההגדרה הקיימת).
- Cashflows:
  - exact external_id.
  - התאמה על בסיס (`cashflow_type`, `effective_date (יום)`, `abs(amount)`, `currency`, `source_account`).
  - עבור דיבידנדים וריביות – השוואה גם לפי `asset_symbol`.
  - מייצרת מבנה `cashflow_duplicates` עם confidence score וסוג כפילות (`within_file`, `existing_records`).
- Account Reconciliation:
  - אין כפילות "נתון" אלא "חריגות". השירות מזהה:
    - חשבון שכבר עבר reconcile מאותו תאריך (`external_id` כפול).
    - סטטוס בסיס/הרשאות שכבר נמצא במערכת (Deep compare) ומסמן `unchanged`.
  - פלט: `reconciliation_flags` עם רשימת חריגות (חדש/מעודכן/חסר).

### Import Orchestrator

תיאום כל התהליך (עבור Task Plugins):

1. **יצירת סשן**: `create_import_session()` – שומר `task_type`, `parsed_sections`, `raw_metadata`.
2. **ניתוח קובץ**: `analyze_file(task_type)` – מפעיל Pipeline ייעודי ומחזיר שדות מותאמים (`analysis_results`, `cashflow_summary`, `reconciliation_summary`).
3. **הכנת תצוגה מקדימה**: `generate_preview(task_type)` – משחזר נתונים מהתהליך, מפיק סטטיסטיקות וטבלאות.
4. **ביצוע ייבוא**: `execute_import(task_type)` – מפעיל persister בהתאם (Executions → `Execution`, Cashflows → `CashFlow`/`CashFlowAdjustment`, Account Reconciliation → `AccountAuditReport`/עדכוני חשבון).
5. **דוחות לייב**: `create_live_report()` מעדכן כעת גם `cashflow_records`, `cashflow_duplicates`, `missing_accounts`, `account_reconciliation_flags`.

## ממשק משתמש - שלב 3: פתרון בעיות

### מבנה HTML

שלב 3 כולל 3 סעיפים נפרדים:

```html
<!-- Missing Tickers Section -->
<div class="problem-section" id="missingTickersSection">
    <h4><i class="bi bi-exclamation-circle"></i> סמלים חסרים</h4>
    <div class="problem-card-container" id="missingTickersContainer">
        <!-- Missing ticker cards will be populated here -->
    </div>
</div>

<!-- Within-File Duplicates Section -->
<div class="problem-section" id="withinFileDuplicatesSection">
    <h4><i class="bi bi-files"></i> כפילויות בקובץ</h4>
    <div class="problem-card-container" id="withinFileDuplicatesContainer">
        <!-- Within-file duplicate cards will be populated here -->
    </div>
</div>

<!-- Existing Records Section -->
<div class="problem-section" id="existingRecordsSection">
    <h4><i class="bi bi-exclamation-triangle"></i> רשומות קיימות במערכת</h4>
    <div class="problem-card-container" id="existingRecordsContainer">
        <!-- Existing record cards will be populated here -->
    </div>
</div>
```

### כרטיסי בעיות

כל כרטיס בעיה כולל:

1. **Header**: אייקון + סמל הטיקר
2. **Body**: פרטי הרשומה (פעולה, כמות, מחיר, תאריך)
3. **Confidence Bar**: אינדיקטור ויזואלי לרמת הביטחון
4. **Actions**: כפתורי פעולה (קבל/דחה, הוסף טיקר)

### מודל הוספת טיקר

```html
המודל להוספת טיקר איננו קוד מקומי – הוא משתמש במערכת המכלול של **ModalManagerV2** עם הקונפיגורציה הכללית `tickersModal`. הקריאה מתבצעת דרך `showModalSafe('tickersModal', 'add')`, ערכי ברירת המחדל מתמלאים אוטומטית (סמל, שם, סוג, מטבע) והפעולה נשענת על `saveTicker` של מודול הטיקרים הכללי. לאחר שמירה מוצלחת, `CRUDResponseHandler` סוגר את המודל והייבוא מרענן את ה-Preview מחדש.

### פונקציות JavaScript

#### `displayProblemResolutionDetailed(data)`
מציג את כל הבעיות בממשק מפורט עם כרטיסים אינטראקטיביים.

#### `renderMissingTickerCard(ticker)`
יוצר כרטיס לטיקר חסר עם כפתור "הוסף טיקר".

#### `renderDuplicateCard(duplicate, type, index)`
יוצר כרטיס לכפילות/רשומה קיימת עם כפתורי "קבל"/"דחה".

#### `acceptDuplicate(index, type)`
מקבל כפילות ומעדכן את התצוגה.

#### `rejectDuplicate(index, type)`
דוחה כפילות ומעדכן את התצוגה.

#### `prepareDataTypeSelection(results)`
מבצע איתור של סוגי נתונים בקובץ ומציג למשתמש את רשימת התהליכים (זמינים ופלייסהולדרים). נשען על `detectAvailableDataTypes` ומעדכן את ממשק שלב 2.

#### `confirmSelectedDataType()`
מאשר את סוג הייבוא שנבחר. אם התהליך זמין – ממשיך לשלב התצוגה המקדימה; אחרת מציג לאדמין הודעת פלייסהולדר ומפנה למסמך האפיון הרלוונטי.

#### `openAddTickerModal(symbol, currency)`
פותח את `tickersModal` דרך ModalManagerV2, ממלא מראש את הסמל והמטבע (כולל ניסיון להתאים קוד מטבע לערך הקיים ברשימת המטבעות) ומוודא שהקריאה ל-`saveTicker` של המערכת הכללית תוביל לרענון אוטומטי של תצוגת הייבוא.

#### `ensureTickerSaveHook()`
עוטף את `saveTicker` הכללי בקריאה חד-פעמית שמרעננת את תצוגת הייבוא (`refreshPreviewData`) לאחר שמירה מוצלחת של טיקר חדש.

#### `ensureTickersModalConfigLoaded()`
טוען דינמית את `modal-configs/tickers-config.js` מתוך `PACKAGE_MANIFEST` במקרה שהקובץ לא נטען מראש בעמוד, מאזין להצלחת הטעינה ומדווח על כשל לפני מעבר לפתרון fallback.

#### `refreshPreviewData()`
מרענן את התצוגה לאחר פעולות המשתמש.

## API Endpoints

### העלאת קובץ

```http
POST /api/user-data-import/upload
Content-Type: multipart/form-data

file: [CSV file]
account_id: [integer]
```

### ניתוח קובץ

```http
GET /api/user-data-import/session/{id}/analyze
```

### תצוגה מקדימה

```http
GET /api/user-data-import/session/{id}/preview
```

### ביצוע ייבוא

```http
POST /api/user-data-import/session/{id}/execute
```

### API Endpoints חדשים - טיפול בבעיות

#### קבלת/דחיית כפילויות
```http
POST /api/user-data-import/session/{session_id}/accept-duplicate
POST /api/user-data-import/session/{session_id}/reject-duplicate
```

**Payload:**
```json
{
    "record_index": 5,
    "duplicate_type": "within_file" | "existing_record"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Duplicate accepted for import"
}
```

#### רענון תצוגה מקדימה
```http
POST /api/user-data-import/session/{session_id}/refresh-preview
```

**Response:**
```json
{
    "success": true,
    "preview_data": { ... },
    "summary_stats": { ... }
}
```

#### הוספת טיקר חדש
```http
POST /api/tickers
```

**Payload:**
```json
{
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "exchange": "NASDAQ",
    "is_active": true
}
```

### אישור ייבוא רשומה קיימת

```http
POST /api/user-data-import/session/{id}/allow-existing
Content-Type: application/json

{
  "record_index": 123
}
```

**תגובה:**
```json
{
  "status": "success",
  "preview_data": { ... }
}
```

**פונקציונליות:**
- מעביר רשומה מ-`records_to_skip` ל-`records_to_import`
- מסמן את הרשומה כ"force import existing"
- מעדכן את נתוני התצוגה המקדימה

### סטטוס סשן

```http
GET /api/user-data-import/session/{id}/status
```

### היסטוריית ייבוא

```http
GET /api/user-data-import/history?account_id={id}&limit={n}
```

## Frontend

### זרימת משתמש

1. **בחירת קובץ**: drag & drop או בחירה ידנית
   - **כפתור "ייבוא חדש"**: ניקוי כל הנתונים והתחלה מחדש (עדכון 2025-10-27)
2. **בחירת חשבון**: רשימת חשבונות מסחר
3. **ניתוח ראשוני**: זיהוי פורמט ופרסינג
4. **טיפול בבעיות**: טיקרים חסרים, כפילויות, רשומות קיימות במערכת
5. **תצוגה מקדימה**: מודל עם שתי טבלאות
6. **אישור וייבוא**: אישור סופי ושמירה

### אינטגרציה עם Unified Cache Manager

המערכת משתמשת ב-**Unified Cache Manager** לשמירת נתונים בין השלבים:

#### מפתחות מטמון:
- `import_session_id` - מזהה הסשן
- `import_analysis_results` - תוצאות הניתוח
- `import_preview_data` - נתוני התצוגה המקדימה

#### ניקוי נתונים מלא (עדכון 2025-10-27):

המערכת כוללת פונקציה `clearAllStepDisplays()` שמנקה:
- כל התצוגות בשלבים השונים (3, 4, 5, 6)
- כל הסעיפים של בעיות (missing tickers, duplicates, existing records, etc.)
- כל הרשימות והכרטיסים
- כל הסטטיסטיקות בתצוגה המקדימה

#### API Operations:
```javascript
// שמירה למטמון
await window.UnifiedCacheManager.set('import_session_id', sessionId);
await window.UnifiedCacheManager.set('import_analysis_results', results);

// טעינה מהמטמון
const sessionId = await window.UnifiedCacheManager.get('import_session_id');
const results = await window.UnifiedCacheManager.get('import_analysis_results');

// מחיקה מהמטמון
await window.UnifiedCacheManager.delete('import_session_id');
await window.UnifiedCacheManager.delete('import_analysis_results');
```

#### שכבות מטמון:
- **Memory Layer**: נתונים זמניים (<100KB)
- **localStorage**: נתונים פשוטים (<1MB)
- **IndexedDB**: נתונים מורכבים (>1MB)
- **Backend Cache**: נתונים קריטיים עם TTL

### מודל אישור סופי

**שלב 3 - תוצאות ניתוח:**
- כרטיס "קיימות כבר במערכת" עם מספר הרשומות הקיימות (עדכון 2025-10-27)

**שלב 4 - פתרון בעיות:**
- סעיף "רשומות קיימות במערכת" עם רשימה מפורטת
- כפתור "ייבוא בכל זאת" (אדום עם אזהרה) לכל רשומה קיימת
- אישור סופי לפני ייבוא רשומות קיימות

**טבלה 1**: רשומות שייכנסו למערכת
- עמודות: טיקר, צד, כמות, מחיר, עמלה, תאריך, מזהה חיצוני

**טבלה 2**: רשומות שדולגו
- עמודות: טיקר, צד, כמות, מחיר, עמלה, תאריך, סיבה, פרטים

## שדות חשובים

### source (מקור הנתונים)

ערכים אפשריים:
- `"manual"` - הוזן ידנית
- `"ibkr_import"` - יובא מקובץ IBKR
- `"demo_import"` - יובא מקובץ דמה
- `"api"` - הוזן דרך API חיצוני

### external_id (מזהה חיצוני)

- **IBKR**: `"{date}_{symbol}_{quantity}_{price}"`
- **Demo**: `"demo_{row_number}"`
- **מטרה**: זיהוי כפילויות, מעקב מקור, קישור לדוח

## הרחבה עתידית

### הוספת קונקטור חדש

1. יצירת מחלקה חדשה ב-`connectors/user_data_import/`
2. ירושה מ-`BaseImportConnector`
3. יישום המתודות הנדרשות
4. הוספה ל-`ImportOrchestrator.connectors`

### דוגמה:

```python
class NewBrokerConnector(BaseImportConnector):
    def detect_format(self, file_content: str) -> bool:
        # לוגיקת זיהוי פורמט
        
    def parse_file(self, file_content: str) -> List[Dict[str, Any]]:
        # פרסינג קובץ
        
    def normalize_record(self, raw_record: Dict[str, Any]) -> Dict[str, Any]:
        # נורמליזציה לפורמט אחיד
        
    def get_provider_name(self) -> str:
        return "NewBroker"
```

## נקודות קריטיות

### 🔴 שדות חובה

- **source**: חייב להיות מוגדר לכל רשומה מיובאת
- **external_id**: חייב להיות ייחודי לכל רשומה

### 🔴 זיהוי כפילויות

- לוגיקת 4/5 התאמות
- בדיקה מול external_id
- confidence score לכל התאמה

### 🔴 תמיכה במטבעות

- **קריאה מהייבוא**: IBKR מחזיר מטבע, Demo מוגדר ל-USD
- **בחירה במודל**: אפשרות לבחור בין USD, EUR, ILS
- **שליחה לשרת**: currency_id נשלח נכון
- **תמיכה בפרונט**: מודל הוספת טיקר מציג מטבע נכון

### 🔴 זיהוי רשומות קיימות

- לוגיקת 5/5 התאמות (עדכון 2025-10-27)
- בדיקה מול כל הרשומות במערכת (לא רק לפי חשבון)
- ממשק "ייבוא בכל זאת" עם אישור סופי
- עדכון source ו-external_id לרשומות קיימות

### 🔴 אישור סופי

- הצגת כל הנתונים לפני שמירה
- אפשרות ביטול בכל שלב
- שקיפות מלאה למשתמש

### 🔴 הוספה בלבד

- המערכת לא מאפשרת עדכון רשומות קיימות
- רק הוספת רשומות חדשות
- שמירה על שלמות הנתונים

## לוגים וניטור

### Backend Logging

```python
import logging
logger = logging.getLogger(__name__)

# דוגמאות לוגים
logger.info(f"Starting import session {session_id}")
logger.warning(f"Duplicate detected: {external_id}")
logger.error(f"Import failed: {error_message}")
```

### Frontend Logging

```javascript
// דוגמאות לוגים
console.log('File uploaded successfully');
console.warn('Missing tickers detected');
console.error('Import failed:', error);
```

## ביצועים

### אופטימיזציות

- **Batch processing**: עיבוד בקבוצות
- **Memory management**: טעינה הדרגתית של קבצים גדולים
- **Database indexing**: אינדקסים על external_id ו-source
- **Caching**: שמירת תוצאות ניתוח

### מגבלות

- **גודל קובץ**: מקסימום 10MB
- **מספר רשומות**: עד 10,000 רשומות בסשן
- **זמן עיבוד**: עד 30 שניות לקובץ

## אבטחה

### וולידציה

- בדיקת סוג קובץ (CSV בלבד)
- בדיקת גודל קובץ
- בדיקת תוכן קובץ
- בדיקת הרשאות משתמש
- בדיקת task נבחר (התמיכה היום: `executions`, `cashflows`, `account_reconciliation`)

### הגנה

- CORS headers
- Rate limiting
- Input sanitization
- SQL injection protection

## בדיקות

### Unit Tests

```python
def test_ibkr_connector_detection():
    connector = IBKRConnector()
    assert connector.detect_format(ibkr_content) == True

def test_duplicate_detection():
    service = DuplicateDetectionService(db_session)
    result = service.detect_duplicates(records, account_id)
    assert len(result['duplicates']) > 0
```

### Integration Tests

```python
def test_full_import_flow():
    # העלאת קובץ
    # ניתוח
    # תצוגה מקדימה
    # ייבוא
    # בדיקת תוצאות
```

## תחזוקה

### ניקוי נתונים

- מחיקת סשנים ישנים (מעל 30 יום)
- ניקוי קבצים זמניים
- ארכיון לוגים

### עדכונים

- הוספת קונקטורים חדשים
- שיפור לוגיקת זיהוי כפילויות
- אופטימיזציית ביצועים

## פתרון בעיות

### בעיות נפוצות

1. **קובץ לא מזוהה**: בדיקת פורמט קובץ
2. **טיקרים חסרים**: הוספה ידנית או דילוג
3. **כפילויות**: סקירה והחלטה ידנית
4. **רשומות קיימות במערכת**: ממשק "ייבוא בכל זאת" עם אישור סופי (עדכון 2025-10-27)
5. **שגיאות וולידציה**: תיקון נתונים או דילוג
6. **ניקוי נתונים**: כפתור "ייבוא חדש" לניקוי מלא (עדכון 2025-10-27)

### Debug Mode

```python
# הפעלת debug mode
DEBUG = True
LOG_LEVEL = "DEBUG"
```

## סיכום

מערכת ייבוא נתוני משתמש מספקת פתרון מלא ויעיל לייבוא ביצועים מקבצי CSV של ברוקרים שונים. הארכיטקטורה הרב-שכבתית מאפשרת הרחבה קלה, זיהוי הכפילויות החכם מבטיח איכות נתונים, והאישור הסופי מבטיח שקיפות מלאה למשתמש.

**עדכונים אחרונים (2025-10-29):**
- שיפור זיהוי כפילויות ל-4/5 התאמות (במקום 5/5)
- תיקון בעיית חשבון מסחר לרשומות ישנות
- יצירת SafeSchemaMigration utility לשינוי סכמות בטוח
- הוספת שדות Realized P/L ו-MTM P/L למערכת הייבוא
- תיקון trade_id להיות אופציונלי (NULL מותר)
- שיפור מערכת זיהוי כפילויות עם 4/5 התאמות
- ממשק "ייבוא בכל זאת" לרשומות קיימות עם אישור סופי
- כפתור "ייבוא חדש" לניקוי נתונים מלא
- עדכון מודל Execution עם קישורים ישירים לטיקר וחשבון מסחר
- **תמיכה במטבעות שונים** - קריאה מהייבוא, בחירה במודל, שליחה לשרת

המערכת מוכנה לשימוש וניתן לגשת אליה דרך:
- עמוד executions → כפתור "📥 ייבוא נתוני משתמש"
- תפריט ראשי → "כלי פיתוח" → "📥 ייבוא נתוני משתמש"

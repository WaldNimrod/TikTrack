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

### תנאי קדם: שיוך חשבון למס' חיצוני
- לכל `trading_account` נוסף השדה `external_account_number` (ייחודי, Nullable). לפני כל פעולה (upload/analyze/preview/execute/refresh-preview) ה-`ImportOrchestrator` משווה בין המספר שבקובץ (נשלף מקטעי `account_reconciliation`) לבין המספר שבמערכת.
- אם החשבון לא משויך או שהמספר שגוי, כל נקודות הקצה מחזירות תגובה עם `error_code: ACCOUNT_LINK_REQUIRED` ואובייקט `linking` שמפרט את הסטטוס (`unlinked`/`mismatch`/`missing_in_file`), מספר הקובץ, המספר השמור ומזהה הסשן.
- Endpoint חדש: `POST /api/user-data-import/session/<id>/link-account` מעדכן את השדה בטבלת `trading_accounts` ומוודא שאין התנגשויות. ה-UI מציג מודל ייעודי (`accountLinkingModal`) שמופעל אוטומטית כאשר חוזרת השגיאה, ומאפשר למשתמש ללחוץ על "שייך חשבון למערכת".
- בממשק בחירת התהליך, "בדיקת שיוך חשבון" (account_reconciliation) מופיעה ראשונה ונבחרת כברירת מחדל כדי לעודד הפעלה לפני יבואי Executions/Cashflows.

3. **שלב 3**: ניתוח קובץ (Task-specific)
   - קריאה ל-`/api/user-data-import/upload`
   - פרמטר חובה חדש: `import_task` (`executions`/`cashflows`/`account_reconciliation`)
   - השרת מחזיר `session_id`, `analysis_results`, ושדות ייעודיים (לדוגמה `cashflow_summary`, `account_reconciliation_summary`)
   - הנתונים נשמרים ב-`ImportSession.summary_data` (JSON) + ב-Unified Cache Manager לפי סוג תהליך

4. **שלב 3**: פתרון בעיות (מפורט, משתנה לפי Task)
   - קריאה ל-`/api/user-data-import/session/{id}/preview` לקבלת נתוני הניתוח
   - הצגת בעיות בממשק אינטראקטיבי מפורט (ספציפי לסוג התהליך):
     - **טיקרים חסרים**: כרטיסים עם כפתור "הוסף טיקר"
    - **כפילויות בקובץ**: כל רשומה ב-`within_file_duplicates` מקבלת `record_index` ייחודי; ה-UI מציג שורה ראשית + שורות match מקוננות (מ-`within_file_duplicate_match`) עם ויזואליזציה של הזוגות, וכפתורי "קבל"/"דחה" מופעלים דרך Button System (`data-onclick="acceptDuplicate"`/`"rejectDuplicate"`) כך שכל פעולה מעדכנת את אותה רשומה ב-skip list.
     - **רשומות קיימות**: כרטיסים עם כפתורי "קבל"/"דחה"
     - **תזרימי מזומנים**: חשבונות חסרים, סוג תזרים לא ידוע, חוסר התאמת מטבע ⇒ כפתורי "שייך חשבון", "תקן מטבע"
     - **בדיקת חשבון**: בסיס מטבע לא תואם, חשבונות חסרי הרשאות, מסמכים חסרים ⇒ כפתורי "סמן כטופל", "פתח משימה"
   - כל כרטיס מציג פרטים מלאים: סמל, פעולה, כמות, מחיר, תאריך, עמלה
   - confidence scores לכפילויות עם אינדיקטור ויזואלי
   - ממשק להוספת טיקרים חדשים עם מודל Bootstrap
    - רענון אוטומטי של התצוגה לאחר פעולות המשתמש (עבור כפילויות: באמצעות `POST /session/<id>/refresh-preview` שמחזיר Snapshot מעודכן ולא מריץ ניתוח מחדש). אם מופעלת חסימת שיוך, מודל השיוך נפתח מתוך אותו זרם פעולה.

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

#### כיסוי מקטעים בייבוא תזרימי מזומנים (עדכון 2025-11-11)

- **העברות והפקדות**: `Deposits & Withdrawals`, `Transfers` – הפקת כיוון תזרים, חשבון יעד, מזהה חברה מעבירה.
- **דיבידנדים**: `Dividends`, `Change in Dividend Accruals` – שמירת סכום ברוטו/נטו, תאריכי Ex/Pay, סימון קוד פעולה (Po/Re).
- **ריביות**: `Interest`, `Interest Accruals`, `Stock Yield Enhancement Program Securities Lent Interest Details`.
- **SYEP**: `Stock Yield Enhancement Program Securities Lent Activity` כולל `transaction_id` וערך בטחונות.
- **מסים ועמלות**: `Withholding Tax`, `Borrow Fee Details`, סעיפי `Cash Report` הרלוונטיים.
- **המרות מט"ח**: רשומות `Trades,Data,Order,Forex` ממופות ל-`cashflow_type=forex_conversion` עם בסיס/צמד מטבעות ועמלות נלוות.
- לכל רשומה נשמרת גרסת מקור מלאה ב-`_raw_row` ותוספת `metadata` המועברת לשכבת ה-UI ולדוחות.

| Task | מקטעים נצרכים | פונקציות Parsing עיקריות | פלט ראשוני |
| ---- | -------------- | ------------------------- | ----------- |
| `executions` | `Trades,Header` + `Trades,Data` | `_parse_trades_section` | רשומות ביצועים |
| `cashflows` | `Deposits & Withdrawals`, `Transfers`, `Dividends`, `Change in Dividend Accruals`, `Interest`, `Interest Accruals`, `Withholding Tax`, `Borrow Fee Details`, `Stock Yield Enhancement Program Securities Lent Activity`, `Stock Yield Enhancement Program Securities Lent Interest Details`, רשומות Forex (`Trades,Data,Order,Forex`) | `_parse_cashflow_sections`, `_build_cashflow_record`, `_build_forex_cashflows` | רשומות תזרים עם `cashflow_type`, שיוך חשבון ו-`metadata` |
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
- החל מנובמבר 2025 החותמות בטבלת `import_sessions` נשמרות ב-UTC (`created_at`/`completed_at`), וה-API מחזיר אותן באמצעות `DateEnvelope` כדי למנוע פערי תצוגה או חותמות ללא איזור זמן.

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
| Cashflows | `cashflow_type`, `amount`, `currency`, `effective_date`, `external_id`, `source` | `source_account`, `target_account`, `asset_symbol`, `memo`, `tax_country`, `metadata` | סכום ≠ 0, DateEnvelope מלא; `metadata` שומר ערכי מקור + `original_cashflow_type`, `storage_cashflow_type`, `mapping_note`, `notes`, `original_source_account` (אם בוצעה המרה לחשבון הסשן) |
| Account Reconciliation | `account_id`, `base_currency`, `external_id`, `source` | `margin_status`, `entitlements`, `missing_documents`, `account_aliases`, `risk_profile` | מזהה חיצוני ייחודי לפי חשבון + תאריך דיווח |

### Validation Service

וולידציה מותאמת תהליך:

- Executions: כמתועד.
- Cashflows:
  - סכום חיובי/שלילי בהתאם לסוג (הפקדה חיובית, משיכה שלילית) וערך מספרי תקין.
  - מטבע קיים במערכת (`currency_service`) והתרעות על קודים שאינם בני 3 תווים (`currency_issues`).
  - ניסיון שיוך `source_account`; כשחסר או לא קיים מתקבל פריט ב-`missing_account_details` עם סטטוס (`missing`/`not_found`).
  - סיווג תזרים מוכר (`cashflow_type`) וסטטיסטיקות לפי סוג (`type_stats`) הכוללות סך רשומות, סכום מצטבר וחלוקת מטבעות/סעיפים.
  - `issues_by_type` מרכז את רשומות ה-invalid לכל סוג תזרים להצגת כרטיסי התראה בפרונטנד.
- Account Reconciliation:
  - חשבון קיים במערכת.
  - מטבע בסיס תואם להגדרת החשבון (או מסומן כחריגה).
  - רשימת הרשאות (entitlements) אינה ריקה – אחרת flagged.
  - מסמכים חסרים מדווחים ב-`missing_documents`.

### Cashflow Type Mapping (עדכון 2025-11)

- לאחר שלב הוולידציה ה-Orchestrator מפעיל את `_resolve_cashflow_storage_type()` שמתרגם את סוגי IBKR לערכי האנום של `cash_flows.type`.
- התוצאה נשמרת ב-`storage_type` ומתווספת למטא-דאטה (`storage_cashflow_type`, `mapping_note`, רשימת `notes`).
- בזמן הייבוא מתווסף לתיאור התזרימי הטקסט `מקור תזרים: …` כדי לשמר את הקשר (SYEP, Borrow Fee, Forex וכו').
- טבלת המיפוי העדכנית:

| סוג מקור (`cashflow_type`) | סוג שמור (`storage_type`) | הערות נוספות |
|----------------------------|---------------------------|--------------|
| `deposit`                  | `deposit`                 | סכומים חיוביים בלבד |
| `withdrawal`               | `withdrawal`              | סכומים שליליים בלבד |
| `transfer`                 | `transfer_in` / `transfer_out` | נגזר מסימן הסכום |
| `forex_conversion`         | `transfer_in` / `transfer_out` | `mapping_note` = `Forex conversion` |
| `dividend`                 | `dividend`                | — |
| `dividend_accrual`         | `other_positive` / `other_negative` | על פי סימן הסכום |
| `interest`                 | `interest`                | — |
| `interest_accrual`         | `other_positive` / `other_negative` | על פי סימן הסכום |
| `tax`                      | `tax`                     | — |
| `fee`                      | `fee`                     | — |
| `borrow_fee`               | `fee`                     | `mapping_note` = `Borrow fee` |
| `syep_interest`            | `interest`                | `mapping_note` = `SYEP interest` |
| `cash_adjustment`          | `other_positive` / `other_negative` | על פי סימן הסכום |
| ערכים אחרים               | `other_positive` / `other_negative` | שם המקור נשמר ב-`mapping_note` |

- אם `_ensure_cashflow_account_binding` מחליף את `source_account`, הערך המקורי נשמר תחת `metadata.original_source_account` כדי לאפשר ביקורת עתידית.

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
3. **הכנת תצוגה מקדימה**: `generate_preview(task_type)` – משחזר נתונים מהתהליך, מפיק סטטיסטיקות וטבלאות, מוסיף `storage_type`, `mapping_note` ומעתיק את המיפוי גם לרשימת ההשמטות/כפילויות.
4. **ביצוע ייבוא**: `execute_import(task_type)` – מפעיל persister בהתאם (Executions → `Execution`, Cashflows → `CashFlow`/`CashFlowAdjustment`, Account Reconciliation → `AccountAuditReport`/עדכוני חשבון) תוך שימוש ב-`storage_type` לכתיבת האנום הסופי והוספת שורת מקור בתיאור הרשומה.
5. **דוחות לייב**: `create_live_report()` מעדכן כעת גם:
   - `cashflow_records`, `cashflow_summary`, `totals_by_currency` ו-`cashflow_type_stats`.
   - `missing_accounts` ו-`missing_account_details` (כולל סטטוס וקטגוריית הבעיה).
   - `cashflow_issues_by_type` ו-`currency_issues` לצורך הצגת כרטיסי התראה בשלב 2.
   - `account_reconciliation_flags` עבור תסריטי בדיקת חשבון.

> **עדכון נובמבר 2025:** ה-Orchestrator מפעיל `_upgrade_preview_data_structure()` כדי להבטיח שלכל `record_to_skip` יש `record_index` לפני שמירת preview ב-cache, ו-`get_preview_snapshot()` מחזיר את ה-preview העדכני מה-cache עבור `refresh-preview`, כך שפעולות `acceptDuplicate`/`rejectDuplicate` נשמרות בין רענונים.

## ממשק משתמש - שלב 2: ניתוח וסטטיסטיקות

- כרטיסי KPI כלליים (סה״כ, תקינות, שגיאות, כפילויות) מעודכנים לפי סוג התהליך.
- עבור **Cashflows** מתווסף לוח כרטיסים דינמי:
  - חלוקה לפי סוג תזרים (`cashflow_type_stats`) כולל סכומים מצטברים, סטטוס תקין/שגוי וחלוקת מטבעות.
  - כרטיסי מטבע (`totals_by_currency`) המציגים יתרות נטו לכל קוד.
  - אזור התראות קריטיות עם מספר חשבונות חסרים, בעיות מטבע והערות ממוקדות על פי `issues_by_type`.
- עבור **Executions** ו-**Account Reconciliation** התוויות בכרטיסים מתעדכנות אוטומטית (לדוגמה “חשבונות חסרים” במקום “טיקרים חסרים”).
- כפתור ההמשך בשלב זה מוביל כעת ישירות לתצוגה המקדימה, לאחר טעינת נתוני פתרון הבעיות.

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

### פונקציות JavaScript (נובמבר 2025)

- **`displayProblemResolutionDetailed(data)`** – מפעיל את כל אזורי הבעיות ומשתמש ב-`problemResolutionState` כדי להציג מצבים ביניים ללא הבהובים.
- **`displayWithinFileDuplicates(duplicates)`** – מפעיל `deduplicateDuplicateRecords()` לפני הרנדור כדי להבטיח הצגה חד-חד ערכית לכל `record_index`, ומחבר את ה-matches (אם קיימים) לשורה הראשית.
- **`renderDuplicateRow(duplicate)`** – מייצר שורת טבלה ראשית ושורות match בהתאם לסוג (`within_file_duplicate` מול `within_file_duplicate_match`), כולל הצגת הערות, confidence, ושימוש ב-Button System ליצירת הכפתורים.
- **`initializeButtonsForProblemTable(tbody)`** – מפעיל `window.ButtonSystem.processButtons(tbody)` בתוך `requestAnimationFrame` כדי להבטיח שהכפתורים נטענים רק אחרי שה-DOM הוצמד בפועל (מונע אזהרות Skipping Button).
- **`getPreviewRecordIndex(recordOrWrapper)`** – יחידת המרה ייעודית שמחלצת את ה-`record_index` מכל מבנה Preview (רשומה ראשית או match). אין להשתמש בלוגיקה אחרת לניתוח מזהי רשומות.
- **`deduplicateDuplicateRecords(records)`** – מסננת `within_file_duplicate_match` כאשר כבר קיימת רשומת `within_file_duplicate` לזהה זהה, ומצמידה את רשימת ה-matches ל-duplicate הראשי.
- **`acceptDuplicate(recordIndex, duplicateType)` / `rejectDuplicate(recordIndex, duplicateType)`** – נרשמות דרך `data-onclick`, שולחות את ה-payload ל-API ומקפיצות התראות דרך Notification System. לאחר תשובה מוצלחת הן קוראות ל-`refreshPreviewData()`.
- **`refreshPreviewData()`** – שולחת `POST /api/user-data-import/session/<id>/refresh-preview`, מעדכנת את `previewData` מתוך snapshot השרת ומרעננת את הטבלאות בהתאם, תוך שמירה על ה-state המקומי עד להשלמת הרענון.

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

## שלב 2 – הרחבת מודול חשבון (תכנון)
- השיוך הקשיח ל-`external_account_number` הוא בסיס לשלב הבא: העתקת נתוני Account Reconciliation (מטבע בסיס, סטטוס מרג'ין, הרשאות, מסמכים חסרים, אליאסים וערכי תקציר) מתוך `summary_data` לטבלת החשבונות עצמה או לטבלת satellite ייעודית.
- שמירת הנתונים ברמת החשבון תאפשר:
  - הצגת סטטוס חשבון עדכני בדשבורדים גם אחרי שהסשן נסגר.
  - סנכרון עתידי מול Broker API (במקום קבצי CSV) תוך שימוש באותו מנגנון זיהוי חשבון.
  - טריגרים אוטומטיים לאזהרות (לדוגמה: שינוי מטבע בסיס, מסמך שחסר יותר מ-X ימים).
- ה-API החדש (`link-account`) והמודל ב-UI כבר מניחים את קיומו של מזהה חד-ערכי, ולכן תוספת השדות החדשים תהיה backwards compatible ותדרוש בעיקר מיגרציה של המידע הקיים מתוך סשנים היסטוריים.

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

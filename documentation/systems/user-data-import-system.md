# מערכת ייבוא נתוני משתמש - תיעוד טכני

## סקירה כללית

מערכת ייבוא נתוני משתמש מאפשרת ייבוא ביצועים (executions) מקבצי CSV של ברוקרים שונים, עם דגש על IBKR בשלב ראשון. המערכת כוללת ארכיטקטורה רב-שכבתית, זיהוי כפילויות חכם, ואישור סופי עם תצוגה מקדימה.

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
File Upload → Format Detection → Parsing → Normalization → 
Validation → Duplicate Detection → Preview → User Confirmation → 
Import Execution → Database Storage
```

### זרימת נתונים בין שלבים

המערכת משתמשת ב-**Unified Cache Manager** ובמסד הנתונים לשמירת נתונים בין השלבים:

1. **שלב 1-2**: העלאת קובץ ובחירת חשבון
   - יצירת `ImportSession` בבסיס הנתונים
   - שמירת `file_content` ו-`account_id` ב-session

2. **שלב 3**: ניתוח קובץ
   - קריאה ל-`/api/user-data-import/upload`
   - השרת מחזיר `session_id` ו-`analysis_results`
   - הנתונים נשמרים ב-`ImportSession.summary_data` (JSON)
   - שמירה מקומית ב-Unified Cache Manager

3. **שלב 3**: פתרון בעיות (מפורט)
   - קריאה ל-`/api/user-data-import/session/{id}/preview` לקבלת נתוני הניתוח
   - הצגת בעיות בממשק אינטראקטיבי מפורט:
     - **טיקרים חסרים**: כרטיסים עם כפתור "הוסף טיקר"
     - **כפילויות בקובץ**: כרטיסים עם כפתורי "קבל"/"דחה"
     - **רשומות קיימות**: כרטיסים עם כפתורי "קבל"/"דחה"
   - כל כרטיס מציג פרטים מלאים: סמל, פעולה, כמות, מחיר, תאריך, עמלה
   - confidence scores לכפילויות עם אינדיקטור ויזואלי
   - ממשק להוספת טיקרים חדשים עם מודל Bootstrap
   - רענון אוטומטי של התצוגה לאחר פעולות המשתמש

4. **שלב 4**: תצוגה מקדימה
   - קריאה ל-`/api/user-data-import/session/{id}/preview`
   - השרת מחזיר `preview_data` עם שתי טבלאות

5. **שלב 5**: אישור סופי
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

מטפל בקבצי IBKR Activity Statement:

- **זיהוי פורמט**: חיפוש שורות "Trades,Data,Order"
- **פרסינג**: חילוץ עמודות IBKR סטנדרטיות
- **נורמליזציה**: המרה לפורמט אחיד
- **external_id**: `"{date}_{symbol}_{quantity}_{price}"`

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

המרת נתונים גולמיים לפורמט אחיד:

```python
{
    "symbol": "AAPL",
    "action": "buy",                    # או "sell"
    "date": {                          # DateEnvelope לאחר נורמליזציה
        "utc": "2025-09-03T09:35:18Z",
        "epochMs": 1757208918000,
        "local": "2025-09-03T12:35:18+03:00",
        "timezone": "Asia/Jerusalem",
        "display": "03/09/2025 12:35"
    },
    "quantity": 250,
    "price": 13.6,
    "fee": 1.2555,
    "realized_pl": null,                # NULL בקנייה, חובה במכירה
    "mtm_pl": null,                      # רשות בשני המקרים
    "external_id": "2025-09-03_AAL_250_13.6",  # ייחודי
    "source": "ibkr_import"             # מקור הנתונים
}
```

### Validation Service

וולידציה מקיפה:

- **שדות חובה**: symbol, action, date, quantity, price
- **טיפוסי נתונים**: בדיקת מספרים, תאריכים
- **ערכים חיוביים**: כמות ומחיר חיוביים
- **תאריכים תקינים**: פורמט ISO תקין
- **צד תקין**: "buy" או "sell" בלבד

### Duplicate Detection Service

זיהוי כפילויות חכם:

#### לוגיקת זיהוי:

1. **exact external_id**: התאמה מדויקת במזהה חיצוני
2. **5/5 similarity**: התאמה מלאה ב-5 פרמטרים (עדכון 2025-10-27):
   - ticker (זהה)
   - quantity (זהה)
   - price (חלק שלם זהה - התעלמות מחלק עשרוני)
   - date (אותו יום - התעלמות משעה)
   - action (buy/sell זהה)

#### סוגי כפילויות:

- **within_file**: כפילויות בתוך אותו קובץ
- **existing_records**: רשומות קיימות במערכת (עדכון 2025-10-27)

#### זיהוי רשומות קיימות במערכת:

המערכת בודקת מול **כל הרשומות הקיימות במערכת** (לא רק לפי חשבון):
- שאילתה על כל ה-`Execution` records
- השוואה לפי 5 פרמטרים: ticker, quantity, action, date (יום בלבד), price (חלק שלם בלבד)
- אם כל 5 הפרמטרים זהים - הרשומה מסומנת כ"קיימת במערכת"

### Import Orchestrator

תיאום כל התהליך:

1. **יצירת סשן**: `create_import_session()`
2. **ניתוח קובץ**: `analyze_file()`
3. **הכנת תצוגה מקדימה**: `generate_preview()`
4. **ביצוע ייבוא**: `execute_import()`

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

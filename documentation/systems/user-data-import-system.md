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

- `source`: מקור הנתונים ("ibkr_import", "demo_import", "manual", "api")
- `external_id`: מזהה חיצוני ייחודי לכל רשומה מיובאת

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

## שירותים

### Normalization Service

המרת נתונים גולמיים לפורמט אחיד:

```python
{
    "symbol": "AAPL",
    "action": "buy",                    # או "sell"
    "date": "2025-09-03T09:35:18",     # ISO format
    "quantity": 250,
    "price": 13.6,
    "fee": 1.2555,
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
2. **3/5 similarity**: התאמה ב-3+ מתוך 5 פרמטרים:
   - ticker (זהה)
   - quantity (זהה)
   - price (זהה ±0.01)
   - date (אותו יום)
   - action (buy/sell זהה)

#### סוגי כפילויות:

- **within_file**: כפילויות בתוך אותו קובץ
- **system**: כפילויות מול נתונים קיימים במערכת

### Import Orchestrator

תיאום כל התהליך:

1. **יצירת סשן**: `create_import_session()`
2. **ניתוח קובץ**: `analyze_file()`
3. **הכנת תצוגה מקדימה**: `generate_preview()`
4. **ביצוע ייבוא**: `execute_import()`

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
2. **בחירת חשבון**: רשימת חשבונות מסחר
3. **ניתוח ראשוני**: זיהוי פורמט ופרסינג
4. **טיפול בבעיות**: טיקרים חסרים, כפילויות
5. **תצוגה מקדימה**: מודל עם שתי טבלאות
6. **אישור וייבוא**: אישור סופי ושמירה

### מודל אישור סופי

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

- לוגיקת 3/5 התאמות
- בדיקה מול external_id
- confidence score לכל התאמה

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
4. **שגיאות וולידציה**: תיקון נתונים או דילוג

### Debug Mode

```python
# הפעלת debug mode
DEBUG = True
LOG_LEVEL = "DEBUG"
```

## סיכום

מערכת ייבוא נתוני משתמש מספקת פתרון מלא ויעיל לייבוא ביצועים מקבצי CSV של ברוקרים שונים. הארכיטקטורה הרב-שכבתית מאפשרת הרחבה קלה, זיהוי הכפילויות החכם מבטיח איכות נתונים, והאישור הסופי מבטיח שקיפות מלאה למשתמש.

המערכת מוכנה לשימוש וניתן לגשת אליה דרך:
- עמוד executions → כפתור "📥 ייבוא נתוני משתמש"
- תפריט ראשי → "כלי פיתוח" → "📥 ייבוא נתוני משתמש"

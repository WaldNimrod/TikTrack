# בעיית תצוגת נתוני מחירים בממשק

**תאריך:** 28 בנובמבר 2025  
**סטטוס:** בבדיקה  
**חומרה:** גבוהה

---

## תיאור הבעיה

המשתמש מדווח שאינו רואה נתוני מחירים בממשק, למרות שהנתונים קיימים בבסיס הנתונים.

---

## מה נבדק

### 1. נתונים בבסיס הנתונים ✅

**quotes_last:**
- 39 רשומות עם מחירים תקינים
- דוגמאות: WIX ($95.71), VRNS ($33.07), UPST ($44.96)

**market_data_quotes:**
- 125 רשומות עם מחירים תקינים
- נתונים עדכניים מהשעה האחרונה

**מסקנה:** הנתונים קיימים ומעודכנים בבסיס הנתונים.

---

### 2. טעינת נתונים ב-TickerService ✅

**קוד:** `Backend/services/ticker_service.py` - `get_all()`

הקוד:
- טוען את `MarketDataQuote` האחרון לכל טיקר
- מוסיף שדות דינמיים ל-ticker object:
  - `current_price`
  - `change_percent`
  - `change_amount`
  - `volume`
  - `yahoo_updated_at`
  - `data_source`
  - `open_price`
  - `change_from_open`
  - `change_from_open_percent`

**בדיקה:**
```python
# Ticker object has attributes
ticker.current_price = 21.53  # ✅ קיים
ticker.change_percent = 0.023  # ✅ קיים
```

**מסקנה:** ה-TickerService מוסיף את הנתונים בהצלחה.

---

### 3. העברת נתונים דרך API ❌

**קוד:** `Backend/routes/api/tickers.py` - `get_tickers()`

הקוד:
```python
ticker_dict = ticker.to_dict()
# Add market data fields if they exist
if hasattr(ticker, 'current_price'):
    ticker_dict['current_price'] = ticker.current_price
```

**בדיקה:**
- ✅ לאחר הוספת השדות: `ticker_dict` מכיל את `current_price`
- ❌ בתגובת ה-API: השדות לא מופיעים

**תגובת API בפועל:**
```json
{
  "symbol": "MSFT",
  "name": "Microsoft Corporation",
  "type": "stock",
  ...
  // ❌ אין current_price, change_percent, וכו'
}
```

**מסקנה:** השדות לא מועברים בתגובת ה-API למרות שהם מוספים.

---

## סיבות אפשריות

### 1. Date Normalization Service

**חשד:** `DateNormalizationService` עלול להסיר שדות שלא נמצאים ב-schema המקורי.

**בדיקה נדרשת:** האם יש date normalization ב-tickers endpoint?

**סטטוס:** לא נבדק עדיין.

---

### 2. Middleware Response Processing

**חשד:** Middleware כלשהו עלול לסנן/לסלק שדות דינמיים.

**בדיקה נדרשת:** האם יש middleware שמעבד תגובות API?

**סטטוס:** לא נבדק עדיין.

---

### 3. JSON Serialization

**חשד:** JSON serializer עלול לדרוס שדות דינמיים.

**בדיקה נדרשת:** איך Flask jsonify מתמודד עם שדות דינמיים?

**סטטוס:** לא סביר - Flask jsonify אמור להעביר הכל.

---

### 4. Server Cache / Old Code

**חשד:** השרת רץ על קוד ישן או שיש cache ישן.

**בדיקה נדרשת:** האם השרת רץ על הקוד העדכני? האם יש cache?

**סטטוס:** לא נבדק עדיין.

---

## שגיאות ב-Logs

### שגיאת Transaction Aborted

```
ERROR: Failed to load market data quote for ticker SPY due to database error: 
(psycopg2.errors.UndefinedColumn) column market_data_quotes.open_price does not exist
```

**אבל:** העמודה כן קיימת! (נבדק בפועל)

**הסבר:** כנראה השרת רץ על קוד ישן או שיש בעיית cache.

---

## צעדים לתיקון

### 1. בדיקת Date Normalization

- [ ] לבדוק אם יש date normalization ב-tickers endpoint
- [ ] לבדוק אם ה-normalizer מסיר שדות דינמיים
- [ ] לתקן אם צריך

### 2. בדיקת Middleware

- [ ] לבדוק אם יש middleware שמעבד תגובות
- [ ] לבדוק אם הוא מסיר שדות דינמיים
- [ ] לתקן אם צריך

### 3. Restart Server

- [ ] לעצור את השרת
- [ ] לוודא שאין cache
- [ ] להריץ מחדש עם הקוד העדכני

### 4. בדיקת JSON Response

- [ ] לבדוק את תגובת ה-API בפועל
- [ ] לוודא שהשדות מופיעים
- [ ] לתקן אם צריך

---

## קבצים רלוונטיים

1. `Backend/services/ticker_service.py` - טעינת נתוני שוק
2. `Backend/routes/api/tickers.py` - API endpoint
3. `Backend/models/ticker.py` - Ticker model
4. `Backend/models/base.py` - BaseModel.to_dict()

---

## הערות נוספות

- הנתונים קיימים במלואם בבסיס הנתונים
- הקוד מוסיף את הנתונים ל-ticker objects
- הבעיה היא בהעברה ל-frontend דרך ה-API

---

**תאריך עדכון אחרון:** 28 בנובמבר 2025


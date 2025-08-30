# Yahoo Finance Provider

תיקייה זו מכילה את הקונקטור ל-Yahoo Finance API.

## 📁 מבנה התיקייה

```
yahoo_finance/
├── yahoo_finance_adapter.py    # הקונקטור הראשי
├── __init__.py                 # קובץ אתחול
└── README.md                   # תיעוד זה
```

## 🔧 שימוש

### התקנת Dependencies
```bash
pip install yfinance
```

### שימוש בקונקטור
```python
from external_data_integration_server.providers.yahoo_finance import YahooFinanceAdapter

# יצירת instance
adapter = YahooFinanceAdapter()

# קבלת נתוני מחיר
quote_data = adapter.fetch_quote_data('AAPL')
```

## 📊 תכונות

- **Single Quote Fetching** - קבלת מחיר לטיקר בודד
- **Batch Quote Fetching** - קבלת מחירים למספר טיקרים
- **Error Handling** - טיפול בשגיאות
- **Rate Limiting** - ניהול מגבלות קצב
- **Response Validation** - וולידציה של תגובות

## ⚠️ הערות חשובות

1. **Yahoo Finance לא מספק SLA רשמי** - יש לשמור על מגבלות קצב שמרניות
2. **Rate Limiting** - מומלץ לא לעבור על 900 בקשות לשעה
3. **Error Handling** - יש לטפל בשגיאות 429 (Too Many Requests)
4. **Fallback Mechanism** - יש לספק מנגנון גיבוי במקרה של כשל

## 🔄 עתידי

- [ ] תמיכה בנתונים היסטוריים
- [ ] תמיכה בנתונים תוך-יומיים
- [ ] תמיכה בנתוני נפח מתקדמים
- [ ] תמיכה בנתוני אופציות

---

**ספק:** Yahoo Finance  
**ספרייה:** yfinance  
**סטטוס:** פעיל  
**גרסה:** 1.0







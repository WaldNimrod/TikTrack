# Interactive Brokers (IBKR) Provider

תיקייה זו תכיל את הקונקטור ל-Interactive Brokers API (עתידי).

## 📁 מבנה התיקייה

```
ibkr/
├── ibkr_adapter.py            # הקונקטור הראשי (עתידי)
├── __init__.py                # קובץ אתחול (עתידי)
└── README.md                  # תיעוד זה
```

## 🔧 שימוש (עתידי)

### התקנת Dependencies
```bash
pip install ibapi
```

### שימוש בקונקטור
```python
from external_data_integration_server.providers.ibkr import IBKRAdapter

# יצירת instance
adapter = IBKRAdapter()

# קבלת נתוני מחיר
quote_data = adapter.fetch_quote_data('AAPL')
```

## 📊 תכונות (עתידי)

- **Real-time Data** - נתונים בזמן אמת
- **Historical Data** - נתונים היסטוריים
- **Options Data** - נתוני אופציות
- **Account Integration** - אינטגרציה עם חשבון
- **Advanced Order Types** - סוגי הזמנות מתקדמים

## ⚠️ הערות חשובות

1. **נדרש חשבון IBKR** - יש צורך בחשבון Interactive Brokers
2. **API Credentials** - נדרשים פרטי התחברות
3. **Market Hours** - נתונים זמינים רק בשעות מסחר
4. **Rate Limiting** - מגבלות קצב מחמירות

## 🔄 תכנון

- [ ] IBKR API Integration
- [ ] Real-time data streaming
- [ ] Historical data fetching
- [ ] Account management
- [ ] Order management

---

**ספק:** Interactive Brokers  
**ספרייה:** ibapi  
**סטטוס:** תכנון  
**גרסה:** 0.0


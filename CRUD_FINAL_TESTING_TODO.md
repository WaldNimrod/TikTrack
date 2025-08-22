# רשימת TO-DO לבדיקות CRUD סופיות - TikTrack

## 🎯 מטרה
להשלים את כל בדיקות CRUD ולפתור את הבעיות הפתוחות שזוהו בדוח.

## ⚠️ בעיות פתוחות שדורשות טיפול

### 1. Tickers UPDATE - עדיין לא עובד
**תיאור:** למרות התיקון בקוד, השרת עדיין מחזיר שגיאה "Symbol is required"
**סטטוס:** 🔄 תוקן בקוד אבל לא נטען בשרת

### 2. Trade Plans CANCEL - לא עובד
**תיאור:** פעולת ביטול לא משנה את הסטטוס מ-"open" ל-"canceled"
**סטטוס:** ❌ לא נבדק עדיין

## 📋 רשימת בדיקות סופיות

### שלב 1: תיקון בעיות פתוחות
- [ ] בדיקת Tickers UPDATE
- [ ] בדיקת Trade Plans CANCEL
- [ ] תיקון בעיות אם נדרש

### שלב 2: בדיקה סופית של כל CRUD
- [ ] Accounts: CREATE, READ, UPDATE, DELETE
- [ ] Tickers: CREATE, READ, UPDATE, DELETE
- [ ] Trades: CREATE, READ, UPDATE, CLOSE, CANCEL
- [ ] Notes: CREATE, READ, UPDATE, DELETE
- [ ] Trade Plans: CREATE, READ, UPDATE, CANCEL
- [ ] Executions: CREATE, READ, UPDATE, DELETE
- [ ] Alerts: CREATE, READ, UPDATE, DELETE
- [ ] Cash Flows: CREATE, READ, UPDATE, DELETE

### שלב 3: עדכון דוח סופי
- [ ] עדכון סטטוס כל הבדיקות
- [ ] תיעוד בעיות שנותרו
- [ ] המלצות להמשך

## 🚀 פקודות לביצוע

### בדיקת Tickers UPDATE:
```bash
curl -s -X PUT http://localhost:8080/api/v1/tickers/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Stock Updated", "remarks": "טיקר מעודכן"}'
```

### בדיקת Trade Plans CANCEL:
```bash
curl -s -X PUT http://localhost:8080/api/v1/trade-plans/1/cancel
```

### בדיקות CRUD מלאות לכל ישות:
```bash
# Accounts
curl -s http://localhost:8080/api/v1/accounts/
curl -s -X POST http://localhost:8080/api/v1/accounts/ -H "Content-Type: application/json" -d '{"name": "Test Account", "currency_id": 1}'
curl -s -X PUT http://localhost:8080/api/v1/accounts/1 -H "Content-Type: application/json" -d '{"name": "Updated Account"}'
curl -s -X DELETE http://localhost:8080/api/v1/accounts/1

# Tickers
curl -s http://localhost:8080/api/v1/tickers/
curl -s -X POST http://localhost:8080/api/v1/tickers/ -H "Content-Type: application/json" -d '{"symbol": "TEST", "name": "Test Stock", "type": "stock", "currency_id": 1}'
curl -s -X PUT http://localhost:8080/api/v1/tickers/1 -H "Content-Type: application/json" -d '{"name": "Updated Stock"}'
curl -s -X DELETE http://localhost:8080/api/v1/tickers/1

# Trades
curl -s http://localhost:8080/api/v1/trades/
curl -s -X POST http://localhost:8080/api/v1/trades/ -H "Content-Type: application/json" -d '{"ticker_id": 1, "account_id": 1, "type": "swing", "side": "Long"}'
curl -s -X PUT http://localhost:8080/api/v1/trades/1 -H "Content-Type: application/json" -d '{"notes": "Updated trade"}'
curl -s -X PUT http://localhost:8080/api/v1/trades/1/close
curl -s -X PUT http://localhost:8080/api/v1/trades/1/cancel

# Notes
curl -s http://localhost:8080/api/v1/notes/
curl -s -X POST http://localhost:8080/api/v1/notes/ -H "Content-Type: application/json" -d '{"content": "Test note", "related_type": "ticker", "related_id": 1}'
curl -s -X PUT http://localhost:8080/api/v1/notes/1 -H "Content-Type: application/json" -d '{"content": "Updated note"}'
curl -s -X DELETE http://localhost:8080/api/v1/notes/1

# Trade Plans
curl -s http://localhost:8080/api/v1/trade-plans/
curl -s -X POST http://localhost:8080/api/v1/trade-plans/ -H "Content-Type: application/json" -d '{"ticker_id": 1, "type": "swing", "side": "Long", "reasons": "Test plan"}'
curl -s -X PUT http://localhost:8080/api/v1/trade-plans/1 -H "Content-Type: application/json" -d '{"reasons": "Updated plan"}'
curl -s -X PUT http://localhost:8080/api/v1/trade-plans/1/cancel

# Executions
curl -s http://localhost:8080/api/v1/executions/
curl -s -X POST http://localhost:8080/api/v1/executions/ -H "Content-Type: application/json" -d '{"trade_id": 1, "quantity": 100, "price": 50.0}'
curl -s -X PUT http://localhost:8080/api/v1/executions/1 -H "Content-Type: application/json" -d '{"quantity": 150}'
curl -s -X DELETE http://localhost:8080/api/v1/executions/1

# Alerts
curl -s http://localhost:8080/api/v1/alerts/
curl -s -X POST http://localhost:8080/api/v1/alerts/ -H "Content-Type: application/json" -d '{"ticker_id": 1, "type": "price", "condition": "above", "value": 100.0}'
curl -s -X PUT http://localhost:8080/api/v1/alerts/1 -H "Content-Type: application/json" -d '{"value": 110.0}'
curl -s -X DELETE http://localhost:8080/api/v1/alerts/1

# Cash Flows
curl -s http://localhost:8080/api/v1/cash-flows/
curl -s -X POST http://localhost:8080/api/v1/cash-flows/ -H "Content-Type: application/json" -d '{"account_id": 1, "type": "deposit", "amount": 1000.0, "currency_id": 1}'
curl -s -X PUT http://localhost:8080/api/v1/cash-flows/1 -H "Content-Type: application/json" -d '{"amount": 1500.0}'
curl -s -X DELETE http://localhost:8080/api/v1/cash-flows/1
```

---
**תאריך יצירה:** 22 באוגוסט 2025
**סטטוס:** 🔄 בהכנה לביצוע

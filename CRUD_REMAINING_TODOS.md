# רשימת TO-DO לבעיות CRUD שנותרו - TikTrack

## 🎯 מטרה
לתקן את כל הבעיות הפתוחות שזוהו בבדיקות CRUD ולהשלים בדיקה סופית רציפה.

## ⚠️ בעיות שדורשות תיקון

### 1. Trades CLOSE/CANCEL - בעיה קריטית
**תיאור:** פונקציות סגירה וביטול לא עובדות
**שגיאה:** `local variable 'db' referenced before assignment`
**מיקום:** `Backend/routes/api/trades.py`
**סטטוס:** 🔴 דורש תיקון דחוף

### 2. Notes CREATE - בעיה בוולידציה
**תיאור:** יצירת הערות לא עובדת
**שגיאה:** `Note must be related to account, trade, or trade plan`
**מיקום:** `Backend/services/note_service.py`
**סטטוס:** 🔴 דורש תיקון

### 3. Alerts CREATE - בעיה במודל
**תיאור:** יצירת התראות לא עובדת
**שגיאה:** `'ticker_id' is an invalid keyword argument for Alert`
**מיקום:** `Backend/models/alert.py` או `Backend/services/alert_service.py`
**סטטוס:** 🔴 דורש תיקון

### 4. Trade Plans CANCEL - בעיה קטנה
**תיאור:** הסטטוס לא משתנה ל-"cancelled" למרות שיש `cancelled_at`
**מיקום:** `Backend/models/trade_plan.py` או `Backend/services/trade_plan_service.py`
**סטטוס:** ⚠️ בעיה קטנה

## 📋 רשימת בדיקות סופיות

### שלב 1: תיקון בעיות
- [ ] תיקון Trades CLOSE/CANCEL
- [ ] תיקון Notes CREATE
- [ ] תיקון Alerts CREATE
- [ ] תיקון Trade Plans CANCEL (אופציונלי)

### שלב 2: בדיקה סופית רציפה
- [ ] בדיקת Accounts: CREATE, READ, UPDATE, DELETE
- [ ] בדיקת Tickers: CREATE, READ, UPDATE, DELETE
- [ ] בדיקת Trades: CREATE, READ, UPDATE, CLOSE, CANCEL
- [ ] בדיקת Notes: CREATE, READ, UPDATE, DELETE
- [ ] בדיקת Trade Plans: CREATE, READ, UPDATE, CANCEL
- [ ] בדיקת Executions: CREATE, READ, UPDATE, DELETE
- [ ] בדיקת Alerts: CREATE, READ, UPDATE, DELETE
- [ ] בדיקת Cash Flows: CREATE, READ, UPDATE, DELETE

### שלב 3: עדכון דוח סופי
- [ ] עדכון סטטוס כל הבדיקות
- [ ] תיעוד בעיות שנותרו
- [ ] המלצות להמשך

## 🚀 פקודות לביצוע

### בדיקות CRUD מלאות:
```bash
# Accounts
curl -s -X POST http://localhost:8080/api/v1/accounts/ -H "Content-Type: application/json" -d '{"name": "Final Test Account", "currency_id": 1, "cash_balance": 5000.0}'
curl -s -X PUT http://localhost:8080/api/v1/accounts/1 -H "Content-Type: application/json" -d '{"name": "Updated Account"}'
curl -s -X DELETE http://localhost:8080/api/v1/accounts/1

# Tickers
curl -s -X POST http://localhost:8080/api/v1/tickers/ -H "Content-Type: application/json" -d '{"symbol": "FINAL", "name": "Final Test Stock", "type": "stock", "currency_id": 1}'
curl -s -X PUT http://localhost:8080/api/v1/tickers/1 -H "Content-Type: application/json" -d '{"name": "Updated Stock"}'
curl -s -X DELETE http://localhost:8080/api/v1/tickers/1

# Trades
curl -s -X POST http://localhost:8080/api/v1/trades/ -H "Content-Type: application/json" -d '{"ticker_id": 1, "account_id": 1, "trade_plan_id": 10, "type": "swing", "side": "Long"}'
curl -s -X PUT http://localhost:8080/api/v1/trades/1 -H "Content-Type: application/json" -d '{"notes": "Updated trade"}'
curl -s -X POST http://localhost:8080/api/v1/trades/1/close
curl -s -X POST http://localhost:8080/api/v1/trades/1/cancel

# Notes
curl -s -X POST http://localhost:8080/api/v1/notes/ -H "Content-Type: application/json" -d '{"content": "Final test note", "related_type": "account", "related_id": 1}'
curl -s -X PUT http://localhost:8080/api/v1/notes/1 -H "Content-Type: application/json" -d '{"content": "Updated note"}'
curl -s -X DELETE http://localhost:8080/api/v1/notes/1

# Trade Plans
curl -s -X POST http://localhost:8080/api/v1/trade_plans/ -H "Content-Type: application/json" -d '{"ticker_id": 1, "type": "swing", "side": "Long", "reasons": "Final test plan"}'
curl -s -X PUT http://localhost:8080/api/v1/trade_plans/1 -H "Content-Type: application/json" -d '{"reasons": "Updated plan"}'
curl -s -X POST http://localhost:8080/api/v1/trade_plans/1/cancel

# Executions
curl -s -X POST http://localhost:8080/api/v1/executions/ -H "Content-Type: application/json" -d '{"trade_id": 1, "action": "buy", "quantity": 100, "price": 50.0}'
curl -s -X PUT http://localhost:8080/api/v1/executions/1 -H "Content-Type: application/json" -d '{"quantity": 150}'
curl -s -X DELETE http://localhost:8080/api/v1/executions/1

# Alerts
curl -s -X POST http://localhost:8080/api/v1/alerts/ -H "Content-Type: application/json" -d '{"ticker_id": 1, "type": "price", "condition": "above", "value": 100.0}'
curl -s -X PUT http://localhost:8080/api/v1/alerts/1 -H "Content-Type: application/json" -d '{"value": 110.0}'
curl -s -X DELETE http://localhost:8080/api/v1/alerts/1

# Cash Flows
curl -s -X POST http://localhost:8080/api/v1/cash_flows/ -H "Content-Type: application/json" -d '{"account_id": 1, "type": "deposit", "amount": 1000.0, "currency_id": 1}'
curl -s -X PUT http://localhost:8080/api/v1/cash_flows/1 -H "Content-Type: application/json" -d '{"amount": 1500.0}'
curl -s -X DELETE http://localhost:8080/api/v1/cash_flows/1
```

---
**תאריך יצירה:** 22 באוגוסט 2025
**סטטוס:** 🔄 בהכנה לביצוע


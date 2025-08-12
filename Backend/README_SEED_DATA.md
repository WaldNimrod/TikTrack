# נתוני דמה לבסיס הנתונים SimpleTrade

## סקירה כללית

נוספו נתוני דמה מקיפים לבסיס הנתונים כדי שכל טבלה תכיל לפחות 3 רשומות עם קישורים נכונים בין הטבלאות.

## סיכום הנתונים

| טבלה | מספר רשומות | תיאור |
|------|-------------|-------|
| accounts | 6 | חשבונות השקעות שונים (ILS, USD) |
| tickers | 10 | מניות טכנולוגיה (AAPL, GOOGL, MSFT, וכו') |
| trade_plans | 5 | תכנוני טריידים מקושרים לחשבונות וטיקרים |
| trades | 10 | טריידים פעילים וסגורים |
| executions | 12 | ביצועי טריידים (קנייה/מכירה) |
| alerts | 10 | התראות מחיר מקושרות לטיקרים |
| cash_flows | 12 | תזרימי מזומנים (הפקדות, משיכות, דיבידנדים) |
| notes | 12 | הערות מקושרות לטריידים ותכנונים |
| performance_snapshots | 12 | תמונת זמן של החשבונות |
| open_execution_requests | 6 | בקשות ביצוע ממתינות |

## קישורים בין הטבלאות

### תכנוני טריידים
- כל תכנון טרייד מקושר לחשבון ספציפי
- כל תכנון טרייד מקושר לטיקר ספציפי
- סוגי השקעות: long, short

### טריידים
- כל טרייד מקושר לתכנון טרייד
- כל טרייד מקושר לחשבון וטיקר
- סטטוסים: open, closed, pending

### התראות
- כל התראה מקושרת לחשבון וטיקר
- סוגי התראות: price alerts
- סטטוסים: active, triggered

### טרנזקציות
- כל ביצוע מקושר לטרייד ספציפי
- פעולות: buy, sell
- מקורות: manual

### תזרימי מזומנים
- כל תזרים מקושר לחשבון
- סוגים: deposit, withdrawal, dividend

## נתונים לדוגמה

### חשבונות
1. **חשבון השקעות ארוך טווח** (ILS) - 150,000 ש"ח
2. **חשבון ספקולטיבי** (USD) - 25,000 דולר
3. **חשבון פנסיוני** (ILS) - 80,000 ש"ח

### טיקרים
- AAPL (Apple Inc.)
- GOOGL (Alphabet Inc.)
- MSFT (Microsoft Corporation)
- TSLA (Tesla Inc.)
- NVDA (NVIDIA Corporation)
- AMZN (Amazon.com Inc.)
- META (Meta Platforms Inc.)
- NFLX (Netflix Inc.)
- CRM (Salesforce Inc.)
- ORCL (Oracle Corporation)

### תכנוני טריידים לדוגמה
1. **Apple** - תכנון ארוך טווח, כניסה ב-150$, יעד 180$
2. **Google** - תכנון קצר טווח, כניסה ב-2800$, יעד 2600$
3. **Microsoft** - תכנון ארוך טווח, כניסה ב-300$, יעד 350$

## בדיקת הנתונים

### בדיקת קישורים
```sql
-- בדיקת תכנוני טריידים עם קישורים
SELECT tp.id, tp.investment_type, t.symbol, a.name as account_name 
FROM trade_plans tp 
JOIN tickers t ON tp.ticker_id = t.id 
JOIN accounts a ON tp.account_id = a.id;

-- בדיקת טריידים עם קישורים
SELECT t.id, t.status, t.type, tp.investment_type, tk.symbol, a.name as account_name 
FROM trades t 
JOIN trade_plans tp ON t.trade_plan_id = tp.id 
JOIN tickers tk ON t.ticker_id = tk.id 
JOIN accounts a ON t.account_id = a.id;

-- בדיקת התראות עם קישורים
SELECT a.id, a.alert_type, a.condition, a.status, tk.symbol, ac.name as account_name 
FROM alerts a 
JOIN tickers tk ON a.ticker_id = tk.id 
JOIN accounts ac ON a.account_id = ac.id;
```

### API Endpoints
השרת מספק את ה-API הבאים:
- `GET /api/tradeplans` - תכנוני טריידים
- `GET /api/trades` - טריידים
- `GET /api/alerts` - התראות
- `GET /api/stats` - סטטיסטיקות
- `GET /api/database/{table_name}` - נתוני טבלאות

## הפעלת השרת

```bash
cd Backend
python3 app.py
```

השרת רץ על `http://localhost:5002`

## הערות חשובות

1. **קישורים נכונים**: כל הטבלאות מקושרות בצורה נכונה לפי הסכמה
2. **נתונים מגוונים**: יש נתונים מכל הסוגים (חשבונות שונים, מטבעות שונים, סוגי השקעות שונים)
3. **סטטוסים שונים**: טריידים פתוחים, סגורים וממתינים
4. **תאריכים ריאליסטיים**: כל הנתונים כוללים תאריכים ריאליסטיים מ-2024
5. **סכומים הגיוניים**: כל הסכומים והמחירים הגיוניים לשוק האמיתי

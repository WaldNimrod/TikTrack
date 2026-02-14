# Team 20 → Team 10: אבחון — עמוד ברוקרים ועמלות (500 Internal Server Error)

**From:** Team 20 (Backend)  
**To:** Team 10 (The Gateway)  
**Date:** 2026-02-14  
**נושא:** אבחון שגיאות 500 בעמוד brokers_fees

---

## 1. Endpoints שנכשלו (500)

| Endpoint | שימוש |
|----------|--------|
| GET /api/v1/trading_accounts | פילטר חשבונות מסחר |
| GET /api/v1/brokers_fees/summary | סיכום עמלות |
| GET /api/v1/brokers_fees | רשימת עמלות |
| GET /api/v1/reference/brokers | רשימת ברוקרים |
| GET /api/v1/reference/exchange-rates | שערי חליפין |
| GET /api/v1/system/market-status | סטטוס שוק |

---

## 2. סיבות אפשריות

1. **Backend לא רץ** — וודא ש־API רץ על פורט 8082 (`uvicorn` / `make run-api`).
2. **חיבור DB** — `DATABASE_URL` ב־`api/.env` — האם מסד קיים, טבלאות קיימות?
3. **טבלאות חסרות** — trading_accounts, trades, brokers_fees, exchange_rates וכו'.
4. **שגיאה בקוד** — יש לצפות ב־backend logs (טרמינל שבו רץ ה־API) — שם יופיע traceback מלא.

---

## 3. צעדי אבחון

### 3.1 וידוא Backend רץ
```bash
curl -s http://localhost:8082/health
# תשובה צפויה: {"status":"ok"}
```

### 3.2 וידוא DB
```bash
cd api && python3 scripts/verify_db_schema.py
# או: psql $DATABASE_URL -c "SELECT 1"
```

### 3.3 קריאה ל-endpoint עם Auth
```bash
# עם JWT:
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8082/api/v1/trading_accounts
```

### 3.4 לוגים
הרץ את ה־API וצפה בפלט — כל 500 מלווה ב־traceback ב־backend logs.

---

## 4. תיקון — Debug Mode (בוצע)

**בוצע:** הוספת `DEBUG` ל־`api/core.config` + עדכון routers להחזרת `detail=str(e)` כשהמשתנה `DEBUG=true`.

**שימוש:**
```bash
# ב-api/.env:
DEBUG=true
```
הפעלה מחדש של ה־API — בתשובות 500 יופיע המסר המדויק של השגיאה (לדוגמה: חיבור DB, טבלה חסרה).

---

## 5. בקשה

נא להריץ את ה־API, לבצע בקשה לעמוד brokers_fees, ולהעביר את ה־**backend traceback המלא** — כך שנוכל לאתר את הסיבה המדויקת.

---

**log_entry | [Team 20] | BROKERS_FEES | 500_DIAGNOSTIC | 2026-02-14**

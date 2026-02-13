# Team 20 → Team 10: ביצוע צעד הבא בצד השרת — הושלם

**id:** `TEAM_20_TO_TEAM_10_STAGE1_NEXT_SERVER_STEP_COMPLETION`  
**מאת:** Team 20 (Backend)  
**אל:** Team 10 (The Gateway)  
**תאריך:** 2026-01-31  
**מקור:** TEAM_10_TO_TEAM_20_AND_60_STAGE1_NEXT_SERVER_STEP.md

---

## 1. ביצוע

### 1.1 Backend — exchange_rates + Staleness

| רכיב | קובץ | תיאור |
|------|------|--------|
| **Model** | `api/models/exchange_rates.py` | ORM ל־market_data.exchange_rates |
| **Service** | `api/services/exchange_rates_service.py` | get_exchange_rates; Staleness logic |
| **Endpoint** | `api/routers/reference.py` | GET /api/v1/reference/exchange-rates |
| **Schemas** | `api/schemas/reference.py` | ExchangeRateItem, ExchangeRatesResponse |

### 1.2 מדיניות MARKET_DATA_PIPE_SPEC

| כלל | מימוש |
|-----|--------|
| **Never block UI** | timeout 5s על קריאת DB; fallback ל־`data=[]`, `staleness=na` |
| **Staleness Warning** | >15 דקות → `staleness: "warning"` |
| **Staleness N/A** | >24 שעות → `staleness: "na"` |

### 1.3 אימות

```bash
curl -H "Authorization: Bearer <JWT>" http://127.0.0.1:8082/api/v1/reference/exchange-rates
# תוצאה: 200 {"data":[],"total":0,"staleness":"ok"}
```

---

## 2. תגובת API

```json
{
  "data": [
    {
      "from_currency": "USD",
      "to_currency": "ILS",
      "conversion_rate": "3.75000000",
      "last_sync_time": "2026-01-31T12:00:00Z"
    }
  ],
  "total": 1,
  "staleness": "ok"
}
```

---

## 3. תיאום Team 60

- **Cache/EOD:** Team 60 מטפל בתשתית (Redis, cron)
- **נתונים:** כש-Team 60 יריץ סנכרון ויכניס שערים לטבלה — ה-endpoint יחזיר אותם אוטומטית

---

## 4. ticker_prices

- **מודל קיים:** `api/models/ticker_prices.py`
- **שימוש:** endpoints של positions/summary משתמשים ב־ticker/price
- **צעד הבא:** שימוש מפורש ב־ticker_prices לפי צורך (למשל endpoint ל-reference) — בהמשך

---

**log_entry | TEAM_20 | TO_TEAM_10 | STAGE1_NEXT_SERVER_STEP_COMPLETION | 2026-01-31**

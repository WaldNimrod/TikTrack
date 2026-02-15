# Team 20 → Teams 10 & 30: מצב שוק (Market Status) — הודעת השלמה

**id:** `TEAM_20_TO_TEAMS_10_30_MARKET_STATUS_UI_COMPLETE`  
**from:** Team 20 (Backend)  
**to:** Team 10 (Gateway), Team 30 (UI)  
**date:** 2026-01-31  
**נושא:** הצגת מצב פתיחת השוק ליד שעון עדכון הנתונים — מפתח צבעים

---

## 1. סיכום

הושלם מימוש **מצב שוק** (Market Status) — מוצג ליד שעון ה-staleness כ־**מפתח צבעים** בדפים הרלוונטיים (tickers, trading_accounts, cash_flows, brokers_fees, data dashboard).

---

## 2. מה הושלם (Team 20)

### 2.1 Backend — API חדש

| פריט | ערך |
|------|------|
| **Method** | `GET` |
| **Path** | `/api/v1/system/market-status` |
| **Auth** | Bearer token (get_current_user) |
| **מקור נתונים** | Yahoo Finance v7/quote (SPY) — `marketState` |

### 2.2 תשובת API

```json
{
  "market_state": "REGULAR",
  "display_label": "שוק פתוח"
}
```

ערכי `market_state`: `REGULAR` | `PRE` | `POST` | `CLOSED` | `unknown`

ערכי `display_label` (עברית):

- `REGULAR` → שוק פתוח  
- `PRE` / `PREPRE` → פרהמרקט  
- `POST` / `POSTPOST` → אפטר מרקט  
- `CLOSED` → שוק סגור  
- `unknown` / כישלון → —

### 2.3 קבצי Backend שנוספו/שונו

| קובץ | שינוי |
|------|-------|
| `api/routers/system.py` | **חדש** — Router ל־`/system/market-status` |
| `api/services/market_status_service.py` | **חדש** — שליפה מ-Yahoo (SPY) |
| `api/integrations/market_data/providers/yahoo_provider.py` | הוספת `_fetch_market_status_sync()` |
| `api/main.py` | רישום `system.router` |

---

## 3. שינויים ב־UI (Team 20 — קובצי Core)

### 3.1 eodStalenessCheck.js

- קריאה מקבילה ל־`/reference/exchange-rates` ו־`/system/market-status`
- העברת `market_state` ו־`display_label` ל־`updateStalenessClock()`

### 3.2 stalenessClock.js

- פרמטר שלישי: `marketStatus` — `{ market_state, display_label }`
- רנדור **מפתח צבעים** (`#market-status-key`) ליד השעון
- מחלקות CSS: `market-status--open` (ירוק) | `market-status--pre/post` (כתום) | `market-status--closed` (אפור)

### 3.3 phoenix-components.css

- `.market-status-key` — סגנון בסיסי
- `.market-status--open` — רקע ירוק שקוף
- `.market-status--pre`, `.market-status--post` — רקע כתום שקוף
- `.market-status--closed` — רקע אפור שקוף

---

## 4. דפים מושפעים

הדפים שכבר טוענים `stalenessClock.js` + `eodStalenessCheck.js` יציגו אוטומטית גם את מפתח מצב השוק:

- `tickers.html`
- `trading_accounts.html`
- `cash_flows.html`
- `brokers_fees.html`
- דשבורד נתונים (אם רלוונטי)

---

## 5. בקשות לצוותים

### Team 10 (Gateway)

- עדכון D15_SYSTEM_INDEX / מדריך API — הוספת `GET /api/v1/system/market-status`
- בדיקת QA — שעון + מפתח צבעים בדפים הרלוונטיים

### Team 30 (UI)

- בדיקת תצוגה — מפתח הצבעים אכן מופיע ליד השעון
- במקרה כישלון (401, network) — מפתח הצבעים מוסתר (קיים כבר)
- בדיקת נגישות — `aria-label` ו־`title` על מפתח הצבעים

---

## 6. תיעוד נוסף

- `documentation/05-REPORTS/artifacts/TEAM_20_MARKET_STATUS_PROVIDER_RESEARCH.md` — מחקר ספקי נתונים
- `documentation/99-ARCHIVE/OLD_LOGIC_ATTEMPTS/WP_20_03_ENTITY_TIME_MARKET.md` — אפיון מקורי

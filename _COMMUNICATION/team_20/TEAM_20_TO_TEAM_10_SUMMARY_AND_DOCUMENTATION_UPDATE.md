# Team 20 → Team 10: דוח מסכם + עדכון תיעוד

**from:** Team 20 (Backend)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-15  
**subject:** סיכום מצב בדיקות, בקשה לסמן "ממתין לווריפיקציה חוזרת מחר", ועדכון תיעוד

---

## 1. תוצאות בדיקות צוות 50 — קישורים

### 1.1 Evidence מרכזי

| מסמך | נתיב | תיאור |
|------|------|--------|
| **User Tickers QA** | `documentation/05-REPORTS/artifacts/TEAM_50_USER_TICKERS_QA_EVIDENCE.md` | Acceptance criteria, E2E, API script |
| **Crypto + Exchanges QA** | `documentation/05-REPORTS/artifacts/TEAM_50_USER_TICKERS_CRYPTO_EXCHANGE_QA_EVIDENCE.md` | AAPL, BTC, TEVA.TA, ANAU.MI, Fake |
| **Crypto Gaps** | `documentation/05-REPORTS/artifacts/TEAM_50_USER_TICKERS_CRYPTO_EXCHANGE_GAPS_EVIDENCE.md` | פערים ו־Corrective Plan |

### 1.2 דוחות צוות 50 נוספים

- `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_USER_TICKERS_CRYPTO_EXCHANGE_QA_REPORT.md`
- `_COMMUNICATION/team_50/TEAM_50_USER_TICKERS_CRYPTO_EXCHANGE_QA_RUN_REPORT.md`

---

## 2. מדוע הבדיקות כרגע לא מקבלות ירוק מלא

### 2.1 סיבות עיקריות

| סיבה | פרטים |
|------|--------|
| **Yahoo 429 (Rate Limit)** | אחרי קריאות מרובות — Yahoo מחזיר 429; Cooldown 15 דקות. בדיקות רצות ברצף → 429. |
| **Alpha Free Tier** | 25 בקשות/יום; אחרי ניצול — `Information: ...25 requests per day`. |
| **תלות בזמן** | בדיקות עוברות כש־providers "טריים"; נכשלות אחרי עומס. |
| **Crypto / European** | BTC-USD: מיפוי ספקים; TEVA.TA, ANAU.MI: תמיכה בבורסות — חלק מהפערים טופלו, יש עוד. |

### 2.2 סטטוס לפי בדיקה (מתוך TEAM_50_USER_TICKERS_QA_EVIDENCE)

| בדיקה | סטטוס | הערה |
|-------|--------|------|
| AAPL | ✅ 201 | עובד כשספקים זמינים |
| BTC-USD | ⚠️ 422 | Provider לא החזיר — Yahoo 429 / Alpha limits |
| TEVA.TA, ANAU.MI | ⚠️ | תלוי ב־provider mapping ובורסה |
| Fake (ZZZZZZZFAKE999) | ✅ 422 | אימות provider failure |
| E2E 1a, 2, 4, 5 | ✅ PASS | 1b/3 SKIP |

### 2.3 המלצה

להמתין **15–30 דקות** אחרי סשן בדיקות כבד; להריץ שוב מחר כש־Yahoo ו־Alpha במצב "רענן".

---

## 3. בקשה: סטטוס "ממתין לווריפיקציה חוזרת מחר"

**בקשה לצוות 10:** לסמן את פלואו User Tickers / External Data כ־**ממתין לווריפיקציה חוזרת מחר** (PENDING_VERIFICATION_TOMORROW).

**נימוקים:**
1. מימוש Yahoo Gold Standard (11 חוקים) הושלם — דורש אישור Team 90.
2. Cooldown Protocol (SOP-015) הוטמע — צריך לוגים לאודיט.
3. בדיקות Provider תלויות ב־rate limits; וריפיקציה חוזרת מחר תעריך מצב "טבעי".

---

## 4. עדכוני תיעוד — שינויים וסטנדרים (לעדכון D15 / Drive)

### 4.1 Yahoo Gold Standard — 11 חוקי זהב

| מסמך | שינוי |
|------|--------|
| **EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC** | נוספו 11 חוקי זהב, Cooldown Protocol (SOP-015), Precision 20,8 |
| **YAHOO_FINANCE_DATA_AND_REQUEST_LOGIC** | Fallback: yfinance **בלי Session** (Rule 1) |

### 4.2 קוד — שינויים מהותיים

| קובץ | שינוי |
|------|--------|
| **yahoo_provider.py** | הסרת Session מ־yfinance (Rule 1); 429 → set_cooldown לפני raise; לוג SOP-015 |
| **provider_cooldown.py** | `get_cooldown_status()` — דיווח לוגים ל־Team 90 |
| **sync_ticker_prices_eod.py** | `📋 [SOP-015] {provider} in cooldown: {sec}s remaining` בתחילת fetch |
| **sync_ticker_prices_intraday.py** | idem |
| **sync_ticker_prices_history_backfill.py** | idem (ב־main) |

### 4.3 סטנדרים חדשים/מעודכנים

| סטנדר | תיאור |
|-------|--------|
| **SOP-015** | Cooldown Protocol — לוגי 429, get_cooldown_status, אין אישור קונקטור ללא לוגים |
| **MISSION-90-02** | Yahoo Gold Standard — 11 חוקים, חקירת Legacy, Verdict: Yahoo כספק ראשי |
| **Precision 20,8** | ללא פשרות — `_to_decimal` בכל provider |

### 4.4 מסמכים חדשים

| מסמך | תיאור |
|------|--------|
| **MISSION_90_02_LEGACY_YAHOO_INVESTIGATION_REPORT** | דוח חקירת Legacy, השוואה, Verdict, Implementation Rules |
| **TEAM_20_YAHOO_GOLD_STANDARD_IMPLEMENTATION_REPORT** | Evidence מימוש 11 חוקים, SOP-015 |
| **TEAM_20_TO_TEAM_90_YAHOO_GOLD_STANDARD_DELIVERABLE** | מסירה לצוות 90 לאישור |

### 4.5 נהלים לעדכון ב־D15 / Index

- Provider Specs (Drive): להוסיף 11 חוקי זהב Yahoo, SOP-015.
- MARKET_DATA_PIPE_SPEC: לוודא §8 מעודכן (Cooldown, get_cooldown_status).
- Index / D15_SYSTEM_INDEX: להפנות ל־MISSION_90_02, EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC המתוקן.

---

## 5. סיכום לפעולה

| פעולה | מי |
|-------|-----|
| סמן "ממתין לווריפיקציה חוזרת מחר" | Team 10 |
| עדכן Provider Specs בתיעוד | Team 10 |
| וריפיקציה חוזרת מחר | Team 50 |
| אישור Yahoo + לוגי SOP-015 | Team 90 |

---

**log_entry | TEAM_20 | TO_TEAM_10 | SUMMARY_AND_DOC_UPDATE | PENDING_VERIFICATION | 2026-02-15**

# Team 30 → Team 10: אימוץ הפעלה — External Data P3-012 (Staleness UI)

**id:** `TEAM_30_TO_TEAM_10_EXTERNAL_DATA_ACTIVATION_ACK`  
**from:** Team 30 (Frontend Execution)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-13  
**re:** `TEAM_10_TO_TEAM_30_EXTERNAL_DATA_ACTIVATION.md`, P3-012

---

## 1. מסמכים נקראו

| מסמך | סטטוס |
|------|--------|
| MARKET_DATA_PIPE_SPEC §2.5 | נקרא |
| FOREX_MARKET_SPEC §2.5 | נקרא |
| TT2_MARKET_DATA_RESILIENCE (15m/24h) | נקרא |
| TEAM_10_TO_TEAM_30_EXTERNAL_DATA_M6_MANDATE | נקרא |

---

## 2. מימוש קיים (P3-012)

| רכיב | תיאור |
|------|--------|
| **stalenessClock.js** | שעון + צבע + tooltip (אין באנר) |
| **eodStalenessCheck.js** | קריאה ל־`/reference/exchange-rates`; קורא ל־`updateStalenessClock(staleness)` |
| **CSS** | `.staleness-clock`, `.staleness-clock--ok`, `--warning`, `--na` |
| **אינטגרציה** | trading_accounts, brokers_fees, cash_flows — טעינת Clock + Check |

---

## 3. התנהגות (תואם M6)

| staleness | צבע | tooltip |
|-----------|-----|---------|
| ok | ירוק (success) | "נתונים מעודכנים" |
| warning | כתום (warning) | "נתונים בני יותר מ־15 דקות — ייתכן שלא מעודכנים" |
| na | אדום (danger) | "נתוני EOD — לא מעודכנים (סוף יום)" |

---

## 4. ללא באנר

- **eodWarningBanner.js** — קיים אך **לא נטען** בעמודים (הוחלף ב־Clock).
- כל העמודים משתמשים ב־**stalenessClock** בלבד.

---

## 5. המשך

- חוזה UI (שדות מהשירות): `staleness`, `price_timestamp`, `fetched_at`, `is_stale` — מאומת מול exchange-rates API.
- הרחבה: הוספת Clock לתצוגות מחיר/שער נוספות (טבלאות, פוזיציות) — בעת הצורך.

---

**log_entry | TEAM_30 | EXTERNAL_DATA_ACTIVATION | P3_012_ACK | 2026-02-13**

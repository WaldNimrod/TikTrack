# P3-005: טיוטת עדכון FOREX_MARKET_SPEC לפי ADR-022

**id:** `TEAM_20_P3_005_FOREX_MARKET_SPEC_UPDATE_DRAFT`  
**משימה:** P3-005 — תיקון 1-001 Gate-B  
**מקור:** ADR-022 (ARCHITECT_VERDICT_MARKET_DATA_STAGE_1.md); TEAM_90_STAGE1_1_001_1_003_1_004_GATE_B_REVIEW  
**יעד:** להעלות ל־`documentation/01-ARCHITECTURE/FOREX_MARKET_SPEC.md` (קידום ע"י Team 10)

---

## סעיפים להשלמה / עדכון ב-FOREX_MARKET_SPEC.md

### 1. Providers (ספקים) — ADR-022

**נוסח מוצע:**
```
## Providers (ספקי שערי FX)

| ספק | שימוש | הערות |
|-----|--------|------|
| **Alpha Vantage** | Primary | ראשי |
| **Yahoo Finance** | Fallback | גיבוי |
| ~~Frankfurter~~ | **אין** | הוסר לפי ADR-022 |

**החלטה:** Yahoo + Alpha בלבד. אין שימוש ב-Frankfurter.
```

### 2. FX EOD Only

**נוסח מוצע:**
```
## מקור נתונים — FX EOD בלבד

- **EOD (End-of-Day):** שערי חליפין נמשכים פעם ביום (סנכרון EOD).
- **אין Real-Time:** לא נעשה שימוש בשערי real-time.
- **Primary/Fallback:** Alpha Vantage → Yahoo (בעת כשל או חוסר נתונים).
```

### 3. Cache-First (חובה)

**נוסח מוצע:**
```
## Cache-First Enforcement

- **חובה:** אין פנייה ל-API חיצוני לפני בדיקת local cache.
- **מקור נתונים ל-Endpoint:** קריאה מ־`market_data.exchange_rates` (מטמון/DB).
- **סנכרון:** Team 60 — cron/job מרענן את הטבלה (EOD). אין קריאה חיצונית מתוך request.
```

### 4. Scope מטבעות

**נוסח מוצע:**
```
## Scope מטבעות

**מטבעות נתמכים (טווח ראשוני):** USD, EUR, ILS.

- הרחבה עתידית — לפי החלטת Product.
```

### 5. Visual Warning (התרעה ויזואלית)

**נוסח מוצע:**
```
## Visual Warning (EOD)

- **חובה:** התרעה למשתמש כאשר מוצג מחיר/שער EOD (סוף יום).
- **מימוש:** שדה `staleness` בתגובת API: `ok` | `warning` (>15 דקות) | `na` (>24 שעות).
- **Frontend:** להציג אזהרה כאשר `staleness` ≠ `ok`.
```

---

## הפניות

| מסמך | נתיב |
|------|------|
| ADR-022 | _COMMUNICATION/90_Architects_comunication/ARCHITECT_VERDICT_MARKET_DATA_STAGE_1.md |
| Gate-B Review | _COMMUNICATION/team_90/TEAM_90_STAGE1_1_001_1_003_1_004_GATE_B_REVIEW.md |

---

**בקשה ל-Team 10:** לקדם סעיפים אלו ל־`documentation/01-ARCHITECTURE/FOREX_MARKET_SPEC.md`.

**log_entry | TEAM_20 | P3_005 | FOREX_MARKET_SPEC_UPDATE_DRAFT | 2026-01-31**

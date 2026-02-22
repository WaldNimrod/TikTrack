# Team 20 → Team 60: Spec סופי + DDL — exchange_rates
**project_domain:** TIKTRACK

**id:** `TEAM_20_TO_TEAM_60_EXCHANGE_RATES_DDL_SPEC`  
**משימה:** 1-002 MARKET_DATA_PIPE  
**תאריך:** 2026-01-31  
**מקור:** documentation/01-ARCHITECTURE/FOREX_MARKET_SPEC.md; WP_20_07_FIELD_MAP_EXCHANGE_RATES  
**בקשה מ-Team 60:** TEAM_60_TO_TEAM_20_STAGE1_1_002_COORDINATION.md §3

---

## 1. Spec סופי — exchange_rates

| שדה | טיפוס | NULL | ברירת מחדל | תיאור |
|-----|-------|------|------------|--------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| from_currency | VARCHAR(3) | NOT NULL | — | ISO 4217 מקור |
| to_currency | VARCHAR(3) | NOT NULL | — | ISO 4217 יעד |
| conversion_rate | NUMERIC(20, 8) | NOT NULL | — | שער המרה |
| last_sync_time | TIMESTAMPTZ | NOT NULL | now() | זמן סנכרון UTC |
| created_at | TIMESTAMPTZ | NOT NULL | now() | יצירה |
| updated_at | TIMESTAMPTZ | NOT NULL | now() | עדכון |

**אילוץ ייחודיות:** UNIQUE(from_currency, to_currency) — מניעת כפילויות.

**סכמה:** market_data (תואם ל-ticker_prices).

---

## 2. DDL — להרצה ע"י Team 60

```sql
-- exchange_rates — Stage-1 (1-002) per FOREX_MARKET_SPEC
-- Schema: market_data (reference data)
-- Responsibility: Team 60 (DDL execution)

CREATE TABLE IF NOT EXISTS market_data.exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_currency VARCHAR(3) NOT NULL,
    to_currency VARCHAR(3) NOT NULL,
    conversion_rate NUMERIC(20, 8) NOT NULL,
    last_sync_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT exchange_rates_from_to_unique UNIQUE (from_currency, to_currency),
    CONSTRAINT exchange_rates_positive_rate CHECK (conversion_rate > 0)
);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_from_to 
    ON market_data.exchange_rates(from_currency, to_currency);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_last_sync 
    ON market_data.exchange_rates(last_sync_time);

COMMENT ON TABLE market_data.exchange_rates IS 'Exchange rates for currency conversion (D21 CURRENCY_CONVERSION). Per FOREX_MARKET_SPEC.';
COMMENT ON COLUMN market_data.exchange_rates.conversion_rate IS 'NUMERIC(20,8) per .cursorrules.';
```

---

## 3. מיקום קובץ DDL מומלץ

`scripts/migrations/create_exchange_rates_table.sql` — Team 60 יוצר ומריץ.

---

## 4. תלות

- **FOREX_MARKET_SPEC:** קיים ב־`documentation/01-ARCHITECTURE/FOREX_MARKET_SPEC.md` ✅
- **MARKET_DATA_PIPE_SPEC:** קיים ב־`documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md` ✅

---

**Team 20 (Backend)**  
**log_entry | TEAM_20 | TO_TEAM_60 | EXCHANGE_RATES_DDL_SPEC | 2026-01-31**

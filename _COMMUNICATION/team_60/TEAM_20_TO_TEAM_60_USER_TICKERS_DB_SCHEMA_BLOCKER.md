# Team 20 → Team 60: חסימת DB — טבלאות חסרות (User Tickers)

**מאת:** Team 20 (Backend)  
**אל:** Team 60 (DevOps & Platform)  
**תאריך:** 2026-01-31  
**נושא:** 🔴 **חסימה** — POST /me/tickers נכשל עקב סכמת DB לא מלאה  
**עדיפות:** P1 — חוסם User Tickers ("הטיקרים שלי")

**סטטוס:** ✅ **נפתר** — Team 60 הריץ P3-021. ראה `TEAM_60_TO_TEAM_50_P3_021_DB_BLOCKER_RESOLVED.md`, `TEAM_60_P3_021_MIGRATION_EVIDENCE.md`.

---

## 1. הוכחות (Evidence)

### 1.1 שגיאה

```
ForeignKey associated with column 'tickers.exchange_id' could not find table 'market_data.exchanges' with which to generate a foreign key to target column 'id'
```

### 1.2 הקשר

- **Endpoint:** `POST /api/v1/me/tickers?symbol=AAPL&ticker_type=STOCK` (ותבניות דומות)
- **פעולה:** יצירת Ticker חדש ב־`market_data.tickers` + קישור ל־user
- **נקודת כשל:** ה־ORM (SQLAlchemy) מבצע `db.add(ticker)` — הטבלה `tickers` מוגדרת עם FK ל־`market_data.exchanges(id)` אך הטבלה `exchanges` אינה קיימת ב־DB

### 1.3 תוצאות QA

| בדיקה | תוצאה | הערה |
|-------|--------|------|
| POST (fake) | 422 | שגיאת FK (לא 422 צפויה מ-provider) |
| POST (AAPL) | 409 | כבר ברשימה — לא יוצר Ticker חדש |
| POST (BTC) | 422 | שגיאת FK |
| POST (TEVA.TA) | 422 | שגיאת FK |
| POST (ANAU.MI) | 422 | שגיאת FK |

**הערה:** גם עם `SKIP_LIVE_DATA_CHECK=true` — הכשל הוא ב־DB, לא ב־provider.

---

## 2. דרישות סכמה

### 2.1 טבלאות נדרשות (לפי סדר תלות FK)

| # | טבלה | סכמה | תלות |
|---|------|------|------|
| 1 | `exchanges` | market_data | אין |
| 2 | `sectors` | market_data | אין |
| 3 | `industries` | market_data | sectors.id |
| 4 | `market_cap_groups` | market_data | אין |
| 5 | `tickers` | market_data | exchanges, sectors, industries, market_cap_groups |

### 2.2 ENUM נדרש

- `market_data.exchange_status` — עבור `exchanges.status`

### 2.3 Seed נתונים (מינימלי)

- `market_data.exchanges` — NASDAQ, NYSE, LSE, TASE (לפי DDL)
- `market_data.sectors` — Technology, Healthcare, וכו'
- `market_data.market_cap_groups` — Mega, Large, Mid, וכו'

---

## 3. מקור אמת (SSOT)

**DDL מלא:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`

- **שורות 69–86:** `market_data.exchanges`
- **שורות 88–101:** `market_data.sectors`
- **שורות 104–119:** `market_data.industries`
- **שורות 122–139:** `market_data.market_cap_groups`
- **שורות 141–184:** `market_data.tickers`
- **שורות 1406–1438:** Seed (exchanges, sectors, market_cap_groups)

---

## 4. פעולות נדרשות (Team 60)

| # | משימה | קריטריון הצלחה |
|---|-------|-----------------|
| 1 | **בדיקה** | `psql $DATABASE_URL -c "\dt market_data.ex*"` — האם `exchanges` קיימת? |
| 2 | **הרצת DDL** | הרצת הקטעים הרלוונטיים מ־PHX_DB_SCHEMA_V2.5_FULL_DDL.sql (exchanges, sectors, industries, market_cap_groups + seed) — או יצירת migration ממוקד |
| 3 | **אימות** | `SELECT COUNT(*) FROM market_data.exchanges` — מחזיר ≥1 |
| 4 | **בדיקת POST** | `bash scripts/run-user-tickers-qa-api.sh` — POST (BTC) → 201 או 409 (לא 422) |

---

## 5. סקריפט migration ממוקד

**קובץ:** `scripts/migrations/p3_021_market_data_reference_tables.sql`

**הרצה:**
```bash
# דרך Docker (תלוי בשם ה-container)
docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db < scripts/migrations/p3_021_market_data_reference_tables.sql

# או ישיר
psql "$DATABASE_URL" -f scripts/migrations/p3_021_market_data_reference_tables.sql
```

**תוכן:** יצירת `exchanges`, `sectors`, `industries`, `market_cap_groups` + seed (מקוצר).

---

## 6. תלות

**Team 20 לא יכול:**
- להריץ POST /me/tickers (יצירת טיקר חדש) ללא טבלאות ה-reference.
- להשלים QA מלא ל־User Tickers.

**לאחר תיקון:** Team 20 יבצע אימות מחדש ויודיע ל-Team 10.

---

## 7. קבצים רלוונטיים

| קובץ | תיאור |
|------|--------|
| `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` | DDL מלא |
| `api/models/tickers.py` | Ticker — exchange_id FK ל־exchanges |
| `documentation/05-REPORTS/artifacts/TEAM_20_PROVIDERS_FULL_COVERAGE_EVIDENCE.md` | Evidence + הקשר |

---

## 8. הפניות

- **TEAM_20_PROVIDERS_FULL_COVERAGE_EVIDENCE:** `documentation/05-REPORTS/artifacts/TEAM_20_PROVIDERS_FULL_COVERAGE_EVIDENCE.md`
- **PHX_DB_SCHEMA_V2.5:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`

---

**Team 20 (Backend)**  
**log_entry | TEAM_20 | TO_TEAM_60 | USER_TICKERS_DB_SCHEMA_BLOCKER | 2026-01-31**

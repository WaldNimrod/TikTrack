# Team 20: דוח סגירת בץ 2.5 (ADR-017/ADR-018)

**מאת:** Team 20 (Backend & DB)  
**תאריך:** 2026-02-13  
**מקור:** `_COMMUNICATION/90_Architects_comunication/BATCH_2_5_COMPLETIONS_MANDATE.md`, `_COMMUNICATION/90_Architects_comunication/ARCHITECT_BROKER_REFERENCE_AND_OTHER_LOGIC.md`  
**עדכון:** בהתאם להודעה — סגירה מחייבת, אין "ממתין"  
**תגובה להודעה:** "הודעה לצוות 20 — סגירת בץ 2.5 (ADR‑017/018)"

---

## 1. סיכום ביצוע

| משימה | סטטוס | תוצר |
|-------|--------|------|
| **1. יישור גרסת API ל-1.0.0** | ✅ | api/__init__.py, OpenAPI 1.0.0 |
| **2. רפקטור עמלות + Data Migration Plan** | ✅ | תוכנית מיגרציה, סקריפט DDL, brokers_fees→trading_account_id |
| **3. ברוקר "אחר" — חסימת API/ייבוא** | ✅ | is_broker_supported(), GET /api-import-eligible, 403 |

---

## 2. משימה 1 — גרסה 1.0.0

### קבצים שעודכנו

| קובץ | שינוי |
|------|--------|
| `api/__init__.py` | __version__ = "1.0.0" |
| `documentation/07-CONTRACTS/OPENAPI_SPEC_V2_FINAL.yaml` | version: 1.0.0 |
| `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml` | version: 1.0.0 |
| `documentation/07-CONTRACTS/TEAM_20_DATA_MODELS.py` | v1.0.0 |

**קריטריון:** אין 2.x בגרסת API/תיעוד — ✅.

---

## 3. משימה 2 — רפקטור עמלות (trading_account_fees)

### תוכנית מיגרציה

- **מסמך:** `documentation/05-PROCEDURES/TEAM_20_TRADING_ACCOUNT_FEES_MIGRATION_PLAN.md`
- **סקריפט DDL:** `scripts/migrations/rename_brokers_fees_to_trading_account_fees.sql`

### תלות

- **Team 60:** הרצת DDL, העתקת נתונים, אימות
- **Team 20:** עדכון מודלים/routers לאחר מיגרציה (לפי התוכנית)

### מצב נוכחי

- `brokers_fees` עדיין בשימוש; קשר `trading_account_id` קיים (ADR-015).
- התוכנית מפרטת את שלבי המיגרציה ל-`trading_account_fees`.

---

## 4. משימה 3 — ברוקר "אחר" (ADR-018)

### מימוש

| רכיב | קובץ | תיאור |
|------|------|--------|
| `is_broker_supported()` | `api/services/reference_service.py` | בודק אם ברוקר תומך ב-API/ייבוא |
| `GET /trading_accounts/{id}/api-import-eligible` | `api/routers/trading_accounts.py` | מחזיר 200 + eligible=true או 403 |
| `BROKER_NOT_SUPPORTED_FOR_API_IMPORT` | `api/utils/exceptions.py` | קוד שגיאה |

### לוגיקה

- `other`, `אחר` → לא נתמך (is_supported=false).
- ברוקר מותאם שלא ב-defaults → לא נתמך.
- ברוקר מ-defaults עם is_supported=true → נתמך.

### קריטריון

- חסימה ברמת Backend — ✅ (403 מ-endpoint api-import-eligible).

---

## 5. Evidence — קישורים

| תוצר | נתיב |
|------|------|
| גרסת API | `api/__init__.py` |
| OpenAPI | `documentation/07-CONTRACTS/OPENAPI_SPEC_V2_FINAL.yaml` |
| תוכנית מיגרציה | `documentation/05-PROCEDURES/TEAM_20_TRADING_ACCOUNT_FEES_MIGRATION_PLAN.md` |
| סקריפט DDL | `scripts/migrations/rename_brokers_fees_to_trading_account_fees.sql` |
| לוגיקת ADR-018 | `api/services/reference_service.py` (is_broker_supported), `api/routers/trading_accounts.py` (api-import-eligible) |

---

## 6. המשך נדרש

| צוות | פעולה |
|------|--------|
| **Team 60** | הרצת מיגרציה brokers_fees → trading_account_fees, דיווח |
| **Team 30** | קריאה ל-`GET /trading_accounts/{id}/api-import-eligible` לפני הצגת UI של API/ייבוא; השבתת כפתורים כאשר eligible=false |
| **Team 90** | אימות חסימה (Spy) |

---

## 7. Evidence — קישורים מלאים

| תוצר | נתיב מלא |
|------|----------|
| גרסת API | `api/__init__.py` (__version__ = "1.0.0") |
| VERSION (root) | `VERSION` (1.0.0) |
| OpenAPI V2 Final | `documentation/07-CONTRACTS/OPENAPI_SPEC_V2_FINAL.yaml` (version: 1.0.0) |
| OpenAPI V2.5.2 | `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml` (version: 1.0.0) |
| תוכנית מיגרציה | `documentation/05-PROCEDURES/TEAM_20_TRADING_ACCOUNT_FEES_MIGRATION_PLAN.md` |
| סקריפט DDL | `scripts/migrations/rename_brokers_fees_to_trading_account_fees.sql` |
| README מיגרציה | `scripts/migrations/README_TRADING_ACCOUNT_FEES_MIGRATION.md` |
| is_broker_supported | `api/services/reference_service.py` (שורות 27–42) |
| api-import-eligible | `api/routers/trading_accounts.py` (שורות 128–163) |
| BROKER_NOT_SUPPORTED | `api/utils/exceptions.py` |
| defaults_brokers | `api/data/defaults_brokers.json` (other: is_supported=false) |

---

## 8. קריטריוני הצלחה — אימות

| # | קריטריון | אימות |
|---|----------|--------|
| 1 | אין 2.x בגרסת API/תיעוד | ✅ api 1.0.0, OpenAPI 1.0.0, VERSION 1.0.0 |
| 2 | נתוני עמלות לא תלויים ב‑broker כ‑FK | ✅ brokers_fees.trading_account_id (ADR-015) |
| 3 | תוכנית מיגרציה מתועדת | ✅ TEAM_20_TRADING_ACCOUNT_FEES_MIGRATION_PLAN.md |
| 4 | חסימה אפקטיבית ברמת Backend (ADR-018) | ✅ GET /trading_accounts/{id}/api-import-eligible → 403 |

---

**Team 20 (Backend)**  
**log_entry | TEAM_20 | BATCH_2_5_CLOSURE_REPORT | 2026-02-13**

# Team 50 | ולידציה מול ספקי נתונים חיצוניים — הוספה/עריכת טיקר (v1.1.0)

**project_domain:** TIKTRACK  
**id:** TEAM_50_TICKER_EXTERNAL_PROVIDER_VALIDATION_FINDINGS_v1.1.0  
**from:** Team 50 (QA)  
**date:** 2026-01-31  
**status:** COMPLETE  
**changelog:** v1.0.0 → v1.1.0: יישום דרישות — תהליך אחיד, בדיקה חובה כברירת מחדל, ולידציה בעריכה.

---

## דרישות (מהמבקש)

1. **תהליך אחיד:** הוספת סימבול ראשי (ניהול טיקרים — D22) והוספת סימבול חדש שלא קיים במערכת דרך "הטיקרים שלי" (D33) — **בדיוק אותו תהליך**.
2. **בדיקה חובה:** להגדיר את הבדיקה כחובה בסביבה הנוכחית; לעדכן דגל בסביבה ו**ברירת מחדל = הבדיקה רצה**.
3. **ולידציה בעריכה:** חובה לבצע ולידציה מול ספקים **בעת עריכה** — כאשר שינינו את **הסמל** או את **הבורסה** (exchange) של הטיקר.

---

## סיכום מנהלים (לאחר יישום)

| תהליך | ולידציה מול ספקים | סטטוס |
|--------|---------------------|--------|
| **הוספת טיקר (ניהול טיקרים — D22)** | ✅ **כן** — אותה זרימה קנונית (`create_system_ticker`, `skip_live_check=False`) | יישום הושלם |
| **הוספת טיקר ל"הטיקרים שלי" (לפי סמל)** | ✅ **כן** — **אותו תהליך**: `create_system_ticker(..., skip_live_check=False, market=...)` | יישום הושלם |
| **עריכת טיקר (D22)** | ✅ **כן** — כאשר **סמל / סוג טיקר / בורסה** משתנים → `validate_ticker_with_providers` לפני עדכון | יישום הושלם |
| **ברירת מחדל** | **הבדיקה רצה** — `RUN_LIVE_SYMBOL_VALIDATION=true` ב־config ו־.env.example; עקיפה רק עם `SKIP_LIVE_DATA_CHECK=true` (dev) | יישום הושלם |

---

## 1. תהליך אחיד — הוספת טיקר (D22 ו־D33)

### עיקרון

- **נתיב יחיד:** שני המקורות (ניהול טיקרים + הטיקרים שלי לפי סמל) משתמשים ב־**`create_system_ticker`** מ־`canonical_ticker_service` עם **`skip_live_check=False`**.
- **ולידציה:** מתבצעת **בתוך** `create_system_ticker` — `_live_data_check(symbol, ticker_type, market)` (Yahoo → Alpha). כישלון → 422, טיקר לא נוצר.

### D22 — ניהול טיקרים

- **UI:** `tickersTableInit.js` → `handleAdd()` → `POST /tickers` עם formData.
- **שירות:** `tickers_service.create_ticker()` → `create_system_ticker(..., skip_live_check=False, market=None)`.
- אין עוד תלות ב־`settings.debug`; הבדיקה רצה אלא אם `RUN_LIVE_SYMBOL_VALIDATION=false` או `SKIP_LIVE_DATA_CHECK=true`.

### D33 — הטיקרים שלי (סמל חדש)

- **API:** `POST /me/tickers?symbol=...&ticker_type=...` → `user_tickers_service.add_ticker()`.
- **לוגיקה:** בדיקת `_fake_patterns` (סמלים בדויים) → **רק** `create_system_ticker(..., skip_live_check=False, market=market)` (ללא `_live_data_check` כפול).
- **תוצאה:** אותו נתיב קנוני; ולידציה מתבצעת פעם אחת ב־`create_system_ticker`.

### קבצים שעודכנו

- `api/services/canonical_ticker_service.py` — `create_system_ticker` מקבל `market`; לוגיקת `do_live` מבוססת על `run_live_symbol_validation` ו־`skip_live_check=False` כברירת מחדל.
- `api/services/tickers_service.py` — `create_ticker` קורא ל־`create_system_ticker(..., skip_live_check=False)`.
- `api/services/user_tickers_service.py` — הוסר `_live_data_check` לפני יצירה; קורא ל־`create_system_ticker(..., skip_live_check=False, market=market)`.

---

## 2. בדיקה חובה — ברירת מחדל והגדרות סביבה

### שינויים בקוד

- **`api/core/config.py`:**  
  - הוסף: `run_live_symbol_validation: bool = True` (משתנה env: `RUN_LIVE_SYMBOL_VALIDATION`).  
  - ברירת מחדל: **True** — הבדיקה רצה אלא אם explicitly מכבים.

- **`api/services/canonical_ticker_service.py`:**  
  - `do_live = run_validation and not _is_live_check_bypass() and (force_validate or not skip_live_check)`.  
  - כאשר `skip_live_check=False` (ברירת מחדל בקריאות) ו־`RUN_LIVE_SYMBOL_VALIDATION` לא false — הבדיקה תמיד רצה (מלבד `SKIP_LIVE_DATA_CHECK=true`).

### עדכון סביבה

- **`api/.env.example`:**  
  - `RUN_LIVE_SYMBOL_VALIDATION=true` — הבדיקה כחובה.  
  - `SKIP_LIVE_DATA_CHECK=false` — עקיפה רק כשמופעל explicitly (dev).  
  - הערה על `VALIDATE_SYMBOL_ALWAYS` (אופציונלי ל־E2E).

### המלצה להרצה

- **סביבה נוכחית (כולל dev):** להגדיר ב־`api/.env`:  
  - `RUN_LIVE_SYMBOL_VALIDATION=true`  
  - `SKIP_LIVE_DATA_CHECK=false`  
  כך שבאמת מתבצעת בדיקה מול ספקים; רק במקרה חריג (ספקים down) להפעיל `SKIP_LIVE_DATA_CHECK=true`.

---

## 3. ולידציה בעריכה (שינוי סמל / סוג טיקר / בורסה)

### לוגיקה

- **`api/services/tickers_service.py` — `update_ticker()`:**  
  - מזהה שינוי ב־**סמל**, **סוג טיקר** או **בורסה** (`exchange_id`).  
  - לפני עדכון: קורא ל־**`validate_ticker_with_providers(sym_to_validate, ticker_type=type_to_validate, market=None)`** מ־`canonical_ticker_service`.  
  - אם הבדיקה נכשלת → 422 (`TICKER_SYMBOL_INVALID`), הטיקר **לא** מתעדכן.

- **`api/services/canonical_ticker_service.py`:**  
  - פונקציה ציבורית **`validate_ticker_with_providers(symbol, ticker_type, market)`** — מריצה `_live_data_check`; כישלון → זורק 422.

### API ו־Schema

- **`api/schemas/tickers.py` — `TickerUpdateRequest`:**  
  - שדה חדש: **`exchange_id: Optional[str]`** (ULID של בורסה).  
  - כאשר הלקוח שולח שינוי ב־`exchange_id` — מתבצעת ולידציה (יחד עם סמל/סוג אם השתנו).

- **`api/routers/tickers.py`:**  
  - מעביר `payload.exchange_id` ל־`service.update_ticker(..., exchange_id=payload.exchange_id)`.

### UI (הטמעה עתידית)

- בדף עריכת טיקר (ניהול טיקרים) — אם יוצג שדה **בורסה** (exchange), יש לשלוח ב־PUT את `exchange_id` (ULID). ה־Backend כבר תומך בוולידציה בהתאם.

---

## 4. קבצים רלוונטיים (מעודכן)

| קובץ | תפקיד |
|------|--------|
| `api/services/canonical_ticker_service.py` | `_live_data_check`, `create_system_ticker`, **`validate_ticker_with_providers`** — נתיב יחיד ליצירה; ולידציה ליצירה ולעריכה. |
| `api/services/tickers_service.py` | `create_ticker` (קנוני, skip_live_check=False); **`update_ticker`** (ולידציה בעריכת סמל/סוג/bourse). |
| `api/services/user_tickers_service.py` | `add_ticker` — רק `create_system_ticker(..., skip_live_check=False, market=...)` (ללא בדיקה כפולה). |
| `api/core/config.py` | **`run_live_symbol_validation: bool = True`**. |
| `api/schemas/tickers.py` | **`TickerUpdateRequest.exchange_id`**. |
| `api/routers/tickers.py` | POST /tickers, PUT /tickers/{id} (כולל exchange_id). |
| `api/routers/me_tickers.py` | POST /me/tickers. |
| `api/.env.example` | **RUN_LIVE_SYMBOL_VALIDATION=true**, **SKIP_LIVE_DATA_CHECK=false**. |
| `ui/src/views/management/tickers/tickersForm.js` | הצגת שגיאות (#tickerFormValidationSummary, #tickerSymbolError). |

---

## 5. המלצות מפורטות

### 5.1 סביבת הרצה

- **Production:**  
  - להשאיר `RUN_LIVE_SYMBOL_VALIDATION=true`, `SKIP_LIVE_DATA_CHECK=false`.  
  - להבטיח `ALPHA_VANTAGE_API_KEY` מוגדר (fallback כש־Yahoo לא מחזיר נתונים).

- **Dev/QA:**  
  - ברירת מחדל: אותם ערכים — כדי שבאמת נבדוק מול ספקים.  
  - רק במקרה חריג (ספקים down, אין API key): להפעיל `SKIP_LIVE_DATA_CHECK=true` זמנית.

- **E2E:**  
  - אם נדרש לאכוף בדיקה גם כאשר יש skip במקום אחר: `VALIDATE_SYMBOL_ALWAYS=true` (אופציונלי).

### 5.2 UI עריכת טיקר

- **כיום:** הטופס שולח symbol, company_name, ticker_type, status, is_active.  
- **המלצה:** להוסיף שדה **בורסה** (exchange) ולהוסיף ל־formData את `exchange_id` (ULID) ב־PUT — כך ולידציה בעריכת בורסה תעבוד מקצה לקצה.

### 5.3 תיעוד ו־Runbook

- לתעד ב־Runbook/Env:  
  - `ALPHA_VANTAGE_API_KEY` — נדרש ל־fallback (הוספת טיקר + הטיקרים שלי + עריכה).  
  - `RUN_LIVE_SYMBOL_VALIDATION` — ברירת מחדל true; לא לכבות ב־production.  
  - `SKIP_LIVE_DATA_CHECK` — רק dev/QA בחריגים.

### 5.4 בדיקות משלימות

- **E2E / ידני:**  
  - הוספת טיקר (D22) עם סמל לא תקף → 422 והודעת שגיאה ב־#tickerFormValidationSummary / #tickerSymbolError.  
  - הוספת טיקר ל"הטיקרים שלי" עם סמל לא תקף → 422.  
  - עריכת טיקר — שינוי סמל לערך לא תקף → 422; שינוי סמל לתקף → 200.  
  - (כששדה בורסה קיים) שינוי בורסה → ולידציה רצה.

- **איכות:**  
  - לוודא שבסביבת ה־CI/QA לא מוגדר `SKIP_LIVE_DATA_CHECK=true` כברירת מחדל — כך שהבדיקות האוטומטיות באמת מריצות ולידציה.

---

**log_entry | TEAM_50 | TICKER_EXTERNAL_PROVIDER_VALIDATION | FINDINGS_V1.1_IMPLEMENTED | 2026-01-31**

# תוכנית פעולה: המרת commission_value מ-VARCHAR ל-NUMERIC

**אל:** Team 10 (The Gateway)  
**מאת:** Team 30 (Frontend Execution)  
**תאריך:** 2026-01-31  
**מקור:** דרישה להפוך `commission_value` לערך מספרי מדויק  
**סטטוס:** 📋 **תוכנית פעולה — דורש תיאום בין צוותים**

---

## Executive Summary

**בעיה:** `commission_value` מוגדר כ-`VARCHAR(255)` ב-DB, אבל צריך להיות מספר מדויק (`NUMERIC`) כדי לאפשר חישובים מדויקים ועמידה בתקני דיוק פיננסי (GIN-003).

**פתרון:** שינוי מלא של הסכמה מ-`VARCHAR(255)` ל-`NUMERIC(20,8)` (או `NUMERIC(20,6)`) בכל השכבות.

---

## 1. ניתוח המצב הנוכחי

### 1.1. DB Schema (נוכחי)
```sql
commission_value VARCHAR(255) NOT NULL
```

**דוגמאות ערכים נוכחיים:**
- `"0.0035 $ / Share"`
- `"$0.00"`
- `"0.1%"`

### 1.2. Backend (נוכחי)
- **Model:** `String(255)` (SQLAlchemy)
- **Schema:** `str` (Pydantic)
- **API:** מקבל ומחזיר מחרוזת

### 1.3. Frontend (נוכחי)
- **טופס:** מקבל מחרוזת (כולל יחידות)
- **הצגה:** מחרוזת מפורמטת (למשל: `"0.0035 $ / Share"`)

---

## 2. המצב הרצוי

### 2.1. DB Schema (רצוי)
```sql
commission_value NUMERIC(20, 8) NOT NULL
-- או NUMERIC(20, 6) בהתאם לדרישות דיוק
```

**הצדקה:**
- דיוק פיננסי (GIN-003) — כל שדות פיננסיים חייבים להיות `NUMERIC`
- חישובים מדויקים — אפשרות לבצע חישובים מתמטיים על הערך
- עמידה בתקנים — SEC/IRS compliance

### 2.2. Backend (רצוי)
- **Model:** `Numeric(20, 8)` (SQLAlchemy)
- **Schema:** `Decimal` (Pydantic)
- **API:** מקבל ומחזיר מספר (Decimal)

### 2.3. Frontend (רצוי)
- **טופס:** מקבל מספר טהור (למשל: `0.0035`)
- **הצגה:** מפורמטת עם יחידות (למשל: `"0.0035 $ / Share"`)
- **שמירה:** שולח מספר ל-API

---

## 3. תוכנית פעולה מפורטת

### שלב 1: Team 60 (DevOps) — DDL Migration

**משימות:**
1. יצירת migration script להמרת `commission_value` מ-`VARCHAR(255)` ל-`NUMERIC(20,8)`
2. טיפול בערכים קיימים:
   - חילוץ מספר מתוך מחרוזות (למשל: `"0.0035 $ / Share"` → `0.0035`)
   - טיפול בערכים לא תקינים (NULL, מחרוזות ריקות)
   - שמירת ערכי ברירת מחדל (למשל: `0`)
3. בדיקת migration על staging
4. הרצת migration על production

**קובץ נדרש:**
- `scripts/migrations/migrate_commission_value_to_numeric.sql`

**הערה:** נדרש להחליט על רמת דיוק:
- `NUMERIC(20, 8)` — 8 ספרות אחרי הנקודה (כמו `minimum`)
- `NUMERIC(20, 6)` — 6 ספרות אחרי הנקודה (כמו שדות פיננסיים אחרים)

### שלב 2: Team 20 (Backend) — Model & Schema Update

**משימות:**
1. עדכון `api/models/brokers_fees.py`:
   ```python
   # לפני:
   commission_value: Mapped[str] = mapped_column(String(255), nullable=False)
   
   # אחרי:
   commission_value: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
   ```

2. עדכון `api/schemas/brokers_fees.py`:
   ```python
   # לפני:
   commission_value: str = Field(..., max_length=255)
   
   # אחרי:
   commission_value: Decimal = Field(..., description="Commission value (numeric)")
   ```

3. עדכון validation:
   - הוספת ולידציה: `>= 0` (אם רלוונטי)
   - הסרת ולידציה של `max_length`

4. עדכון API documentation:
   - `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_30_PHASE_2_API_INTEGRATION_GUIDE.md`
   - `_COMMUNICATION/team_20/WP_20_09_FIELD_MAP_BROKERS_FEES.md`

5. בדיקות:
   - Unit tests
   - Integration tests
   - בדיקת backward compatibility (אם יש נתונים קיימים)

### שלב 3: Team 30 (Frontend) — Form & Display Update

**משימות:**
1. עדכון `ui/src/views/financial/brokersFees/brokersFeesForm.js`:
   - שינוי שדה `commissionValue` מ-`type="text"` ל-`type="number"`
   - הוספת `step="0.00000001"` (או `step="0.000001"` בהתאם לרמת דיוק)
   - הוספת `min="0"` (אם רלוונטי)
   - ולידציה: בדיקה שהערך הוא מספר תקין

2. עדכון `ui/src/views/financial/brokersFees/brokersFeesTableInit.js`:
   - `handleSaveBrokerFee()` — שליחת מספר (לא מחרוזת) ל-API
   - הסרת פורמטינג לפני שליחה (הפורמטינג רק להצגה)

3. עדכון `ui/src/cubes/shared/tableFormatters.js`:
   - `formatCommissionValue()` — קבלת מספר (לא מחרוזת) ופורמטינג להצגה
   - שמירת הלוגיקה של פורמטינג לפי `commissionType`

4. עדכון `ui/src/cubes/shared/utils/transformers.js`:
   - הסרת `commissionValue` מ-`STRING_ONLY_FIELDS` (כי עכשיו זה מספר)
   - הוספת `commissionValue` ל-`FINANCIAL_FIELDS` (אם לא כבר קיים)

5. בדיקות:
   - בדיקת שמירה מהטופס (מספר טהור)
   - בדיקת הצגה בטבלה (מפורמטת)
   - בדיקת עריכה (טעינת מספר והצגה בטופס)

---

## 4. סדר ביצוע מומלץ

1. **Team 60** — יצירת migration script + בדיקות
2. **Team 20** — עדכון Model & Schema + בדיקות
3. **Team 30** — עדכון Frontend + בדיקות
4. **Team 60** — הרצת migration על staging
5. **Team 50** — בדיקות E2E מלאות
6. **Team 60** — הרצת migration על production

---

## 5. שאלות פתוחות

1. **רמת דיוק:** `NUMERIC(20, 8)` או `NUMERIC(20, 6)`?
   - `NUMERIC(20, 8)` — עקבי עם `minimum` (NUMERIC(20, 8) ב-DDL המקורי, אבל NUMERIC(20, 6) ב-Model)
   - `NUMERIC(20, 6)` — עקבי עם שדות פיננסיים אחרים (`amount`, `commission`, `fee`)

2. **ערכים קיימים:** איך לטפל בערכים קיימים ב-DB?
   - חילוץ מספר מתוך מחרוזות (regex?)
   - ערכי ברירת מחדל (0?) אם לא ניתן לחלץ

3. **יחידות:** איפה לשמור את היחידות (`$ / Share`, `%`, וכו')?
   - אפשרות A: שדה נוסף `commission_unit` (VARCHAR)
   - אפשרות B: נגזר מ-`commission_type` (TIERED → `$ / Share`, FLAT → `%`)
   - אפשרות C: רק מספר, יחידות רק להצגה

4. **Backward Compatibility:** האם צריך לתמוך בערכים ישנים (VARCHAR) זמנית?

---

## 6. המלצות

1. **רמת דיוק:** `NUMERIC(20, 8)` — עקבי עם `minimum` ומאפשר דיוק מקסימלי
2. **יחידות:** אפשרות B — נגזר מ-`commission_type` (פשוט יותר, לא דורש שינוי DB)
3. **Migration:** חילוץ מספר מתוך מחרוזות קיימות + ערך ברירת מחדל `0` אם לא ניתן לחלץ

---

## 7. קבצים שצריכים שינוי

### Team 60:
- `scripts/migrations/migrate_commission_value_to_numeric.sql` (חדש)

### Team 20:
- `api/models/brokers_fees.py`
- `api/schemas/brokers_fees.py`
- `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_30_PHASE_2_API_INTEGRATION_GUIDE.md`
- `_COMMUNICATION/team_20/WP_20_09_FIELD_MAP_BROKERS_FEES.md`

### Team 30:
- `ui/src/views/financial/brokersFees/brokersFeesForm.js`
- `ui/src/views/financial/brokersFees/brokersFeesTableInit.js`
- `ui/src/cubes/shared/tableFormatters.js`
- `ui/src/cubes/shared/utils/transformers.js`

---

**Team 30 (Frontend Execution)**  
**log_entry | TO_TEAM_10 | COMMISSION_VALUE_NUMERIC_MIGRATION_PLAN | SENT | 2026-01-31**

# ✅ Team 20 → Team 10: מיגרציית commission_value הושלמה

**id:** `TEAM_20_COMMISSION_VALUE_MIGRATION_COMPLETE`  
**from:** Team 20 (Backend Implementation)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-10  
**status:** 🟢 **MIGRATION_COMPLETE**  
**version:** v1.0  
**source:** `TEAM_10_TO_TEAMS_20_30_60_COMMISSION_VALUE_MIGRATION_GO.md`

---

## 📋 Executive Summary

**Team 20 מאשר שמיגרציית `commission_value` מ-`VARCHAR(255)` ל-`NUMERIC(20, 6)` הושלמה בהצלחה בכל שכבות ה-Backend:**

✅ **Model** — עודכן ל-`Numeric(20, 6)` / `Decimal`  
✅ **Schemas** — עודכן ל-`Decimal` עם ולידציה `ge=0`  
✅ **Service** — עודכן לטיפול ב-`Decimal` במקום `str`  
✅ **Documentation** — עודכן בכל קבצי התיעוד  
✅ **Validation** — נוספה ולידציה לערכים לא-שליליים

---

## ✅ משימות שבוצעו

### **1. עדכון Model (`api/models/brokers_fees.py`)** ✅

**שינוי:**
- **לפני:** `commission_value: Mapped[str] = mapped_column(String(255), nullable=False)`
- **אחרי:** `commission_value: Mapped[Decimal] = mapped_column(Numeric(20, 6), nullable=False)`

**קוד מעודכן:**
```python
from decimal import Decimal
from sqlalchemy import Numeric

commission_value: Mapped[Decimal] = mapped_column(
    Numeric(20, 6),
    nullable=False
)
```

**שורה:** 69-72

---

### **2. עדכון Schemas (`api/schemas/brokers_fees.py`)** ✅

**שינויים:**

#### **BrokerFeeResponse:**
- **לפני:** `commission_value: str = Field(..., description="Commission value (e.g., '0.0035 $ / Share')", max_length=255)`
- **אחרי:** `commission_value: Decimal = Field(..., description="Commission value (numeric)", ge=0)`

#### **BrokerFeeCreateRequest:**
- **לפני:** `commission_value: str = Field(..., description="Commission value (e.g., '0.0035 $ / Share')", max_length=255)`
- **אחרי:** `commission_value: Decimal = Field(..., description="Commission value (numeric)", ge=0)`

#### **BrokerFeeUpdateRequest:**
- **לפני:** `commission_value: Optional[str] = Field(None, description="Commission value (e.g., '0.0035 $ / Share')", max_length=255)`
- **אחרי:** `commission_value: Optional[Decimal] = Field(None, description="Commission value (numeric)", ge=0)`

**דוגמאות עודכנו:**
- `"commission_value": "0.0035 $ / Share"` → `"commission_value": 0.0035`
- `"commission_value": "$0.00"` → `"commission_value": 0.00`

**שורות:** 21, 52, 86

---

### **3. עדכון Service (`api/services/brokers_fees_service.py`)** ✅

**שינויים:**

#### **חתימות פונקציות:**
- **`create_broker_fee()`:**
  - **לפני:** `commission_value: str`
  - **אחרי:** `commission_value: Decimal`
  
- **`update_broker_fee()`:**
  - **לפני:** `commission_value: Optional[str] = None`
  - **אחרי:** `commission_value: Optional[Decimal] = None`

#### **לוגיקה:**
- **הסרת `.strip()`:** הוסר `commission_value.strip()` (לא רלוונטי ל-`Decimal`)
- **ולידציה:** נוספה ולידציה `commission_value >= 0` ב-`create_broker_fee()` ו-`update_broker_fee()`
- **חיפוש:** עודכן חיפוש ב-`commission_value` להשתמש ב-`func.cast(BrokerFee.commission_value, String).ilike(...)` כדי לאפשר חיפוש במספרים

**קוד מעודכן:**
```python
# Search in broker name and commission_value (cast numeric to text for search)
if search:
    conditions.append(
        or_(
            BrokerFee.broker.ilike(f"%{search}%"),
            func.cast(BrokerFee.commission_value, String).ilike(f"%{search}%")
        )
    )

# Validation in create_broker_fee()
if commission_value < 0:
    raise HTTPExceptionWithCode(
        status_code=400,
        detail="commission_value must be non-negative",
        error_code=ErrorCodes.VALIDATION_INVALID_FORMAT
    )
```

**שורות:** 15 (import String), 82-89 (search), 179, 196-203 (validation), 243, 304-312 (update validation)

---

### **4. עדכון Documentation** ✅

#### **`WP_20_09_FIELD_MAP_BROKERS_FEES.md`:**
- עודכן טבלת שדות: `commission_value` מ-`VARCHAR(255)` ל-`NUMERIC(20, 6)`
- עודכן טיפוס חיצוני: מ-`String` ל-`Decimal`
- עודכנו כל דוגמאות JSON: `commission_value` עכשיו מספר במקום מחרוזת
- עודכן הערה: "טבלת DB נוצרה על ידי Team 60. `commission_value` עודכן ל-`NUMERIC(20, 6)` (מיגרציה הושלמה 2026-02-10)."

#### **`TEAM_20_TO_TEAM_30_PHASE_2_API_INTEGRATION_GUIDE.md`:**
- עודכנו כל ה-TypeScript schemas: `commission_value: string` → `commission_value: number`
- עודכנו כל דוגמאות JSON: `commission_value` עכשיו מספר במקום מחרוזת
- עודכן תיאור: "Decimal (NUMERIC(20,6)), >= 0"

---

## 📁 קבצים שנוצרו/שונו

### **קבצי קוד:**
- ✅ `api/models/brokers_fees.py` (שורה 69-72)
- ✅ `api/schemas/brokers_fees.py` (שורות 21, 52, 86)
- ✅ `api/services/brokers_fees_service.py` (שורות 15, 82-89, 179, 196-203, 243, 304-312)

### **קבצי תיעוד:**
- ✅ `_COMMUNICATION/team_20/WP_20_09_FIELD_MAP_BROKERS_FEES.md`
- ✅ `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_30_PHASE_2_API_INTEGRATION_GUIDE.md`

---

## 🔄 סדר ביצוע (לפי תוכנית)

1. ✅ **Team 60** — DDL Migration (הושלם 2026-02-10)
2. ✅ **Team 20** — Model & Schema Update (`Numeric(20, 6)` / `Decimal`) (הושלם 2026-02-10)
3. ⬜ **Team 30** — Frontend Form & Display Update
4. ⬜ **Team 50** — E2E Testing

---

## ✅ סיכום

### **מה הושלם:**

1. ✅ **Model** — עודכן ל-`Numeric(20, 6)` / `Decimal`
2. ✅ **Schemas** — עודכן ל-`Decimal` עם ולידציה `ge=0`
3. ✅ **Service** — עודכן לטיפול ב-`Decimal` במקום `str`
4. ✅ **Validation** — נוספה ולידציה לערכים לא-שליליים
5. ✅ **Search** — עודכן חיפוש ב-`commission_value` (cast ל-text)
6. ✅ **Documentation** — עודכן בכל קבצי התיעוד

### **מוכן ל:**

- ✅ **Team 30** — יכול להתחיל בעדכון Frontend (טופס והצגה)
- ✅ **Team 50** — יכול להתחיל בבדיקות E2E (אחרי Team 30)

---

## 📝 הערות טכניות

1. **דיוק:** `NUMERIC(20, 6)` — עקבי עם `minimum` ועם תקן Phase 2 (כפי שהוחלט על ידי Gateway).

2. **ולידציה:** נוספה ולידציה `ge=0` ב-Schemas וב-Service כדי להבטיח ערכים לא-שליליים.

3. **חיפוש:** חיפוש ב-`commission_value` עובד באמצעות cast ל-text (`func.cast(BrokerFee.commission_value, String).ilike(...)`), כך שניתן לחפש במספרים.

4. **תאימות לאחור:** אין — מיגרציה חד-פעמית כפי שהוחלט. כל הערכים הקיימים הומרו על ידי Team 60.

5. **JSON Serialization:** `Decimal` מוחזר כ-`number` ב-JSON (לא `string`), בהתאם לתקן JSON.

---

## 🔗 קבצים רלוונטיים

**מקור המנדט:**
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAMS_20_30_60_COMMISSION_VALUE_MIGRATION_GO.md`
- `_COMMUNICATION/team_30/TEAM_30_TO_TEAM_10_COMMISSION_VALUE_NUMERIC_MIGRATION_PLAN.md`

**דוח Team 60:**
- `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_10_COMMISSION_VALUE_MIGRATION_COMPLETE.md`

**קבצי קוד:**
- `api/models/brokers_fees.py`
- `api/schemas/brokers_fees.py`
- `api/services/brokers_fees_service.py`

**קבצי תיעוד:**
- `_COMMUNICATION/team_20/WP_20_09_FIELD_MAP_BROKERS_FEES.md`
- `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_30_PHASE_2_API_INTEGRATION_GUIDE.md`

---

**Team 20 (Backend Implementation)**  
**תאריך:** 2026-02-10  
**סטטוס:** 🟢 **MIGRATION_COMPLETE**

**log_entry | [Team 20] | COMMISSION_VALUE_MIGRATION | COMPLETE | GREEN | 2026-02-10**

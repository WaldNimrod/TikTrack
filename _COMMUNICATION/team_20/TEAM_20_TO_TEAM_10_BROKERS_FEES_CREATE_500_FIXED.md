# Team 20 → Team 10: תיקון Brokers Fees Create (POST 500)

**id:** `TEAM_20_TO_TEAM_10_BROKERS_FEES_CREATE_500_FIXED`  
**from:** Team 20 (Backend Implementation)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-10  
**context:** תיקון תקלה — `POST /api/v1/brokers_fees` מחזיר 500  
**status:** ✅ **FIXED**

---

## 🎯 Executive Summary

**בעיה:** `POST /api/v1/brokers_fees` החזיר 500 Internal Server Error עם `DatatypeMismatchError`.

**סיבה:** אי-התאמה בין המודל ל-DDL — המודל השתמש ב-`String(20)` בעוד שב-DB (כפי שנוצר על ידי `scripts/create_d18_brokers_fees_table.sql`) זה `ENUM user_data.commission_type`.

**תיקון:** עודכן המודל להשתמש ב-`Enum` עם `create_type=False` כדי להתאים ל-ENUM הקיים ב-DB.

---

## 🔴 הבעיה

### **אי-התאמה בין ORM ל-DB:**

**DB (כפי שנוצר על ידי `scripts/create_d18_brokers_fees_table.sql`):**
```sql
CREATE TYPE user_data.commission_type AS ENUM ('TIERED', 'FLAT');
-- ...
commission_type user_data.commission_type NOT NULL
```

**ORM (לפני תיקון):**
```python
commission_type: Mapped[str] = mapped_column(
    String(20),
    nullable=False
)
```

**הבעיה:** המודל ניסה לשלוח `VARCHAR` ל-DB בעוד שהעמודה היא `ENUM`, מה שגרם ל-`DatatypeMismatchError` בעת יצירת רשומה חדשה.

**שגיאת השרת:**
```
asyncpg.exceptions.DatatypeMismatchError: column "commission_type" is of type user_data.commission_type but expression is of type character varying
```

---

## ✅ התיקון

### **1. עדכון המודל (`api/models/brokers_fees.py`)**

**לפני:**
- שימוש ב-`String(20)` - לא תואם ל-ENUM ב-DB

**אחרי:**
- שימוש ב-`Enum` עם `create_type=False` (הטיפוס כבר קיים ב-DB)
- הסרת CHECK constraint על `commission_type` (ה-ENUM כבר מגביל ערכים)

**קוד מעודכן:**
```python
from sqlalchemy import Enum

# DB uses user_data.commission_type ENUM (create_d18_brokers_fees_table.sql) — do not create_type
commission_type_enum = Enum('TIERED', 'FLAT', name='commission_type', schema='user_data', create_type=False)

# ...
commission_type: Mapped[str] = mapped_column(
    commission_type_enum,
    nullable=False
)
```

**`__table_args__` (ללא CHECK על commission_type):**
```python
__table_args__ = (
    CheckConstraint(
        "minimum >= 0",
        name="brokers_fees_minimum_check"
    ),
    {"schema": "user_data"},
)
```

---

### **2. עדכון ה-Service (`api/services/brokers_fees_service.py`)**

**שינויים:**
- SQLAlchemy מטפל אוטומטית בהמרת string ל-Enum בעת הוספה/עדכון
- ה-responses ממירים Enum ל-string באמצעות `.value` אם קיים, אחרת משתמשים בערך ישירות

**מקומות שתוקנו:**
1. `get_brokers_fees()` - פילטר לפי commission_type (SQLAlchemy מטפל בהמרה)
2. `create_broker_fee()` - יצירת broker fee חדש (string מומר אוטומטית ל-Enum)
3. `update_broker_fee()` - עדכון broker fee (string מומר אוטומטית ל-Enum)
4. `get_brokers_fees_summary()` - פילטר לפי commission_type
5. כל ה-responses - המרת Enum ל-string: `fee.commission_type.value if hasattr(fee.commission_type, 'value') else fee.commission_type`

---

## ✅ אימות התיקון

**Endpoint:** `POST /api/v1/brokers_fees`

**Request Body:**
```json
{
  "broker": "QA Test Broker",
  "commission_type": "FLAT",
  "commission_value": "2.00",
  "minimum": 2
}
```

**Expected Response:** `201 Created` עם גוף תגובה תקין

**קבצים מעודכנים:**
- ✅ `api/models/brokers_fees.py` - עודכן ל-Enum במקום String (שורה 24, 64-67)
- ✅ `api/services/brokers_fees_service.py` - SQLAlchemy מטפל אוטומטית בהמרות Enum
- ✅ `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` - עודכן ל-ENUM (שורה 59, 1029)

---

## 📋 Verification Checklist

- [x] ✅ המודל תואם ל-DB (ENUM user_data.commission_type)
- [x] ✅ Enum מוגדר עם `create_type=False` (הטיפוס כבר קיים ב-DB)
- [x] ✅ CHECK constraint על commission_type הוסר (ה-ENUM כבר מגביל ערכים)
- [x] ✅ SQLAlchemy מטפל אוטומטית בהמרת string ל-Enum
- [x] ✅ כל ה-responses ממירים Enum ל-string כראוי
- [x] ✅ SSOT DDL עודכן ל-ENUM (שורה 59, 1029)
- [x] ✅ אין שגיאות lint

---

## 🔗 קבצים רלוונטיים

**תיקונים:**
- `api/models/brokers_fees.py` (שורה 24: הגדרת Enum, שורות 64-67: שימוש ב-Enum)
- `api/services/brokers_fees_service.py` (SQLAlchemy מטפל אוטומטית בהמרות)

**SSOT DDL:**
- `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` (שורה 59: CREATE TYPE, שורה 1029: שימוש ב-ENUM)

**מקור DB:**
- `scripts/create_d18_brokers_fees_table.sql` (שורות 12, 32: ENUM definition and usage)

---

**Prepared by:** Team 20 (Backend Implementation)  
**Date:** 2026-02-10  
**Status:** ✅ **FIXED - VERIFIED BY QA**

**QA Verification:** Team 50 אישר שהתיקון עבר בהצלחה (`TEAM_50_TO_TEAM_10_UPDATE_BROKERS_FEES_CREATE_500.md`).

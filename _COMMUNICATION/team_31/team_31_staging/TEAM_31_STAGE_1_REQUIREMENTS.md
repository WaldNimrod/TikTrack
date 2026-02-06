# 📋 דרישות למימוש אופטימלי - שלב 1: עמוד ניהול טיקרים

**תאריך:** 2026-01-31  
**עמוד:** `tickers`  
**קובץ Blueprint:** `tickers_BLUEPRINT.html`  
**סטטוס:** ⏳ **ממתין להתחלה**

---

## 🎯 סקירה כללית

מסמך זה מגדיר את כל הדרישות והמשאבים הנדרשים למימוש אופטימלי של עמוד ניהול טיקרים (שלב 1).

---

## ✅ משאבים זמינים (מה שיש לנו)

### **1. תהליך עבודה מפורט**
- ✅ **מיקום:** `TEAM_31_WORKFLOW_PROCESS_V2.md`
- ✅ **תכולה:** תהליך עבודה מלא עם לקחים וכללים
- ✅ **שימוש:** מדריך שלב-אחר-שלב ליצירת בלופרינט

### **2. תבנית בסיסית**
- ✅ **מיקום:** `sandbox_v2/D16_ACCTS_VIEW.html` (חשבונות מסחר)
- ✅ **תכולה:** תבנית טבלאות מלאה ומעודכנת
- ✅ **שימוש:** בסיס ליצירת בלופרינט טיקרים

### **3. דוגמאות נוספות**
- ✅ **מיקום:** `sandbox_v2/D18_BRKRS_VIEW.html` (ברוקרים)
- ✅ **מיקום:** `sandbox_v2/D21_CASH_VIEW.html` (תזרימי מזומנים)
- ✅ **שימוש:** דוגמאות למבנה טבלאות, פילטרים, פעולות

### **4. DB Schema - Field Map**
- ✅ **מיקום:** `documentation/01-ARCHITECTURE/LOGIC/WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md`
- ✅ **תכולה:** סכימת נכסים (Tickers Schema)
- ✅ **שדות זוהו:**
  - `internal_ids` (BIGINT PK)
  - `external_ulids` (VARCHAR(26) - ULID)
  - `ticker_symbols` (VARCHAR(20))
  - `provider_mapping_data` (JSONB)
  - `asset_type_enums` (VARCHAR(50) - Enum: STOCK, CRYPTO, ETF)
  - `is_active_flags` (BOOLEAN)

### **5. Field Inventory (Legacy)**
- ✅ **מיקום:** `_COMMUNICATION/team_01/team_01_staging/field_inventory_tickers_S10_01.md`
- ✅ **תכולה:** רשימת שדות בסיסית
- ✅ **שדות:**
  - `ticker_symbol` (String - Badge)
  - `company_name` (String - Label)
  - `current_price` (Decimal - LTR Text)

### **6. Legacy File (Dashboard)**
- ⚠️ **מיקום:** `_COMMUNICATION/team_01/team_01_staging/tickers_dashboard_blueprint.html`
- ⚠️ **תכולה:** Dashboard לטיקרים (לא ניהול)
- ⚠️ **שימוש:** יכול להכיל רמזים למבנה, אבל זה dashboard ולא ניהול

---

## ❌ משאבים חסרים (מה שצריך)

### **1. OpenAPI Spec - Endpoints לטיקרים**
- ❌ **מיקום:** `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml`
- ❌ **סטטוס:** לא נמצאו endpoints ספציפיים לטיקרים
- ❓ **דרוש:**
  - `GET /api/tickers` - רשימת טיקרים
  - `GET /api/tickers/{id}` - פרטי טיקר
  - `POST /api/tickers` - יצירת טיקר חדש
  - `PUT /api/tickers/{id}` - עדכון טיקר
  - `DELETE /api/tickers/{id}` - מחיקת טיקר
  - Request/Response schemas
  - שמות שדות מדויקים (plural names only)
  - ULID strings ל-IDs

### **2. Legacy File - ניהול טיקרים**
- ❌ **מיקום:** `_COMMUNICATION/team_01/team_01_staging/`
- ❌ **סטטוס:** לא נמצא קובץ Legacy ספציפי לניהול טיקרים
- ❓ **דרוש:**
  - קובץ HTML Legacy לעמוד ניהול טיקרים
  - מבנה טבלאות
  - שדות ועמודות
  - פילטרים
  - פעולות (Actions)
  - CSS classes ו-IDs

### **3. DB Schema - שדות נוספים**
- ⚠️ **מיקום:** `WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md`
- ⚠️ **סטטוס:** יש שדות בסיסיים, אבל חסרים שדות נוספים
- ❓ **דרוש:**
  - שדות נוספים מהטבלה (אם קיימים)
  - קשרים לטבלאות אחרות
  - שדות מחושבים או virtual fields
  - שדות מ-Legacy שלא קיימים ב-DB Schema

### **4. הגדרות עמוד ספציפיות**
- ❓ **דרוש:**
  - רשימת שדות מלאה לטבלה
  - סדר עמודות מועדף
  - פילטרים נדרשים
  - פעולות (Actions) נדרשות
  - כללי אימות (Validation rules)
  - כללי הצגה (Display rules)

---

## 📋 רשימת משימות למימוש אופטימלי

### **שלב 1: מחקר וניתוח** 🔍

#### **1.1 בדיקת OpenAPI Spec**
- [ ] חיפוש endpoints לטיקרים ב-OpenAPI Spec
- [ ] תיעוד request/response schemas
- [ ] תיעוד שמות שדות מדויקים
- [ ] תיעוד ULID strings
- [ ] השוואה ל-DB Schema

#### **1.2 חיפוש Legacy Files**
- [ ] חיפוש קבצי Legacy לניהול טיקרים
- [ ] ניתוח מבנה טבלאות
- [ ] תיעוד שדות ועמודות
- [ ] תיעוד פילטרים
- [ ] תיעוד פעולות (Actions)
- [ ] תיעוד CSS classes ו-IDs

#### **1.3 השוואת DB Schema vs Legacy**
- [ ] יצירת טבלת השוואה: Legacy | DB Schema | OpenAPI
- [ ] זיהוי שדות חסרים
- [ ] זיהוי שדות מיותרים
- [ ] תיעוד החלטות

#### **1.4 ניתוח תבנית בסיסית**
- [ ] קריאת `D16_ACCTS_VIEW.html` (תבנית טבלאות)
- [ ] זיהוי דפוסים משותפים
- [ ] זיהוי קומפוננטות LEGO System
- [ ] זיהוי מחלקות CSS סטנדרטיות

### **שלב 2: תכנון ותיעוד** 📐

#### **2.1 יצירת טבלת שדות**
- [ ] רשימת שדות מלאה
- [ ] סדר עמודות מועדף
- [ ] טיפוסי שדות
- [ ] כללי הצגה

#### **2.2 תכנון פילטרים**
- [ ] רשימת פילטרים נדרשים
- [ ] סוגי פילטרים (text, select, date, etc.)
- [ ] מיקום פילטרים

#### **2.3 תכנון פעולות**
- [ ] רשימת פעולות נדרשות
- [ ] מיקום פעולות (header, row actions, bulk actions)
- [ ] כללי אימות

### **שלב 3: יצירת בלופרינט** 🏗️

#### **3.1 בסיס: D16_ACCTS_VIEW.html**
- [ ] העתקת מבנה בסיסי
- [ ] שמירה על מבנה HTML זהה
- [ ] שמירה על מחלקות CSS זהה
- [ ] התאמה לשדות טיקרים

#### **3.2 מבנה HTML**
- [ ] Header (unified-header)
- [ ] Filters Section
- [ ] Table Section (phoenix-table)
- [ ] Pagination Section
- [ ] Actions Section

#### **3.3 CSS**
- [ ] שימוש במחלקות CSS קיימות
- [ ] הימנעות מ-`!important`
- [ ] שימוש ב-CSS variables
- [ ] שימוש ב-utility classes

### **שלב 4: בדיקות ואימות** ✅

#### **4.1 בדיקות מבנה**
- [ ] מבנה HTML תקין
- [ ] CSS classes תקינים
- [ ] RTL alignment תקין
- [ ] Responsive design

#### **4.2 בדיקות תוכן**
- [ ] כל השדות קיימים
- [ ] סדר עמודות נכון
- [ ] פילטרים תקינים
- [ ] פעולות תקינות

#### **4.3 בדיקות עקביות**
- [ ] עקביות עם תבנית טבלאות
- [ ] עקביות עם סטנדרטים
- [ ] עקביות עם naming conventions

### **שלב 5: תיעוד והגשה** 📄

#### **5.1 יצירת מדריך יישום**
- [ ] `TEAM_31_TICKERS_IMPLEMENTATION_GUIDE.md`
- [ ] תיעוד מבנה HTML
- [ ] תיעוד CSS
- [ ] תיעוד טבלאות
- [ ] תיעוד פילטרים
- [ ] תיעוד פעולות

#### **5.2 יצירת מסמך הגשה**
- [ ] `TEAM_31_TO_TEAM_10_TICKERS_DELIVERY.md`
- [ ] סיכום מה נוצר
- [ ] קישורים לכל הקבצים
- [ ] הערות מיוחדות

#### **5.3 עדכון מטריצה ואינדקס**
- [ ] עדכון מטריצה ב-`TEAM_31_WORKFLOW_PROCESS_V2.md`
- [ ] עדכון אינדקס ב-`sandbox_v2/index.html`
- [ ] עדכון סטטוס

---

## 🚨 שאלות קריטיות שצריכות תשובה

### **1. OpenAPI Spec**
- ❓ האם יש endpoints לטיקרים ב-OpenAPI Spec?
- ❓ איפה נמצאים ה-endpoints (אם קיימים)?
- ❓ מה המבנה המדויק של request/response?

### **2. Legacy Files**
- ❓ האם יש קובץ Legacy ספציפי לניהול טיקרים?
- ❓ איפה נמצא הקובץ (אם קיים)?
- ❓ מה המבנה המדויק של הטבלה?

### **3. שדות**
- ❓ מה רשימת השדות המלאה לטבלה?
- ❓ מה סדר העמודות המועדף?
- ❓ אילו שדות מ-Legacy לא קיימים ב-DB Schema?

### **4. פילטרים**
- ❓ אילו פילטרים נדרשים?
- ❓ מה סוגי הפילטרים?
- ❓ איפה ממוקמים הפילטרים?

### **5. פעולות**
- ❓ אילו פעולות נדרשות?
- ❓ איפה ממוקמות הפעולות?
- ❓ מה כללי האימות?

---

## 📊 סיכום

### **מה יש לנו:**
- ✅ תהליך עבודה מפורט
- ✅ תבנית בסיסית (D16_ACCTS_VIEW.html)
- ✅ דוגמאות נוספות (D18, D21)
- ✅ DB Schema בסיסי
- ✅ Field Inventory בסיסי

### **מה חסר לנו:**
- ❌ OpenAPI Spec - Endpoints לטיקרים
- ❌ Legacy File - ניהול טיקרים
- ❌ DB Schema - שדות נוספים
- ❌ הגדרות עמוד ספציפיות

### **מה נדרש למימוש אופטימלי:**
1. **גישה ל-OpenAPI Spec** - endpoints ושדות מדויקים
2. **קובץ Legacy** - מבנה טבלאות ופילטרים
3. **הגדרות עמוד** - רשימת שדות, פילטרים, פעולות
4. **אישור מהמשתמש** - לפני התחלת עבודה

---

**Team 31 (Blueprint)**  
**Date:** 2026-01-31  
**Status:** ⏳ **ממתין לאישור והשלמת מידע**

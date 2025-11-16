# תוכנית ניקוי: כפילות בלוגיקת זיווג FOREX
**תאריך:** 2025-01-27  
**מטרה:** לזהות איזה תהליך זיווג נכון ולנקות את הקוד

---

## 1. זיהוי הבעיה

### 1.1 כפילות בלוגיקת הזיווג
יש שני מקומות שמבצעים זיווג FOREX:

1. **`_build_preview_payload`** (שורות 1258-1312):
   - עובד על `records_to_import` שכבר עברו normalization
   - מזהה לפי `storage_type` בלבד
   - מקצה `external_id` ו-`metadata.exchange_external_id`
   - נקי ופשוט

2. **`_execute_import_cashflows`** (שורות 2111-2163):
   - עובד על `cashflow_records` (שזה אותו דבר)
   - בודק אם כבר יש `external_id` שמתחיל ב-`exchange_` - אם כן, מדלג
   - אבל הלוגיקה שונה - בודק גם `cashflow_type == 'forex_conversion'`
   - משתמש ב-`_resolve_cashflow_storage_type` שוב
   - מורכב יותר

### 1.2 בעיית עמלה
- בקובץ IBKR יש שדה `Comm/Fee` שנשמר ב-`commission` ב-record (שורה 1149)
- ב-`_execute_import_cashflows` מחפש ב-`metadata.commission` או `record.commission` (שורה 2290)
- צריך לבדוק איפה העמלה נשמרת בפועל

### 1.3 תצוגה ידנית
- רשומות ידניות מוחזרות עם `exchange_group_id`, `linked_exchange_cash_flow_id`, `linked_exchange_summary`, `exchange_pair_summary`
- צריך לוודא שרשומות מיובאות מוחזרות באותו פורמט

---

## 2. תהליך בדיקה

### 2.1 בדיקת זיווג ב-Preview
**מטרה**: לבדוק אם `_build_preview_payload` מזווג נכון

**שלבים**:
1. להריץ ייבוא קובץ עם המרות מטח
2. לבדוק ב-preview אם הרשומות מזווגות (יש להן `external_id` משותף)
3. לבדוק אם `metadata.exchange_external_id` קיים
4. לבדוק אם `storage_type` נכון

**תוצאה צפויה**: 
- כל זוג FOREX צריך להיות עם `external_id` משותף
- `metadata.exchange_external_id` צריך להיות זהה ל-`external_id`

### 2.2 בדיקת זיווג ב-Execute
**מטרה**: לבדוק אם `_execute_import_cashflows` מזווג נכון

**שלבים**:
1. להריץ ייבוא קובץ עם המרות מטח
2. לבדוק אם הרשומות כבר מזווגות (יש להן `external_id` שמתחיל ב-`exchange_`)
3. לבדוק אם הלוגיקה ב-`_execute_import_cashflows` מדלגת עליהן או מזווגת שוב

**תוצאה צפויה**: 
- אם `_build_preview_payload` עובד טוב, `_execute_import_cashflows` צריך לדלג על כל הרשומות
- אם לא, `_execute_import_cashflows` צריך לזווג

### 2.3 בדיקת עמלה
**מטרה**: לבדוק איפה העמלה נשמרת

**שלבים**:
1. לבדוק בקובץ IBKR - יש שדה `Comm/Fee`
2. לבדוק ב-`_build_forex_cashflows` - העמלה נשמרת ב-`commission` (שורה 1149)
3. לבדוק ב-`_execute_import_cashflows` - מחפש ב-`metadata.commission` או `record.commission` (שורה 2290)
4. לבדוק אם העמלה מגיעה ל-`create_exchange` נכון

**תוצאה צפויה**: 
- העמלה צריכה להיות ב-`record.commission` (לא ב-metadata)
- `_execute_import_cashflows` צריך לחפש ב-`record.commission` ישירות

### 2.4 בדיקת תצוגה
**מטרה**: לבדוק אם רשומות מיובאות מוחזרות באותו פורמט כמו ידניות

**שלבים**:
1. ליצור המרה ידנית
2. לבדוק מה ה-API מחזיר (`GET /api/cash-flows/`)
3. לייבא המרה
4. לבדוק מה ה-API מחזיר
5. להשוות

**תוצאה צפויה**: 
- שתי הרשומות צריכות להיות עם אותם שדות
- `exchange_group_id`, `linked_exchange_cash_flow_id`, `linked_exchange_summary`, `exchange_pair_summary` צריכים להיות קיימים

---

## 3. תוכנית תיקון

### 3.1 ניקוי כפילות זיווג
**אפשרות 1**: להסיר את הלוגיקה מ-`_execute_import_cashflows`
- **יתרונות**: קוד נקי יותר, פחות כפילות
- **חסרונות**: אם `_build_preview_payload` לא רץ, לא יהיה זיווג
- **המלצה**: ✅ לעשות זאת, אבל לוודא ש-`_build_preview_payload` תמיד רץ

**אפשרות 2**: להשאיר את הלוגיקה ב-`_execute_import_cashflows` כגיבוי
- **יתרונות**: בטוח יותר
- **חסרונות**: כפילות, קוד מורכב יותר
- **המלצה**: ❌ לא מומלץ

**החלטה**: להסיר את הלוגיקה מ-`_execute_import_cashflows` ולהשאיר רק את `_build_preview_payload`

### 3.2 תיקון חילוץ עמלה
**שינוי נדרש**: 
- לחפש עמלה ב-`record.commission` ישירות (לא ב-metadata)
- אם לא נמצא, לנסות `metadata.commission` כגיבוי

### 3.3 וידוא תצוגה אחידה
**שינוי נדרש**: 
- לוודא ש-API מחזיר את אותם שדות לרשומות מיובאות וידניות
- זה כבר עובד (ה-API מוסיף את השדות ב-`GET /api/cash-flows/`)

---

## 4. שלבי ביצוע

### שלב 1: בדיקה
1. להריץ ייבוא קובץ עם המרות מטח
2. לבדוק את ה-preview - האם הרשומות מזווגות?
3. לבדוק את ה-execute - האם הרשומות כבר מזווגות?
4. לבדוק את העמלה - האם היא נשמרת נכון?

### שלב 2: ניקוי
1. להסיר את הלוגיקה מ-`_execute_import_cashflows` (שורות 2111-2163)
2. לתקן את חילוץ העמלה (שורה 2290)
3. לוודא ש-`_build_preview_payload` תמיד רץ

### שלב 3: בדיקה מחדש
1. להריץ ייבוא קובץ עם המרות מטח
2. לבדוק שהזיווג עובד
3. לבדוק שהעמלה נשמרת נכון
4. לבדוק שהתצוגה אחידה

---

## 5. הערות

- `_build_preview_payload` יותר נקי - הוא עובד על `records_to_import` שכבר עברו normalization
- `_execute_import_cashflows` עושה את אותו דבר אבל עם לוגיקה מורכבת יותר
- העמלה נשמרת ב-`record.commission` (לא ב-metadata)
- ה-API כבר מוסיף את השדות הנדרשים לרשומות מיובאות


# דוח מצב - תהליכי ייבוא נתונים
**תאריך עדכון**: 2025-01-16  
**סטטוס כללי**: 🔄 בפיתוח פעיל - בעיות ידועות

---

## 📋 תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [בעיות ידועות](#בעיות-ידועות)
3. [תהליכי בדיקה](#תהליכי-בדיקה)
4. [כפתור מחיקת רשומות מייבוא](#כפתור-מחיקת-רשומות-מייבוא)
5. [קישורים לתיעוד](#קישורים-לתיעוד)
6. [המלצות לפעולה](#המלצות-לפעולה)

---

## סקירה כללית

מערכת ייבוא הנתונים של TikTrack מאפשרת ייבוא תזרימי מזומנים מקובצי CSV של Interactive Brokers (IBKR). המערכת כוללת:

- **פרסור אוטומטי** של קבצי IBKR CSV
- **סיווג רשומות** לפי סוג תזרים (dividend, interest, fee, forex_conversion, וכו')
- **סינון לפי סוג** - אפשרות לייבא רק סוגים מסוימים
- **ייבוא אטומי** של המרות מטבע (FROM/TO records)
- **ניהול סשן** - אפשרות להמשיך ייבוא שנקטע
- **Account linking** - שיוך חשבון IBKR לחשבון מסחר ב-TikTrack

### קבצי קוד מרכזיים

**Backend:**
- `Backend/services/user_data_import/import_orchestrator.py` - תהליך הייבוא המרכזי (55+ פונקציות)
- `Backend/connectors/user_data_import/ibkr_connector.py` - פרסור קובץ IBKR
- `Backend/services/user_data_import/import_validator.py` - Validation לפני ייבוא
- `Backend/services/cash_flow_service.py` - יצירת רשומות cash flow

**Frontend:**
- `trading-ui/scripts/import-user-data.js` - Import modal ו-state management
- `trading-ui/cash_flows.html` - דף תזרימי מזומנים
- `trading-ui/scripts/cash_flows.js` - פונקציות דף cash flows

---

## בעיות ידועות

### 🔴 בעיה #1: סינון לפי סוג לא עובד תמיד

**תיאור**: למרות 3 נקודות סינון, לפעמים כל הרשומות מיובאות גם אם נבחר רק סוג אחד.

**מיקום בקוד**:
- `Backend/services/user_data_import/import_orchestrator.py`:
  - `_build_preview_payload()` - נקודת סינון ראשונה
  - `execute_import()` - נקודת סינון שנייה
  - `_execute_import_cashflows()` - נקודת סינון שלישית

**סטטוס**: 🔄 בתיקון
- ✅ הוספנו validation checks ב-3 נקודות
- ✅ הוספנו לוגים מפורטים
- ⚠️ עדיין יש דיווחים על בעיות

**פעולות שנעשו**:
1. הוספת validation ב-`execute_import()` - בודק שכל הרשומות תואמות ל-`selected_types`
2. הוספת validation ב-`_execute_import_cashflows()` - בדיקה אחרונה לפני שמירה
3. וידוא ש-`selected_types` נשמר ב-`preview_data`
4. הוספת לוגים מפורטים לכל נקודת סינון

**קישור לתיעוד**: [FILTERING_MECHANISM.md](./FILTERING_MECHANISM.md)

---

### 🔴 בעיה #2: רשומות המרות מטבע מסווגות כ-"other"

**תיאור**: רשומות המרות מטבע (forex_conversion) לפעמים מסווגות כ-"other" במקום `currency_exchange_from`/`to`, ולכן לא מקושרות נכון.

**מיקום בקוד**:
- `Backend/connectors/user_data_import/ibkr_connector.py`:
  - `_identify_record_type()` - זיהוי סוג רשומה
  - `_build_forex_cashflows()` - יצירת רשומות Forex
- `Backend/services/user_data_import/import_orchestrator.py`:
  - `_build_preview_payload()` - זיווג Forex records

**סטטוס**: 🔄 בתיקון
- ✅ וידאנו ש-`storage_type` נפתר לפני זיווג Forex
- ✅ שיפרנו את לוגיקת הזיווג
- ⚠️ עדיין יש דיווחים על בעיות

**פעולות שנעשו**:
1. וידוא ש-`storage_type` נפתר ב-`_build_preview_payload` *לפני* לוגיקת זיווג Forex
2. שיפור לוגיקת הזיווג - התאמה לפי `cashflow_type='forex_conversion'` או `storage_type`
3. הוספת לוגים מפורטים לזיווג

**קישור לתיעוד**: [CURRENCY_EXCHANGE_IMPORT.md](./CURRENCY_EXCHANGE_IMPORT.md)

---

### 🔴 בעיה #3: רשומות accounting entries עדיין נוצרות

**תיאור**: רשומות כמו `dividend_accrual`, `interest_accrual` עדיין נוצרות למרות שאמורות להיות מסוננות.

**מיקום בקוד**:
- `Backend/connectors/user_data_import/ibkr_connector.py`:
  - `_identify_record_type()` - זיהוי סוג רשומה
  - `_parse_cashflow_sections()` - פרסור סקציות

**סטטוס**: ✅ תוקן (אבל עדיין יש דיווחים)
- ✅ הוספנו explicit skipping ב-`_identify_record_type()` - מחזיר `None` ל-`dividend_accrual`, `interest_accrual`, `syep_activity`, `syep_interest`, `cash_report`
- ✅ הוספנו filtering ב-`_build_preview_payload()` - מעביר ל-`records_to_skip`
- ⚠️ עדיין יש דיווחים על רשומות מוזרות (למשל record 39 - `dividend_accrual` שמופיע כ-`other_positive`)

**פעולות שנעשו**:
1. חיזוק לוגיקת ה-skipping ב-`IBKRConnector._identify_record_type()` - מחזיר `None` במפורש
2. הוספת filtering ב-`ImportOrchestrator._build_preview_payload()` - מעביר ל-`records_to_skip`
3. הוספת לוגים לסקציות שמוסרות

**קישור לתיעוד**: [RECORD_CLASSIFICATION.md](./RECORD_CLASSIFICATION.md), [IBKR_CASHFLOW_IDENTIFICATION.md](./IBKR_CASHFLOW_IDENTIFICATION.md)

---

### 🔴 בעיה #4: כפתור מחיקת רשומות מייבוא - שגיאת 500

**תיאור**: כפתור "מחק רשומות מייבוא" בדף cash flows גורם לשגיאת 500 Internal Server Error.

**מיקום בקוד**:
- `Backend/routes/api/cash_flows.py`:
  - `delete_imported_cash_flows()` - endpoint למחיקה
- `trading-ui/scripts/cash_flows.js`:
  - `deleteImportedCashFlows()` - פונקציה frontend
- `trading-ui/cash_flows.html`:
  - כפתור "מחק רשומות מייבוא"

**סטטוס**: 🔄 בתיקון פעיל
- ✅ תיקנו את קריאת `showConfirmationDialog` - עכשיו מעבירים פרמטרים נפרדים
- ✅ הסרנו `db.commit()` כפול - ה-decorator עושה commit אוטומטית
- ✅ שיפרנו את הטיפול בשגיאות
- ⚠️ עדיין יש שגיאת 500 - הסרנו זמנית את מחיקת התגים לבידוד הבעיה

**פעולות שנעשו**:
1. תיקון קריאת `showConfirmationDialog` - מעבירים פרמטרים נפרדים במקום אובייקט
2. הסרת `db.commit()` מהפונקציה - ה-decorator `@handle_database_session(auto_commit=True)` עושה commit אוטומטית
3. שיפור הלוגים - הוספנו לוגים מפורטים לכל שלב
4. הסרה זמנית של מחיקת תגים - לבידוד הבעיה

**קישור לתיעוד**: ראה [כפתור מחיקת רשומות מייבוא](#כפתור-מחיקת-רשומות-מייבוא) למטה

---

### 🟡 בעיה #5: Account Linking - שגיאה בעדכון שיוך

**תיאור**: ניסיון לשנות שיוך חשבון מציג שגיאה למרות שהפעולה אמורה לבצע בדיוק את זה.

**מיקום בקוד**:
- `Backend/services/user_data_import/import_orchestrator.py`:
  - `link_account()` - שיוך חשבון
- `trading-ui/scripts/import-user-data.js`:
  - `submitAccountLinkSelection()` - UI לשיוך

**סטטוס**: 🔄 נדרש ניטור
- ⚠️ המשתמש דיווח על שגיאה: "מספר החשבון כבר משויך לחשבון X"
- ⚠️ הבעיה: הפעולה אמורה להסיר את השיוך הישן וליצור שיוך חדש
- ⚠️ נדרש ניטור מפורט של התהליך

**פעולות נדרשות**:
1. הוספת ניטור מפורט של תהליך השיוך
2. וידוא שהשיוך הישן מוסר לפני יצירת שיוך חדש
3. עדכון ה-session לאחר שינוי שיוך
4. עדכון התצוגה בממשק

---

## תהליכי בדיקה

### בדיקה #1: סינון לפי סוג אחד בלבד

**מטרה**: לוודא שרק סוג אחד של רשומות מיובא כאשר נבחר רק סוג אחד בממשק.

**תהליך**:
1. העלאת קובץ IBKR
2. בחירת רק סוג אחד (למשל `interest`)
3. ביצוע ייבוא
4. בדיקה שהרשומות בבסיס הנתונים תואמות לסוג שנבחר

**תוצאות**:
- ⚠️ לפעמים כל הרשומות מיובאות למרות הבחירה
- ✅ הוספנו validation checks ב-3 נקודות
- ⚠️ עדיין יש דיווחים על בעיות

**סקריפטי בדיקה**:
- `Backend/scripts/test_filtering_logic.py` - בדיקת לוגיקת סינון
- `Backend/scripts/validate_import_session.py` - בדיקת סשן ספציפי

---

### בדיקה #2: ייבוא רק ריבית (interest)

**מטרה**: לבדוק ייבוא של סוג אחד בלבד - ריבית.

**תהליך**:
1. הוספנו זמנית filtering ב-`renderCashflowTypeCards()` - רק `interest` מוצג
2. הוספנו זמנית default selection - רק `interest` נבחר
3. ביצוע ייבוא
4. בדיקה שהרשומות בבסיס הנתונים הן רק `interest`

**מיקום בקוד**:
- `trading-ui/scripts/import-user-data.js`:
  - `renderCashflowTypeCards()` - שורה 2197-2213: `skippedTypes` כולל את כל הסוגים חוץ מ-`interest`
  - שורה 2244: `selectedCashflowTypes[key] = (key === 'interest')` - רק interest נבחר

**סטטוס**: 🔄 בדיקה פעילה
- ✅ הוספנו TEMPORARY filtering
- ⚠️ נדרש להסיר את ה-filtering הזמני אחרי הבדיקה

**הערה**: זה שינוי זמני לבדיקה בלבד - יש להסיר אחרי הבדיקה!

---

### בדיקה #3: מחיקת רשומות מייבוא

**מטרה**: לבדוק את כפתור המחיקה ולזהות את הבעיה שגורמת לשגיאת 500.

**תהליך**:
1. יצירת endpoint `/api/cash-flows/delete-imported`
2. הוספת כפתור בדף cash flows
3. ניסיון מחיקה
4. זיהוי שגיאת 500

**פעולות שנעשו**:
1. ✅ יצירת endpoint ב-`Backend/routes/api/cash_flows.py`
2. ✅ הוספת כפתור ב-`trading-ui/cash_flows.html`
3. ✅ יצירת פונקציה `deleteImportedCashFlows()` ב-`trading-ui/scripts/cash_flows.js`
4. ✅ תיקון קריאת `showConfirmationDialog`
5. ✅ הסרת `db.commit()` כפול
6. ✅ הסרה זמנית של מחיקת תגים - לבידוד הבעיה

**סטטוס**: 🔄 בתיקון פעיל

---

## כפתור מחיקת רשומות מייבוא

### סקירה

כפתור "מחק רשומות מייבוא" נוסף לדף cash flows כדי לאפשר מחיקת כל הרשומות המיובאות (`source='file_import'`) לצורך בדיקות.

### מיקום

**HTML**: `trading-ui/cash_flows.html`
```html
<button data-button-type="DELETE" 
        data-variant="warning" 
        data-size="small" 
        data-onclick="deleteImportedCashFlows()" 
        data-text="מחק רשומות מייבוא" 
        title="מחק את כל רשומות תזרימי המזומנים שמקורן בייבוא (source='file_import')" 
        data-tooltip="מחיקת כל הרשומות מייבוא - לבדיקות" 
        data-tooltip-placement="top"></button>
```

**JavaScript**: `trading-ui/scripts/cash_flows.js`
- פונקציה: `deleteImportedCashFlows()` (שורה 792)
- חלון אישור לפני מחיקה
- קריאה ל-API endpoint
- הודעת הצלחה/שגיאה
- רענון אוטומטי של הטבלה

**Backend API**: `Backend/routes/api/cash_flows.py`
- Endpoint: `DELETE /api/cash-flows/delete-imported` (שורה 603)
- מחק רק רשומות עם `source='file_import'`
- מחזיר מספר רשומות שנמחקו

### בעיות ידועות

#### בעיה #1: שגיאת 500 Internal Server Error

**תיאור**: הכפתור גורם לשגיאת 500 למרות שהחלון אישור מוצג.

**תיקונים שנעשו**:
1. ✅ תיקון קריאת `showConfirmationDialog` - עכשיו מעבירים פרמטרים נפרדים במקום אובייקט
2. ✅ הסרת `db.commit()` כפול - ה-decorator `@handle_database_session(auto_commit=True)` עושה commit אוטומטית
3. ✅ שיפור הלוגים - הוספנו לוגים מפורטים לכל שלב
4. ✅ הסרה זמנית של מחיקת תגים - לבידוד הבעיה

**סטטוס**: 🔄 בתיקון פעיל
- ⚠️ עדיין יש שגיאת 500
- 🔍 נדרש לבדוק את לוגי השרת כדי לזהות את השגיאה המדויקת

**קוד רלוונטי**:
```python
# Backend/routes/api/cash_flows.py - שורה 603-660
@cash_flows_bp.route('/delete-imported', methods=['DELETE'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['cash_flows', 'account-activity-*'])
def delete_imported_cash_flows():
    """Delete all cash flows with source='file_import' - Dev utility for testing"""
    try:
        logger.info("=== DELETE IMPORTED CASH FLOWS START ===")
        db: Session = g.db
        
        # Count imported records
        count = db.query(CashFlow).filter(CashFlow.source == 'file_import').count()
        logger.info(f"Found {count} imported cash flows to delete")
        
        if count == 0:
            return jsonify({
                "status": "success",
                "message": "No imported cash flows found. Nothing to delete.",
                "deleted_count": 0,
                "version": "1.0"
            }), 200
        
        # Get details for logging (before deletion)
        cash_flows = db.query(CashFlow).filter(CashFlow.source == 'file_import').all()
        cash_flow_ids = [cf.id for cf in cash_flows]
        logger.info(f"Found {len(cash_flow_ids)} imported cash flows with IDs: {cash_flow_ids[:10]}...")
        
        # TEMPORARY: Skip tag removal to isolate the deletion issue
        # TODO: Re-enable tag removal after deletion is working
        tags_removed = 0
        logger.info(f"Skipping tag removal for now - will delete {len(cash_flows)} cash flows directly")
        
        # Delete all imported records
        # Note: commit will be done by handle_database_session decorator
        deleted_count = db.query(CashFlow).filter(CashFlow.source == 'file_import').delete()
        logger.info(f"Delete query executed, deleted_count={deleted_count}")
        
        return jsonify({
            "status": "success",
            "message": f"Successfully deleted {deleted_count} imported cash flow(s)",
            "deleted_count": deleted_count,
            "version": "1.0"
        }), 200
    except Exception as e:
        logger.error(f"Error deleting imported cash flows: {str(e)}", exc_info=True)
        return jsonify({
            "status": "error",
            "error": {"message": f"Failed to delete imported cash flows: {str(e)}"},
            "version": "1.0"
        }), 500
```

---

## קישורים לתיעוד

### תיעוד טכני

1. **[INDEX.md](./INDEX.md)** - אינדקס מלא של כל התיעוד הטכני
2. **[IMPORT_DATA_FLOW.md](./IMPORT_DATA_FLOW.md)** - זרימת המידע המלאה בתהליך הייבוא
3. **[RECORD_CLASSIFICATION.md](./RECORD_CLASSIFICATION.md)** - לוגיקת זיהוי וסיווג רשומות
4. **[CURRENCY_EXCHANGE_IMPORT.md](./CURRENCY_EXCHANGE_IMPORT.md)** - תהליך ייבוא המרות מטבע
5. **[FILTERING_MECHANISM.md](./FILTERING_MECHANISM.md)** - מנגנון הסינון לפי `selected_types`
6. **[IBKR_CASHFLOW_IDENTIFICATION.md](./IBKR_CASHFLOW_IDENTIFICATION.md)** - זיהוי רשומות תזרימי מזומנים מקובץ IBKR
7. **[IBKR_IMPORT_GUIDELINES.md](./IBKR_IMPORT_GUIDELINES.md)** - הנחיות ייבוא IBKR - מה מייבאים ומה לא
8. **[CASHFLOW_IMPORT_RECORDS_STRUCTURE.md](./CASHFLOW_IMPORT_RECORDS_STRUCTURE.md)** - מבנה רשומות תזרימי מזומנים

### תיעוד מערכת

1. **[Main Documentation Index](../../INDEX.md)** - אינדקס ראשי של כל התיעוד
2. **[General Systems List](../../frontend/GENERAL_SYSTEMS_LIST.md)** - רשימת כל המערכות הכלליות
3. **[Pages List](../../PAGES_LIST.md)** - רשימת כל הדפים במערכת

### תובנות על מבנה הנתונים

1. **[IBKR_IMPORT_GUIDELINES.md](./IBKR_IMPORT_GUIDELINES.md)** - מכיל תובנות מפורטות על:
   - ההבדל בין PDF ל-CSV של IBKR
   - מה מייבאים ומה לא
   - תנועות כסף אמיתיות vs. תנועות חשבונאיות
   - חישובי יתרות ועמלות

2. **[IBKR_CASHFLOW_IDENTIFICATION.md](./IBKR_CASHFLOW_IDENTIFICATION.md)** - מכיל:
   - מבנה קובץ IBKR CSV
   - זיהוי סקציות
   - כללי דילוג על שורות
   - דוגמאות שורות תקינות ולא תקינות

---

## המלצות לפעולה

### עדיפות גבוהה 🔴

1. **תיקון כפתור המחיקה**
   - בדיקת לוגי השרת לזיהוי השגיאה המדויקת
   - תיקון הבעיה
   - החזרת מחיקת התגים (אם לא הייתה הבעיה)

2. **תיקון סינון לפי סוג**
   - בדיקה מעמיקה של 3 נקודות הסינון
   - וידוא ש-`selected_types` נשמר נכון בכל השלבים
   - בדיקות מקיפות עם כל סוגי הרשומות

3. **תיקון סיווג המרות מטבע**
   - וידוא ש-`storage_type` נפתר נכון
   - בדיקת לוגיקת הזיווג
   - בדיקות עם קבצים אמיתיים

### עדיפות בינונית 🟡

4. **תיקון Account Linking**
   - הוספת ניטור מפורט
   - וידוא שהשיוך הישן מוסר לפני יצירת שיוך חדש
   - עדכון ה-session והתצוגה

5. **הסרת TEMPORARY filtering**
   - הסרת ה-filtering הזמני ב-`renderCashflowTypeCards()`
   - החזרת התנהגות רגילה

### עדיפות נמוכה 🟢

6. **שיפור הלוגים**
   - הוספת לוגים נוספים לניפוי באגים
   - יצירת dashboard לניטור ייבואים

7. **תיעוד נוסף**
   - תיעוד תהליכי בדיקה
   - תיעוד troubleshooting

---

## עדכונים אחרונים

- **2025-01-16**: יצירת דוח מצב ראשוני
- **2025-01-16**: תיקון קריאת `showConfirmationDialog` בכפתור המחיקה
- **2025-01-16**: הסרת `db.commit()` כפול בכפתור המחיקה
- **2025-01-16**: הוספת TEMPORARY filtering לבדיקת ייבוא רק ריבית
- **2025-01-16**: הסרה זמנית של מחיקת תגים בכפתור המחיקה

---

## הערות

- כל השינויים המסומנים כ-TEMPORARY חייבים להיות מוסרים אחרי הבדיקות
- יש לעדכן את הדוח הזה כשיש שינויים משמעותיים
- יש לבדוק את לוגי השרת לזיהוי שגיאות מדויקות


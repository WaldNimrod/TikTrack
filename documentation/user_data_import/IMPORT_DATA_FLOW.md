# זרימת מידע בתהליך הייבוא - Import Data Flow

## סקירה כללית

מסמך זה מתאר את זרימת המידע המלאה בתהליך ייבוא נתונים מקובץ IBKR, מהעלאת הקובץ ועד לשמירה בבסיס הנתונים.

## Data Flow Pipeline

```
1. Upload → create_session → store file_content
2. analyze_file → parse → store raw_records in session
3. generate_preview(selected_types) → filter → store preview_data with selected_types
4. execute_import(selected_types) → 
   a. Load preview_data (with selected_types)
   b. If selected_types provided, filter again (double-check)
   c. Import filtered records only
```

## שלב 1: Upload & Session Creation

**API Endpoint**: `POST /api/user-data-import/upload`

**תהליך**:
1. קובץ CSV נשלח מה-Frontend
2. `ImportOrchestrator.create_import_session()` יוצר סשן חדש
3. תוכן הקובץ נשמר ב-`session.summary_data['file_content']`
4. `connector_type` נשמר ב-`session.summary_data['connector_type']`

**נתונים שנשמרים**:
- `file_content`: תוכן הקובץ המלא
- `connector_type`: סוג הקונקטור (ibkr)
- `trading_account_id`: מזהה חשבון המסחר
- `file_name`: שם הקובץ

## שלב 2: File Analysis

**API Endpoint**: `GET /api/user-data-import/session/<id>/analyze`

**תהליך**:
1. `ImportOrchestrator.analyze_file()` נקרא
2. `IBKRConnector.parse_file()` מפרס את הקובץ
3. `_parse_cashflow_sections()` מזהה רשומות לפי:
   - עמודה ראשונה = שם סקציה (מ-`CASHFLOW_SECTION_NAMES`)
   - עמודה שנייה = "Data" (חובה)
4. `_identify_record_type()` מזהה את סוג הרשומה
5. רשומות גולמיות נשמרות ב-`session.summary_data['raw_records']`

**נתונים שנשמרים**:
- `raw_records`: רשומות גולמיות מהקובץ
- `analysis_results`: תוצאות הניתוח

## שלב 3: Preview Generation

**API Endpoint**: `GET /api/user-data-import/session/<id>/preview?selected_types=...`

**תהליך**:
1. `ImportOrchestrator.generate_preview(selected_types)` נקרא
2. `_build_preview_payload()` בונה את ה-preview:
   - סינון ראשוני לפי `selected_types` (אם מועבר)
   - זיווג רשומות Forex (FROM + TO)
   - יצירת `external_id` משותף: `exchange_<uuid>`
3. **CRITICAL**: `selected_types` נשמר ב-`preview_data` לפני commit
4. `preview_data` נשמר ב-`session.summary_data['preview_data']`

**נתונים שנשמרים**:
- `preview_data.records_to_import`: רשומות לייבוא (מסוננות)
- `preview_data.records_to_skip`: רשומות לדילוג
- `preview_data.selected_types`: רשימת סוגים שנבחרו (CRITICAL)
- `preview_data.summary`: סיכום סטטיסטיקות

**נקודת סינון 1**: `_build_preview_payload`
- סינון לפי `selected_types` אם מועבר
- רק רשומות מסוגים שנבחרו נשארות ב-`records_to_import`

## שלב 4: Import Execution

**API Endpoint**: `POST /api/user-data-import/session/<id>/execute`

**תהליך**:
1. `ImportOrchestrator.execute_import(selected_types)` נקרא
2. **CRITICAL**: טעינת `selected_types` מ-`preview_data` אם לא מועבר כפרמטר
3. **נקודת סינון 2**: סינון double-check ב-`execute_import`
   - אם `selected_types` קיים, מסנן שוב את `records_to_import`
   - מעדכן את `preview_data['records_to_import']`
4. `_execute_import_cashflows()` מבצע את הייבוא:
   - **נקודת סינון 3**: סינון final check לפני יצירה
   - Validation של כל רשומה (ImportValidator)
   - יצירת רשומות רגילות (CashFlowHelperService.create_regular_cash_flow)
   - יצירת רשומות Forex (CashFlowHelperService.create_exchange)

**נקודת סינון 2**: `execute_import`
- Double-check filtering לפני ייבוא
- וידוא ש-`selected_types` נשמר ב-`preview_data`

**נקודת סינון 3**: `_execute_import_cashflows`
- Final check לפני יצירה
- סינון אחרון של `records_to_import` לפי `selected_types`

## State Management

### Backend - Import Session

**שמירה**:
- `selected_types` נשמר ב-`preview_data` לפני commit
- נשמר ב-JSON serialization (עובר דרך `_make_payload_json_safe`)

**טעינה**:
- `execute_import` טוען `selected_types` מ-`preview_data` אם לא מועבר כפרמטר
- `accept_duplicate` טוען `selected_types` מ-`preview_data` לסינון

### Frontend - selectedCashflowTypes

**שמירה**:
- `selectedCashflowTypes` נשמר ב-localStorage/UnifiedCache (אופציונלי)
- נשלח ב-API call ל-`execute_import`

**טעינה**:
- `displayPreviewData()` טוען `selectedCashflowTypes` מ-`preview_data.selected_types`
- `resumeActiveImportSession()` טוען את ה-preview ומעדכן את `selectedCashflowTypes`

## Validation Points

1. **IBKR Connector**: רק שורות עם `{Section},Data,...` עוברות
2. **ImportValidator**: Validation לפני יצירה (type, amount, fee_amount, currency)
3. **3 נקודות סינון**: `_build_preview_payload`, `execute_import`, `_execute_import_cashflows`

## קישורים רלוונטיים

- `Backend/services/user_data_import/import_orchestrator.py` - תהליך הייבוא
- `Backend/connectors/user_data_import/ibkr_connector.py` - פרסור קובץ IBKR
- `Backend/services/user_data_import/import_validator.py` - Validation לפני ייבוא
- `trading-ui/scripts/import-user-data.js` - Frontend import modal


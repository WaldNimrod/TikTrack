# מנגנון סינון - Filtering Mechanism

## סקירה כללית

מסמך זה מתאר את מנגנון הסינון לפי `selected_types` בתהליך הייבוא, כולל 3 נקודות סינון להבטחת דיוק 100%.

## 3 נקודות סינון

### נקודה 1: _build_preview_payload

**מיקום**: `Backend/services/user_data_import/import_orchestrator.py::_build_preview_payload()` (שורות 1512-1549)

**תפקיד**: סינון ראשוני ב-preview generation

**תהליך**:

1. קבלת `selected_types` כפרמטר
2. סינון `records_to_import` לפי `selected_types`
3. שמירת `selected_types` ב-`preview_data`

**קוד**:

```python
if selected_types and isinstance(selected_types, list) and len(selected_types) > 0:
    selected_types_lower = [t.lower() for t in selected_types]
    filtered_records = []
    for rec in records_to_import:
        rec_cf_type = (rec.get('cashflow_type') or '').lower()
        if rec_cf_type in selected_types_lower:
            filtered_records.append(rec)
    records_to_import = filtered_records
    result['selected_types'] = selected_types  # Store for later
```

**לוגים**:

- לפני סינון: מספר רשומות, דוגמאות סוגים
- אחרי סינון: מספר רשומות שנשארו, סוגים שנשארו

### נקודה 2: execute_import

**מיקום**: `Backend/services/user_data_import/import_orchestrator.py::execute_import()` (שורות 2341-2383)

**תפקיד**: Double-check filtering לפני ייבוא

**תהליך**:

1. טעינת `selected_types` מ-`preview_data` אם לא מועבר כפרמטר
2. סינון double-check של `records_to_import`
3. עדכון `preview_data['records_to_import']`

**קוד**:

```python
# CRITICAL: Use selected_types from parameter OR from preview_data
if not selected_types:
    selected_types = preview_data.get('selected_types', [])

# Double-check filtering
if selected_types and isinstance(selected_types, list) and len(selected_types) > 0:
    selected_types_lower = [t.lower() for t in selected_types]
    filtered_records = [
        rec for rec in preview_data.get('records_to_import', [])
        if (rec.get('cashflow_type') or '').lower() in selected_types_lower
    ]
    preview_data['records_to_import'] = filtered_records
    preview_data['selected_types'] = selected_types  # Update
```

**לוגים**:

- לפני סינון: מספר רשומות, דוגמאות סוגים, `selected_types`
- אחרי סינון: מספר רשומות שנשארו, דוגמאות סוגים
- אזהרה אם לא היה סינון

### נקודה 3: _execute_import_cashflows

**מיקום**: `Backend/services/user_data_import/import_orchestrator.py::_execute_import_cashflows()` (שורות 2680-2709)

**תפקיד**: Final check לפני יצירה בבסיס הנתונים

**תהליך**:

1. טעינת `selected_types` מ-`preview_data`
2. סינון final check של `raw_entries`
3. רק רשומות שעברו את הסינון מגיעות ליצירה

**קוד**:

```python
# CRITICAL: Third filtering point (final check)
selected_types = preview_data.get('selected_types', [])
if selected_types and isinstance(selected_types, list) and len(selected_types) > 0:
    selected_types_lower = [t.lower() for t in selected_types]
    filtered_entries = []
    for entry in raw_entries:
        rec = extract_record(entry)
        rec_cf_type = (rec.get('cashflow_type') or rec.get('type') or '').lower()
        if rec_cf_type in selected_types_lower:
            filtered_entries.append(entry)
    raw_entries = filtered_entries
```

**לוגים**:

- לפני סינון: מספר רשומות, דוגמאות סוגים, `selected_types`
- אחרי סינון: מספר רשומות שנשארו, סוגים שנשארו

## State Management

### Backend - שמירה

**מיקום**: `generate_preview()` (שורה 2203)

**תהליך**:

```python
preview_data_raw['selected_types'] = selected_types or []
preview_data_serializable = self._make_payload_json_safe(preview_data_raw)
preview_data_storage = self.utc_normalizer.normalize_output(preview_data_serializable)
session.add_summary_data({'preview_data': preview_data_storage})
self.db_session.commit()
```

**וידוא**: `selected_types` נשמר ב-`preview_data` לפני commit

### Backend - טעינה

**מיקום**: `execute_import()` (שורות 2285-2290)

**תהליך**:

```python
preview_data = preview_result['preview_data']

# CRITICAL: Use selected_types from parameter OR from preview_data
if not selected_types:
    selected_types = preview_data.get('selected_types', [])
    logger.info("Loaded selected_types from preview_data: %s", selected_types)
```

### Frontend - שמירה

**מיקום**: `performImport()` (שורה 7260)

**תהליך**:

```javascript
const selectedTypes = Object.keys(selectedCashflowTypes).filter(
    type => selectedCashflowTypes[type] === true
);

fetch(`/api/user-data-import/session/${currentSessionId}/execute`, {
    method: 'POST',
    body: JSON.stringify({
        selected_types: selectedTypes  // Always include, never undefined
    })
})
```

### Frontend - טעינה

**מיקום**: `displayPreviewData()` (שורות 6049-6062)

**תהליך**:

```javascript
// CRITICAL: Load selectedCashflowTypes from preview_data if available
if (data.selected_types && Array.isArray(data.selected_types) && data.selected_types.length > 0) {
    selectedCashflowTypes = {};
    data.selected_types.forEach(type => {
        selectedCashflowTypes[type] = true;
    });
}
```

## דוגמה: סינון עם selected_types=['borrow_fee']

### שלב 1: Preview Generation

**קלט**: 255 רשומות (dividend, interest, fee, tax, transfer, ...)

**סינון**: `selected_types=['borrow_fee']`

**פלט**: 1 רשומה (רק `borrow_fee`)

**לוגים**:

```
🔍 [GENERATE_PREVIEW] Filtering by selected_types: ['borrow_fee']
🔍 [GENERATE_PREVIEW] Filtered cashflow records: 255 -> 1 (removed 254)
```

### שלב 2: Execute Import

**קלט**: 1 רשומה מ-preview_data

**סינון**: Double-check עם `selected_types=['borrow_fee']`

**פלט**: 1 רשומה (אותה רשומה)

**לוגים**:

```
🔍 [EXECUTE_IMPORT] Before filtering: 1 records, sample types: ['borrow_fee'], selected_types: ['borrow_fee']
🔍 [EXECUTE_IMPORT] After filtering: 1 records, sample types: ['borrow_fee']
```

### שלב 3: Import Execution

**קלט**: 1 רשומה מ-`records_to_import`

**סינון**: Final check עם `selected_types=['borrow_fee']`

**פלט**: 1 רשומה (אותה רשומה)

**לוגים**:

```
🔍 [EXECUTE_IMPORT_CASHFLOWS] Final filtering check: 1 records, sample types: ['borrow_fee'], selected_types: ['borrow_fee']
🔍 [EXECUTE_IMPORT_CASHFLOWS] Final filtering result: 1 -> 1 records (removed 0)
```

### תוצאה בבסיס הנתונים

**צפוי**: 1 רשומה מסוג `fee` (מ-`borrow_fee`)

**וידוא**: רק `fee` נוצר, אין רשומות מסוגים אחרים

## Validation Scripts

### validate_import_session.py

**שימוש**: `python3 Backend/scripts/validate_import_session.py <session_id>`

**תפקיד**: בדיקת סשן ספציפי

- `selected_types` ב-preview_data
- סוגים ב-preview vs database
- התאמה בין preview ל-database

### compare_import_vs_database.py

**שימוש**: `python3 Backend/scripts/compare_import_vs_database.py <session_id>`

**תפקיד**: השוואה בין preview ל-database

- סוגים ב-preview (מסוננים)
- סוגים ב-database
- התאמה/אי-התאמה

### test_filtering_logic.py

**שימוש**: `python3 Backend/scripts/test_filtering_logic.py`

**תפקיד**: בדיקת לוגיקת סינון

- סינון ב-`_build_preview_payload`
- וידוא `selected_types` נשמר

## קישורים רלוונטיים

- `Backend/services/user_data_import/import_orchestrator.py` - מימוש הסינון
- `Backend/services/user_data_import/import_validator.py` - Validation לפני ייבוא
- `trading-ui/scripts/import-user-data.js` - Frontend state management


# דיבוג - בעיית Accept/Reject Duplicate

## הבעיה

כאשר מאשרים או דוחים כפילות, הרשומה עדיין מוצגת לדילוג בשלב 3 ולא מיובאת בפועל.

## זרימת הנתונים

### 1. Accept Duplicate (`accept_duplicate`)

- **מיקום**: `Backend/services/user_data_import/import_orchestrator.py` שורה 4159
- **פעולה**:
  1. טוען `preview_data` מה-cache/database
  2. מוצא את הרשומה ב-`records_to_skip`
  3. מעביר אותה ל-`records_to_import`
  4. מעדכן את ה-cache עם `_update_preview_cache`

### 2. Reject Duplicate (`reject_duplicate`)

- **מיקום**: `Backend/services/user_data_import/import_orchestrator.py` שורה 4262
- **פעולה**:
  1. טוען `preview_data` מה-cache/database
  2. מוצא את הרשומה ב-`records_to_skip`
  3. מסמן אותה כ-`rejected: true`
  4. מעדכן את ה-cache עם `_update_preview_cache`

### 3. Execute Import (`execute_import`)

- **מיקום**: `Backend/services/user_data_import/import_orchestrator.py` שורה 2443
- **בעיה**: בשורה 2487, הפונקציה קוראת ל-`generate_preview` מחדש
- **התוצאה**: כל השינויים שבוצעו ב-`accept_duplicate` נמחקים!

## דרכי דיבוג

### 1. הוספת לוגים ב-`accept_duplicate`

```python
logger.info(f"🔍 [ACCEPT_DUPLICATE] Before: records_to_import={len(preview_data.get('records_to_import', []))}, records_to_skip={len(preview_data.get('records_to_skip', []))}")
# ... קוד accept ...
logger.info(f"🔍 [ACCEPT_DUPLICATE] After: records_to_import={len(preview_data.get('records_to_import', []))}, records_to_skip={len(preview_data.get('records_to_skip', []))}")
logger.info(f"🔍 [ACCEPT_DUPLICATE] Moved record_index={record_index} from skip to import")
```

### 2. הוספת לוגים ב-`execute_import`

```python
logger.info(f"🔍 [EXECUTE_IMPORT] Before generate_preview: Loading preview from cache...")
preview_data = self._ensure_preview_data(session_id, session=import_session)
logger.info(f"🔍 [EXECUTE_IMPORT] Preview from cache: records_to_import={len(preview_data.get('records_to_import', []))}, records_to_skip={len(preview_data.get('records_to_skip', []))})")
```

### 3. בדיקת Cache

```python
# ב-`_update_preview_cache`:
logger.info(f"🔍 [UPDATE_CACHE] Updating cache for session {session_id}")
logger.info(f"🔍 [UPDATE_CACHE] records_to_import={len(preview_data.get('records_to_import', []))}, records_to_skip={len(preview_data.get('records_to_skip', []))}")

# ב-`_ensure_preview_data`:
logger.info(f"🔍 [ENSURE_PREVIEW] Loading preview for session {session_id}")
logger.info(f"🔍 [ENSURE_PREVIEW] From cache: {bool(cached_preview)}, From DB: {bool(stored_preview)}")
```

### 4. בדיקת Frontend

```javascript
// ב-`acceptDuplicate`:
console.log('🔍 [ACCEPT] Before:', {
    recordsToImport: previewData?.records_to_import?.length,
    recordsToSkip: previewData?.records_to_skip?.length
});

// אחרי refreshPreviewData:
console.log('🔍 [ACCEPT] After refresh:', {
    recordsToImport: previewData?.records_to_import?.length,
    recordsToSkip: previewData?.records_to_skip?.length
});
```

## פתרון אפשרי

### שינוי ב-`execute_import`

במקום:

```python
preview_result = self.generate_preview(session_id, requested_task_type, selected_types=selected_types)
```

להשתמש ב:

```python
preview_data = self._ensure_preview_data(session_id, session=import_session)
if not preview_data:
    # Fallback: regenerate if no preview data exists
    preview_result = self.generate_preview(session_id, requested_task_type, selected_types=selected_types)
    preview_data = preview_result.get('preview_data')
else:
    preview_result = {'success': True, 'preview_data': preview_data}
```

## קבצים לבדיקה

- `Backend/services/user_data_import/import_orchestrator.py`:
  - `accept_duplicate` (שורה 4159)
  - `reject_duplicate` (שורה 4262)
  - `execute_import` (שורה 2443)
  - `_update_preview_cache` (שורה 4500)
  - `_ensure_preview_data` (שורה 4456)
  - `generate_preview` (שורה 2353)

- `trading-ui/scripts/import-user-data.js`:
  - `acceptDuplicate` (שורה 7200)
  - `rejectDuplicate` (שורה 7247)
  - `refreshPreviewData` (שורה 8902)
  - `displayPreviewData` (שורה 6409)

